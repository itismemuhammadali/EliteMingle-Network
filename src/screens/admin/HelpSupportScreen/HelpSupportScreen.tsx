import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import {
  HelpContactUsCard,
  HelpFAQSection,
  HelpSendMessageForm,
  SupportHoursCard,
} from '../../../components/admin';
import {
  HELP_CONTACT_ITEMS,
  HELP_FAQ_ITEMS,
  SUPPORT_HOURS_SCHEDULE,
} from '../../../constants/helpSupportData';
import type { RootStackParamList } from '../../../navigation/MainStack';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';

export function HelpSupportScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'HelpSupport'>
    >();

  const handleSendMessage = useCallback(
    async (payload: { subject: string; message: string }) => {
      const s = payload.subject.trim();
      const m = payload.message.trim();
      if (!s || !m) {
        Alert.alert('Incomplete Form', 'Please provide both a subject and message.');
        return;
      }
      const user = auth().currentUser;
      try {
        await firestore().collection('support_tickets').add({
          userId: user?.uid || 'anonymous',
          userEmail: user?.email || '',
          subject: s,
          message: m,
          status: 'open',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        Alert.alert(
          'Message Sent',
          'Thank you. Our support team has received your message and will respond within 24 hours.',
        );
      } catch (err: any) {
        Alert.alert('Submission Error', err?.message || 'Could not submit support ticket.');
      }
    },
    [],
  );

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund="#FFFFFF"
      bottomColor={Colors.adminBackgroundGrey}
    >
      <ScreenHeader
        title="Help & Support"
        subtitle="Get help and contact our support team"
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.headerBorder} />

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <HelpContactUsCard items={HELP_CONTACT_ITEMS} />
        <HelpFAQSection items={HELP_FAQ_ITEMS} />
        <HelpSendMessageForm onSend={handleSendMessage} />
        <SupportHoursCard schedule={SUPPORT_HOURS_SCHEDULE} />
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
    backgroundColor: Colors.adminBackgroundGrey,
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
