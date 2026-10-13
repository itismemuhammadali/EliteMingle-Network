import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { speakText, stopSpeaking, subscribeToTtsEvents } from '../../services/ttsService';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize from '../../utility/FontSize';

export interface PostTtsButtonProps {
  postId: string;
  authorName: string;
  content: string;
}

function SpeakerIcon({ size = 16, color = Colors.userProfilePurple }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H2V15H6L11 19V5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 12C17.004 13.3308 16.4774 14.6024 15.54 15.54"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StopIcon({ size = 16, color = Colors.adminErrorRed }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6H18V18H6V6Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PostTtsButton({
  postId,
  authorName,
  content,
}: PostTtsButtonProps) {
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);
  const utteranceId = `post_${postId}`;

  useEffect(() => {
    const unsub = subscribeToTtsEvents((event, id) => {
      if (id === utteranceId) {
        if (event === 'start') {
          setIsSpeakingThis(true);
        } else if (event === 'done' || event === 'error') {
          setIsSpeakingThis(false);
        }
      } else {
        setIsSpeakingThis(false);
      }
    });
    return () => unsub();
  }, [utteranceId]);

  const handleToggleSpeak = useCallback(async () => {
    if (isSpeakingThis) {
      await stopSpeaking();
      setIsSpeakingThis(false);
    } else {
      const textToRead = `${authorName || 'Member'} posted: ${content}`;
      setIsSpeakingThis(true);
      await speakText(textToRead, utteranceId);
    }
  }, [isSpeakingThis, authorName, content, utteranceId]);

  return (
    <TouchableOpacity
      style={[styles.btn, isSpeakingThis && styles.btnActive]}
      onPress={handleToggleSpeak}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={isSpeakingThis ? 'Stop reading post' : 'Read post aloud'}
    >
      {isSpeakingThis ? (
        <>
          <StopIcon size={UtilityMethods.wp(3.8)} />
          <Text style={styles.labelActive}>Stop</Text>
        </>
      ) : (
        <>
          <SpeakerIcon size={UtilityMethods.wp(3.8)} />
          <Text style={styles.label}>Listen</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    borderRadius: UtilityMethods.wp(3),
    paddingHorizontal: UtilityMethods.wp(2.5),
    paddingVertical: UtilityMethods.hp(0.6),
    marginVertical: UtilityMethods.hp(0.75),
  },
  btnActive: {
    backgroundColor: '#FEE2E2',
  },
  label: {
    marginLeft: UtilityMethods.wp(1.5),
    fontSize: FontSize.VALUE(12),
    fontWeight: '600',
    color: Colors.userProfilePurple,
  },
  labelActive: {
    marginLeft: UtilityMethods.wp(1.5),
    fontSize: FontSize.VALUE(12),
    fontWeight: '600',
    color: Colors.adminErrorRed,
  },
});
