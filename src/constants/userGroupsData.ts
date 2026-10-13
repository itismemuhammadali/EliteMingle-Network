import type { UserFeedPost } from './userFeedData';

export type UserGroupMock = {
  id: string;
  name: string;
  memberCount: number;
  /** Pastel background for the large group icon square (grid cards) */
  iconBackgroundColor: string;
  coverUri?: string;
  avatarUri?: string;
};

export type GroupMemberRole = 'Admin' | 'Moderator' | 'Member';

export type UserGroupMember = {
  id: string;
  name: string;
  role: GroupMemberRole;
  avatarUri: string;
};

export type UserGroupDetail = UserGroupMock & {
  description: string;
  coverUri: string;
  avatarUri: string;
  posts: UserFeedPost[];
  members: UserGroupMember[];
};

export const USER_GROUPS: UserGroupMock[] = [
  {
    id: '1',
    name: 'Art Lovers',
    memberCount: 24,
    iconBackgroundColor: '#90CAF9',
  },
  {
    id: '2',
    name: 'Book Club',
    memberCount: 18,
    iconBackgroundColor: '#F48FB1',
  },
  {
    id: '3',
    name: 'Music Together',
    memberCount: 31,
    iconBackgroundColor: '#CE93D8',
  },
  {
    id: '4',
    name: 'Cooking Class',
    memberCount: 15,
    iconBackgroundColor: '#FFCC80',
  },
  {
    id: '5',
    name: 'Sports & Games',
    memberCount: 27,
    iconBackgroundColor: '#A5D6A7',
  },
  {
    id: '6',
    name: 'Movie Night',
    memberCount: 22,
    iconBackgroundColor: '#9FA8DA',
  },
];

const artPosts: UserFeedPost[] = [
  {
    id: 'g1-p1',
    authorUserId: 'g1-m1',
    userName: 'James Brown',
    userRole: 'Art Enthusiast',
    timeAgo: '2 hours ago',
    content:
      'Just finished this piece! The colors really came together in the studio today.',
    imageUrl: 'https://picsum.photos/seed/artstudio1/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    reactions: 42,
    comments: 8,
    shares: 3,
    avatarColor: '#4C7DFF',
  },
  {
    id: 'g1-p2',
    authorUserId: 'g1-m5',
    userName: 'Sarah Chen',
    userRole: 'Art Enthusiast',
    timeAgo: '5 hours ago',
    content:
      'Sharing some inspiration from the gallery opening last weekend. So much talent!',
    imageUrl: 'https://picsum.photos/seed/gallery/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    reactions: 28,
    comments: 5,
    shares: 2,
    avatarColor: '#E91E63',
  },
];

const bookPosts: UserFeedPost[] = [
  {
    id: 'g2-p1',
    authorUserId: 'g2-m1',
    userName: 'Emma Wilson',
    userRole: 'Book Club Member',
    timeAgo: '1 hour ago',
    content:
      'This month we are reading "The Midnight Library" — who else is joining the discussion?',
    imageUrl: 'https://picsum.photos/seed/bookshelf/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    reactions: 19,
    comments: 12,
    shares: 1,
    avatarColor: '#7C3AED',
  },
];

const musicPosts: UserFeedPost[] = [
  {
    id: 'g3-p1',
    authorUserId: 'g3-m1',
    userName: 'Alex Rivera',
    userRole: 'Musician',
    timeAgo: '3 hours ago',
    content:
      'Jam session tonight at 7 — bring your instruments or just come listen!',
    imageUrl: 'https://picsum.photos/seed/guitar/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    reactions: 55,
    comments: 14,
    shares: 6,
    avatarColor: '#FF9800',
  },
];

const cookingPosts: UserFeedPost[] = [
  {
    id: 'g4-p1',
    authorUserId: 'g4-m1',
    userName: 'Maria Santos',
    userRole: 'Home Chef',
    timeAgo: '4 hours ago',
    content:
      'Tried a new pasta recipe — the secret is fresh basil and patience.',
    imageUrl: 'https://picsum.photos/seed/pasta/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    reactions: 33,
    comments: 9,
    shares: 4,
    avatarColor: '#43A047',
  },
];

const sportsPosts: UserFeedPost[] = [
  {
    id: 'g5-p1',
    authorUserId: 'g5-m1',
    userName: 'Jordan Lee',
    userRole: 'Sports Fan',
    timeAgo: '6 hours ago',
    content:
      'What a game last night! That final play was unforgettable.',
    imageUrl: 'https://picsum.photos/seed/basketball2/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=22',
    reactions: 88,
    comments: 20,
    shares: 11,
    avatarColor: '#1E88E5',
  },
];

const moviePosts: UserFeedPost[] = [
  {
    id: 'g6-p1',
    authorUserId: 'g6-m1',
    userName: 'Chris Taylor',
    userRole: 'Film Buff',
    timeAgo: '1 day ago',
    content:
      'No spoilers, but the new thriller everyone is talking about is worth the ticket.',
    imageUrl: 'https://picsum.photos/seed/cinema/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    reactions: 61,
    comments: 18,
    shares: 7,
    avatarColor: '#5C6BC0',
  },
];

