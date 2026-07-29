import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProfileProvider } from '../../components/user/UserProfileContext';
import { UserMainScreen } from '../../screens/user/UserMainScreen';
import { ChatScreen } from '../../screens/user/ChatScreen';
import { CreateGroupScreen } from '../../screens/user/CreateGroupScreen';
import { GroupDetailScreen } from '../../screens/user/GroupDetailScreen';
import { AccountSettingsScreen } from '../../screens/user/AccountSettingsScreen';
import { PrivacySettingsScreen } from '../../screens/user/PrivacySettingsScreen';
import { BlockedUsersScreen } from '../../screens/user/BlockedUsersScreen';
import { UserChangePasswordScreen } from '../../screens/user/UserChangePasswordScreen';
import { EditProfileScreen } from '../../screens/user/EditProfileScreen';
import { OtherUserProfileScreen } from '../../screens/user/OtherUserProfileScreen';
import { NotificationsScreen } from '../../screens/user/NotificationsScreen';
import { PostCommentsScreen } from '../../screens/user/PostCommentsScreen';
import { FindFriendsScreen } from '../../screens/user/FindFriendsScreen';
import type { UserStackParamList } from './types';

const Stack = createNativeStackNavigator<UserStackParamList>();

export function UserStack() {
  return (
    <UserProfileProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="UserMain" component={UserMainScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
        <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
        <Stack.Screen
          name="UserChangePassword"
          component={UserChangePasswordScreen}
        />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} />
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="PostComments" component={PostCommentsScreen} />
        <Stack.Screen name="FindFriends" component={FindFriendsScreen} />
      </Stack.Navigator>
    </UserProfileProvider>
  );
}
