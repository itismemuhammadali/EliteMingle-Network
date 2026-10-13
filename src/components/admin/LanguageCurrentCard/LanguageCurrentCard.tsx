import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlobeIcon } from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface LanguageCurrentCardProps {
  /** Display name e.g. "English" */
  languageName: string;
  /** Secondary line e.g. "(English)" */
  nativeLabel: string;
  label?: string;
}

export function LanguageCurrentCard({
  languageName,
  nativeLabel,
  label = 'Current Language',
}: LanguageCurrentCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <GlobeIcon size={UtilityMethods.wp(6)} color={Colors.primaryPurple} />
        <View style={styles.textBlock}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{languageName}</Text>
          <Text style={styles.native}>{nativeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    marginBottom: UtilityMethods.hp(2),
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: UtilityMethods.wp(3),
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.75),
  },
  value: {
    fontSize: FontSize.VALUE(17),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  native: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
});
