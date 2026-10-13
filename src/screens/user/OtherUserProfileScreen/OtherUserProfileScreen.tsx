import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
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
import type { UserFeedPost } from '../../../constants/userFeedData';
import { subscribeToPosts } from '../../../services/postService';
import { subscribeToFriends, sendFriendRequest } from '../../../services/friendService';
import { subscribeToUserGroups } from '../../../services/groupService';
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
  const { userId = '' } = route.params || {};

  const currentUserId = auth().currentUser?.uid;

  const [activeTab, setActiveTab] = useState('posts');
  const [profileData, setProfileData] = useState<any>(null);
  const [realPosts, setRealPosts] = useState<UserFeedPost[]>([]);
  const [realFriends, setRealFriends] = useState<PublicProfileFriendRow[]>([]);
  const [realGroups, setRealGroups] = useState<UserProfileGroupRow[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<
    'none' | 'friends' | 'pending_outgoing' | 'pending_incoming'
  >('none');
  const [loading, setLoading] = useState(true);

  // Load real Firestore profile
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const unsubUser = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(
        doc => {
          if (doc && (typeof doc.exists === 'function' ? doc.exists() : doc.exists)) {
            setProfileData(doc.data());
          }
          setLoading(false);
        },
        () => setLoading(false),
      );
    return () => unsubUser();
  }, [userId]);

  // Load user posts
  useEffect(() => {
    const unsubPosts = subscribeToPosts(allPosts => {
      setRealPosts(allPosts.filter(p => p.authorUserId === userId && !p.groupId));
    });
    return () => unsubPosts();
  }, [userId]);

  // Load user friends
  useEffect(() => {
    const unsubFriends = subscribeToFriends(userId, friendList => {
      setRealFriends(
        friendList.map(f => ({
          id: f.id,
          name: f.name,
          subtitle: f.role || 'Member',
          avatarUrl: f.avatarUrl,
          initials: (f.name || 'U')
            .split(' ')
            .filter(Boolean)
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        })),
      );
    });
    return () => unsubFriends();
  }, [userId]);

  // Load user groups
  useEffect(() => {
    const unsubGroups = subscribeToUserGroups(userId, groupList => {
      setRealGroups(
        groupList.map(g => ({
          id: g.id,
          name: g.name,
          roleLabel: 'Group member',
          imageUrl: g.coverUri || '',
        })),
      );
    });
    return () => unsubGroups();
  }, [userId]);

  // Check friendship status with current user
  useEffect(() => {
    if (!currentUserId || !userId || currentUserId === userId) return;

    const unsubFriend = firestore()
      .collection('users')
      .doc(currentUserId)
      .collection('friends')
      .doc(userId)
      .onSnapshot(doc => {
        if (doc && (typeof doc.exists === 'function' ? doc.exists() : doc.exists)) {
          setFriendshipStatus('friends');
        } else {
          firestore()
            .collection('friend_requests')
            .where('senderId', '==', currentUserId)
            .where('receiverId', '==', userId)
            .where('status', '==', 'pending')
            .get()
            .then(outSnap => {
              if (!outSnap.empty) {
                setFriendshipStatus('pending_outgoing');
              } else {
                firestore()
                  .collection('friend_requests')
                  .where('senderId', '==', userId)
                  .where('receiverId', '==', currentUserId)
                  .where('status', '==', 'pending')
                  .get()
                  .then(inSnap => {
                    if (!inSnap.empty) {
                      setFriendshipStatus('pending_incoming');
                    } else {
                      setFriendshipStatus('none');
                    }
                  })
                  .catch(() => {});
              }
            })
            .catch(() => {});
        }
      });

    return () => unsubFriend();
  }, [currentUserId, userId]);

  const mockProfile = useMemo(() => getPublicUserProfile(userId), [userId]);

  const displayName =
    profileData?.fullName ||
    profileData?.displayName ||
    profileData?.name ||
    mockProfile?.displayName ||
    '';

  const bio =
    profileData?.bio !== undefined
      ? profileData.bio
      : mockProfile?.bio || 'Active Community Member';

  const avatarUri =
    profileData?.avatarUri ||
    profileData?.profilePicture ||
    profileData?.avatarUrl ||
    mockProfile?.avatarUri ||
    null;

  const coverUri =
    profileData?.coverUri ||
    profileData?.coverPosterUri ||
    mockProfile?.coverUri ||
    '';

  const avatarInitials = (displayName || 'U')
    .split(' ')
    .filter(Boolean)
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openChat = useCallback(() => {
    navigation.navigate('Chat', {
      peerId: userId,
      peerName: displayName || 'User',
      peerAvatarUri: avatarUri || '',
    });
  }, [navigation, userId, displayName, avatarUri]);

  const onFriendsPress = useCallback(async () => {
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to connect with members.');
      return;
    }
    if (friendshipStatus === 'friends') {
      Alert.alert('Friends', `You and ${displayName || 'this user'} are already friends.`);
    } else if (friendshipStatus === 'pending_outgoing') {
      Alert.alert('Request Pending', 'You have already sent a friend request to this user.');
    } else if (friendshipStatus === 'pending_incoming') {
      Alert.alert(
        'Request Received',
        `${displayName || 'This user'} sent you a friend request. Check your Notifications or Friends tab to accept.`,
      );
    } else {
      Alert.alert(
        'Add Friend',
        `Send a friend request to ${displayName || 'this user'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Request',
            onPress: async () => {
              try {
                await sendFriendRequest(currentUserId, userId);
                setFriendshipStatus('pending_outgoing');
                Alert.alert('Success', 'Friend request sent.');
              } catch (err: any) {
                Alert.alert('Request Failed', err.message || 'Could not send friend request.');
              }
            },
          },
        ],
      );
    }
  }, [currentUserId, userId, friendshipStatus, displayName]);

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

  const postsList = realPosts.length > 0 ? realPosts : mockProfile?.posts || [];
  const friendsList = realFriends.length > 0 ? realFriends : mockProfile?.friends || [];
  const groupsList = realGroups.length > 0 ? realGroups : mockProfile?.groups || [];

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

  if (loading) {
    return (
      <MainLayout
        isScrollable={false}
        includeSafeArea={true}
        barStyle="dark-content"
        statusbarBackgrund={Colors.white}
        bottomColor={Colors.userFeedBackground}
      >
        <View style={styles.missing}>
          <ActivityIndicator size="large" color={Colors.userProfilePurple} />
        </View>
      </MainLayout>
    );
  }

  if (!displayName) {
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
              {displayName}
            </Text>
          </View>
        </View>

        <UserProfileCoverBlock
          coverSource={coverUri ? { uri: coverUri } : null}
          avatarSource={avatarUri ? { uri: avatarUri } : null}
          avatarInitials={avatarInitials}
          avatarRingColor={Colors.userProfilePurple}
        />

        <View style={styles.body}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.bio}>{bio}</Text>
          <Text style={styles.mutual}>
            {friendsList.length} Friend{friendsList.length === 1 ? '' : 's'}
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
          (postsList.length === 0 ? (
            <Text
              style={[
                styles.missingText,
                { marginTop: UtilityMethods.hp(3), textAlign: 'center' },
              ]}
            >
              No posts yet.
            </Text>
          ) : (
            postsList.map(post => (
              <UserPostCard key={post.id} post={post} embedded />
            ))
          ))}
        {activeTab === 'friends' && (
          <UserPublicFriendsList
            friends={friendsList}
            onViewProfile={onViewFriend}
          />
        )}
        {activeTab === 'groups' && (
          <UserPublicGroupsList
            groups={groupsList}
            onViewGroup={onViewGroup}
          />
        )}
      </View>
    </MainLayout>
  );
}
