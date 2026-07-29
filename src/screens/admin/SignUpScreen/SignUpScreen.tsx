import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import Logo from '../../../assets/svgs/logo.svg';
import EmailIcon from '../../../assets/svgs/EmailIcon.svg';
import PasswordIcon from '../../../assets/svgs/PasswordIcon.svg';
import EyeIcon from '../../../assets/svgs/EyeIcon.svg';
import CheckmarkIcon from '../../../assets/svgs/Checkmark.svg';
import PersonIcon from '../../../assets/svgs/PersonIcon.svg';
import ButtonArrow from '../../../assets/Icons/ButtonArrow.svg';
import { TitleText, Button, TextInputField } from '../../../components/general';
import DescriptionText from '../../../components/general/descriptionText/DescriptionText';
import Card from '../../../components/general/Card/Card';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import { AuthStackParamList } from '../../../navigation/Admin/types';
import { useAuth } from '../../../context/AuthContext';

type SignUpNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SignUp'
>;

export function SignUpScreen() {
  const navigation = useNavigation<SignUpNavigationProp>();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = () => {
    navigation.navigate('SignIn');
  };

  return (
    <MainLayout
      showBackGroundImage={true}
      imageSource={require('../../../assets/images/background.png')}
      barStyle="dark-content"
      contentContainerStyle={styles.contentContainer}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Logo />
          <TitleText style={styles.title}>Join Our Community</TitleText>
          <DescriptionText text="Create your account and start making friends" />
        </View>

        <Card style={styles.card}>
          <Formik
            initialValues={{
              fullName: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            onSubmit={async (values) => {
              if (!agreedToTerms) {
                Alert.alert('Terms Required', 'Please agree to the Terms of Service and Privacy Policy.');
                return;
              }
              setIsSubmitting(true);
              try {
                await signUp(values.email, values.password, values.fullName);
                navigation.navigate('VerifyEmail', { email: values.email, source: 'signUp' });
              } catch (error: any) {


                let message = 'An error occurred. Please try again.';
                if (error.code === 'auth/email-already-in-use') {
                  message = 'An account with this email already exists.';
                } else if (error.code === 'auth/invalid-email') {
                  message = 'Invalid email address.';
                } else if (error.code === 'auth/weak-password') {
                  message = 'Password is too weak. Please use a stronger password.';
                }
                Alert.alert('Sign Up Failed', message);
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <TextInputField
                  label="Full Name"
                  placeholder="Enter your name"
                  leftIcon={<PersonIcon />}
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  autoCapitalize="words"
                  error={errors.fullName}
                  touched={touched.fullName}
                />

                <TextInputField
                  label="Email Address"
                  placeholder="your.email@example.com"
                  leftIcon={<EmailIcon />}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  touched={touched.email}
                />

                <TextInputField
                  label="Password"
                  placeholder="Create a password"
                  leftIcon={<PasswordIcon />}
                  rightIcon={<EyeIcon />}
                  secureTextEntry
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={errors.password}
                  touched={touched.password}
                />
                <Text style={styles.helperText}>Must be at least 8 characters</Text>

                <TextInputField
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  leftIcon={<PasswordIcon />}
                  rightIcon={<EyeIcon />}
                  secureTextEntry
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                >
                  <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && <CheckmarkIcon />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the Terms of Service and Privacy Policy. I understand that EPM is a safe space for everyone.
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Create Account"
                  onPress={() => handleSubmit()}
                  style={styles.createButton}
                  rightIcon={<ButtonArrow />}
                  disabled={isSubmitting}
                />
              </>
            )}
          </Formik>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Text style={styles.footer}>
          Built with accessibility in mind ❤️
        </Text>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: UtilityMethods.hp(4),
  },
  headerSection: {
    alignItems: 'center',
    marginTop: UtilityMethods.hp(8),
    paddingHorizontal: UtilityMethods.wp(5),
    marginBottom: UtilityMethods.hp(2),
  },
  title: {
    marginBottom: UtilityMethods.hp(0.5),
  },
  card: {
    marginHorizontal: UtilityMethods.wp(5),
  },
  helperText: {
    fontSize: FontSize.BODY_TEXT - 2,
    color: Colors.placeholderGrey,
    marginTop: -UtilityMethods.hp(1.5),
    marginBottom: UtilityMethods.hp(2),
    marginLeft: UtilityMethods.wp(1),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: UtilityMethods.hp(3),
    marginTop: UtilityMethods.hp(1),
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderGrey,
    backgroundColor: Colors.inputBackground,
    marginRight: UtilityMethods.wp(3),
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryPurple,
    borderColor: Colors.primaryPurple,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FontSize.BODY_TEXT - 2,
    color: Colors.textGrey,
    lineHeight: 20,
  },
  createButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
  arrowIcon: {
    color: Colors.white,
    fontSize: FontSize.BODY_TEXT + 2,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: UtilityMethods.hp(2.5),
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderGrey,
  },
  separatorText: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.placeholderGrey,
    marginHorizontal: UtilityMethods.wp(3),
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(2),
  },
  loginText: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.textGrey,
  },
  loginLink: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.primaryPurple,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.BODY_TEXT - 2,
    color: Colors.placeholderGrey,
    marginTop: UtilityMethods.hp(2),
    marginBottom: UtilityMethods.hp(2),
  },
});
