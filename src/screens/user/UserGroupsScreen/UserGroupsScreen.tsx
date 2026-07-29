import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import {
  UserHeaderSection,
  UserGroupsSectionHeader,
  UserGroupCard,
  useAccessibilityModal,
  useUserProfile,
} from '../../../components/user';
import { Colors } from '../../../constants/colors';
import type { UserGroupMock } from '../../../constants/userGroupsData';
import {
  subscribeToUserGroups,
  subscribeToDiscoverGroups,
  joinGroup,
} from '../../../services/groupService';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export function UserGroupsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { profile } = useUserProfile();
  const [groups, setGroups] = useState<UserGroupMock[]>([]);
  const [discover, setDiscover] = useState<UserGroupMock[]>([]);
  const currentUserId = auth().currentUser?.uid || 'dev_user_123';

  const headerDisplayName = profile.displayName
    ? profile.displayName.length > 12
      ? `${profile.displayName.substring(0, 11)}...`
      : profile.displayName
    : 'User';

  useEffect(() => {
    const unsubMine = subscribeToUserGroups(currentUserId, setGroups);
    const unsubDiscover = subscribeToDiscoverGroups(currentUserId, setDiscover);
    return () => {
      unsubMine();
      unsubDiscover();
    };
  }, [currentUserId]);

  const handleJoin = useCallback(
    (groupId: string) => {
      joinGroup(groupId, currentUserId).catch(err =>
        console.error('Failed to join group:', err),
      );
    },
    [currentUserId],
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreateGroup');
  }, [navigation]);

  const onNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const { openAccessibilityModal } = useAccessibilityModal();
  const onAccessibility = useCallback(() => {
    openAccessibilityModal();
  }, [openAccessibilityModal]);

  const onAvatarPress = useCallback(() => {
    navigation.navigate('UserMain', { openTab: 'Profile' });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: UserGroupMock }) => (
      <UserGroupCard
        item={item}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: UserGroupMock) => item.id, []);

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.userFeedBackground}
      bottomColor={Colors.userFeedBackground}
    >
      <View style={styles.root}>
        <UserHeaderSection
          displayName={headerDisplayName}
          avatarUri={profile.avatarUri || undefined}
          greeting="Good Morning"
          onBellPress={onNotifications}
          onAccessibilityPress={onAccessibility}
          onAvatarPress={onAvatarPress}
        />

        <FlatList
          data={groups}
          numColumns={2}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={
            <UserGroupsSectionHeader onCreatePress={handleCreatePress} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              You haven't joined any groups yet. Tap "Create" to start one.
            </Text>
          }
          ListFooterComponent={
            discover.length > 0 ? (
              <View style={styles.discoverSection}>
                <Text style={styles.discoverHeading}>Discover Groups</Text>
                {discover.map(g => (
                  <View key={g.id} style={styles.discoverRow}>
                    <View
                      style={[
                        styles.discoverIcon,
                        { backgroundColor: g.iconBackgroundColor },
                      ]}
                    />
                    <View style={styles.discoverInfo}>
                      <Text style={styles.discoverName} numberOfLines={1}>
                        {g.name}
                      </Text>
                      <Text style={styles.discoverMeta}>
                        {`${g.memberCount} member${g.memberCount === 1 ? '' : 's'}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.joinBtn}
                      onPress={() => handleJoin(g.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.joinBtnText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null
          }
          columnWrapperStyle={groups.length > 0 ? styles.columnWrapper : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  listContent: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingBottom: UtilityMethods.hp(3),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  empty: {
    textAlign: 'center',
    color: Colors.placeholderGrey,
    fontSize: FontSize.VALUE(14),
    paddingHorizontal: UtilityMethods.wp(8),
    paddingVertical: UtilityMethods.hp(4),
    lineHeight: FontSize.VALUE(21),
  },
  discoverSection: {
    marginTop: UtilityMethods.hp(2),
  },
  discoverHeading: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(1.5),
  },
  discoverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3.5),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderGrey,
    paddingHorizontal: UtilityMethods.wp(3.5),
    paddingVertical: UtilityMethods.hp(1.5),
    marginBottom: UtilityMethods.hp(1.25),
  },
  discoverIcon: {
    width: UtilityMethods.wp(11),
    height: UtilityMethods.wp(11),
    borderRadius: UtilityMethods.wp(3),
    marginRight: UtilityMethods.wp(3),
  },
  discoverInfo: {
    flex: 1,
    minWidth: 0,
  },
  discoverName: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.textDark,
  },
  discoverMeta: {
    marginTop: UtilityMethods.hp(0.25),
    fontSize: FontSize.VALUE(12),
    color: Colors.placeholderGrey,
  },
  joinBtn: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingVertical: UtilityMethods.hp(1),
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: Colors.primaryPurple,
  },
  joinBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.VALUE(13),
  },
});
