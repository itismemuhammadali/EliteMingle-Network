import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// =============================================================
// Auth Context — Firebase Auth Integration
// =============================================================
// Provides: signIn, signUp, signOut, sendPasswordReset, user, loading
// Listens to onAuthStateChanged for real-time auth state.
// =============================================================

import { store } from '../redux/store';
import { selectAdmin, selectUser } from '../redux/roleSlice';
import {
  signInWithGoogle as socialSignInWithGoogle,
  signInWithApple as socialSignInWithApple,
} from '../services/socialAuthService';

interface AuthContextType {
  /** The currently authenticated Firebase user (null if signed out) */
  user: FirebaseAuthTypes.User | null;
  /** True while the initial auth state is still loading */
  loading: boolean;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
  /** Sign up with email, password, and display name */
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<FirebaseAuthTypes.UserCredential>;
  /** Sign in / Sign up with Google */
  signInWithGoogle: () => Promise<FirebaseAuthTypes.UserCredential | null>;
  /** Sign in / Sign up with Apple */
  signInWithApple: () => Promise<FirebaseAuthTypes.UserCredential | null>;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Send a password-reset email */
  sendPasswordReset: (email: string) => Promise<void>;
  /** Reload user from Firebase Auth to refresh emailVerified state */
  reloadUser: () => Promise<FirebaseAuthTypes.User | null>;
  /** Send or resend verification email */
  sendVerificationEmail: () => Promise<void>;
  /** Whether user email is verified or verified through Apple/Google */
  isEmailVerified: boolean;
  /** Whether the user has completed their profile */
  isProfileCompleted: boolean;
  /** Update profile completed flag */
  setIsProfileCompleted: (value: boolean) => void;
  /** Convenience: is the user authenticated? */
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean>(true);
  const [, setAuthVersion] = useState(0);

  // ── Listen to Firebase auth state ────────────────────────────
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get();
          const role = (userDoc.data()?.role || 'User').toLowerCase();
          if (role === 'admin') {
            store.dispatch(selectAdmin());
          } else {
            store.dispatch(selectUser());
          }

          const profileDone = userDoc.data()?.profileCompleted;
          setIsProfileCompleted(profileDone !== false);

          // Ensure user document exists in Firestore users collection
          const existingData = userDoc.data();
          const existingName =
            existingData?.fullName ||
            existingData?.displayName ||
            existingData?.name;
          const fallbackName = firebaseUser.displayName ||
            (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
          const resolvedName =
            (existingName && existingName !== 'Anonymous User')
              ? existingName
              : fallbackName;

          await firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .set(
              {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                fullName: resolvedName,
                updatedAt: firestore.FieldValue.serverTimestamp(),
              },
              { merge: true },
            );
        } else {
          store.dispatch(selectUser());
          setIsProfileCompleted(true);
        }
      } catch (err) {
        console.warn('Firestore sync onAuthStateChanged warning:', err);
      } finally {
        setUser(firebaseUser);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // ── Sign in ──────────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string) => {
      const credential = await auth().signInWithEmailAndPassword(email, password);
      if (credential.user) {
        try {
          await firestore().collection('users').doc(credential.user.uid).set({
            uid: credential.user.uid,
            email: credential.user.email,
            fullName: credential.user.displayName || '',
            updatedAt: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore write warning on signIn:', err);
        }
      }
      return credential;
    },
    [],
  );

  // ── Sign up ──────────────────────────────────────────────────
  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const credential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      // Update the user profile with the display name
      await credential.user.updateProfile({ displayName });

      // Save user record to Firestore users collection
      try {
        await firestore().collection('users').doc(credential.user.uid).set({
          uid: credential.user.uid,
          fullName: displayName,
          email: email,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
          profileCompleted: false,
        }, { merge: true });
        console.log('Firestore user doc created for UID:', credential.user.uid);
      } catch (err) {
        console.error('Firestore write error on signUp:', err);
      }

      setIsProfileCompleted(false);

      // Send email verification
      try {
        await credential.user.sendEmailVerification();
        console.log('Verification email sent to:', email);
      } catch (e) {
        console.warn('sendEmailVerification warning on signUp:', e);
      }

      return credential;
    },
    [],
  );

  // ── Reload user ──────────────────────────────────────────────
  const reloadUser = useCallback(async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await currentUser.reload();
      const updated = auth().currentUser;
      setUser(updated);
      setAuthVersion((v) => v + 1);
      return updated;
    }
    return null;
  }, []);

  // ── Send verification email ──────────────────────────────────
  const sendVerificationEmail = useCallback(async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await currentUser.sendEmailVerification();
    }
  }, []);

  // ── Social Sign In ──────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    const credential = await socialSignInWithGoogle();
    if (credential?.user) {
      setUser(credential.user);
      store.dispatch(selectUser());
    }
    return credential;
  }, []);

  const signInWithApple = useCallback(async () => {
    const credential = await socialSignInWithApple();
    if (credential?.user) {
      setUser(credential.user);
      store.dispatch(selectUser());
    }
    return credential;
  }, []);

  // ── Sign out ─────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    setUser(null);
    setIsProfileCompleted(true);
    store.dispatch(selectUser());
    try {
      await auth().signOut();
    } catch (e) {
      console.warn('Firebase signOut warning:', e);
    }
  }, []);

  // ── Password reset ───────────────────────────────────────────
  const sendPasswordReset = useCallback(
    (email: string) => auth().sendPasswordResetEmail(email),
    [],
  );

  const isSocialUser = Boolean(
    user?.providerData?.some(
      (p) => p.providerId === 'google.com' || p.providerId === 'apple.com',
    ),
  );
  const isEmailVerified = Boolean(
    auth().currentUser?.emailVerified || user?.emailVerified || isSocialUser,
  );
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithApple,
        signOut,
        sendPasswordReset,
        reloadUser,
        sendVerificationEmail,
        isEmailVerified,
        isProfileCompleted,
        setIsProfileCompleted,
        isAuthenticated,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
