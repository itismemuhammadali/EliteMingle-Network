import type { UserFeedPost } from './userFeedData';
import type { UserProfileGroupRow } from './userProfileGroupsData';
import { USER_FRIENDS_LIST_MOCK } from './userFriendsListData';
import { USER_GROUP_DETAILS } from './userGroupsData';
import { SUGGESTED_PEOPLE } from './userPeopleYouMayKnowData';

/** Row in Friends / Groups tabs on another user’s public profile */
export type PublicProfileFriendRow = {
  id: string;
  name: string;
  subtitle: string;
  avatarUrl?: string;
  initials?: string;
  avatarColor?: string;
};

export type PublicUserProfile = {
  id: string;
  displayName: string;
  bio: string;
  coverUri: string;
  avatarUri: string | null;
  avatarInitials: string;
  mutualFriendsCount: number;
  avatarRingColor: string;
  posts: UserFeedPost[];
  friends: PublicProfileFriendRow[];
  groups: UserProfileGroupRow[];
};

const COVER_JAMES =
  'https://picsum.photos/seed/jamescover-future/1200/600';

const jamesPosts: UserFeedPost[] = [
  {
    id: 'pub-james-1',
    authorUserId: '1',
    userName: 'James Brown',
    userRole: 'Art Enthusiast',
    timeAgo: '1 hour ago',
    content:
      'Looking forward to our group meetup this weekend! We have some exciting activities planned. Who else is coming? Would love to see everyone there! 🎉',
    imageUrl: 'https://picsum.photos/seed/meetup-post/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    reactions: 210,
    comments: 30,
    shares: 15,
    avatarColor: '#4C7DFF',
  },
  {
    id: 'pub-james-2',
    authorUserId: '1',
    userName: 'James Brown',
    userRole: 'Art Enthusiast',
    timeAgo: '1 day ago',
    content:
      'Just finished this piece! The colors really came together in the studio today.',
    imageUrl: 'https://picsum.photos/seed/artstudio1/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    reactions: 42,
    comments: 8,
    shares: 3,
    avatarColor: '#4C7DFF',
  },
];

const jamesFriends: PublicProfileFriendRow[] = [
  {
    id: '3',
    name: 'Michael Chen',
    subtitle: 'Friend',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    subtitle: 'Friend',
    initials: 'SW',
    avatarColor: '#E91E63',
  },
  {
    id: '5',
    name: 'David Lee',
    subtitle: 'Friend',
    avatarUrl: 'https://i.pravatar.cc/150?img=52',
  },
];

const jamesGroups: UserProfileGroupRow[] = [
  {
    id: '1',
    name: 'Art Lovers',
    roleLabel: 'Group member',
    imageUrl: 'https://picsum.photos/seed/artloversgroup/240/240',
  },
  {
    id: '2',
    name: 'Book Club',
    roleLabel: 'Group member',
    imageUrl: 'https://picsum.photos/seed/bookclubgroup/240/240',
  },
  {
    id: '3',
    name: 'Music Together',
    roleLabel: 'Group member',
    imageUrl: 'https://picsum.photos/seed/musicgroup/240/240',
  },
];

const JAMES_PROFILE: PublicUserProfile = {
  id: 'u-james',
  displayName: 'James Brown',
  bio: 'Art lover 🎨 | Book enthusiast 📚 | Making friends and spreading joy!',
  coverUri: COVER_JAMES,
  avatarUri: 'https://i.pravatar.cc/150?img=12',
  avatarInitials: 'JB',
  mutualFriendsCount: 5,
  avatarRingColor: '#D4AF37',
  posts: jamesPosts,
  friends: jamesFriends,
  groups: jamesGroups,
};

const PROFILE_ENTRIES: Record<string, PublicUserProfile> = {
  '1': JAMES_PROFILE,
  'g1-m1': JAMES_PROFILE,
};

function initialsFromName(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) {
    return (p[0][0] + p[1][0]).toUpperCase();
  }
  return (p[0]?.slice(0, 2) ?? '?').toUpperCase();
}

function buildFallbackFromFriendList(userId: string): PublicUserProfile | undefined {
  const f = USER_FRIENDS_LIST_MOCK.find(x => x.id === userId);
  if (!f) {
    return undefined;
  }
  const initials = f.initials ?? initialsFromName(f.name);
  return {
    id: `u-friend-${f.id}`,
    displayName: f.name,
    bio: 'Community member · Thanks for visiting my profile!',
    coverUri: `https://picsum.photos/seed/pubcover-${f.id}/1200/600`,
    avatarUri: f.avatarUrl ?? null,
    avatarInitials: initials,
    mutualFriendsCount: f.mutualFriends,
    avatarRingColor: '#D4AF37',
    posts: [],
    friends: jamesFriends,
    groups: jamesGroups.slice(0, 2),
  };
}

function buildFromSuggestedPerson(userId: string): PublicUserProfile | undefined {
  const p = SUGGESTED_PEOPLE.find(x => x.id === userId);
  if (!p) {
    return undefined;
  }
  const initials = p.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    id: p.id,
    displayName: p.name,
    bio: p.bio,
    coverUri: `https://picsum.photos/seed/suggestedcover-${p.id}/1200/600`,
    avatarUri: p.avatarUrl,
    avatarInitials: initials,
    mutualFriendsCount: p.mutualFriendsCount,
    avatarRingColor: '#D4AF37',
    posts: [],
    friends: jamesFriends.slice(0, 2),
    groups: jamesGroups.slice(0, 2),
  };
}

function buildFallbackFromGroupMember(memberId: string): PublicUserProfile | undefined {
  for (const g of USER_GROUP_DETAILS) {
    const m = g.members.find(x => x.id === memberId);
    if (m) {
      return {
        id: memberId,
        displayName: m.name,
        bio: `${m.role} · ${g.name}`,
        coverUri: g.coverUri,
        avatarUri: m.avatarUri,
        avatarInitials: initialsFromName(m.name),
        mutualFriendsCount: 3,
        avatarRingColor: '#D4AF37',
        posts: [],
        friends: jamesFriends.slice(0, 2),
        groups: [
          {
            id: g.id,
            name: g.name,
            roleLabel: 'Group member',
            imageUrl: g.avatarUri,
          },
        ],
      };
    }
  }
  return undefined;
}

export function getPublicUserProfile(userId: string): PublicUserProfile | undefined {
  const direct = PROFILE_ENTRIES[userId];
  if (direct) {
    return direct;
  }
  const fromFriend = buildFallbackFromFriendList(userId);
  if (fromFriend) {
    return fromFriend;
  }
  const fromSuggested = buildFromSuggestedPerson(userId);
  if (fromSuggested) {
    return fromSuggested;
  }
  return buildFallbackFromGroupMember(userId);
}
