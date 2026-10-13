import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';
import type { UserMessageListItem } from '../constants/userMessagesData';
import type { ChatMessage } from '../screens/user/ChatScreen/ChatScreen';
import { createNotification } from './notificationService';
import { setCachedAudioUri } from './audioCacheService';

export interface ParticipantProfile {
  name: string;
  avatarUri?: string;
}

export interface ConversationDocument {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  participantProfiles?: Record<string, ParticipantProfile>;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: FirebaseFirestoreTypes.Timestamp | ReturnType<typeof firestore.FieldValue.serverTimestamp>;
  };
  unreadCount?: Record<string, number>;
  createdAt: FirebaseFirestoreTypes.Timestamp | ReturnType<typeof firestore.FieldValue.serverTimestamp>;
  updatedAt: FirebaseFirestoreTypes.Timestamp | ReturnType<typeof firestore.FieldValue.serverTimestamp>;
  groupName?: string;
  groupAvatar?: string;
  memberLabel?: string;
}

export interface MessageDocument {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  createdAt: FirebaseFirestoreTypes.Timestamp | ReturnType<typeof firestore.FieldValue.serverTimestamp>;
  readBy?: string[];
}

export interface RegisteredUser {
  id: string;
  name: string;
  avatarUri?: string;
  bio?: string;
}

/**
 * 1. Get existing direct conversation or create a new one between two users.
 * Uses a deterministic conversation ID format `direct_UID1_UID2` (sorted).
 */
