import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { AudioRecorder } = NativeModules;

export async function requestRecordAudioPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message:
          'EPM4LIFE requires microphone access to record voice memos for your posts.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Microphone permission request error:', err);
    return false;
  }
}

export async function startAudioRecording(): Promise<string> {
  const hasPermission = await requestRecordAudioPermission();
  if (!hasPermission) {
    throw new Error('Microphone permission is required to record voice memos.');
  }
  if (!AudioRecorder || typeof AudioRecorder.startRecording !== 'function') {
    throw new Error('Audio recording is not supported on this platform.');
  }
  return AudioRecorder.startRecording();
}

export async function stopAudioRecording(): Promise<string> {
  if (!AudioRecorder || typeof AudioRecorder.stopRecording !== 'function') {
    throw new Error('Audio recording is not supported on this platform.');
  }
  return AudioRecorder.stopRecording();
}

export async function cancelAudioRecording(): Promise<boolean> {
  if (!AudioRecorder || typeof AudioRecorder.cancelRecording !== 'function') {
    return false;
  }
  return AudioRecorder.cancelRecording();
}

export function isAudioRecordingSupported(): boolean {
  return !!AudioRecorder && typeof AudioRecorder.startRecording === 'function';
}
