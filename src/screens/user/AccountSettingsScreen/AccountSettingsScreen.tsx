import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import {
  subscribeToNotificationSettings,
  updateNotificationSettings,
} from '../../../services/notificationService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';
import EmailIcon from '../../../assets/Icons/EmailIcon.svg';
import UserIcon from '../../../assets/Icons/profile/accountSettings/user.svg';
import LockIcon from '../../../assets/Icons/profile/accountSettings/lock.svg';
import ShieldIcon from '../../../assets/Icons/profile/accountSettings/shield.svg';
import EyeOutlineIcon from '../../../assets/Icons/profile/accountSettings/eyeOutline.svg';
import TrashIcon from '../../../assets/Icons/profile/accountSettings/trash.svg';
import BellOutlineIcon from '../../../assets/Icons/profile/accountSettings/bellOutline.svg';
import PersonOutlineIcon from '../../../assets/Icons/profile/accountSettings/personOutline.svg';
import { DeleteAccountModal, useUserProfile } from '../../../components/user';
import { LogoutIcon } from '../../../components/admin/icons/LogoutIcon';

import { useAuth } from '../../../context/AuthContext';

const H_PAD = UtilityMethods.wp(5);
const ICON_BOX = UtilityMethods.wp(12);
const ICON_INNER = UtilityMethods.wp(5.25);


const ACCENT = {
  profile: {
    bg: 'rgba(128, 0, 128, 0.12)',
    fg: Colors.userProfilePurple,
  },
  email: {
    bg: '#E8F5E9',
    fg: '#2E7D32',
  },
  lock: {
    bg: '#FCE4EC',
    fg: '#C2185B',
  },
  shield: {
    bg: '#FFF3E0',
    fg: '#E65100',
  },
  eye: {
    bg: '#E3F2FD',
    fg: '#1565C0',
  },
  danger: {
    bg: '#FFEBEE',
    fg: '#D32F2F',
  },
} as const;

