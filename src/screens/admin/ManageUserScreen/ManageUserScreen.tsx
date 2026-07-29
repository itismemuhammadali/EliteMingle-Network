import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/MainStack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import Svg, { Path } from 'react-native-svg';
import {
  PersonIcon,
  EmailIconSmall,
  PhoneIcon,
  CalendarIcon,
  CommentIcon,
  SuspendIcon,
  DeleteIcon,
} from '../../../components/admin/icons';
import ShareIconSvg from '../../../assets/Icons/share.svg';
import CommentBoxSvg from '../../../assets/Icons/commentBox.svg';
import { ConfirmationModal } from '../../../components/admin/modal';

const FilledHeartIcon = ({ size = 24, color = '#F44336' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
import { MOCK_USERS } from '../../../constants/mockData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export function ManageUserScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'ManageUser'>
    >();
  const route = useRoute<RouteProp<RootStackParamList, 'ManageUser'>>();
  const insets = useSafeAreaInsets();
  const { userId } = route.params;

  const user = MOCK_USERS.find(u => u.id === userId);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return null;
  }

  const statusBgColor =
    user.status === 'Active'
      ? Colors.userStatusActiveBg
      : user.status === 'Pending'
      ? Colors.userStatusPendingBg
      : Colors.userStatusInactiveBg;
  const statusTextColor =
    user.status === 'Active'
      ? Colors.userStatusActiveText
      : user.status === 'Pending'
      ? Colors.userStatusPendingText
      : Colors.userStatusInactiveText;

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={false}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.adminBackgroundGrey}
      style={{ backgroundColor: Colors.adminBackgroundGrey }}
    >
      <View
        style={[
          styles.headerBg,
          { paddingTop: insets.top * 0.49 },
        ]}
      >
        <ScreenHeader
          title="User Profile"
          onBackPress={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusBgColor }]}
            >
              <Text style={[styles.statusText, { color: statusTextColor }]}>
                {user.status}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <InfoRow
              icon={
                <PersonIcon
                  size={UtilityMethods.wp(5)}
                  color={Colors.adminStatsBlue}
                />
              }
              iconBgColor="rgba(76, 125, 255, 0.15)"
              label="Role"
              value={user.role}
            />
          </View>
          <View style={styles.infoSection}>
            <InfoRow
              icon={
                <EmailIconSmall
                  size={UtilityMethods.wp(5)}
                  color={Colors.primaryPurple}
                />
              }
              iconBgColor={Colors.lightPurple}
              label="Email"
              value={user.email}
            />
          </View>
          <View style={styles.infoSection}>
            <InfoRow
              icon={
                <PhoneIcon
                  size={UtilityMethods.wp(5)}
                  color={Colors.adminStatsGreen}
                />
              }
              iconBgColor="rgba(46, 204, 113, 0.15)"
              label="Phone"
              value={user.phone}
            />
          </View>
          <View style={styles.infoSection}>
            <InfoRow
              icon={
                <CalendarIcon
                  size={UtilityMethods.wp(5)}
                  color={Colors.adminWarningYellow}
                />
              }
              iconBgColor={Colors.adminWarningYellowLight}
              label="Member Since"
              value={user.memberSince}
            />
          </View>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Activity Overview</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <View style={styles.interactBox}>
                <FilledHeartIcon size={UtilityMethods.wp(5)} color="#F44336" />
                <Text style={styles.activityNumber}>{user.totalLikes}</Text>
              </View>
              <Text style={styles.activityLabel}>Likes</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <View style={styles.interactBox}>
                <CommentIcon size={UtilityMethods.wp(5)} color="#4C7DFF" />
                <Text style={styles.activityNumber}>{user.totalComments}</Text>
              </View>
              <Text style={styles.activityLabel}>Comments</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <View style={styles.interactBox}>
                <ShareIconSvg width={UtilityMethods.wp(5)} height={UtilityMethods.wp(5)} />
                <Text style={styles.activityNumber}>{user.totalShares}</Text>
              </View>
              <Text style={styles.activityLabel}>Shares</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={styles.suspendButton}
              onPress={() => setShowSuspendModal(true)}
              activeOpacity={0.7}
            >
              <SuspendIcon
                size={UtilityMethods.wp(5)}
                color={Colors.adminWarningYellow}
              />
              <Text style={styles.suspendButtonText}>Suspend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setShowDeleteModal(true)}
              activeOpacity={0.7}
            >
              <DeleteIcon
                size={UtilityMethods.wp(5)}
                color={Colors.adminErrorRed}
              />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.viewPostsButton}
            onPress={() =>
              navigation.navigate('UserDetails', { userId: user.id })
            }
            activeOpacity={0.7}
          >
            <CommentBoxSvg
              width={UtilityMethods.wp(5)}
              height={UtilityMethods.wp(5)}
            />
            <Text style={styles.viewPostsButtonText}>View User Posts</Text>
          </TouchableOpacity>
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showSuspendModal}
        type="suspendUser"
        entityName={user.name}
        onConfirm={() => setShowSuspendModal(false)}
        onCancel={() => setShowSuspendModal(false)}
      />
      <ConfirmationModal
        visible={showDeleteModal}
        type="deleteUser"
        entityName={user.name}
        onConfirm={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
      />
    </MainLayout>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  iconBgColor: string;
  label: string;
  value: string;
}

