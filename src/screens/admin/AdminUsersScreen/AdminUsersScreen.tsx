import React, { useCallback, useMemo, useState } from 'react';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import {
  AdminSearchBar,
  FilterPills,
  UserCard,
  FAB,
  AdminHeader,
} from '../../../components/admin';
import { NotificationIcon } from '../../../components/admin/icons';
import { ConfirmationModal } from '../../../components/admin/modal';
import type {
  UserCardData,
  UserStatus,
} from '../../../components/admin/UserCard';
import type { FilterOption } from '../../../components/admin/FilterPills';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import { useUsersList } from '../../../context/UsersListContext';
import type { RootStackParamList } from '../../../navigation/MainStack';

interface AdminUsersScreenProps {
  onHeaderUpdate?: (subtitle: string) => void;
  onNotificationPress?: () => void;
}

export function AdminUsersScreen({
  onHeaderUpdate,
  onNotificationPress,
}: AdminUsersScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const { users, updateUser, deleteUser } = useUsersList();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [suspendModalUser, setSuspendModalUser] = useState<UserCardData | null>(
    null,
  );
  const [deleteModalUser, setDeleteModalUser] = useState<UserCardData | null>(
    null,
  );

  const filterOptions = useMemo((): FilterOption[] => {
    const all = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const pending = users.filter(u => u.status === 'pending').length;
    return [
      { id: 'all', label: 'All', count: all },
      { id: 'active', label: 'Active', count: active },
      { id: 'inactive', label: 'Inactive', count: inactive },
      { id: 'pending', label: 'Pending', count: pending },
    ];
  }, [users]);

  const filteredUsers = useMemo(() => {
    let result = users;

    if (activeFilter !== 'all') {
      result = result.filter(u => u.status === (activeFilter as UserStatus));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        u =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }

    return result;
  }, [users, searchQuery, activeFilter]);

  const displayCount = filteredUsers.length;
  const subtitle = `${displayCount} user${displayCount !== 1 ? 's' : ''} found`;

  // Notify parent of header update
  React.useEffect(() => {
    onHeaderUpdate?.(subtitle);
  }, [subtitle, onHeaderUpdate]);

  const handleEdit = useCallback(
    (user: UserCardData) => {
      navigation.navigate('EditUser', { userId: user.id });
    },
    [navigation],
  );

  const handleSuspend = useCallback((user: UserCardData) => {
    setSuspendModalUser(user);
  }, []);

  const handleApprove = useCallback(
    (user: UserCardData) => {
      updateUser(user.id, { status: 'active' });
    },
    [updateUser],
  );

  const handleDelete = useCallback((user: UserCardData) => {
    setDeleteModalUser(user);
  }, []);

  const handleAddUser = useCallback(() => {
    navigation.navigate('AddNewUser');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <MainLayout
        isScrollable={true}
        includeSafeArea={false}
        barStyle="dark-content"
        statusbarBackgrund="#FFFFFF"
        bottomColor={Colors.adminBackgroundGrey}
        contentContainerStyle={styles.content}
      >
        <AdminHeader
          title="User Management"
          subtitle={`${displayCount} user${
            displayCount !== 1 ? 's' : ''
          } found`}
          hasNotificationBadge={true}
          onRightIconPress={onNotificationPress}
          rightSlot={
            <TouchableOpacity
              onPress={onNotificationPress}
              activeOpacity={0.7}
              style={styles.bellButton}
            >
              <NotificationIcon
                size={UtilityMethods.wp(6)}
                color={Colors.adminInactiveGrey}
              />
              <View style={styles.badgeOnBell} />
            </TouchableOpacity>
          }
        />

        <AdminSearchBar
          placeholder="Search by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FilterPills
          options={filterOptions}
          activeId={activeFilter}
          onSelect={setActiveFilter}
          style={{ marginTop: UtilityMethods.hp(1.5) }}
        />

        <View style={styles.list}>
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onSuspend={handleSuspend}
              onApprove={handleApprove}
              onDelete={handleDelete}
            />
          ))}
        </View>
      </MainLayout>

      <ConfirmationModal
        visible={!!suspendModalUser}
        type="suspendUser"
        entityName={suspendModalUser?.name ?? ''}
        onConfirm={() => {
          if (suspendModalUser) {
            updateUser(suspendModalUser.id, { status: 'inactive' });
          }
          setSuspendModalUser(null);
        }}
        onCancel={() => setSuspendModalUser(null)}
      />
      <ConfirmationModal
        visible={!!deleteModalUser}
        type="deleteUser"
        entityName={deleteModalUser?.name ?? ''}
        onConfirm={() => {
          if (deleteModalUser) {
            deleteUser(deleteModalUser.id);
          }
          setDeleteModalUser(null);
        }}
        onCancel={() => setDeleteModalUser(null)}
      />

      <FAB onPress={handleAddUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.adminBackgroundGrey,
  },
  scroll: {
    flex: 1,
  },
  content: {
    backgroundColor: Colors.adminBackgroundGrey,
    flexGrow: 1,
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
  },
  list: {
    marginTop: UtilityMethods.hp(1.5),
  },
  bellButton: {
    borderRadius: 50,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGreyNotification,
    padding: UtilityMethods.wp(2),
    position: 'relative',
    marginRight: -UtilityMethods.wp(4.5),
  },
  badgeOnBell: {
    position: 'absolute',
    top: UtilityMethods.hp(0.35),
    right: UtilityMethods.wp(1.25),
    width: UtilityMethods.wp(2),
    height: UtilityMethods.wp(2),
    borderRadius: UtilityMethods.wp(1),
    backgroundColor: Colors.adminNotificationBadge,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});
