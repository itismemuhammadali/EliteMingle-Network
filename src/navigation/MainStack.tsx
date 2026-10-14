import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './Admin/AuthStack';
import { useAuth } from '../context/AuthContext';
import { UsersListProvider } from '../context/UsersListContext';
import { useAppSelector } from '../redux/hooks';
import { SplashScreenView } from '../components/general/SplashScreenView';
import {
  AdminMainScreen,
  NewsFeedScreen,
  FeedDetailsScreen,
  UserDetailsScreen,
  ManageUserScreen,
  HelpSupportScreen,
  LanguageScreen,
  AddNewUserScreen,
  EditUserScreen,
  ChangePasswordScreen,
  FeedPostLikersScreen,
  FeedPostCommentersScreen,
  FeedPostSharersScreen,
  VerifyEmailScreen,
  CompleteProfileScreen,
} from '../screens/admin';
import { UserStack } from './User/UserStack';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  UserMain: undefined;
  VerifyEmail: { email?: string; source?: 'forgotPassword' | 'signUp' } | undefined;
  CompleteProfile: undefined;
  NewsFeed: undefined;
  FeedDetails: { postId: string };
  FeedPostLikers: { postId: string };
  FeedPostCommenters: { postId: string };
  FeedPostSharers: { postId: string };
  UserDetails: { userId: string };
  ManageUser: { userId: string };
  HelpSupport: undefined;
  Language: undefined;
  AddNewUser: undefined;
  EditUser: { userId: string };
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MainStack() {
  const { user, loading, isEmailVerified, isProfileCompleted } = useAuth();
  const isAdmin = useAppSelector(state => state.admin);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (loading || splashVisible) {
    return <SplashScreenView />;
  }

  return (
    <UsersListProvider>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : isAdmin ? (
        <>
          <Stack.Screen name="Main" component={AdminMainScreen} />
          <Stack.Screen name="UserMain" component={UserStack} />
        </>
      ) : !isEmailVerified ? (
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      ) : !isProfileCompleted ? (
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      ) : (
        <>
          <Stack.Screen name="UserMain" component={UserStack} />
          <Stack.Screen name="Main" component={AdminMainScreen} />
        </>
      )}
      <Stack.Screen name="NewsFeed" component={NewsFeedScreen} />
      <Stack.Screen name="FeedDetails" component={FeedDetailsScreen} />
      <Stack.Screen name="FeedPostLikers" component={FeedPostLikersScreen} />
      <Stack.Screen
        name="FeedPostCommenters"
        component={FeedPostCommentersScreen}
      />
      <Stack.Screen name="FeedPostSharers" component={FeedPostSharersScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="ManageUser" component={ManageUserScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="AddNewUser" component={AddNewUserScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
    </UsersListProvider>
  );
}




const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

