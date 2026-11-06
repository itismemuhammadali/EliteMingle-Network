import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  ToastAndroid,
  Alert,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { incrementShareCount, formatStorageUrl } from '../../services/postService';
import {
  subscribeToConversations,
  subscribeToAllUsers,
  getOrCreateDirectConversation,
  getOrCreateGroupConversation,
  sendMessage,
  type RegisteredUser,
} from '../../services/chatService';
import { subscribeToUserGroups } from '../../services/groupService';
import type { UserFeedPost } from '../../constants/userFeedData';
import type { UserGroupMock } from '../../constants/userGroupsData';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

function SearchIcon({ size = 18, color = Colors.placeholderGrey }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LinkIcon({ size = 16, color = Colors.userProfilePurple }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon({ size = 14, color = '#10B981' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface PostCardShareMenuProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  post?: UserFeedPost;
}

interface ShareTarget {
  key: string;
  type: 'chat' | 'group';
  id: string;
  conversationId?: string;
  peerId?: string;
  groupId?: string;
  name: string;
  avatarUri?: string;
  subtitle: string;
}

export function PostCardShareMenu({
  visible,
  onClose,
  postId,
  post,
}: PostCardShareMenuProps) {
  const currentUserId = auth().currentUser?.uid || '';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'chats' | 'groups'>('all');
  const [conversations, setConversations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);
  const [groups, setGroups] = useState<UserGroupMock[]>([]);
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const [sentKeys, setSentKeys] = useState<Set<string>>(new Set());

  // Subscribe to user's chats, registered users, and joined groups
  useEffect(() => {
    if (!visible || !currentUserId) return;
    const unsubConv = subscribeToConversations(currentUserId, setConversations);
    const unsubUsers = subscribeToAllUsers(currentUserId, setAllUsers);
    const unsubGroups = subscribeToUserGroups(currentUserId, setGroups);
    return () => {
      unsubConv();
      unsubUsers();
      unsubGroups();
    };
  }, [visible, currentUserId]);

  // Combine and deduplicate targets
  const targets = useMemo<ShareTarget[]>(() => {
    const list: ShareTarget[] = [];
    const seenPeerIds = new Set<string>();
    const seenGroupIds = new Set<string>();

    // 1. Existing Active Conversations
    conversations.forEach(c => {
      if (c.variant === 'group') {
        const gId = c.id.replace(/^group_/, '');
        seenGroupIds.add(gId);
        list.push({
          key: `conv_group_${c.id}`,
          type: 'group',
          id: c.id,
          conversationId: c.id,
          groupId: gId,
          name: c.name || 'Group Chat',
          avatarUri: c.avatarUris?.[0],
          subtitle: c.memberLabel || 'Group Chat',
        });
      } else {
        seenPeerIds.add(c.peerId);
        list.push({
          key: `conv_peer_${c.peerId}`,
          type: 'chat',
          id: c.id,
          conversationId: c.id,
          peerId: c.peerId,
          name: c.name || 'Member',
          avatarUri: c.avatarUri,
          subtitle: 'Direct message',
        });
      }
    });

    // 2. User's Groups (not already listed in active conversations)
    groups.forEach(g => {
      if (!seenGroupIds.has(g.id)) {
        seenGroupIds.add(g.id);
        list.push({
          key: `group_${g.id}`,
          type: 'group',
          id: g.id,
          groupId: g.id,
          name: g.name,
          avatarUri: g.avatarUri || g.coverUri,
          subtitle: `${g.memberCount} members`,
        });
      }
    });

    // 3. Registered Users (not already in conversations)
    allUsers.forEach(u => {
      if (u.id !== currentUserId && !seenPeerIds.has(u.id)) {
        seenPeerIds.add(u.id);
        list.push({
          key: `user_${u.id}`,
          type: 'chat',
          id: u.id,
          peerId: u.id,
          name: u.name,
          avatarUri: u.avatarUri,
          subtitle: 'Direct message',
        });
      }
    });

    return list;
  }, [conversations, groups, allUsers, currentUserId]);

  const filteredTargets = useMemo(() => {
    return targets.filter(t => {
      if (filter === 'chats' && t.type !== 'chat') return false;
      if (filter === 'groups' && t.type !== 'group') return false;
      if (!search.trim()) return true;
      return t.name.toLowerCase().includes(search.trim().toLowerCase());
    });
  }, [targets, filter, search]);

  const handleSend = useCallback(
    async (target: ShareTarget) => {
      if (!currentUserId || sendingKey) return;
      setSendingKey(target.key);
      try {
        let convId = target.conversationId;
        if (!convId) {
          if (target.type === 'group' && target.groupId) {
            convId = await getOrCreateGroupConversation(
              target.groupId,
              target.name,
              [currentUserId],
              target.avatarUri,
            );
          } else if (target.peerId) {
            convId = await getOrCreateDirectConversation(currentUserId, target.peerId);
          }
        }

        if (!convId) {
          throw new Error('Could not establish chat conversation.');
        }

        const exactLink = `https://epm.app/post/${postId}`;
        await sendMessage({
          conversationId: convId,
          senderId: currentUserId,
          text: `Check out this post: ${exactLink}`,
          postShare: {
            postId,
            authorName: post?.userName || 'User',
            content: post?.content || '',
            mediaUrl: post?.mediaUrl || post?.imageUrl || post?.videoUrl,
            mediaType: post?.mediaType,
          },
        });

        // Best effort share count increment
        incrementShareCount(postId).catch(err =>
          console.warn('Share tally error:', err),
        );

        setSentKeys(prev => new Set(prev).add(target.key));

        if (Platform.OS === 'android') {
          ToastAndroid.show(`Post shared to ${target.name}!`, ToastAndroid.SHORT);
        } else {
          Alert.alert('Shared', `Post shared to ${target.name}!`);
        }
      } catch (err: any) {
        console.error('Failed to share post:', err);
        Alert.alert('Error', err?.message || 'Failed to share post.');
      } finally {
        setSendingKey(null);
      }
    },
    [currentUserId, sendingKey, postId, post],
  );

  const handleCopyLink = useCallback(() => {
    const link = `https://epm.app/post/${postId}`;
    Clipboard.setString(link);
    incrementShareCount(postId).catch(() => {});
    if (Platform.OS === 'android') {
      ToastAndroid.show('Post link copied to clipboard!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', 'Post link copied to clipboard!');
    }
  }, [postId]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      },
      sheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: UtilityMethods.wp(5),
        borderTopRightRadius: UtilityMethods.wp(5),
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2.5),
        paddingBottom: UtilityMethods.hp(4),
        maxHeight: '82%',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: UtilityMethods.hp(1.5),
      },
      title: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      closeBtn: {
        padding: UtilityMethods.wp(1.5),
      },
      closeText: {
        fontSize: FontSize.VALUE(18),
        color: Colors.textGrey,
      },
      searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(3),
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1),
        marginBottom: UtilityMethods.hp(1.5),
      },
      searchInput: {
        flex: 1,
        marginLeft: UtilityMethods.wp(2.5),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
        padding: 0,
      },
      filterRow: {
        flexDirection: 'row',
        gap: UtilityMethods.wp(2),
        marginBottom: UtilityMethods.hp(1.5),
      },
      filterChip: {
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(0.6),
        borderRadius: UtilityMethods.wp(4),
        backgroundColor: Colors.inputBackground,
      },
      filterChipActive: {
        backgroundColor: Colors.userProfilePurple,
      },
      filterChipText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.textGrey,
      },
      filterChipTextActive: {
        color: Colors.white,
      },
      list: {
        maxHeight: UtilityMethods.hp(40),
      },
      targetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(1.1),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      avatar: {
        width: UtilityMethods.wp(11),
        height: UtilityMethods.wp(11),
        borderRadius: UtilityMethods.wp(5.5),
        backgroundColor: Colors.inputBackground,
        marginRight: UtilityMethods.wp(3),
      },
      avatarGroup: {
        borderRadius: UtilityMethods.wp(2.5),
      },
      nameCol: {
        flex: 1,
        minWidth: 0,
        marginRight: UtilityMethods.wp(2),
      },
      name: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.2),
      },
      subtitle: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
      },
      sendBtn: {
        backgroundColor: Colors.userProfilePurple,
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(0.8),
        borderRadius: UtilityMethods.wp(5),
        minWidth: UtilityMethods.wp(18),
        alignItems: 'center',
        justifyContent: 'center',
      },
      sendBtnSent: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 1,
        borderColor: '#10B981',
      },
      sendBtnText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(13),
        fontWeight: '700',
      },
      sendBtnTextSent: {
        color: '#10B981',
        fontWeight: '600',
      },
      emptyText: {
        textAlign: 'center',
        color: Colors.placeholderGrey,
        fontSize: FontSize.VALUE(14),
        paddingVertical: UtilityMethods.hp(4),
      },
      copyLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: UtilityMethods.hp(1.8),
        paddingVertical: UtilityMethods.hp(1.2),
        borderRadius: UtilityMethods.wp(2.5),
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
        borderWidth: 1,
        borderColor: Colors.userProfilePurple,
      },
      copyLinkText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.userProfilePurple,
        marginLeft: UtilityMethods.wp(2),
      },
    }),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share Post</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchBar}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats or groups..."
              placeholderTextColor={Colors.placeholderGrey}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {(['all', 'chats', 'groups'] as const).map(tabKey => (
              <TouchableOpacity
                key={tabKey}
                style={[
                  styles.filterChip,
                  filter === tabKey && styles.filterChipActive,
                ]}
                onPress={() => setFilter(tabKey)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === tabKey && styles.filterChipTextActive,
                  ]}
                >
                  {tabKey === 'all'
                    ? 'All'
                    : tabKey === 'chats'
                    ? 'Chats'
                    : 'Groups'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Target List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filteredTargets.length > 0 ? (
              filteredTargets.map(target => {
                const isSent = sentKeys.has(target.key);
                const isSending = sendingKey === target.key;
                const formattedAvatar = formatStorageUrl(target.avatarUri) || target.avatarUri;

                return (
                  <View key={target.key} style={styles.targetRow}>
                    <Image
                      source={
                        formattedAvatar
                          ? { uri: formattedAvatar }
                          : { uri: 'https://via.placeholder.com/100' }
                      }
                      style={[
                        styles.avatar,
                        target.type === 'group' && styles.avatarGroup,
                      ]}
                      resizeMode="cover"
                    />
                    <View style={styles.nameCol}>
                      <Text style={styles.name} numberOfLines={1}>
                        {target.name}
                      </Text>
                      <Text style={styles.subtitle} numberOfLines={1}>
                        {target.subtitle}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.sendBtn, isSent && styles.sendBtnSent]}
                      onPress={() => handleSend(target)}
                      disabled={isSent || isSending}
                      activeOpacity={0.8}
                    >
                      {isSending ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : isSent ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <CheckIcon size={12} color="#10B981" />
                          <Text style={[styles.sendBtnTextSent, { marginLeft: 3 }]}>Sent</Text>
                        </View>
                      ) : (
                        <Text style={styles.sendBtnText}>Send</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                {search ? 'No matching chats or groups found.' : 'No conversations available.'}
              </Text>
            )}
          </ScrollView>

          {/* Copy Post Link Button */}
          <TouchableOpacity style={styles.copyLinkRow} onPress={handleCopyLink} activeOpacity={0.85}>
            <LinkIcon />
            <Text style={styles.copyLinkText}>Copy Post Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
