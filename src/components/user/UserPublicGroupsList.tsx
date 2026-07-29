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
import type { UserProfileGroupRow } from '../../constants/userProfileGroupsData';

const THUMB = UtilityMethods.wp(16);

export interface UserPublicGroupsListProps {
  groups: UserProfileGroupRow[];
  onViewGroup: (group: UserProfileGroupRow) => void;
}

export function UserPublicGroupsList({
  groups,
  onViewGroup,
}: UserPublicGroupsListProps) {
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
      name: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.25),
      },
      role: {
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
      {groups.map((g, index) => (
        <View
          key={g.id}
          style={[
            styles.row,
            index < groups.length - 1 && styles.rowWithDivider,
          ]}
        >
          <Image
            source={{ uri: g.imageUrl }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.textCol}>
            <Text style={styles.name} numberOfLines={1}>
              {g.name}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {g.roleLabel}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => onViewGroup(g)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`View ${g.name}`}
          >
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
