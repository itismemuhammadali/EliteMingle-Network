import { getApps, initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';

// Initialize default Firebase App for emulator/dev mode if not already initialized
if (getApps().length === 0) {
  initializeApp({
    apiKey: 'dev-api-key-najiyashade',
    appId: '1:1234567890:android:abcdef',
    messagingSenderId: '1234567890',
    projectId: 'najiyashade-dev',
    storageBucket: 'najiyashade-dev.appspot.com',
  });
}

// Use 127.0.0.1 with adb reverse for both physical Android devices and emulators
const EMULATOR_HOST = '127.0.0.1';
const AUTH_PORT = 9099;
const FIRESTORE_PORT = 8080;
const STORAGE_PORT = 9199;

if (__DEV__) {
  auth().useEmulator(`http://${EMULATOR_HOST}:${AUTH_PORT}`);
  firestore().useEmulator(EMULATOR_HOST, FIRESTORE_PORT);
  storage().useEmulator(EMULATOR_HOST, STORAGE_PORT);
}

export { auth, firestore, storage };


