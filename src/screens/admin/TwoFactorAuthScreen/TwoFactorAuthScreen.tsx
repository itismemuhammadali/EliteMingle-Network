import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OtpInput } from 'react-native-otp-entry';
import Logo from '../../../assets/svgs/logo.svg';
import { TitleText, Button } from '../../../components/general';
import DescriptionText from '../../../components/general/descriptionText/DescriptionText';
import Card from '../../../components/general/Card/Card';
import { Loader } from '../../../components/general/Loader';
import { Timer, ResendSection } from '../../../components/general/Timer';
import { useCountdown } from '../../../hooks/useCountdown';
import MainLayout from '../../../components/general/MainLayout';
import { useAppSelector } from '../../../redux/hooks';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import EmailIcon from '../../../assets/Icons/EmailIcon.svg';
import ButtonArrow from '../../../assets/Icons/ButtonArrow.svg';

type AuthMethod = 'app' | 'sms';

export function TwoFactorAuthScreen() {
  const navigation = useNavigation();
  const isUserRole = useAppSelector(state => state.user);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('app');
  const [otp, setOtp] = useState('');
  const otpRef = useRef<any>(null);
  const { secondsRemaining, canResend, reset, formatTime } = useCountdown(60);

  const handleVerify = () => {
    const parent = navigation.getParent() as any;
    if (isUserRole) {
      parent?.navigate('UserMain');
    } else {
      parent?.navigate('Main');
    }
  };

  const handleResend = () => {
    reset();
    otpRef.current?.clear();
  };

  return (
    <MainLayout
      showBackGroundImage={true}
      imageSource={require('../../../assets/images/background.png')}
      barStyle="dark-content"
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={{ marginTop: UtilityMethods.hp(5) }}>
          <View style={styles.logoSection}>
            <Logo width={UtilityMethods.wp(20)} />
          </View>

          <TitleText style={styles.title}>Two-Factor Authentication</TitleText>
          <DescriptionText
            text="Enter the 6-digit code from your mail or SMS"
          />

          <View style={styles.loaderSection}>
            <Loader size={UtilityMethods.wp(15)} />
          </View>

          <Timer secondsRemaining={secondsRemaining} formatTime={formatTime} />

          <View style={styles.methodSection}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                authMethod === 'app' && styles.methodButtonSelected,
              ]}
              onPress={() => setAuthMethod('app')}
              activeOpacity={0.8}
            >
              <EmailIcon
                color={authMethod === 'sms' ? '#6B7280' : Colors.primaryPurple}
              />
              <Text
                style={[
                  styles.methodText,
                  authMethod === 'app' && styles.methodTextSelected,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                authMethod === 'sms' && styles.methodButtonSelected,
              ]}
              onPress={() => setAuthMethod('sms')}
              activeOpacity={0.8}
            >
              <EmailIcon
                color={authMethod === 'app' ? '#6B7280' : Colors.primaryPurple}
              />
              <Text
                style={[
                  styles.methodText,
                  authMethod === 'sms' && styles.methodTextSelected,
                ]}
              >
                SMS
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.otpLabel}>Enter Verification Code</Text>
          <OtpInput
            ref={otpRef}
            numberOfDigits={6}
            onTextChange={setOtp}
            focusColor={Colors.primaryPurple}
            type="numeric"
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: styles.otpBox,
              pinCodeTextStyle: styles.otpText,
              focusedPinCodeContainerStyle: styles.otpBoxFocused,
              filledPinCodeContainerStyle: styles.otpBoxFilled,
              focusStickStyle: styles.otpStick,
            }}
          />

          <Button
            title="Verify"
            onPress={handleVerify}
            style={styles.verifyButton}
            rightIcon={<ButtonArrow style={{ transform: [{ scaleX: -1 }] }} />}
          />

          <ResendSection
            secondsRemaining={secondsRemaining}
            canResend={canResend}
            formatTime={formatTime}
            onResend={handleResend}
          />
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
  logoSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.VALUE(24),
    marginBottom: UtilityMethods.hp(0.5),
  },
  loaderSection: {
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(0.5),
  },
  methodSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: UtilityMethods.wp(3),
    marginVertical: UtilityMethods.hp(2),
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(10),
    borderRadius: UtilityMethods.wp(4),
    borderWidth: 1,
    gap: UtilityMethods.wp(3),
    borderColor: Colors.borderGrey,
    backgroundColor: Colors.white,
  },
  methodButtonSelected: {
    borderColor: Colors.primaryPurple,
    backgroundColor: '#85138C0D',
  },
  methodIcon: {
    marginRight: UtilityMethods.wp(2),
  },
  methodText: {
    fontSize: FontSize.BODY_TEXT,
    fontWeight: '600',
    color: Colors.textDark,
  },
  methodTextSelected: {
    color: Colors.primaryPurple,
  },
  otpLabel: {
    fontSize: FontSize.BODY_TEXT,
    textAlign: 'center',
    fontWeight: '600',
    color: Colors.textDark,
    marginVertical: UtilityMethods.hp(2),
    marginBottom: UtilityMethods.hp(1.5),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: UtilityMethods.hp(1),
  },
  otpBox: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.hp(6),
    borderRadius: UtilityMethods.wp(2),
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
  otpText: {
    fontSize: FontSize.BODY_TEXT,
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
});
