import { Platform } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';

const WEB_CLIENT_ID =
  '909617000261-rcl9ohhhmhmhf15ptervosl9hvf7np23.apps.googleusercontent.com';
const IOS_CLIENT_ID =
  '909617000261-6pssmc2n1uc54thmi22e4ivuoq2r6ts8.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  offlineAccess: false,
});

export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential | null> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    let idToken: string | null = null;
    if (response && 'type' in response) {
      if (response.type === 'cancelled') {
        return null;
      }
      if (response.type === 'success' && response.data?.idToken) {
        idToken = response.data.idToken;
      }
    } else if ((response as any)?.idToken) {
      idToken = (response as any).idToken;
    }

    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }

    if (!idToken) {
      throw new Error('Google Sign In failed: Unable to obtain ID token.');
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);

    if (userCredential.user) {
      const uid = userCredential.user.uid;
      const email = userCredential.user.email || '';
      const fullName = userCredential.user.displayName || 'Google User';

      const userDoc = await firestore().collection('users').doc(uid).get();
      if (!userDoc.exists) {
        await firestore().collection('users').doc(uid).set({
          uid,
          email,
          fullName,
          role: 'User',
          profileCompleted: false,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await firestore().collection('users').doc(uid).set(
          {
            uid,
            email,
            fullName,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
    }

    return userCredential;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return null;
    }
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services is not available or outdated.');
    }
    throw error;
  }
};

export const signInWithApple = async (): Promise<FirebaseAuthTypes.UserCredential | null> => {
  if (Platform.OS !== 'ios' || !appleAuth.isSupported) {
    throw new Error('Apple Sign In is only supported on iOS devices.');
  }

  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const { identityToken, nonce, fullName } = appleAuthRequestResponse;

    if (!identityToken) {
      throw new Error('Apple Sign In failed: Unable to obtain identity token.');
    }

    const appleCredential = auth.AppleAuthProvider.credential(
      identityToken,
      nonce,
    );
    const userCredential = await auth().signInWithCredential(appleCredential);

    if (userCredential.user) {
      const uid = userCredential.user.uid;
      const email = userCredential.user.email || '';
      const formattedName = fullName
        ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ')
        : '';
      const finalName =
        formattedName || userCredential.user.displayName || 'Apple User';

      if (formattedName && !userCredential.user.displayName) {
        await userCredential.user.updateProfile({ displayName: formattedName });
      }

      const userDoc = await firestore().collection('users').doc(uid).get();
      if (!userDoc.exists) {
        await firestore().collection('users').doc(uid).set({
          uid,
          email,
          fullName: finalName,
          role: 'User',
          profileCompleted: false,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await firestore().collection('users').doc(uid).set(
          {
            uid,
            email,
            fullName: finalName,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
    }

    return userCredential;
  } catch (error: any) {
    if (error.code === appleAuth.Error.CANCELED) {
      return null;
    }
    throw error;
  }
};
