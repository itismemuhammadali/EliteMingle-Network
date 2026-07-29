import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { EyeIcon, EyeOffIcon, LockIcon } from '../admin/icons';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

export interface UserPasswordFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  onBlur?: (e: unknown) => void;
  error?: string;
  helperText?: string;
  /** Match admin change-password fields (lock icon inside input). Default false for user UI. */
  showLeftLock?: boolean;
}

const safeString = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    try {
      return val.message || JSON.stringify(val);
    } catch {
      return '';
    }
  }
  return String(val);
};

/**
 * Password field with optional leading lock and visibility toggle — same behavior as admin Change Password.
 */
export function UserPasswordField({
  label = '',
  placeholder = '',
  value = '',
  onChangeText,
  onBlur,
  error,
  helperText,
  showLeftLock = false,
}: UserPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const iconGrey = Colors.placeholderGrey;
  const eyeSize = UtilityMethods.wp(5);

  // Bulletproof safe string fallbacks preventing any undefined/null rendering or split exceptions
  const safeValue = safeString(value);
  const safePlaceholder = safeString(placeholder);
  const safeLabel = safeString(label);
  const safeError = error ? safeString(error) : undefined;
  const safeHelperText = helperText ? safeString(helperText) : undefined;

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      field: {
        marginBottom: UtilityMethods.hp(2),
      },
      fieldLabel: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '500',
        color: Colors.userGroupMemberMeta,
        marginBottom: UtilityMethods.hp(0.75),
      },
      inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        borderRadius: UtilityMethods.wp(2.5),
        paddingHorizontal: UtilityMethods.wp(3.5),
        minHeight: UtilityMethods.hp(6.75),
      },
      inputRowError: {
        borderColor: Colors.adminErrorRed,
      },
      inputIconLeft: {
        marginRight: UtilityMethods.wp(2),
      },
      input: {
        flex: 1,
        fontSize: FontSize.VALUE(15),
        color: Colors.textDark,
        paddingVertical: UtilityMethods.hp(1.2),
      },
      inputNoLock: {
        paddingLeft: 0,
      },
      eyeBtn: {
        padding: UtilityMethods.wp(1),
      },
      helperText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '400',
        color: Colors.adminInactiveGrey,
        marginTop: UtilityMethods.hp(0.5),
      },
      fieldError: {
        fontSize: FontSize.VALUE(12),
        color: Colors.adminErrorRed,
        marginTop: UtilityMethods.hp(0.5),
      },
    }),
  );

  return (
    <View style={styles.field}>
      {safeLabel ? <Text style={styles.fieldLabel}>{safeLabel}</Text> : null}
      <View style={[styles.inputRow, safeError ? styles.inputRowError : null]}>
        {showLeftLock ? (
          <View style={styles.inputIconLeft}>
            <LockIcon size={UtilityMethods.wp(4.5)} color={iconGrey} />
          </View>
        ) : null}
        <TextInput
          style={[styles.input, showLeftLock ? null : styles.inputNoLock]}
          placeholder={safePlaceholder}
          placeholderTextColor={Colors.placeholderGrey}
          value={safeValue}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setVisible(v => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <EyeOffIcon size={eyeSize} color={iconGrey} />
          ) : (
            <EyeIcon size={eyeSize} color={iconGrey} />
          )}
        </TouchableOpacity>
      </View>
      {safeHelperText && !safeError ? (
        <Text style={styles.helperText}>{safeHelperText}</Text>
      ) : null}
      {safeError ? <Text style={styles.fieldError}>{safeError}</Text> : null}
    </View>
  );
}


