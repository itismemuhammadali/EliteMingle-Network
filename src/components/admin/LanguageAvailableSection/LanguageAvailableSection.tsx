import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LanguageListItem } from '../LanguageListItem';
import type { LanguageOption } from '../../../constants/languagesData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface LanguageAvailableSectionProps {
  items: LanguageOption[];
  selectedId: string;
  onSelect: (item: LanguageOption) => void;
}

export function LanguageAvailableSection({
  items,
  selectedId,
  onSelect,
}: LanguageAvailableSectionProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Available Languages</Text>
      {items.map(item => (
        <LanguageListItem
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onPress={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: UtilityMethods.hp(1),
  },
  sectionTitle: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(2),
  },
});