export function AccountSettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const currentUserId = auth().currentUser?.uid || 'dev_user_123';

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [friendReqNotif, setFriendReqNotif] = useState(true);
  const [groupInvNotif, setGroupInvNotif] = useState(true);

  // Load persisted notification preferences (default: all on).
  useEffect(() => {
    const unsubscribe = subscribeToNotificationSettings(currentUserId, s => {
      if (s.email !== undefined) setEmailNotif(s.email);
      if (s.push !== undefined) setPushNotif(s.push);
      if (s.friendRequests !== undefined) setFriendReqNotif(s.friendRequests);
      if (s.groupInvites !== undefined) setGroupInvNotif(s.groupInvites);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  const persistNotif = useCallback(
    (partial: Parameters<typeof updateNotificationSettings>[1]) => {
      updateNotificationSettings(currentUserId, partial).catch(err =>
        console.error('Failed to save notification setting:', err),
      );
    },
    [currentUserId],
  );

  const toggleEmail = useCallback(
    (v: boolean) => {
      setEmailNotif(v);
      persistNotif({ email: v });
    },
    [persistNotif],
  );
  const togglePush = useCallback(
    (v: boolean) => {
      setPushNotif(v);
      persistNotif({ push: v });
    },
    [persistNotif],
  );
  const toggleFriendReq = useCallback(
    (v: boolean) => {
      setFriendReqNotif(v);
      persistNotif({ friendRequests: v });
    },
    [persistNotif],
  );
  const toggleGroupInv = useCallback(
    (v: boolean) => {
      setGroupInvNotif(v);
      persistNotif({ groupInvites: v });
    },
    [persistNotif],
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSave = useCallback(() => {
    Alert.alert('Saved', 'Your settings have been updated.');
  }, []);

  const onPrivacySettings = useCallback(() => {
    navigation.navigate('PrivacySettings');
  }, [navigation]);

  const onBlockedUsers = useCallback(() => {
    navigation.navigate('BlockedUsers');
  }, [navigation]);

  const onChangePassword = useCallback(() => {
    navigation.navigate('UserChangePassword');
  }, [navigation]);

  const onEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const { signOut } = useAuth();

  const onLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.warn('Logout error:', error);
          }
        },
      },
    ]);
  }, [signOut]);



  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const onConfirmDeleteAccount = useCallback(() => {
    setDeleteAccountOpen(false);
    Alert.alert(
      'Account deleted',
      'Your account deletion request has been submitted.',
    );
  }, []);

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
        paddingTop: UtilityMethods.hp(6),
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
      sectionLabel: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(1),
      },
      sectionLabelDanger: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '700',
        color: Colors.adminErrorRed,
        marginBottom: UtilityMethods.hp(1),
      },
      sectionSpaced: {
        marginTop: UtilityMethods.hp(2),
      },
      soloCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(1.1),
      },
      iconBox: {
        width: ICON_BOX,
        height: ICON_BOX,
        borderRadius: UtilityMethods.wp(2.5),
        alignItems: 'center',
        justifyContent: 'center',
      },
      cardTextCol: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      cardTitle: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.35),
      },
      cardTitleDanger: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.adminErrorRed,
        marginBottom: UtilityMethods.hp(0.35),
      },
      cardSubtitle: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.userGroupMemberMeta,
        lineHeight: FontSize.VALUE(19),
      },
      groupCard: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        marginBottom: UtilityMethods.hp(1),
        overflow: 'hidden',
      },
      switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(1.25),
        paddingHorizontal: UtilityMethods.wp(4),
      },
      switchTextCol: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        marginRight: UtilityMethods.wp(2),
        minWidth: 0,
      },
      rowDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.borderGrey,
        marginHorizontal: UtilityMethods.wp(4),
      },
      dangerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: 1,
        borderColor: 'rgba(244, 67, 54, 0.45)',
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(2),
      },
      saveBtn: {
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(8),
        paddingVertical: UtilityMethods.hp(1.75),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: UtilityMethods.hp(0.5),
        marginBottom: UtilityMethods.hp(2),
      },
      saveBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.5),
        marginBottom: UtilityMethods.hp(1.5),
      },
      logoutText: {
        marginLeft: UtilityMethods.wp(2),
        fontSize: FontSize.VALUE(16),
        fontWeight: '600',
        color: '#D32F2F',
      },
    }),
  );

  const scrollContentContainerStyle =
    Platform.OS === 'android'
      ? [
          styles.scrollContent,
          {
            paddingBottom:
              UtilityMethods.hp(4) +
              Math.max(insets.bottom, UtilityMethods.hp(2.5)) +
              UtilityMethods.hp(1.5),
          },
        ]
      : styles.scrollContent;

  return (
    <MainLayout
      isScrollable={true}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.userFeedBackground}
      contentContainerStyle={scrollContentContainerStyle}
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
              Account Settings
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>Account Information</Text>
        <TouchableOpacity
          style={styles.soloCard}
          activeOpacity={0.75}
          onPress={onEditProfile}
        >
          <View
            style={[styles.iconBox, { backgroundColor: ACCENT.profile.bg }]}
          >
            <UserIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={ACCENT.profile.fg}
            />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle}>Edit Profile</Text>
            <Text style={styles.cardSubtitle}>
              Update your name, photo, and bio
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.soloCard}
          activeOpacity={0.75}
          onPress={() => Alert.alert('Email', 'Change email address.')}
        >
          <View style={[styles.iconBox, { backgroundColor: ACCENT.email.bg }]}>
            <EmailIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={ACCENT.email.fg}
            />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle}>Email Address</Text>
            <Text style={styles.cardSubtitle}>{profile.email}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.soloCard}
          activeOpacity={0.75}
          onPress={onChangePassword}
        >
          <View style={[styles.iconBox, { backgroundColor: ACCENT.lock.bg }]}>
            <LockIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={ACCENT.lock.fg}
            />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle}>Change Password</Text>
            <Text style={styles.cardSubtitle}>Update your password</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
          Notifications
        </Text>
        <View style={styles.groupCard}>
          <View style={styles.switchRow}>
            <BellOutlineIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={Colors.textDark}
            />
            <View style={styles.switchTextCol}>
              <Text style={styles.cardTitle}>Email Notifications</Text>
              <Text style={styles.cardSubtitle}>Receive updates via email</Text>
            </View>
            <Switch
              value={emailNotif}
              onValueChange={toggleEmail}
              trackColor={{
                false: '#E5E5E5',
                true: Colors.userProfilePurple,
              }}
              thumbColor={Colors.white}
              ios_backgroundColor="#E5E5E5"
            />
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.switchRow}>
            <BellOutlineIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={Colors.textDark}
            />
            <View style={styles.switchTextCol}>
              <Text style={styles.cardTitle}>Push Notifications</Text>
              <Text style={styles.cardSubtitle}>
                Get notified on your device
              </Text>
            </View>
            <Switch
              value={pushNotif}
              onValueChange={togglePush}
              trackColor={{
                false: '#E5E5E5',
                true: Colors.userProfilePurple,
              }}
              thumbColor={Colors.white}
              ios_backgroundColor="#E5E5E5"
            />
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.switchRow}>
            <PersonOutlineIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={Colors.textDark}
            />
            <View style={styles.switchTextCol}>
              <Text style={styles.cardTitle}>Friend Requests</Text>
              <Text style={styles.cardSubtitle}>
                Notify me of new friend requests
              </Text>
            </View>
            <Switch
              value={friendReqNotif}
              onValueChange={toggleFriendReq}
              trackColor={{
                false: '#E5E5E5',
                true: Colors.userProfilePurple,
              }}
              thumbColor={Colors.white}
              ios_backgroundColor="#E5E5E5"
            />
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.switchRow}>
            <PersonOutlineIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={Colors.textDark}
            />
            <View style={styles.switchTextCol}>
              <Text style={styles.cardTitle}>Group Invites</Text>
              <Text style={styles.cardSubtitle}>
                Notify me of group invitations
              </Text>
            </View>
            <Switch
              value={groupInvNotif}
              onValueChange={toggleGroupInv}
              trackColor={{
                false: '#E5E5E5',
                true: Colors.userProfilePurple,
              }}
              thumbColor={Colors.white}
              ios_backgroundColor="#E5E5E5"
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
          Privacy & Security
        </Text>
        <TouchableOpacity
          style={styles.soloCard}
          activeOpacity={0.75}
          onPress={onPrivacySettings}
        >
          <View style={[styles.iconBox, { backgroundColor: ACCENT.shield.bg }]}>
            <ShieldIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={ACCENT.shield.fg}
            />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle}>Privacy Settings</Text>
            <Text style={styles.cardSubtitle}>
              Control who can see your content
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.soloCard}
          activeOpacity={0.75}
          onPress={onBlockedUsers}
        >
          <View style={[styles.iconBox, { backgroundColor: ACCENT.eye.bg }]}>
            <EyeOutlineIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={ACCENT.eye.fg}
            />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle}>Blocked Users</Text>
            <Text style={styles.cardSubtitle}>Manage blocked accounts</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionLabelDanger, styles.sectionSpaced]}>
          Danger Zone
        </Text>
        <TouchableOpacity
          style={styles.dangerCard}
          activeOpacity={0.75}
          onPress={() => setDeleteAccountOpen(true)}
        >
          <View style={[styles.iconBox, { backgroundColor: ACCENT.danger.bg }]}>
            <TrashIcon
              width={ICON_INNER}
              height={ICON_INNER}
              color={ACCENT.danger.fg}
            />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitleDanger}>Delete Account</Text>
            <Text style={styles.cardSubtitle}>
              Permanently delete your account
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.75}
          onPress={onLogout}
        >
          <LogoutIcon size={UtilityMethods.wp(5)} color="#D32F2F" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={onSave}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <DeleteAccountModal
        visible={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onConfirmDelete={onConfirmDeleteAccount}
      />
    </MainLayout>
  );
}
