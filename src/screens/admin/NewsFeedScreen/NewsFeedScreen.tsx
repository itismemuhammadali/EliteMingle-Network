import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/MainStack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import { NewsPostCard } from '../../../components/admin/NewsPostCard';
import { ConfirmationModal } from '../../../components/admin/modal';
import type { NewsPost } from '../../../components/admin/NewsPostCard';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import { subscribeToPosts } from '../../../services/postService';
import {
  sendWarningToUser,
  setUserStatus,
} from '../../../services/moderationService';

export function NewsFeedScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'NewsFeed'>>();
  const [warnModalPost, setWarnModalPost] = useState<NewsPost | null>(null);
  const [blockModalPost, setBlockModalPost] = useState<NewsPost | null>(null);
  const [posts, setPosts] = useState<NewsPost[]>([]);

  // All user posts, for moderation (group posts excluded).
  useEffect(() => {
    const unsubscribe = subscribeToPosts(all => {
      setPosts(
        all
          .filter(p => !p.groupId)
          .map(p => ({
            id: p.id,
            userId: p.authorUserId,
            userName: p.userName,
            status: 'Active',
            timeAgo: p.timeAgo,
            content: p.content,
            likes: p.reactions,
            comments: p.comments,
            shares: p.shares,
            avatarColor: p.avatarColor || '#800080',
          })),
      );
    });
    return () => unsubscribe();
  }, []);

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund="#FFFFFF"
      bottomColor={Colors.adminBackgroundGrey}
    >
      <ScreenHeader title="News Feed" onBackPress={() => navigation.goBack()} />
      <View style={styles.headerBorder} />

      <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
        <View style={styles.listContainer}>
          {posts.length > 0 ? (
            posts.map(post => (
              <NewsPostCard
                key={post.id}
                post={post}
                onViewPress={p =>
                  navigation.navigate('FeedDetails', { postId: p.id })
                }
                onWarnPress={p => setWarnModalPost(p)}
                onBlockPress={p => setBlockModalPost(p)}
              />
            ))
          ) : (
            <Text style={styles.empty}>No posts to review.</Text>
          )}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={!!warnModalPost}
        type="sendWarning"
        entityName={warnModalPost?.userName ?? ''}
        onConfirm={() => {
          if (warnModalPost?.userId) {
            sendWarningToUser(warnModalPost.userId);
          }
          setWarnModalPost(null);
        }}
        onCancel={() => setWarnModalPost(null)}
      />
      <ConfirmationModal
        visible={!!blockModalPost}
        type="blockPost"
        entityName={blockModalPost?.userName ?? ''}
        onConfirm={() => {
          if (blockModalPost?.userId) {
            setUserStatus(blockModalPost.userId, 'inactive');
          }
          setBlockModalPost(null);
        }}
        onCancel={() => setBlockModalPost(null)}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  headerBorder: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  contentContainer: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
    backgroundColor: Colors.adminBackgroundGrey,
  },
  listContainer: {},
  empty: {
    textAlign: 'center',
    color: Colors.adminInactiveGrey,
    fontSize: UtilityMethods.wp(3.6),
    paddingVertical: UtilityMethods.hp(6),
  },
});
