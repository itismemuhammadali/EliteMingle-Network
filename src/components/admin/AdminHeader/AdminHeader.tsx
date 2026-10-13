import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NotificationIcon } from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { ProfileAvatar } from '../../general/ProfileAvatar';
import { subscribeToAdminNotifications } from '../../../services/moderationService';

export type AdminHeaderAppearance = 'admin' | 'user';

export interface AdminHeaderProps {
  /** Main heading text (large, bold) */
  title: string;
  /** Small text below the title */
  subtitle: string;
  /** Optional circular avatar (e.g. `{ uri: string }`). When set, shown left of title/subtitle. */
  avatarSource?: ImageSourcePropType;
  /** Visual preset: admin (grey bar) vs user (white bar + tighter type scale). */
  appearance?: AdminHeaderAppearance;
  /** Replaces the entire right area (multiple icons, custom layout). Takes precedence over `rightIcon`. */
  rightSlot?: React.ReactNode;
  /** Optional custom right icon — used when `rightSlot` is not provided. Defaults to notification bell. */
  rightIcon?: React.ReactNode;
  /** Called when the default notification bell is pressed (ignored if you use `rightSlot` or custom `rightIcon`). */
  onRightIconPress?: () => void;
  /** Show red badge on the default notification icon */
  hasNotificationBadge?: boolean;
  /** When set with `avatarSource`, the avatar becomes tappable. */
  onAvatarPress?: () => void;
  /** Optional content to render above the title (e.g. a back button). */
  headerLeft?: React.ReactNode;
  /** Whether to show the bottom divider line. Defaults to true for admin. */
  showDivider?: boolean;
}

export function AdminHeader({
  title,
  subtitle,
  avatarSource,
  appearance = 'admin',
  rightSlot,
  rightIcon,
  onRightIconPress,
  hasNotificationBadge,
  onAvatarPress,
  headerLeft,
  showDivider = true,
}: AdminHeaderProps) {
  const insets = useSafeAreaInsets();
  const [dynamicBadge, setDynamicBadge] = useState(false);

  useEffect(() => {
    if (hasNotificationBadge !== undefined) return;
    const adminUid = auth().currentUser?.uid;
    let readSet = new Set<string>();
    let dismissedSet = new Set<string>();
    let rawList: any[] = [];

    const recompute = () => {
      const count = rawList.filter(
        n => !dismissedSet.has(n.id) && !readSet.has(n.id),
      ).length;
      setDynamicBadge(count > 0);
    };

    const unsubAdmin = subscribeToAdminNotifications(list => {
      rawList = (list as any[]) || [];
      recompute();
    });

    let unsubMeta = () => {};
    if (adminUid) {
      unsubMeta = firestore()
        .collection('users')
        .doc(adminUid)
        .collection('meta')
        .doc('admin_notifications')
        .onSnapshot(doc => {
          if (doc && (typeof doc.exists === 'function' ? doc.exists() : doc.exists)) {
            const data = doc.data() || {};
            if (Array.isArray(data.readIds)) readSet = new Set(data.readIds);
            if (Array.isArray(data.dismissedIds)) dismissedSet = new Set(data.dismissedIds);
          }
          recompute();
        });
    }

    return () => {
      unsubAdmin();
      unsubMeta();
    };
  }, [hasNotificationBadge]);

  const showBadge =
    hasNotificationBadge !== undefined ? hasNotificationBadge : dynamicBadge;
  const isUser = appearance === 'user';
  const statusBarHeight = insets.top || 0;

  const defaultRightIcon = (
    <TouchableOpacity
      onPress={onRightIconPress}
      activeOpacity={0.7}
      style={styles.defaultBellButton}
    >
      <NotificationIcon
        size={UtilityMethods.wp(6)}
        color={Colors.adminInactiveGrey}
      />
      {showBadge && <View style={styles.badgeOnBell} />}
    </TouchableOpacity>
  );

  const renderRight = () => {
    if (rightSlot != null) {
      return rightSlot;
    }
    if (rightIcon != null) {
      return rightIcon;
    }
    return defaultRightIcon;
  };

  const avatarUri =
    avatarSource && typeof avatarSource === 'object' && 'uri' in avatarSource
      ? (avatarSource as { uri?: string }).uri
      : undefined;

  const avatarNode = avatarSource ? (
    <ProfileAvatar uri={avatarUri} size={UtilityMethods.wp(10)} />
  ) : null;

  const leftContent = avatarSource ? (
    <View style={styles.leftWithAvatar}>
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
      <View style={styles.textContent}>
        <Text
          style={[styles.title, isUser && styles.titleUser]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={[styles.subtitle, isUser && styles.subtitleUser]}>
          {subtitle}
        </Text>
      </View>
    </View>
  ) : (
    <View style={styles.textContent}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <View style={{ marginTop: -statusBarHeight }}>
      <View
        style={[
          styles.container,
          isUser ? styles.containerUser : styles.containerAdmin,
          { paddingTop: statusBarHeight + UtilityMethods.hp(2) },
          isUser && !showDivider && { borderBottomWidth: 0 },
        ]}
      >
        {headerLeft && <View style={styles.headerLeftWrap}>{headerLeft}</View>}
        <View style={styles.headerRow}>
          {leftContent}
          <View style={styles.rightWrap}>{renderRight()}</View>
        </View>
      </View>
      {!isUser && showDivider && <View style={styles.fullWidthLine} />}
    </View>
  );
}

const AVATAR = UtilityMethods.wp(12);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerAdmin: {
    backgroundColor: Colors.adminBackgroundGrey,
    paddingHorizontal: UtilityMethods.wp(5),
  },
  containerUser: {
    marginBottom: UtilityMethods.hp(1.5),
    borderBottomWidth: 1,
    borderColor: 'rgba(16, 16, 16, 0.2)',
    paddingHorizontal: UtilityMethods.wp(5),
  },
  fullWidthLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#10101099',
    marginBottom: UtilityMethods.hp(3),
    marginHorizontal: -UtilityMethods.wp(5),
  },
  leftWithAvatar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: UtilityMethods.wp(2),
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    marginRight: UtilityMethods.wp(3),
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.VALUE(22),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  titleUser: {
    fontSize: FontSize.VALUE(17),
  },
  subtitle: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(1),
  },
  subtitleUser: {
    fontSize: FontSize.VALUE(13),
    color: Colors.placeholderGrey,
  },
  rightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  headerLeftWrap: {
    marginBottom: UtilityMethods.hp(1),
  },
  defaultBellButton: {
    borderRadius: 50,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGreyNotification,
    padding: UtilityMethods.wp(2),
    position: 'relative',
  },
  badgeOnBell: {
    position: 'absolute',
    top: UtilityMethods.hp(0.35),
    right: UtilityMethods.wp(1.25),
    width: UtilityMethods.wp(2),
    height: UtilityMethods.wp(2),
    borderRadius: UtilityMethods.wp(1),
    backgroundColor: Colors.adminNotificationBadge,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});
