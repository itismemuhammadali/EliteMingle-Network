import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import {
  UserPasswordField,
  UserChangePasswordInfoBanner,
} from '../../../components/user';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import type { UserStackParamList } from '../../../navigation/User/types';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);

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

export function UserChangePasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      scrollContent: {
        flexGrow: 1,
        paddingBottom: UtilityMethods.hp(4),
        backgroundColor: Colors.white,
      },
      navWrap: {
        backgroundColor: Colors.white,
      },
      navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(4),
        paddingBottom: UtilityMethods.hp(1.25),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      backBtn: {
        padding: UtilityMethods.wp(0.5),
      },
      navTitleWrap: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(28),
        paddingBottom: UtilityMethods.hp(1.25),
      },
      navTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
      },
      body: {
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(1.75),
      },
      primaryBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.userProfilePurple,
        paddingVertical: UtilityMethods.hp(1.75),
        borderRadius: UtilityMethods.wp(8),
        marginTop: UtilityMethods.hp(0.5),
        marginBottom: UtilityMethods.hp(1.25),
      },
      primaryBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      secondaryBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        paddingVertical: UtilityMethods.hp(1.75),
        borderRadius: UtilityMethods.wp(8),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        marginBottom: UtilityMethods.hp(2),
      },
      secondaryBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
    }),
  );

  return (
    <MainLayout
      isScrollable={true}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.white}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.navWrap}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeftIcon
              width={UtilityMethods.wp(5.5)}
              height={UtilityMethods.wp(5.5)}
            />
          </TouchableOpacity>
          <View style={styles.navTitleWrap} pointerEvents="none">
            <Text style={styles.navTitle} numberOfLines={1}>
              Change Password
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <UserChangePasswordInfoBanner />

          <Formik
            initialValues={initialValues}
            validationSchema={ValidationSchema}
            onSubmit={() => {
              Alert.alert('Success', 'Your password has been updated.');
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
              <View>
                <UserPasswordField
                  label="Current Password"
                  placeholder="Enter current password"
                  value={values.currentPassword}
                  onChangeText={handleChange('currentPassword')}
                  onBlur={handleBlur('currentPassword')}
                  error={
                    touched.currentPassword || submitCount > 0
                      ? errors.currentPassword
                      : undefined
                  }
                />
                <UserPasswordField
                  label="New Password"
                  placeholder="Enter new password"
                  value={values.newPassword}
                  onChangeText={handleChange('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  error={
                    touched.newPassword || submitCount > 0
                      ? errors.newPassword
                      : undefined
                  }
                />
                <UserPasswordField
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={
                    touched.confirmPassword || submitCount > 0
                      ? errors.confirmPassword
                      : undefined
                  }
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => handleSubmit()}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryBtnText}>Update Password</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={handleBack}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}
