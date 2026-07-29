import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { UserFeedFilter } from '../../constants/userFeedData';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import {
  UserFilterNearbyIcon,
  UserFilterInterestsIcon,
} from './icons';
import SparklesIcon from '../../assets/Icons/Sparkles.svg';

const FILTERS: {
  key: UserFeedFilter;
  label: string;
  isSparkles?: boolean;
}[] = [
  { key: 'friends', label: 'Friends', isSparkles: true },
  { key: 'nearby', label: 'Nearby' },
  { key: 'interests', label: 'Interests' },
];

export interface FeedFilterTabsProps {
  active: UserFeedFilter | null;
  onChange: (filter: UserFeedFilter | null) => void;
}

export function FeedFilterTabs({ active, onChange }: FeedFilterTabsProps) {
  const iconSize = UtilityMethods.wp(4.25);
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      outer: {
        paddingHorizontal: UtilityMethods.wp(5),
        marginBottom: UtilityMethods.hp(2),
      },
      bar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.feedFilterBarBg,
        borderRadius: 15,
        paddingVertical: UtilityMethods.hp(0.65),
        paddingHorizontal: UtilityMethods.wp(1.25),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
      },
      segmentPress: {
        flex: 1,
        paddingHorizontal: UtilityMethods.wp(0.35),
        paddingVertical: UtilityMethods.hp(0.35),
      },
      segmentPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: UtilityMethods.hp(1),
        paddingHorizontal: UtilityMethods.wp(1.25),
        borderRadius: UtilityMethods.wp(6),
      },
      segmentPillActive: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 3,
      },
      segmentPressed: {
        opacity: 0.92,
      },
      label: {
        marginLeft: UtilityMethods.wp(1.25),
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
      },
    }),
  );

  const handlePress = (key: UserFeedFilter) => {
    if (active === key) {
      onChange(null);
    } else {
      onChange(key);
    }
  };

  return (
    <View style={styles.outer}>
      <View style={styles.bar}>
        {FILTERS.map(({ key, label, isSparkles }) => {
          const selected = active === key;
          const color = Colors.textDark;

          return (
            <Pressable
              key={key}
              style={({ pressed }) => [
                styles.segmentPress,
                pressed && styles.segmentPressed,
              ]}
              onPress={() => handlePress(key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View
                style={[styles.segmentPill, selected && styles.segmentPillActive]}
              >
                {isSparkles ? (
                  <SparklesIcon width={iconSize} height={iconSize} />
                ) : key === 'nearby' ? (
                  <UserFilterNearbyIcon size={iconSize} color={color} />
                ) : (
                  <UserFilterInterestsIcon size={iconSize} color={color} />
                )}
                <Text style={[styles.label, { color }]}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
