import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  rightIcon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
      {rightIcon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(2),
    width: UtilityMethods.wp(60),
    borderRadius: UtilityMethods.wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: UtilityMethods.wp(2),
  },
  text: {
    color: '#FFFFFF',
    fontSize: FontSize.BODY_TEXT,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
