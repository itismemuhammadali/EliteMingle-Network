export type PostCommentItem = {
  id: string;
  authorName: string;
  body: string;
  timeAgo: string;
  avatarUrl?: string;
  avatarColor?: string;
  initials?: string;
};

export function getDummyCommentsForPost(postId: string): PostCommentItem[] {
  return [
    {
      id: `${postId}-c1`,
      authorName: 'Alex Rivera',
      body: 'This is great — thanks for sharing!',
      timeAgo: '12m ago',
      avatarUrl: 'https://i.pravatar.cc/150?img=15',
    },
    {
      id: `${postId}-c2`,
      authorName: 'Sam Lee',
      body: 'Totally agree. Looking forward to more updates.',
      timeAgo: '1h ago',
      initials: 'SL',
      avatarColor: '#2563EB',
    },
    {
      id: `${postId}-c3`,
      authorName: 'Jordan Kim',
      body: 'Nice post! 👏',
      timeAgo: '3h ago',
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
    },
  ];
}
