export type NotificationType = 'user' | 'product' | 'alert' | 'report';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'user',
    title: 'New User Registration',
    description: 'Sarah Johnson has created a new account',
    timestamp: '5 min ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'product',
    title: 'Product Approval Needed',
    description: 'Wireless Headphones is pending approval',
    timestamp: '15 min ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'alert',
    title: 'Low Stock Alert',
    description: 'Smart Watch stock is running low (5 items left)',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: '4',
    type: 'report',
    title: 'Monthly Report Ready',
    description: 'Your monthly analytics report is ready to view',
    timestamp: '2 hours ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'user',
    title: 'User Suspended',
    description: 'Mike Davis account has been suspended',
    timestamp: '3 hours ago',
    isRead: true,
  },
  {
    id: '6',
    type: 'product',
    title: 'New Product Listed',
    description: 'Bluetooth Speaker has been added to the catalog',
    timestamp: '5 hours ago',
    isRead: true,
  },
];
