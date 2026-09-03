import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// The default Firebase app is auto-initialized natively from
// android/app/google-services.json (real project: exceptionalpeoplemingle).
// No manual initializeApp() is needed.

// ── Emulator toggle ──────────────────────────────────────────────
// We are LIVE on real Firebase. Flip this to true (and run `npm run reverse`
// with the emulators running) only if you need to develop against the local
// emulator suite again.
const USE_EMULATOR = false;

if (USE_EMULATOR && __DEV__) {
  const EMULATOR_HOST = '127.0.0.1';
  auth().useEmulator(`http://${EMULATOR_HOST}:9099`);
  firestore().useEmulator(EMULATOR_HOST, 8080);
  storage().useEmulator(EMULATOR_HOST, 9199);
}

export { auth, firestore, storage };
