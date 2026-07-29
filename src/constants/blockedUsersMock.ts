export type BlockedUserMock = {
  id: string;
  name: string;
  initials: string;
  /** Display string e.g. "Blocked 2 weeks ago" */
  blockedLabel: string;
};

export const BLOCKED_USERS_MOCK: BlockedUserMock[] = [
  {
    id: '1',
    name: 'John Doe',
    initials: 'JD',
    blockedLabel: 'Blocked 2 weeks ago',
  },
  {
    id: '2',
    name: 'Jane Smith',
    initials: 'JS',
    blockedLabel: 'Blocked 1 month ago',
  },
];
