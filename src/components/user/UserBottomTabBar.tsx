import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import PlusIcon from '../../assets/Icons/PlusIcon.svg';
import {
  UserTabHomeIcon,
  UserTabMessagesIcon,
  UserTabGroupsIcon,
  UserTabProfileIcon,
} from './icons';

export type UserTab = 'Home' | 'Messages' | 'Groups' | 'Profile';

interface TabConfig {
  key: UserTab;
  label: string;
  icon: (props: { size?: number; color?: string }) => React.ReactElement;
}

const SIDE_TABS: TabConfig[] = [
  { key: 'Home', label: 'Home', icon: UserTabHomeIcon },
  { key: 'Messages', label: 'Messages', icon: UserTabMessagesIcon },
];

const RIGHT_TABS: TabConfig[] = [
  { key: 'Groups', label: 'Groups', icon: UserTabGroupsIcon },
  { key: 'Profile', label: 'Profile', icon: UserTabProfileIcon },
];

export interface UserBottomTabBarProps {
  activeTab: UserTab;
  onTabPress: (tab: UserTab) => void;
  onFabPress: () => void;
}

export function UserBottomTabBar({
  activeTab,
  onTabPress,
  onFabPress,
}: UserBottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const iconSize = UtilityMethods.wp(5.5);
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: Colors.white,
        paddingHorizontal: UtilityMethods.wp(1),
        paddingTop: UtilityMethods.hp(1),
        paddingBottom: Math.max(insets.bottom, UtilityMethods.hp(1.25)),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.borderGrey,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 12,
      },
      tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: UtilityMethods.hp(0.5),
      },
      label: {
        marginTop: UtilityMethods.hp(0.35),
        fontSize: FontSize.VALUE(9),
        fontWeight: '500',
        color: Colors.userInactiveTabGrey,
      },
      labelActive: {
        color: Colors.userActiveTabPurple,
        fontWeight: '600',
      },
      fabSlot: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      fabTouchable: {
        marginTop: -UtilityMethods.hp(3.5),
      },
      fabGradient: {
        width: UtilityMethods.wp(14),
        height: UtilityMethods.wp(14),
        borderRadius: UtilityMethods.wp(7),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primaryPurple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 8,
      },
    }),
  );

  const renderTab = (tab: TabConfig) => {
    const isActive = activeTab === tab.key;
    const IconComponent = tab.icon;
    const color = isActive
      ? Colors.userActiveTabPurple
      : Colors.userInactiveTabGrey;

    return (
      <TouchableOpacity
        key={tab.key}
        style={styles.tab}
        onPress={() => onTabPress(tab.key)}
        activeOpacity={0.75}
      >
        <IconComponent size={iconSize} color={color} />
        <Text style={[styles.label, isActive && styles.labelActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {SIDE_TABS.map(renderTab)}

      <View style={styles.fabSlot}>
        <TouchableOpacity
          style={styles.fabTouchable}
          onPress={onFabPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Create post"
        >
          <LinearGradient
            colors={[Colors.fabGradientStart, Colors.fabGradientEnd]}
            style={styles.fabGradient}
          >
            <PlusIcon size={UtilityMethods.wp(6)} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {RIGHT_TABS.map(renderTab)}
    </View>
  );
}
