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
  postShare?: {
    postId: string;
    authorName?: string;
    content?: string;
    mediaUrl?: string;
    mediaType?: string;
  };
  replyTo?: {
    id?: string;
    text?: string;
    senderName?: string;
    mediaType?: 'image' | 'audio';
  };
  onPressImage?: (url: string) => void;
  onPressPost?: (postId: string, authorName?: string) => void;
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
  postShare,
  replyTo,
  onPressImage,
  onPressPost,
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

  const displayableText = useMemo(() => {
    if (!text) return '';
    if (postShare) {
      const stripped = text
        .replace(/^Check out this post:\s*/i, '')
        .replace(/https:\/\/epm\.app\/post\/[^\s]+/g, '')
        .replace(/epm:\/\/post\/[^\s]+/g, '')
        .trim();
      return stripped;
    }
    return text !== 'Sent a voice memo' && text !== 'Sent a photo' ? text : '';
  }, [text, postShare]);

  const showText = !!displayableText;

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
      postShareCard: {
        borderRadius: UtilityMethods.wp(2.5),
        overflow: 'hidden',
        width: UtilityMethods.wp(62),
        borderWidth: 1,
        marginBottom: showText ? UtilityMethods.hp(0.8) : 0,
      },
      postShareCardIn: {
        backgroundColor: '#F8F9FA',
        borderColor: Colors.borderGrey,
      },
      postShareCardOut: {
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderColor: 'rgba(255, 255, 255, 0.35)',
      },
      postShareHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(0.8),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.06)',
      },
      postShareHeaderOut: {
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
      },
      postShareBadge: {
        backgroundColor: Colors.userProfilePurple,
        paddingHorizontal: UtilityMethods.wp(1.5),
        paddingVertical: UtilityMethods.hp(0.2),
        borderRadius: UtilityMethods.wp(1),
        marginRight: UtilityMethods.wp(1.5),
      },
      postShareBadgeOut: {
        backgroundColor: Colors.white,
      },
      postShareBadgeText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(9),
        fontWeight: '800',
        letterSpacing: 0.5,
      },
      postShareBadgeTextOut: {
        color: Colors.chartMalePurple,
      },
      postShareAuthor: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '700',
        flex: 1,
      },
      postShareAuthorIn: {
        color: Colors.textDark,
      },
      postShareAuthorOut: {
        color: Colors.white,
      },
      postShareMedia: {
        width: '100%',
        height: UtilityMethods.hp(16),
        backgroundColor: '#E5E7EB',
      },
      postShareBody: {
        paddingHorizontal: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(0.8),
      },
      postShareContent: {
        fontSize: FontSize.VALUE(13),
        lineHeight: FontSize.VALUE(18),
      },
      postShareContentIn: {
        color: Colors.textDark,
      },
      postShareContentOut: {
        color: 'rgba(255, 255, 255, 0.95)',
      },
      postShareFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(0.6),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.06)',
      },
      postShareFooterOut: {
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
      },
      postShareViewText: {
        fontSize: FontSize.VALUE(11),
        fontWeight: '700',
      },
      postShareViewTextIn: {
        color: Colors.chartMalePurple,
      },
      postShareViewTextOut: {
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
        ) : showText || postShare || (isPhoto && imageSource && !imgError) ? (
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

            {postShare ? (
              <TouchableOpacity
                style={[
                  styles.postShareCard,
                  isOutgoing ? styles.postShareCardOut : styles.postShareCardIn,
                ]}
                activeOpacity={0.88}
                onPress={() => onPressPost && onPressPost(postShare.postId, postShare.authorName)}
              >
                <View
                  style={[
                    styles.postShareHeader,
                    isOutgoing && styles.postShareHeaderOut,
                  ]}
                >
                  <View
                    style={[
                      styles.postShareBadge,
                      isOutgoing && styles.postShareBadgeOut,
                    ]}
                  >
                    <Text
                      style={[
                        styles.postShareBadgeText,
                        isOutgoing && styles.postShareBadgeTextOut,
                      ]}
                    >
                      POST
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.postShareAuthor,
                      isOutgoing ? styles.postShareAuthorOut : styles.postShareAuthorIn,
                    ]}
                    numberOfLines={1}
                  >
                    {postShare.authorName ? `${postShare.authorName}'s post` : 'Shared Post'}
                  </Text>
                </View>

                {postShare.mediaUrl ? (
                  <Image
                    source={{ uri: formatStorageUrl(postShare.mediaUrl) || postShare.mediaUrl }}
                    style={styles.postShareMedia}
                    resizeMode="cover"
                  />
                ) : null}

                {postShare.content ? (
                  <View style={styles.postShareBody}>
                    <Text
                      style={[
                        styles.postShareContent,
                        isOutgoing ? styles.postShareContentOut : styles.postShareContentIn,
                      ]}
                      numberOfLines={3}
                    >
                      {postShare.content}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.postShareFooter,
                    isOutgoing && styles.postShareFooterOut,
                  ]}
                >
                  <Text
                    style={[
                      styles.postShareViewText,
                      isOutgoing ? styles.postShareViewTextOut : styles.postShareViewTextIn,
                    ]}
                  >
                    View post ›
                  </Text>
                </View>
              </TouchableOpacity>
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
                {displayableText}
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
      prevProps.postShare?.postId === nextProps.postShare?.postId &&
      prevProps.replyTo?.id === nextProps.replyTo?.id
    );
  },
);
