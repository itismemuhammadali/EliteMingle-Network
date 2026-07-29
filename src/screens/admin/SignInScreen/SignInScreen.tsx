import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import {
  TitleText,
  Button,
  TextInputField,
  SocialLoginButton,
} from '../../../components/general';
import { RoleSelectionCard } from '../../../components/admin';
import {
  signInValidationSchema,
  SignInFormValues,
} from '../../../validations/signInValidation';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import MainLayout from '../../../components/general/MainLayout';
import DescriptionText from '../../../components/general/descriptionText/DescriptionText';
import Logo from '../../../assets/svgs/logo.svg';
import EmailIcon from '../../../assets/svgs/EmailIcon.svg';
import PasswordIcon from '../../../assets/svgs/PasswordIcon.svg';
import EyeIcon from '../../../assets/svgs/EyeIcon.svg';
import PeopleIconSelected from '../../../assets/Icons/peopleblue.svg';
import PeopleIconDefault from '../../../assets/Icons/people.svg';
import Card from '../../../components/general/Card/Card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/Admin/types';
import { useAppDispatch } from '../../../redux/hooks';
import { selectAdmin, selectUser } from '../../../redux/roleSlice';
import { useAuth } from '../../../context/AuthContext';

type SignInNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SignIn'
>;

const initialValues: SignInFormValues = {
  email: '',
  password: '',
  role: 'moderator',
};

export function SignInScreen() {
  const navigation = useNavigation<SignInNavigationProp>();
  const dispatch = useAppDispatch();
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };
  const handleContactAdmin = () => {};
  const handleGoogleSignIn = () => {};
  const handleAppleSignIn = () => {};

  return (
    <MainLayout
      showBackGroundImage={true}
      imageSource={require('../../../assets/images/background.png')}
      barStyle="dark-content"
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerSection}>
        <Logo />
        <TitleText style={styles.welcomeTitle}>Welcome Back</TitleText>
        <DescriptionText text="Log in to connect with your friends" />
      </View>

      <Card>
        <Formik
          initialValues={initialValues}
          validationSchema={signInValidationSchema}
          onSubmit={async (values) => {
            setIsSubmitting(true);
            try {
              if (values.role === 'admin') {
                dispatch(selectAdmin());
              } else {
                dispatch(selectUser());
              }
              await signIn(values.email, values.password);
            } catch (error: any) {

              let message = 'An error occurred. Please try again.';
              if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email.';
              } else if (error.code === 'auth/wrong-password') {
                message = 'Incorrect password. Please try again.';
              } else if (error.code === 'auth/invalid-email') {
                message = 'Invalid email address.';
              } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many attempts. Please try again later.';
              } else if (error.code === 'auth/invalid-credential') {
                message = 'Invalid email or password.';
              }
              Alert.alert('Sign In Failed', message);
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
            setFieldValue,
          }) => (
            <>
              <Text style={styles.sectionLabel}>Select Your Role</Text>
              <View style={styles.roleRow}>
                <RoleSelectionCard
                  title="Admin"
                  subtitle="Full Access"
                  selected={values.role === 'admin'}
                  onPress={() => {
                    setFieldValue('role', 'admin');
                    dispatch(selectAdmin());
                  }}
                />
                <RoleSelectionCard
                  title="User"
                  subtitle="Limited Access"
                  iconSelected={PeopleIconSelected}
                  iconDefault={PeopleIconDefault}
                  selected={values.role === 'moderator'}
                  onPress={() => {
                    setFieldValue('role', 'moderator');
                    dispatch(selectUser());
                  }}
                />
              </View>

              <TextInputField
                label="Email Address"
                leftIcon={<EmailIcon />}
                placeholder="your.email@example.com"
                leftIconName="email-outline"
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
                placeholder="Enter your password"
                leftIconName="lock-outline"
                secureTextEntry
                rightIcon={<EyeIcon />}
                leftIcon={<PasswordIcon />}
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={errors.password}
                touched={touched.password}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Log In"
                onPress={() => handleSubmit()}
                style={styles.loginButton}
                disabled={isSubmitting}
              />

              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>or</Text>
                <View style={styles.separatorLine} />
              </View>

              <SocialLoginButton
                provider="google"
                onPress={handleGoogleSignIn}
              />
              <SocialLoginButton provider="apple" onPress={handleAppleSignIn} />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={
                    values.role === 'moderator'
                      ? () => navigation.navigate('SignUp')
                      : handleContactAdmin
                  }
                >
                  <Text style={styles.contactAdminText}>
                    {values.role === 'moderator' ? 'Sign up' : 'Contact Admin'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </Card>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: UtilityMethods.hp(4),
  },
  screenTitle: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.textDark,
    marginLeft: UtilityMethods.wp(5),
    marginTop: UtilityMethods.hp(2),
    marginBottom: UtilityMethods.hp(1),
  },
  headerSection: {
    alignItems: 'center',
    marginTop: UtilityMethods.hp(10),
    paddingHorizontal: UtilityMethods.wp(5),
    marginBottom: UtilityMethods.hp(0),
  },
  logoPlaceholder: {
    width: UtilityMethods.wp(25),
    height: UtilityMethods.wp(25),
    borderRadius: UtilityMethods.wp(12.5),
    backgroundColor: Colors.lightPurple,
    borderWidth: 2,
    borderColor: Colors.primaryPurple,
    marginBottom: UtilityMethods.hp(2),
  },
  welcomeTitle: {
    marginBottom: UtilityMethods.hp(0),
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(8),
    marginHorizontal: UtilityMethods.wp(5),
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(3),
    // iOS shadow
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 6 }, // pushes shadow downward
    shadowOpacity: 0.5,
    shadowRadius: 8,

    // Android shadow
    elevation: 8,
    marginBottom: UtilityMethods.hp(4),
    paddingBottom: UtilityMethods.hp(2),
  },
  sectionLabel: {
    fontSize: FontSize.BODY_TEXT,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(1.5),
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: UtilityMethods.hp(3),
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: UtilityMethods.hp(2),
  },
  forgotPasswordText: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.primaryPurple,
    fontWeight: '500',
  },
  loginButton: {
    alignSelf: 'stretch',
    width: '100%',
    marginBottom: UtilityMethods.hp(2),
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: UtilityMethods.hp(2),
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UtilityMethods.hp(2),
  },
  footerText: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.textGrey,
  },
  contactAdminText: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.primaryPurple,
    fontWeight: '600',
  },
});
