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
  voiceCommandsEnabled?: boolean;
  ttsEnabled?: boolean;
};

/** Default profile — also used to seed `UserProfileProvider`. */
export const DEFAULT_USER_PROFILE: UserProfileState = {
  displayName: 'User',
  email: '',
  phone: '',
  location: '',
  bio: '',
  coverUri: '',
  avatarUri: null,
  voiceCommandsEnabled: false,
  ttsEnabled: false,
};

/** @deprecated Use `DEFAULT_USER_PROFILE` or `useUserProfile().profile` */
export const USER_PROFILE_MOCK = DEFAULT_USER_PROFILE;
