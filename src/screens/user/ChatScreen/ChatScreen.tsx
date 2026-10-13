import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../../navigation/User/types';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  ChatHeader,
  MessageBubble,
  ChatInput,
  ChatEmojiPicker,
} from '../../../components/user';
import { Colors } from '../../../constants/colors';
import {
  getOrCreateDirectConversation,
  sendMessage as sendChatMessage,
  uploadChatImage,
  uploadChatAudio,
  subscribeToMessages,
  markConversationAsRead,
} from '../../../services/chatService';
import {
  startAudioRecording,
  stopAudioRecording,
  cancelAudioRecording,
} from '../../../services/audioRecorderService';
import {
  setCachedAudioUri,
  setAudioMetadata,
} from '../../../services/audioCacheService';
import UtilityMethods from '../../../utility/UtilityMethods';

export type ChatMessage = {
  id: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
};

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    text: 'Hey! How are you doing?',
    time: '10:30 AM',
    isOutgoing: false,
  },
  {
    id: 'm2',
    text: "I'm doing great, thanks for asking! How about you?",
    time: '10:31 AM',
    isOutgoing: true,
  },
  {
    id: 'm3',
    text: 'Pretty good! Just working on some projects.',
    time: '10:31 AM',
    isOutgoing: false,
  },
  {
    id: 'm4',
    text: 'That sounds great! Let me know if you need any help.',
    time: '10:32 AM',
    isOutgoing: true,
  },
];

