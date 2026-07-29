export type UserFriendListItem = {
  id: string;
  name: string;
  mutualFriends: number;
  /** Remote avatar; omit when using initials */
  avatarUrl?: string;
  /** Two-letter initials when no photo */
  initials?: string;
  /** Background for initials avatar */
  avatarColor?: string;
  isOnline: boolean;
};

export const USER_FRIENDS_LIST_MOCK: UserFriendListItem[] = [
  {
    id: '1',
    name: 'James Brown',
    mutualFriends: 5,
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Anna Taylor',
    mutualFriends: 6,
    initials: 'AT',
    avatarColor: '#2563EB',
    isOnline: true,
  },
  {
    id: '3',
    name: 'Michael Chen',
    mutualFriends: 3,
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    isOnline: false,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    mutualFriends: 8,
    initials: 'SW',
    avatarColor: '#E91E63',
    isOnline: true,
  },
  {
    id: '5',
    name: 'David Lee',
    mutualFriends: 2,
    avatarUrl: 'https://i.pravatar.cc/150?img=52',
    isOnline: false,
  },
  {
    id: '6',
    name: 'Emma Wilson',
    mutualFriends: 12,
    initials: 'EW',
    avatarColor: '#7C3AED',
    isOnline: true,
  },
];
