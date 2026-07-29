import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface LanguageSettingsNoticeProps {
  title?: string;
  body?: string;
}

const DEFAULT_BODY =
  'Changing the language will update all text throughout the app. Some features may require you to restart the app for changes to take full effect.';

export function LanguageSettingsNotice({
  title = 'Language Settings',
  body = DEFAULT_BODY,
}: LanguageSettingsNoticeProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(76, 125, 255, 0.08)',
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    borderWidth: 1,
    borderColor: 'rgba(76, 125, 255, 0.35)',
    marginBottom: UtilityMethods.hp(2),
  },
  title: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: UtilityMethods.hp(1),
  },
  body: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: '#2C5282',
    lineHeight: FontSize.VALUE(19),
  },
});
