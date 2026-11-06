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
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
  Clipboard,
  ActivityIndicator,
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
  getOrCreateGroupConversation,
  sendMessage as sendChatMessage,
  uploadChatImage,
  uploadChatAudio,
  subscribeToMessages,
  markConversationAsRead,
} from '../../../services/chatService';
import {
  setActiveChat,
  markChatNotificationsAsRead,
} from '../../../services/notificationService';
import { leaveGroup } from '../../../services/groupService';
import {
  startAudioRecording,
  stopAudioRecording,
  cancelAudioRecording,
} from '../../../services/audioRecorderService';
import {
  setCachedAudioUri,
  setAudioMetadata,
} from '../../../services/audioCacheService';
import { blockUser, reportContent } from '../../../services/moderationService';
import {
  CloseIcon,
  BackArrowIcon,
  ChevronRightIcon,
  WarnIcon,
  BlockIcon,
  LogoutIcon,
  ApproveIcon,
} from '../../../components/admin/icons';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export type ChatMessage = {
  id: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  postShare?: {
    postId: string;
    authorName?: string;
    content?: string;
    mediaUrl?: string;
    mediaType?: string;
  };
  replyTo?: {
    id?: string;
    text?: string;
    senderName?: string;
    mediaType?: 'image' | 'audio';
  };
};

const REPORT_REASONS = [
  'Inappropriate Content',
  'Harassment or Bullying',
  'Spam or Scam',
  'Hate Speech or Violence',
  'Other Violation',
];

