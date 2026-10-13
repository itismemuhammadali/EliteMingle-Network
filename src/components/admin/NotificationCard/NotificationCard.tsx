import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PersonIcon, CloseIcon } from '../icons';
import PackageIcon from '../../../assets/Icons/package.svg';
import WarningIcon from '../../../assets/Icons/Warning.svg';
import AnalyticsIcon from '../../../assets/Icons/analytics.svg';
import type {
  Notification,
  NotificationType,
} from '../../../constants/notificationData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface NotificationCardProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onPress?: (notification: Notification) => void;
}

const PackageSvgIcon = ({ size, color }: { size?: number; color?: string }) => (
  <PackageIcon width={size} height={size} />
);

const WarningSvgIcon = ({ size, color }: { size?: number; color?: string }) => (
  <WarningIcon width={size} height={size} />
);

const AnalyticsSvgIcon = ({ size, color }: { size?: number; color?: string }) => (
  <AnalyticsIcon width={size} height={size} />
);

const TYPE_CONFIG: Record<
  NotificationType,
  {
    iconBgColor: string;
    IconComponent: React.ComponentType<{ size?: number; color?: string }>;
    iconSize?: number;
  }
> = {
  user: {
    iconBgColor: Colors.adminStatsBlue,
    IconComponent: PersonIcon,
  },
  product: {
    iconBgColor: Colors.adminActivePurple,
    IconComponent: PackageSvgIcon,
  },
  alert: {
    iconBgColor: '#FF9800',
    IconComponent: WarningSvgIcon,
  },
  report: {
    iconBgColor: 'transparent',
    IconComponent: AnalyticsSvgIcon,
    iconSize: UtilityMethods.wp(12),
  },
};

import { useLanguage } from '../../../context/LanguageContext';
import { getLocalizedNotification } from '../../../services/databaseTranslationService';

export function NotificationCard({
  notification,
  onDismiss,
  onMarkAsRead,
  onPress,
}: NotificationCardProps) {
  const { language } = useLanguage();
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.user;
  const { IconComponent } = config;
  const iconSize = config.iconSize || UtilityMethods.wp(6);

  const { title, body } = getLocalizedNotification(
    notification.title,
    notification.description,
  );

  return (
    <View
      style={[
        styles.card,
        notification.isRead ? styles.cardRead : styles.cardUnread,
      ]}
    >
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={() => onDismiss(notification.id)}
        activeOpacity={0.7}
      >
        <CloseIcon
          size={UtilityMethods.wp(5)}
          color={Colors.adminInactiveGrey}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.content}
        onPress={() => onPress?.(notification)}
        activeOpacity={onPress ? 0.75 : 1}
        disabled={!onPress}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: config.iconBgColor },
          ]}
        >
          <IconComponent size={iconSize} color={Colors.white} />
        </View>
        <View style={styles.textContent}>
          <Text style={styles.title}>{title || notification.title}</Text>
          <Text style={styles.description}>{body || notification.description}</Text>
          <View style={styles.footer}>
            <Text style={styles.timestamp}>{notification.timestamp}</Text>
            {!notification.isRead && (
              <TouchableOpacity
                onPress={() => onMarkAsRead(notification.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.markAsRead}>
                  {language === 'es' ? 'Marcar como leído' : 'Mark as read'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    marginBottom: UtilityMethods.hp(1.5),
    borderWidth: 1,
    position: 'relative',
  },
  cardUnread: {
    backgroundColor: 'rgba(133, 19, 140, 0.05)',
    borderColor: 'rgba(133, 19, 140, 0.2)',
  },
  cardRead: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(229, 231, 235, 1)',
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  dismissButton: {
    position: 'absolute',
    top: UtilityMethods.hp(1),
    right: UtilityMethods.wp(2),
    zIndex: 1,
    padding: UtilityMethods.wp(1),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.wp(12),
    borderRadius: UtilityMethods.wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.5),
  },
  description: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    lineHeight: FontSize.VALUE(20),
    marginBottom: UtilityMethods.hp(0.5),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: FontSize.VALUE(12),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  markAsRead: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '600',
    color: 'rgba(133, 19, 140, 1)',
  },
});
