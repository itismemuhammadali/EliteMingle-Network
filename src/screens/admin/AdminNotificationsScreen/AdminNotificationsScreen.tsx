import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MainLayout from '../../../components/general/MainLayout';
import {
  FilterPills,
  NotificationCard,
} from '../../../components/admin';
import { BackArrowIcon } from '../../../components/admin/icons';
import DoubleTickIcon from '../../../assets/Icons/DoubleTickNoBg.svg';
import { type Notification } from '../../../constants/notificationData';
import { subscribeToAdminNotifications } from '../../../services/moderationService';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface AdminNotificationsScreenProps {
  onBackPress?: () => void;
}

export function AdminNotificationsScreen({ onBackPress }: AdminNotificationsScreenProps) {
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = subscribeToAdminNotifications(list =>
      setRawNotifications(list as Notification[]),
    );
    return () => unsubscribe();
  }, []);

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
    setReadIds(prev => new Set(prev).add(id));
  };

  const handleMarkAllAsRead = () => {
    setReadIds(new Set(rawNotifications.map(n => n.id)));
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const filterOptions = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
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
        <View style={styles.backRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress} activeOpacity={0.7}>
            <BackArrowIcon size={19.9} color={Colors.primaryPurple} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTop}>
          <View style={styles.titleCol}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>{unreadCount} Unread Messages</Text>
          </View>
          <View style={styles.iconBox}>
            <DoubleTickIcon width={20} height={20} />
          </View>
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
  backRow: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(1),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(1),
  },
  backText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.primaryPurple,
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
