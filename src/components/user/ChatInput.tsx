import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import {
  ChatSmileyIcon,
  ChatPaperclipIcon,
  ChatMicIcon,
  ChatSendPlaneIcon,
} from './icons';

const SEND = UtilityMethods.wp(12);

export interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onEmojiPress?: () => void;
  onAttachPress?: () => void;
  onMicPress?: () => void;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onEmojiPress,
  onAttachPress,
  onMicPress,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const canSend = value.trim().length > 0;

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: UtilityMethods.wp(4),
        paddingTop: UtilityMethods.hp(1),
        paddingBottom: UtilityMethods.hp(1.25),
        backgroundColor: Colors.white,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.borderGrey,
      },
      pill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(8),
        paddingHorizontal: UtilityMethods.wp(3),
        paddingVertical: Platform.OS === 'ios' ? UtilityMethods.hp(1.1) : UtilityMethods.hp(0.5),
        marginRight: UtilityMethods.wp(2.5),
        minHeight: UtilityMethods.hp(5.5),
      },
      input: {
        flex: 1,
        marginHorizontal: UtilityMethods.wp(2),
        paddingVertical: UtilityMethods.hp(0.75),
        maxHeight: UtilityMethods.hp(12),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
      },
      sendBtn: {
        width: SEND,
        height: SEND,
        borderRadius: SEND / 2,
        backgroundColor: Colors.chartMalePurple,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: UtilityMethods.hp(0.25),
      },
      sendBtnDisabled: {
        opacity: 0.45,
      },
    }),
  );

  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <TouchableOpacity
          onPress={onEmojiPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Emoji"
        >
          <ChatSmileyIcon size={UtilityMethods.wp(5)} color={Colors.adminInactiveGrey} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholderGrey}
          value={value}
          onChangeText={onChangeText}
          multiline={Platform.OS === 'ios' ? true : false}
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={onAttachPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Attach"
        >
          <ChatPaperclipIcon size={UtilityMethods.wp(5)} color={Colors.adminInactiveGrey} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onMicPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Voice"
        >
          <ChatMicIcon size={UtilityMethods.wp(5)} color={Colors.userActiveTabPurple} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!canSend}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <ChatSendPlaneIcon size={UtilityMethods.wp(5)} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}
