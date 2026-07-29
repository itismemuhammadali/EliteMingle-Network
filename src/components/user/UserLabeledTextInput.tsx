import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  type TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

export interface UserLabeledTextInputProps extends Omit<
  TextInputProps,
  'style'
> {
  label: string;
  required?: boolean;
  error?: string;
}

export function UserLabeledTextInput({
  label,
  required,
  error,
  ...rest
}: UserLabeledTextInputProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      wrap: {
        marginBottom: UtilityMethods.hp(2),
      },
      label: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.75),
      },
      asterisk: {
        color: Colors.adminErrorRed,
      },
      input: {
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        borderRadius: UtilityMethods.wp(2.5),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.35),
        fontSize: FontSize.VALUE(15),
        color: Colors.textDark,
        backgroundColor: Colors.white,
      },
      inputError: {
        borderColor: Colors.adminErrorRed,
      },
      error: {
        fontSize: FontSize.VALUE(12),
        color: Colors.adminErrorRed,
        marginTop: UtilityMethods.hp(0.5),
      },
    }),
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.asterisk}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={Colors.placeholderGrey}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
