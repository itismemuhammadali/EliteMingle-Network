import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  DEFAULT_USER_PROFILE,
  type UserProfileState,
} from '../../constants/userProfileMock';
import { useAppDispatch } from '../../redux/hooks';
import { setAllAccessibility } from '../../redux/roleSlice';

type UserProfileContextValue = {
  profile: UserProfileState;
  updateProfile: (patch: Partial<UserProfileState>) => void;
  setProfile: (next: UserProfileState) => void;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined,
);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [profile, setProfileState] = useState<UserProfileState>(
    DEFAULT_USER_PROFILE,
  );

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = auth().onAuthStateChanged(firebaseUser => {
      if (!firebaseUser) {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        setProfileState(DEFAULT_USER_PROFILE);
        return;
      }

      // Initial update from Auth user object
      setProfileState(prev => ({
        ...prev,
        displayName: firebaseUser.displayName || prev.displayName || 'User',
        email: firebaseUser.email || prev.email || '',
        avatarUri: firebaseUser.photoURL || prev.avatarUri || null,
      }));

      // Realtime listener for Firestore users collection document
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
      unsubscribeDoc = firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .onSnapshot(
          snapshot => {
            const exists = snapshot && (typeof (snapshot as any).exists === 'function' ? (snapshot as any).exists() : (snapshot as any).exists);
            if (exists) {
              const data = snapshot.data();
              if (data) {
                const a = data.accessibility || {};
                const ttsVal =
                  a.ttsEnabled !== undefined
                    ? !!a.ttsEnabled
                    : data.textToSpeech !== undefined
                    ? !!data.textToSpeech
                    : false;
                const voiceVal =
                  a.voiceCommandsEnabled !== undefined
                    ? !!a.voiceCommandsEnabled
                    : data.voiceCommands !== undefined
                    ? !!data.voiceCommands
                    : false;
                const fontScaleVal =
                  typeof a.fontScale === 'number' ? a.fontScale : 0;
                const simplifiedVal = !!a.simplifiedUi;
                const bciVal = !!a.bciEnabled;

                setProfileState(prev => ({
                  ...prev,
                  displayName: data.fullName || firebaseUser.displayName || prev.displayName,
                  email: data.email || firebaseUser.email || prev.email,
                  bio: data.bio !== undefined ? data.bio : prev.bio,
                  phone: data.phone !== undefined ? data.phone : prev.phone,
                  location: data.location !== undefined ? data.location : prev.location,
                  avatarUri: data.avatarUri || data.profilePicture || firebaseUser.photoURL || prev.avatarUri || null,
                  coverUri: data.coverUri !== undefined ? data.coverUri : prev.coverUri,
                  voiceCommandsEnabled: voiceVal,
                  ttsEnabled: ttsVal,
                }));

                dispatch(
                  setAllAccessibility({
                    fontScale: fontScaleVal,
                    ttsEnabled: ttsVal,
                    voiceCommandsEnabled: voiceVal,
                    simplifiedUi: simplifiedVal,
                    bciEnabled: bciVal,
                  }),
                );
              }
            }
          },
          err => {
            console.warn('Firestore profile snapshot error:', err);
          },
        );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfileState>) => {
    setProfileState(prev => ({ ...prev, ...patch }));
  }, []);

  const setProfile = useCallback((next: UserProfileState) => {
    setProfileState(next);
  }, []);

  const value = useMemo(
    () => ({ profile, updateProfile, setProfile }),
    [profile, updateProfile, setProfile],
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile(): UserProfileContextValue {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return ctx;
}

