import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import { UserChangePasswordInfoBanner } from '../../../components/user';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import type { UserStackParamList } from '../../../navigation/User/types';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';
import auth from '@react-native-firebase/auth';

const H_PAD = UtilityMethods.wp(5);

export function UserChangePasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = auth().currentUser;
  const email = currentUser?.email || '';

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'No registered email found for this account.');
      return;
    }
    setIsSubmitting(true);
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Email Sent',
        'A password reset link has been sent to your email. Please open the link in your browser to set your new password.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      if (error?.code === 'auth/too-many-requests') {
        Alert.alert(
          'Please Wait',
          'Too many requests. Please wait a minute before requesting another email.',
        );
      } else {
        Alert.alert(
          'Error',
          error?.message || 'Failed to send password reset email. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      scrollContent: {
        flexGrow: 1,
        paddingBottom: UtilityMethods.hp(4),
        backgroundColor: Colors.white,
      },
      navWrap: {
        backgroundColor: Colors.white,
      },
      navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(4),
        paddingBottom: UtilityMethods.hp(1.25),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      backBtn: {
        padding: UtilityMethods.wp(0.5),
      },
      navTitleWrap: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(28),
        paddingBottom: UtilityMethods.hp(1.25),
      },
      navTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
      },
      body: {
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(2.5),
      },
      emailCard: {
        backgroundColor: '#F8F5FB',
        borderWidth: 1,
        borderColor: '#E6DAF2',
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(2),
        paddingHorizontal: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(3),
      },
      emailLabel: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.textGrey,
        marginBottom: UtilityMethods.hp(0.5),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      emailValue: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.primaryPurple,
      },
      primaryBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.userProfilePurple,
        paddingVertical: UtilityMethods.hp(1.75),
        borderRadius: UtilityMethods.wp(8),
        marginTop: UtilityMethods.hp(1),
        marginBottom: UtilityMethods.hp(1.5),
      },
      primaryBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      secondaryBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        paddingVertical: UtilityMethods.hp(1.75),
        borderRadius: UtilityMethods.wp(8),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        marginBottom: UtilityMethods.hp(2),
      },
      secondaryBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
    }),
  );

  return (
    <MainLayout
      isScrollable={true}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.white}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.navWrap}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeftIcon
              width={UtilityMethods.wp(5.5)}
              height={UtilityMethods.wp(5.5)}
            />
          </TouchableOpacity>
          <View style={styles.navTitleWrap} pointerEvents="none">
            <Text style={styles.navTitle} numberOfLines={1}>
              Change Password
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <UserChangePasswordInfoBanner
          title="Reset Password via Email"
          subtitle="We will send a password reset link to your email address. You can open the link in your browser to easily set a new password."
        />

        {email ? (
          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>Registered Email</Text>
            <Text style={styles.emailValue}>{email}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSendEmail}
          activeOpacity={0.88}
          disabled={isSubmitting}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>
            {isSubmitting ? 'Sending...' : 'Send Email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleBack}
          activeOpacity={0.88}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </MainLayout>
  );
}
