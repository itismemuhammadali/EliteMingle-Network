import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { UserAppNotification } from '../../constants/userNotificationsData';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import CommentBoxIcon from '../../assets/Icons/commentBox.svg';

const ICON_WRAP = UtilityMethods.wp(11);
const GLYPH = UtilityMethods.wp(5.5);
const UNREAD_DOT = UtilityMethods.wp(1.75);

function MessageGlyph({ color }: { color: string }) {
  return (
    <Svg width={GLYPH} height={GLYPH} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 8C21 6.4087 20.3679 4.88258 19.2426 3.75736C18.1174 2.63214 16.5913 2 15 2H9C7.4087 2 5.88258 2.63214 4.75736 3.75736C3.63214 4.88258 3 6.4087 3 8V14C3 15.5913 3.63214 17.1174 4.75736 18.2426C5.88258 19.3679 7.4087 20 9 20H15C16.5913 20 18.1174 19.3679 19.2426 18.2426C20.3679 17.1174 21 15.5913 21 14V8Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 8H16M8 12H14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HeartGlyph({ color }: { color: string }) {
  return (
    <Svg width={GLYPH} height={GLYPH} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface UserNotificationRowProps {
  notification: UserAppNotification;
  onPress?: () => void;
}

function FriendGlyph({ color }: { color: string }) {
  return (
    <Svg width={GLYPH} height={GLYPH} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function NotificationGlyph({ type }: { type: UserAppNotification['type'] }) {
  switch (type) {
    case 'message':
      return <CommentBoxIcon width={GLYPH} height={GLYPH} />;
    case 'like':
      return <HeartGlyph color="#E53935" />;
    case 'comment':
      return <CommentBoxIcon width={GLYPH} height={GLYPH} />;
    case 'friend_request':
    case 'friend_accept':
      return <FriendGlyph color={Colors.userProfilePurple} />;
    default:
      return <MessageGlyph color={Colors.textGrey} />;
  }
}

export function UserNotificationRow({
  notification,
  onPress,
}: UserNotificationRowProps) {
  const unread = !notification.isRead;
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: UtilityMethods.wp(3),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(3.5),
        marginBottom: UtilityMethods.hp(1.25),
      },
      cardUnread: {
        backgroundColor: Colors.userNotificationUnreadBg,
      },
      cardRead: {
        backgroundColor: Colors.white,
      },
      iconCircle: {
        width: ICON_WRAP,
        height: ICON_WRAP,
        borderRadius: ICON_WRAP / 2,
        backgroundColor: Colors.white,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      textCol: {
        flex: 1,
        minWidth: 0,
      },
      topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: UtilityMethods.hp(0.45),
      },
      titleWrap: {
        flex: 1,
        minWidth: 0,
        paddingRight: UtilityMethods.wp(2),
      },
      title: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.textDark,
      },
      timeBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        paddingTop: UtilityMethods.hp(0.15),
      },
      time: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '400',
        color: Colors.placeholderGrey,
      },
      unreadDot: {
        width: UNREAD_DOT,
        height: UNREAD_DOT,
        borderRadius: UNREAD_DOT / 2,
        marginLeft: UtilityMethods.wp(1.25),
        backgroundColor: Colors.userNotificationUnreadDot,
      },
      subtitle: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.placeholderGrey,
        lineHeight: FontSize.VALUE(19),
      },
    }),
  );

  return (
    <TouchableOpacity
      style={[
        styles.card,
        unread ? styles.cardUnread : styles.cardRead,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      <View style={styles.iconCircle}>
        <NotificationGlyph type={notification.type} />
      </View>
      <View style={styles.textCol}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {notification.title}
            </Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.time}>{notification.timeAgo}</Text>
            {unread ? <View style={styles.unreadDot} /> : null}
          </View>
        </View>
        <Text style={styles.subtitle} numberOfLines={3}>
          {notification.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
