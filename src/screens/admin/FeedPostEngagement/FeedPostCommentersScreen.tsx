import React from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../navigation/MainStack';
import { AdminFeedEngagementListBody } from './AdminFeedEngagementListBody';

export function FeedPostCommentersScreen() {
  const { postId } =
    useRoute<RouteProp<RootStackParamList, 'FeedPostCommenters'>>().params;
  return <AdminFeedEngagementListBody postId={postId} kind="comments" />;
}
