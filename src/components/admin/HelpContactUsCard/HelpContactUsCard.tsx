import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmailIconSmall, PhoneIcon } from '../icons';
import type { HelpContactItem } from '../../../constants/helpSupportData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface HelpContactUsCardProps {
  items: HelpContactItem[];
}

export function HelpContactUsCard({ items }: HelpContactUsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Contact Us</Text>
      {items.map(item => (
        <View key={item.id} style={styles.rowOuter}>
          <View style={styles.rowInner}>
            <View
              style={[
                styles.iconBox,
                item.type === 'email' ? styles.iconBoxEmail : styles.iconBoxPhone,
              ]}
            >
              {item.type === 'email' ? (
                <EmailIconSmall
                  size={UtilityMethods.wp(5)}
                  color={Colors.adminStatsBlue}
                />
              ) : (
                <PhoneIcon
                  size={UtilityMethods.wp(5)}
                  color={Colors.adminStatsGreen}
                />
              )}
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(2),
  },
  rowOuter: {
    marginBottom: UtilityMethods.hp(1.5),
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: UtilityMethods.wp(2),
    padding: UtilityMethods.wp(3),
  },
  iconBox: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.wp(12),
    borderRadius: UtilityMethods.wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  iconBoxEmail: {
    backgroundColor: 'rgba(76, 125, 255, 0.15)',
  },
  iconBoxPhone: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  textBlock: {
    flex: 1,
  },
  rowTitle: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  rowValue: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
});
