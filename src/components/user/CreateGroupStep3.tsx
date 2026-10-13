import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import type { CreateGroupPrivacy } from '../../constants/createGroupPrivacy';
import type { CreateGroupCategoryId } from '../../constants/createGroupCategories';
import { CreateGroupPrivacySettingsIntro } from './CreateGroupPrivacySettingsIntro';
import { CreateGroupPrivacyOptions } from './CreateGroupPrivacyOptions';
import { CreateGroupPreviewSection } from './CreateGroupPreviewSection';
import UtilityMethods from '../../utility/UtilityMethods';

export interface CreateGroupStep3Props {
  groupName: string;
  groupDescription: string;
  coverUri?: string;
  avatarUri?: string;
  selectedCategoryId: CreateGroupCategoryId | null;
  privacy: CreateGroupPrivacy;
  onChangePrivacy: (value: CreateGroupPrivacy) => void;
}

export function CreateGroupStep3({
  groupName,
  groupDescription,
  coverUri,
  avatarUri,
  selectedCategoryId,
  privacy,
  onChangePrivacy,
}: CreateGroupStep3Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <CreateGroupPrivacySettingsIntro />
      <CreateGroupPrivacyOptions value={privacy} onChange={onChangePrivacy} />
      <CreateGroupPreviewSection
        groupName={groupName}
        groupDescription={groupDescription}
        coverUri={coverUri}
        avatarUri={avatarUri}
        selectedCategoryId={selectedCategoryId}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: UtilityMethods.hp(2),
  },
});
