import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AdminHeader } from '../admin';
import { NotificationIcon } from '../admin/icons';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import { DEFAULT_USER_HEADER_AVATAR_URI } from '../../constants/userAvatars';
import HandycapIcon from '../../assets/Icons/handycap.svg';

export interface UserHeaderSectionProps {
  displayName: string;
  greeting?: string;
  avatarUri?: string;
  hasNotificationBadge?: boolean;
  onBellPress?: () => void;
  onAccessibilityPress?: () => void;
  /** Opens the signed-in user’s profile tab in the main user shell. */
  onAvatarPress?: () => void;
}

export function UserHeaderSection({
  displayName,
  greeting = 'Good Morning',
  avatarUri = DEFAULT_USER_HEADER_AVATAR_URI,
  hasNotificationBadge = true,
  onBellPress,
  onAccessibilityPress,
  onAvatarPress,
}: UserHeaderSectionProps) {
  const rightSlot = (
    <View style={styles.rightRow}>
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
        accessibilityRole="button"
        accessibilityLabel="Accessibility"
        style={styles.a11yBtn}
      >
        <HandycapIcon
          width={UtilityMethods.wp(5.5)}
          height={UtilityMethods.wp(5.5)}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <AdminHeader
      appearance="user"
      title={displayName}
      subtitle={greeting}
      avatarSource={{ uri: avatarUri }}
      rightSlot={rightSlot}
      onAvatarPress={onAvatarPress}
    />
  );
}

const styles = StyleSheet.create({
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
