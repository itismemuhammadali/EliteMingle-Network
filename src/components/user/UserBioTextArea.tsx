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

export interface UserBioTextAreaProps extends Omit<
  TextInputProps,
  'style' | 'multiline'
> {
  label: string;
  maxLength: number;
  currentLength: number;
  error?: string;
}

export function UserBioTextArea({
  label,
  maxLength,
  currentLength,
  error,
  ...rest
}: UserBioTextAreaProps) {
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
      input: {
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        borderRadius: UtilityMethods.wp(2.5),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.35),
        fontSize: FontSize.VALUE(15),
        color: Colors.textDark,
        backgroundColor: Colors.white,
        minHeight: UtilityMethods.hp(14),
      },
      inputError: {
        borderColor: Colors.adminErrorRed,
      },
      counterRow: {
        marginTop: UtilityMethods.hp(0.5),
      },
      counter: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
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
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={Colors.placeholderGrey}
        multiline
        textAlignVertical="top"
        maxLength={maxLength}
        {...rest}
      />
      <View style={styles.counterRow}>
        <Text style={styles.counter}>
          {currentLength} / {maxLength} characters
        </Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