export const USER_GROUP_DETAILS: UserGroupDetail[] = [
  {
    ...USER_GROUPS[0],
    description:
      'A community for art enthusiasts to share their creations and inspiration',
    coverUri: 'https://picsum.photos/seed/groupcover-art/1200/600',
    avatarUri: 'https://picsum.photos/seed/groupavatar-art/400/400',
    posts: artPosts,
    members: [
      {
        id: 'g1-m1',
        name: 'James Brown',
        role: 'Moderator',
        avatarUri: 'https://i.pravatar.cc/150?img=12',
      },
      {
        id: 'g1-m2',
        name: 'Sarah Johnson',
        role: 'Admin',
        avatarUri: 'https://i.pravatar.cc/150?img=32',
      },
      {
        id: 'g1-m3',
        name: 'Michael Smith',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=11',
      },
      {
        id: 'g1-m4',
        name: 'Anna Taylor',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=5',
      },
      {
        id: 'g1-m5',
        name: 'Sarah Chen',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=44',
      },
      {
        id: 'g1-m6',
        name: 'Michael Lee',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=68',
      },
      {
        id: 'g1-m7',
        name: 'Emma Wilson',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=45',
      },
      {
        id: 'g1-m8',
        name: 'David Park',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=59',
      },
    ],
  },
  {
    ...USER_GROUPS[1],
    description:
      'Monthly reads, lively discussions, and a welcoming space for every reader.',
    coverUri: 'https://picsum.photos/seed/groupcover-book/1200/600',
    avatarUri: 'https://picsum.photos/seed/groupavatar-book/400/400',
    posts: bookPosts,
    members: [
      {
        id: 'g2-m1',
        name: 'Emma Wilson',
        role: 'Admin',
        avatarUri: 'https://i.pravatar.cc/150?img=45',
      },
      {
        id: 'g2-m2',
        name: 'Robert King',
        role: 'Moderator',
        avatarUri: 'https://i.pravatar.cc/150?img=13',
      },
      {
        id: 'g2-m3',
        name: 'Nina Patel',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=16',
      },
      {
        id: 'g2-m4',
        name: 'Sam Rivera',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=27',
      },
    ],
  },
  {
    ...USER_GROUPS[2],
    description:
      'Connect with fellow musicians and music lovers in your community.',
    coverUri: 'https://picsum.photos/seed/groupcover-music/1200/600',
    avatarUri: 'https://picsum.photos/seed/groupavatar-music/400/400',
    posts: musicPosts,
    members: [
      {
        id: 'g3-m1',
        name: 'Alex Rivera',
        role: 'Admin',
        avatarUri: 'https://i.pravatar.cc/150?img=15',
      },
      {
        id: 'g3-m2',
        name: 'Jamie Fox',
        role: 'Moderator',
        avatarUri: 'https://i.pravatar.cc/150?img=22',
      },
      {
        id: 'g3-m3',
        name: 'Casey Kim',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=33',
      },
      {
        id: 'g3-m4',
        name: 'Morgan Blake',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=52',
      },
    ],
  },
  {
    ...USER_GROUPS[3],
    description:
      'Recipes, tips, and kitchen experiments — cook together, learn together.',
    coverUri: 'https://picsum.photos/seed/groupcover-cook/1200/600',
    avatarUri: 'https://picsum.photos/seed/groupavatar-cook/400/400',
    posts: cookingPosts,
    members: [
      {
        id: 'g4-m1',
        name: 'Maria Santos',
        role: 'Admin',
        avatarUri: 'https://i.pravatar.cc/150?img=47',
      },
      {
        id: 'g4-m2',
        name: 'Chef Dan',
        role: 'Moderator',
        avatarUri: 'https://i.pravatar.cc/150?img=14',
      },
      {
        id: 'g4-m3',
        name: 'Priya Shah',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=38',
      },
    ],
  },
  {
    ...USER_GROUPS[4],
    description:
      'Game highlights, pickup games, and fitness motivation for everyone.',
    coverUri: 'https://picsum.photos/seed/groupcover-sport/1200/600',
    avatarUri: 'https://picsum.photos/seed/groupavatar-sport/400/400',
    posts: sportsPosts,
    members: [
      {
        id: 'g5-m1',
        name: 'Jordan Lee',
        role: 'Admin',
        avatarUri: 'https://i.pravatar.cc/150?img=22',
      },
      {
        id: 'g5-m2',
        name: 'Taylor Brooks',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=29',
      },
      {
        id: 'g5-m3',
        name: 'Riley Moore',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=61',
      },
    ],
  },
  {
    ...USER_GROUPS[5],
    description:
      'Watch parties, reviews, and recommendations for film lovers.',
    coverUri: 'https://picsum.photos/seed/groupcover-movie/1200/600',
    avatarUri: 'https://picsum.photos/seed/groupavatar-movie/400/400',
    posts: moviePosts,
    members: [
      {
        id: 'g6-m1',
        name: 'Chris Taylor',
        role: 'Admin',
        avatarUri: 'https://i.pravatar.cc/150?img=68',
      },
      {
        id: 'g6-m2',
        name: 'Pat Morgan',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=41',
      },
      {
        id: 'g6-m3',
        name: 'Jamie Lee',
        role: 'Member',
        avatarUri: 'https://i.pravatar.cc/150?img=53',
      },
    ],
  },
];

export function getUserGroupDetailById(
  id: string,
): UserGroupDetail | undefined {
  return USER_GROUP_DETAILS.find(g => g.id === id);
}
