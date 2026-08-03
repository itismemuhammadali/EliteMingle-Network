import { firebase } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

// Host/port must match src/config/firebase.ts (the emulator the app talks to).
const EMULATOR_HOST = '127.0.0.1';
const AUTH_PORT = 9099;

export interface CreateUserAccountParams {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  avatarUri?: string;
  avatarColor?: string;
}

/** Error carrying an auth/* style code the UI already knows how to render. */
class AccountError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const mapRestError = (message: string): AccountError => {
  const m = (message || '').toUpperCase();
  if (m.startsWith('EMAIL_EXISTS')) {
    return new AccountError('auth/email-already-in-use', message);
  }
  if (m.startsWith('INVALID_EMAIL')) {
    return new AccountError('auth/invalid-email', message);
  }
  if (m.startsWith('WEAK_PASSWORD')) {
    return new AccountError('auth/weak-password', message);
  }
  if (m.includes('MISSING_PASSWORD') || m.includes('MISSING_EMAIL')) {
    return new AccountError('auth/invalid-email', message);
  }
  return new AccountError('auth/unknown', message || 'Unknown error');
};

/**
 * Creates a real Firebase Auth account + Firestore profile for a new user and
 * returns the new uid. The auth account is created via the Auth EMULATOR's REST
 * API, so it never replaces the admin's own signed-in session (the client SDK
 * would otherwise sign you in as the new user). Dev/emulator only — production
 * account creation needs the Admin SDK / a Cloud Function.
 */
export const createUserAccount = async (
  params: CreateUserAccountParams,
): Promise<string> => {
  if (!__DEV__) {
    throw new AccountError(
      'auth/unsupported',
      'Creating accounts in production requires a Cloud Function.',
    );
  }

  const { name, email, phone, role, password, avatarUri, avatarColor } = params;
  const apiKey = (firebase.app().options as { apiKey?: string }).apiKey || 'dev';
  const base = `http://${EMULATOR_HOST}:${AUTH_PORT}/identitytoolkit.googleapis.com/v1`;

  // 1. Create the auth account (pure HTTP → admin session untouched).
  const res = await fetch(`${base}/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw mapRestError(data?.error?.message || `HTTP ${res.status}`);
  }
  const uid: string = data.localId;
  const idToken: string = data.idToken;

  // 2. Set the auth displayName (best effort; profile is driven by Firestore).
  try {
    await fetch(`${base}/accounts:update?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        displayName: name,
        returnSecureToken: false,
      }),
    });
  } catch {
    // non-critical
  }

  // 3. Write the profile doc (users rules allow write).
  await firestore()
    .collection('users')
    .doc(uid)
    .set(
      {
        uid,
        fullName: name,
        displayName: name,
        email,
        phone,
        role: role || 'User',
        status: 'active',
        avatarColor: avatarColor || '#800080',
        avatarUri: avatarUri || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        profileCompleted: false,
        createdByAdmin: true,
      },
      { merge: true },
    );

  return uid;
};
