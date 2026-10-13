import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

export interface UserGroupsSectionHeaderProps {
  onCreatePress?: () => void;
}

export function UserGroupsSectionHeader({
  onCreatePress,
}: UserGroupsSectionHeaderProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: UtilityMethods.hp(1.5),
        marginBottom: UtilityMethods.hp(2),
      },
      title: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '700',
        color: Colors.textDark,
      },
      createBtn: {
        backgroundColor: Colors.userGroupsCreatePurple,
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.1),
        borderRadius: UtilityMethods.wp(8),
      },
      createLabel: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '700',
        color: Colors.white,
      },
    }),
  );

  return (
    <View style={styles.row}>
      <Text style={styles.title}>My Groups</Text>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={onCreatePress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create group"
      >
        <Text style={styles.createLabel}>+ Create</Text>
      </TouchableOpacity>
    </View>
  );
}
