/** Max length for profile bio (Edit Profile). */
export const USER_PROFILE_BIO_MAX = 150;

export type UserProfileState = {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  coverUri: string;
  /** Remote or file URI; `null` shows initials on purple in the profile header. */
  avatarUri: string | null;
};

/** Default profile — also used to seed `UserProfileProvider`. */
export const DEFAULT_USER_PROFILE: UserProfileState = {
  displayName: 'Najjiyah Shade',
  email: 'your@email.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, NY',
  bio: 'Creative person who loves art, books, and making new friends! 🎨📚',
  coverUri: 'https://picsum.photos/seed/najprofilecover/1200/600',
  avatarUri: 'https://i.pravatar.cc/400?img=47',
};

/** @deprecated Use `DEFAULT_USER_PROFILE` or `useUserProfile().profile` */
export const USER_PROFILE_MOCK = DEFAULT_USER_PROFILE;
