import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NativeTextToSpeech } = NativeModules;
const ttsEmitter = NativeTextToSpeech ? new NativeEventEmitter(NativeTextToSpeech) : null;

export type TtsEventListener = (event: 'start' | 'done' | 'error', utteranceId?: string) => void;

let activeListeners: TtsEventListener[] = [];
let isInitialized = false;

function initListeners() {
  if (isInitialized || !ttsEmitter) return;
  isInitialized = true;

  ttsEmitter.addListener('onTtsStart', data => {
    activeListeners.forEach(l => l('start', data?.utteranceId));
  });
  ttsEmitter.addListener('onTtsDone', data => {
    activeListeners.forEach(l => l('done', data?.utteranceId));
  });
  ttsEmitter.addListener('onTtsError', data => {
    activeListeners.forEach(l => l('error', data?.utteranceId));
  });
}

export function subscribeToTtsEvents(listener: TtsEventListener): () => void {
  initListeners();
  activeListeners.push(listener);
  return () => {
    activeListeners = activeListeners.filter(l => l !== listener);
  };
}

export async function speakText(text: string, utteranceId: string = 'msg_1'): Promise<boolean> {
  const clean = (text || '').trim();
  if (!clean) return false;

  if (NativeTextToSpeech && typeof NativeTextToSpeech.speak === 'function') {
    try {
      initListeners();
      await NativeTextToSpeech.speak(clean, utteranceId);
      return true;
    } catch (err) {
      console.warn('Native TTS speak error:', err);
    }
  }

  return false;
}

export async function stopSpeaking(): Promise<boolean> {
  if (NativeTextToSpeech && typeof NativeTextToSpeech.stop === 'function') {
    try {
      await NativeTextToSpeech.stop();
      return true;
    } catch (err) {
      console.warn('Native TTS stop error:', err);
    }
  }
  return false;
}

export async function isSpeaking(): Promise<boolean> {
  if (NativeTextToSpeech && typeof NativeTextToSpeech.isSpeaking === 'function') {
    try {
      return await NativeTextToSpeech.isSpeaking();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Optional Google Cloud Text to Speech REST synthesis.
 * Can be called with a Google Cloud API Key for high-fidelity WaveNet / Neural2 voices.
 */
export async function synthesizeWithGoogleCloud(
  text: string,
  apiKey: string,
): Promise<string | null> {
  if (!apiKey || !text) return null;
  try {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    });
    const data = await response.json();
    return data.audioContent || null;
  } catch (err) {
    console.warn('Google Cloud TTS REST error:', err);
    return null;
  }
}
