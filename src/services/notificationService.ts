import firestore from '@react-native-firebase/firestore';
import { formatTimeAgo } from '../utils/timeAgo';
import type {
  UserAppNotification,
  UserAppNotificationType,
} from '../constants/userNotificationsData';

/**
 * Notifications live in a top-level `notifications` collection, one doc per
 * event, addressed to a single recipient.
 *
 *   notifications/{id}: {
 *     recipientId, actorId, type, title, subtitle, postId, isRead, createdAt
 *   }
 */

interface CreateNotificationParams {
  recipientId: string;
  actorId: string;
  type: UserAppNotificationType;
  /** Optional preview text (comment body, message text, etc.). */
  preview?: string;
  /** Optional related post id for like/comment deep-linking later. */
  postId?: string;
  conversationId?: string;
  groupId?: string;
}

const docExists = (snap: any): boolean =>
  typeof snap?.exists === 'function' ? snap.exists() : !!snap?.exists;

function buildTitle(type: UserAppNotificationType, actorName: string): string {
  switch (type) {
    case 'like':
      return `${actorName} liked your post`;
    case 'comment':
      return `${actorName} commented on your post`;
    case 'friend_request':
      return `${actorName} sent you a friend request`;
    case 'friend_accept':
      return `${actorName} accepted your friend request`;
    case 'message':
      return `New message from ${actorName}`;
    default:
      return `${actorName} sent you a notification`;
  }
}

/**
 * Create a notification for `recipientId` caused by `actorId`. Resolves the
 * actor's display name from the users collection so callers stay simple.
 * Best-effort — never throws (a failed notification must not break the action
 * that triggered it). Skips self-notifications.
 */
export const createNotification = async (
  params: CreateNotificationParams,
): Promise<void> => {
  const {
    recipientId,
    actorId,
    type,
    preview = '',
    postId = '',
    conversationId = '',
    groupId = '',
  } = params;
  if (!recipientId || !actorId || recipientId === actorId) return;

  try {
    // Respect the recipient's notification preferences (default: all on).
    const recipientSnap = await firestore()
      .collection('users')
      .doc(recipientId)
      .get();
    const settings =
      (docExists(recipientSnap) ? recipientSnap.data()?.notificationSettings : null) ||
      {};
    const typeKey: Record<string, string> = {
      like: 'likes',
      comment: 'comments',
      friend_request: 'friendRequests',
      friend_accept: 'friendRequests',
      message: 'messages',
    };
    if (settings.push === false) return; // master switch off
    const key = typeKey[type];
    if (key && settings[key] === false) return; // this type is muted

    const actorSnap = await firestore().collection('users').doc(actorId).get();
    const actor = docExists(actorSnap) ? actorSnap.data() : {};
    const actorName =
      actor?.fullName || actor?.displayName || actor?.name || 'Someone';

    await firestore().collection('notifications').add({
      recipientId,
      actorId,
      type,
      title: buildTitle(type, actorName),
      subtitle: preview,
      postId,
      conversationId,
      groupId,
      isRead: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn('createNotification failed:', err);
  }
};

/**
 * Subscribe to a user's notifications in real-time (newest first). Sorted
 * client-side to avoid a composite index requirement.
 */
export const subscribeToNotifications = (
  recipientId: string,
  onUpdate: (items: UserAppNotification[]) => void,
) => {
  if (!recipientId) {
    onUpdate([]);
    return () => {};
  }
  return firestore()
    .collection('notifications')
    .where('recipientId', '==', recipientId)
    .onSnapshot(
      snapshot => {
        if (!snapshot) {
          onUpdate([]);
          return;
        }
        const items = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              _createdAt: data.createdAt,
              type: (data.type || 'message') as UserAppNotificationType,
              title: data.title || '',
              subtitle: data.subtitle || '',
              timeAgo: formatTimeAgo(data.createdAt),
              isRead: !!data.isRead,
              actorId: data.actorId,
              postId: data.postId,
              conversationId: data.conversationId,
              groupId: data.groupId,
            };
          })
          .sort((a, b) => {
            const at = a._createdAt?.seconds || 0;
            const bt = b._createdAt?.seconds || 0;
            return bt - at;
          })
          .map(({ _createdAt, ...rest }) => rest as UserAppNotification);
        onUpdate(items);
      },
      error => console.error('Notifications snapshot error:', error),
    );
};

/** Mark a single notification as read. */
export const markNotificationAsRead = async (
  notificationId: string,
): Promise<void> => {
  if (!notificationId) return;
  try {
    await firestore()
      .collection('notifications')
      .doc(notificationId)
      .update({ isRead: true });
  } catch (err) {
    console.warn('markNotificationAsRead failed:', err);
  }
};

/** Count of unread notifications, for a badge. */
export const subscribeToUnreadCount = (
  recipientId: string,
  onUpdate: (count: number) => void,
) => {
  if (!recipientId) {
    onUpdate(0);
    return () => {};
  }
  return firestore()
    .collection('notifications')
    .where('recipientId', '==', recipientId)
    .where('isRead', '==', false)
    .onSnapshot(
      snapshot => onUpdate(snapshot ? snapshot.size : 0),
      error => console.error('Unread count snapshot error:', error),
    );
};

export interface NotificationSettings {
  push?: boolean;
  email?: boolean;
  friendRequests?: boolean;
  groupInvites?: boolean;
  likes?: boolean;
  comments?: boolean;
  messages?: boolean;
}

/** Real-time subscription to a user's notification preferences. */
export const subscribeToNotificationSettings = (
  userId: string,
  onUpdate: (settings: NotificationSettings) => void,
) => {
  if (!userId) {
    onUpdate({});
    return () => {};
  }
  return firestore()
    .collection('users')
    .doc(userId)
    .onSnapshot(
      snap => onUpdate((snap?.data()?.notificationSettings as NotificationSettings) || {}),
      error => console.error('Notification settings snapshot error:', error),
    );
};

/** Merge a partial update into the user's notification preferences. */
export const updateNotificationSettings = async (
  userId: string,
  partial: NotificationSettings,
): Promise<void> => {
  if (!userId) return;
  await firestore()
    .collection('users')
    .doc(userId)
    .set({ notificationSettings: partial }, { merge: true });
};

/** Mark every unread notification for a user as read. */
export const markAllNotificationsRead = async (
  recipientId: string,
): Promise<void> => {
  if (!recipientId) return;
  try {
    const snap = await firestore()
      .collection('notifications')
      .where('recipientId', '==', recipientId)
      .where('isRead', '==', false)
      .get();
    if (!snap || snap.empty) return;
    const batch = firestore().batch();
    snap.docs.forEach(d => batch.update(d.ref, { isRead: true }));
    await batch.commit();
  } catch (err) {
    console.warn('markAllNotificationsRead failed:', err);
  }
};
