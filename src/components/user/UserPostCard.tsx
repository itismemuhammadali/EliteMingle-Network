import React, { useEffect, useMemo, useState } from 'react';
import auth from '@react-native-firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserFeedPost } from '../../constants/userFeedData';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import PostComment from '../../assets/Icons/BlackComment.svg';
import PostShare from '../../assets/Icons/blackShare.svg';
import PostThumbUp from '../../assets/Icons/blackLike.svg';
import BlackLikeIcon from '../../assets/Icons/blackLike.svg';
import PurpleLikeIcon from '../../assets/Icons/purpleLike.svg';
import DotsVertical from '../../assets/Icons/profile/dotsVertical.svg';
import { PostCardOverflowMenu } from './PostCardOverflowMenu';
import { PostCardShareMenu } from './PostCardShareMenu';
import { useAppSelector } from '../../redux/hooks';
import {
  toggleLike as toggleLikeService,
  subscribeToPostLike,
} from '../../services/postService';
import type { UserStackParamList } from '../../navigation/User/types';

const ACTION_ICON = UtilityMethods.wp(4.5);
const STAT_ICON = UtilityMethods.wp(3.5);
const LIKE_RED = Colors.chartFemaleRed;
const ACTION_MUTED = Colors.userGroupMemberMeta;

