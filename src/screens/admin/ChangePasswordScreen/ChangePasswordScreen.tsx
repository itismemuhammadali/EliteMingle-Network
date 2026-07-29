import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import { LockIcon, EyeIcon, EyeOffIcon } from '../../../components/admin/icons';
import type { RootStackParamList } from '../../../navigation/MainStack';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

const PASSWORD_COMPLEXITY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ValidationSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Must be at least 8 characters')
    .matches(
      PASSWORD_COMPLEXITY,
      'Include uppercase, lowercase, number, and special character',
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialValues: FormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const REQUIREMENT_LINES = [
  'At least 8 characters long',
  'Include uppercase and lowercase letters',
  'Include at least one number',
  'Include at least one special character',
];

export function ChangePasswordScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>
    >();

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund="#FFFFFF"
      bottomColor={Colors.adminBackgroundGrey}
    >
      <ScreenHeader
        title="Change Password"
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.headerBorder} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <View style={styles.card}>
          <View style={styles.iconCircle}>
            <LockIcon
              size={UtilityMethods.wp(9)}
              color={Colors.white}
            />
          </View>
          <Text style={styles.instruction}>
            Please enter your current password and choose a new one
          </Text>

          <Formik
            initialValues={initialValues}
            validationSchema={ValidationSchema}
            onSubmit={() => {
              navigation.goBack();
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              submitCount,
            }) => (
              <>
                <PasswordField
                  label="Current Password"
                  placeholder="Create a strong password"
                  value={values.currentPassword}
                  onChangeText={handleChange('currentPassword')}
                  onBlur={handleBlur('currentPassword')}
                  error={
                    touched.currentPassword || submitCount > 0
                      ? errors.currentPassword
                      : undefined
                  }
                />
                <PasswordField
                  label="New Password"
                  placeholder="**********"
                  value={values.newPassword}
                  onChangeText={handleChange('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  error={
                    touched.newPassword || submitCount > 0
                      ? errors.newPassword
                      : undefined
                  }
                  helperText="Must be at least 8 characters"
                />
                <PasswordField
                  label="Confirm New Password"
                  placeholder="**********"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={
                    touched.confirmPassword || submitCount > 0
                      ? errors.confirmPassword
                      : undefined
                  }
                />

                <View style={styles.requirementsBox}>
                  <Text style={styles.requirementsTitle}>
                    Password Requirements:
                  </Text>
                  {REQUIREMENT_LINES.map(line => (
                    <Text key={line} style={styles.requirementsLine}>
                      • {line}
                    </Text>
                  ))}
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => handleSubmit()}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.primaryBtnText}>Update Password</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  helperText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur: (e: unknown) => void;
  error?: string;
  helperText?: string;
}) {
  const [visible, setVisible] = useState(false);
  const iconGrey = Colors.placeholderGrey;
  const eyeSize = UtilityMethods.wp(5);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <View style={styles.inputIconLeft}>
          <LockIcon size={UtilityMethods.wp(4.5)} color={iconGrey} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholderGrey}
          value={value}
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
      {helperText && !error ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
    backgroundColor: Colors.adminBackgroundGrey,
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'stretch',
  },
  iconCircle: {
    alignSelf: 'center',
    width: UtilityMethods.wp(18),
    height: UtilityMethods.wp(18),
    borderRadius: UtilityMethods.wp(9),
    backgroundColor: Colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UtilityMethods.hp(2),
  },
  instruction: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    textAlign: 'center',
    marginBottom: UtilityMethods.hp(2.5),
    paddingHorizontal: UtilityMethods.wp(2),
    lineHeight: FontSize.VALUE(20),
  },
  field: {
    marginBottom: UtilityMethods.hp(2),
  },
  fieldLabel: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.75),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: UtilityMethods.wp(2),
    paddingHorizontal: UtilityMethods.wp(3),
    minHeight: UtilityMethods.hp(5.5),
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
  requirementsBox: {
    backgroundColor: Colors.changePasswordInfoBg,
    borderWidth: 1,
    borderColor: Colors.changePasswordInfoBorder,
    borderRadius: UtilityMethods.wp(2),
    padding: UtilityMethods.wp(3.5),
    marginTop: UtilityMethods.hp(0.5),
    marginBottom: UtilityMethods.hp(2),
  },
  requirementsTitle: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '700',
    color: Colors.changePasswordInfoTitle,
    marginBottom: UtilityMethods.hp(1),
  },
  requirementsLine: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: Colors.changePasswordInfoText,
    lineHeight: FontSize.VALUE(20),
    marginBottom: UtilityMethods.hp(0.35),
  },
  actions: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(3),
    marginTop: UtilityMethods.hp(0.5),
  },
  primaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  secondaryBtnText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '600',
    color: Colors.adminInactiveGrey,
  },
});
