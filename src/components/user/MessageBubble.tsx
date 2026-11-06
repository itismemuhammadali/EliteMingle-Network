import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
  senderName?: string;
  showSenderName?: boolean;
  replyTo?: {
    id?: string;
    text?: string;
    senderName?: string;
    mediaType?: 'image' | 'audio';
  };
  onPressImage?: (url: string) => void;
  onLongPress?: () => void;
}

/** Incoming: left, white bubble + grey border. Outgoing: right, purple bubble, white text. */
function MessageBubbleComponent({
  text,
  time,
  isOutgoing,
  mediaUrl,
  mediaType,
  senderName,
  showSenderName,
  replyTo,
  onPressImage,
  onLongPress,
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
      senderNameText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '700',
        color: Colors.chartMalePurple,
        marginBottom: UtilityMethods.hp(0.35),
        marginLeft: UtilityMethods.wp(1.5),
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
      replyQuoteBox: {
        flexDirection: 'row',
        borderRadius: UtilityMethods.wp(2),
        paddingVertical: UtilityMethods.hp(0.6),
        paddingHorizontal: UtilityMethods.wp(2),
        marginBottom: UtilityMethods.hp(0.8),
      },
      replyQuoteBoxIn: {
        backgroundColor: '#F3F4F6',
        borderLeftWidth: 3,
        borderLeftColor: Colors.chartMalePurple,
      },
      replyQuoteBoxOut: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderLeftWidth: 3,
        borderLeftColor: Colors.white,
      },
      replyQuoteSender: {
        fontSize: FontSize.VALUE(11),
        fontWeight: '700',
        marginBottom: UtilityMethods.hp(0.2),
      },
      replyQuoteSenderIn: {
        color: Colors.chartMalePurple,
      },
      replyQuoteSenderOut: {
        color: Colors.white,
      },
      replyQuoteText: {
        fontSize: FontSize.VALUE(12),
      },
      replyQuoteTextIn: {
        color: Colors.textDark,
      },
      replyQuoteTextOut: {
        color: 'rgba(255, 255, 255, 0.85)',
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
      {!isOutgoing && showSenderName && senderName ? (
        <Text style={styles.senderNameText} numberOfLines={1}>
          {senderName}
        </Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.88}
        onLongPress={onLongPress}
        delayLongPress={300}
      >
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
            {replyTo ? (
              <View
                style={[
                  styles.replyQuoteBox,
                  isOutgoing ? styles.replyQuoteBoxOut : styles.replyQuoteBoxIn,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.replyQuoteSender,
                      isOutgoing ? styles.replyQuoteSenderOut : styles.replyQuoteSenderIn,
                    ]}
                    numberOfLines={1}
                  >
                    {replyTo.senderName || 'Replied Message'}
                  </Text>
                  <Text
                    style={[
                      styles.replyQuoteText,
                      isOutgoing ? styles.replyQuoteTextOut : styles.replyQuoteTextIn,
                    ]}
                    numberOfLines={2}
                  >
                    {replyTo.mediaType === 'image'
                      ? '📷 Photo'
                      : replyTo.mediaType === 'audio'
                      ? '🎤 Voice memo'
                      : replyTo.text}
                  </Text>
                </View>
              </View>
            ) : null}

            {isPhoto && imageSource && !imgError ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPressImage && onPressImage(formattedMediaUrl || mediaUrl!)}
              >
                <Image
                  source={imageSource}
                  style={styles.imageBubble}
                  resizeMode="cover"
                  onError={() => setImgError(true)}
                />
              </TouchableOpacity>
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
      </TouchableOpacity>

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
      prevProps.mediaType === nextProps.mediaType &&
      prevProps.senderName === nextProps.senderName &&
      prevProps.showSenderName === nextProps.showSenderName &&
      prevProps.replyTo?.id === nextProps.replyTo?.id
    );
  },
);
