import type { UserFeedFilter } from './userFeedData';

export type SuggestedPerson = {
  id: string;
  name: string;
  avatarUrl: string;
  mutualFriendsCount: number;
  location: string;
  bio: string;
  interests: string[];
  isOnline: boolean;
  /** Shown on the Nearby tab */
  nearby: boolean;
  /** Shown on the Interests tab */
  interestsMatch: boolean;
};

export const SUGGESTED_PEOPLE: SuggestedPerson[] = [
  {
    id: 'alex-martinez',
    name: 'Alex Martinez',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    mutualFriendsCount: 8,
    location: 'San Francisco, CA',
    bio: 'Love painting and photography! 📸🎨',
    interests: ['Art', 'Photography', 'Music'],
    isOnline: true,
    nearby: true,
    interestsMatch: true,
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    mutualFriendsCount: 12,
    location: 'Oakland, CA',
    bio: 'Runner • Coffee enthusiast ☕',
    interests: ['Fitness', 'Coffee', 'Travel'],
    isOnline: true,
    nearby: true,
    interestsMatch: false,
  },
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    mutualFriendsCount: 5,
    location: 'Seattle, WA',
    bio: 'Building things with code and curiosity.',
    interests: ['Tech', 'Music', 'Gaming'],
    isOnline: false,
    nearby: false,
    interestsMatch: true,
  },
  {
    id: 'morgan-taylor',
    name: 'Morgan Taylor',
    avatarUrl: 'https://i.pravatar.cc/150?img=27',
    mutualFriendsCount: 15,
    location: 'Austin, TX',
    bio: 'Foodie & weekend chef 🍳',
    interests: ['Cooking', 'Travel', 'Art'],
    isOnline: true,
    nearby: false,
    interestsMatch: true,
  },
  {
    id: 'sam-wilson',
    name: 'Sam Wilson',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    mutualFriendsCount: 3,
    location: 'San Jose, CA',
    bio: 'Outdoors and good books.',
    interests: ['Hiking', 'Reading'],
    isOnline: false,
    nearby: true,
    interestsMatch: false,
  },
];

export function filterSuggestedPeople(
  people: SuggestedPerson[],
  filter: UserFeedFilter,
): SuggestedPerson[] {
  if (filter === 'friends') {
    return people;
  }
  if (filter === 'nearby') {
    return people.filter(p => p.nearby);
  }
  return people.filter(p => p.interestsMatch);
}

export const PEOPLE_YOU_MAY_KNOW_SUBTITLE: Record<UserFeedFilter, string> = {
  friends: 'Based on mutual friends and shared interests',
  nearby: 'Based on your location friends',
  interests: 'Based on your shared interests',
};

export const PEOPLE_YOU_MAY_KNOW_TITLE: Record<UserFeedFilter, string> = {
  friends: 'People You May Know',
  nearby: 'People Nearby 50 Km',
  interests: 'People With Similar Interests',
};
