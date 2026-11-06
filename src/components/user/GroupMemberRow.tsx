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
import type { UserGroupMember } from '../../constants/userGroupsData';

const AV = UtilityMethods.wp(14);

export interface GroupMemberRowProps {
  member: UserGroupMember;
  onViewPress?: (member: UserGroupMember) => void;
  canMakeAdmin?: boolean;
  onMakeAdminPress?: (member: UserGroupMember) => void;
}

export function GroupMemberRow({
  member,
  onViewPress,
  canMakeAdmin,
  onMakeAdminPress,
}: GroupMemberRowProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(2.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.35),
        paddingHorizontal: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(1.1),
      },
      avatar: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        backgroundColor: Colors.inputBackground,
      },
      textCol: {
        flex: 1,
        minWidth: 0,
        marginLeft: UtilityMethods.wp(3),
        marginRight: UtilityMethods.wp(2),
        justifyContent: 'center',
      },
      name: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.35),
      },
      role: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.userGroupMemberMeta,
      },
      actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      makeAdminBtn: {
        paddingVertical: UtilityMethods.hp(0.75),
        paddingHorizontal: UtilityMethods.wp(3),
        borderRadius: UtilityMethods.wp(6),
        borderWidth: 1,
        borderColor: Colors.chartMalePurple,
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
        marginRight: UtilityMethods.wp(2),
      },
      makeAdminLabel: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.chartMalePurple,
      },
      viewBtn: {
        paddingVertical: UtilityMethods.hp(0.75),
        paddingHorizontal: UtilityMethods.wp(3.5),
        borderRadius: UtilityMethods.wp(6),
        borderWidth: 1,
        borderColor: Colors.userProfilePurple,
        backgroundColor: Colors.white,
      },
      viewBtnLabel: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.userProfilePurple,
      },
    }),
  );

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: member.avatarUri }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.textCol}>
        <Text style={styles.name} numberOfLines={1}>
          {member.name}
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {member.role}
        </Text>
      </View>
      <View style={styles.actionsRow}>
        {canMakeAdmin && onMakeAdminPress ? (
          <TouchableOpacity
            style={styles.makeAdminBtn}
            onPress={() => onMakeAdminPress(member)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Make ${member.name} Admin`}
          >
            <Text style={styles.makeAdminLabel}>Make Admin</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() =>
            onViewPress
              ? onViewPress(member)
              : Alert.alert('View', member.name)
          }
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`View ${member.name}`}
        >
          <Text style={styles.viewBtnLabel}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
