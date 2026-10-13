import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { VoiceMemoPlayer } from './VoiceMemoPlayer';
import { formatStorageUrl } from '../../services/postService';

const R = UtilityMethods.wp(3.75);

export interface MessageBubbleProps {
  text: string;
  time: string;
  isOutgoing: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
}

/** Incoming: left, white bubble + grey border. Outgoing: right, purple bubble, white text. */
function MessageBubbleComponent({
  text,
  time,
  isOutgoing,
  mediaUrl,
  mediaType,
}: MessageBubbleProps) {
  const [imgError, setImgError] = useState(false);

  const formattedMediaUrl = useMemo(
    () => (mediaUrl ? formatStorageUrl(mediaUrl) || mediaUrl : undefined),
    [mediaUrl],
  );

  const isVoiceMemo =
    mediaType === 'audio' ||
    (!!formattedMediaUrl &&
      (formattedMediaUrl.includes('.m4a') ||
        formattedMediaUrl.includes('.mp3') ||
        formattedMediaUrl.includes('.aac') ||
        text === 'Sent a voice memo'));

  const isPhoto =
    mediaType === 'image' ||
    (!!formattedMediaUrl && !isVoiceMemo);

  const showText =
    text &&
    text !== 'Sent a voice memo' &&
    text !== 'Sent a photo';

  const imageSource = useMemo(
    () => (formattedMediaUrl && !imgError ? { uri: formattedMediaUrl } : undefined),
    [formattedMediaUrl, imgError],
  );

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
      audioWrap: {
        width: UtilityMethods.wp(68),
      },
      imageBubble: {
        width: UtilityMethods.wp(55),
        height: UtilityMethods.wp(55),
        borderRadius: R,
        marginBottom: showText ? UtilityMethods.hp(0.8) : 0,
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
    <View style={[styles.wrap, isOutgoing ? styles.wrapOut : styles.wrapIn]}>
      {isVoiceMemo && (formattedMediaUrl || mediaUrl) ? (
        <View style={styles.audioWrap}>
          <VoiceMemoPlayer audioUri={formattedMediaUrl || mediaUrl!} showDelete={false} />
        </View>
      ) : showText || (isPhoto && imageSource && !imgError) ? (
        <View
          style={[
            styles.bubble,
            isOutgoing ? styles.bubbleOut : styles.bubbleIn,
          ]}
        >
          {isPhoto && imageSource && !imgError ? (
            <Image
              source={imageSource}
              style={styles.imageBubble}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : null}

          {showText ? (
            <Text
              style={[styles.body, isOutgoing ? styles.bodyOut : styles.bodyIn]}
            >
              {text}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Text style={[styles.time, isOutgoing ? styles.timeOut : styles.timeIn]}>
        {time}
      </Text>
    </View>
  );
}

export const MessageBubble = React.memo(
  MessageBubbleComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.text === nextProps.text &&
      prevProps.time === nextProps.time &&
      prevProps.isOutgoing === nextProps.isOutgoing &&
      prevProps.mediaUrl === nextProps.mediaUrl &&
      prevProps.mediaType === nextProps.mediaType
    );
  },
);
