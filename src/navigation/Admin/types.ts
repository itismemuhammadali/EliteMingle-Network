export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  TwoFactorAuth: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string; source?: 'forgotPassword' | 'signUp' };
  CreateNewPassword: undefined;
  SignUp: undefined;
  CompleteProfile: undefined;
};
