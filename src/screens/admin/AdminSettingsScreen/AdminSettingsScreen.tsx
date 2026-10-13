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
  GlobeIcon,
  HelpIcon,
  LogoutIcon,
} from '../../../components/admin/icons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadAvatar } from '../../../services/postService';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getLocalizedRole } from '../../../services/databaseTranslationService';
import { Alert } from 'react-native';
import { ProfileAvatar } from '../../../components/general/ProfileAvatar';

interface AdminSettingsScreenProps {
  onNotificationPress?: () => void;
}

export function AdminSettingsScreen({
  onNotificationPress,
}: AdminSettingsScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const { signOut } = useAuth();
  const { t, language } = useLanguage();

  const handleLogout = () => {
    Alert.alert(
      t('adminSettings.logoutConfirmTitle', 'Logout'),
      t('adminSettings.logoutConfirmMessage', 'Are you sure you want to log out of your account?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('adminSettings.logout', 'Logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.warn('Logout error:', error);
            }
          },
        },
      ],
    );
  };


  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Administrator');
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
        if (d.twoFactorEnabled !== undefined) setTwoFactorEnabled(d.twoFactorEnabled);
        if (d.notificationsEnabled !== undefined) setNotificationsEnabled(d.notificationsEnabled);
      });
    return () => unsubscribe();
  }, [currentUser]);

  const handleToggleTwoFactor = async (val: boolean) => {
    setTwoFactorEnabled(val);
    const uid = currentUser?.uid;
    if (uid) {
      firestore()
        .collection('users')
        .doc(uid)
        .set({ twoFactorEnabled: val }, { merge: true })
        .catch(console.error);
    }
  };

  const handleToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    const uid = currentUser?.uid;
    if (uid) {
      firestore()
        .collection('users')
        .doc(uid)
        .set({ notificationsEnabled: val }, { merge: true })
        .catch(console.error);
    }
  };

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

  // Upload a newly-picked avatar to Storage and persist it.
  const applyAvatar = async (uri?: string) => {
    const uid = currentUser?.uid;
    if (!uri || !uid) return;
    try {
      const uploaded = await uploadAvatar(uid, uri);
      const finalUri = uploaded && uploaded.startsWith('http') ? uploaded : uri;
      setAvatarUri(finalUri);
      await firestore()
        .collection('users')
        .doc(uid)
        .set({ avatarUri: uploaded }, { merge: true });
    } catch (err) {
      console.error('Avatar update failed:', err);
      Alert.alert('Error', 'Could not update the picture.');
    }
  };

  const pickFromGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1, includeExtra: true },
      res => {
        if (res.didCancel || res.errorCode) return;
        applyAvatar(res.assets?.[0]?.uri);
      },
    );
  };

  const takePhoto = () => {
    launchCamera(
      { mediaType: 'photo', saveToPhotos: false, includeExtra: true },
      res => {
        if (res.didCancel) return;
        if (res.errorCode) {
          Alert.alert('Camera', res.errorMessage || 'Could not open the camera.');
          return;
        }
        applyAvatar(res.assets?.[0]?.uri);
      },
    );
  };

  const handlePickAvatar = () => {
    Alert.alert('Profile Picture', 'Choose a source', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };


  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={false}
      barStyle="dark-content"
      statusbarBackgrund={Colors.adminBackgroundGrey}
      bottomColor={Colors.adminBackgroundGrey}
    >
      <View style={{ paddingTop: UtilityMethods.hp(0.6) }}>
        <AdminHeader
          title={t('adminSettings.title', 'Settings')}
          subtitle={t('adminSettings.subtitle', 'Manage your account preferences')}
          showDivider={false}
          hasNotificationBadge={false}
          rightSlot={<View />}
        />
      </View>
      <View style={styles.headerBottom}>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
        <SettingsCard title={t('adminSettings.profileSection', 'Profile')}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <ProfileAvatar
              uri={avatarUri}
              size={UtilityMethods.wp(20)}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handlePickAvatar}
              activeOpacity={0.7}
            >
              <CameraIcon size={UtilityMethods.wp(4)} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{fullName || 'Admin'}</Text>
          <Text style={styles.profileRole}>{getLocalizedRole(role)}</Text>
        </View>

        <TextInputField
          label={t('adminSettings.fullName', 'Full Name')}
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
          label={t('adminSettings.emailAddress', 'Email Address')}
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
          label={t('adminSettings.phone', 'Phone Number')}
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
          <Text style={styles.saveButtonText}>{t('adminSettings.saveChanges', 'Save Changes')}</Text>
        </TouchableOpacity>
      </SettingsCard>

      <SettingsCard title={t('adminSettings.securitySection', 'Security')}>
        <SettingsRow
          icon={
            <LockIcon
              size={UtilityMethods.wp(5)}
              color={Colors.adminStatsBlue}
            />
          }
          iconBgColor="rgba(76, 125, 255, 0.15)"
          title={t('adminSettings.changePassword', 'Change Password')}
          subtitle={t('adminSettings.changePasswordSubtitle', 'Update your password')}
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
          title={t('adminSettings.twoFactor', 'Two-Factor Auth')}
          subtitle={t('adminSettings.twoFactorSubtitle', 'Extra security layer')}
          showToggle
          toggleValue={twoFactorEnabled}
          onToggleChange={handleToggleTwoFactor}
        />
      </SettingsCard>

      <SettingsCard title={t('adminSettings.preferencesSection', 'Preferences')}>
        <SettingsRow
          icon={
            <NotificationIcon
              size={UtilityMethods.wp(5)}
              color={Colors.primaryPurple}
            />
          }
          iconBgColor={Colors.lightPurple}
          title={t('adminSettings.notifications', 'Notifications')}
          subtitle={t('adminSettings.notificationsSubtitle', 'Push notifications')}
          showToggle
          toggleValue={notificationsEnabled}
          onToggleChange={handleToggleNotifications}
        />
        <SettingsRow
          icon={<GlobeIcon size={UtilityMethods.wp(5)} color="#FF9800" />}
          iconBgColor="rgba(255, 152, 0, 0.15)"
          title={t('adminSettings.language', 'Language')}
          subtitle={language === 'es' ? 'Español (ES)' : 'English (US)'}
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
          title={t('adminSettings.helpSupport', 'Help & Support')}
          subtitle={t('adminSettings.helpSupportSubtitle', 'Get help and contact us')}
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
        <Text style={styles.logoutButtonText}>{t('adminSettings.logout', 'Logout')}</Text>
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
