import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  CREATE_GROUP_CATEGORIES,
  type CreateGroupCategoryId,
  type CreateGroupCategoryItem,
} from '../../constants/createGroupCategories';
import UtilityMethods from '../../utility/UtilityMethods';
import { CreateGroupCategoryCard } from './CreateGroupCategoryCard';

const CATEGORY_ROWS: CreateGroupCategoryItem[][] = (() => {
  const out: CreateGroupCategoryItem[][] = [];
  for (let i = 0; i < CREATE_GROUP_CATEGORIES.length; i += 2) {
    out.push(CREATE_GROUP_CATEGORIES.slice(i, i + 2));
  }
  return out;
})();

export interface CreateGroupCategoryGridProps {
  selectedId: CreateGroupCategoryId | null;
  onSelect: (id: CreateGroupCategoryId) => void;
}

export function CreateGroupCategoryGrid({
  selectedId,
  onSelect,
}: CreateGroupCategoryGridProps) {
  return (
    <View style={styles.grid}>
      {CATEGORY_ROWS.map((pair, rowIndex) => (
        <View
          key={rowIndex}
          style={[
            styles.row,
            rowIndex < CATEGORY_ROWS.length - 1 && styles.rowGap,
          ]}
        >
          {pair.map(item => (
            <CreateGroupCategoryCard
              key={item.id}
              label={item.label}
              iconBg={item.iconBg}
              emoji={item.emoji}
              selected={selectedId === item.id}
              onPress={() => onSelect(item.id)}
              style={styles.cardInRow}
            />
          ))}
          {pair.length === 1 ? <View style={styles.cardSpacer} /> : null}
        </View>
      ))}
    </View>
  );
}

const GAP = UtilityMethods.wp(3);

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: GAP,
  },
  rowGap: {
    marginBottom: GAP,
  },
  cardInRow: {
    flex: 1,
    minWidth: 0,
  },
  cardSpacer: {
    flex: 1,
  },
});
