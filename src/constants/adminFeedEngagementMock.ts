import { MOCK_USERS } from './mockData';

export type FeedEngagementKind = 'likes' | 'comments' | 'shares';

export type FeedEngagementPerson = {
  rowId: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  avatarColor: string;
  /** Secondary line (time or context) */
  subtitle: string;
  /** Only for comments — post excerpt */
  detail?: string;
};

const LIKE_TIMES = [
  'Reacted · 12m ago',
  'Reacted · 1h ago',
  'Reacted · 3h ago',
  'Reacted · 5h ago',
  'Reacted · 1d ago',
];

const SHARE_META = [
  'Shared to feed · 2h ago',
  'Shared · 4h ago',
  'Reposted · 6h ago',
  'Shared · 1d ago',
];

const COMMENT_SNIPPETS: Record<string, string[]> = {
  '1': [
    'So glad the event went well!',
    'Love this energy from the community.',
    'Wish I could have been there!',
  ],
  '2': [
    'Count me in for the workshop!',
    'What time does it start?',
    'Will slides be available afterward?',
  ],
  '3': [
    'Welcome to the community!',
    'Great to have you here.',
    'Looking forward to your posts.',
  ],
};

function userByIndex(i: number) {
  return MOCK_USERS[i % MOCK_USERS.length];
}

/** Representative sample rows for admin review (not full counts). */
export function getFeedEngagementPeople(
  postId: string,
  kind: FeedEngagementKind,
): FeedEngagementPerson[] {
  const snippets = COMMENT_SNIPPETS[postId] ?? COMMENT_SNIPPETS['1'];
  const count = kind === 'comments' ? Math.min(6, snippets.length + 3) : 8;

  return Array.from({ length: count }, (_, i) => {
    const u = userByIndex(i);
    const rowId = `${postId}-${kind}-${i}`;

    if (kind === 'likes') {
      return {
        rowId,
        userId: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        avatarColor: '#4C7DFF',
        subtitle: LIKE_TIMES[i % LIKE_TIMES.length],
      };
    }

    if (kind === 'shares') {
      return {
        rowId,
        userId: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        avatarColor: '#2ECC71',
        subtitle: SHARE_META[i % SHARE_META.length],
      };
    }

    const text = snippets[i % snippets.length];
    return {
      rowId,
      userId: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      avatarColor: '#9A40BA',
      subtitle: ['2h ago', '4h ago', '6h ago', '1d ago', '2d ago'][i % 5],
      detail: text,
    };
  });
}
