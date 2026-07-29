import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import type { CreateGroupCategoryId } from '../../constants/createGroupCategories';
import { CreateGroupChooseCategoryIntro } from './CreateGroupChooseCategoryIntro';
import { CreateGroupCategoryGrid } from './CreateGroupCategoryGrid';
import UtilityMethods from '../../utility/UtilityMethods';

export interface CreateGroupStep2Props {
  selectedCategoryId: CreateGroupCategoryId | null;
  onSelectCategory: (id: CreateGroupCategoryId) => void;
}

export function CreateGroupStep2({
  selectedCategoryId,
  onSelectCategory,
}: CreateGroupStep2Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <CreateGroupChooseCategoryIntro />
      <CreateGroupCategoryGrid
        selectedId={selectedCategoryId}
        onSelect={onSelectCategory}
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
