import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

const WEEKLY_DATA = [
  { value: 150, label: 'Mon' },
  { value: 280, label: 'Tue' },
  { value: 350, label: 'Wed' },
  { value: 420, label: 'Thu' },
  { value: 380, label: 'Fri' },
  { value: 480, label: 'Sat' },
  { value: 550, label: 'Sun' },
];

export function WeeklyActivityChart() {
  const chartWidth = UtilityMethods.wp(72);
  const chartHeight = UtilityMethods.hp(20);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Activity</Text>
      <Text style={styles.subtitle}>Active users per day</Text>
      <LineChart
        data={WEEKLY_DATA}
        curved
        width={chartWidth}
        height={chartHeight}
        maxValue={600}
        noOfSections={4}
        stepValue={150}
        initialSpacing={UtilityMethods.wp(2)}
        endSpacing={0}
        spacing={UtilityMethods.wp(9.5)}
        color={Colors.chartMalePurple}
        thickness={2.5}
        hideDataPoints={false}
        dataPointsColor={Colors.chartMalePurple}
        dataPointsRadius={4.5}
        dataPointsShape="circular"
        rulesColor="#E5E7EB"
        xAxisColor="#E5E7EB"
        yAxisColor="#E5E7EB"
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.5),
  },
  subtitle: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(2),
  },
  axisText: {
    fontSize: FontSize.VALUE(11),
    color: Colors.adminInactiveGrey,
  },
});
