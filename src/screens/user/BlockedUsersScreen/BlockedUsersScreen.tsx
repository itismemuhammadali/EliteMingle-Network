import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import { UserSearchIcon } from '../../../components/user/icons';
import { UnblockUserModal } from '../../../components/user/UnblockUserModal';
import { Colors } from '../../../constants/colors';
import { type BlockedUserMock } from '../../../constants/blockedUsersMock';
import {
  subscribeToBlockedUsers,
  unblockUser,
} from '../../../services/moderationService';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';
import UserBlockedIcon from '../../../assets/Icons/profile/blockedUsers/userBlocked.svg';

const H_PAD = UtilityMethods.wp(5);
const AV = UtilityMethods.wp(13);
const AVATAR_GREY = '#9CA3AF';

export function BlockedUsersScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<BlockedUserMock[]>([]);
  const [unblockTarget, setUnblockTarget] = useState<BlockedUserMock | null>(
    null,
  );
  const currentUserId = auth().currentUser?.uid || '';

  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = subscribeToBlockedUsers(currentUserId, setUsers);
    return () => unsubscribe();
  }, [currentUserId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return users;
    }
    return users.filter(u => u.name.toLowerCase().includes(q));
  }, [query, users]);

  const countLabel = useMemo(() => {
    const n = filtered.length;
    return `${n} User${n === 1 ? '' : 's'} Blocked`;
  }, [filtered.length]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const closeUnblockModal = useCallback(() => setUnblockTarget(null), []);

  const confirmUnblock = useCallback(() => {
    if (unblockTarget) {
      unblockUser(currentUserId, unblockTarget.id).catch(err =>
        console.error('Failed to unblock:', err),
      );
    }
    setUnblockTarget(null);
  }, [unblockTarget, currentUserId]);

  const onBackToSettings = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      scrollContent: {
        paddingBottom: UtilityMethods.hp(4),
        backgroundColor: Colors.userFeedBackground,
      },
      navWrap: {
        backgroundColor: Colors.white,
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
        paddingTop: UtilityMethods.hp(1.75),
      },
      infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.changePasswordInfoBg,
        borderWidth: 1,
        borderColor: Colors.changePasswordInfoBorder,
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(1.75),
      },
      infoBannerText: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      infoBannerTitle: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '600',
        color: Colors.changePasswordInfoTitle,
        marginBottom: UtilityMethods.hp(0.5),
      },
      infoBannerSub: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.changePasswordInfoText,
        opacity: 0.88,
        lineHeight: FontSize.VALUE(19),
      },
      searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        borderRadius: UtilityMethods.wp(8),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.35),
        marginBottom: UtilityMethods.hp(1.5),
      },
      searchInput: {
        flex: 1,
        marginLeft: UtilityMethods.wp(2.5),
        paddingVertical: 0,
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
      },
      listHeader: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.userGroupMemberMeta,
        marginBottom: UtilityMethods.hp(1),
      },
      emptyHint: {
        fontSize: FontSize.VALUE(14),
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(1.5),
      },
      userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.35),
        paddingHorizontal: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(1.1),
      },
      avatar: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarInitials: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.white,
      },
      userTextCol: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      userName: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.25),
      },
      userMeta: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.userGroupMemberMeta,
      },
      unblockBtn: {
        paddingVertical: UtilityMethods.hp(0.65),
        paddingHorizontal: UtilityMethods.wp(3.5),
        borderRadius: UtilityMethods.wp(6),
        borderWidth: 1,
        borderColor: Colors.userProfilePurple,
        backgroundColor: Colors.white,
      },
      unblockBtnText: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.userProfilePurple,
      },
      howCard: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(4),
        marginTop: UtilityMethods.hp(1.5),
        marginBottom: UtilityMethods.hp(2),
      },
      howTitle: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.75),
      },
      howBody: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '400',
        color: Colors.userGroupMemberMeta,
        lineHeight: FontSize.VALUE(21),
      },
      footerBtn: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(8),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.75),
        alignItems: 'center',
        justifyContent: 'center',
      },
      footerBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
    }),
  );

  return (
    <MainLayout
      isScrollable={true}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.userFeedBackground}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.navWrap}>
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
              Blocked Users
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.infoBanner}>
          <UserBlockedIcon
            width={UtilityMethods.wp(6)}
            height={UtilityMethods.wp(6)}
            color={Colors.userProfilePurple}
          />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>About blocked users</Text>
            <Text style={styles.infoBannerSub}>
              Blocked users cannot see your profile, send you messages, or
              interact with your posts
            </Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <UserSearchIcon
            size={UtilityMethods.wp(4.5)}
            color={Colors.placeholderGrey}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search blocked users..."
            placeholderTextColor={Colors.placeholderGrey}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        <Text style={styles.listHeader}>{countLabel}</Text>

        {filtered.length === 0 ? (
          <Text style={styles.emptyHint}>
            {users.length === 0
              ? 'You have no blocked users.'
              : 'No blocked users match your search.'}
          </Text>
        ) : null}

        {filtered.map(item => (
          <View key={item.id} style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: AVATAR_GREY }]}>
              <Text style={styles.avatarInitials}>{item.initials}</Text>
            </View>
            <View style={styles.userTextCol}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userMeta}>{item.blockedLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.unblockBtn}
              onPress={() => setUnblockTarget(item)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Unblock ${item.name}`}
            >
              <Text style={styles.unblockBtnText}>Unblock</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.howCard}>
          <Text style={styles.howTitle}>How to block someone</Text>
          <Text style={styles.howBody}>
            Go to a user’s profile and tap the menu button (:), then select
            ‘Block User’ to prevent them from seeing your content and contacting
            you.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.footerBtn}
          onPress={onBackToSettings}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Back to settings"
        >
          <Text style={styles.footerBtnText}>Back to Settings</Text>
        </TouchableOpacity>
      </View>

      <UnblockUserModal
        visible={unblockTarget !== null}
        userName={unblockTarget?.name ?? ''}
        userInitials={unblockTarget?.initials ?? ''}
        onClose={closeUnblockModal}
        onConfirmUnblock={confirmUnblock}
      />
    </MainLayout>
  );
}
