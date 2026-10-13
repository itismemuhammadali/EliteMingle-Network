import { NativeModules, NativeEventEmitter } from 'react-native';

const { NativeSpeechRecognizer } = NativeModules;
const speechEmitter = NativeSpeechRecognizer ? new NativeEventEmitter(NativeSpeechRecognizer) : null;

export type VoiceCommandAction =
  | 'NAVIGATE_HOME'
  | 'NAVIGATE_MESSAGES'
  | 'NAVIGATE_GROUPS'
  | 'NAVIGATE_PROFILE'
  | 'OPEN_NOTIFICATIONS'
  | 'OPEN_CREATE_POST'
  | 'OPEN_CREATE_GROUP'
  | 'OPEN_USER_CHAT'
  | 'OPEN_GROUP_CHAT'
  | 'OPEN_GROUP_DETAIL'
  | 'ACTION_LIKE_POST'
  | 'ACTION_SAVE_POST'
  | 'ACTION_OPEN_COMMENTS'
  | 'ACTION_SHARE_POST'
  | 'ACTION_DELETE_POST'
  | 'CLOSE_MODAL'
  | 'UNKNOWN';

export interface ParsedVoiceCommand {
  rawText: string;
  action: VoiceCommandAction;
  targetIndex?: number;
}

export type VoiceCommandListener = (command: ParsedVoiceCommand) => void;
export type SpeechStateListener = (state: 'ready' | 'started' | 'ended' | 'error', message?: string) => void;

let commandListeners: VoiceCommandListener[] = [];
let stateListeners: SpeechStateListener[] = [];
let initialized = false;

export function parseVoiceCommandDetails(text: string): ParsedVoiceCommand {
  const rawText = (text || '').trim();
  const lower = rawText.toLowerCase();
  if (!lower) return { rawText, action: 'UNKNOWN', targetIndex: 0 };

  let targetIndex = 0;
  if (
    lower.includes('second') ||
    lower.includes(' 2 ') ||
    lower.endsWith(' 2') ||
    lower.includes('post 2')
  ) {
    targetIndex = 1;
  } else if (
    lower.includes('third') ||
    lower.includes(' 3 ') ||
    lower.endsWith(' 3') ||
    lower.includes('post 3')
  ) {
    targetIndex = 2;
  }

  // 1. Post actions: like, save, comment, share, delete
  if (
    lower.includes('like') ||
    lower.includes('thumbs up') ||
    lower.includes('unlike') ||
    lower.includes('react')
  ) {
    return { rawText, action: 'ACTION_LIKE_POST', targetIndex };
  }
  if (lower.includes('save') || lower.includes('bookmark')) {
    return { rawText, action: 'ACTION_SAVE_POST', targetIndex };
  }
  if (lower.includes('comment')) {
    return { rawText, action: 'ACTION_OPEN_COMMENTS', targetIndex };
  }
  if (lower.includes('share') || lower.includes('send post')) {
    return { rawText, action: 'ACTION_SHARE_POST', targetIndex };
  }
  if (lower.includes('delete post') || lower.includes('remove post')) {
    return { rawText, action: 'ACTION_DELETE_POST', targetIndex };
  }

  // 2. Notifications
  if (lower.includes('notification') || lower.includes('alert')) {
    return { rawText, action: 'OPEN_NOTIFICATIONS' };
  }

  // 3. Create Group
  if (
    lower.includes('create group') ||
    lower.includes('new group') ||
    lower.includes('make group') ||
    lower.includes('add group')
  ) {
    return { rawText, action: 'OPEN_CREATE_GROUP' };
  }

  // 4. Create Post
  if (
    lower.includes('create post') ||
    lower.includes('new post') ||
    lower.includes('create new post') ||
    lower.includes('write post') ||
    lower.includes('add post') ||
    lower.includes('make post') ||
    lower.includes('publish post')
  ) {
    return { rawText, action: 'OPEN_CREATE_POST' };
  }

  // 5. Chats: user chat vs group chat
  if (
    lower.includes('group chat') ||
    lower.includes('chat of group') ||
    lower.includes('group conversation') ||
    lower.includes('group messages')
  ) {
    return { rawText, action: 'OPEN_GROUP_CHAT' };
  }

  if (
    lower.includes('chat of user') ||
    lower.includes('user chat') ||
    lower.includes('open chat') ||
    lower.includes('start chat') ||
    lower.includes('chat with') ||
    lower.includes('direct message') ||
    lower.includes('private chat')
  ) {
    return { rawText, action: 'OPEN_USER_CHAT' };
  }

  // 6. Group details vs Groups list
  if (
    lower.includes('group detail') ||
    lower.includes('open group') ||
    lower.includes('view group')
  ) {
    return { rawText, action: 'OPEN_GROUP_DETAIL' };
  }
  if (lower.includes('group')) {
    return { rawText, action: 'NAVIGATE_GROUPS' };
  }

  // 7. Tab navigation
  if (lower.includes('home') || lower.includes('feed')) {
    return { rawText, action: 'NAVIGATE_HOME' };
  }
  if (
    lower.includes('message') ||
    lower.includes('inbox') ||
    lower.includes('chat')
  ) {
    return { rawText, action: 'NAVIGATE_MESSAGES' };
  }
  if (lower.includes('profile') || lower.includes('account')) {
    return { rawText, action: 'NAVIGATE_PROFILE' };
  }

  // 8. Close / Back
  if (
    lower.includes('close') ||
    lower.includes('dismiss') ||
    lower.includes('cancel') ||
    lower.includes('go back') ||
    lower === 'back'
  ) {
    return { rawText, action: 'CLOSE_MODAL' };
  }

  return { rawText, action: 'UNKNOWN', targetIndex: 0 };
}

