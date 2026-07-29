export interface HelpContactItem {
  id: string;
  title: string;
  value: string;
  type: 'email' | 'phone';
}

export interface HelpFaqItem {
  id: string;
  question: string;
  answerPreview: string;
}

export interface SupportHoursSchedule {
  id: string;
  label: string;
}

export const HELP_CONTACT_ITEMS: HelpContactItem[] = [
  {
    id: 'email',
    type: 'email',
    title: 'Email Support',
    value: 'support@adminapp.com',
  },
  {
    id: 'phone',
    type: 'phone',
    title: 'Phone Support',
    value: '+1 (234) 567-8900',
  },
];

export const HELP_FAQ_ITEMS: HelpFaqItem[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answerPreview:
      'Go to Settings > Security > Change Password to update your password securely.',
  },
  {
    id: '2',
    question: 'How can I enable two-factor authentication?',
    answerPreview:
      'Open Settings > Security and toggle Two-Factor Auth to add an extra layer of protection.',
  },
  {
    id: '3',
    question: 'How do I manage user permissions?',
    answerPreview:
      'Navigate to Users, select a user, then use Manage User to adjust roles and access.',
  },
  {
    id: '4',
    question: 'How do I add a new product?',
    answerPreview:
      'Use the Products section in the admin dashboard to create and submit new listings.',
  },
  {
    id: '5',
    question: 'How can I view analytics and reports?',
    answerPreview:
      'Open the Reports tab to see charts, activity, and downloadable analytics.',
  },
];

export const SUPPORT_HOURS_SCHEDULE: SupportHoursSchedule[] = [
  { id: '1', label: 'Monday - Friday: 9:00 AM - 6:00 PM EST' },
  { id: '2', label: 'Saturday: 10:00 AM - 4:00 PM EST' },
  { id: '3', label: 'Sunday: Closed' },
];
