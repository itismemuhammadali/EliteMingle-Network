import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FilterPillsProps {
  options: FilterOption[];
  activeId: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export function FilterPills({ options, activeId, onSelect, style }: FilterPillsProps) {
  return (
    <View style={[styles.container, style]}>
      {options.map(option => {
        const isActive = activeId === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.pillText, isActive && styles.pillTextActive]}
              numberOfLines={1}
            >
              {option.label} ({option.count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(2),
    marginVertical: UtilityMethods.hp(0),
  },
  pill: {
    flex: 1,
    height: 39,
    borderRadius: 10,
    borderWidth: 1.09,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: Colors.primaryPurple,
  },
  pillText: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '600',
    color: Colors.userFilterInactiveText,
  },
  pillTextActive: {
    color: Colors.white,
  },
});