export function parseVoiceCommand(text: string): VoiceCommandAction {
  return parseVoiceCommandDetails(text).action;
}

export function dispatchVoiceCommand(text: string) {
  const parsed = parseVoiceCommandDetails(text);
  commandListeners.forEach(l => l(parsed));
}

function initSpeechListeners() {
  if (initialized || !speechEmitter) return;
  initialized = true;

  speechEmitter.addListener('onSpeechReady', () => {
    stateListeners.forEach(l => l('ready'));
  });
  speechEmitter.addListener('onSpeechStarted', () => {
    stateListeners.forEach(l => l('started'));
  });
  speechEmitter.addListener('onSpeechEnded', () => {
    stateListeners.forEach(l => l('ended'));
  });
  speechEmitter.addListener('onSpeechError', data => {
    stateListeners.forEach(l => l('error', data?.message));
  });
  speechEmitter.addListener('onSpeechResults', data => {
    const raw = data?.text || '';
    const parsed = parseVoiceCommandDetails(raw);
    commandListeners.forEach(l => l(parsed));
  });
}

export function subscribeToVoiceCommands(listener: VoiceCommandListener): () => void {
  initSpeechListeners();
  commandListeners.push(listener);
  return () => {
    commandListeners = commandListeners.filter(l => l !== listener);
  };
}

export function subscribeToSpeechState(listener: SpeechStateListener): () => void {
  initSpeechListeners();
  stateListeners.push(listener);
  return () => {
    stateListeners = stateListeners.filter(l => l !== listener);
  };
}

export async function startVoiceCommandListening(): Promise<boolean> {
  if (NativeSpeechRecognizer && typeof NativeSpeechRecognizer.startListening === 'function') {
    try {
      initSpeechListeners();
      await NativeSpeechRecognizer.startListening();
      return true;
    } catch (err) {
      console.warn('Voice command start error:', err);
    }
  }
  return false;
}

export async function stopVoiceCommandListening(): Promise<boolean> {
  if (NativeSpeechRecognizer && typeof NativeSpeechRecognizer.stopListening === 'function') {
    try {
      await NativeSpeechRecognizer.stopListening();
      return true;
    } catch (err) {
      console.warn('Voice command stop error:', err);
    }
  }
  return false;
}

export async function cancelVoiceCommandListening(): Promise<boolean> {
  if (NativeSpeechRecognizer && typeof NativeSpeechRecognizer.cancelListening === 'function') {
    try {
      await NativeSpeechRecognizer.cancelListening();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
