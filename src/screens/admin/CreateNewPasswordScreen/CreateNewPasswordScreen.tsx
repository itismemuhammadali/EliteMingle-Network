import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import Logo from '../../../assets/svgs/logo.svg';
import PasswordIcon from '../../../assets/svgs/PasswordIcon.svg';
import EyeIcon from '../../../assets/svgs/EyeIcon.svg';
import { TitleText, Button, TextInputField } from '../../../components/general';
import DescriptionText from '../../../components/general/descriptionText/DescriptionText';
import Card from '../../../components/general/Card/Card';
import MainLayout from '../../../components/general/MainLayout';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import {
  createNewPasswordValidationSchema,
  CreateNewPasswordFormValues,
} from '../../../validations/createNewPasswordValidation';
import { useNavigation } from '@react-navigation/native';

const initialValues: CreateNewPasswordFormValues = {
  password: '',
  confirmPassword: '',
};

export function CreateNewPasswordScreen() {
  const navigation = useNavigation();
  const handlePasswordReset = (values: CreateNewPasswordFormValues) => {
    navigation.navigate('SignIn' as never);
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
          <TitleText style={styles.title}>Create new password</TitleText>
          <DescriptionText text="Choose a strong password to keep your account secure." />
        </View>

        <Card style={styles.card}>
          <Formik
            initialValues={initialValues}
            validationSchema={createNewPasswordValidationSchema}
            onSubmit={handlePasswordReset}
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
                  label="Password"
                  leftIcon={<PasswordIcon />}
                  leftIconName="lock-outline"
                  placeholder="Create a password"
                  secureTextEntry
                  rightIcon={<EyeIcon />}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={errors.password}
                  touched={touched.password}
                />
                <Text style={styles.hintText}>
                  Must be at least 8 characters
                </Text>

                <TextInputField
                  label="Confirm Password"
                  leftIcon={<PasswordIcon />}
                  leftIconName="lock-outline"
                  placeholder="Confirm your password"
                  secureTextEntry
                  rightIcon={<EyeIcon />}
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />

                <Button
                  title="Password Reset"
                  onPress={() => handleSubmit()}
                  style={styles.button}
                />
              </>
            )}
          </Formik>
        </Card>
        <View
          style={{
            flex: 1,

            justifyContent: 'flex-end',
          }}
        >
          <Text style={styles.footerText}>
            Built with accessibility in mind ❤️
          </Text>
        </View>
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
    flexGrow: 1,
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
    marginTop: 0,
  },
  hintText: {
    fontSize: FontSize.VALUE(13),
    color: Colors.placeholderGrey,
    marginTop: -UtilityMethods.hp(1),
    marginBottom: UtilityMethods.hp(2),
  },
  button: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: UtilityMethods.hp(1),
  },
  footerText: {
    fontSize: FontSize.VALUE(13),
    color: Colors.black,
    textAlign: 'center',
    marginTop: UtilityMethods.hp(3),
    marginBottom: UtilityMethods.hp(2),
  },
});
