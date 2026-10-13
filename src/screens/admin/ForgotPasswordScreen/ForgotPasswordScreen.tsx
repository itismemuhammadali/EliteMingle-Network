import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import { AuthStackParamList } from '../../../navigation/Admin/types';
import Logo from '../../../assets/svgs/logo.svg';
import EmailIcon from '../../../assets/svgs/EmailIcon.svg';
import { TitleText, Button, TextInputField } from '../../../components/general';
import DescriptionText from '../../../components/general/descriptionText/DescriptionText';
import Card from '../../../components/general/Card/Card';
import MainLayout from '../../../components/general/MainLayout';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import {
  forgotPasswordValidationSchema,
  ForgotPasswordFormValues,
} from '../../../validations/forgotPasswordValidation';
import { useAuth } from '../../../context/AuthContext';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

const initialValues: ForgotPasswordFormValues = {
  email: '',
};

export function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const { sendPasswordReset } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendEmail = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await sendPasswordReset(values.email);
      Alert.alert(
        'Email Sent',
        'A password reset link has been sent to your email. Please open the link in your browser to set your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }],
      );
    } catch (error: any) {
      let message = 'An error occurred. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please wait a minute before trying again.';
      }
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout
      showBackGroundImage={true}
      imageSource={require('../../../assets/images/background.png')}
      barStyle="dark-content"
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerSection}>
        <Logo />
        <TitleText style={styles.title}>Forgot Password?</TitleText>
        <DescriptionText text="Enter your registered email address and we will send you a password reset link." />
      </View>

      <Card style={styles.card}>
        <Formik
          initialValues={initialValues}
          validationSchema={forgotPasswordValidationSchema}
          onSubmit={handleSendEmail}
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
                label="Email Address"
                leftIcon={<EmailIcon />}
                leftIconName="email-outline"
                placeholder="your.email@example.com"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                touched={touched.email}
              />

              <Button
                title={isSubmitting ? 'Sending...' : 'Send Email'}
                onPress={() => handleSubmit()}
                style={styles.button}
                disabled={isSubmitting}
              />

              <TouchableOpacity
                style={styles.backToSignInButton}
                onPress={() => navigation.navigate('SignIn')}
              >
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
              </TouchableOpacity>
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
    paddingVertical: UtilityMethods.hp(3),
    marginTop: 0,
  },
  button: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: UtilityMethods.hp(1),
  },
  backToSignInButton: {
    marginTop: UtilityMethods.hp(2),
    alignItems: 'center',
    paddingVertical: UtilityMethods.hp(1),
  },
  backToSignInText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.primaryPurple,
  },
});
