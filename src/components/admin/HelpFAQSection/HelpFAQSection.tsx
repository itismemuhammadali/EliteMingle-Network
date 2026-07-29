import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HelpIcon } from '../icons';
import { HelpFAQItem } from '../HelpFAQItem';
import type { HelpFaqItem as HelpFaqItemType } from '../../../constants/helpSupportData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface HelpFAQSectionProps {
  items: HelpFaqItemType[];
  onFaqPress?: (item: HelpFaqItemType) => void;
}

export function HelpFAQSection({ items, onFaqPress }: HelpFAQSectionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <HelpIcon size={19.9} color={Colors.primaryPurple} />
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      </View>
      {items.map(item => (
        <HelpFAQItem key={item.id} item={item} onPress={onFaqPress} />
      ))}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(2),
    gap: UtilityMethods.wp(2),
  },
  faqIconCircle: {
    width: UtilityMethods.wp(10),
    height: UtilityMethods.wp(10),
    borderRadius: UtilityMethods.wp(5),
    backgroundColor: Colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
  },
});
