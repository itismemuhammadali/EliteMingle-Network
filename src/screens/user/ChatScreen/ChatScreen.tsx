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
  replyTo?: {
    id?: string;
    text?: string;
    senderName?: string;
    mediaType?: 'image' | 'audio';
  };
};

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
    isOnlineStatus === false ||
    initialConvId?.startsWith('group_') ||
    (route.params as any)?.isGroup ||
    statusText?.toLowerCase().includes('member')
  );

  const [isGroupChat, setIsGroupChat] = useState<boolean>(isGroupHint);
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

  // Three-dots options modal state
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  // Message action sheet state (for Reply / Copy)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  const currentUserId = auth().currentUser?.uid || '';

  // Dynamically resolve peer / group metadata from Firestore
  useEffect(() => {
    if (!peerId) return;

    if (isGroupChat) {
      const unsub = firestore()
        .collection('groups')
        .doc(peerId)
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
  }, [peerId, isGroupChat]);

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
        markConversationAsRead(convId, currentUserId);
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
      if (!convId && currentUserId && peerId) {
        convId = await getOrCreateDirectConversation(currentUserId, peerId, {
          name: currentPeerName,
          avatarUri: currentPeerAvatar,
        });
        setActiveConvId(convId);
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
        replyTo={item.replyTo}
        onPressImage={url => setFullScreenImageUrl(url)}
        onLongPress={() => handleLongPressMessage(item)}
      />
    ),
    [isGroupChat, handleLongPressMessage],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44,
  );

  const submitReport = useCallback(
    async (reason: string) => {
      if (currentUserId && peerId) {
        await reportContent({
          reporterId: currentUserId,
          targetId: peerId,
          targetType: isGroupChat ? 'group' : 'user',
          reason,
        });
        Alert.alert(
          'Report Submitted',
          `Thank you for reporting this ${isGroupChat ? 'group' : 'user'}. Our moderation team reviews all reports within 24 hours.`,
        );
      }
    },
    [currentUserId, peerId, isGroupChat],
  );

  const handleReportAction = useCallback(() => {
    setOptionsModalVisible(false);
    Alert.alert(
      isGroupChat ? 'Report Group' : 'Report User',
      `Why are you reporting this ${isGroupChat ? 'group' : 'user'}?`,
      [
        {
          text: 'Inappropriate Content',
          onPress: () => submitReport('Inappropriate Content'),
        },
        {
          text: 'Harassment or Bullying',
          onPress: () => submitReport('Harassment or Bullying'),
        },
        {
          text: 'Spam or Fraud',
          onPress: () => submitReport('Spam or Fraud'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, [isGroupChat, submitReport]);

  const handleBlockAction = useCallback(() => {
    setOptionsModalVisible(false);
    if (isGroupChat) {
      Alert.alert(
        'Block Group',
        `Are you sure you want to block ${currentPeerName}? You will exit and no longer receive messages from this group.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block Group',
            style: 'destructive',
            onPress: async () => {
              if (currentUserId && peerId) {
                await leaveGroup(peerId, currentUserId).catch(() => {});
                Alert.alert('Group Blocked', `${currentPeerName} has been blocked.`);
                navigation.goBack();
              }
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Block User',
        `Are you sure you want to block ${currentPeerName}? You will no longer receive messages or see their posts.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block',
            style: 'destructive',
            onPress: async () => {
              if (currentUserId && peerId) {
                await blockUser(currentUserId, peerId);
                Alert.alert('User Blocked', `${currentPeerName} has been blocked.`);
                navigation.goBack();
              }
            },
          },
        ],
      );
    }
  }, [isGroupChat, currentPeerName, currentUserId, peerId, navigation]);

  const handleExitGroupAction = useCallback(() => {
    setOptionsModalVisible(false);
    Alert.alert(
      'Exit Group',
      `Are you sure you want to leave ${currentPeerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit Group',
          style: 'destructive',
          onPress: async () => {
            if (currentUserId && peerId) {
              try {
                await leaveGroup(peerId, currentUserId);
                Alert.alert('Left Group', `You have left ${currentPeerName}.`);
                navigation.goBack();
              } catch (e: any) {
                Alert.alert('Error', e?.message || 'Could not leave group.');
              }
            }
          },
        },
      ],
    );
  }, [currentPeerName, currentUserId, peerId, navigation]);

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
          onOptionsPress={() => setOptionsModalVisible(true)}
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

      {/* Group / Direct Options Modal (Dismissable by tapping backdrop) */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.optionsModalCard}>
            <Text style={styles.optionsModalTitle} numberOfLines={1}>
              {currentPeerName}
            </Text>

            {isGroupChat ? (
              <>
                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={handleReportAction}
                >
                  <Text style={styles.optionLabel}>Report Group</Text>
                </TouchableOpacity>

                <View style={styles.optionDivider} />

                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={handleBlockAction}
                >
                  <Text style={[styles.optionLabel, styles.optionDestructive]}>
                    Block Group
                  </Text>
                </TouchableOpacity>

                <View style={styles.optionDivider} />

                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={handleExitGroupAction}
                >
                  <Text style={[styles.optionLabel, styles.optionDestructive]}>
                    Exit Group
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={handleReportAction}
                >
                  <Text style={styles.optionLabel}>Report User</Text>
                </TouchableOpacity>

                <View style={styles.optionDivider} />

                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={handleBlockAction}
                >
                  <Text style={[styles.optionLabel, styles.optionDestructive]}>
                    Block User
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.optionDivider} />

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={styles.optionCancelLabel}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
});
