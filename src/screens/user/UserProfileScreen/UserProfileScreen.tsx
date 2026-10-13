import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import {
  UserCenteredScreenHeader,
  UserProfileCoverBlock,
  UserProfileSegmentTabs,
  UserProfileBadge,
  UserProfileHeaderActions,
  UserPostCard,
  UserProfileFriendsTab,
  UserProfileGroupsTab,
  FriendRequestsSection,
  useAccessibilityModal,
  type ProfileTabOption,
} from '../../../components/user';
import { useUserProfile } from '../../../components/user/UserProfileContext';
import { useAppSelector } from '../../../redux/hooks';
import { subscribeToFriends } from '../../../services/friendService';
import { subscribeToPosts } from '../../../services/postService';
import { subscribeToUserGroups } from '../../../services/groupService';
import { Colors } from '../../../constants/colors';
import { initialsFromDisplayName } from '../../../utils/userProfileInitials';
import { type UserFriendListItem } from '../../../constants/userFriendsListData';
import {
  type UserProfileGroupRow,
} from '../../../constants/userProfileGroupsData';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';
import EditIcon from '../../../assets/Icons/profile/pencil.svg';
import SettingIcon from '../../../assets/Icons/setting.svg';
import MicIcon from '../../../assets/Icons/profile/microphone.svg';
import SpeakerIcon from '../../../assets/Icons/profile/speaker.svg';

const H_PAD = UtilityMethods.wp(5);

const DEFAULT_PROFILE_TABS: ProfileTabOption[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'friends', label: 'Friends' },
  { key: 'groups', label: 'Groups' },
];

