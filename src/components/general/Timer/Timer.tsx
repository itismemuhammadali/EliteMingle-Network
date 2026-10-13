import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import { Colors } from '../../../constants/colors';
import Reload from '../../../assets/Icons/Reload.svg';
import TimerIcon from '../../../assets/Icons/Timer.svg';

interface TimerProps {
  secondsRemaining: number;
  formatTime: (seconds: number) => string;
}

export function Timer({ secondsRemaining, formatTime }: TimerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(secondsRemaining)}</Text>
      <View style={styles.expiresContainer}>
        <TimerIcon />
        <Text style={styles.expiresText}>Code expires in</Text>
      </View>
    </View>
  );
}

export interface ResendSectionProps {
  secondsRemaining: number;
  canResend: boolean;
  formatTime: (seconds: number) => string;
  onResend: () => void;
}

export function ResendSection({
  secondsRemaining,
  canResend,
  formatTime,
  onResend,
}: ResendSectionProps) {
  const content = (
    <View style={styles.resendRow}>
      <Reload />
      <Text style={[styles.resendText, canResend && styles.resendTextActive]}>
        {canResend ? 'Resend' : `Resend in ${formatTime(secondsRemaining)}`}
      </Text>
    </View>
  );

  return (
    <View style={styles.resendSection}>
      <Text style={styles.resendQuestion}>Didn't receive the code?</Text>
      {canResend ? (
        <TouchableOpacity onPress={onResend} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: UtilityMethods.hp(2),
  },
  timeText: {
    fontSize: FontSize.VALUE(24),
    fontWeight: '700',
    color: Colors.primaryPurple,
    marginBottom: UtilityMethods.hp(0.5),
  },
  expiresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(1.5),
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderTopWidth: 1.09,
    borderColor: '#E5E7EB',
    borderRadius: UtilityMethods.wp(3),
    paddingVertical: UtilityMethods.hp(0.8),
    paddingHorizontal: UtilityMethods.wp(4),
    marginTop: UtilityMethods.hp(1),
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(1),
  },
  expiresText: {
    fontSize: FontSize.VALUE(12),
    color: Colors.textGrey,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: UtilityMethods.hp(2),
  },
  resendQuestion: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.5),
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(1),
  },
  resendText: {
    fontSize: FontSize.BODY_TEXT,
    color: Colors.placeholderGrey,
  },
  resendTextActive: {
    color: Colors.primaryPurple,
    fontWeight: '600',
  },
});
