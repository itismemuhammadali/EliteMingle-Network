import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

export interface ProfileTabOption {
  key: string;
  label: string;
}

export interface UserProfileSegmentTabsProps {
  /** Tab definitions — length can vary per screen */
  tabs: ProfileTabOption[];
  activeKey: string;
  onChange: (key: string) => void;
}

/**
 * Pill segmented control: active tab uses primary purple + white label.
 */
export function UserProfileSegmentTabs({
  tabs,
  activeKey,
  onChange,
}: UserProfileSegmentTabsProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      track: {
        flexDirection: 'row',
        backgroundColor: 'rgba(243, 244, 246, 1)',
        borderRadius: UtilityMethods.wp(8),
        // borderWidth: 1,
        padding: UtilityMethods.wp(1),
        marginBottom: UtilityMethods.hp(2),
      },
      tab: {
        flex: 1,
        paddingVertical: UtilityMethods.hp(1.25),
        borderRadius: UtilityMethods.wp(7),
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabActive: {
        backgroundColor: Colors.userProfilePurple,
      },
      tabLabel: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textDark,
      },
      tabLabelActive: {
        color: Colors.white,
      },
    }),
  );

  return (
    <View style={styles.track}>
      {tabs.map(tab => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.85}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
