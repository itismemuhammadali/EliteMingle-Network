import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

export interface UserCenteredScreenHeaderProps {
  /** Centered title (e.g. "Message") */
  title: string;
  /** Left side (e.g. back). Optional — keeps title centered vs `rightSlot`. */
  leftSlot?: React.ReactNode;
  /** Right side actions */
  rightSlot?: React.ReactNode;
  onTitlePress?: () => void;
}

/**
 * Reusable header: title centered on screen with optional left/right slots.
 */
export function UserCenteredScreenHeader({
  title,
  leftSlot,
  rightSlot,
  onTitlePress,
}: UserCenteredScreenHeaderProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderGrey,
        paddingHorizontal: UtilityMethods.wp(5),
        marginBottom: UtilityMethods.hp(1),
        paddingVertical: UtilityMethods.hp(1.75),
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: UtilityMethods.hp(5.5),
      },
      half: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: UtilityMethods.hp(5.5),
      },
      halfLeft: {
        justifyContent: 'flex-start',
      },
      halfRight: {
        justifyContent: 'flex-end',
      },
      halfPlaceholder: {
        minWidth: UtilityMethods.wp(8),
      },
      titleOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: UtilityMethods.wp(24),
      },
      title: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
      },
    }),
  );

  const titleNode = (
    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.half, styles.halfLeft]}>
          {leftSlot ?? <View style={styles.halfPlaceholder} />}
        </View>
        <View style={[styles.half, styles.halfRight]}>{rightSlot}</View>
      </View>
      <View style={styles.titleOverlay} pointerEvents="box-none">
        {onTitlePress ? (
          <TouchableOpacity onPress={onTitlePress} activeOpacity={0.7}>
            {titleNode}
          </TouchableOpacity>
        ) : (
          titleNode
        )}
      </View>
    </View>
  );
}
