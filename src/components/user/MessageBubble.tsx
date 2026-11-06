import React, { useMemo, useState, useRef } from 'react';
import {
  Animated,
  PanResponder,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { VoiceMemoPlayer } from './VoiceMemoPlayer';
import { SystemMessageBubble } from './SystemMessageBubble';
import { formatStorageUrl } from '../../services/postService';
import { getParticipantColor } from '../../utils/chatHelpers';
import { ReplyIcon } from '../../assets/Icons/ReplyIcon';

const R = UtilityMethods.wp(3.75);

export interface MessageBubbleProps {
  id?: string;
  text: string;
  time: string;
  isOutgoing: boolean;
  senderId?: string;
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
  parent_message_id?: string | null;
  quoted_sender_name?: string | null;
  quoted_snippet?: string | null;
  quoted_media_type?: 'image' | 'audio' | null;
  is_deleted?: boolean;
  is_edited?: boolean;
  is_system?: boolean;
  system_event?: string;
  isStarred?: boolean;
  mentions?: string[];
  onPressImage?: (url: string) => void;
  onPressPost?: (postId: string, authorName?: string) => void;
  onLongPress?: () => void;
  onPressQuoted?: (parentMessageId: string) => void;
  onSwipeReply?: () => void;
}

/** Incoming: left, white bubble + grey border. Outgoing: right, purple bubble, white text. */
function MessageBubbleComponent({
  id,
  text,
  time,
  isOutgoing,
  senderId,
  mediaUrl,
  mediaType,
  senderName,
  showSenderName,
  postShare,
  replyTo,
  parent_message_id,
  quoted_sender_name,
  quoted_snippet,
  quoted_media_type,
  is_deleted,
  is_edited,
  is_system,
  system_event,
  isStarred,
  mentions,
  onPressImage,
  onPressPost,
  onLongPress,
  onPressQuoted,
  onSwipeReply,
}: MessageBubbleProps) {
  const [imgError, setImgError] = useState(false);

  // Swipe-to-reply horizontal translation
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(() => {
    if (is_deleted || is_system || !onSwipeReply) {
      return PanResponder.create({
        onMoveShouldSetPanResponder: () => false,
      });
    }

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Active when horizontal right-swipe exceeds 15px and vertical movement is small
        return gestureState.dx > 15 && Math.abs(gestureState.dy) < 12;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          const clamped = Math.min(gestureState.dx * 0.75, 60);
          translateX.setValue(clamped);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 40 && onSwipeReply) {
          onSwipeReply();
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    });
  }, [is_deleted, is_system, onSwipeReply, translateX]);

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

  // Group participant color coding (Req 7)
  const participantColor = useMemo(
    () => getParticipantColor(senderId || senderName),
    [senderId, senderName],
  );

  // Unified quote payload resolution (clean, no emojis)
  const quoteId = parent_message_id || replyTo?.id;
  const quoteSender = quoted_sender_name || replyTo?.senderName;
  const rawQuoteText =
    quoted_snippet ||
    (quoted_media_type === 'image' || replyTo?.mediaType === 'image'
      ? 'Photo'
      : quoted_media_type === 'audio' || replyTo?.mediaType === 'audio'
      ? 'Voice memo'
      : replyTo?.text);
  const quoteText = rawQuoteText ? rawQuoteText.replace(/^[📷🎤]\s*/, '').trim() : '';
  const hasQuote = Boolean(!is_deleted && (quoteId || quoteSender || quoteText));

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
      swipeContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
      },
      swipeReplyIcon: {
        position: 'absolute',
        left: -32,
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.userProfilePurple,
      },
      swipeReplyIconText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(13),
        fontWeight: '700',
      },
      senderNameText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '700',
        color: participantColor,
        marginBottom: UtilityMethods.hp(0.35),
        marginLeft: UtilityMethods.wp(1.5),
      },
      bubble: {
        borderRadius: R,
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1.25),
        maxWidth: '100%',
      },
      bubbleWithQuote: {
        minWidth: UtilityMethods.wp(58),
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
      bubbleDeletedIn: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: UtilityMethods.hp(0.9),
      },
      bubbleDeletedOut: {
        backgroundColor: '#EDE9FE',
        borderWidth: 1,
        borderColor: '#DDD6FE',
        paddingVertical: UtilityMethods.hp(0.9),
      },
      deletedText: {
        fontSize: FontSize.VALUE(13),
        fontStyle: 'italic',
      },
      deletedTextIn: {
        color: '#94A3B8',
      },
      deletedTextOut: {
        color: Colors.userProfilePurple,
      },
      replyQuoteBox: {
        width: '100%',
        alignSelf: 'stretch',
        flexDirection: 'row',
        borderRadius: UtilityMethods.wp(2),
        paddingVertical: UtilityMethods.hp(0.8),
        paddingHorizontal: UtilityMethods.wp(2.8),
        marginBottom: UtilityMethods.hp(0.8),
        overflow: 'hidden',
      },
      replyQuoteBoxIn: {
        backgroundColor: '#F1F5F9',
        borderLeftWidth: 3.5,
        borderLeftColor: Colors.chartMalePurple,
      },
      replyQuoteBoxOut: {
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
        borderLeftWidth: 3.5,
        borderLeftColor: Colors.white,
      },
      replyQuoteContent: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
      },
      replyQuoteSender: {
        fontSize: FontSize.VALUE(12),
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
        fontSize: FontSize.VALUE(12.5),
        lineHeight: FontSize.VALUE(17),
      },
      replyQuoteTextIn: {
        color: Colors.textDark,
      },
      replyQuoteTextOut: {
        color: 'rgba(255, 255, 255, 0.95)',
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
      mentionIn: {
        fontWeight: '700',
        color: Colors.chartMalePurple,
      },
      mentionOut: {
        fontWeight: '800',
        color: '#FEF08A',
        textDecorationLine: 'underline',
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
      timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: UtilityMethods.hp(0.45),
      },
      timeRowIn: {
        alignSelf: 'flex-start',
      },
      timeRowOut: {
        alignSelf: 'flex-end',
      },
      time: {
        fontSize: FontSize.VALUE(11),
        color: Colors.placeholderGrey,
      },
      editedLabel: {
        fontSize: FontSize.VALUE(10.5),
        fontStyle: 'italic',
        color: Colors.placeholderGrey,
        marginRight: UtilityMethods.wp(1),
      },
      starIcon: {
        fontSize: FontSize.VALUE(10.5),
        marginRight: UtilityMethods.wp(1),
      },
    }),
  );

  // Render System / Event Messages (Req 6)
  if (is_system) {
    return <SystemMessageBubble text={text} time={time} event={system_event} />;
  }

  // Helper to highlight mentions in text (Req 4)
  const renderFormattedText = (rawText: string) => {
    // Regex matching @username or @Full Name tokens
    const mentionRegex = /(@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?)/g;
    const parts = rawText.split(mentionRegex);

    return (
      <Text style={[styles.body, isOutgoing ? styles.bodyOut : styles.bodyIn]}>
        {parts.map((part, index) => {
          if (part.startsWith('@')) {
            return (
              <Text
                key={index}
                style={isOutgoing ? styles.mentionOut : styles.mentionIn}
              >
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const replyIconOpacity = translateX.interpolate({
    inputRange: [0, 10, 35],
    outputRange: [0, 0.4, 1],
    extrapolate: 'clamp',
  });
  const replyIconScale = translateX.interpolate({
    inputRange: [0, 10, 35],
    outputRange: [0.3, 0.6, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.wrap, isOutgoing ? styles.wrapOut : styles.wrapIn]}>
      {/* Group Participant Name (Req 7) */}
      {!isOutgoing && showSenderName && senderName ? (
        <Text style={styles.senderNameText} numberOfLines={1}>
          {senderName}
        </Text>
      ) : null}

      {/* Swipeable & Touchable Bubble Container */}
      <View style={styles.swipeContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.swipeReplyIcon,
            {
              opacity: replyIconOpacity,
              transform: [{ scale: replyIconScale }],
            },
          ]}
          pointerEvents="none"
        >
          <ReplyIcon size={14} color={Colors.white} />
        </Animated.View>

        <Animated.View style={{ transform: [{ translateX }] }}>
          <TouchableOpacity
            activeOpacity={0.88}
            onLongPress={is_deleted ? undefined : onLongPress}
            delayLongPress={300}
          >
            {/* Deleted Message Placeholder (Req 3) */}
            {is_deleted ? (
              <View
                style={[
                  styles.bubble,
                  isOutgoing ? styles.bubbleDeletedOut : styles.bubbleDeletedIn,
                ]}
              >
                <Text
                  style={[
                    styles.deletedText,
                    isOutgoing ? styles.deletedTextOut : styles.deletedTextIn,
                  ]}
                >
                  This message was deleted
                </Text>
              </View>
            ) : isVoiceMemo && (formattedMediaUrl || mediaUrl) ? (
              <View style={styles.audioWrap}>
                {hasQuote ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => quoteId && onPressQuoted && onPressQuoted(quoteId)}
                    style={[
                      styles.replyQuoteBox,
                      isOutgoing ? styles.replyQuoteBoxOut : styles.replyQuoteBoxIn,
                    ]}
                  >
                    <View style={styles.replyQuoteContent}>
                      <Text
                        style={[
                          styles.replyQuoteSender,
                          isOutgoing ? styles.replyQuoteSenderOut : styles.replyQuoteSenderIn,
                        ]}
                        numberOfLines={1}
                      >
                        {quoteSender || 'Message'}
                      </Text>
                      <Text
                        style={[
                          styles.replyQuoteText,
                          isOutgoing ? styles.replyQuoteTextOut : styles.replyQuoteTextIn,
                        ]}
                        numberOfLines={2}
                      >
                        {quoteText || 'Message'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
                <VoiceMemoPlayer audioUri={formattedMediaUrl || mediaUrl!} showDelete={false} />
              </View>
            ) : showText || postShare || (isPhoto && imageSource && !imgError) ? (
              <View
                style={[
                  styles.bubble,
                  isOutgoing ? styles.bubbleOut : styles.bubbleIn,
                  hasQuote && styles.bubbleWithQuote,
                ]}
              >
                {/* Quoted block inside message bubble (Req 1) */}
                {hasQuote ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => quoteId && onPressQuoted && onPressQuoted(quoteId)}
                    style={[
                      styles.replyQuoteBox,
                      isOutgoing ? styles.replyQuoteBoxOut : styles.replyQuoteBoxIn,
                    ]}
                  >
                    <View style={styles.replyQuoteContent}>
                      <Text
                        style={[
                          styles.replyQuoteSender,
                          isOutgoing ? styles.replyQuoteSenderOut : styles.replyQuoteSenderIn,
                        ]}
                        numberOfLines={1}
                      >
                        {quoteSender || 'Message'}
                      </Text>
                      <Text
                        style={[
                          styles.replyQuoteText,
                          isOutgoing ? styles.replyQuoteTextOut : styles.replyQuoteTextIn,
                        ]}
                        numberOfLines={2}
                      >
                        {quoteText || 'Message'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                {/* Shared Post Card */}
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

                {/* Photo Attachment */}
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

                {/* Text Content with Mention Highlighting */}
                {showText ? renderFormattedText(displayableText) : null}
              </View>
            ) : null}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Timestamp & Edited indicator */}
      <View style={[styles.timeRow, isOutgoing ? styles.timeRowOut : styles.timeRowIn]}>
        {is_edited ? <Text style={styles.editedLabel}>edited</Text> : null}
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

export const MessageBubble = React.memo(
  MessageBubbleComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.text === nextProps.text &&
      prevProps.time === nextProps.time &&
      prevProps.isOutgoing === nextProps.isOutgoing &&
      prevProps.mediaUrl === nextProps.mediaUrl &&
      prevProps.mediaType === nextProps.mediaType &&
      prevProps.senderName === nextProps.senderName &&
      prevProps.showSenderName === nextProps.showSenderName &&
      prevProps.is_deleted === nextProps.is_deleted &&
      prevProps.is_edited === nextProps.is_edited &&
      prevProps.is_system === nextProps.is_system &&
      prevProps.isStarred === nextProps.isStarred &&
      prevProps.parent_message_id === nextProps.parent_message_id &&
      prevProps.quoted_snippet === nextProps.quoted_snippet &&
      prevProps.postShare?.postId === nextProps.postShare?.postId &&
      prevProps.replyTo?.id === nextProps.replyTo?.id &&
      prevProps.replyTo?.text === nextProps.replyTo?.text
    );
  },
);