export function UserProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { profile } = useUserProfile();
  const { openAccessibilityModal } = useAccessibilityModal();
  const reduxTts = useAppSelector(s => s.ttsEnabled);
  const reduxVoice = useAppSelector(s => s.voiceCommandsEnabled);
  const isVoiceActive = reduxVoice ?? !!profile.voiceCommandsEnabled;
  const isTtsActive = reduxTts ?? !!profile.ttsEnabled;
  const [activeTab, setActiveTab] = useState('posts');
  const [friends, setFriends] = useState<UserFriendListItem[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [profileGroups, setProfileGroups] = useState<UserProfileGroupRow[]>([]);

  const currentUid = auth().currentUser?.uid || '';

  // The groups this user belongs to (real data).
  useEffect(() => {
    if (!currentUid) return;
    const unsubscribe = subscribeToUserGroups(currentUid, list => {
      setProfileGroups(
        list.map(g => ({
          id: g.id,
          name: g.name,
          roleLabel: 'Group member',
          imageUrl: g.coverUri && String(g.coverUri).startsWith('http') ? g.coverUri : '',
        })),
      );
    });
    return () => unsubscribe();
  }, [currentUid]);

  // Show only the logged-in user's own posts on their profile.
  useEffect(() => {
    if (!currentUid) return;
    const unsubscribe = subscribeToPosts(allPosts => {
      setMyPosts(allPosts.filter(p => p.authorUserId === currentUid && !p.groupId));
    });
    return () => unsubscribe();
  }, [currentUid]);

  useEffect(() => {
    if (!currentUid) return;
    const unsubscribe = subscribeToFriends(currentUid, list => {
      const mapped: UserFriendListItem[] = list.map(f => ({
        id: f.id,
        name: f.name,
        mutualFriends: 0,
        avatarUrl:
          f.avatarUrl && String(f.avatarUrl).startsWith('http')
            ? f.avatarUrl
            : undefined,
        isOnline: f.status === 'Active',
      }));
      setFriends(mapped);
    });
    return () => unsubscribe();
  }, [currentUid]);

  const tabs = useMemo(() => DEFAULT_PROFILE_TABS, []);

  const onBell = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);
  const onAccessibility = useCallback(() => {
    openAccessibilityModal();
  }, [openAccessibilityModal]);
  const onEdit = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const onViewFriendProfile = useCallback(
    (friend: UserFriendListItem) => {
      navigation.navigate('OtherUserProfile', { userId: friend.id });
    },
    [navigation],
  );

  const onMessageFriend = useCallback(
    (friend: UserFriendListItem) => {
      navigation.navigate('Chat', {
        peerId: friend.id,
        peerName: friend.name,
        peerAvatarUri: friend.avatarUrl ?? '',
        statusText: friend.isOnline ? 'Online' : 'Offline',
        isOnlineStatus: friend.isOnline,
      });
    },
    [navigation],
  );

  const onViewOwnGroup = useCallback(
    (group: UserProfileGroupRow) => {
      navigation.navigate('GroupDetail', { groupId: group.id });
    },
    [navigation],
  );
  const onSettings = useCallback(() => {
    navigation.navigate('AccountSettings');
  }, [navigation]);

  const onFindFriends = useCallback(() => {
    navigation.navigate('FindFriends');
  }, [navigation]);

  const avatarInitials = useMemo(
    () => initialsFromDisplayName(profile.displayName),
    [profile.displayName],
  );

  const posts = myPosts;

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      scrollContent: {
        paddingBottom: UtilityMethods.hp(3),
        backgroundColor: Colors.userFeedBackground,
      },
      top: {
        // backgroundColor: Colors.white,
        paddingBottom: UtilityMethods.hp(1),
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
        marginBottom: UtilityMethods.hp(1.5),
      },
      badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: UtilityMethods.hp(1.75),
      },
      actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      editBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.65),
        marginRight: UtilityMethods.wp(3),
      },
      editBtnText: {
        marginLeft: UtilityMethods.wp(2.5),
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      settingsBtn: {
        width: UtilityMethods.wp(12.5),
        height: UtilityMethods.wp(12.5),
        borderRadius: UtilityMethods.wp(6.25),
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        alignItems: 'center',
        justifyContent: 'center',
      },
      feedArea: {
        paddingTop: UtilityMethods.hp(0.5),
        paddingHorizontal: H_PAD,
      },
      emptyPosts: {
        textAlign: 'center',
        color: Colors.placeholderGrey,
        fontSize: FontSize.VALUE(14),
        marginTop: UtilityMethods.hp(4),
      },
    }),
  );

  return (
    <MainLayout
      isScrollable={true}
      includeSafeArea={false}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.userFeedBackground}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.top}>
        <UserCenteredScreenHeader
          title="Profile"
          rightSlot={
            <UserProfileHeaderActions
              onBellPress={onBell}
              onAccessibilityPress={onAccessibility}
            />
          }
        />

        <UserProfileCoverBlock
          coverSource={profile.coverUri ? { uri: profile.coverUri } : null}
          avatarSource={
            profile.avatarUri ? { uri: profile.avatarUri } : null
          }
          avatarInitials={avatarInitials}
        />

        <View style={styles.body}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>

          {(isVoiceActive || isTtsActive) && (
            <View style={styles.badges}>
              {isVoiceActive && (
                <UserProfileBadge label="Voice Enabled" Icon={MicIcon} />
              )}
              {isTtsActive && (
                <UserProfileBadge label="TTS Active" Icon={SpeakerIcon} />
              )}
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={onEdit}
              activeOpacity={0.88}
            >
              <EditIcon
                width={UtilityMethods.wp(4.5)}
                height={UtilityMethods.wp(4)}
              />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={onSettings}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <SettingIcon
                width={UtilityMethods.wp(5.5)}
                height={UtilityMethods.wp(5.5)}
                stroke="#000000"
              />
            </TouchableOpacity>
          </View>

          <UserProfileSegmentTabs
            tabs={tabs}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </View>
      </View>

      <View style={styles.feedArea}>
        {activeTab === 'posts' &&
          (posts.length > 0 ? (
            posts.map(post => (
              <UserPostCard key={post.id} post={post} embedded />
            ))
          ) : (
            <Text style={styles.emptyPosts}>
              You haven't posted anything yet.
            </Text>
          ))}
        {activeTab === 'friends' && (
          <>
            <FriendRequestsSection />
            <UserProfileFriendsTab
              friends={friends}
              onViewProfile={onViewFriendProfile}
              onMessage={onMessageFriend}
              onFindFriendsPress={onFindFriends}
            />
          </>
        )}
        {activeTab === 'groups' && (
          <UserProfileGroupsTab
            groups={profileGroups}
            onViewGroup={onViewOwnGroup}
          />
        )}
      </View>
    </MainLayout>
  );
}
