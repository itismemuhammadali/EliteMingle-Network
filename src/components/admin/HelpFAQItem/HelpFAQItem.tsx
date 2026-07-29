import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRightIcon } from '../icons';
import type { HelpFaqItem as HelpFaqItemType } from '../../../constants/helpSupportData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface HelpFAQItemProps {
  item: HelpFaqItemType;
  onPress?: (item: HelpFaqItemType) => void;
}

export function HelpFAQItem({ item, onPress }: HelpFAQItemProps) {
  const content = (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.question}>{item.question}</Text>
        <ChevronRightIcon
          size={UtilityMethods.wp(5)}
          color={Colors.adminInactiveGrey}
        />
      </View>
      <Text style={styles.answerPreview}>{item.answerPreview}</Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: UtilityMethods.wp(2),
    padding: UtilityMethods.wp(3),
    marginBottom: UtilityMethods.hp(1.5),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: UtilityMethods.wp(2),
    marginBottom: UtilityMethods.hp(0.75),
  },
  question: {
    flex: 1,
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.textDark,
  },
  answerPreview: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    lineHeight: FontSize.VALUE(19),
  },
});
