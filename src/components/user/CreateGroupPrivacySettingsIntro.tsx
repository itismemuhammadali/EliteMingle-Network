import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import CreateGroupLockIntro from '../../assets/Icons/createGroupLockIntro.svg';

const ICON = UtilityMethods.wp(11);

export function CreateGroupPrivacySettingsIntro() {
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
        backgroundColor: '#E8F5E9',
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
        <CreateGroupLockIntro width={ICON} height={ICON} />
      </View>
      <Text style={styles.heading}>Privacy Settings</Text>
      <Text style={styles.desc}>Decide who can join your group</Text>
    </View>
  );
}
