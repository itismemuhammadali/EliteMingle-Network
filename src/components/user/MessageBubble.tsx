import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const R = UtilityMethods.wp(3.75);

export interface MessageBubbleProps {
  text: string;
  time: string;
  isOutgoing: boolean;
}

/** Incoming: left, white bubble + grey border. Outgoing: right, purple bubble, white text. */
export function MessageBubble({ text, time, isOutgoing }: MessageBubbleProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      wrap: {
        marginBottom: UtilityMethods.hp(1.5),
        maxWidth: '88%',
      },
      wrapIn: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
      },
      wrapOut: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
      },
      bubble: {
        borderRadius: R,
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1.25),
        maxWidth: '100%',
      },
      bubbleIn: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.borderGrey,
      },
      bubbleOut: {
        backgroundColor: Colors.chartMalePurple,
      },
      body: {
        fontSize: FontSize.VALUE(14),
        lineHeight: FontSize.VALUE(20),
      },
      bodyIn: {
        color: Colors.textDark,
      },
      bodyOut: {
        color: Colors.white,
      },
      time: {
        marginTop: UtilityMethods.hp(0.45),
        fontSize: FontSize.VALUE(11),
        color: Colors.placeholderGrey,
      },
      timeIn: {
        alignSelf: 'flex-start',
      },
      timeOut: {
        alignSelf: 'flex-end',
      },
    }),
  );

  return (
    <View
      style={[styles.wrap, isOutgoing ? styles.wrapOut : styles.wrapIn]}
    >
      <View
        style={[
          styles.bubble,
          isOutgoing ? styles.bubbleOut : styles.bubbleIn,
        ]}
      >
        <Text
          style={[styles.body, isOutgoing ? styles.bodyOut : styles.bodyIn]}
        >
          {text}
        </Text>
      </View>
      <Text style={[styles.time, isOutgoing ? styles.timeOut : styles.timeIn]}>
        {time}
      </Text>
    </View>
  );
}