function InfoRow({ icon, iconBgColor, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrapper, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <View style={styles.infoTextWrapper}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: {
    backgroundColor: Colors.white,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(2),
  },
  avatarRing: {
    width: UtilityMethods.wp(22),
    height: UtilityMethods.wp(22),
    borderRadius: UtilityMethods.wp(11),
    borderWidth: 2,
    borderColor: Colors.primaryPurple,
    overflow: 'hidden',
    marginBottom: UtilityMethods.hp(1.5),
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: FontSize.VALUE(20),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.5),
  },
  statusBadge: {
    paddingHorizontal: UtilityMethods.wp(3),
    paddingVertical: UtilityMethods.hp(0.5),
    borderRadius: UtilityMethods.wp(3),
  },
  statusText: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '600',
  },
  infoSection: {
    width: '100%',
    marginBottom: UtilityMethods.hp(1.5),
    backgroundColor: '#F9FAFB',
    borderRadius: UtilityMethods.wp(2),
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UtilityMethods.wp(3),
  },
  infoIconWrapper: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.wp(12),
    borderRadius: UtilityMethods.wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSize.VALUE(12),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(0.25),
  },
  infoValue: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.textDark,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    marginTop: UtilityMethods.hp(2),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
  },
  activityTitle: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(2),
  },
  activityRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: UtilityMethods.wp(2),
    paddingVertical: UtilityMethods.hp(2),
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityNumber: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: UtilityMethods.hp(0.5),
  },
  activityLabel: {
    fontSize: FontSize.VALUE(12),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    marginTop: UtilityMethods.hp(0.25),
  },
  activityDivider: {
    width: 1,
    height: UtilityMethods.hp(4),
    backgroundColor: 'rgba(229, 231, 235, 1)',
  },
  actionsSection: {
    marginTop: UtilityMethods.hp(2),
    gap: UtilityMethods.hp(1.5),
  },
  rowButtons: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(3),
  },
  suspendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    borderWidth: 2,
    borderColor: Colors.adminWarningYellow,
    backgroundColor: 'transparent',
  },
  suspendButtonText: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.adminWarningYellow,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    borderWidth: 2,
    borderColor: Colors.adminErrorRed,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.adminErrorRed,
  },
  viewPostsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: 'rgba(76, 125, 255, 0.1)',
  },
  viewPostsButtonText: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.adminStatsBlue,
  },
  interactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(1),
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? UtilityMethods.hp(4) : 0,
  },
});
