import firestore from '@react-native-firebase/firestore';
import type { BlockedUserMock } from '../constants/blockedUsersMock';
import { formatTimeAgo } from '../utils/timeAgo';

/**
 * Blocks live under each user: users/{uid}/blocked/{targetId}.
 * Reports live in a top-level `reports` collection for admin/moderator review.
 */

const docExists = (snap: any): boolean =>
  typeof snap?.exists === 'function' ? snap.exists() : !!snap?.exists;

const initialsOf = (name?: string | null): string => {
  const safe = (name || '').trim();
  if (!safe) return 'U';
  return (
    safe
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  );
};

const blockedLabel = (createdAt: any): string => {
  try {
    if (!createdAt?.toDate) return 'Blocked recently';
    const days = Math.floor(
      (Date.now() - createdAt.toDate().getTime()) / 86400000,
    );
    if (days <= 0) return 'Blocked today';
    if (days === 1) return 'Blocked yesterday';
    if (days < 7) return `Blocked ${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `Blocked ${weeks} week${weeks === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30);
    return `Blocked ${months} month${months === 1 ? '' : 's'} ago`;
  } catch {
    return 'Blocked recently';
  }
};

/** Block a user — hides their posts from the blocker's feed. */
export const blockUser = async (
  currentUserId: string,
  targetUserId: string,
): Promise<void> => {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;
  await firestore()
    .collection('users')
    .doc(currentUserId)
    .collection('blocked')
    .doc(targetUserId)
    .set({
      targetId: targetUserId,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
};

/** Remove a block. */
export const unblockUser = async (
  currentUserId: string,
  targetUserId: string,
): Promise<void> => {
  if (!currentUserId || !targetUserId) return;
  await firestore()
    .collection('users')
    .doc(currentUserId)
    .collection('blocked')
    .doc(targetUserId)
    .delete();
};

/** Real-time set of user ids the current user has blocked (for filtering). */
export const subscribeToBlockedIds = (
  currentUserId: string,
  onUpdate: (ids: Set<string>) => void,
) => {
  if (!currentUserId) {
    onUpdate(new Set());
    return () => {};
  }
  return firestore()
    .collection('users')
    .doc(currentUserId)
    .collection('blocked')
    .onSnapshot(
      snap => onUpdate(new Set(snap ? snap.docs.map(d => d.id) : [])),
      error => console.error('Blocked ids snapshot error:', error),
    );
};

/** Real-time blocked-users list (with profile info) for the Blocked Users screen. */
export const subscribeToBlockedUsers = (
  currentUserId: string,
  onUpdate: (users: BlockedUserMock[]) => void,
) => {
  if (!currentUserId) {
    onUpdate([]);
    return () => {};
  }
  return firestore()
    .collection('users')
    .doc(currentUserId)
    .collection('blocked')
    .onSnapshot(
      async snap => {
        if (!snap || snap.empty) {
          onUpdate([]);
          return;
        }
        const list = await Promise.all(
          snap.docs.map(async d => {
            const uDoc = await firestore().collection('users').doc(d.id).get();
            const u = docExists(uDoc) ? uDoc.data() || {} : {};
            const name = u.fullName || u.displayName || u.name || 'User';
            return {
              id: d.id,
              name,
              initials: initialsOf(name),
              blockedLabel: blockedLabel(d.data()?.createdAt),
            } as BlockedUserMock;
          }),
        );
        onUpdate(list);
      },
      error => console.error('Blocked users snapshot error:', error),
    );
};

/**
 * Admin: send a warning to a user (delivers an in-app notification directly,
 * bypassing the user's notification preferences).
 */
export const sendWarningToUser = async (
  userId: string,
  reason = 'Your content was flagged. Please review the community guidelines.',
): Promise<void> => {
  if (!userId) return;
  await firestore().collection('notifications').add({
    recipientId: userId,
    actorId: 'system',
    type: 'warning',
    title: '⚠️ Warning from moderators',
    subtitle: reason,
    postId: '',
    isRead: false,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
};

/** Admin: set a user's account status (e.g. block/suspend → 'inactive'). */
export const setUserStatus = async (
  userId: string,
  status: 'active' | 'inactive' | 'pending',
): Promise<void> => {
  if (!userId) return;
  await firestore()
    .collection('users')
    .doc(userId)
    .set({ status }, { merge: true });
};

/**
 * Admin notifications feed, derived from real events: content reports and new
 * user signups, merged newest-first. Each item is Notification-shaped
 * ({id, type, title, description, timestamp, isRead}) plus a `_s` sort key.
 */
export const subscribeToAdminNotifications = (
  onUpdate: (items: any[]) => void,
) => {
  let reports: any[] = [];
  let signups: any[] = [];
  const emit = () =>
    onUpdate([...reports, ...signups].sort((a, b) => (b._s || 0) - (a._s || 0)));

  const unsubReports = firestore()
    .collection('reports')
    .onSnapshot(
      snap => {
        reports = (snap ? snap.docs : []).map(d => {
          const x = d.data();
          return {
            id: `r_${d.id}`,
            type: 'report',
            title: 'Content reported',
            description: `A ${x.targetType || 'post'} was reported${
              x.reason ? `: ${x.reason}` : ''
            }`,
            timestamp: formatTimeAgo(x.createdAt),
            isRead: false,
            _s: x.createdAt?.seconds || 0,
            targetId: x.targetId,
            targetType: x.targetType || 'post',
            authorId: x.authorId,
          };
        });
        emit();
      },
      e => console.error('Admin reports notif error:', e),
    );

  const unsubUsers = firestore()
    .collection('users')
    .onSnapshot(
      snap => {
        signups = (snap ? snap.docs : [])
          .map(d => ({ id: d.id, x: d.data() }))
          .filter(({ x }) => x.createdAt)
          .sort((a, b) => (b.x.createdAt?.seconds || 0) - (a.x.createdAt?.seconds || 0))
          .slice(0, 10)
          .map(({ id, x }) => ({
            id: `u_${id}`,
            type: 'user',
            title: 'New User Registration',
            description: `${x.fullName || x.displayName || 'A user'} created a new account`,
            timestamp: formatTimeAgo(x.createdAt),
            isRead: false,
            _s: x.createdAt?.seconds || 0,
            targetId: id,
            targetType: 'user',
            userId: id,
          }));
        emit();
      },
      e => console.error('Admin signups notif error:', e),
    );

  return () => {
    unsubReports();
    unsubUsers();
  };
};

export interface ReportParams {
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  /** The author/owner of the reported content, if known. */
  authorId?: string;
  authorName?: string;
  reason?: string;
  details?: string;
  contentSnippet?: string;
}

/**
 * File a report for admin/moderator review. Best-effort.
 */
export const reportContent = async (params: ReportParams): Promise<void> => {
  const {
    reporterId,
    targetType,
    targetId,
    authorId = '',
    authorName = '',
    reason = 'Inappropriate content',
    details = '',
    contentSnippet = '',
  } = params;
  if (!reporterId || !targetId) return;
  await firestore().collection('reports').add({
    reporterId,
    targetType,
    targetId,
    authorId,
    authorName,
    reason,
    details,
    contentSnippet,
    status: 'pending',
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
};
