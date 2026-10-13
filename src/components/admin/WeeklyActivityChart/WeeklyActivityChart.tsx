import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { useLanguage } from '../../../context/LanguageContext';

export interface WeeklyActivityChartProps {
  data?: { value: number; label: string }[];
  maxValue?: number;
  title?: string;
  subtitle?: string;
}

export function WeeklyActivityChart({
  data,
  maxValue,
  title,
  subtitle,
}: WeeklyActivityChartProps = {}) {
  const { t, language } = useLanguage();
  const chartWidth = UtilityMethods.wp(72);
  const chartHeight = UtilityMethods.hp(20);

  const defaultWeeklyData = useMemo(
    () => [
      { value: 0, label: language === 'es' ? 'Lun' : 'Mon' },
      { value: 0, label: language === 'es' ? 'Mar' : 'Tue' },
      { value: 0, label: language === 'es' ? 'Mié' : 'Wed' },
      { value: 0, label: language === 'es' ? 'Jue' : 'Thu' },
      { value: 0, label: language === 'es' ? 'Vie' : 'Fri' },
      { value: 0, label: language === 'es' ? 'Sáb' : 'Sat' },
      { value: 0, label: language === 'es' ? 'Dom' : 'Sun' },
    ],
    [language],
  );

  const isReal = !!data && data.length > 0;
  const points = isReal ? data! : defaultWeeklyData;

  const highest = Math.max(0, ...points.map(p => p.value));
  const computedMax =
    maxValue ??
    (highest <= 4
      ? 4
      : highest <= 10
      ? 10
      : Math.ceil((highest * 1.2) / 4) * 4);
  const sections = 4;
  const stepValue = Math.max(1, Math.ceil(computedMax / sections));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title || t('adminAnalytics.weeklyActivity', 'Weekly Activity')}
      </Text>
      <Text style={styles.subtitle}>
        {subtitle ||
          t('adminAnalytics.activeUsersPerDay', 'Active users per day')}
      </Text>
      <LineChart
        data={points}
        curved
        width={chartWidth}
        height={chartHeight}
        maxValue={computedMax}
        noOfSections={sections}
        stepValue={stepValue}
        initialSpacing={UtilityMethods.wp(3)}
        endSpacing={UtilityMethods.wp(2)}
        spacing={UtilityMethods.wp(9)}
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
    paddingBottom: UtilityMethods.hp(3),
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
