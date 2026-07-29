import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import SparklesIcon from '../../assets/Icons/Sparkles.svg';
import WhiteSparklesIcon from '../../assets/Icons/whiteSparkles.svg';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSimplifiedUi, setFontScale } from '../../redux/roleSlice';

const FONT_OPTIONS: { label: string; value: number; size: number }[] = [
  { label: 'A', value: -2, size: 14 },
  { label: 'A', value: 0, size: 17 },
  { label: 'A', value: 4, size: 21 },
];

function CloseIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SpeakerWhite({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H3V15H6L11 19V5Z"
        stroke={Colors.white}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 12C17.0039 13.3308 16.4774 14.6024 15.54 15.54"
        stroke={Colors.white}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <Path
        d="M18.07 5.93C19.9447 7.80528 20.9979 10.3478 20.9979 13C20.9979 15.6522 19.9447 18.1947 18.07 20.07"
        stroke={Colors.white}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MicWhite({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z"
        stroke={Colors.white}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 11C19 15.4183 15.4183 19 11 19M19 11H17M5 11C5 15.4183 8.58172 19 13 19M5 11H7"
        stroke={Colors.white}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <Path
        d="M12 19V22"
        stroke={Colors.white}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SparklesWhite({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L13.2 8.2L19 9.5L13.2 10.8L12 17L10.8 10.8L5 9.5L10.8 8.2L12 2Z"
        fill={Colors.white}
        stroke={Colors.white}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <Path
        d="M19 14L19.6 16.4L22 17L19.6 17.6L19 20L18.4 17.6L16 17L18.4 16.4L19 14Z"
        fill={Colors.white}
      />
    </Svg>
  );
}

const GLYPH = UtilityMethods.wp(5);

export interface AccessibilityModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AccessibilityModal({
  visible,
  onClose,
}: AccessibilityModalProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const simplified = useAppSelector(s => s.simplifiedUi);
  const fontScale = useAppSelector(s => s.fontScale);
  const [tts, setTts] = useState(false);
  const [voice, setVoice] = useState(false);
  const [bci, setBci] = useState(false);
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      root: {
        flex: 1,
        justifyContent: 'flex-end',
      },
      backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
      },
      sheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: UtilityMethods.wp(4),
        borderTopRightRadius: UtilityMethods.wp(4),
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2),
        maxHeight: '88%',
      },
      headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: UtilityMethods.hp(1.25),
      },
      headerTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      closeBtn: {
        width: UtilityMethods.wp(9),
        height: UtilityMethods.wp(9),
        borderRadius: UtilityMethods.wp(4.5),
        backgroundColor: '#EEEEEE',
        alignItems: 'center',
        justifyContent: 'center',
      },
      separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.borderGrey,
        marginBottom: UtilityMethods.hp(1.5),
      },
      rowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.35),
        paddingHorizontal: UtilityMethods.wp(3),
        marginBottom: UtilityMethods.hp(1.25),
      },
      iconCircle: {
        width: UtilityMethods.wp(11),
        height: UtilityMethods.wp(11),
        borderRadius: UtilityMethods.wp(5.5),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      textCol: {
        flex: 1,
        minWidth: 0,
        paddingRight: UtilityMethods.wp(2),
      },
      rowTitle: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.25),
      },
      rowSubtitle: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.placeholderGrey,
      },
      fontCard: {
        borderRadius: UtilityMethods.wp(3),
        backgroundColor: '#F1F8E9',
        paddingVertical: UtilityMethods.hp(1.35),
        paddingHorizontal: UtilityMethods.wp(3),
        marginBottom: UtilityMethods.hp(1.25),
      },
      fontTitle: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.25),
      },
      fontSubtitle: {
        fontSize: FontSize.VALUE(13),
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(1),
      },
      fontOptionsRow: {
        flexDirection: 'row',
      },
      fontChip: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: UtilityMethods.hp(1),
        borderRadius: UtilityMethods.wp(2),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        backgroundColor: Colors.white,
        marginRight: UtilityMethods.wp(2),
      },
      fontChipActive: {
        backgroundColor: Colors.userProfilePurple,
        borderColor: Colors.userProfilePurple,
      },
      fontChipText: {
        fontWeight: '700',
        color: Colors.textDark,
      },
      fontChipTextActive: {
        color: Colors.white,
      },
    }),
  );

  function OptionRow({
    backgroundColor,
    iconBg,
    icon,
    title,
    subtitle,
    value,
    onValueChange,
    activeTrack,
  }: {
    backgroundColor: string;
    iconBg: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    activeTrack: string;
  }) {
    return (
      <View style={[styles.rowCard, { backgroundColor }]}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
        <View style={styles.textCol}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E0E0E0', true: activeTrack }}
          thumbColor={
            Platform.OS === 'android'
              ? value
                ? Colors.white
                : '#F5F5F5'
              : Colors.white
          }
          ios_backgroundColor="#E0E0E0"
        />
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, UtilityMethods.hp(2)) },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Accessibility</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <CloseIcon size={UtilityMethods.wp(4.5)} color="#666666" />
            </TouchableOpacity>
          </View>
          <View style={styles.separator} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.fontCard}>
              <Text style={styles.fontTitle}>Text Size</Text>
              <Text style={styles.fontSubtitle}>Choose comfortable text</Text>
              <View style={styles.fontOptionsRow}>
                {FONT_OPTIONS.map((opt, i) => {
                  const active = fontScale === opt.value;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.fontChip,
                        active && styles.fontChipActive,
                        i === FONT_OPTIONS.length - 1 && { marginRight: 0 },
                      ]}
                      onPress={() => dispatch(setFontScale(opt.value))}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.fontChipText,
                          { fontSize: opt.size },
                          active && styles.fontChipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <OptionRow
              backgroundColor="#F3E5F5"
              iconBg={Colors.userProfilePurple}
              icon={<SpeakerWhite size={GLYPH} />}
              title="Text-to-Speech"
              subtitle="Read content aloud"
              value={tts}
              onValueChange={setTts}
              activeTrack="#CE93D8"
            />
            <OptionRow
              backgroundColor="#E3F2FD"
              iconBg="#1976D2"
              icon={<MicWhite size={GLYPH} />}
              title="Voice Commands"
              subtitle="Control with voice"
              value={voice}
              onValueChange={setVoice}
              activeTrack="#90CAF9"
            />
            <OptionRow
              backgroundColor="#FCE4EC"
              iconBg="#E91E63"
              icon={<WhiteSparklesIcon width={GLYPH} height={GLYPH} />}
              title="Simplified UI"
              subtitle="Easier navigation"
              value={simplified}
              onValueChange={v => dispatch(setSimplifiedUi(v))}
              activeTrack="#F48FB1"
            />
            <OptionRow
              backgroundColor="#FCE4EC"
              iconBg="#E91E63"
              icon={<WhiteSparklesIcon width={GLYPH} height={GLYPH} />}
              title="BCI Integration"
              subtitle="Easier navigation"
              value={bci}
              onValueChange={setBci}
              activeTrack="#F48FB1"
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
