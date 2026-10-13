import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useUsersList } from '../../../context/UsersListContext';
import MainLayout from '../../../components/general/MainLayout';
import {
  AdminHeader,
  StatCard,
  TimeFilterCard,
  UserGrowthChart,
  WeeklyActivityChart,
} from '../../../components/admin';
import {
  UsersIcon,
  DownloadIcon,
} from '../../../components/admin/icons';
import AnalyticsIcon from '../../../assets/Icons/analytics.svg';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';

import { useLanguage } from '../../../context/LanguageContext';

export function AdminReportsScreen() {
  const { t, language } = useLanguage();
  const { users } = useUsersList();
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  const [usersList, setUsersList] = useState<
    {
      id: string;
      createdAtSeconds: number;
      updatedAtSeconds: number;
      status: string;
    }[]
  >([]);

  const [postsList, setPostsList] = useState<
    {
      id: string;
      createdAtSeconds: number;
      userId: string;
    }[]
  >([]);

  useEffect(() => {
    const unsubUsers = firestore()
      .collection('users')
      .onSnapshot(
        snap => {
          if (!snap) return;
          const list = snap.docs.map(doc => {
            const d = doc.data() || {};
            const createdSec =
              (d.createdAt?.seconds as number) ||
              (d.createdAt?._seconds as number) ||
              (typeof d.createdAt?.toDate === 'function'
                ? Math.floor(d.createdAt.toDate().getTime() / 1000)
                : 0);
            const updatedSec =
              (d.updatedAt?.seconds as number) ||
              (d.updatedAt?._seconds as number) ||
              (typeof d.updatedAt?.toDate === 'function'
                ? Math.floor(d.updatedAt.toDate().getTime() / 1000)
                : createdSec);
            return {
              id: doc.id,
              createdAtSeconds: createdSec,
              updatedAtSeconds: updatedSec || createdSec,
              status: (d.status as string) || 'active',
            };
          });
          setUsersList(list);
        },
        err => console.warn('AdminReportsScreen users snapshot error:', err),
      );

    const unsubPosts = firestore()
      .collection('posts')
      .onSnapshot(
        snap => {
          if (!snap) return;
          const list = snap.docs.map(doc => {
            const d = doc.data() || {};
            const createdSec =
              (d.createdAt?.seconds as number) ||
              (d.createdAt?._seconds as number) ||
              (typeof d.createdAt?.toDate === 'function'
                ? Math.floor(d.createdAt.toDate().getTime() / 1000)
                : 0);
            return {
              id: doc.id,
              createdAtSeconds: createdSec,
              userId: (d.authorUserId || d.userId || '') as string,
            };
          });
          setPostsList(list);
        },
        err => console.warn('AdminReportsScreen posts snapshot error:', err),
      );

    return () => {
      unsubUsers();
      unsubPosts();
    };
  }, []);

  // Last-6-months cumulative user-growth points from Firestore DB.
  const growthData = useMemo(() => {
    const now = new Date();
    const pts: { value: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth =
        new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime() /
        1000;
      const rawMonth = d.toLocaleString(language === 'es' ? 'es' : 'en', {
        month: 'short',
      });
      const cleanMonth = rawMonth.replace('.', '').trim();
      pts.push({
        value: usersList.filter(
          u => u.createdAtSeconds > 0 && u.createdAtSeconds <= endOfMonth,
        ).length,
        label: cleanMonth,
      });
    }
    return pts;
  }, [usersList, language]);

  // Current week (Mon-Sun) daily active user counts from Firestore DB.
  const weeklyData = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const distToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - distToMonday,
    );
    monday.setHours(0, 0, 0, 0);

    const pts: { value: number; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + i,
      );
      const dayStart =
        new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime() /
        1000;
      const dayEnd =
        new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          23,
          59,
          59,
        ).getTime() / 1000;

      const rawLabel = d.toLocaleDateString(language === 'es' ? 'es' : 'en', {
        weekday: 'short',
      });
      const cleanLabel = rawLabel.replace('.', '').trim();
      const label = cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);

      const activeUserIds = new Set<string>();

      usersList.forEach(u => {
        if (
          (u.updatedAtSeconds >= dayStart && u.updatedAtSeconds <= dayEnd) ||
          (u.createdAtSeconds >= dayStart && u.createdAtSeconds <= dayEnd)
        ) {
          activeUserIds.add(u.id);
        }
      });

      postsList.forEach(p => {
        if (
          p.createdAtSeconds >= dayStart &&
          p.createdAtSeconds <= dayEnd &&
          p.userId
        ) {
          activeUserIds.add(p.userId);
        }
      });

      pts.push({
        value: activeUserIds.size,
        label,
      });
    }
    return pts;
  }, [usersList, postsList, language]);

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
          title={t(
            'adminAnalytics.title',
            language === 'es' ? 'Reportes y Estadísticas' : 'Reports & Analytics',
          )}
          subtitle={t(
            'adminAnalytics.subtitle',
            language === 'es' ? 'Resumen de rendimiento' : 'Performance overview',
          )}
          showDivider={false}
          rightIcon={
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <DownloadIcon size={UtilityMethods.wp(5)} color={Colors.white} />
            </TouchableOpacity>
          }
        />
      </View>
      <View style={styles.headerBottom}>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
      >
        <TimeFilterCard
          label={t(
            'adminAnalytics.lastSixMonths',
            language === 'es' ? 'Últimos 6 Meses' : 'Last 6 Months',
          )}
          onChangePress={() => {}}
        />

        <View style={styles.statsRow}>
          <StatCard
            icon={<UsersIcon size={UtilityMethods.wp(6)} color="#FFFFFF" />}
            value={totalUsers.toLocaleString()}
            label={t('adminHome.totalUsers', 'Total Users')}
            change=""
            iconBgColor={Colors.adminStatsBlue}
          />
          <StatCard
            icon={
              <AnalyticsIcon
                width={UtilityMethods.wp(11)}
                height={UtilityMethods.wp(11)}
              />
            }
            value={activeUsers.toLocaleString()}
            label={t('adminHome.activeUsers', 'Active Members')}
            change=""
          />
        </View>

        <UserGrowthChart data={growthData} />
        <WeeklyActivityChart data={weeklyData} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.adminBackgroundGrey,
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: Colors.adminBackgroundGrey,
    paddingHorizontal: UtilityMethods.wp(5),
  },
  headerBottom: {
    backgroundColor: Colors.adminBackgroundGrey,
    paddingBottom: UtilityMethods.hp(1.5),
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  downloadButton: {
    width: UtilityMethods.wp(10),
    height: UtilityMethods.wp(10),
    borderRadius: UtilityMethods.wp(2.5),
    backgroundColor: Colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(3),
    marginBottom: UtilityMethods.hp(2),
  },
  bottomSpacer: {
    height: UtilityMethods.hp(6),
  },
});
