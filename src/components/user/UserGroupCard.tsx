import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import type { UserGroupMock } from '../../constants/userGroupsData';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { UserTabGroupsIcon } from './icons';

const H_PAD = UtilityMethods.wp(5);
const GAP = UtilityMethods.wp(2);

/** ~20–24px card corners; scales with screen */
const CARD_RADIUS = UtilityMethods.wp(5.5);
/** ~16px icon tile corners */
const ICON_TILE_RADIUS = UtilityMethods.wp(4);
/** ~16–20px inner padding */
const CARD_PADDING = UtilityMethods.wp(4.5);

export interface UserGroupCardProps {
  item: UserGroupMock;
  onPress?: () => void;
}

export function UserGroupCard({ item, onPress }: UserGroupCardProps) {
  const { width: screenW } = useWindowDimensions();

  const cardWidth = useMemo(() => (screenW - H_PAD * 2 - GAP) / 2, [screenW]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.white,
        borderRadius: CARD_RADIUS,
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        padding: CARD_PADDING,
        marginBottom: GAP,
      },
      iconSquare: {
        width: '45%',
        padding: UtilityMethods.hp(2),
        borderRadius: ICON_TILE_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: UtilityMethods.hp(1.35),
      },
      name: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '600',
        color: Colors.textDark,
        textAlign: 'left',
        marginBottom: UtilityMethods.hp(0.65),
      },
      metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      members: {
        marginLeft: UtilityMethods.wp(1.5),
        fontSize: FontSize.VALUE(12),
        color: Colors.userGroupMemberMeta,
        fontWeight: '400',
      },
    }),
  );

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.memberCount} members`}
    >
      <View
        style={[
          styles.iconSquare,
          { backgroundColor: item.iconBackgroundColor },
        ]}
      >
        <UserTabGroupsIcon size={UtilityMethods.wp(7)} color={Colors.white} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={styles.metaRow}>
        <UserTabGroupsIcon
          size={UtilityMethods.wp(3.75)}
          color={Colors.userGroupMemberMeta}
        />
        <Text style={styles.members}>{item.memberCount} members</Text>
      </View>
    </TouchableOpacity>
  );
}