export const getOrCreateDirectConversation = async (
  currentUserId: string,
  peerId: string,
  peerDetails?: { name?: string; avatarUri?: string },
): Promise<string> => {
  if (!currentUserId || !peerId) {
    throw new Error('Both currentUserId and peerId are required.');
  }

  const sortedIds = [currentUserId, peerId].sort();
  const conversationId = `direct_${sortedIds.join('_')}`;

  const convRef = firestore().collection('conversations').doc(conversationId);
  const convSnap = await convRef.get();

  const convSnapExists = typeof (convSnap as any).exists === 'function' ? convSnap.exists() : convSnap.exists;

  if (!convSnapExists) {
    let currentUserProfile: ParticipantProfile = { name: 'User', avatarUri: '' };
    let peerProfile: ParticipantProfile = {
      name: peerDetails?.name || 'User',
      avatarUri: peerDetails?.avatarUri || '',
    };

    try {
      const [currentUserDoc, peerDoc] = await Promise.all([
        firestore().collection('users').doc(currentUserId).get(),
        firestore().collection('users').doc(peerId).get(),
      ]);

      const currentUserExists = typeof (currentUserDoc as any).exists === 'function' ? currentUserDoc.exists() : currentUserDoc.exists;
      if (currentUserExists) {
        const d = currentUserDoc.data();
        const resolved = d?.fullName || d?.displayName || d?.name;
        currentUserProfile = {
          name: (resolved && resolved !== 'Anonymous User') ? resolved : 'User',
          avatarUri: d?.profilePicture || d?.avatarUri || '',
        };
      }

      const peerExists = typeof (peerDoc as any).exists === 'function' ? peerDoc.exists() : peerDoc.exists;
      if (peerExists) {
        const d = peerDoc.data();
        const candidateName =
          peerDetails?.name && peerDetails.name !== 'Anonymous User' ? peerDetails.name : '';
        const docName = d?.fullName || d?.displayName || d?.name;
        const validDocName = docName && docName !== 'Anonymous User' ? docName : '';
        const emailFallback = d?.email ? d.email.split('@')[0] : '';
        const resolved =
          candidateName ||
          validDocName ||
          (emailFallback ? emailFallback.charAt(0).toUpperCase() + emailFallback.slice(1) : '') ||
          'User';
        peerProfile = {
          name: resolved,
          avatarUri: peerDetails?.avatarUri || d?.profilePicture || d?.avatarUri || '',
        };
      }
    } catch (err) {
      console.warn('Error fetching user profiles for conversation:', err);
    }

    const newConversation: Partial<ConversationDocument> = {
      id: conversationId,
      type: 'direct',
      participants: [currentUserId, peerId],
      participantProfiles: {
        [currentUserId]: currentUserProfile,
        [peerId]: peerProfile,
      },
      unreadCount: {
        [currentUserId]: 0,
        [peerId]: 0,
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await convRef.set(newConversation, { merge: true });
  } else {
    try {
      const data = convSnap.data() as ConversationDocument;
      const peerProf = data.participantProfiles?.[peerId];
      if (!peerProf?.name || peerProf.name === 'Anonymous User' || peerProf.name === 'User') {
        const peerDoc = await firestore().collection('users').doc(peerId).get();
        const peerDocExists = typeof (peerDoc as any).exists === 'function' ? peerDoc.exists() : peerDoc.exists;
        if (peerDocExists) {
          const d = peerDoc.data();
          const candidateName =
            peerDetails?.name && peerDetails.name !== 'Anonymous User' ? peerDetails.name : '';
          const docName = d?.fullName || d?.displayName || d?.name;
          const validDocName = docName && docName !== 'Anonymous User' ? docName : '';
          const emailFallback = d?.email ? d.email.split('@')[0] : '';
          const resolved =
            candidateName ||
            validDocName ||
            (emailFallback ? emailFallback.charAt(0).toUpperCase() + emailFallback.slice(1) : '');
          if (resolved && resolved !== 'Anonymous User') {
            await convRef.update({
              [`participantProfiles.${peerId}.name`]: resolved,
            });
          }
        }
      }
    } catch (err) {
      // Non-blocking heal
    }
  }

  return conversationId;
};

/**
 * Get or create a group conversation for a group (deterministic id
 * `group_{groupId}`). Participants are re-synced to the current member list
 * each time it's opened so new members join the thread.
 */
export const getOrCreateGroupConversation = async (
  groupId: string,
  groupName: string,
  memberIds: string[],
  groupAvatar = '',
): Promise<string> => {
  if (!groupId) throw new Error('groupId is required.');
  const conversationId = `group_${groupId}`;
  const convRef = firestore().collection('conversations').doc(conversationId);
  const snap = await convRef.get();
  const exists =
    typeof (snap as any).exists === 'function' ? snap.exists() : snap.exists;

  const base: Record<string, any> = {
    id: conversationId,
    type: 'group',
    participants: memberIds,
    groupName,
    groupAvatar,
    memberLabel: `${memberIds.length} members`,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };
  if (!exists) {
    base.createdAt = firestore.FieldValue.serverTimestamp();
    base.unreadCount = {};
  }

  await convRef.set(base, { merge: true });
  return conversationId;
};

/**
 * 2. Send a chat message in a conversation thread.
 * Adds message document and atomically updates last message & unread counters.
 */
export const sendMessage = async ({
  conversationId,
  senderId,
  text,
  mediaUrl,
  mediaType,
}: {
  conversationId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
}): Promise<string> => {
  if (!conversationId || !senderId) {
    throw new Error('conversationId and senderId are required.');
  }

  const msgRef = firestore()
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .doc();

  const msgId = msgRef.id;
  const timestamp = firestore.FieldValue.serverTimestamp();

  const messageData = {
    id: msgId,
    conversationId,
    senderId,
    text: text.trim(),
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || (mediaUrl ? 'image' : null),
    createdAt: timestamp,
    readBy: [senderId],
  };

  const convRef = firestore().collection('conversations').doc(conversationId);
  const convSnap = await convRef.get();

  const batch = firestore().batch();
  batch.set(msgRef, messageData);

  const updateData: Record<string, any> = {
    lastMessage: {
      text: text.trim(),
      senderId,
      timestamp,
    },
    updatedAt: timestamp,
  };

  const convSnapExists = typeof (convSnap as any).exists === 'function' ? convSnap.exists() : convSnap.exists;
  let recipients: string[] = [];
  if (convSnapExists) {
    const data = convSnap.data() as ConversationDocument;
    const participants = data.participants || [];
    recipients = participants.filter(pId => pId !== senderId);
    recipients.forEach(pId => {
      updateData[`unreadCount.${pId}`] = firestore.FieldValue.increment(1);
    });
  }

  batch.update(convRef, updateData);
  await batch.commit();

  // Notify each recipient about the new message (best-effort, non-blocking).
  recipients.forEach(pId => {
    createNotification({
      recipientId: pId,
      actorId: senderId,
      type: 'message',
      preview: text.trim(),
    });
  });

  return msgId;
};

/**
 * Upload a locally selected chat image to Firebase Storage and return its remote URL.
 */
export const uploadChatImage = async (
  conversationId: string,
  localUri: string,
): Promise<string> => {
  if (!localUri || localUri.startsWith('http')) return localUri || '';
  try {
    const cleanConvId = (conversationId || 'chat').replace(/[^a-zA-Z0-9_-]/g, '_');
    const path = `chat/${cleanConvId}/image_${Date.now()}.jpg`;
    const ref = storage().ref(path);
    const metadata = { contentType: 'image/jpeg' };

    const uploadUri =
      Platform.OS === 'android' && localUri.startsWith('file://')
        ? localUri.replace('file://', '')
        : localUri;
    await ref.putFile(uploadUri, metadata);

    const raw = await ref.getDownloadURL();
    return raw;
  } catch (err) {
    console.warn('Chat image upload failed:', err);
    return localUri;
  }
};

/**
 * Upload a recorded chat audio voice memo to Firebase Storage and return its remote URL.
 */
export const uploadChatAudio = async (
  conversationId: string,
  localUri: string,
): Promise<string> => {
  if (!localUri || localUri.startsWith('http')) return localUri || '';
  try {
    const cleanConvId = (conversationId || 'chat').replace(/[^a-zA-Z0-9_-]/g, '_');
    const path = `chat/${cleanConvId}/audio_${Date.now()}.m4a`;
    const ref = storage().ref(path);
    const metadata = { contentType: 'audio/m4a' };

    const uploadUri =
      Platform.OS === 'android' && localUri.startsWith('file://')
        ? localUri.replace('file://', '')
        : localUri;
    await ref.putFile(uploadUri, metadata);

    const raw = await ref.getDownloadURL();
    setCachedAudioUri(raw, localUri);
    return raw;
  } catch (err) {
    console.warn('Chat audio upload failed:', err);
    return localUri;
  }
};

/**
 * 3. Mark a conversation as read for a given user.
 */
export const markConversationAsRead = async (
  conversationId: string,
  userId: string,
): Promise<void> => {
  if (!conversationId || !userId) return;

  try {
    const convRef = firestore().collection('conversations').doc(conversationId);
    await convRef.update({
      [`unreadCount.${userId}`]: 0,
    });
  } catch (err) {
    // Ignore error if doc does not exist yet
  }
};

/**
 * 4. Real-time subscription to a user's active conversations list.
 */
export const subscribeToConversations = (
  userId: string,
  onUpdate: (threads: UserMessageListItem[]) => void,
) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  return firestore()
    .collection('conversations')
    .where('participants', 'array-contains', userId)
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) {
          onUpdate([]);
          return;
        }

        const threads: UserMessageListItem[] = snapshot.docs.map(doc => {
          const data = doc.data() as ConversationDocument;
          const isGroup = data.type === 'group';

          if (isGroup) {
            return {
              id: doc.id,
              variant: 'group',
              name: data.groupName || 'Group Chat',
              preview: data.lastMessage?.text || 'No messages yet',
              memberLabel: data.memberLabel || `${data.participants?.length || 0} members`,
              avatarUris: data.groupAvatar ? [data.groupAvatar] : [],
            };
          }

          const peerId = data.participants?.find(p => p !== userId) || userId;
          const peerProfile = data.participantProfiles?.[peerId];
          const unreadCount = data.unreadCount?.[userId] || 0;

          let timeStr = 'Just now';
          if (data.updatedAt) {
            const date = typeof (data.updatedAt as any)?.toDate === 'function'
              ? (data.updatedAt as any).toDate()
              : new Date();
            const diffMins = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
            if (diffMins < 60) {
              timeStr = `${diffMins}m`;
            } else if (diffMins < 1440) {
              timeStr = `${Math.floor(diffMins / 60)}h`;
            } else {
              timeStr = `${Math.floor(diffMins / 1440)}d`;
            }
          }

          return {
            id: doc.id,
            peerId,
            variant: 'direct',
            name: peerProfile?.name || 'User',
            preview: data.lastMessage?.text || 'Start a conversation',
            time: timeStr,
            avatarUri: peerProfile?.avatarUri || '',
            unreadCount: unreadCount > 0 ? unreadCount : undefined,
          };
        });

        onUpdate(threads);
      },
      error => {
        console.error('Real-time conversations snapshot error:', error);
      },
    );
};

