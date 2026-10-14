import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/Admin/types';
import { SplashScreenView } from '../../../components/general/SplashScreenView';
import { hasCompletedOnboarding } from '../../../services/appLaunchService';

type SplashNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<SplashNavigationProp>();

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      if (!isMounted) return;
      const completed = await hasCompletedOnboarding();
      if (!isMounted) return;
      if (completed) {
        navigation.replace('SignIn');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <SplashScreenView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
