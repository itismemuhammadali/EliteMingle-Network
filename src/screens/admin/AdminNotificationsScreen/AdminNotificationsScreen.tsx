import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MainLayout from '../../../components/general/MainLayout';
import {
  FilterPills,
  NotificationCard,
} from '../../../components/admin';
import DoubleTickIcon from '../../../assets/Icons/DoubleTickNoBg.svg';
import { type Notification } from '../../../constants/notificationData';
import { subscribeToAdminNotifications } from '../../../services/moderationService';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/MainStack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useLanguage } from '../../../context/LanguageContext';

interface AdminNotificationsScreenProps {
  onBackPress?: () => void;
}

export function AdminNotificationsScreen({ onBackPress }: AdminNotificationsScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, language } = useLanguage();
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const adminUid = auth().currentUser?.uid;

  const handleNotificationPress = (notification: Notification) => {
    handleMarkAsRead(notification.id);

    if (notification.type === 'report' || notification.targetType === 'post') {
      const postId = notification.targetId || notification.postId;
      if (postId) {
        navigation.navigate('FeedDetails', { postId });
      }
      return;
    }

    if (notification.type === 'user' || notification.targetType === 'user') {
      const userId = notification.userId || notification.targetId;
      if (userId) {
        navigation.navigate('UserDetails', { userId });
      }
      return;
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAdminNotifications(list =>
      setRawNotifications(list as Notification[]),
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!adminUid) return;
    const unsubMeta = firestore()
      .collection('users')
      .doc(adminUid)
      .collection('meta')
      .doc('admin_notifications')
      .onSnapshot(doc => {
        if (doc && (typeof doc.exists === 'function' ? doc.exists() : doc.exists)) {
          const data = doc.data() || {};
          if (Array.isArray(data.readIds)) {
            setReadIds(new Set(data.readIds));
          }
          if (Array.isArray(data.dismissedIds)) {
            setDismissedIds(new Set(data.dismissedIds));
          }
        }
      });
    return () => unsubMeta();
  }, [adminUid]);

  const notifications = useMemo(
    () =>
      rawNotifications
        .filter(n => !dismissedIds.has(n.id))
        .map(n => ({ ...n, isRead: readIds.has(n.id) })),
    [rawNotifications, readIds, dismissedIds],
  );

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const handleMarkAsRead = (id: string) => {
    const updated = new Set(readIds).add(id);
    setReadIds(updated);
    if (adminUid) {
      firestore()
        .collection('users')
        .doc(adminUid)
        .collection('meta')
        .doc('admin_notifications')
        .set({ readIds: Array.from(updated) }, { merge: true })
        .catch(console.error);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const updated = new Set([...readIds, ...allIds]);
    setReadIds(updated);
    if (adminUid) {
      firestore()
        .collection('users')
        .doc(adminUid)
        .collection('meta')
        .doc('admin_notifications')
        .set({ readIds: Array.from(updated) }, { merge: true })
        .catch(console.error);
    }
  };

  const handleDismiss = (id: string) => {
    const updated = new Set(dismissedIds).add(id);
    setDismissedIds(updated);
    if (adminUid) {
      firestore()
        .collection('users')
        .doc(adminUid)
        .collection('meta')
        .doc('admin_notifications')
        .set({ dismissedIds: Array.from(updated) }, { merge: true })
        .catch(console.error);
    }
  };

  const filterOptions = [
    { id: 'all', label: t('common.all', 'All'), count: notifications.length },
    { id: 'unread', label: language === 'es' ? 'No leídos' : 'Unread', count: unreadCount },
  ];

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={false}
      barStyle="dark-content"
      statusbarBackgrund="#FFFFFF"
      bottomColor={Colors.adminBackgroundGrey}
    >
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View style={styles.titleCol}>
            <Text style={styles.title}>{t('navigation.notifications', 'Notifications')}</Text>
            <Text style={styles.subtitle}>
              {unreadCount} {language === 'es' ? 'Mensajes no leídos' : 'Unread Messages'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconBox}
            onPress={handleMarkAllAsRead}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <DoubleTickIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.pillsRow}>
          <FilterPills
            options={filterOptions}
            activeId={activeFilter}
            onSelect={setActiveFilter}
          />
        </View>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
      >
        <View style={styles.listContainer}>
          {filteredNotifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onDismiss={handleDismiss}
              onMarkAsRead={handleMarkAsRead}
              onPress={handleNotificationPress}
            />
          ))}
        </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(1.5),
    paddingBottom: UtilityMethods.hp(1),
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.VALUE(22),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  subtitle: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  iconBox: {
    width: 39.96332550048828,
    height: 39.96332550048828,
    backgroundColor: '#85138C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: UtilityMethods.hp(0.5),
  },
  pillsRow: {
    paddingHorizontal: UtilityMethods.wp(5),
    marginBottom: UtilityMethods.hp(1),
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  markAllButton: {
    padding: UtilityMethods.wp(1),
    marginTop: UtilityMethods.hp(1.2),
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.adminBackgroundGrey,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(1.5),
    paddingBottom: UtilityMethods.hp(4),
    backgroundColor: Colors.adminBackgroundGrey,
  },
  listContainer: {},
});
