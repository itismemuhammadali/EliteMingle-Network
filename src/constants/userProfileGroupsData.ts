export type UserProfileGroupRow = {
  id: string;
  name: string;
  /** e.g. "Group member", "Admin" */
  roleLabel: string;
  /** Square thumbnail */
  imageUrl: string;
};

export const USER_PROFILE_GROUPS_MOCK: UserProfileGroupRow[] = [
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
