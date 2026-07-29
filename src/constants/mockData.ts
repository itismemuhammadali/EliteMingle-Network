import type { NewsPost } from '../components/admin/NewsPostCard';

export interface UserProfile {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Pending';
  role: string;
  email: string;
  phone: string;
  memberSince: string;
  avatarUrl: string;
  recentPosts: Array<{
    id: string;
    content: string;
    timeAgo: string;
    likes: number;
    comments: number;
  }>;
  /** Total engagement stats for Activity Overview */
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

export const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    name: 'John Smith',
    status: 'Active',
    role: 'Manager',
    email: 'john.smith@example.com',
    phone: '+1 234-567-8901',
    memberSince: 'February 20, 2024',
    avatarUrl: 'https://i.pravatar.cc/300?u=john-smith',
    recentPosts: [
      {
        id: '1',
        content:
          "Just finished reading 'The Midnight Library' - such an inspiring story! It really made me think about the choices we make in life. Would love to hear your book recommendations. 📚",
        timeAgo: '2 hours ago',
        likes: 289,
        comments: 56,
      },
    ],
    totalLikes: 156,
    totalComments: 34,
    totalShares: 12,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    status: 'Active',
    role: 'Community Member',
    email: 'sarah.j@example.com',
    phone: '+1 234-567-8902',
    memberSince: 'March 15, 2024',
    avatarUrl: 'https://i.pravatar.cc/300?u=sarah-johnson',
    recentPosts: [
      {
        id: '2',
        content:
          "Excited to announce that I will be hosting a workshop next week. Looking forward to connecting with all of you...",
        timeAgo: '2 hours ago',
        likes: 289,
        comments: 56,
      },
    ],
    totalLikes: 289,
    totalComments: 56,
    totalShares: 23,
  },
  {
    id: '3',
    name: 'Mike Davis',
    status: 'Pending',
    role: 'New Member',
    email: 'mike.davis@example.com',
    phone: '+1 234-567-8903',
    memberSince: 'January 10, 2025',
    avatarUrl: 'https://i.pravatar.cc/300?u=mike-davis',
    recentPosts: [
      {
        id: '3',
        content:
          'Hello everyone! Just joined the community and excited to be here. Hope to learn and share with you all...',
        timeAgo: '5 hours ago',
        likes: 12,
        comments: 8,
      },
    ],
    totalLikes: 12,
    totalComments: 8,
    totalShares: 2,
  },
];

export const MOCK_NEWS_POSTS: NewsPost[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Smith',
    status: 'Premium Member',
    timeAgo: '1 day ago',
    content:
      'Just shared an amazing experience at the new community event. The atmosphere was incredible and everyone was so welcoming!',
    likes: 156,
    comments: 34,
    shares: 12,
    avatarColor: '#4C7DFF',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sarah Johnson',
    status: 'Community Member',
    timeAgo: '2 hours ago',
    content:
      'Excited to announce that I will be hosting a workshop next week. Looking forward to connecting with all of you...',
    likes: 289,
    comments: 56,
    shares: 23,
    avatarColor: '#2ECC71',
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Davis',
    status: 'New Member',
    timeAgo: '5 hours ago',
    content:
      'Hello everyone! Just joined the community and excited to be here. Hope to learn and share with you all...',
    likes: 12,
    comments: 8,
    shares: 2,
    hasWarning: true,
    avatarColor: '#9A40BA',
  },
];
