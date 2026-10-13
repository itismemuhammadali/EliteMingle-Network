import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import UtilityMethods from '../../../utility/UtilityMethods';
import { Colors } from '../../../constants/colors';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Card: React.FC<Props> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    // flex: 1,
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(8),
    marginHorizontal: UtilityMethods.wp(5),
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(3),
    // iOS shadow
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 6 }, // pushes shadow downward
    shadowOpacity: 0.5,
    shadowRadius: 8,

    // Android shadow
    elevation: 8,
    marginBottom: UtilityMethods.hp(4),
    paddingBottom: UtilityMethods.hp(2),
  },
});

export default Card;
