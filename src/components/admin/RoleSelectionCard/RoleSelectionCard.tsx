import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import ColoredLogo from '../../../assets/svgs/adminColoured.svg';
import Checkmark from '../../../assets/svgs/Checkmark.svg';
import BlankLogo from '../../../assets/svgs/adminwhite.svg';

interface RoleSelectionCardProps {
  title: string;
  subtitle: string;
  iconName?: string;
  selected: boolean;
  onPress: () => void;
  iconSelected?: React.FC<{ width?: number; height?: number }>;
  iconDefault?: React.FC<{ width?: number; height?: number }>;
}

export function RoleSelectionCard({
  title,
  subtitle,
  selected,
  onPress,
  iconSelected,
  iconDefault,
}: RoleSelectionCardProps) {
  const CustomIcon = iconSelected && iconDefault
    ? selected ? iconSelected : iconDefault
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {selected && (
        <View style={styles.checkmark}>
          <Checkmark />
        </View>
      )}
      {CustomIcon ? (
        <CustomIcon width={40} height={40} />
      ) : selected ? (
        <ColoredLogo />
      ) : (
        <BlankLogo />
      )}

      <Text style={[styles.title, selected && styles.titleSelected]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: UtilityMethods.hp(2),
    paddingHorizontal: UtilityMethods.wp(3),
    borderRadius: UtilityMethods.wp(3),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    backgroundColor: Colors.white,
    alignItems: 'center',
    marginHorizontal: UtilityMethods.wp(1),
  },
  cardSelected: {
    borderColor: Colors.primaryPurple,
    backgroundColor: Colors.lightPurple,
  },
  checkmark: {
    position: 'absolute',
    top: UtilityMethods.hp(1),
    right: UtilityMethods.wp(2),
    width: UtilityMethods.wp(5),
    height: UtilityMethods.wp(5),
    borderRadius: UtilityMethods.wp(2.5),
    backgroundColor: Colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: UtilityMethods.hp(1),
  },
  title: {
    fontSize: FontSize.BODY_TEXT,
    fontWeight: '700',
    color: Colors.textDark,
  },
  titleSelected: {
    color: Colors.primaryPurple,
  },
  subtitle: {
    fontSize: FontSize.VALUE(13),
    color: Colors.placeholderGrey,
    marginTop: UtilityMethods.hp(0.3),
  },
  subtitleSelected: {
    color: Colors.primaryPurple,
    opacity: 0.8,
  },
});
