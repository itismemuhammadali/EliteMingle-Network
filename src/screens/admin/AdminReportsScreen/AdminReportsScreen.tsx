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

export function AdminReportsScreen() {
  const { users } = useUsersList();
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const [createdSeconds, setCreatedSeconds] = useState<number[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .onSnapshot(snap => {
        setCreatedSeconds(
          (snap ? snap.docs : [])
            .map(d => (d.data()?.createdAt?.seconds as number) || 0)
            .filter(Boolean),
        );
      });
    return () => unsubscribe();
  }, []);

  // Last-6-months cumulative user-growth points.
  const growthData = useMemo(() => {
    const now = new Date();
    const pts: { value: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth =
        new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime() /
        1000;
      pts.push({
        value: createdSeconds.filter(s => s <= endOfMonth).length,
        label: d.toLocaleString('en', { month: 'short' }),
      });
    }
    return pts;
  }, [createdSeconds]);

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
          title="Reports & Analytics"
          subtitle="Performance overview"
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
        <TimeFilterCard label="Last 6 Months" onChangePress={() => {}} />

        <View style={styles.statsRow}>
          <StatCard
            icon={<UsersIcon size={UtilityMethods.wp(6)} color="#FFFFFF" />}
            value={totalUsers.toLocaleString()}
            label="Total Users"
            change=""
            iconBgColor={Colors.adminStatsBlue}
          />
          <StatCard
            icon={<AnalyticsIcon width={UtilityMethods.wp(11)} height={UtilityMethods.wp(11)} />}
            value={activeUsers.toLocaleString()}
            label="Active Users"
            change=""
          />
        </View>

        <UserGrowthChart data={growthData} />
        <WeeklyActivityChart />

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
    height: UtilityMethods.hp(4),
  },
});