/**
 * 5. Real-time subscription to messages within a specific conversation thread.
 */
export const subscribeToMessages = (
  conversationId: string,
  currentUserId: string,
  onUpdate: (messages: ChatMessage[]) => void,
) => {
  if (!conversationId) {
    onUpdate([]);
    return () => {};
  }

  return firestore()
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) {
          onUpdate([]);
          return;
        }

        const messagesList: ChatMessage[] = snapshot.docs.map(doc => {
          const data = doc.data() as MessageDocument;
          let timeStr = '';
          if (data.createdAt) {
            const date = typeof (data.createdAt as any)?.toDate === 'function'
              ? (data.createdAt as any).toDate()
              : new Date();
            timeStr = date.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            });
          }

          const mediaType =
            data.mediaType ||
            (data.mediaUrl
              ? data.mediaUrl.includes('.m4a') ||
                data.mediaUrl.includes('.mp3') ||
                data.mediaUrl.includes('.aac') ||
                data.text === 'Sent a voice memo'
                ? 'audio'
                : 'image'
              : undefined);

          return {
            id: doc.id,
            text: data.text || '',
            time: timeStr,
            isOutgoing: data.senderId === currentUserId,
            mediaUrl: data.mediaUrl || undefined,
            mediaType,
          };
        });

        onUpdate(messagesList);
      },
      error => {
        console.error('Real-time messages snapshot error:', error);
      },
    );
};

