import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Image,
  Platform,
  ToastAndroid,
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
import { launchImageLibrary } from 'react-native-image-picker';
import {
  subscribeToGroupDetail,
  joinGroup,
  leaveGroup,
  makeGroupAdmin,
  removeGroupAdmin,
  updateGroupDetails,
  addMemberToGroup,
  type GroupDetail,
} from '../../../services/groupService';
import {
  subscribeToGroupPosts,
  createPost,
} from '../../../services/postService';
import {
  getOrCreateGroupConversation,
  subscribeToAllUsers,
  type RegisteredUser,
} from '../../../services/chatService';
import { UserTabMessagesIcon } from '../../../components/user/icons';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';
import PeopleIcon from '../../../assets/Icons/people.svg';
import GroupUserCheckIcon from '../../../assets/Icons/profile/groupUserCheck.svg';

const H_PAD = UtilityMethods.wp(5);

const GROUP_TABS: ProfileTabOption[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'members', label: 'Members' },
];

export function GroupDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const route = useRoute<RouteProp<UserStackParamList, 'GroupDetail'>>();
  const { groupId = '' } = route.params || {};
  const { profile } = useUserProfile();

  const [activeTab, setActiveTab] = useState('posts');
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrivacy, setEditPrivacy] = useState<'public' | 'private'>('public');
  const [editCoverUri, setEditCoverUri] = useState<string | undefined>();
  const [editAvatarUri, setEditAvatarUri] = useState<string | undefined>();
  const [savingDetails, setSavingDetails] = useState(false);

  const currentUserId = auth().currentUser?.uid || '';

  const isUserAdmin = useMemo(() => {
    if (!group || !currentUserId) return false;
    if (group.ownerId === currentUserId) return true;
    return Array.isArray(group.adminIds) && group.adminIds.includes(currentUserId);
  }, [group, currentUserId]);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }
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

  useEffect(() => {
    if (!currentUserId) return;
    const unsub = subscribeToAllUsers(currentUserId, setAllUsers);
    return () => unsub();
  }, [currentUserId]);

  const handleAddUser = useCallback(
    async (user: RegisteredUser) => {
      if (!group) return;
      try {
        await addMemberToGroup(group.id, user.id);
        if (Platform.OS === 'android') {
          ToastAndroid.show(`${user.name} added to group!`, ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', `${user.name} added to group!`);
        }
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Could not add user.');
      }
    },
    [group],
  );

  const nonMembers = useMemo(() => {
    if (!group) return [];
    const memberIds = new Set(group.members.map(m => m.id));
    return allUsers.filter(u => {
      if (memberIds.has(u.id) || u.id === currentUserId) return false;
      if (!userSearch.trim()) return true;
      return u.name.toLowerCase().includes(userSearch.toLowerCase());
    });
  }, [group, allUsers, currentUserId, userSearch]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onViewMember = useCallback(
    (member: { id: string }) => {
      navigation.navigate('OtherUserProfile', { userId: member.id });
    },
    [navigation],
  );

  const handleOpenEditModal = useCallback(() => {
    if (!group) return;
    setEditName(group.name || '');
    setEditDescription(group.description || '');
    setEditPrivacy(group.privacy || 'public');
    setEditCoverUri(group.coverUri);
    setEditAvatarUri(group.avatarUri);
    setEditModalVisible(true);
  }, [group]);

  const handlePickCover = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset?.uri) {
        setEditCoverUri(asset.uri);
      }
    });
  }, []);

  const handlePickAvatar = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset?.uri) {
        setEditAvatarUri(asset.uri);
      }
    });
  }, []);

  const handleSaveGroupDetails = useCallback(async () => {
    if (!group || !currentUserId || savingDetails) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Group name cannot be empty.');
      return;
    }
    setSavingDetails(true);
    try {
      await updateGroupDetails(group.id, currentUserId, {
        name: trimmed,
        description: editDescription.trim(),
        privacy: editPrivacy,
        coverUri: editCoverUri,
        avatarUri: editAvatarUri,
      });
      setEditModalVisible(false);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Group details updated!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Group details updated!');
      }
    } catch (err: any) {
      console.error('Failed to update group details:', err);
      Alert.alert('Error', err?.message || 'Could not update group details.');
    } finally {
      setSavingDetails(false);
    }
  }, [group, currentUserId, savingDetails, editName, editDescription, editPrivacy, editCoverUri, editAvatarUri]);

  const handleMakeAdmin = useCallback(
    (member: { id: string; name: string }) => {
      if (!group || !currentUserId) return;
      Alert.alert(
        'Make Admin',
        `Make ${member.name} an admin of this group? They will be able to edit group details and manage members.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Make Admin',
            onPress: async () => {
              try {
                await makeGroupAdmin(group.id, member.id, currentUserId);
                if (Platform.OS === 'android') {
                  ToastAndroid.show(`${member.name} is now an admin!`, ToastAndroid.SHORT);
                } else {
                  Alert.alert('Success', `${member.name} is now an admin.`);
                }
              } catch (err: any) {
                console.error('Failed to make admin:', err);
                Alert.alert('Error', err?.message || 'Failed to make admin.');
              }
            },
          },
        ],
      );
    },
    [group, currentUserId],
  );

  const handleDismissAdmin = useCallback(
    (member: { id: string; name: string }) => {
      if (!group || !currentUserId) return;
      Alert.alert(
        'Dismiss Admin',
        `Remove admin privileges from ${member.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Dismiss',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeGroupAdmin(group.id, member.id, currentUserId);
                if (Platform.OS === 'android') {
                  ToastAndroid.show(`Removed admin privileges from ${member.name}.`, ToastAndroid.SHORT);
                } else {
                  Alert.alert('Success', `Removed admin privileges from ${member.name}.`);
                }
              } catch (err: any) {
                console.error('Failed to remove admin:', err);
                Alert.alert('Error', err?.message || 'Failed to remove admin.');
              }
            },
          },
        ],
      );
    },
    [group, currentUserId],
  );

  const handleToggleMembership = useCallback(() => {
    if (!group) return;
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to join groups.');
      return;
    }
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
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to post to this group.');
      return;
    }
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
      editGroupBtn: {
        paddingHorizontal: UtilityMethods.wp(4),
        height: UtilityMethods.wp(14),
        borderRadius: UtilityMethods.wp(2.5),
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.userProfilePurple,
        alignItems: 'center',
        justifyContent: 'center',
      },
      editGroupBtnText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.userProfilePurple,
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
      addMemberBtn: {
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(1.3),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      addMemberBtnText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      },
      modalContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: UtilityMethods.wp(5),
        borderTopRightRadius: UtilityMethods.wp(5),
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(2.5),
        paddingBottom: UtilityMethods.hp(4),
        maxHeight: '80%',
      },
      modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: UtilityMethods.hp(1.5),
      },
      modalTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      modalCloseText: {
        fontSize: FontSize.VALUE(20),
        color: Colors.textGrey,
        padding: UtilityMethods.wp(1),
      },
      modalSearchInput: {
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(2.5),
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1.2),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(1.5),
      },
      modalUserList: {
        maxHeight: UtilityMethods.hp(45),
      },
      modalUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(1.2),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      modalUserAvatar: {
        width: UtilityMethods.wp(10),
        height: UtilityMethods.wp(10),
        borderRadius: UtilityMethods.wp(5),
        backgroundColor: Colors.inputBackground,
        marginRight: UtilityMethods.wp(3),
      },
      modalUserName: {
        flex: 1,
        fontSize: FontSize.VALUE(15),
        fontWeight: '600',
        color: Colors.textDark,
      },
      modalAddBtn: {
        backgroundColor: Colors.userProfilePurple,
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(0.8),
        borderRadius: UtilityMethods.wp(5),
      },
      modalAddBtnText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(12),
        fontWeight: '700',
      },
      editModalScroll: {
        maxHeight: UtilityMethods.hp(60),
      },
      editFieldLabel: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '700',
        color: Colors.textDark,
        marginTop: UtilityMethods.hp(1.5),
        marginBottom: UtilityMethods.hp(0.6),
      },
      editTextInput: {
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(2.5),
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1.2),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
      },
      editTextArea: {
        minHeight: UtilityMethods.hp(8),
        textAlignVertical: 'top',
      },
      privacyRow: {
        flexDirection: 'row',
        gap: UtilityMethods.wp(2),
        marginTop: UtilityMethods.hp(0.5),
      },
      privacyOption: {
        flex: 1,
        paddingVertical: UtilityMethods.hp(1.2),
        borderRadius: UtilityMethods.wp(2.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        alignItems: 'center',
        backgroundColor: Colors.white,
      },
      privacyOptionSelected: {
        borderColor: Colors.userProfilePurple,
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
      },
      privacyOptionText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textGrey,
      },
      privacyOptionTextSelected: {
        color: Colors.userProfilePurple,
        fontWeight: '700',
      },
      saveBtn: {
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(1.4),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: UtilityMethods.hp(2.5),
        marginBottom: UtilityMethods.hp(2),
      },
      saveBtnDisabled: {
        opacity: 0.6,
      },
      saveBtnText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
      },
      imagePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: UtilityMethods.wp(3),
        marginVertical: UtilityMethods.hp(0.8),
      },
      imagePreviewBox: {
        width: UtilityMethods.wp(16),
        height: UtilityMethods.wp(16),
        borderRadius: UtilityMethods.wp(2),
        backgroundColor: Colors.inputBackground,
        overflow: 'hidden',
      },
      imagePreviewImg: {
        width: '100%',
        height: '100%',
      },
      pickImageBtn: {
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(0.9),
        borderRadius: UtilityMethods.wp(2),
        borderWidth: 1,
        borderColor: Colors.userProfilePurple,
      },
      pickImageBtnText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.userProfilePurple,
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
          coverSource={
            group.coverUri ? { uri: group.coverUri } : null
          }
          avatarSource={
            group.avatarUri ? { uri: group.avatarUri } : null
          }
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
            {isUserAdmin ? (
              <TouchableOpacity
                style={styles.editGroupBtn}
                onPress={handleOpenEditModal}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Edit group details"
              >
                <Text style={styles.editGroupBtnText}>Edit Group</Text>
              </TouchableOpacity>
            ) : null}
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
            {isUserAdmin && (
              <TouchableOpacity
                style={styles.addMemberBtn}
                onPress={() => setAddModalVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.addMemberBtnText}>+ Add Member</Text>
              </TouchableOpacity>
            )}
            {group.members.map(member => (
              <GroupMemberRow
                key={member.id}
                member={member}
                onViewPress={onViewMember}
                canManageAdmins={isUserAdmin}
                isMemberOwner={member.id === group.ownerId}
                isCurrentViewer={member.id === currentUserId}
                onMakeAdminPress={handleMakeAdmin}
                onDismissAdminPress={handleDismissAdmin}
              />
            ))}
          </View>
        )}
      </View>

      {/* Edit Group Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Group Details</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalScroll} showsVerticalScrollIndicator={false}>
              {/* Cover Photo */}
              <Text style={styles.editFieldLabel}>Group Cover Photo</Text>
              <View style={styles.imagePickerRow}>
                <View style={styles.imagePreviewBox}>
                  {editCoverUri ? (
                    <Image source={{ uri: editCoverUri }} style={styles.imagePreviewImg} resizeMode="cover" />
                  ) : null}
                </View>
                <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickCover}>
                  <Text style={styles.pickImageBtnText}>
                    {editCoverUri ? 'Change Cover' : 'Upload Cover'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Avatar Photo */}
              <Text style={styles.editFieldLabel}>Group Icon / Avatar</Text>
              <View style={styles.imagePickerRow}>
                <View style={[styles.imagePreviewBox, { borderRadius: UtilityMethods.wp(8) }]}>
                  {editAvatarUri ? (
                    <Image source={{ uri: editAvatarUri }} style={styles.imagePreviewImg} resizeMode="cover" />
                  ) : null}
                </View>
                <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickAvatar}>
                  <Text style={styles.pickImageBtnText}>
                    {editAvatarUri ? 'Change Icon' : 'Upload Icon'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Group Name */}
              <Text style={styles.editFieldLabel}>Group Name</Text>
              <TextInput
                style={styles.editTextInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter group name"
                placeholderTextColor={Colors.placeholderGrey}
                maxLength={50}
              />

              {/* Description */}
              <Text style={styles.editFieldLabel}>Description</Text>
              <TextInput
                style={[styles.editTextInput, styles.editTextArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="What is this group about?"
                placeholderTextColor={Colors.placeholderGrey}
                multiline
                numberOfLines={3}
                maxLength={200}
              />

              {/* Privacy */}
              <Text style={styles.editFieldLabel}>Privacy</Text>
              <View style={styles.privacyRow}>
                <TouchableOpacity
                  style={[
                    styles.privacyOption,
                    editPrivacy === 'public' && styles.privacyOptionSelected,
                  ]}
                  onPress={() => setEditPrivacy('public')}
                >
                  <Text
                    style={[
                      styles.privacyOptionText,
                      editPrivacy === 'public' && styles.privacyOptionTextSelected,
                    ]}
                  >
                    Public
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.privacyOption,
                    editPrivacy === 'private' && styles.privacyOptionSelected,
                  ]}
                  onPress={() => setEditPrivacy('private')}
                >
                  <Text
                    style={[
                      styles.privacyOptionText,
                      editPrivacy === 'private' && styles.privacyOptionTextSelected,
                    ]}
                  >
                    Private
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, savingDetails && styles.saveBtnDisabled]}
                onPress={handleSaveGroupDetails}
                disabled={savingDetails}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {savingDetails ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Members to Group</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search users..."
              placeholderTextColor={Colors.placeholderGrey}
              value={userSearch}
              onChangeText={setUserSearch}
            />
            <ScrollView style={styles.modalUserList}>
              {nonMembers.length > 0 ? (
                nonMembers.map(u => (
                  <View key={u.id} style={styles.modalUserRow}>
                    <Image
                      source={
                        u.avatarUri
                          ? { uri: u.avatarUri }
                          : { uri: 'https://via.placeholder.com/100' }
                      }
                      style={styles.modalUserAvatar}
                    />
                    <Text style={styles.modalUserName} numberOfLines={1}>
                      {u.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.modalAddBtn}
                      onPress={() => handleAddUser(u)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalAddBtnText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  {userSearch ? 'No matching users found.' : 'All registered users are already members.'}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </MainLayout>
  );
}
