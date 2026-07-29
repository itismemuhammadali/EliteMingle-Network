import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../../navigation/User/types';
import { ChatHeader, MessageBubble, ChatInput } from '../../../components/user';
import { Colors } from '../../../constants/colors';
import {
  getOrCreateDirectConversation,
  sendMessage as sendChatMessage,
  subscribeToMessages,
  markConversationAsRead,
} from '../../../services/chatService';
import UtilityMethods from '../../../utility/UtilityMethods';

export type ChatMessage = {
  id: string;
  text: string;
  time: string;
  isOutgoing: boolean;
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
    peerId,
    peerName,
    peerAvatarUri,
    conversationId: initialConvId,
    statusText = 'Online',
    isOnlineStatus = true,
  } = route.params;

  const [activeConvId, setActiveConvId] = useState<string | undefined>(initialConvId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Drop the bottom safe-area padding while the keyboard is up (the keyboard
  // already covers that area) so there's no dead gap above it.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const currentUserId = auth().currentUser?.uid || 'temp_current_user';

  // Initialize conversation and subscribe to real-time messages
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    async function initChat() {
      let convId = initialConvId;

      if (!convId && currentUserId && peerId) {
        try {
          convId = await getOrCreateDirectConversation(currentUserId, peerId, {
            name: peerName,
            avatarUri: peerAvatarUri,
          });
          if (isMounted) {
            setActiveConvId(convId);
          }
        } catch (err) {
          console.error('Error getting/creating conversation:', err);
        }
      }

      if (convId && isMounted) {
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
  }, [initialConvId, currentUserId, peerId, peerName, peerAvatarUri]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSend = useCallback(async () => {
    const t = draft.trim();
    if (!t) {
      return;
    }

    setDraft('');

    let convId = activeConvId;
    if (!convId && currentUserId && peerId) {
      try {
        convId = await getOrCreateDirectConversation(currentUserId, peerId, {
          name: peerName,
          avatarUri: peerAvatarUri,
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
  }, [draft, activeConvId, currentUserId, peerId, peerName, peerAvatarUri]);

  const listData = useMemo(() => [...messages].reverse(), [messages]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        text={item.text}
        time={item.time}
        isOutgoing={item.isOutgoing}
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ChatHeader
        peerName={peerName}
        peerAvatarUri={peerAvatarUri}
        statusText={statusText}
        isOnlineStatus={isOnlineStatus}
        onBackPress={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {listData.length > 0 ? (
          <FlatList
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
              No messages yet. Say hi to {peerName}! 👋
            </Text>
          </View>
        )}

        <View style={{ paddingBottom: keyboardOpen ? 0 : insets.bottom }}>
          <ChatInput
            value={draft}
            onChangeText={setDraft}
            onSend={handleSend}
          />
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
