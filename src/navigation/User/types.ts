import type { UserTab } from '../../components/user/UserBottomTabBar';

export type UserStackParamList = {
  /** `openTab` switches the bottom tab when landing on the main user shell. */
  UserMain: { openTab?: UserTab } | undefined;
  Notifications: undefined;
  CreateGroup: undefined;
  AccountSettings: undefined;
  PrivacySettings: undefined;
  BlockedUsers: undefined;
  UserChangePassword: undefined;
  EditProfile: undefined;
  OtherUserProfile: {
    userId: string;
  };
  GroupDetail: {
    groupId: string;
  };
  Chat: {
    peerId: string;
    peerName: string;
    peerAvatarUri: string;
    conversationId?: string;
    /** Default `Online` */
    statusText?: string;
    /** Green "Online" when true; muted when false (e.g. group member count). */
    isOnlineStatus?: boolean;
  };
  PostComments: {
    postId: string;
    authorName: string;
  };
  FindFriends: undefined;
  LegalDocument?: { documentType?: 'terms' | 'privacy' | 'eula' };
};
