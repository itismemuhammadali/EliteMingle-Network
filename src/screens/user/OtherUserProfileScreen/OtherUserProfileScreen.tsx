import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import {
  UserProfileCoverBlock,
  UserProfileSegmentTabs,
  UserPostCard,
  UserPublicProfileActions,
  UserPublicFriendsList,
  UserPublicGroupsList,
  type ProfileTabOption,
} from '../../../components/user';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import { Colors } from '../../../constants/colors';
import { getPublicUserProfile } from '../../../constants/publicUserProfilesData';
import type { PublicProfileFriendRow } from '../../../constants/publicUserProfilesData';
import type { UserProfileGroupRow } from '../../../constants/userProfileGroupsData';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);

const TABS: ProfileTabOption[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'friends', label: 'Friends' },
  { key: 'groups', label: 'Groups' },
];

export function OtherUserProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const route = useRoute<RouteProp<UserStackParamList, 'OtherUserProfile'>>();
  const { userId } = route.params;

  const [activeTab, setActiveTab] = useState('posts');

  const profile = useMemo(() => getPublicUserProfile(userId), [userId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openChat = useCallback(() => {
    if (!profile) {
      return;
    }
    navigation.navigate('Chat', {
      peerId: profile.id,
      peerName: profile.displayName,
      peerAvatarUri: profile.avatarUri ?? '',
    });
  }, [navigation, profile]);

  const onFriendsPress = useCallback(() => {
    Alert.alert('Friends', 'Friend request and suggestions will appear here.');
  }, []);

  const onViewFriend = useCallback(
    (friend: PublicProfileFriendRow) => {
      navigation.push('OtherUserProfile', { userId: friend.id });
    },
    [navigation],
  );

  const onViewGroup = useCallback(
    (group: UserProfileGroupRow) => {
      navigation.navigate('GroupDetail', { groupId: group.id });
    },
    [navigation],
  );

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      scrollContent: {
        paddingBottom: UtilityMethods.hp(3),
        backgroundColor: Colors.userFeedBackground,
      },
      top: {
        backgroundColor: Colors.white,
        paddingBottom: UtilityMethods.hp(0.5),
      },
      navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(4),
        paddingBottom: UtilityMethods.hp(1.25),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      backBtn: {
        padding: UtilityMethods.wp(0.5),
      },
      navTitleWrap: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(28),
        paddingBottom: UtilityMethods.hp(1.25),
      },
      navTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
      },
      body: {
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(1),
      },
      name: {
        fontSize: FontSize.VALUE(22),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.75),
      },
      bio: {
        fontSize: FontSize.VALUE(14),
        lineHeight: FontSize.VALUE(21),
        color: Colors.textGrey,
        marginBottom: UtilityMethods.hp(0.75),
      },
      mutual: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(0.5),
      },
      feedArea: {
        paddingTop: UtilityMethods.hp(0.5),
        paddingHorizontal: H_PAD,
      },
      missing: {
        flex: 1,
        padding: UtilityMethods.wp(5),
        justifyContent: 'center',
        alignItems: 'center',
      },
      missingText: {
        fontSize: FontSize.VALUE(15),
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(1),
      },
      missingLink: {
        fontSize: FontSize.VALUE(15),
        color: Colors.userProfilePurple,
        fontWeight: '600',
      },
    }),
  );

  if (!profile) {
    return (
      <MainLayout
        isScrollable={false}
        includeSafeArea={true}
        barStyle="dark-content"
        statusbarBackgrund={Colors.white}
        bottomColor={Colors.userFeedBackground}
      >
        <View style={styles.missing}>
          <Text style={styles.missingText}>Profile not found.</Text>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.missingLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      isScrollable={true}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.userFeedBackground}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.top}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeftIcon
              width={UtilityMethods.wp(5.5)}
              height={UtilityMethods.wp(5.5)}
            />
          </TouchableOpacity>
          <View style={styles.navTitleWrap} pointerEvents="none">
            <Text style={styles.navTitle} numberOfLines={1}>
              {profile.displayName}
            </Text>
          </View>
        </View>

        <UserProfileCoverBlock
          coverSource={{ uri: profile.coverUri }}
          avatarSource={
            profile.avatarUri ? { uri: profile.avatarUri } : null
          }
          avatarInitials={profile.avatarInitials}
          avatarRingColor={profile.avatarRingColor}
        />

        <View style={styles.body}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <Text style={styles.mutual}>
            {profile.mutualFriendsCount} mutual friends
          </Text>

          <UserPublicProfileActions
            onFriendsPress={onFriendsPress}
            onMessagePress={openChat}
          />

          <UserProfileSegmentTabs
            tabs={TABS}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </View>
      </View>

      <View style={styles.feedArea}>
        {activeTab === 'posts' &&
          profile.posts.map(post => (
            <UserPostCard key={post.id} post={post} embedded />
          ))}
        {activeTab === 'friends' && (
          <UserPublicFriendsList
            friends={profile.friends}
            onViewProfile={onViewFriend}
          />
        )}
        {activeTab === 'groups' && (
          <UserPublicGroupsList
            groups={profile.groups}
            onViewGroup={onViewGroup}
          />
        )}
      </View>
    </MainLayout>
  );
}
