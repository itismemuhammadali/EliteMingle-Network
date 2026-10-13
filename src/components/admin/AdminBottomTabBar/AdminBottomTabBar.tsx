import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  HomeIcon,
  UsersIcon,
  ReportsIcon,
  NotificationIcon,
} from '../icons';
import { SettingGearIcon } from '../../../assets/Icons/SettingGearIcon';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export type AdminTab =
  | 'Home'
  | 'Users'
  | 'Reports'
  | 'Settings'
  | 'Notification';

interface TabConfig {
  key: AdminTab;
  label: string;
  icon: (props: { size?: number; color?: string }) => React.ReactElement;
}

const SettingSvgIcon = ({ size, color }: { size?: number; color?: string }) => (
  <SettingGearIcon size={size} color={color} />
);

const TABS: TabConfig[] = [
  { key: 'Home', label: 'Home', icon: HomeIcon },
  { key: 'Users', label: 'Users', icon: UsersIcon },
  { key: 'Reports', label: 'Reports', icon: ReportsIcon },
  { key: 'Settings', label: 'Settings', icon: SettingSvgIcon },
  { key: 'Notification', label: 'Alert', icon: NotificationIcon },
];

import { useLanguage } from '../../../context/LanguageContext';

export interface AdminBottomTabBarProps {
  activeTab: AdminTab;
  onTabPress: (tab: AdminTab) => void;
}

export function AdminBottomTabBar({
  activeTab,
  onTabPress,
}: AdminBottomTabBarProps) {
  const { t } = useLanguage();

  const getTabLabel = (key: AdminTab): string => {
    switch (key) {
      case 'Home':
        return t('navigation.home', 'Home');
      case 'Users':
        return t('navigation.users', 'Users');
      case 'Reports':
        return t('navigation.reports', 'Reports');
      case 'Settings':
        return t('navigation.settings', 'Settings');
      case 'Notification':
        return t('navigation.notifications', 'Alert');
      default:
        return key;
    }
  };

  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.tabContent,
                isActive && styles.tabContentActive,
              ]}
            >
              <IconComponent
                size={UtilityMethods.wp(5.5)}
                color={
                  isActive ? Colors.adminActivePurple : Colors.adminInactiveGrey
                }
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {getTabLabel(tab.key)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: UtilityMethods.wp(2),
    paddingTop: UtilityMethods.hp(1.5),
    paddingBottom: UtilityMethods.hp(2),
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: UtilityMethods.hp(-0.25) },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: UtilityMethods.hp(1),
    paddingHorizontal: UtilityMethods.wp(2.5),
    borderRadius: UtilityMethods.wp(4),
    gap: UtilityMethods.hp(0.3),
  },
  tabContentActive: {
    backgroundColor: 'rgba(133, 19, 140, 0.1)',
    borderRadius: UtilityMethods.wp(4),
  },
  label: {
    fontSize: FontSize.VALUE(11),
    fontWeight: '500',
    color: Colors.adminInactiveGrey,
  },
  labelActive: {
    color: Colors.adminActivePurple,
  },
});
