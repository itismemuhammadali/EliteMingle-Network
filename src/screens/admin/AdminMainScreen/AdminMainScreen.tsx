import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminHeader, AdminBottomTabBar } from '../../../components/admin';
import type { AdminTab } from '../../../components/admin/AdminBottomTabBar';
import { AdminHomeScreen } from '../AdminHomeScreen';
import { AdminPlaceholderScreen } from '../AdminPlaceholderScreen';
import { AdminSettingsScreen } from '../AdminSettingsScreen';
import { AdminNotificationsScreen } from '../AdminNotificationsScreen';
import { AdminUsersScreen } from '../AdminUsersScreen';
import { AdminReportsScreen } from '../AdminReportsScreen';

export function AdminMainScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>('Home');

  const insets = useSafeAreaInsets();

  const goToNotificationsTab = useCallback(() => {
    setActiveTab('Notification');
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <AdminHomeScreen onNotificationPress={goToNotificationsTab} />
        );
      case 'Users':
        return (
          <AdminUsersScreen onNotificationPress={goToNotificationsTab} />
        );
      case 'Reports':
        return <AdminReportsScreen />;
      case 'Settings':
        return (
          <AdminSettingsScreen
            onNotificationPress={goToNotificationsTab}
          />
        );
      case 'Notification':
        return <AdminNotificationsScreen />;
      default:
        return (
          <AdminHomeScreen onNotificationPress={goToNotificationsTab} />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}></View>
      <View style={styles.content}>{renderContent()}</View>
      <View style={[styles.footerWrapper, { paddingBottom: insets.bottom }]}>
        <AdminBottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  headerWrapper: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  footerWrapper: {
    backgroundColor: '#FFFFFF',
  },
});
