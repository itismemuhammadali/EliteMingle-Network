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
}

export function GroupMemberRow({ member, onViewPress }: GroupMemberRowProps) {
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
      viewBtn: {
        paddingVertical: UtilityMethods.hp(0.75),
        paddingHorizontal: UtilityMethods.wp(4.5),
        borderRadius: UtilityMethods.wp(6),
        borderWidth: 1,
        borderColor: Colors.userProfilePurple,
        backgroundColor: Colors.white,
      },
      viewBtnLabel: {
        fontSize: FontSize.VALUE(14),
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
  );
}
