import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FlagIcon from 'react-native-ico-flags';
import SingleTick from '../../../assets/Icons/SingleTick.svg';
import type { LanguageOption } from '../../../constants/languagesData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface LanguageListItemProps {
  item: LanguageOption;
  selected: boolean;
  onPress: (item: LanguageOption) => void;
}

export function LanguageListItem({
  item,
  selected,
  onPress,
}: LanguageListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.row, selected ? styles.rowSelected : styles.rowUnselected]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.flagWrap}>
        <FlagIcon
          name={item.flagName as any}
          width={UtilityMethods.wp(10)}
          height={UtilityMethods.wp(8)}
        />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.labelEn}>{item.labelEn}</Text>
        <Text style={styles.labelNative}>{item.labelNative}</Text>
      </View>
      {selected ? (
        <View style={styles.checkCircle}>
          <SingleTick width={UtilityMethods.wp(4.5)} height={UtilityMethods.wp(4.5)} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(3),
    marginBottom: UtilityMethods.hp(1.5),
  },
  rowSelected: {
    backgroundColor: 'rgba(250, 245, 251, 1)',
    borderWidth: 1,
    borderColor: Colors.primaryPurple,
  },
  rowUnselected: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
  },
  flagWrap: {
    marginRight: UtilityMethods.wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
  },
  labelEn: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  labelNative: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  checkCircle: {
    width: UtilityMethods.wp(8),
    height: UtilityMethods.wp(8),
    borderRadius: UtilityMethods.wp(4),
    backgroundColor: Colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
