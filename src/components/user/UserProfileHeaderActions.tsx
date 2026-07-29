import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import { NotificationIcon } from '../admin/icons';
import HandycapIcon from '../../assets/Icons/handycap.svg';

const ICON = UtilityMethods.wp(5.5);

export interface UserProfileHeaderActionsProps {
  onBellPress?: () => void;
  onAccessibilityPress?: () => void;
  hasNotificationBadge?: boolean;
}

export function UserProfileHeaderActions({
  onBellPress,
  hasNotificationBadge = true,
  onAccessibilityPress,
}: UserProfileHeaderActionsProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.bellCircle}
        onPress={onBellPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <NotificationIcon
          size={UtilityMethods.wp(5.5)}
          color={Colors.adminInactiveGrey}
        />
        {hasNotificationBadge && <View style={styles.badge} />}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onAccessibilityPress}
        activeOpacity={0.7}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Accessibility"
        style={styles.a11yBtn}
      >
        <HandycapIcon width={ICON} height={ICON} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bellCircle: {
    borderRadius: 50,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGreyNotification,
    padding: UtilityMethods.wp(2),
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: UtilityMethods.hp(0.35),
    right: UtilityMethods.wp(1.25),
    width: UtilityMethods.wp(2.25),
    height: UtilityMethods.wp(2.25),
    borderRadius: UtilityMethods.wp(1.125),
    backgroundColor: Colors.adminNotificationBadge,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  a11yBtn: {
    marginLeft: UtilityMethods.wp(2),
    padding: UtilityMethods.wp(1),
  },
});
