import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  change: string;
  iconBgColor?: string;
}

export function StatCard({
  icon,
  value,
  label,
  change,
  iconBgColor,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          iconBgColor ? { backgroundColor: iconBgColor } : { backgroundColor: 'transparent' },
        ]}
      >
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.change}>{change}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: UtilityMethods.wp(11),
    height: UtilityMethods.wp(11),
    borderRadius: UtilityMethods.wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UtilityMethods.hp(1.5),
  },
  value: {
    fontSize: FontSize.VALUE(28),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.5),
  },
  label: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(0.5),
  },
  change: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: Colors.adminSuccessGreen,
  },
});
