import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SupportHoursSchedule } from '../../../constants/helpSupportData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface SupportHoursCardProps {
  schedule: SupportHoursSchedule[];
}

export function SupportHoursCard({ schedule }: SupportHoursCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Support Hours</Text>
      {schedule.map(line => (
        <Text key={line.id} style={styles.line}>
          {line.label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(76, 125, 255, 0.08)',
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    borderWidth: 1,
    borderColor: 'rgba(76, 125, 255, 0.35)',
    marginBottom: UtilityMethods.hp(2),
  },
  title: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: UtilityMethods.hp(1.5),
  },
  line: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: '#1E40AF',
    marginBottom: UtilityMethods.hp(0.75),
  },
});
