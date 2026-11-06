import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import { NotificationIcon } from '../admin/icons';
import HandycapIcon from '../../assets/Icons/handycap.svg';
import { subscribeToUnreadCount } from '../../services/notificationService';

const ICON = UtilityMethods.wp(5.5);

export interface UserProfileHeaderActionsProps {
  onBellPress?: () => void;
  onAccessibilityPress?: () => void;
  hasNotificationBadge?: boolean;
}

export function UserProfileHeaderActions({
  onBellPress,
  hasNotificationBadge,
  onAccessibilityPress,
}: UserProfileHeaderActionsProps) {
  const currentUserId = auth().currentUser?.uid || '';
  const [dynamicBadge, setDynamicBadge] = useState(false);

  useEffect(() => {
    if (hasNotificationBadge !== undefined || !currentUserId) return;
    const unsub = subscribeToUnreadCount(currentUserId, count => {
      setDynamicBadge(count > 0);
    });
    return () => unsub();
  }, [hasNotificationBadge, currentUserId]);

  const showBadge =
    hasNotificationBadge !== undefined ? hasNotificationBadge : dynamicBadge;
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
        {showBadge && <View style={styles.badge} />}
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
