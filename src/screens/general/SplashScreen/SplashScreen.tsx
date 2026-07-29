import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TitleText, Button } from '../../../components/general/index';
import MainLayout from '../../../components/general/MainLayout';
import UtilityMethods from '../../../utility/UtilityMethods';
import DescriptionText from '../../../components/general/descriptionText/DescriptionText';
import { AuthStackParamList } from '../../../navigation/Admin/types';

type SplashNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<SplashNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  return (
    <MainLayout
      showBackGroundImage={true}
      imageSource={require('../../../assets/images/splash.png')}
      barStyle="dark-content"
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.bottomSection}>
          <TitleText style={{ marginHorizontal: UtilityMethods.wp(10) }}>
            Find Friends to chat for network
          </TitleText>
          <DescriptionText
            text=" A safe and friendly space designed just for you. Connect with
            amazing people, share your stories, and build lasting friendships."
          />
          <Button title="Get Started" onPress={handleGetStarted} />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  bottomSection: {
    flex: 1,
    padding: UtilityMethods.wp(5),
    marginBottom: UtilityMethods.hp(10),
    justifyContent: 'flex-end',
  },
  description: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 32,
  },
});
