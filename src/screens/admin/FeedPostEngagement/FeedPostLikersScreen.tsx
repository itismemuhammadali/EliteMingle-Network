import React from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../navigation/MainStack';
import { AdminFeedEngagementListBody } from './AdminFeedEngagementListBody';

export function FeedPostLikersScreen() {
  const { postId } =
    useRoute<RouteProp<RootStackParamList, 'FeedPostLikers'>>().params;
  return <AdminFeedEngagementListBody postId={postId} kind="likes" />;
}
