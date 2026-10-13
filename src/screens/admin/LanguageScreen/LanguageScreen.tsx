import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import {
  LanguageCurrentCard,
  LanguageAvailableSection,
  LanguageSettingsNotice,
} from '../../../components/admin';
import {
  LANGUAGE_OPTIONS,
  type LanguageOption,
} from '../../../constants/languagesData';
import type { RootStackParamList } from '../../../navigation/MainStack';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

import { useLanguage } from '../../../context/LanguageContext';
import type { LanguageCode } from '../../../services/localizationService';

export function LanguageScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Language'>>();
  const { language, setLanguage, t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string>(language);

  const selected = useMemo(
    () =>
      LANGUAGE_OPTIONS.find(l => l.id === selectedId) ?? LANGUAGE_OPTIONS[0],
    [selectedId],
  );

  const handleSave = async () => {
    await setLanguage(selectedId as LanguageCode);
    navigation.goBack();
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
        title={t('languageScreen.title', 'Language')}
        subtitle={t('languageScreen.subtitle', 'Select your preferred language')}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.headerBorder} />

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <LanguageCurrentCard
          languageName={selected.labelEn}
          nativeLabel={selected.labelNative}
          label={t('languageScreen.currentLanguageTitle', 'Current Language')}
        />

        <LanguageAvailableSection
          items={LANGUAGE_OPTIONS}
          selectedId={selectedId}
          onSelect={(item: LanguageOption) => setSelectedId(item.id)}
          sectionTitle={t('languageScreen.availableLanguagesTitle', 'Available Languages')}
        />

        <LanguageSettingsNotice
          title={t('languageScreen.title', 'Language')}
          body={t('languageScreen.settingsNotice')}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {t('languageScreen.saveButton', 'Save Language Preference')}
          </Text>
        </TouchableOpacity>
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
  saveButton: {
    width: '100%',
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.white,
  },
});
