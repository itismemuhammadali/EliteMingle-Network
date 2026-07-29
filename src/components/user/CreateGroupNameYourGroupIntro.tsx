import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { UserTabGroupsIcon } from './icons';

export function CreateGroupNameYourGroupIntro() {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      wrap: {
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(2.5),
        paddingHorizontal: UtilityMethods.wp(2),
      },
      iconTile: {
        width: UtilityMethods.wp(22),
        height: UtilityMethods.wp(22),
        borderRadius: UtilityMethods.wp(4),
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: UtilityMethods.hp(1.75),
      },
      heading: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.75),
        textAlign: 'center',
      },
      desc: {
        fontSize: FontSize.VALUE(14),
        color: Colors.placeholderGrey,
        textAlign: 'center',
        lineHeight: FontSize.VALUE(20),
        paddingHorizontal: UtilityMethods.wp(2),
      },
    }),
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.iconTile}>
        <UserTabGroupsIcon
          size={UtilityMethods.wp(11)}
          color={Colors.userActiveTabPurple}
        />
      </View>
      <Text style={styles.heading}>Name Your Group</Text>
      <Text style={styles.desc}>
        Choose a name that describes what your group is about
      </Text>
    </View>
  );
}
