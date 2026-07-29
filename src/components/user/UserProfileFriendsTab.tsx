import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import type { UserFriendListItem } from '../../constants/userFriendsListData';
import PersonPlusIcon from '../../assets/Icons/profile/personPlus.svg';
import CommentIcon from '../../assets/Icons/BlackComment.svg';

const AV = UtilityMethods.wp(14);
const ICON_SM = UtilityMethods.wp(4.25);
const ONLINE = '#22C55E';

export interface UserProfileFriendsTabProps {
  friends: UserFriendListItem[];
  onFindFriendsPress?: () => void;
  onViewProfile?: (friend: UserFriendListItem) => void;
  onMessage?: (friend: UserFriendListItem) => void;
}

function initialsFromName(name?: string | null): string {
  const safeName = (name || '').trim();
  if (!safeName) return 'F';
  return safeName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'F';
}

export function UserProfileFriendsTab({
  friends,
  onFindFriendsPress,
  onViewProfile,
  onMessage,
}: UserProfileFriendsTabProps) {
  const count = friends.length;

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      root: {
        width: '100%',
      },
      sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: UtilityMethods.hp(1.5),
        paddingHorizontal: 0,
      },
      sectionTitle: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '700',
        color: Colors.textDark,
      },
      findFriendsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(0.85),
        paddingHorizontal: UtilityMethods.wp(3),
        borderRadius: UtilityMethods.wp(6),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      findFriendsText: {
        marginLeft: UtilityMethods.wp(1.5),
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.textDark,
      },
      card: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.5),
        marginBottom: UtilityMethods.hp(1.5),
      },
      cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: UtilityMethods.hp(1.25),
      },
      avatarWrap: {
        width: AV,
        height: AV,
        marginRight: UtilityMethods.wp(3),
      },
      avatarImg: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        backgroundColor: Colors.inputBackground,
      },
      avatarFallback: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarInitials: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      onlineDot: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: UtilityMethods.wp(3.5),
        height: UtilityMethods.wp(3.5),
        borderRadius: UtilityMethods.wp(1.75),
        backgroundColor: ONLINE,
        borderWidth: 2,
        borderColor: Colors.white,
      },
      info: {
        flex: 1,
        minWidth: 0,
        paddingTop: UtilityMethods.hp(0.25),
      },
      friendName: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.35),
      },
      mutual: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.userGroupMemberMeta,
      },
      cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
      viewProfileBtn: {
        paddingVertical: UtilityMethods.hp(0.85),
        paddingHorizontal: UtilityMethods.wp(3.5),
        borderRadius: UtilityMethods.wp(2),
        borderWidth: 1,
        borderColor: Colors.userProfilePurple,
        marginRight: UtilityMethods.wp(2),
      },
      viewProfileText: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.userProfilePurple,
      },
      messageBtn: {
        width: UtilityMethods.wp(11),
        height: UtilityMethods.wp(11),
        borderRadius: UtilityMethods.wp(2),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
      },
    }),
  );

  function UserFriendCard({
    friend,
    onViewProfile: onViewProfileCard,
    onMessage: onMessageCard,
  }: {
    friend: UserFriendListItem;
    onViewProfile?: (f: UserFriendListItem) => void;
    onMessage?: (f: UserFriendListItem) => void;
  }) {
    const label = friend.initials ?? initialsFromName(friend.name);
    const bg = friend.avatarColor ?? Colors.adminStatsBlue;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.8}
            onPress={() =>
              onViewProfileCard
                ? onViewProfileCard(friend)
                : Alert.alert('View profile', friend.name)
            }
            accessibilityRole="button"
            accessibilityLabel={`${friend.name} profile`}
          >
            {friend.avatarUrl ? (
              <Image
                source={{ uri: friend.avatarUrl }}
                style={styles.avatarImg}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: bg }]}>
                <Text style={styles.avatarInitials}>{label}</Text>
              </View>
            )}
            {friend.isOnline ? <View style={styles.onlineDot} /> : null}
          </TouchableOpacity>
          <View style={styles.info}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                onViewProfileCard
                  ? onViewProfileCard(friend)
                  : Alert.alert('View profile', friend.name)
              }
              accessibilityRole="button"
              accessibilityLabel={`${friend.name} profile`}
            >
              <Text style={styles.friendName}>{friend.name}</Text>
            </TouchableOpacity>
            <Text style={styles.mutual}>
              {friend.mutualFriends} mutual friends
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() =>
              onViewProfileCard
                ? onViewProfileCard(friend)
                : Alert.alert('View profile', friend.name)
            }
            activeOpacity={0.85}
          >
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() =>
              onMessageCard
                ? onMessageCard(friend)
                : Alert.alert('Message', friend.name)
            }
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Message ${friend.name}`}
          >
            <CommentIcon width={ICON_SM} height={ICON_SM} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Friends ({count})</Text>
        <TouchableOpacity
          style={styles.findFriendsBtn}
          onPress={() =>
            onFindFriendsPress
              ? onFindFriendsPress()
              : Alert.alert('Find Friends', 'Search will open here.')
          }
          activeOpacity={0.85}
        >
          <PersonPlusIcon width={ICON_SM} height={ICON_SM} />
          <Text style={styles.findFriendsText}>Find Friends</Text>
        </TouchableOpacity>
      </View>

      {friends.map(f => (
        <UserFriendCard
          key={f.id}
          friend={f}
          onViewProfile={onViewProfile}
          onMessage={onMessage}
        />
      ))}
    </View>
  );
}
