import React from 'react';
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
import {
  PersonIcon,
  EmailIconSmall,
  PhoneIcon,
  CalendarIcon,
  CommentIcon,
  ShieldIcon,
} from '../../../components/admin/icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { useUsersList } from '../../../context/UsersListContext';
import firestore from '@react-native-firebase/firestore';
import { ProfileAvatar } from '../../../components/general/ProfileAvatar';

export function UserDetailsScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'UserDetails'>
    >();
  const route = useRoute<RouteProp<RootStackParamList, 'UserDetails'>>();
  const insets = useSafeAreaInsets();
  const { userId = '' } = route.params || {};

  const { users } = useUsersList();
  const contextUser = users.find(u => u.id === userId);
  const [firestoreUser, setFirestoreUser] = React.useState<any>(null);

  React.useEffect(() => {
    if (!contextUser && userId) {
      firestore()
        .collection('users')
        .doc(userId)
        .get()
        .then(doc => {
          if (typeof doc.exists === 'function' ? doc.exists() : doc.exists) {
            const d = doc.data();
            setFirestoreUser({
              id: doc.id,
              name: d?.fullName || d?.displayName || 'User',
              email: d?.email || '',
              phone: d?.phone || 'N/A',
              role: d?.role || 'User',
              status: (d?.status || 'active').charAt(0).toUpperCase() + (d?.status || 'active').slice(1),
              avatarUrl: d?.avatarUri || d?.profilePicture || '',
              memberSince:
                typeof d?.createdAt?.toDate === 'function'
                  ? d.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'Recently',
              recentPosts: [],
            });
          }
        })
        .catch(err => console.warn('Fetch user doc error:', err));
    }
  }, [userId, contextUser]);

  const user = React.useMemo(() => {
    if (contextUser) {
      return {
        id: contextUser.id,
        name: contextUser.name,
        email: contextUser.email,
        phone: contextUser.phone || 'N/A',
        role: contextUser.role || 'User',
        status: contextUser.status.charAt(0).toUpperCase() + contextUser.status.slice(1),
        avatarUrl: contextUser.avatarUri || '',
        memberSince: 'Recently',
        recentPosts: [],
      };
    }
    if (firestoreUser) return firestoreUser;
    return null;
  }, [contextUser, firestoreUser]);

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
              <ProfileAvatar
                uri={user.avatarUrl}
                size={UtilityMethods.wp(22)}
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
              label="Role"
              value={user.role}
              iconBgColor="#EFF6FF"
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
              label="Email"
              value={user.email}
              iconBgColor="#F3E8FF"
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
              label="Phone"
              value={user.phone}
              iconBgColor="#D1FAE5"
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
              label="Member Since"
              value={user.memberSince}
              iconBgColor="#FEF3C7"
            />
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => navigation.navigate('ManageUser', { userId: user.id })}
            activeOpacity={0.7}
          >
            <ShieldIcon size={UtilityMethods.wp(5)} color={Colors.white} />
            <Text style={styles.manageButtonText}>Manage User</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentPostsCard}>
          <View style={styles.recentPostsHeader}>
            <CommentIcon
              size={UtilityMethods.wp(5)}
              color={Colors.primaryPurple}
            />
            <Text style={styles.recentPostsTitle}>
              Recent Posts ({(user.recentPosts || []).length})
            </Text>
          </View>
          {(user.recentPosts || []).map((post: any) => (
            <View key={post.id} style={styles.postPreview}>
              <Text style={styles.postContent} numberOfLines={3}>
                {post.content}
              </Text>
              <Text style={styles.postMeta}>
                {post.timeAgo} • {post.likes} likes • {post.comments} comments
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </MainLayout>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBgColor?: string;
}

function InfoRow({ icon, label, value, iconBgColor }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrapper, iconBgColor && { backgroundColor: iconBgColor }]}>{icon}</View>
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
    backgroundColor: '#F5F5F5',
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
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    width: '100%',
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
  },
  manageButtonText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '600',
    color: Colors.white,
  },
  recentPostsCard: {
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
  recentPostsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(2),
    marginBottom: UtilityMethods.hp(2),
  },
  recentPostsTitle: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
  },
  postPreview: {
    backgroundColor: '#F5F5F5',
    borderRadius: UtilityMethods.wp(2),
    padding: UtilityMethods.wp(3),
    marginBottom: UtilityMethods.hp(1.5),
  },
  postContent: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.textDark,
    lineHeight: FontSize.VALUE(20),
    marginBottom: UtilityMethods.hp(1),
  },
  postMeta: {
    fontSize: FontSize.VALUE(12),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? UtilityMethods.hp(4) : 0,
  },
});
