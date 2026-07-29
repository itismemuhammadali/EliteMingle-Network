/** Create Post composer — max characters (inclusive). */
export const CREATE_POST_MAX_LENGTH = 500;

/** A mood/activity tag a user can attach to a post (Facebook-style "feeling"). */
export type PostFeeling = { emoji: string; label: string };

/** Preset feelings offered in the Create Post composer. */
export const POST_FEELINGS: PostFeeling[] = [
  { emoji: '😊', label: 'happy' },
  { emoji: '🥰', label: 'loved' },
  { emoji: '😎', label: 'cool' },
  { emoji: '🎉', label: 'excited' },
  { emoji: '😢', label: 'sad' },
  { emoji: '😡', label: 'angry' },
  { emoji: '😴', label: 'tired' },
  { emoji: '🤔', label: 'thoughtful' },
  { emoji: '😋', label: 'hungry' },
  { emoji: '🙏', label: 'blessed' },
  { emoji: '🎬', label: 'watching' },
  { emoji: '✈️', label: 'traveling' },
];

/** Format a feeling into its stored/display string, e.g. "😊 happy". */
export function formatFeeling(feeling: PostFeeling): string {
  return `${feeling.emoji} ${feeling.label}`;
}

export function getPostShareUrl(postId: string): string {
  return `https://najiyashade.app/post/${encodeURIComponent(postId)}`;
}

export type UserFeedFilter = 'friends' | 'nearby' | 'interests';

export type UserFeedPost = {
  id: string;
  /** Profile navigation target in the user stack */
  authorUserId: string;
  userName: string;
  userRole: string;
  timeAgo: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrl?: string;
  localUri?: string;
  /** 'image' | 'video' | 'none' — drives which player renders the media. */
  mediaType?: string;
  /** Optional mood/activity tag, stored as "😊 happy". */
  feeling?: string;
  /** Circular avatar image (remote URL). */
  avatarUrl?: string;
  reactions: number;
  comments: number;
  shares: number;
  /** Fallback when `avatarUrl` is missing */
  avatarColor: string;
};

export const USER_FEED_POSTS: UserFeedPost[] = [
  {
    id: '1',
    authorUserId: '1',
    userName: 'James Brown',
    userRole: 'Community Member',
    timeAgo: '1 hour ago',
    content:
      'Great game last night! The energy in the arena was incredible. Looking forward to the playoffs!',
    imageUrl: 'https://picsum.photos/seed/basketball/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    reactions: 210,
    comments: 30,
    shares: 15,
    avatarColor: '#4C7DFF',
  },
  {
    id: '2',
    authorUserId: '3',
    userName: 'Michael Chen',
    userRole: 'Community Member',
    timeAgo: '3 hours ago',
    content:
      'Art workshop this weekend was amazing! So many talented people in our community.',
    imageUrl: 'https://picsum.photos/seed/paint/800/480',
    avatarUrl: 'https://i.pravatar.cc/150?img=59',
    reactions: 156,
    comments: 22,
    shares: 8,
    avatarColor: '#E53935',
  },
];
