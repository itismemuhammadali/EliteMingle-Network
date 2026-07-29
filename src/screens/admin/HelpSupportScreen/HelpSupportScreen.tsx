import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
        <HelpSendMessageForm />
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