const checkDocExists = (snap: any): boolean =>
  typeof snap?.exists === 'function' ? snap.exists() : !!snap?.exists;

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

  const isGroupHint = Boolean(
    (route.params as any)?.isGroup ||
    isOnlineStatus === false ||
    initialConvId?.startsWith('group_') ||
    peerId?.startsWith('group_') ||
    statusText?.toLowerCase().includes('member')
  );

  const [isGroupChat, setIsGroupChat] = useState<boolean>(isGroupHint);

  const normalizedGroupId = useMemo(() => {
    if (peerId && peerId.startsWith('group_')) return peerId.replace(/^group_/, '');
    if (initialConvId && initialConvId.startsWith('group_')) return initialConvId.replace(/^group_/, '');
    if (isGroupChat) return peerId;
    return '';
  }, [peerId, initialConvId, isGroupChat]);
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

  // Replying state
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  // Full-screen image viewer state
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);

  // Redesigned group / direct options modal state
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [optionsModalStep, setOptionsModalStep] =
    useState<'menu' | 'report' | 'confirm_block' | 'confirm_exit' | 'success'>('menu');
  const [successPayload, setSuccessPayload] = useState<{
    title: string;
    message: string;
    actionType: 'report' | 'block' | 'exit';
  } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Message action sheet state (for Reply / Copy)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  const currentUserId = auth().currentUser?.uid || '';

  // Dynamically resolve peer / group metadata from Firestore
  useEffect(() => {
    if (isGroupChat) {
      const gId = normalizedGroupId;
      if (!gId) return;
      const unsub = firestore()
        .collection('groups')
        .doc(gId)
        .onSnapshot(docSnap => {
          if (docSnap && checkDocExists(docSnap)) {
            const data = docSnap.data();
            if (data?.name) setCurrentPeerName(data.name);
            const avatar = data?.avatarUri || data?.coverUri;
            if (avatar) setCurrentPeerAvatar(avatar);
          }
        });
      return () => unsub();
    } else {
      if (!peerId) return;
      const unsub = firestore()
        .collection('users')
        .doc(peerId)
        .onSnapshot(docSnap => {
          if (docSnap && checkDocExists(docSnap)) {
            const data = docSnap.data();
            const fullName = data?.fullName || data?.displayName || data?.name;
            if (fullName && fullName !== 'Anonymous User') {
              setCurrentPeerName(fullName);
            } else if (data?.email && (!fullName || fullName === 'Anonymous User')) {
              const emailName = data.email.split('@')[0];
              setCurrentPeerName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
            }
            const avatar = data?.profilePicture || data?.avatarUri || data?.avatarUrl;
            if (avatar) setCurrentPeerAvatar(avatar);
          }
        });
      return () => unsub();
    }
  }, [peerId, normalizedGroupId, isGroupChat]);

  // Check conversation document type
  useEffect(() => {
    if (!activeConvId) return;
    const unsub = firestore()
      .collection('conversations')
      .doc(activeConvId)
      .onSnapshot(docSnap => {
        if (docSnap && checkDocExists(docSnap)) {
          const data = docSnap.data();
          if (data?.type === 'group') {
            setIsGroupChat(true);
          }
        }
      });
    return () => unsub();
  }, [activeConvId]);

  // Listen to keyboard events
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

  // Initialize conversation and subscribe to real-time messages
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    async function initChat() {
      let convId = initialConvId;

      if (!convId && currentUserId) {
        if (isGroupChat && normalizedGroupId) {
          convId = `group_${normalizedGroupId}`;
          if (isMounted) {
            setActiveConvId(convId);
          }
          getOrCreateGroupConversation(
            normalizedGroupId,
            currentPeerName,
            [currentUserId],
            currentPeerAvatar,
          ).catch((err: any) => console.warn('getOrCreateGroupConversation error:', err));
        } else if (peerId && !isGroupChat) {
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
      }

      if (convId && isMounted && currentUserId) {
        markConversationAsRead(convId, currentUserId);
        markChatNotificationsAsRead(currentUserId, {
          conversationId: convId,
          peerId: isGroupChat ? undefined : peerId,
          groupId: isGroupChat ? (normalizedGroupId || peerId) : undefined,
        });
        unsubscribe = subscribeToMessages(convId, currentUserId, realTimeMsgs => {
          setMessages(realTimeMsgs);
          markChatNotificationsAsRead(currentUserId, {
            conversationId: convId,
            peerId: isGroupChat ? undefined : peerId,
            groupId: isGroupChat ? (normalizedGroupId || peerId) : undefined,
          });
        });
      }
    }

    initChat();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      if (currentUserId) {
        setActiveChat(currentUserId, null);
      }
    };
  }, [initialConvId, currentUserId, peerId, normalizedGroupId, currentPeerName, currentPeerAvatar, isGroupChat]);

  // Set active chat and automatically mark unread notifications for this chat as read
  useEffect(() => {
    if (!currentUserId) return;
    const targetConvId = activeConvId || initialConvId || (isGroupChat && normalizedGroupId ? `group_${normalizedGroupId}` : undefined);
    const targetPeerId = isGroupChat ? undefined : peerId;
    const targetGroupId = isGroupChat ? (normalizedGroupId || peerId) : undefined;

    // Set user active chat presence
    setActiveChat(currentUserId, {
      conversationId: targetConvId,
      peerId: targetPeerId,
      groupId: targetGroupId,
    });

    // Mark existing notifications for this chat as read immediately
    markChatNotificationsAsRead(currentUserId, {
      conversationId: targetConvId,
      peerId: targetPeerId,
      groupId: targetGroupId,
    });

    // Real-time listener: if an unread notification arrives for this chat, mark it read immediately
    const unsub = firestore()
      .collection('notifications')
      .where('recipientId', '==', currentUserId)
      .where('isRead', '==', false)
      .onSnapshot(snap => {
        if (!snap || snap.empty) return;
        const batch = firestore().batch();
        let matches = 0;
        snap.docs.forEach(doc => {
          const d = doc.data();
          if (d.type !== 'message') return;

          const matchConv = targetConvId && d.conversationId === targetConvId;
          const matchGroup = targetGroupId && d.groupId === targetGroupId;
          const matchPeer =
            targetPeerId &&
            (d.actorId === targetPeerId || (d.conversationId && d.conversationId.includes(targetPeerId)));

          if (matchConv || matchGroup || matchPeer) {
            batch.update(doc.ref, { isRead: true });
            matches++;
          }
        });
        if (matches > 0) {
          batch.commit().catch(err => console.warn('Auto mark read commit failed:', err));
        }
      });

    return () => {
      unsub();
      setActiveChat(currentUserId, null);
    };
  }, [currentUserId, activeConvId, initialConvId, peerId, isGroupChat]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const buildReplyPayload = useCallback(() => {
    if (!replyingTo) return undefined;
    return {
      id: replyingTo.id,
      text: replyingTo.text,
      senderName: replyingTo.isOutgoing
        ? 'You'
        : (replyingTo.senderName || currentPeerName),
      mediaType: replyingTo.mediaType,
    };
  }, [replyingTo, currentPeerName]);

  const handleSend = useCallback(async () => {
    const t = draft.trim();
    if (!t) return;
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to send messages.');
      return;
    }

    const replyData = buildReplyPayload();
    setDraft('');
    setReplyingTo(null);

    let convId = activeConvId;
    if (!convId && currentUserId) {
      if (isGroupChat && normalizedGroupId) {
        convId = `group_${normalizedGroupId}`;
        setActiveConvId(convId);
      } else if (peerId && !isGroupChat) {
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
    }

    if (convId) {
      try {
        await sendChatMessage({
          conversationId: convId,
          senderId: currentUserId,
          text: t,
          replyTo: replyData,
        });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    } else {
      const msg: ChatMessage = {
        id: `local-${Date.now()}`,
        text: t,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        isOutgoing: true,
        replyTo: replyData,
      };
      setMessages(prev => [...prev, msg]);
    }
  }, [draft, activeConvId, currentUserId, peerId, currentPeerName, currentPeerAvatar, buildReplyPayload]);

  const handleAttach = useCallback(() => {
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to send photos.');
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5,
        quality: 0.8,
      },
      async response => {
        if (response.didCancel || response.errorCode) return;
        const assets = response.assets || [];
        if (assets.length === 0) return;

        let convId = activeConvId;
        if (!convId && currentUserId) {
          if (isGroupChat && normalizedGroupId) {
            convId = `group_${normalizedGroupId}`;
            setActiveConvId(convId);
          } else if (peerId && !isGroupChat) {
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
        }

        if (convId) {
          const replyData = buildReplyPayload();
          setReplyingTo(null);

          for (const asset of assets) {
            if (!asset.uri) continue;
            try {
              const remoteUrl = await uploadChatImage(convId, asset.uri);
              await sendChatMessage({
                conversationId: convId,
                senderId: currentUserId,
                text: 'Sent a photo',
                mediaUrl: remoteUrl,
                mediaType: 'image',
                replyTo: replyData,
              });
            } catch (err) {
              console.error('Error sending photo message:', err);
            }
          }
        }
      },
    );
  }, [activeConvId, currentUserId, peerId, currentPeerName, currentPeerAvatar, buildReplyPayload]);

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
      if (!convId && currentUserId) {
        if (isGroupChat && normalizedGroupId) {
          convId = `group_${normalizedGroupId}`;
          setActiveConvId(convId);
        } else if (peerId && !isGroupChat) {
          convId = await getOrCreateDirectConversation(currentUserId, peerId, {
            name: currentPeerName,
            avatarUri: currentPeerAvatar,
          });
          setActiveConvId(convId);
        }
      }

      if (convId) {
        const replyData = buildReplyPayload();
        setReplyingTo(null);

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
          replyTo: replyData,
        });
      }
    } catch (err: any) {
      console.error('Failed to send voice memo:', err);
      Alert.alert('Recording Error', err?.message || 'Could not send audio.');
      setIsRecording(false);
      setRecordSeconds(0);
    }
  }, [activeConvId, currentUserId, peerId, currentPeerName, currentPeerAvatar, buildReplyPayload, recordSeconds]);

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

  const handleLongPressMessage = useCallback((item: ChatMessage) => {
    setSelectedMessage(item);
  }, []);

  const handlePressPost = useCallback(
    (postId: string, authorName?: string) => {
      navigation.navigate('PostComments', {
        postId,
        authorName: authorName || 'Post',
      });
    },
    [navigation],
  );

  const listData = useMemo(() => [...messages].reverse(), [messages]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        text={item.text}
        time={item.time}
        isOutgoing={item.isOutgoing}
        mediaUrl={item.mediaUrl}
        mediaType={item.mediaType}
        senderName={item.senderName}
        showSenderName={isGroupChat}
        postShare={item.postShare}
        replyTo={item.replyTo}
        onPressImage={url => setFullScreenImageUrl(url)}
        onPressPost={handlePressPost}
        onLongPress={() => handleLongPressMessage(item)}
      />
    ),
    [isGroupChat, handleLongPressMessage, handlePressPost],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44,
  );

  const handleOpenOptions = useCallback(() => {
    setOptionsModalStep('menu');
    setSuccessPayload(null);
    setIsActionLoading(false);
    setOptionsModalVisible(true);
  }, []);

  const handleCloseOptions = useCallback(() => {
    setOptionsModalVisible(false);
    setOptionsModalStep('menu');
    setSuccessPayload(null);
    setIsActionLoading(false);
  }, []);

  const handleSelectReportReason = useCallback(
    async (reason: string) => {
      if (!currentUserId || !peerId || isActionLoading) return;
      setIsActionLoading(true);
      try {
        await reportContent({
          reporterId: currentUserId,
          targetId: peerId,
          targetType: isGroupChat ? 'group' : 'user',
          reason,
        });
        setSuccessPayload({
          title: 'Report Submitted',
          message: `Thank you for reporting this ${isGroupChat ? 'group' : 'user'}. Our moderation team reviews all reports within 24 hours.`,
          actionType: 'report',
        });
        setOptionsModalStep('success');
      } catch (err) {
        console.warn('Report failed:', err);
        setSuccessPayload({
          title: 'Report Submitted',
          message: 'Your report has been received and will be reviewed shortly.',
          actionType: 'report',
        });
        setOptionsModalStep('success');
      } finally {
        setIsActionLoading(false);
      }
    },
    [currentUserId, peerId, isGroupChat, isActionLoading],
  );

  const handleConfirmBlock = useCallback(async () => {
    if (!currentUserId || !peerId || isActionLoading) return;
    setIsActionLoading(true);
    try {
      if (isGroupChat) {
        await leaveGroup(peerId, currentUserId).catch(() => {});
        setSuccessPayload({
          title: 'Group Blocked',
          message: `${currentPeerName} has been blocked and you have left the group.`,
          actionType: 'block',
        });
      } else {
        await blockUser(currentUserId, peerId);
        setSuccessPayload({
          title: 'User Blocked',
          message: `${currentPeerName} has been blocked. You will no longer receive messages or see their profile.`,
          actionType: 'block',
        });
      }
      setOptionsModalStep('success');
    } catch (err) {
      console.warn('Block failed:', err);
      setSuccessPayload({
        title: isGroupChat ? 'Group Blocked' : 'User Blocked',
        message: `${currentPeerName} has been blocked.`,
        actionType: 'block',
      });
      setOptionsModalStep('success');
    } finally {
      setIsActionLoading(false);
    }
  }, [currentUserId, peerId, isGroupChat, currentPeerName, isActionLoading]);

  const handleConfirmExitGroup = useCallback(async () => {
    if (!currentUserId || !peerId || isActionLoading) return;
    setIsActionLoading(true);
    try {
      await leaveGroup(peerId, currentUserId);
      setSuccessPayload({
        title: 'Left Group',
        message: `You have successfully left "${currentPeerName}".`,
        actionType: 'exit',
      });
      setOptionsModalStep('success');
    } catch (err: any) {
      console.warn('Exit group failed:', err);
      setSuccessPayload({
        title: 'Left Group',
        message: `You have left ${currentPeerName}.`,
        actionType: 'exit',
      });
      setOptionsModalStep('success');
    } finally {
      setIsActionLoading(false);
    }
  }, [currentUserId, peerId, currentPeerName, isActionLoading]);

  const handleSuccessDone = useCallback(() => {
    const actionType = successPayload?.actionType;
    handleCloseOptions();
    if (actionType === 'block' || actionType === 'exit') {
      navigation.goBack();
    }
  }, [successPayload, handleCloseOptions, navigation]);

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
          onOptionsPress={handleOpenOptions}
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

        {/* Reply preview banner */}
        {replyingTo ? (
          <View style={styles.replyBannerContainer}>
            <View style={styles.replyBannerBar} />
            <View style={styles.replyBannerContent}>
              <Text style={styles.replyBannerTitle} numberOfLines={1}>
                Replying to {replyingTo.isOutgoing ? 'yourself' : (replyingTo.senderName || currentPeerName)}
              </Text>
              <Text style={styles.replyBannerText} numberOfLines={1}>
                {replyingTo.mediaType === 'image'
                  ? '📷 Photo'
                  : replyingTo.mediaType === 'audio'
                  ? '🎤 Voice memo'
                  : replyingTo.text}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setReplyingTo(null)}
              hitSlop={12}
              style={styles.replyBannerCloseBtn}
            >
              <Text style={styles.replyBannerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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

      {/* Redesigned Group / Direct Options Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseOptions}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            if (!isActionLoading) {
              handleCloseOptions();
            }
          }}
        >
          <Pressable style={styles.redesignedCard} onPress={e => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.redesignedHeader}>
              {optionsModalStep !== 'menu' && optionsModalStep !== 'success' ? (
                <TouchableOpacity
                  onPress={() => setOptionsModalStep('menu')}
                  style={styles.headerBackBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={isActionLoading}
                >
                  <BackArrowIcon size={18} color={Colors.userProfilePurple} />
                  <Text style={styles.headerBackText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.headerTitleWrap}>
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {optionsModalStep === 'success'
                      ? 'Success'
                      : isGroupChat
                      ? 'Group Options'
                      : 'User Options'}
                  </Text>
                  {optionsModalStep === 'menu' ? (
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                      {currentPeerName}
                    </Text>
                  ) : null}
                </View>
              )}

              <TouchableOpacity
                onPress={handleCloseOptions}
                style={styles.headerCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                disabled={isActionLoading}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <CloseIcon size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerDivider} />

            {/* Step: Menu Options */}
            {optionsModalStep === 'menu' && (
              <View style={styles.modalBody}>
                {isGroupChat ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionCard}
                      activeOpacity={0.7}
                      onPress={() => setOptionsModalStep('report')}
                    >
                      <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
                        <WarnIcon size={20} color="#D97706" />
                      </View>
                      <View style={styles.actionTextBox}>
                        <Text style={styles.actionTitle}>Report Group</Text>
                        <Text style={styles.actionDesc}>Report inappropriate content or violations</Text>
                      </View>
                      <ChevronRightIcon size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCard}
                      activeOpacity={0.7}
                      onPress={() => setOptionsModalStep('confirm_block')}
                    >
                      <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
                        <BlockIcon size={20} color="#DC2626" />
                      </View>
                      <View style={styles.actionTextBox}>
                        <Text style={[styles.actionTitle, { color: '#DC2626' }]}>Block Group</Text>
                        <Text style={styles.actionDesc}>Stop receiving messages and notifications</Text>
                      </View>
                      <ChevronRightIcon size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCard}
                      activeOpacity={0.7}
                      onPress={() => setOptionsModalStep('confirm_exit')}
                    >
                      <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
                        <LogoutIcon size={20} color={Colors.userProfilePurple} />
                      </View>
                      <View style={styles.actionTextBox}>
                        <Text style={[styles.actionTitle, { color: Colors.userProfilePurple }]}>Exit Group</Text>
                        <Text style={styles.actionDesc}>Leave this group conversation</Text>
                      </View>
                      <ChevronRightIcon size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.actionCard}
                      activeOpacity={0.7}
                      onPress={() => setOptionsModalStep('report')}
                    >
                      <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
                        <WarnIcon size={20} color="#D97706" />
                      </View>
                      <View style={styles.actionTextBox}>
                        <Text style={styles.actionTitle}>Report User</Text>
                        <Text style={styles.actionDesc}>Report harassment, spam, or violations</Text>
                      </View>
                      <ChevronRightIcon size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCard}
                      activeOpacity={0.7}
                      onPress={() => setOptionsModalStep('confirm_block')}
                    >
                      <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
                        <BlockIcon size={20} color="#DC2626" />
                      </View>
                      <View style={styles.actionTextBox}>
                        <Text style={[styles.actionTitle, { color: '#DC2626' }]}>Block User</Text>
                        <Text style={styles.actionDesc}>Block messages, calls, and profile access</Text>
                      </View>
                      <ChevronRightIcon size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Step: Report Reasons */}
            {optionsModalStep === 'report' && (
              <View style={styles.modalBody}>
                <Text style={styles.stepPrompt}>
                  Why are you reporting this {isGroupChat ? 'group' : 'user'}?
                </Text>
                {REPORT_REASONS.map(reason => (
                  <TouchableOpacity
                    key={reason}
                    style={styles.reasonOption}
                    activeOpacity={0.7}
                    onPress={() => handleSelectReportReason(reason)}
                    disabled={isActionLoading}
                  >
                    <Text style={styles.reasonText}>{reason}</Text>
                    <ChevronRightIcon size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
                {isActionLoading && (
                  <ActivityIndicator
                    style={{ marginTop: 12 }}
                    size="small"
                    color={Colors.userProfilePurple}
                  />
                )}
              </View>
            )}

            {/* Step: Confirm Block */}
            {optionsModalStep === 'confirm_block' && (
              <View style={[styles.modalBody, styles.confirmBody]}>
                <View style={[styles.confirmBadge, { backgroundColor: '#FEE2E2' }]}>
                  <BlockIcon size={28} color="#DC2626" />
                </View>
                <Text style={styles.confirmTitle}>
                  Block {isGroupChat ? 'Group' : 'User'}?
                </Text>
                <Text style={styles.confirmMessage}>
                  {isGroupChat
                    ? `Are you sure you want to block "${currentPeerName}"? You will leave and stop receiving all messages from this group.`
                    : `Are you sure you want to block ${currentPeerName}? They won't be able to message you or see your profile.`}
                </Text>
                <View style={styles.buttonStack}>
                  <TouchableOpacity
                    style={[styles.primaryModalBtn, { backgroundColor: '#DC2626' }]}
                    activeOpacity={0.75}
                    onPress={handleConfirmBlock}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryModalBtnText}>
                        Yes, Block {isGroupChat ? 'Group' : 'User'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryModalBtn}
                    activeOpacity={0.75}
                    onPress={() => setOptionsModalStep('menu')}
                    disabled={isActionLoading}
                  >
                    <Text style={styles.secondaryModalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step: Confirm Exit Group */}
            {optionsModalStep === 'confirm_exit' && (
              <View style={[styles.modalBody, styles.confirmBody]}>
                <View style={[styles.confirmBadge, { backgroundColor: '#F3E8FF' }]}>
                  <LogoutIcon size={28} color={Colors.userProfilePurple} />
                </View>
                <Text style={styles.confirmTitle}>Exit Group?</Text>
                <Text style={styles.confirmMessage}>
                  Are you sure you want to exit "{currentPeerName}"? You will no longer receive any messages from this group.
                </Text>
                <View style={styles.buttonStack}>
                  <TouchableOpacity
                    style={[styles.primaryModalBtn, { backgroundColor: Colors.userProfilePurple }]}
                    activeOpacity={0.75}
                    onPress={handleConfirmExitGroup}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryModalBtnText}>Yes, Exit Group</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryModalBtn}
                    activeOpacity={0.75}
                    onPress={() => setOptionsModalStep('menu')}
                    disabled={isActionLoading}
                  >
                    <Text style={styles.secondaryModalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step: Success Screen */}
            {optionsModalStep === 'success' && successPayload && (
              <View style={[styles.modalBody, styles.confirmBody]}>
                <View style={[styles.confirmBadge, styles.successBadge]}>
                  <ApproveIcon size={32} color={Colors.userProfilePurple} />
                </View>
                <Text style={styles.confirmTitle}>{successPayload.title}</Text>
                <Text style={styles.confirmMessage}>{successPayload.message}</Text>
                <TouchableOpacity
                  style={[styles.primaryModalBtn, { backgroundColor: Colors.userProfilePurple, marginTop: UtilityMethods.hp(1.5) }]}
                  activeOpacity={0.75}
                  onPress={handleSuccessDone}
                >
                  <Text style={styles.primaryModalBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Message Context Action Sheet (Reply / Copy) */}
      <Modal
        visible={!!selectedMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedMessage(null)}
        >
          <View style={styles.optionsModalCard}>
            <Text style={styles.optionsModalTitle}>Message Options</Text>

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={() => {
                if (selectedMessage) {
                  setReplyingTo(selectedMessage);
                  setSelectedMessage(null);
                }
              }}
            >
              <Text style={styles.optionLabel}>💬  Reply</Text>
            </TouchableOpacity>

            {selectedMessage?.text &&
            selectedMessage.text !== 'Sent a photo' &&
            selectedMessage.text !== 'Sent a voice memo' ? (
              <>
                <View style={styles.optionDivider} />
                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (selectedMessage?.text) {
                      Clipboard.setString(selectedMessage.text);
                      Alert.alert('Copied', 'Message text copied to clipboard.');
                    }
                    setSelectedMessage(null);
                  }}
                >
                  <Text style={styles.optionLabel}>📋  Copy Text</Text>
                </TouchableOpacity>
              </>
            ) : null}

            <View style={styles.optionDivider} />

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={() => setSelectedMessage(null)}
            >
              <Text style={styles.optionCancelLabel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Full-Screen Pinch & Zoom Image Viewer Modal */}
      <Modal
        visible={!!fullScreenImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImageUrl(null)}
      >
        <View style={styles.imageViewerRoot}>
          <TouchableOpacity
            style={[styles.imageViewerCloseBtn, { top: topInset + 10 }]}
            onPress={() => setFullScreenImageUrl(null)}
            hitSlop={15}
            activeOpacity={0.8}
          >
            <Text style={styles.imageViewerCloseText}>✕</Text>
          </TouchableOpacity>

          {fullScreenImageUrl ? (
            <ScrollView
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={styles.imageViewerContent}
              maximumZoomScale={5}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              centerContent
            >
              <Image
                source={{ uri: fullScreenImageUrl }}
                style={styles.imageViewerImg}
                resizeMode="contain"
              />
            </ScrollView>
          ) : null}
        </View>
      </Modal>
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
    paddingTop: UtilityMethods.hp(1.5),
    paddingBottom: UtilityMethods.hp(1),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UtilityMethods.wp(8),
  },
  emptyText: {
    fontSize: FontSize.VALUE(14),
    color: Colors.placeholderGrey,
    textAlign: 'center',
  },
  replyBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
    paddingVertical: UtilityMethods.hp(0.8),
    paddingHorizontal: UtilityMethods.wp(4),
  },
  replyBannerBar: {
    width: 4,
    height: '100%',
    backgroundColor: Colors.chartMalePurple,
    borderRadius: 2,
    marginRight: UtilityMethods.wp(2.5),
  },
  replyBannerContent: {
    flex: 1,
  },
  replyBannerTitle: {
    fontSize: FontSize.VALUE(12),
    fontWeight: '700',
    color: Colors.chartMalePurple,
    marginBottom: UtilityMethods.hp(0.2),
  },
  replyBannerText: {
    fontSize: FontSize.VALUE(13),
    color: Colors.textDark,
  },
  replyBannerCloseBtn: {
    padding: UtilityMethods.wp(1.5),
    marginLeft: UtilityMethods.wp(2),
  },
  replyBannerCloseText: {
    fontSize: FontSize.VALUE(16),
    color: Colors.textGrey,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UtilityMethods.wp(8),
  },
  optionsModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3.5),
    paddingVertical: UtilityMethods.hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  optionsModalTitle: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    paddingVertical: UtilityMethods.hp(1),
    paddingHorizontal: UtilityMethods.wp(4),
  },
  optionRow: {
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(5),
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '500',
    color: Colors.textDark,
  },
  optionDestructive: {
    color: Colors.adminErrorRed,
    fontWeight: '600',
  },
  optionCancelLabel: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.placeholderGrey,
  },
  optionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderGrey,
    marginHorizontal: UtilityMethods.wp(3),
  },
  imageViewerRoot: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    right: UtilityMethods.wp(5),
    zIndex: 99,
    width: UtilityMethods.wp(10),
    height: UtilityMethods.wp(10),
    borderRadius: UtilityMethods.wp(5),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseText: {
    color: '#FFFFFF',
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
  },
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImg: {
    width: UtilityMethods.wp(100),
    height: UtilityMethods.hp(80),
  },
  redesignedCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  redesignedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(1.6),
    minHeight: 56,
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: UtilityMethods.wp(2),
  },
  headerTitle: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.textDark,
  },
  headerSubtitle: {
    fontSize: FontSize.VALUE(12),
    color: Colors.placeholderGrey,
    marginTop: 2,
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UtilityMethods.hp(0.5),
    paddingRight: UtilityMethods.wp(2),
  },
  headerBackText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.userProfilePurple,
    marginLeft: 4,
  },
  headerCloseBtn: {
    padding: UtilityMethods.wp(1.5),
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: '#F3F4F6',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  modalBody: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingVertical: UtilityMethods.hp(2),
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UtilityMethods.hp(1.4),
    paddingHorizontal: UtilityMethods.wp(3.5),
    backgroundColor: '#F9FAFB',
    borderRadius: UtilityMethods.wp(3),
    marginBottom: UtilityMethods.hp(1.2),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FontSize.VALUE(14.5),
    fontWeight: '600',
    color: Colors.textDark,
  },
  actionDesc: {
    fontSize: FontSize.VALUE(11.5),
    color: '#6B7280',
    marginTop: 2,
  },
  stepPrompt: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(1.5),
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(4),
    backgroundColor: '#F9FAFB',
    borderRadius: UtilityMethods.wp(2.5),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: UtilityMethods.hp(1),
  },
  reasonText: {
    fontSize: FontSize.VALUE(14),
    color: Colors.textDark,
    fontWeight: '500',
  },
  confirmBody: {
    alignItems: 'center',
    paddingVertical: UtilityMethods.hp(2.5),
  },
  confirmBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UtilityMethods.hp(1.5),
  },
  successBadge: {
    backgroundColor: '#F3E8FF',
    borderColor: '#DDD6FE',
    borderWidth: 2,
  },
  confirmTitle: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: UtilityMethods.hp(0.8),
  },
  confirmMessage: {
    fontSize: FontSize.VALUE(13.5),
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: UtilityMethods.hp(2.2),
    paddingHorizontal: UtilityMethods.wp(2),
  },
  buttonStack: {
    width: '100%',
    gap: UtilityMethods.hp(1),
  },
  primaryModalBtn: {
    width: '100%',
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryModalBtnText: {
    fontSize: FontSize.VALUE(14.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryModalBtn: {
    width: '100%',
    paddingVertical: UtilityMethods.hp(1.4),
    borderRadius: UtilityMethods.wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  secondaryModalBtnText: {
    fontSize: FontSize.VALUE(14.5),
    fontWeight: '600',
    color: '#4B5563',
  },
});
