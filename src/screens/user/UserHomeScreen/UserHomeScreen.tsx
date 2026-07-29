import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
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
import { Colors } from '../../../constants/colors';
import { type UserFeedFilter } from '../../../constants/userFeedData';
import { DEFAULT_USER_HEADER_AVATAR_URI } from '../../../constants/userAvatars';
import type { UserStackParamList } from '../../../navigation/User/types';
import UtilityMethods from '../../../utility/UtilityMethods';
import { useUserProfile } from '../../../components/user';
import { subscribeToPosts } from '../../../services/postService';
import { subscribeToFriends } from '../../../services/friendService';
import { subscribeToBlockedIds } from '../../../services/moderationService';

export function UserHomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { profile } = useUserProfile();
  const [filter, setFilter] = useState<UserFeedFilter | null>(null);
  const [realtimePosts, setRealtimePosts] = useState<any[]>([]);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const { openCreatePost } = useCreatePostModal();
  const { openAccessibilityModal } = useAccessibilityModal();

  const currentUserId = auth().currentUser?.uid || 'dev_user_123';

  useEffect(() => {
    const unsubscribe = subscribeToPosts(posts => {
      setRealtimePosts(posts);
    });
    return () => unsubscribe();
  }, []);

  // Track the user's friends so the feed can show their posts too.
  useEffect(() => {
    const unsubscribe = subscribeToFriends(currentUserId, friends => {
      setFriendIds(new Set(friends.map(f => f.id)));
    });
    return () => unsubscribe();
  }, [currentUserId]);

  // Track blocked users so their posts stay out of the feed.
  useEffect(() => {
    const unsubscribe = subscribeToBlockedIds(currentUserId, setBlockedIds);
    return () => unsubscribe();
  }, [currentUserId]);

  // Feed = the user's own posts + their friends' posts (newest first,
  // already ordered by the posts subscription).
  const feedPosts = useMemo(() => {
    const allowed = new Set<string>([currentUserId, ...friendIds]);
    // Group posts live in their group's feed; blocked authors are hidden.
    return realtimePosts.filter(
      p =>
        !p.groupId &&
        allowed.has(p.authorUserId) &&
        !blockedIds.has(p.authorUserId),
    );
  }, [realtimePosts, friendIds, blockedIds, currentUserId]);

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
      includeSafeArea={true}
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
          avatarSource={
            profile.avatarUri
              ? { uri: profile.avatarUri }
              : { uri: DEFAULT_USER_HEADER_AVATAR_URI }
          }
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
