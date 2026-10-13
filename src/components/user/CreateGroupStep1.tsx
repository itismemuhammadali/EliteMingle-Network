import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { CreateGroupNameYourGroupIntro } from './CreateGroupNameYourGroupIntro';
import { CreateGroupAvatarUploadField } from './CreateGroupAvatarUploadField';
import { CreateGroupCoverUploadField } from './CreateGroupCoverUploadField';
import { CreateGroupNameField } from './CreateGroupNameField';
import { CreateGroupDescriptionField } from './CreateGroupDescriptionField';
import UtilityMethods from '../../utility/UtilityMethods';

export interface CreateGroupStep1Props {
  groupName: string;
  onChangeGroupName: (text: string) => void;
  groupDescription: string;
  onChangeGroupDescription: (text: string) => void;
  coverUri: string | undefined;
  onChangeCoverUri: (uri: string | undefined) => void;
  avatarUri: string | undefined;
  onChangeAvatarUri: (uri: string | undefined) => void;
}

export function CreateGroupStep1({
  groupName,
  onChangeGroupName,
  groupDescription,
  onChangeGroupDescription,
  coverUri,
  onChangeCoverUri,
  avatarUri,
  onChangeAvatarUri,
}: CreateGroupStep1Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <CreateGroupNameYourGroupIntro />
      <CreateGroupAvatarUploadField
        avatarUri={avatarUri}
        onChangeAvatarUri={onChangeAvatarUri}
      />
      <CreateGroupCoverUploadField
        coverUri={coverUri}
        onChangeCoverUri={onChangeCoverUri}
      />
      <CreateGroupNameField value={groupName} onChangeText={onChangeGroupName} />
      <CreateGroupDescriptionField
        value={groupDescription}
        onChangeText={onChangeGroupDescription}
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
