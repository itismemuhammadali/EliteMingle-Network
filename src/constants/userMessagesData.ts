export type UserMessageListItem =
  | {
      id: string;
      peerId?: string;
      variant?: 'direct';
      name: string;
      preview: string;
      time: string;
      avatarUri: string;
      unreadCount?: number;
    }
  | {
      id: string;
      variant: 'group';
      name: string;
      preview: string;
      memberLabel: string;
      avatarUris: string[];
    };

export const USER_MESSAGE_THREADS: UserMessageListItem[] = [];
