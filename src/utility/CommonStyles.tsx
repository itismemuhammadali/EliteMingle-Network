import { StyleSheet } from 'react-native';

const Fonts = {
  REGULAR: 'System',
  MEDIUM: 'System',
  BOLD: 'System',
  SEMIBOLD: 'System',
};

const Colors = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  PLACEHOLDER: '#9E9E9E',
  Label: '#666666',
  LightOrange: '#FF9800',
};
import FontSize from './FontSize';
import UtilityMethods from './UtilityMethods';

const CommonStyles = StyleSheet.create({
  CONTAINER: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  CONTAINER_BACKGROUD: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },

  CONTAINER_ALLPADING: {
    flex: 1,
    paddingHorizontal: UtilityMethods.wp(5),
    paddingVertical: UtilityMethods.hp(4),
  },

  PADDING_HORIZONTAL: {
    paddingHorizontal: UtilityMethods.wp(5),
  },
  Ag_Body_s: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(12),
    color: Colors.PLACEHOLDER,
  },
  headertitle: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(24),
    color: Colors.BLACK,
  },
  title: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(18),
    color: Colors.BLACK,
    letterSpacing: UtilityMethods.wp(1),
  },
  Body_M: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(14),
    color: Colors.BLACK,
    lineHeight: UtilityMethods.hp(3),
  },
  Body_MS: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(13),
    color: Colors.BLACK,
    letterSpacing: UtilityMethods.wp(0.4),
  },
  Body_S: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(12),
    color: Colors.Label,
  },
  Body_L: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(16),
    color: Colors.Label,
  },
  Price: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(20),
    color: Colors.LightOrange,
    lineHeight: UtilityMethods.hp(5),
  },
  Sub_Title: {
    fontFamily: Fonts.REGULAR,
    fontSize: FontSize.VALUE(14),
    lineHeight: UtilityMethods.hp(3),
  },
});

export default CommonStyles;
