import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NotificationIcon } from '../admin/icons';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import { UserCenteredScreenHeader } from './UserCenteredScreenHeader';
import HandycapIcon from '../../assets/Icons/handycap.svg';

export interface UserMessagesHeaderProps {
  /** Defaults to "Message" */
  title?: string;
  hasNotificationBadge?: boolean;
  onBellPress?: () => void;
  /** Shown when `avatarUri` is not set (default layout per design). */
  onAccessibilityPress?: () => void;
  /**
   * When set, shows a circular avatar instead of the accessibility icon
   * (bell + badge stay the same).
   */
  avatarUri?: string;
  onAvatarPress?: () => void;
}

const AV = UtilityMethods.wp(9);

export function UserMessagesHeader({
  title = 'Message',
  hasNotificationBadge = true,
  onBellPress,
  onAccessibilityPress,
  avatarUri,
  onAvatarPress,
}: UserMessagesHeaderProps) {
  const trailing = avatarUri ? (
    <TouchableOpacity
      onPress={onAvatarPress}
      activeOpacity={0.85}
      accessibilityRole="imagebutton"
      accessibilityLabel="Profile"
    >
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
    </TouchableOpacity>
  ) : (
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
  );

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
      {trailing}
    </View>
  );

  return <UserCenteredScreenHeader title={title} rightSlot={rightSlot} />;
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
    padding: UtilityMethods.wp(0.5),
  },
  avatar: {
    width: AV,
    height: AV,
    borderRadius: AV / 2,
    marginLeft: UtilityMethods.wp(2.5),
    backgroundColor: Colors.inputBackground,
  },
});
