import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BackArrowIcon } from '../../admin/icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface ScreenHeaderProps {
  /** Screen title displayed below the back button */
  title: string;
  /** Called when back button is pressed */
  onBackPress: () => void;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Optional right element (e.g. options menu) */
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  title,
  onBackPress,
  subtitle,
  rightElement,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <BackArrowIcon
            size={19.9}
            color={Colors.primaryPurple}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        {rightElement}
      </View>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(5),
    marginTop: UtilityMethods.hp(0),
    paddingBottom: UtilityMethods.hp(1),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: UtilityMethods.hp(1),
    paddingLeft: UtilityMethods.wp(1),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(2),
  },
  backText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.primaryPurple,
  },
  titleSection: {
    marginTop: UtilityMethods.hp(0.5),
    paddingLeft: UtilityMethods.wp(1),
  },
  title: {
    fontSize: FontSize.VALUE(22),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  subtitle: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
});