function PostHeartGlyph({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ThumbUpGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 9V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3L9 12V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7762 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3826 9.90629 21.1939 9.68751C21.0052 9.46873 20.7726 9.29393 20.512 9.17505C20.2515 9.05618 19.9694 8.99603 19.684 9H14Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12H6C5.46957 12 4.96086 12.2107 4.58579 12.5858C4.21071 12.9609 4 13.4696 4 14V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H9"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface UserPostCardProps {
  post: UserFeedPost;
  /** When true, horizontal margins are omitted (parent provides padding). */
  embedded?: boolean;
}

function initials(name?: string | null): string {
  const safeName = (name || '').trim();
  if (!safeName) return 'U';
  return safeName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
}

export function UserPostCard({ post, embedded }: UserPostCardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const simplifiedUi = useAppSelector(s => s.simplifiedUi);
  const [liked, setLiked] = useState(false);
  const [reactionCount, setReactionCount] = useState(post.reactions);
  const currentUserId = auth().currentUser?.uid || 'dev_user_123';

  // Keep the displayed count in sync with the authoritative value from Firestore.
  useEffect(() => {
    setReactionCount(post.reactions);
  }, [post.reactions]);

  // Track (in real-time) whether the current user has liked this post.
  useEffect(() => {
    const unsubscribe = subscribeToPostLike(post.id, currentUserId, setLiked);
    return () => unsubscribe();
  }, [post.id, currentUserId]);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isVideo = post.mediaType === 'video' || !!post.videoUrl;
  const mediaUrl = post.videoUrl || post.mediaUrl || post.imageUrl || post.localUri;
  const hasValidImage = !isVideo && !!mediaUrl && !imgError;
  const hasValidVideo = isVideo && !!mediaUrl && !imgError;

  const heartColor = useMemo(
    () => (liked ? LIKE_RED : ACTION_MUTED),
    [liked],
  );

  const statHeartColor = useMemo(
    () => (liked ? LIKE_RED : Colors.placeholderGrey),
    [liked],
  );

  const openAuthorProfile = () => {
    navigation.navigate('OtherUserProfile', { userId: post.authorUserId });
  };

  const openComments = () => {
    navigation.navigate('PostComments', {
      postId: post.id,
      authorName: post.userName,
    });
  };

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        padding: UtilityMethods.wp(4),
        marginHorizontal: UtilityMethods.wp(5),
        marginBottom: UtilityMethods.hp(2),
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
      cardEmbedded: {
        marginHorizontal: 0,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1.25),
      },
      avatar: {
        width: UtilityMethods.wp(11),
        height: UtilityMethods.wp(11),
        borderRadius: UtilityMethods.wp(5.5),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      avatarImage: {
        width: UtilityMethods.wp(11),
        height: UtilityMethods.wp(11),
        borderRadius: UtilityMethods.wp(5.5),
        marginRight: UtilityMethods.wp(3),
        backgroundColor: Colors.inputBackground,
      },
      avatarText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.VALUE(14),
      },
      headerText: {
        flex: 1,
      },
      userName: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
      feelingText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '400',
        color: Colors.textGrey,
      },
      meta: {
        marginTop: UtilityMethods.hp(0.25),
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
      },
      content: {
        fontSize: FontSize.VALUE(14),
        lineHeight: FontSize.VALUE(20),
        color: Colors.textGrey,
        marginBottom: UtilityMethods.hp(1.25),
      },
      postImage: {
        width: '100%',
        height: UtilityMethods.hp(22),
        borderRadius: UtilityMethods.wp(2),
        marginBottom: UtilityMethods.hp(1.25),
        backgroundColor: 'transparent',
      },
      statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: UtilityMethods.hp(1),
      },
      reactionCluster: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      reactionIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: UtilityMethods.wp(1),
      },
      thumbOverlap: {
        marginLeft: -UtilityMethods.wp(1.5),
      },
      statMuted: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
      },
      divider: {
        height: 1,
        backgroundColor: Colors.borderGrey,
        marginBottom: UtilityMethods.hp(1),
      },
      actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      },
      actionText: {
        marginLeft: UtilityMethods.wp(1.5),
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: Colors.textGrey,
      },
      actionTextActive: {
        color: LIKE_RED,
      },
      simplifiedActions: {
        gap: UtilityMethods.hp(1),
      },
      simpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        borderRadius: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(1.2),
        paddingHorizontal: UtilityMethods.wp(3.5),
      },
      simpBtnLikeActive: {
        borderColor: LIKE_RED,
      },
      simpBtnIcon: {
        marginRight: UtilityMethods.wp(2.5),
      },
      simpBtnText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: ACTION_MUTED,
      },
      simpBtnTextLikeActive: {
        color: LIKE_RED,
      },
    }),
  );

  const toggleLike = () => {
    const next = !liked;
    // Optimistic UI — reconciled by the Firestore snapshots above.
    setLiked(next);
    setReactionCount(c => (next ? c + 1 : Math.max(0, c - 1)));
    toggleLikeService(post.id, currentUserId).catch(err => {
      console.error('Failed to toggle like:', err);
      // Revert optimistic state on failure.
      setLiked(!next);
      setReactionCount(c => (next ? Math.max(0, c - 1) : c + 1));
    });
  };

  const simpIcon = UtilityMethods.wp(5);

  return (
    <>
      <View style={[styles.card, embedded && styles.cardEmbedded]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openAuthorProfile}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`${post.userName} profile`}
          >
            {post.avatarUrl ? (
              <Image
                source={{ uri: post.avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
                <Text style={styles.avatarText}>{initials(post.userName)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.headerText}>
            <TouchableOpacity
              onPress={openAuthorProfile}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${post.userName} profile`}
            >
              <Text style={styles.userName}>
                {post.userName}
                {post.feeling ? (
                  <Text style={styles.feelingText}>
                    {` is feeling ${post.feeling}`}
                  </Text>
                ) : null}
              </Text>
            </TouchableOpacity>
            <Text style={styles.meta}>
              {post.userRole} • {post.timeAgo}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setOverflowOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Post menu"
          >
            <DotsVertical width={UtilityMethods.wp(5)} height={UtilityMethods.wp(5)} />
          </TouchableOpacity>
        </View>

        <Text style={styles.content}>{post.content}</Text>

        {hasValidVideo ? (
          <Video
            source={{ uri: mediaUrl }}
            style={styles.postImage}
            resizeMode="cover"
            controls
            paused
            repeat={false}
            onError={(e) => {
              console.log('[UserPostCard Video Error]:', mediaUrl, e);
              setImgError(true);
            }}
          />
        ) : hasValidImage ? (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.postImage}
            resizeMode="cover"
            onError={(e) => {
              console.log('[UserPostCard Image Error]:', mediaUrl, e.nativeEvent);
              setImgError(true);
            }}
          />
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.reactionCluster}>
            <View style={styles.reactionIcons}>
              <PostHeartGlyph size={STAT_ICON} color={statHeartColor} />
              <View style={styles.thumbOverlap}>
                <PostThumbUp width={STAT_ICON} height={STAT_ICON} />
              </View>
            </View>
            <Text style={styles.statMuted}>{reactionCount}</Text>
          </View>
          <Text style={styles.statMuted}>{post.comments} comments</Text>
          <Text style={styles.statMuted}>{post.shares} shares</Text>
        </View>

        <View style={styles.divider} />

        {simplifiedUi ? (
          <View style={styles.simplifiedActions}>
            <TouchableOpacity
              style={[styles.simpBtn, liked && styles.simpBtnLikeActive]}
              onPress={toggleLike}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: liked }}
              accessibilityLabel="Like"
            >
              <View style={styles.simpBtnIcon}>
                <ThumbUpGlyph
                  size={simpIcon}
                  color={liked ? LIKE_RED : ACTION_MUTED}
                />
              </View>
              <Text
                style={[
                  styles.simpBtnText,
                  liked && styles.simpBtnTextLikeActive,
                ]}
              >
                Like
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.simpBtn}
              activeOpacity={0.75}
              onPress={openComments}
              accessibilityRole="button"
              accessibilityLabel="Comment"
            >
              <View style={styles.simpBtnIcon}>
                <PostComment width={simpIcon} height={simpIcon} />
              </View>
              <Text style={styles.simpBtnText}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.simpBtn}
              activeOpacity={0.75}
              onPress={() => setShareOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Share"
            >
              <View style={styles.simpBtnIcon}>
                <PostShare width={simpIcon} height={simpIcon} />
              </View>
              <Text style={styles.simpBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={toggleLike}
              activeOpacity={0.7}
            >
              {liked ? (
                <PurpleLikeIcon width={ACTION_ICON} height={ACTION_ICON} />
              ) : (
                <BlackLikeIcon width={ACTION_ICON} height={ACTION_ICON} />
              )}
              <Text style={styles.actionText}>
                Like
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={openComments}
            >
              <PostComment width={ACTION_ICON} height={ACTION_ICON} />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => setShareOpen(true)}
            >
              <PostShare width={ACTION_ICON} height={ACTION_ICON} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <PostCardOverflowMenu
        visible={overflowOpen}
        onClose={() => setOverflowOpen(false)}
        postId={post.id}
        authorId={post.authorUserId}
        authorName={post.userName}
      />
      <PostCardShareMenu
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        postId={post.id}
      />
    </>
  );
}
