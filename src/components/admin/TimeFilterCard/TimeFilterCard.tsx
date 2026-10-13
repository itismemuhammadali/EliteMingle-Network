import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarIcon } from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { useLanguage } from '../../../context/LanguageContext';

interface TimeFilterCardProps {
  label: string;
  onChangePress?: () => void;
  changeButtonText?: string;
}

export function TimeFilterCard({
  label,
  onChangePress,
  changeButtonText,
}: TimeFilterCardProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <CalendarIcon
          size={UtilityMethods.wp(5.5)}
          color={Colors.adminInactiveGrey}
        />
        <Text style={styles.label}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.changeButton}
        onPress={onChangePress}
        activeOpacity={0.7}
      >
        <Text style={styles.changeText}>
          {changeButtonText || t('common.change', 'Change')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    marginBottom: UtilityMethods.hp(2),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(3),
  },
  label: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '500',
    color: Colors.textDark,
  },
  changeButton: {
    paddingVertical: UtilityMethods.hp(0.5),
    paddingHorizontal: UtilityMethods.wp(2),
  },
  changeText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.primaryPurple,
  },
});