export function ChatScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const route = useRoute<RouteProp<UserStackParamList, 'Chat'>>();
  const insets = useSafeAreaInsets();

  const {
    peerId = '',
    peerName = 'User',
    peerAvatarUri,
    conversationId: initialConvId,
    statusText = 'Online',
    isOnlineStatus = true,
  } = route.params || {};

  const [currentPeerName, setCurrentPeerName] = useState<string>(
    peerName && peerName !== 'Anonymous User' ? peerName : 'User',
  );
  const [currentPeerAvatar, setCurrentPeerAvatar] = useState<string | undefined>(peerAvatarUri);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(initialConvId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dynamically resolve the peer's true name and avatar from Firestore
  useEffect(() => {
    if (!peerId) return;
    const unsub = firestore()
      .collection('users')
      .doc(peerId)
      .onSnapshot(docSnap => {
        const isExisting =
          docSnap &&
          (typeof (docSnap as any).exists === 'function'
            ? (docSnap as any).exists()
            : (docSnap as any).exists);
        if (isExisting) {
          const data = docSnap.data();
          const fullName = data?.fullName || data?.displayName || data?.name;
          if (fullName && fullName !== 'Anonymous User') {
            setCurrentPeerName(fullName);
          } else if (data?.email && (!fullName || fullName === 'Anonymous User')) {
            const emailName = data.email.split('@')[0];
            setCurrentPeerName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }
          const avatar = data?.profilePicture || data?.avatarUri || data?.avatarUrl;
          if (avatar) {
            setCurrentPeerAvatar(avatar);
          }
        }
      });
    return () => unsub();
  }, [peerId]);

  // Listen to keyboard events to drop safe-area padding while keyboard is up on both platforms.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => {
      setShowEmojiPicker(false);
      setKeyboardOpen(true);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardOpen(false);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const currentUserId = auth().currentUser?.uid || '';

  // Initialize conversation and subscribe to real-time messages
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    async function initChat() {
      let convId = initialConvId;

      if (!convId && currentUserId && peerId) {
        try {
          convId = await getOrCreateDirectConversation(currentUserId, peerId, {
            name: currentPeerName,
            avatarUri: currentPeerAvatar,
          });
          if (isMounted) {
            setActiveConvId(convId);
          }
        } catch (err) {
          console.error('Error getting/creating conversation:', err);
        }
      }

      if (convId && isMounted && currentUserId) {
        // Mark unread messages as read
        markConversationAsRead(convId, currentUserId);

        // Subscribe to real-time messages
        unsubscribe = subscribeToMessages(convId, currentUserId, realTimeMsgs => {
          setMessages(realTimeMsgs);
        });
      }
    }

    initChat();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initialConvId, currentUserId, peerId, currentPeerName, currentPeerAvatar]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSend = useCallback(async () => {
    const t = draft.trim();
    if (!t) {
      return;
    }
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to send messages.');
      return;
    }

    setDraft('');

    let convId = activeConvId;
    if (!convId && currentUserId && peerId) {
      try {
        convId = await getOrCreateDirectConversation(currentUserId, peerId, {
          name: currentPeerName,
          avatarUri: currentPeerAvatar,
        });
        setActiveConvId(convId);
      } catch (err) {
        console.error('Error creating conversation before sending message:', err);
      }
    }

    if (convId) {
      try {
        await sendChatMessage({
          conversationId: convId,
          senderId: currentUserId,
          text: t,
        });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    } else {
      // Fallback local state if offline or auth not ready
      const msg: ChatMessage = {
        id: `local-${Date.now()}`,
        text: t,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        isOutgoing: true,
      };
      setMessages(prev => [...prev, msg]);
    }
  }, [draft, activeConvId, currentUserId, peerId, currentPeerName, currentPeerAvatar]);

  const handleAttach = useCallback(() => {
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to send photos.');
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      },
      async response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        let convId = activeConvId;
        if (!convId && currentUserId && peerId) {
          try {
            convId = await getOrCreateDirectConversation(currentUserId, peerId, {
              name: currentPeerName,
              avatarUri: currentPeerAvatar,
            });
            setActiveConvId(convId);
          } catch (err) {
            console.error('Error creating conversation for image:', err);
          }
        }

        if (convId) {
          try {
            const remoteUrl = await uploadChatImage(convId, asset.uri);
            await sendChatMessage({
              conversationId: convId,
              senderId: currentUserId,
              text: 'Sent a photo',
              mediaUrl: remoteUrl,
            });
          } catch (err) {
            console.error('Error sending photo message:', err);
          }
        }
      },
    );
  }, [activeConvId, currentUserId, peerId, currentPeerName, currentPeerAvatar]);

  const handleToggleEmoji = useCallback(() => {
    Keyboard.dismiss();
    setShowEmojiPicker(prev => !prev);
  }, []);

  const handleSelectEmoji = useCallback((emoji: string) => {
    setDraft(prev => prev + emoji);
  }, []);

  const handleBackspaceEmoji = useCallback(() => {
    setDraft(prev => {
      if (!prev) return '';
      const chars = Array.from(prev);
      chars.pop();
      return chars.join('');
    });
  }, []);

  const handleMicPress = useCallback(async () => {
    if (isRecording) return;
    try {
      setShowEmojiPicker(false);
      Keyboard.dismiss();
      await startAudioRecording();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Audio record error:', err);
      Alert.alert('Microphone Access', err?.message || 'Could not start audio recording.');
    }
  }, [isRecording]);

  const handleStopAndSendAudio = useCallback(async () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    try {
      const localAudioPath = await stopAudioRecording();
      setIsRecording(false);
      setRecordSeconds(0);

      if (!localAudioPath) return;

      let convId = activeConvId;
      if (!convId && currentUserId && peerId) {
        convId = await getOrCreateDirectConversation(currentUserId, peerId, {
          name: currentPeerName,
          avatarUri: currentPeerAvatar,
        });
        setActiveConvId(convId);
      }

      if (convId) {
        const remoteUrl = await uploadChatAudio(convId, localAudioPath);
        setCachedAudioUri(remoteUrl, localAudioPath);
        if (recordSeconds > 0) {
          setAudioMetadata(remoteUrl, recordSeconds);
          setAudioMetadata(localAudioPath, recordSeconds);
        }
        await sendChatMessage({
          conversationId: convId,
          senderId: currentUserId,
          text: 'Sent a voice memo',
          mediaUrl: remoteUrl,
          mediaType: 'audio',
        });
      }
    } catch (err: any) {
      console.error('Failed to send voice memo:', err);
      Alert.alert('Recording Error', err?.message || 'Could not send audio.');
      setIsRecording(false);
      setRecordSeconds(0);
    }
  }, [activeConvId, currentUserId, peerId, currentPeerName, currentPeerAvatar]);

  const handleCancelAudio = useCallback(async () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    await cancelAudioRecording().catch(() => {});
    setIsRecording(false);
    setRecordSeconds(0);
  }, []);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      cancelAudioRecording().catch(() => {});
    };
  }, []);

  const listData = useMemo(() => [...messages].reverse(), [messages]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        text={item.text}
        time={item.time}
        isOutgoing={item.isOutgoing}
        mediaUrl={item.mediaUrl}
        mediaType={item.mediaType}
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44,
  );

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.white}
        translucent={Platform.OS === 'android'}
      />
      <View style={{ backgroundColor: Colors.white, paddingTop: topInset }}>
        <ChatHeader
          peerName={currentPeerName}
          peerAvatarUri={currentPeerAvatar || ''}
          statusText={statusText}
          isOnlineStatus={isOnlineStatus}
          onBackPress={handleBack}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? topInset : 0}
      >
        {listData.length > 0 ? (
          <FlatList
            style={styles.flex}
            data={listData}
            inverted
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No messages yet. Say hi to {currentPeerName}!
            </Text>
          </View>
        )}

        <View
          style={{
            paddingBottom: keyboardOpen ? 0 : insets.bottom,
          }}
        >
          <ChatInput
            value={draft}
            onChangeText={t => {
              setDraft(t);
              if (showEmojiPicker) setShowEmojiPicker(false);
            }}
            onSend={handleSend}
            onAttachPress={handleAttach}
            onEmojiPress={handleToggleEmoji}
            onMicPress={handleMicPress}
            isRecording={isRecording}
            recordingSeconds={recordSeconds}
            onCancelRecording={handleCancelAudio}
            onStopAndSendRecording={handleStopAndSendAudio}
          />

          {showEmojiPicker && (
            <ChatEmojiPicker
              onSelectEmoji={handleSelectEmoji}
              onBackspace={handleBackspaceEmoji}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.userFeedBackground,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(2),
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UtilityMethods.wp(5),
  },
  emptyText: {
    fontSize: UtilityMethods.wp(3.8),
    color: Colors.placeholderGrey,
    textAlign: 'center',
  },
});
