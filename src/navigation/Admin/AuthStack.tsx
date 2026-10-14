import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen, OnboardingScreen } from '../../screens/general/index';
import {
  SignInScreen,
  TwoFactorAuthScreen,
  ForgotPasswordScreen,
  VerifyEmailScreen,
  CreateNewPasswordScreen,
  SignUpScreen,
  CompleteProfileScreen,
} from '../../screens/admin';
import { LegalDocumentScreen } from '../../screens/common/LegalDocumentScreen';
import { SplashScreenView } from '../../components/general/SplashScreenView';
import { hasCompletedOnboarding } from '../../services/appLaunchService';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    hasCompletedOnboarding().then(done => {
      if (isMounted) {
        setOnboardingCompleted(done);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (onboardingCompleted === null) {
    return <SplashScreenView />;
  }

  return (
    <Stack.Navigator
      initialRouteName={onboardingCompleted ? 'SignIn' : 'Onboarding'}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
    </Stack.Navigator>
  );
}
