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
import type { UserProfileGroupRow } from '../../constants/userProfileGroupsData';
import ChevronRightIcon from '../../assets/Icons/profile/chevronRight.svg';

const THUMB = UtilityMethods.wp(18);
const CHEVRON = UtilityMethods.wp(3.25);

export interface UserProfileGroupsTabProps {
  groups: UserProfileGroupRow[];
  /** Section title (default: "Your Groups") */
  sectionTitle?: string;
  onViewGroup?: (group: UserProfileGroupRow) => void;
}

export function UserProfileGroupsTab({
  groups,
  sectionTitle = 'Your Groups',
  onViewGroup,
}: UserProfileGroupsTabProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      root: {
        width: '100%',
      },
      sectionTitle: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: UtilityMethods.hp(1.75),
        marginTop: UtilityMethods.hp(0.25),
      },
      card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(4),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(3.5),
        marginBottom: UtilityMethods.hp(1.5),
      },
      thumb: {
        width: THUMB,
        height: THUMB,
        borderRadius: UtilityMethods.wp(2.5),
        backgroundColor: Colors.inputBackground,
      },
      textCol: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        minWidth: 0,
      },
      groupName: {
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: UtilityMethods.hp(0.85),
        paddingHorizontal: UtilityMethods.wp(3),
        borderRadius: UtilityMethods.wp(6),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        backgroundColor: Colors.white,
        marginLeft: UtilityMethods.wp(2),
      },
      viewText: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.textDark,
        marginRight: UtilityMethods.wp(0.75),
      },
    }),
  );

  function ProfileGroupCard({
    group,
    onView,
  }: {
    group: UserProfileGroupRow;
    onView?: (g: UserProfileGroupRow) => void;
  }) {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: group.imageUrl }}
          style={styles.thumb}
          resizeMode="cover"
        />
        <View style={styles.textCol}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.role} numberOfLines={1}>
            {group.roleLabel}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() =>
            onView ? onView(group) : Alert.alert('View', group.name)
          }
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`View ${group.name}`}
        >
          <Text style={styles.viewText}>View</Text>
          <ChevronRightIcon width={CHEVRON} height={CHEVRON} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      {groups.map(g => (
        <ProfileGroupCard key={g.id} group={g} onView={onViewGroup} />
      ))}
    </View>
  );
}
