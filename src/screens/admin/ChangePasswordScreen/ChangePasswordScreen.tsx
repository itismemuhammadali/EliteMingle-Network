import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import { LockIcon } from '../../../components/admin/icons';
import type { RootStackParamList } from '../../../navigation/MainStack';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export function ChangePasswordScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>
    >();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = auth().currentUser;
  const email = currentUser?.email || '';

  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'No registered email found for this administrator account.');
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

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund="#FFFFFF"
      bottomColor={Colors.adminBackgroundGrey}
    >
      <ScreenHeader
        title="Change Password"
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.headerBorder} />

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <LockIcon
              size={UtilityMethods.wp(9)}
              color={Colors.white}
            />
          </View>

          <Text style={styles.cardTitle}>Reset Password via Email</Text>
          <Text style={styles.cardSubtitle}>
            We will send a password reset link to your registered email address. You can open the link in your browser to easily set a new password.
          </Text>

          {email ? (
            <View style={styles.emailCard}>
              <Text style={styles.emailLabel}>Registered Email</Text>
              <Text style={styles.emailValue}>{email}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSendEmail}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>
                {isSubmitting ? 'Sending...' : 'Send Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.88}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  headerBorder: {
    height: 1,
    backgroundColor: Colors.borderGrey,
  },
  content: {
    padding: UtilityMethods.wp(4),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(5),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  iconCircle: {
    width: UtilityMethods.wp(16),
    height: UtilityMethods.wp(16),
    borderRadius: UtilityMethods.wp(8),
    backgroundColor: Colors.primaryPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(2),
  },
  cardTitle: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: UtilityMethods.hp(1),
  },
  cardSubtitle: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.textGrey,
    textAlign: 'center',
    lineHeight: FontSize.VALUE(20),
    marginBottom: UtilityMethods.hp(2.5),
    paddingHorizontal: UtilityMethods.wp(2),
  },
  emailCard: {
    width: '100%',
    backgroundColor: '#F8F5FB',
    borderWidth: 1,
    borderColor: '#E6DAF2',
    borderRadius: UtilityMethods.wp(2.5),
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(4),
    marginBottom: UtilityMethods.hp(3),
    alignItems: 'flex-start',
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
  actions: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(3),
    width: '100%',
  },
  primaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  secondaryBtnText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '600',
    color: Colors.adminInactiveGrey,
  },
});