/**
 * 6. Real-time subscription to registered users in Firestore.
 */
export const subscribeToAllUsers = (
  currentUserId: string,
  onUpdate: (users: RegisteredUser[]) => void,
) => {
  return firestore()
    .collection('users')
    .onSnapshot(
      snapshot => {
        if (!snapshot || snapshot.empty) {
          onUpdate([]);
          return;
        }

        const usersList: RegisteredUser[] = snapshot.docs
          .filter(doc => {
            if (doc.id === currentUserId) return false;
            const data = doc.data();
            const role = (data.role || '').toLowerCase();
            return role !== 'admin';
          })
          .map(doc => {
            const d = doc.data();
            const rawName = d.fullName || d.displayName || d.name;
            const name =
              rawName && rawName !== 'Anonymous User'
                ? rawName
                : d.email
                ? d.email.split('@')[0].charAt(0).toUpperCase() + d.email.split('@')[0].slice(1)
                : 'User';
            const avatarUri = d.profilePicture || d.avatarUri || d.avatarUrl || '';
            return {
              id: doc.id,
              name,
              avatarUri,
              bio: d.bio || 'Community Member',
            };
          });

        onUpdate(usersList);
      },
      error => {
        console.error('Real-time users snapshot error:', error);
      },
    );
};

/**
 * 7. Fetch the most recent direct conversation for voice command deep linking.
 */
export const getLatestDirectConversation = async (
  userId: string,
): Promise<{
  conversationId: string;
  peerId: string;
  peerName: string;
  peerAvatarUri: string;
} | null> => {
  if (!userId) return null;
  try {
    const snap = await firestore()
      .collection('conversations')
      .where('participants', 'array-contains', userId)
      .get();
    if (!snap || snap.empty) return null;

    const directDocs = snap.docs
      .map(d => ({ id: d.id, data: d.data() as ConversationDocument }))
      .filter(d => d.data.type === 'direct' || !d.data.type)
      .sort((a, b) => {
        const at = (a.data.updatedAt as any)?.seconds || 0;
        const bt = (b.data.updatedAt as any)?.seconds || 0;
        return bt - at;
      });

    if (directDocs.length === 0) return null;
    const latest = directDocs[0];
    const peerId = latest.data.participants?.find(p => p !== userId) || userId;
    const peerProfile = latest.data.participantProfiles?.[peerId];

    return {
      conversationId: latest.id,
      peerId,
      peerName: peerProfile?.name || 'User',
      peerAvatarUri: peerProfile?.avatarUri || '',
    };
  } catch (err) {
    console.warn('getLatestDirectConversation error:', err);
    return null;
  }
};

/**
 * 8. Fetch the most recent group conversation for voice command deep linking.
 */
export const getLatestGroupConversation = async (
  userId: string,
): Promise<{
  conversationId: string;
  groupName: string;
  groupAvatar: string;
  memberLabel: string;
} | null> => {
  if (!userId) return null;
  try {
    const snap = await firestore()
      .collection('conversations')
      .where('participants', 'array-contains', userId)
      .get();
    if (!snap || snap.empty) return null;

    const groupDocs = snap.docs
      .map(d => ({ id: d.id, data: d.data() as ConversationDocument }))
      .filter(d => d.data.type === 'group')
      .sort((a, b) => {
        const at = (a.data.updatedAt as any)?.seconds || 0;
        const bt = (b.data.updatedAt as any)?.seconds || 0;
        return bt - at;
      });

    if (groupDocs.length === 0) return null;
    const latest = groupDocs[0];

    return {
      conversationId: latest.id,
      groupName: latest.data.groupName || 'Group Chat',
      groupAvatar: latest.data.groupAvatar || '',
      memberLabel: latest.data.memberLabel || `${latest.data.participants?.length || 0} members`,
    };
  } catch (err) {
    console.warn('getLatestGroupConversation error:', err);
    return null;
  }
};
