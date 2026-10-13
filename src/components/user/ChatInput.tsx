import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
  isRecording?: boolean;
  recordingSeconds?: number;
  onCancelRecording?: () => void;
  onStopAndSendRecording?: () => void;
}

function TrashIcon({ size = 20, color = Colors.adminErrorRed }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6H5H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6M10 11V17M14 11V17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onEmojiPress,
  onAttachPress,
  onMicPress,
  placeholder = 'Type a message...',
  isRecording = false,
  recordingSeconds = 0,
  onCancelRecording,
  onStopAndSendRecording,
}: ChatInputProps) {
  const canSend = value.trim().length > 0;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

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
      recordingPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: UtilityMethods.wp(8),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.1),
        marginRight: UtilityMethods.wp(2.5),
        minHeight: UtilityMethods.hp(5.5),
      },
      recordDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.adminErrorRed,
        marginRight: UtilityMethods.wp(2.5),
      },
      recordingText: {
        flex: 1,
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.adminErrorRed,
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
      cancelRecordBtn: {
        padding: UtilityMethods.wp(1.5),
      },
    }),
  );

  if (isRecording) {
    return (
      <View style={styles.row}>
        <View style={styles.recordingPill}>
          <Animated.View style={[styles.recordDot, { opacity: pulseAnim }]} />
          <Text style={styles.recordingText}>
            Recording {formatTimer(recordingSeconds)}
          </Text>
          <TouchableOpacity
            style={styles.cancelRecordBtn}
            onPress={onCancelRecording}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel recording"
          >
            <TrashIcon size={UtilityMethods.wp(5)} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={onStopAndSendRecording}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Send voice message"
        >
          <ChatSendPlaneIcon size={UtilityMethods.wp(5)} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

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
