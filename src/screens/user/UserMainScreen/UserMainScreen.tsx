import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UserStackParamList } from '../../../navigation/User/types';
import {
  UserBottomTabBar,
  type UserTab,
  CreatePostModalProvider,
  useCreatePostModal,
  AccessibilityModalProvider,
} from '../../../components/user';
import { Colors } from '../../../constants/colors';
import { UserHomeScreen } from '../UserHomeScreen';
import { UserMessagesScreen } from '../UserMessagesScreen';
import { UserGroupsScreen } from '../UserGroupsScreen';
import { UserProfileScreen } from '../UserProfileScreen';

function UserMainInner() {
  const [activeTab, setActiveTab] = useState<UserTab>('Home');
  const route = useRoute<RouteProp<UserStackParamList, 'UserMain'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const insets = useSafeAreaInsets();
  const { openCreatePost } = useCreatePostModal();

  useFocusEffect(
    useCallback(() => {
      const tab = route.params?.openTab;
      if (tab) {
        setActiveTab(tab);
        navigation.setParams({ openTab: undefined });
      }
    }, [navigation, route.params?.openTab]),
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <UserHomeScreen />;
      case 'Messages':
        return <UserMessagesScreen />;
      case 'Groups':
        return <UserGroupsScreen />;
      case 'Profile':
        return <UserProfileScreen />;
      default:
        return <UserHomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.insetTop, { paddingTop: insets.top }]} />
      <View style={styles.content}>{renderContent()}</View>
      <View style={styles.footer}>
        <UserBottomTabBar
          activeTab={activeTab}
          onTabPress={setActiveTab}
          onFabPress={openCreatePost}
        />
      </View>
    </View>
  );
}

export function UserMainScreen() {
  return (
    <CreatePostModalProvider>
      <AccessibilityModalProvider>
        <UserMainInner />
      </AccessibilityModalProvider>
    </CreatePostModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.userFeedBackground,
  },
  insetTop: {
    backgroundColor: Colors.userFeedBackground,
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: Colors.white,
  },
});
