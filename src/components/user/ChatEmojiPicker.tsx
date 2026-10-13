import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize from '../../utility/FontSize';
import {
  CHAT_EMOJI_CATEGORIES,
  ALL_CHAT_EMOJIS,
} from '../../constants/chatEmojis';

export interface ChatEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onBackspace?: () => void;
}

function BackspaceIcon({ size = 20, color = Colors.textDark }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 4H8L1 12L8 20H21C21.5523 20 22 19.5523 22 19V5C22 4.44772 21.5523 4 21 4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 9L12 15M12 9L18 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChatEmojiPicker({
  onSelectEmoji,
  onBackspace,
}: ChatEmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...CHAT_EMOJI_CATEGORIES.map(c => c.title)];

  const displayEmojis =
    selectedCategory === 'All'
      ? ALL_CHAT_EMOJIS
      : CHAT_EMOJI_CATEGORIES.find(c => c.title === selectedCategory)?.emojis || [];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(cat => {
            const isActive = cat === selectedCategory;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {onBackspace && (
          <TouchableOpacity
            style={styles.backspaceBtn}
            onPress={onBackspace}
            activeOpacity={0.7}
            accessibilityLabel="Delete last character"
          >
            <BackspaceIcon size={UtilityMethods.wp(5.2)} color={Colors.textDark} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.grid}
        keyboardShouldPersistTaps="always"
      >
        {displayEmojis.map((emoji, idx) => (
          <TouchableOpacity
            key={`${emoji}-${idx}`}
            style={styles.emojiCell}
            onPress={() => onSelectEmoji(emoji)}
            activeOpacity={0.6}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: UtilityMethods.hp(32),
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderGrey,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UtilityMethods.wp(3),
    paddingVertical: UtilityMethods.hp(1),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderGrey,
    backgroundColor: '#FAFAFA',
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: UtilityMethods.wp(3),
    paddingVertical: UtilityMethods.hp(0.6),
    borderRadius: UtilityMethods.wp(4),
    backgroundColor: Colors.inputBackground,
    marginRight: UtilityMethods.wp(2),
  },
  categoryPillActive: {
    backgroundColor: Colors.primaryPurple,
  },
  categoryText: {
    fontSize: FontSize.VALUE(12),
    color: Colors.textGrey,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.white,
  },
  backspaceBtn: {
    padding: UtilityMethods.wp(1.5),
    marginLeft: UtilityMethods.wp(2),
    backgroundColor: Colors.inputBackground,
    borderRadius: UtilityMethods.wp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: UtilityMethods.wp(2),
    paddingTop: UtilityMethods.hp(1),
    paddingBottom: UtilityMethods.hp(2),
  },
  emojiCell: {
    width: `${100 / 8}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: FontSize.VALUE(24),
  },
});
