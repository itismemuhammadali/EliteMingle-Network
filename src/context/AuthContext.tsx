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
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Send a password-reset email */
  sendPasswordReset: (email: string) => Promise<void>;
  /** Convenience: is the user authenticated? */
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Listen to Firebase auth state ────────────────────────────
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Ensure user document exists in Firestore users collection
        try {
          await firestore().collection('users').doc(firebaseUser.uid).set({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || 'Anonymous User',
            updatedAt: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore sync onAuthStateChanged warning:', err);
        }
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

      // Send email verification
      try {
        await credential.user.sendEmailVerification();
      } catch (e) {
        // Ignore in emulator
      }

      return credential;
    },
    [],
  );



  // ── Sign out ─────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    setUser(null);
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

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
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
