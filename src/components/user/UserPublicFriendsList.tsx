import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import type { PublicProfileFriendRow } from '../../constants/publicUserProfilesData';

const AV = UtilityMethods.wp(12);

export interface UserPublicFriendsListProps {
  friends: PublicProfileFriendRow[];
  onViewProfile: (friend: PublicProfileFriendRow) => void;
}

function initialsFromName(name?: string | null): string {
  const safeName = (name || '').trim();
  if (!safeName) return '?';
  const p = safeName.split(/\s+/).filter(Boolean);
  if (p.length >= 2) {
    return (p[0][0] + p[1][0]).toUpperCase();
  }
  return (p[0]?.slice(0, 2) ?? '?').toUpperCase();
}

export function UserPublicFriendsList({
  friends,
  onViewProfile,
}: UserPublicFriendsListProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      root: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(2),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        overflow: 'hidden',
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(1.35),
        paddingHorizontal: UtilityMethods.wp(4),
      },
      rowWithDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      avatarWrap: {
        width: AV,
        height: AV,
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
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.white,
      },
      textCol: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      name: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.25),
      },
      subtitle: {
        fontSize: FontSize.VALUE(13),
        color: Colors.userGroupMemberMeta,
      },
      viewBtn: {
        paddingVertical: UtilityMethods.hp(0.65),
        paddingHorizontal: UtilityMethods.wp(3.5),
        borderRadius: UtilityMethods.wp(2),
        borderWidth: 1,
        borderColor: Colors.textDark,
        backgroundColor: Colors.white,
      },
      viewText: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.textDark,
      },
    }),
  );

  return (
    <View style={styles.root}>
      {friends.map((f, index) => (
        <View
          key={f.id}
          style={[
            styles.row,
            index < friends.length - 1 && styles.rowWithDivider,
          ]}
        >
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => onViewProfile(f)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${f.name} profile`}
          >
            {f.avatarUrl ? (
              <Image
                source={{ uri: f.avatarUrl }}
                style={styles.avatarImg}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: f.avatarColor ?? Colors.adminStatsBlue },
                ]}
              >
                <Text style={styles.avatarInitials}>
                  {f.initials ?? initialsFromName(f.name)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.textCol}>
            <TouchableOpacity
              onPress={() => onViewProfile(f)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${f.name} profile`}
            >
              <Text style={styles.name}>{f.name}</Text>
            </TouchableOpacity>
            <Text style={styles.subtitle}>{f.subtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => onViewProfile(f)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`View ${f.name}`}
          >
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
