export type CreateGroupCategoryId =
  | 'art'
  | 'books'
  | 'music'
  | 'sports'
  | 'games'
  | 'cooking'
  | 'movies'
  | 'other';

export interface CreateGroupCategoryItem {
  id: CreateGroupCategoryId;
  label: string;
  /** Background behind the icon glyph */
  iconBg: string;
  /** Emoji to display */
  emoji: string;
}

export const CREATE_GROUP_CATEGORIES: CreateGroupCategoryItem[] = [
  {
    id: 'art',
    label: 'Art & Creativity',
    iconBg: '#9A40BA',
    emoji: '🎨',
  },
  {
    id: 'books',
    label: 'Books & Reading',
    iconBg: '#64B5F6',
    emoji: '📚',
  },
  {
    id: 'music',
    label: 'Music',
    iconBg: '#EC407A',
    emoji: '🎵',
  },
  {
    id: 'sports',
    label: 'Sports & Fitness',
    iconBg: '#66BB6A',
    emoji: '⚽',
  },
  {
    id: 'games',
    label: 'Games & Fun',
    iconBg: '#FF9800',
    emoji: '🎮',
  },
  {
    id: 'cooking',
    label: 'Cooking & Food',
    iconBg: '#FF7043',
    emoji: '🍳',
  },
  {
    id: 'movies',
    label: 'Movies & TV',
    iconBg: '#3949AB',
    emoji: '🎬',
  },
  {
    id: 'other',
    label: 'Other',
    iconBg: '#78909C',
    emoji: '✨',
  },
];

export function getCreateGroupCategoryLabel(
  id: CreateGroupCategoryId | null | undefined,
): string | undefined {
  if (!id) {
    return undefined;
  }
  return CREATE_GROUP_CATEGORIES.find(c => c.id === id)?.label;
}
