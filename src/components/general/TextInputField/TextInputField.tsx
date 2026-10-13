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
        <View style={styles.iconLeft}>{leftIcon}</View>

        <TextInput
          style={[styles.input, leftIconName && styles.inputWithIcon, style]}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholderGrey}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...textInputProps}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
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
    padding: UtilityMethods.wp(2),
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
