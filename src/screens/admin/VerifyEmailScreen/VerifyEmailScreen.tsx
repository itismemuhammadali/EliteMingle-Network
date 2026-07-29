import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OtpInput } from 'react-native-otp-entry';
import { useRoute, RouteProp } from '@react-navigation/native';
import Logo from '../../../assets/svgs/logo.svg';
import { TitleText, Button } from '../../../components/general';
import DescriptionText from '../../../components/general/descriptionText/DescriptionText';
import Card from '../../../components/general/Card/Card';
import { useCountdown } from '../../../hooks/useCountdown';
import MainLayout from '../../../components/general/MainLayout';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import { AuthStackParamList } from '../../../navigation/Admin/types';
import { useAuth } from '../../../context/AuthContext';

type VerifyEmailRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'VerifyEmail'
>;

export function VerifyEmailScreen() {
  const route = useRoute<VerifyEmailRouteProp>();
  const navigation = useNavigation<VerifyEmailNavigationProp>();
  const email = route.params?.email ?? '';
  const source = route.params?.source ?? 'forgotPassword';
  const [otp, setOtp] = useState('');
  const otpRef = useRef<any>(null);
  const { secondsRemaining, canResend, reset, formatTime } = useCountdown(60);

  const { sendPasswordReset } = useAuth();

  const handleVerifyCode = () => {
    // In the emulator, we auto-verify — navigate to the next screen
    if (source === 'signUp') {
      navigation.navigate('CompleteProfile');
    } else {
      navigation.navigate('CreateNewPassword');
    }
  };

  const handleResend = async () => {
    reset();
    otpRef.current?.clear();
    try {
      if (source === 'forgotPassword' && email) {
        await sendPasswordReset(email);
        Alert.alert('Email Sent', 'A new verification code has been sent to your email.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to resend verification code.');
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
          <TitleText style={styles.title}>Verify Your Email</TitleText>
          <DescriptionText text="We've sent a 6-digit code to" />
          {email ? (
            <View style={styles.emailPill}>
              <Text style={styles.emailText}>{email}</Text>
            </View>
          ) : null}
        </View>

        <Card style={styles.card}>
          <Text style={styles.otpLabel}>Verification Code</Text>
          <OtpInput
            ref={otpRef}
            numberOfDigits={6}
            onTextChange={setOtp}
            focusColor={Colors.primaryPurple}
            type="numeric"
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: styles.otpBox,
              pinCodeTextStyle: styles.otpTextStyle,
              focusedPinCodeContainerStyle: styles.otpBoxFocused,
              filledPinCodeContainerStyle: styles.otpBoxFilled,
              focusStickStyle: styles.otpStick,
            }}
          />

          <Button
            title="Verify Code"
            onPress={handleVerifyCode}
            style={styles.verifyButton}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendQuestion}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: UtilityMethods.hp(2),
  },
  title: {
    fontSize: FontSize.VALUE(28),
    fontWeight: '700',
    marginBottom: UtilityMethods.hp(0.5),
  },
  emailPill: {
    paddingVertical: UtilityMethods.hp(0.5),
    paddingHorizontal: UtilityMethods.wp(4),
    borderRadius: UtilityMethods.wp(4),
    backgroundColor: 'rgba(133, 19, 140, 0.06)',
  },
  emailText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.primaryPurple,
  },
  card: {
    marginTop: 0,
  },
  otpLabel: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(1.5),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: UtilityMethods.hp(1),
  },
  otpBox: {
    width: UtilityMethods.wp(13),
    height: UtilityMethods.hp(6.5),
    borderRadius: UtilityMethods.wp(3),
    borderWidth: 2,
    borderColor: Colors.borderGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFocused: {
    borderColor: Colors.primaryPurple,
  },
  otpBoxFilled: {
    borderColor: Colors.primaryPurple,
  },
  otpTextStyle: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '600',
    color: Colors.textDark,
  },
  otpStick: {
    backgroundColor: Colors.primaryPurple,
    width: 2,
  },
  verifyButton: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: UtilityMethods.hp(2),
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: UtilityMethods.hp(2),
  },
  resendQuestion: {
    fontSize: FontSize.VALUE(14),
    color: Colors.textDark,
  },
  resendLink: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: '#0051DF',
  },
});
