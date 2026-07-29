import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/MainStack';
import MainLayout from '../../../components/general/MainLayout';
import {
  AdminHeader,
  SettingsCard,
  SettingsRow,
} from '../../../components/admin';
import { TextInputField } from '../../../components/general/TextInputField';
import {
  PersonIcon,
  EmailIconSmall,
  PhoneIcon,
  CameraIcon,
  LockIcon,
  ShieldIcon,
  NotificationIcon,
  MoonIcon,
  GlobeIcon,
  HelpIcon,
  LogoutIcon,
} from '../../../components/admin/icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

import { useAuth } from '../../../context/AuthContext';
import { Alert } from 'react-native';

const DEFAULT_AVATAR_URL = 'https://i.pravatar.cc/300?u=admin-user';

interface AdminSettingsScreenProps {
  onNotificationPress?: () => void;
}

export function AdminSettingsScreen({
  onNotificationPress,
}: AdminSettingsScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const { signOut } = useAuth();

  const handleLogout = () => {
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
  };


  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Administrator');
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const currentUser = auth().currentUser;

  // Load the signed-in admin's real profile.
  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot(snap => {
        const d = snap?.data() || {};
        setFullName(d.fullName || d.displayName || currentUser?.displayName || '');
        setEmail(d.email || currentUser?.email || '');
        setPhone(d.phone || '');
        setRole(d.role || 'Administrator');
        const a = d.avatarUri || d.profilePicture || '';
        setAvatarUri(a && String(a).startsWith('http') ? a : undefined);
      });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    const uid = currentUser?.uid;
    if (!uid) return;
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .set(
          {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      if (fullName.trim() && fullName.trim() !== currentUser?.displayName) {
        await currentUser?.updateProfile({ displayName: fullName.trim() });
      }
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      console.error('Admin profile save failed:', err);
      Alert.alert('Error', 'Could not save your profile.');
    }
  };


  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={false}
      barStyle="dark-content"
      statusbarBackgrund="#FFFFFF"
      bottomColor={Colors.adminBackgroundGrey}
    >
      <View style={{ paddingTop: UtilityMethods.hp(0.6) }}>
        <AdminHeader
          title="Settings"
          subtitle="Manage your account preferences"
          showDivider={false}
          hasNotificationBadge={false}
          rightSlot={<View />}
        />
      </View>
      <View style={styles.headerBottom}>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
        <SettingsCard title="Profile">
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: avatarUri || DEFAULT_AVATAR_URL }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <CameraIcon size={UtilityMethods.wp(4)} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{fullName || 'Admin'}</Text>
          <Text style={styles.profileRole}>{role}</Text>
        </View>

        <TextInputField
          label="Full Name"
          placeholder="Admin User"
          value={fullName}
          onChangeText={setFullName}
          leftIconName="icon"
          leftIcon={
            <PersonIcon
              size={UtilityMethods.wp(5)}
              color={Colors.adminStatsBlue}
            />
          }
        />
        <TextInputField
          label="Email Address"
          placeholder="admin@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIconName="icon"
          leftIcon={
            <EmailIconSmall
              size={UtilityMethods.wp(5)}
              color={Colors.primaryPurple}
            />
          }
        />
        <TextInputField
          label="Phone Number"
          placeholder="+1 234-567-8900"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIconName="icon"
          leftIcon={
            <PhoneIcon
              size={UtilityMethods.wp(5)}
              color={Colors.adminStatsGreen}
            />
          }
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </SettingsCard>

      <SettingsCard title="Security">
        <SettingsRow
          icon={
            <LockIcon
              size={UtilityMethods.wp(5)}
              color={Colors.adminStatsBlue}
            />
          }
          iconBgColor="rgba(76, 125, 255, 0.15)"
          title="Change Password"
          subtitle="Update your password"
          showChevron
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <SettingsRow
          icon={
            <ShieldIcon
              size={UtilityMethods.wp(5)}
              color={Colors.adminStatsGreen}
            />
          }
          iconBgColor="rgba(46, 204, 113, 0.15)"
          title="Two-Factor Auth"
          subtitle="Extra security layer"
          showToggle
          toggleValue={twoFactorEnabled}
          onToggleChange={setTwoFactorEnabled}
        />
      </SettingsCard>

      <SettingsCard title="Preferences">
        <SettingsRow
          icon={
            <NotificationIcon
              size={UtilityMethods.wp(5)}
              color={Colors.primaryPurple}
            />
          }
          iconBgColor={Colors.lightPurple}
          title="Notifications"
          subtitle="Push notifications"
          showToggle
          toggleValue={notificationsEnabled}
          onToggleChange={setNotificationsEnabled}
        />
        <SettingsRow
          icon={
            <MoonIcon
              size={UtilityMethods.wp(5)}
              color={Colors.adminStatsBlue}
            />
          }
          iconBgColor="rgba(76, 125, 255, 0.15)"
          title="Dark Mode"
          subtitle="Toggle dark theme"
          showToggle
          toggleValue={darkModeEnabled}
          onToggleChange={setDarkModeEnabled}
        />
        <SettingsRow
          icon={<GlobeIcon size={UtilityMethods.wp(5)} color="#FF9800" />}
          iconBgColor="rgba(255, 152, 0, 0.15)"
          title="Language"
          subtitle="English (US)"
          showChevron
          onPress={() => navigation.navigate('Language')}
        />
        <SettingsRow
          icon={
            <HelpIcon
              size={UtilityMethods.wp(5)}
              color={Colors.adminStatsBlue}
            />
          }
          iconBgColor="rgba(76, 125, 255, 0.15)"
          title="Help & Support"
          subtitle="Get help and contact us"
          showChevron
          onPress={() => navigation.navigate('HelpSupport')}
        />
      </SettingsCard>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >

        <LogoutIcon size={UtilityMethods.wp(5)} color={Colors.adminErrorRed} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
    backgroundColor: Colors.adminBackgroundGrey,
  },
  headerBottom: {
    backgroundColor: Colors.adminBackgroundGrey,
    paddingBottom: 0,
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(2),
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: UtilityMethods.hp(1),
  },
  avatar: {
    width: UtilityMethods.wp(22),
    height: UtilityMethods.wp(22),
    borderRadius: UtilityMethods.wp(11),
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: UtilityMethods.wp(10),
    height: UtilityMethods.wp(10),
    borderRadius: UtilityMethods.wp(5),
    backgroundColor: Colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  profileRole: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(0.5),
  },
  saveButton: {
    width: '100%',
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: UtilityMethods.hp(0.5),
  },
  saveButtonText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '600',
    color: Colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    backgroundColor: Colors.white,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(3),
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '600',
    color: Colors.adminErrorRed,
  },
});
