import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import {
  UserHeaderSection,
  UserCreatePostCard,
  FeedFilterTabs,
  UserPostCard,
  PeopleYouMayKnowSection,
  useCreatePostModal,
  useAccessibilityModal,
} from '../../../components/user';
import { PostCardShareMenu } from '../../../components/user/PostCardShareMenu';
import { Colors } from '../../../constants/colors';
import { type UserFeedFilter } from '../../../constants/userFeedData';
import type { UserStackParamList } from '../../../navigation/User/types';
import UtilityMethods from '../../../utility/UtilityMethods';
import { useUserProfile } from '../../../components/user';
import {
  subscribeToPosts,
  toggleLike,
  savePost,
} from '../../../services/postService';
import { subscribeToFriends } from '../../../services/friendService';
import { subscribeToBlockedIds } from '../../../services/moderationService';
import { subscribeToVoiceCommands } from '../../../services/voiceCommandService';
import { getCachedPosts } from '../../../services/postCacheService';

export function UserHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { profile } = useUserProfile();
  const [filter, setFilter] = useState<UserFeedFilter | null>(null);
  const [realtimePosts, setRealtimePosts] = useState<any[]>(() => getCachedPosts());
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const { openCreatePost } = useCreatePostModal();
  const { openAccessibilityModal } = useAccessibilityModal();

  const currentUserId = auth().currentUser?.uid || '';

  useEffect(() => {
    if (!auth().currentUser) return;
    const unsubscribe = subscribeToPosts(posts => {
      setRealtimePosts(posts);
    });
    return () => unsubscribe();
  }, []);

  // Track the user's friends so the feed can show their posts too.
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = subscribeToFriends(currentUserId, friends => {
      setFriendIds(new Set(friends.map(f => f.id)));
    });
    return () => unsubscribe();
  }, [currentUserId]);

  // Track blocked users so their posts stay out of the feed.
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = subscribeToBlockedIds(currentUserId, setBlockedIds);
    return () => unsubscribe();
  }, [currentUserId]);

  // Feed = the user's own posts + their friends' posts (or all community posts
  // if the user has not added friends yet, so new users discover content).
  const feedPosts = useMemo(() => {
    const hasFriends = friendIds.size > 0;
    const allowed = new Set<string>([currentUserId, ...friendIds]);
    return realtimePosts.filter(
      p =>
        !p.groupId &&
        (hasFriends ? allowed.has(p.authorUserId) : true) &&
        !blockedIds.has(p.authorUserId),
    );
  }, [realtimePosts, friendIds, blockedIds, currentUserId]);

  const [activeSharePostId, setActiveSharePostId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToVoiceCommands(cmd => {
      if (feedPosts.length === 0) return;
      const targetIdx = cmd.targetIndex ?? 0;
      const targetPost = feedPosts[targetIdx] || feedPosts[0];
      if (!targetPost) return;

      switch (cmd.action) {
        case 'ACTION_LIKE_POST':
          if (currentUserId) {
            toggleLike(targetPost.id, currentUserId).catch(err =>
              console.warn('Voice like error:', err),
            );
          }
          break;
        case 'ACTION_SAVE_POST':
          if (currentUserId) {
            savePost(targetPost.id, currentUserId)
              .then(saved => {
                Alert.alert(
                  saved ? 'Saved' : 'Removed',
                  saved
                    ? 'Post saved to your collection.'
                    : 'Post removed from saved collection.',
                );
              })
              .catch(err => console.warn('Voice save error:', err));
          }
          break;
        case 'ACTION_OPEN_COMMENTS':
          navigation.navigate('PostComments', {
            postId: targetPost.id,
            authorName: targetPost.userName,
          });
          break;
        case 'ACTION_SHARE_POST':
          setActiveSharePostId(targetPost.id);
          break;
        default:
          break;
      }
    });

    return () => unsub();
  }, [feedPosts, currentUserId, navigation]);

  const onNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const onAccessibility = useCallback(() => {
    openAccessibilityModal();
  }, [openAccessibilityModal]);

  const onAvatarPress = useCallback(() => {
    navigation.navigate('UserMain', { openTab: 'Profile' });
  }, [navigation]);

  const onComposer = useCallback(() => {
    openCreatePost();
  }, [openCreatePost]);

  const onPhoto = useCallback(() => {
    openCreatePost();
  }, [openCreatePost]);

  const onVideo = useCallback(() => {
    openCreatePost();
  }, [openCreatePost]);

  const onFeeling = useCallback(() => {
    openCreatePost();
  }, [openCreatePost]);

  const headerDisplayName = profile.displayName
    ? profile.displayName.length > 12
      ? `${profile.displayName.substring(0, 11)}...`
      : profile.displayName
    : 'User';

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={false}
      barStyle="dark-content"
      statusbarBackgrund={Colors.userFeedBackground}
      bottomColor={Colors.userFeedBackground}
    >
      <View style={styles.header}>
        <UserHeaderSection
          displayName={headerDisplayName}
          avatarUri={profile.avatarUri || undefined}
          greeting="Good Morning"
          onBellPress={onNotifications}
          onAccessibilityPress={onAccessibility}
          onAvatarPress={onAvatarPress}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <UserCreatePostCard
          avatarUri={profile.avatarUri}
          onComposerPress={onComposer}
          onPhotoPress={onPhoto}
          onVideoPress={onVideo}
          onFeelingPress={onFeeling}
        />

        <FeedFilterTabs active={filter} onChange={setFilter} />

        {filter === null ? (
          <View style={styles.feed}>
            {feedPosts.length > 0 ? (
              feedPosts.map(post => (
                <UserPostCard key={post.id} post={post} />
              ))
            ) : (
              <Text style={styles.emptyFeed}>
                No posts yet. Share something or add friends to see their posts here.
              </Text>
            )}
          </View>
        ) : (
          <PeopleYouMayKnowSection filter={filter} />
        )}
      </ScrollView>
      {activeSharePostId && (
        <PostCardShareMenu
          visible={!!activeSharePostId}
          postId={activeSharePostId}
          onClose={() => setActiveSharePostId(null)}
        />
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.userFeedBackground,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.userFeedBackground,
  },
  contentContainer: {
    paddingTop: UtilityMethods.hp(1),
    paddingBottom: UtilityMethods.hp(3),
  },
  feed: {
    paddingBottom: UtilityMethods.hp(1),
  },
  emptyFeed: {
    textAlign: 'center',
    color: Colors.placeholderGrey,
    fontSize: 14,
    paddingHorizontal: UtilityMethods.wp(10),
    paddingVertical: UtilityMethods.hp(4),
    lineHeight: 21,
  },
});
