import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MainLayout from '../../../components/general/MainLayout';

interface AdminPlaceholderScreenProps {
  tabName: string;
}

export function AdminPlaceholderScreen({ tabName }: AdminPlaceholderScreenProps) {
  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={false}
      barStyle="dark-content"
    >
      <View style={styles.container}>
        <Text style={styles.text}>{tabName}</Text>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
