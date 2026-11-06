import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import { EyeIcon, EyeOffIcon } from '../../admin/icons';

interface TextInputFieldProps extends TextInputProps {
  label: string;
  placeholder: string;
  leftIconName?: string;
  leftIcon?: any;
  rightIcon?: any;
  secureTextEntry?: boolean;
  error?: string;
  touched?: boolean;
}

export function TextInputField({
  label,
  placeholder,
  leftIconName,
  secureTextEntry = false,
  error,
  leftIcon,
  rightIcon,
  touched,
  style,
  ...textInputProps
}: TextInputFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const showError = touched && error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, showError && styles.inputError]}>
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

        <TextInput
          style={[styles.input, leftIcon && styles.inputWithIcon, style]}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholderGrey}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...textInputProps}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(v => !v)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <EyeOffIcon size={UtilityMethods.wp(5.25)} color="rgba(16, 16, 16, 0.6)" />
            ) : (
              <EyeIcon size={UtilityMethods.wp(5.25)} color="rgba(16, 16, 16, 0.6)" />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.eyeButton}>{rightIcon}</View>
        ) : null}
      </View>
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: UtilityMethods.hp(2),
  },
  label: {
    fontSize: FontSize.BODY_TEXT,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: UtilityMethods.wp(3),
    borderWidth: 1,
    gap: UtilityMethods.wp(3),
    borderColor: Colors.borderGrey,
  },
  input: {
    flex: 1,
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(4),
    fontSize: FontSize.BODY_TEXT,
    color: Colors.textDark,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  iconLeft: {
    paddingLeft: UtilityMethods.wp(3),
  },
  eyeButton: {
    paddingHorizontal: UtilityMethods.wp(3),
    paddingVertical: UtilityMethods.hp(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: FontSize.BODY_TEXT,
  },
  inputError: {
    borderColor: '#E53935',
  },
  errorText: {
    fontSize: FontSize.BODY_TEXT,
    color: '#E53935',
    marginTop: UtilityMethods.hp(0.5),
  },
});
