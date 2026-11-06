import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

export interface SystemMessageBubbleProps {
  text: string;
  time?: string;
  event?: string;
}

export function SystemMessageBubble({ text, time }: SystemMessageBubbleProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: UtilityMethods.hp(1),
        paddingHorizontal: UtilityMethods.wp(6),
      },
      pill: {
        backgroundColor: 'rgba(15, 23, 42, 0.06)',
        borderRadius: UtilityMethods.wp(4),
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(0.55),
        maxWidth: '88%',
      },
      text: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '500',
        color: '#64748B',
        textAlign: 'center',
      },
      timeText: {
        fontSize: FontSize.VALUE(10),
        color: '#94A3B8',
        marginTop: UtilityMethods.hp(0.2),
        textAlign: 'center',
      },
    }),
  );

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text} numberOfLines={3}>
          {text}
        </Text>
        {time ? <Text style={styles.timeText}>{time}</Text> : null}
      </View>
    </View>
  );
}

