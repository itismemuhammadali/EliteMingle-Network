import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { CreateGroupPrivacy } from '../../constants/createGroupPrivacy';
import { CreateGroupPrivacyOptionCard } from './CreateGroupPrivacyOptionCard';

export interface CreateGroupPrivacyOptionsProps {
  value: CreateGroupPrivacy;
  onChange: (value: CreateGroupPrivacy) => void;
}

export function CreateGroupPrivacyOptions({
  value,
  onChange,
}: CreateGroupPrivacyOptionsProps) {
  return (
    <View style={styles.wrap}>
      <CreateGroupPrivacyOptionCard
        variant="public"
        selected={value === 'public'}
        onPress={() => onChange('public')}
      />
      <CreateGroupPrivacyOptionCard
        variant="private"
        selected={value === 'private'}
        onPress={() => onChange('private')}
        isLast
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
});
