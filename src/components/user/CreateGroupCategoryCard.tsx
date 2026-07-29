import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const ICON_SIZE = UtilityMethods.wp(7);

export interface CreateGroupCategoryCardProps {
  label: string;
  iconBg: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CreateGroupCategoryCard({
  label,
  iconBg,
  emoji,
  selected,
  onPress,
  style,
}: CreateGroupCategoryCardProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        flex: 1,
        minHeight: UtilityMethods.wp(38),
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(6),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.75),
        paddingHorizontal: UtilityMethods.wp(2),
        alignItems: 'center',
        justifyContent: 'center',
      },
      cardSelected: {
        borderWidth: 2,
        borderColor: Colors.userActiveTabPurple,
      },
      iconSquare: {
        width: UtilityMethods.wp(14),
        height: UtilityMethods.wp(14),
        borderRadius: UtilityMethods.wp(3),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: UtilityMethods.hp(1.1),
        ...Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 4,
          },
          android: {
            elevation: 3,
          },
          default: {},
        }),
      },
      emoji: {
        fontSize: ICON_SIZE,
      },
      label: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.textDark,
        textAlign: 'center',
        lineHeight: FontSize.VALUE(18),
      },
    }),
  );

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <View style={[styles.iconSquare, { backgroundColor: iconBg }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
