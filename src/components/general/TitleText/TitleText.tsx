import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import FontSize from '../../../utility/FontSize';

interface TitleTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

export function TitleText({ children, style }: TitleTextProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.VALUE(32),
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
});
