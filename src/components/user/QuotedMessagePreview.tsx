import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

export interface QuotedMessagePreviewProps {
  senderName: string;
  snippet: string;
  mediaType?: 'image' | 'audio' | null;
  onCancel: () => void;
}

export function QuotedMessagePreview({
  senderName,
  snippet,
  mediaType,
  onCancel,
}: QuotedMessagePreviewProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FD',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.borderGrey,
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1),
      },
      accentBar: {
        width: 3.5,
        height: '100%',
        backgroundColor: Colors.userProfilePurple,
        borderRadius: 2,
        marginRight: UtilityMethods.wp(3),
      },
      content: {
        flex: 1,
        minWidth: 0,
      },
      title: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '700',
        color: Colors.userProfilePurple,
        marginBottom: UtilityMethods.hp(0.2),
      },
      snippetText: {
        fontSize: FontSize.VALUE(12.5),
        color: Colors.textDark,
        lineHeight: FontSize.VALUE(17),
      },
      closeBtn: {
        padding: UtilityMethods.wp(1.5),
        marginLeft: UtilityMethods.wp(2),
      },
      closeText: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.placeholderGrey,
      },
    }),
  );

  const displaySnippet =
    snippet ||
    (mediaType === 'image'
      ? '📷 Photo'
      : mediaType === 'audio'
      ? '🎤 Voice memo'
      : 'Message');

  return (
    <View style={styles.container}>
      <View style={styles.accentBar} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          Replying to {senderName}
        </Text>
        <Text style={styles.snippetText} numberOfLines={1}>
          {displaySnippet}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onCancel}
        hitSlop={12}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel="Cancel reply"
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

