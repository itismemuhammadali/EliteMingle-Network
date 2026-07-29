import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

const MALE_DATA = [
  { value: 25000, label: 'Jan' },
  { value: 35000, label: 'Feb' },
  { value: 45000, label: 'Mar' },
  { value: 55000, label: 'Apr' },
  { value: 65000, label: 'May' },
  { value: 75000, label: 'Jun' },
];

const FEMALE_DATA = [
  { value: 20000, label: 'Jan' },
  { value: 30000, label: 'Feb' },
  { value: 40000, label: 'Mar' },
  { value: 50000, label: 'Apr' },
  { value: 58000, label: 'May' },
  { value: 68000, label: 'Jun' },
];

export interface UserGrowthChartProps {
  /** Real cumulative-growth points; when set, renders a single Total line. */
  data?: { value: number; label: string }[];
  maxValue?: number;
}

export function UserGrowthChart({ data, maxValue }: UserGrowthChartProps) {
  const chartWidth = UtilityMethods.wp(72);
  const chartHeight = UtilityMethods.hp(22);
  const isReal = !!data && data.length > 0;

  const points = isReal ? data! : MALE_DATA;
  const computedMax =
    maxValue ??
    Math.max(10, Math.ceil((Math.max(...points.map(p => p.value)) * 1.2) / 5) * 5);
  const sections = 4;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Growth</Text>
      <Text style={styles.subtitle}>
        {isReal ? 'New users over time' : 'Monthly comparison'}
      </Text>
      <LineChart
        data={points}
        data2={isReal ? undefined : FEMALE_DATA}
        areaChart
        curved
        width={chartWidth}
        height={chartHeight}
        maxValue={computedMax}
        noOfSections={sections}
        stepValue={Math.ceil(computedMax / sections)}
        initialSpacing={UtilityMethods.wp(2)}
        endSpacing={0}
        spacing={UtilityMethods.wp(12)}
        color1={Colors.chartMalePurple}
        color2={Colors.chartFemaleRed}
        startFillColor1={Colors.chartMalePurple}
        endFillColor1={Colors.chartMalePurple}
        startOpacity1={0.3}
        endOpacity1={0.02}
        startFillColor2={Colors.chartFemaleRed}
        endFillColor2={Colors.chartFemaleRed}
        startOpacity2={0.3}
        endOpacity2={0.02}
        hideDataPoints
        rulesColor="#E5E7EB"
        xAxisColor="#E5E7EB"
        yAxisColor="#E5E7EB"
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        thickness1={2.5}
        thickness2={2.5}
      />
      <View style={styles.legend}>
        {isReal ? (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: Colors.chartMalePurple },
              ]}
            />
            <Text style={styles.legendText}>Total Users</Text>
          </View>
        ) : (
          <>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.chartMalePurple },
                ]}
              />
              <Text style={styles.legendText}>Male</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.chartFemaleRed },
                ]}
              />
              <Text style={styles.legendText}>Female</Text>
            </View>
          </>
        )}
      </View>
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: UtilityMethods.wp(6),
    marginTop: UtilityMethods.hp(2),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(2),
  },
  legendDot: {
    width: UtilityMethods.wp(2),
    height: UtilityMethods.wp(2),
    borderRadius: UtilityMethods.wp(1),
  },
  legendText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: Colors.textDark,
  },
  axisText: {
    fontSize: FontSize.VALUE(11),
    color: Colors.adminInactiveGrey,
  },
});
