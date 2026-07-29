import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import {
  UserProfileCoverBlock,
  UserProfileSegmentTabs,
  UserPostCard,
  GroupMemberRow,
  useUserProfile,
  type ProfileTabOption,
} from '../../../components/user';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import { Colors } from '../../../constants/colors';
import {
  subscribeToGroupDetail,
  joinGroup,
  leaveGroup,
  type GroupDetail,
} from '../../../services/groupService';
import {
  subscribeToGroupPosts,
  createPost,
} from '../../../services/postService';
import { getOrCreateGroupConversation } from '../../../services/chatService';
import { UserTabMessagesIcon } from '../../../components/user/icons';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';
import PeopleIcon from '../../../assets/Icons/people.svg';
import GroupUserCheckIcon from '../../../assets/Icons/profile/groupUserCheck.svg';
import GroupShareIcon from '../../../assets/Icons/profile/groupShare.svg';

const H_PAD = UtilityMethods.wp(5);

const GROUP_TABS: ProfileTabOption[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'members', label: 'Members' },
];

export function GroupDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const route = useRoute<RouteProp<UserStackParamList, 'GroupDetail'>>();
  const { groupId } = route.params;
  const { profile } = useUserProfile();

  const [activeTab, setActiveTab] = useState('posts');
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const currentUserId = auth().currentUser?.uid || 'dev_user_123';

  useEffect(() => {
    const unsubDetail = subscribeToGroupDetail(groupId, currentUserId, g => {
      setGroup(g);
      setLoading(false);
    });
    const unsubPosts = subscribeToGroupPosts(groupId, setPosts);
    return () => {
      unsubDetail();
      unsubPosts();
    };
  }, [groupId, currentUserId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onViewMember = useCallback(
    (member: { id: string }) => {
      navigation.navigate('OtherUserProfile', { userId: member.id });
    },
    [navigation],
  );

  const handleToggleMembership = useCallback(() => {
    if (!group) return;
    if (group.isMember) {
      Alert.alert('Leave group', `Leave ${group.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () =>
            leaveGroup(group.id, currentUserId).catch(e =>
              console.error('Leave group failed:', e),
            ),
        },
      ]);
    } else {
      joinGroup(group.id, currentUserId).catch(e =>
        console.error('Join group failed:', e),
      );
    }
  }, [group, currentUserId]);

  const handleOpenGroupChat = useCallback(async () => {
    if (!group) return;
    try {
      const convId = await getOrCreateGroupConversation(
        group.id,
        group.name,
        group.members.map(m => m.id),
        group.avatarUri,
      );
      navigation.navigate('Chat', {
        conversationId: convId,
        peerId: group.id,
        peerName: group.name,
        peerAvatarUri: group.avatarUri || '',
        statusText: `${group.memberCount} members`,
        isOnlineStatus: false,
      });
    } catch (err) {
      console.error('Failed to open group chat:', err);
      Alert.alert('Error', 'Could not open the group chat.');
    }
  }, [group, navigation]);

  const handlePostToGroup = useCallback(async () => {
    const text = draft.trim();
    if (!text || posting) return;
    const currentUser = auth().currentUser;
    setPosting(true);
    setDraft('');
    try {
      await createPost({
        userId: currentUserId,
        username: profile?.displayName || currentUser?.displayName || 'User',
        profilePicture: profile?.avatarUri || currentUser?.photoURL || '',
        text,
        mediaType: 'none',
        groupId,
      });
    } catch (err) {
      console.error('Failed to post to group:', err);
      setDraft(text);
    } finally {
      setPosting(false);
    }
  }, [draft, posting, currentUserId, profile, groupId]);

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
        paddingTop: UtilityMethods.hp(7),
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
        paddingTop: UtilityMethods.hp(0),
      },
      groupName: {
        fontSize: FontSize.VALUE(22),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.65),
      },
      description: {
        fontSize: FontSize.VALUE(14),
        lineHeight: FontSize.VALUE(21),
        color: Colors.textGrey,
        marginBottom: UtilityMethods.hp(1),
      },
      membersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      memberCount: {
        marginLeft: UtilityMethods.wp(1.5),
        fontSize: FontSize.VALUE(13),
        color: Colors.userGroupMemberMeta,
      },
      actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      joinedBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.5),
        marginRight: UtilityMethods.wp(2),
      },
      joinedLabel: {
        marginLeft: UtilityMethods.wp(2),
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      iconBtn: {
        width: UtilityMethods.wp(14),
        height: UtilityMethods.wp(14),
        borderRadius: UtilityMethods.wp(2.5),
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(2),
      },
      feedArea: {
        paddingTop: UtilityMethods.hp(0.5),
        paddingHorizontal: H_PAD,
      },
      membersList: {
        paddingBottom: UtilityMethods.hp(1),
      },
      composer: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        padding: UtilityMethods.wp(3),
        marginBottom: UtilityMethods.hp(1.5),
      },
      composerInput: {
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
        minHeight: UtilityMethods.hp(5),
        textAlignVertical: 'top',
        marginBottom: UtilityMethods.hp(1),
      },
      composerBtn: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(6),
        paddingHorizontal: UtilityMethods.wp(6),
        paddingVertical: UtilityMethods.hp(1),
      },
      composerBtnDisabled: {
        opacity: 0.45,
      },
      composerBtnText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.VALUE(14),
      },
      emptyText: {
        textAlign: 'center',
        color: Colors.placeholderGrey,
        fontSize: FontSize.VALUE(14),
        paddingVertical: UtilityMethods.hp(4),
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

  if (!group) {
    return (
      <MainLayout
        isScrollable={false}
        includeSafeArea={true}
        barStyle="dark-content"
        statusbarBackgrund={Colors.white}
        bottomColor={Colors.userFeedBackground}
      >
        <View style={styles.missing}>
          <Text style={styles.missingText}>
            {loading ? 'Loading group…' : 'Group not found.'}
          </Text>
          {!loading && (
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.missingLink}>Go back</Text>
            </TouchableOpacity>
          )}
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
            <ArrowLeftIcon width={UtilityMethods.wp(5.5)} height={UtilityMethods.wp(5.5)} />
          </TouchableOpacity>
          <View style={styles.navTitleWrap} pointerEvents="none">
            <Text style={styles.navTitle} numberOfLines={1}>
              {group.name}
            </Text>
          </View>
        </View>

        <UserProfileCoverBlock
          coverSource={{ uri: group.coverUri }}
          avatarSource={{ uri: group.avatarUri }}
          avatarShape="roundedSquare"
        />

        <View style={styles.body}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.description}>{group.description}</Text>

          <View style={styles.membersRow}>
            <PeopleIcon
              width={UtilityMethods.wp(4.25)}
              height={UtilityMethods.wp(4.25)}
            />
            <Text style={styles.memberCount}>
              {group.memberCount} members
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.joinedBtn}
              activeOpacity={0.88}
              onPress={handleToggleMembership}
            >
              <GroupUserCheckIcon
                width={UtilityMethods.wp(4.5)}
                height={UtilityMethods.wp(4.5)}
              />
              <Text style={styles.joinedLabel}>
                {group.isMember ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleOpenGroupChat}
              accessibilityRole="button"
              accessibilityLabel="Group chat"
            >
              <UserTabMessagesIcon
                size={UtilityMethods.wp(5)}
                color={Colors.textDark}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => Alert.alert('Share', 'Share this group')}
              accessibilityRole="button"
              accessibilityLabel="Share group"
            >
              <GroupShareIcon
                width={UtilityMethods.wp(5)}
                height={UtilityMethods.wp(5)}
              />
            </TouchableOpacity>
          </View>

          <UserProfileSegmentTabs
            tabs={GROUP_TABS}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </View>
      </View>

      <View style={styles.feedArea}>
        {activeTab === 'posts' && (
          <>
            {group.isMember && (
              <View style={styles.composer}>
                <TextInput
                  style={styles.composerInput}
                  placeholder={`Share something with ${group.name}...`}
                  placeholderTextColor={Colors.placeholderGrey}
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.composerBtn,
                    (!draft.trim() || posting) && styles.composerBtnDisabled,
                  ]}
                  onPress={handlePostToGroup}
                  disabled={!draft.trim() || posting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.composerBtnText}>Post</Text>
                </TouchableOpacity>
              </View>
            )}
            {posts.length > 0 ? (
              posts.map(post => (
                <UserPostCard key={post.id} post={post} embedded />
              ))
            ) : (
              <Text style={styles.emptyText}>
                No posts in this group yet.
              </Text>
            )}
          </>
        )}
        {activeTab === 'members' && (
          <View style={styles.membersList}>
            {group.members.map(member => (
              <GroupMemberRow
                key={member.id}
                member={member}
                onViewPress={onViewMember}
              />
            ))}
          </View>
        )}
      </View>
    </MainLayout>
  );
}
