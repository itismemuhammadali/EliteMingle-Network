import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import type { FC } from 'react';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const ICON = UtilityMethods.wp(4);

export interface UserProfileBadgeProps {
  label: string;
  Icon: FC<SvgProps>;
}

export function UserProfileBadge({ label, Icon }: UserProfileBadgeProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.userProfileBadgeBg,
        paddingVertical: UtilityMethods.hp(0.65),
        paddingHorizontal: UtilityMethods.wp(3),
        borderRadius: UtilityMethods.wp(6),
        marginRight: UtilityMethods.wp(2),
      },
      text: {
        marginLeft: UtilityMethods.wp(1.5),
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.userProfilePurple,
      },
    }),
  );

  return (
    <View style={styles.row}>
      <Icon width={ICON} height={ICON} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
