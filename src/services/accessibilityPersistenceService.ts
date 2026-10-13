import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import type { RoleState } from '../redux/roleSlice';

export interface UserAccessibilitySettings {
  fontScale: number;
  ttsEnabled: boolean;
  voiceCommandsEnabled: boolean;
  simplifiedUi: boolean;
  bciEnabled: boolean;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: UserAccessibilitySettings = {
  fontScale: 0,
  ttsEnabled: false,
  voiceCommandsEnabled: false,
  simplifiedUi: false,
  bciEnabled: false,
};

export async function saveAccessibilitySettings(
  settings: Partial<UserAccessibilitySettings>,
): Promise<void> {
  const uid = auth().currentUser?.uid;
  if (!uid) return;

  const updateData: Record<string, any> = {};
  const setData: Record<string, any> = {};
  const accessibilityData: Record<string, any> = {};

  if (settings.fontScale !== undefined) {
    updateData['accessibility.fontScale'] = settings.fontScale;
    accessibilityData.fontScale = settings.fontScale;
  }
  if (settings.ttsEnabled !== undefined) {
    updateData['accessibility.ttsEnabled'] = settings.ttsEnabled;
    updateData.textToSpeech = settings.ttsEnabled;
    accessibilityData.ttsEnabled = settings.ttsEnabled;
    setData.textToSpeech = settings.ttsEnabled;
  }
  if (settings.voiceCommandsEnabled !== undefined) {
    updateData['accessibility.voiceCommandsEnabled'] = settings.voiceCommandsEnabled;
    updateData.voiceCommands = settings.voiceCommandsEnabled;
    accessibilityData.voiceCommandsEnabled = settings.voiceCommandsEnabled;
    setData.voiceCommands = settings.voiceCommandsEnabled;
  }
  if (settings.simplifiedUi !== undefined) {
    updateData['accessibility.simplifiedUi'] = settings.simplifiedUi;
    accessibilityData.simplifiedUi = settings.simplifiedUi;
  }
  if (settings.bciEnabled !== undefined) {
    updateData['accessibility.bciEnabled'] = settings.bciEnabled;
    accessibilityData.bciEnabled = settings.bciEnabled;
  }

  if (Object.keys(accessibilityData).length > 0) {
    setData.accessibility = accessibilityData;
  }

  try {
    await firestore().collection('users').doc(uid).set(setData, { merge: true });
  } catch (setErr) {
    console.warn('Failed to save accessibility settings with set merge:', setErr);
    try {
      await firestore().collection('users').doc(uid).update(updateData);
    } catch (fallbackErr) {
      console.warn('Failed to save accessibility settings with update fallback:', fallbackErr);
    }
  }
}

export async function loadAccessibilitySettings(): Promise<UserAccessibilitySettings> {
  const uid = auth().currentUser?.uid;
  if (!uid) return DEFAULT_ACCESSIBILITY_SETTINGS;

  try {
    const snap = await firestore().collection('users').doc(uid).get();
    const exists = typeof (snap as any).exists === 'function' ? (snap as any).exists() : (snap as any).exists;
    if (exists) {
      const data = snap.data();
      const a = data?.accessibility || {};
      const ttsVal =
        a.ttsEnabled !== undefined
          ? !!a.ttsEnabled
          : data?.textToSpeech !== undefined
          ? !!data.textToSpeech
          : false;
      const voiceVal =
        a.voiceCommandsEnabled !== undefined
          ? !!a.voiceCommandsEnabled
          : data?.voiceCommands !== undefined
          ? !!data.voiceCommands
          : false;

      return {
        fontScale: typeof a.fontScale === 'number' ? a.fontScale : 0,
        ttsEnabled: ttsVal,
        voiceCommandsEnabled: voiceVal,
        simplifiedUi: !!a.simplifiedUi,
        bciEnabled: !!a.bciEnabled,
      };
    }
  } catch (err) {
    console.warn('Failed to load accessibility settings:', err);
  }
  return DEFAULT_ACCESSIBILITY_SETTINGS;
}
