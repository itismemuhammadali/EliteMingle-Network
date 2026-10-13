import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Logo from '../../../assets/svgs/logo.svg';
import EmailIcon from '../../../assets/svgs/EmailIcon.svg';
import { TitleText } from '../../../components/general';
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

export function VerifyEmailScreen() {
  const route = useRoute<VerifyEmailRouteProp>();
  const { user, reloadUser, sendVerificationEmail, signOut } = useAuth();
  const email = route.params?.email || user?.email || '';

  const [isResending, setIsResending] = useState(false);
  const { secondsRemaining, canResend, reset } = useCountdown(60);

  // Automatically check if the user verified their email in browser
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const refreshedUser = await reloadUser();
        if (refreshedUser?.emailVerified && isMounted) {
          clearInterval(interval);
        }
      } catch (err) {
        // Silently continue polling
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [reloadUser]);

  const handleResend = async () => {
    if (!canResend || isResending) {
      return;
    }
    setIsResending(true);
    try {
      await sendVerificationEmail();
      reset();
      Alert.alert(
        'Verification Email Sent',
        'A fresh verification link has been sent to your email address. Please check your inbox and spam folder.',
      );
    } catch (error: any) {
      if (error?.code === 'auth/too-many-requests') {
        Alert.alert(
          'Please Wait',
          'Too many requests. Please wait a minute before requesting another verification email.',
        );
      } else {
        Alert.alert(
          'Error',
          error?.message || 'Failed to send verification email. Please try again.',
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      console.warn('Sign out warning:', error);
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
        <DescriptionText text="We sent a verification link to" />
        {email ? (
          <View style={styles.emailPill}>
            <Text style={styles.emailText}>{email}</Text>
          </View>
        ) : null}
      </View>

      <Card style={styles.card}>
        <View style={styles.iconCircle}>
          <EmailIcon width={UtilityMethods.wp(8)} height={UtilityMethods.hp(4)} stroke={Colors.primaryPurple} />
        </View>

        <Text style={styles.cardHeading}>Confirm Your Email Address</Text>
        <Text style={styles.cardSubtitle}>
          Please check your inbox and tap the link to verify your account. Once verified in your browser, you will automatically proceed.
        </Text>

        <View style={styles.waitingContainer}>
          <ActivityIndicator size="small" color={Colors.primaryPurple} />
          <Text style={styles.waitingText}>Waiting for email verification...</Text>
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendQuestion}>Did not receive the email? </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              <Text style={styles.resendLink}>
                {isResending ? 'Sending...' : 'Resend Link'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdownText}>
              Resend in {secondsRemaining}s
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Use a different account</Text>
        </TouchableOpacity>
      </Card>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
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
    marginTop: UtilityMethods.hp(0.5),
  },
  emailText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.primaryPurple,
  },
  card: {
    marginTop: 0,
    alignItems: 'center',
    paddingHorizontal: UtilityMethods.wp(5),
    paddingVertical: UtilityMethods.hp(3),
  },
  iconCircle: {
    width: UtilityMethods.wp(16),
    height: UtilityMethods.wp(16),
    borderRadius: UtilityMethods.wp(8),
    backgroundColor: 'rgba(133, 19, 140, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(1.5),
  },
  cardHeading: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: UtilityMethods.hp(1),
  },
  cardSubtitle: {
    fontSize: FontSize.VALUE(13),
    lineHeight: FontSize.VALUE(19),
    color: Colors.textGrey,
    textAlign: 'center',
    marginBottom: UtilityMethods.hp(2.5),
    paddingHorizontal: UtilityMethods.wp(2),
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(133, 19, 140, 0.06)',
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(4),
    borderRadius: UtilityMethods.wp(8),
    marginBottom: UtilityMethods.hp(1.5),
    width: '100%',
  },
  waitingText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.primaryPurple,
    marginLeft: UtilityMethods.wp(2.5),
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: UtilityMethods.hp(1),
  },
  resendQuestion: {
    fontSize: FontSize.VALUE(14),
    color: Colors.textDark,
  },
  resendLink: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.primaryPurple,
  },
  countdownText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: Colors.adminInactiveGrey,
  },
  signOutButton: {
    marginTop: UtilityMethods.hp(2.5),
    paddingVertical: UtilityMethods.hp(1),
  },
  signOutText: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '500',
    color: Colors.textGrey,
    textDecorationLine: 'underline',
  },
});
