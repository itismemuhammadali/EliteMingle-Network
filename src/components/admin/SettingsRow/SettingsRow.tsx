import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { ChevronRightIcon } from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface SettingsRowProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  subtitle: string;
  /** Renders chevron - for navigation items */
  showChevron?: boolean;
  onPress?: () => void;
  /** Renders toggle instead of chevron */
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

export function SettingsRow({
  icon,
  iconBgColor,
  title,
  subtitle,
  showChevron = false,
  onPress,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
}: SettingsRowProps) {
  const isPressable = showChevron && !!onPress && !showToggle;

  const content = (
    <View style={styles.row}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {showChevron && !showToggle && (
        <ChevronRightIcon
          size={UtilityMethods.wp(5)}
          color={Colors.adminInactiveGrey}
        />
      )}
      {showToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{
            false: '#E0E0E0',
            true: Colors.adminActivePurpleLight,
          }}
          thumbColor={
            toggleValue ? Colors.adminActivePurple : Colors.white
          }
        />
      )}
    </View>
  );

  if (isPressable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.touchable}>{content}</View>;
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: UtilityMethods.hp(1.5),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.wp(12),
    borderRadius: UtilityMethods.wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  subtitle: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
});
