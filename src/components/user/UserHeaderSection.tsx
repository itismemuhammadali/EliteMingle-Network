import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NotificationIcon } from '../admin/icons';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { ProfileAvatar } from '../general/ProfileAvatar';
import HandycapIcon from '../../assets/Icons/handycap.svg';
import { subscribeToUnreadCount } from '../../services/notificationService';

export interface UserHeaderSectionProps {
  displayName: string;
  greeting?: string;
  avatarUri?: string;
  hasNotificationBadge?: boolean;
  onBellPress?: () => void;
  onAccessibilityPress?: () => void;
  /** Opens the signed-in user’s profile tab in the main user shell. */
  onAvatarPress?: () => void;
  backgroundColor?: string;
}

export function UserHeaderSection({
  displayName,
  greeting = 'Good Morning',
  avatarUri,
  hasNotificationBadge,
  onBellPress,
  onAccessibilityPress,
  onAvatarPress,
  backgroundColor = Colors.userFeedBackground,
}: UserHeaderSectionProps) {
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
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        height: UtilityMethods.hp(7.5),
        minHeight: UtilityMethods.hp(7.5),
        paddingHorizontal: UtilityMethods.wp(5),
        backgroundColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderGrey,
      },
      leftRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: UtilityMethods.wp(2),
      },
      textWrap: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: UtilityMethods.wp(2.5),
      },
      title: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
      subtitle: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '400',
        color: Colors.placeholderGrey,
        marginTop: UtilityMethods.hp(0.2),
      },
      rightRow: {
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
    }),
  );

  const avatarNode = (
    <ProfileAvatar uri={avatarUri} size={UtilityMethods.wp(9.5)} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {onAvatarPress ? (
          <TouchableOpacity
            onPress={onAvatarPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            {avatarNode}
          </TouchableOpacity>
        ) : (
          avatarNode
        )}
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {greeting}
          </Text>
        </View>
      </View>

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
          {showBadge && <View style={styles.badge} />}
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
    </View>
  );
}
