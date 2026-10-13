import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import type { RootStackParamList } from '../../../navigation/MainStack';
import { UsersIcon, NotificationIcon } from '../../../components/admin/icons';
import AnalyticsIcon from '../../../assets/Icons/analytics.svg';
import {
  StatCard,
  NewsFeedSection,
} from '../../../components/admin';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useUsersList } from '../../../context/UsersListContext';
import { subscribeToPosts } from '../../../services/postService';
import { subscribeToAdminNotifications } from '../../../services/moderationService';
import type { NewsPost } from '../../../components/admin/NewsPostCard';
import { useLanguage } from '../../../context/LanguageContext';
import {
  getSyncTranslatedContent,
  getLocalizedStatus,
} from '../../../services/databaseTranslationService';
import { useEffect, useState } from 'react';

type AdminHomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;

interface AdminHomeScreenProps {
  onNotificationPress?: () => void;
}

export function AdminHomeScreen({
  onNotificationPress,
}: AdminHomeScreenProps) {
  const navigation = useNavigation<AdminHomeNavigationProp>();
  const { t, language } = useLanguage();
  const { users } = useUsersList();
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminName = auth().currentUser?.displayName || 'Admin';
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const adminUid = auth().currentUser?.uid;
    let readSet = new Set<string>();
    let dismissedSet = new Set<string>();
    let rawList: any[] = [];

    const recompute = () => {
      const count = rawList.filter(
        n => !dismissedSet.has(n.id) && !readSet.has(n.id),
      ).length;
      setUnreadCount(count);
    };

    const unsubAdmin = subscribeToAdminNotifications(list => {
      rawList = (list as any[]) || [];
      recompute();
    });

    let unsubMeta = () => {};
    if (adminUid) {
      unsubMeta = firestore()
        .collection('users')
        .doc(adminUid)
        .collection('meta')
        .doc('admin_notifications')
        .onSnapshot(doc => {
          if (doc && (typeof doc.exists === 'function' ? doc.exists() : doc.exists)) {
            const data = doc.data() || {};
            if (Array.isArray(data.readIds)) readSet = new Set(data.readIds);
            if (Array.isArray(data.dismissedIds)) dismissedSet = new Set(data.dismissedIds);
          }
          recompute();
        });
    }

    return () => {
      unsubAdmin();
      unsubMeta();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToPosts(all => {
      setNewsPosts(
        all
          .filter(p => !p.groupId)
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            userId: p.authorUserId,
            userName: p.userName,
            status: getLocalizedStatus('Active'),
            timeAgo: p.timeAgo,
            content: getSyncTranslatedContent(p.content, language),
            likes: p.reactions,
            comments: p.comments,
            shares: p.shares,
            avatarColor: p.avatarColor || '#800080',
            imageUrl: p.imageUrl,
            videoUrl: p.videoUrl,
            mediaType: p.mediaType,
          })),
      );
    });
    return () => unsubscribe();
  }, [language]);

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.adminBackgroundGrey}
      bottomColor={Colors.adminBackgroundGrey}
      style={{ backgroundColor: Colors.adminBackgroundGrey }}
    >
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{adminName}</Text>
            <Text style={styles.headerSubtitle}>
              {language === 'es' ? 'Bienvenido Administrador' : 'Welcome Back, Admin'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onNotificationPress}
            activeOpacity={0.7}
            style={styles.bellButton}
          >
            <NotificationIcon
              size={UtilityMethods.wp(6)}
              color={Colors.adminInactiveGrey}
            />
            {unreadCount > 0 && <View style={styles.badgeOnBell} />}
          </TouchableOpacity>
        </View>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
        <View style={styles.statsRow}>
          <StatCard
            icon={<UsersIcon size={UtilityMethods.wp(6)} color="#FFFFFF" />}
            value={totalUsers.toLocaleString()}
            label={t('adminHome.totalUsers', 'Total Users')}
            change=""
            iconBgColor={Colors.adminStatsBlue}
          />
          <StatCard
            icon={<AnalyticsIcon width={UtilityMethods.wp(11)} height={UtilityMethods.wp(11)} />}
            value={activeUsers.toLocaleString()}
            label={t('adminHome.activeUsers', 'Active Members')}
            change=""
          />
        </View>

        <NewsFeedSection
          posts={newsPosts}
          onViewAllPress={() => navigation.navigate('NewsFeed')}
          onViewPress={post =>
            navigation.navigate('FeedDetails', { postId: post.id })
          }
        />
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(1.5),
  },
  headerTitle: {
    fontSize: FontSize.VALUE(22),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  headerSubtitle: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  contentContainer: {
    paddingTop: UtilityMethods.hp(2),
    backgroundColor: Colors.adminBackgroundGrey,
    paddingBottom: UtilityMethods.hp(3),
  },
  statsRow: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(3),
    marginBottom: UtilityMethods.hp(3),
    paddingHorizontal: UtilityMethods.wp(5),
  },
  bellButton: {
    borderRadius: 50,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGreyNotification,
    padding: UtilityMethods.wp(2),
    position: 'relative',
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
