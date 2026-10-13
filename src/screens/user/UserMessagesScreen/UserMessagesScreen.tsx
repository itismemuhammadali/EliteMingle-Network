import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import { ProfileAvatar } from '../../../components/general/ProfileAvatar';
import {
  UserMessagesHeader,
  UserMessageSearchBar,
  UserConversationCard,
  useAccessibilityModal,
} from '../../../components/user';
import { Colors } from '../../../constants/colors';
import type { UserMessageListItem } from '../../../constants/userMessagesData';
import type { UserStackParamList } from '../../../navigation/User/types';
import {
  subscribeToConversations,
  subscribeToAllUsers,
  type RegisteredUser,
} from '../../../services/chatService';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export function UserMessagesScreen() {
  // 1. All Hook calls grouped at the very top in strict order
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { openAccessibilityModal } = useAccessibilityModal();

  const [activeThreads, setActiveThreads] = useState<UserMessageListItem[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserId = auth().currentUser?.uid || '';

  // 2. Real-time subscriptions
  useEffect(() => {
    if (!currentUserId) return;

    const unsubConversations = subscribeToConversations(currentUserId, threads => {
      setActiveThreads(threads);
    });

    const unsubUsers = subscribeToAllUsers(currentUserId, users => {
      setRegisteredUsers(users);
    });

    return () => {
      unsubConversations();
      unsubUsers();
    };
  }, [currentUserId]);

  // 3. Navigation & action callbacks
  const onNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const onAccessibility = useCallback(() => {
    openAccessibilityModal();
  }, [openAccessibilityModal]);

  const openChat = useCallback(
    (item: UserMessageListItem) => {
      if (item.variant === 'group') {
        navigation.navigate('Chat', {
          conversationId: item.id,
          peerId: item.id,
          peerName: item.name,
          peerAvatarUri: item.avatarUris?.[0] || '',
          statusText: item.memberLabel,
          isOnlineStatus: false,
        });
      } else {
        navigation.navigate('Chat', {
          conversationId: item.id,
          peerId: item.peerId || item.id,
          peerName: item.name,
          peerAvatarUri: item.avatarUri,
          statusText: 'Online',
          isOnlineStatus: true,
        });
      }
    },
    [navigation],
  );

  const openChatWithUser = useCallback(
    (user: RegisteredUser) => {
      navigation.navigate('Chat', {
        peerId: user.id,
        peerName: user.name,
        peerAvatarUri: user.avatarUri || '',
        statusText: 'Online',
        isOnlineStatus: true,
      });
    },
    [navigation],
  );

  // 4. Enriched threads and filtered lists computation
  const enrichedThreads = useMemo(() => {
    const userMap = new Map(registeredUsers.map(u => [u.id, u]));
    return activeThreads.map(thread => {
      if (thread.variant === 'direct') {
        const pId = thread.peerId || thread.id;
        const regUser = userMap.get(pId);
        if (regUser && regUser.name && regUser.name !== 'Anonymous User') {
          return {
            ...thread,
            peerId: pId,
            name: regUser.name,
            avatarUri: thread.avatarUri || regUser.avatarUri || '',
          };
        }
      }
      return thread;
    });
  }, [activeThreads, registeredUsers]);

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enrichedThreads;
    return enrichedThreads.filter(t => t.name.toLowerCase().includes(q));
  }, [enrichedThreads, searchQuery]);

  const filteredNewUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const existingPeerIds = new Set(
      enrichedThreads
        .map(t => (t.variant === 'direct' ? t.peerId || t.id : ''))
        .filter(Boolean),
    );

    const available = registeredUsers.filter(u => !existingPeerIds.has(u.id));
    if (!q) return available;
    return available.filter(u => u.name.toLowerCase().includes(q));
  }, [enrichedThreads, registeredUsers, searchQuery]);

  const renderThreadItem = useCallback(
    ({ item }: { item: UserMessageListItem }) => {
      const cardProps = { ...item };
      delete (cardProps as any).id;
      delete (cardProps as any).peerId;
      return (
        <UserConversationCard
          {...cardProps}
          onPress={() => openChat(item)}
        />
      );
    },
    [openChat],
  );

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={false}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.userFeedBackground}
    >
      <View style={styles.root}>
        <UserMessagesHeader
          onBellPress={onNotifications}
          onAccessibilityPress={onAccessibility}
        />
        <UserMessageSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search messages or registered users..."
        />
        <FlatList
          style={styles.list}
          data={filteredThreads}
          keyExtractor={item => item.id}
          renderItem={renderThreadItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            filteredThreads.length > 0 ? (
              <Text style={styles.sectionHeader}>Conversations</Text>
            ) : null
          }
          ListFooterComponent={
            <View>
              {filteredNewUsers.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>
                    {filteredThreads.length > 0
                      ? 'Other Registered Users'
                      : 'Start a Chat with Registered Users'}
                  </Text>
                  {filteredNewUsers.map(user => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.userCard}
                      onPress={() => openChatWithUser(user)}
                      activeOpacity={0.8}
                    >
                      <ProfileAvatar
                        uri={user.avatarUri}
                        size={UtilityMethods.wp(12.5)}
                      />
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userBio}>{user.bio}</Text>
                      </View>
                      <View style={styles.startChatBtn}>
                        <Text style={styles.startChatBtnText}>Message</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              {filteredThreads.length === 0 && filteredNewUsers.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No users or messages found.</Text>
                </View>
              )}
            </View>
          }
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.userFeedBackground,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingBottom: UtilityMethods.hp(3),
  },
  sectionHeader: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: UtilityMethods.hp(1.5),
    marginBottom: UtilityMethods.hp(1),
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: UtilityMethods.wp(3.5),
    borderRadius: UtilityMethods.wp(3),
    marginBottom: UtilityMethods.hp(1),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  userAvatar: {
    width: UtilityMethods.wp(11),
    height: UtilityMethods.wp(11),
    borderRadius: UtilityMethods.wp(5.5),
    marginRight: UtilityMethods.wp(3),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.textDark,
  },
  userBio: {
    fontSize: FontSize.VALUE(12),
    color: Colors.placeholderGrey,
    marginTop: UtilityMethods.hp(0.2),
  },
  startChatBtn: {
    backgroundColor: Colors.userActiveTabPurple,
    paddingHorizontal: UtilityMethods.wp(3.5),
    paddingVertical: UtilityMethods.hp(0.8),
    borderRadius: UtilityMethods.wp(4),
  },
  startChatBtnText: {
    color: Colors.white,
    fontSize: FontSize.VALUE(12),
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: UtilityMethods.hp(4),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.VALUE(14),
    color: Colors.placeholderGrey,
  },
});
