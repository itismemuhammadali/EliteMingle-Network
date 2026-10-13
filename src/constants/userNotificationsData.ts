export type UserAppNotificationType =
  | 'message'
  | 'like'
  | 'comment'
  | 'friend_request'
  | 'friend_accept'
  | 'warning';

export type UserAppNotification = {
  id: string;
  type: UserAppNotificationType;
  title: string;
  subtitle: string;
  /** e.g. "30m ago", "2h ago" */
  timeAgo: string;
  isRead: boolean;
  actorId?: string;
  postId?: string;
  conversationId?: string;
  groupId?: string;
};

export const USER_APP_NOTIFICATIONS: UserAppNotification[] = [
  {
    id: 'n1',
    type: 'message',
    title: 'New message from Sarah Johnson',
    subtitle: 'Thanks for the recommendation!',
    timeAgo: '30m ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'like',
    title: 'Mike Chen liked your post',
    subtitle: 'Your post about accessibility features',
    timeAgo: '2h ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'comment',
    title: 'New comment on your post',
    subtitle: 'Sarah Johnson: Beautiful! Which park is this?',
    timeAgo: '3h ago',
    isRead: true,
  },
];
