import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';
import ShieldIcon from '../../../assets/Icons/profile/accountSettings/shield.svg';
import LockIcon from '../../../assets/Icons/profile/accountSettings/lock.svg';
import EyeOutlineIcon from '../../../assets/Icons/profile/accountSettings/eyeOutline.svg';
import GlobeIcon from '../../../assets/Icons/profile/privacy/globe.svg';
import UsersIcon from '../../../assets/Icons/profile/privacy/users.svg';
import ChatIcon from '../../../assets/Icons/profile/privacy/chat.svg';
import PersonPlusIcon from '../../../assets/Icons/profile/privacy/personPlus.svg';

const H_PAD = UtilityMethods.wp(5);
const ROW_ICON = UtilityMethods.wp(5.25);

const SWITCH_TRACK = {
  false: '#E5E5E5',
  true: Colors.userProfilePurple,
} as const;

export function PrivacySettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();

  const [publicProfile, setPublicProfile] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showLocation, setShowLocation] = useState(true);

  const [friendRequests, setFriendRequests] = useState(true);
  const [messages, setMessages] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);

  const [allowTagging, setAllowTagging] = useState(true);
  const [commentsOnPosts, setCommentsOnPosts] = useState(true);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSave = useCallback(() => {
    Alert.alert('Saved', 'Your privacy settings have been updated.');
  }, []);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onViewPolicy = useCallback(() => {
    navigation.navigate('LegalDocument', { documentType: 'privacy' });
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
        marginBottom: UtilityMethods.hp(2),
      },
      infoBannerText: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      infoBannerTitle: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.changePasswordInfoTitle,
        marginBottom: UtilityMethods.hp(0.5),
      },
      infoBannerSub: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: '#64748B',
        lineHeight: FontSize.VALUE(19),
      },
      sectionLabel: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(1),
      },
      sectionSpaced: {
        marginTop: UtilityMethods.hp(2),
      },
      groupCard: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        marginBottom: UtilityMethods.hp(0.5),
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
      rowTitle: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.35),
      },
      rowSubtitle: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.userGroupMemberMeta,
        lineHeight: FontSize.VALUE(19),
      },
      rowDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.borderGrey,
        marginHorizontal: UtilityMethods.wp(4),
      },
      dataCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(2),
      },
      dataTextCol: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      policyLink: {
        marginTop: UtilityMethods.hp(1),
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.userProfilePurple,
      },
      saveBtn: {
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(8),
        paddingVertical: UtilityMethods.hp(1.75),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: UtilityMethods.hp(0.5),
      },
      saveBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      cancelBtn: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(8),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.75),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: UtilityMethods.hp(1.25),
      },
      cancelBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
    }),
  );

  function PrivacySwitchRow({
    Icon,
    title,
    subtitle,
    value,
    onValueChange,
    showDivider,
  }: {
    Icon: React.ComponentType<{ width: number; height: number; color: string }>;
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    showDivider: boolean;
  }) {
    return (
      <>
        <View style={styles.switchRow}>
          <Icon width={ROW_ICON} height={ROW_ICON} color={Colors.textDark} />
          <View style={styles.switchTextCol}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Text style={styles.rowSubtitle}>{subtitle}</Text>
          </View>
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={SWITCH_TRACK}
            thumbColor={Colors.white}
            ios_backgroundColor="#E5E5E5"
          />
        </View>
        {showDivider ? <View style={styles.rowDivider} /> : null}
      </>
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
              Privacy Settings
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.infoBanner}>
          <ShieldIcon
            width={UtilityMethods.wp(6)}
            height={UtilityMethods.wp(6)}
            color={Colors.userProfilePurple}
          />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>Control your privacy</Text>
            <Text style={styles.infoBannerSub}>
              Manage who can see your information and interact with you
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Profile Visibility</Text>
        <View style={styles.groupCard}>
          <PrivacySwitchRow
            Icon={GlobeIcon}
            title="Public Profile"
            subtitle="Anyone can view your profile"
            value={publicProfile}
            onValueChange={setPublicProfile}
            showDivider
          />
          <PrivacySwitchRow
            Icon={EyeOutlineIcon}
            title="Show Email Address"
            subtitle="Display email on your profile"
            value={showEmail}
            onValueChange={setShowEmail}
            showDivider
          />
          <PrivacySwitchRow
            Icon={EyeOutlineIcon}
            title="Show Phone Number"
            subtitle="Display phone on your profile"
            value={showPhone}
            onValueChange={setShowPhone}
            showDivider
          />
          <PrivacySwitchRow
            Icon={GlobeIcon}
            title="Show Location"
            subtitle="Display your location"
            value={showLocation}
            onValueChange={setShowLocation}
            showDivider={false}
          />
        </View>

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
          Communication
        </Text>
        <View style={styles.groupCard}>
          <PrivacySwitchRow
            Icon={UsersIcon}
            title="Friend Requests"
            subtitle="Allow others to send friend requests"
            value={friendRequests}
            onValueChange={setFriendRequests}
            showDivider
          />
          <PrivacySwitchRow
            Icon={ChatIcon}
            title="Messages"
            subtitle="Allow others to message you"
            value={messages}
            onValueChange={setMessages}
            showDivider
          />
          <PrivacySwitchRow
            Icon={EyeOutlineIcon}
            title="Online Status"
            subtitle={"Show when you're online"}
            value={onlineStatus}
            onValueChange={setOnlineStatus}
            showDivider={false}
          />
        </View>

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
          Content & Interactions
        </Text>
        <View style={styles.groupCard}>
          <PrivacySwitchRow
            Icon={PersonPlusIcon}
            title="Allow Tagging"
            subtitle="Others can tag you in posts"
            value={allowTagging}
            onValueChange={setAllowTagging}
            showDivider
          />
          <PrivacySwitchRow
            Icon={ChatIcon}
            title="Comments on Posts"
            subtitle="Allow comments on your posts"
            value={commentsOnPosts}
            onValueChange={setCommentsOnPosts}
            showDivider={false}
          />
        </View>

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
          Data Privacy
        </Text>
        <View style={styles.dataCard}>
          <LockIcon
            width={ROW_ICON}
            height={ROW_ICON}
            color={Colors.textDark}
          />
          <View style={styles.dataTextCol}>
            <Text style={styles.rowTitle}>Data & Privacy Policy</Text>
            <Text style={styles.rowSubtitle}>
              Learn how we protect and use your information
            </Text>
            <TouchableOpacity
              onPress={onViewPolicy}
              activeOpacity={0.75}
              accessibilityRole="link"
              accessibilityLabel="View Privacy Policy"
            >
              <Text style={styles.policyLink}>View Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={onSave}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </MainLayout>
  );
}
