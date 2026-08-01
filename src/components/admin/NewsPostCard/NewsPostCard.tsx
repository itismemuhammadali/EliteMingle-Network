import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Video from 'react-native-video';
import {
  HeartIcon,
  CommentIcon,
  EyeIcon,
  WarnIcon,
  BlockIcon,
} from '../icons';
import ShareIcon from '../../../assets/Icons/share.svg';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export interface NewsPost {
  id: string;
  userId?: string;
  userName: string;
  status: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  hasWarning?: boolean;
  avatarColor: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: string;
}

interface NewsPostCardProps {
  post: NewsPost;
  onViewPress?: (post: NewsPost) => void;
  onWarnPress?: (post: NewsPost) => void;
  onBlockPress?: (post: NewsPost) => void;
  style?: any;
}

export function NewsPostCard({
  post,
  onViewPress,
  onWarnPress,
  onBlockPress,
  style,
}: NewsPostCardProps) {
  return (
    <View style={[post.hasWarning ? styles.cardWarningWrapper : undefined, style]}>
      <View style={[styles.card, post.hasWarning && styles.cardWarning]}>
      {post.hasWarning && (
        <View style={styles.warningBadge}>
          <WarnIcon size={UtilityMethods.wp(3)} color="#F59E0B" />
          <Text style={styles.warningBadgeText}>WARNING</Text>
        </View>
      )}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
          <Text style={styles.avatarText}>
            {(post.userName || '')
              .split(' ')
              .filter(Boolean)
              .map(n => n[0])
              .join('') || 'N'}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.meta}>
            {post.status} • {post.timeAgo}
          </Text>
        </View>
      </View>
      {post.content ? (
        <Text style={styles.content}>{post.content}</Text>
      ) : null}
      {post.mediaType === 'video' && post.videoUrl ? (
        <Video
          source={{ uri: post.videoUrl }}
          style={styles.postMedia}
          resizeMode="cover"
          controls
          paused
        />
      ) : post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.postMedia}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.engagementRow}>
        <View style={styles.engagementItem}>
          <HeartIcon size={UtilityMethods.wp(4.5)} color="#F44336" />
          <Text style={styles.engagementCount}>{post.likes}</Text>
        </View>
        <View style={styles.engagementItem}>
          <CommentIcon size={UtilityMethods.wp(4.5)} color="#4C7DFF" />
          <Text style={styles.engagementCount}>{post.comments}</Text>
        </View>
        <View style={styles.engagementItem}>
          <ShareIcon width={UtilityMethods.wp(4.5)} height={UtilityMethods.wp(4.5)} />
          <Text style={styles.engagementCount}>{post.shares}</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onViewPress?.(post)}
          activeOpacity={0.7}
        >
          <EyeIcon size={UtilityMethods.wp(4)} color="#333333" />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.warnButton}
          onPress={() => onWarnPress?.(post)}
          activeOpacity={0.7}
        >
          <WarnIcon size={UtilityMethods.wp(4)} color="#FFC107" />
          <Text style={styles.warnButtonText}>Warn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.blockButton}
          onPress={() => onBlockPress?.(post)}
          activeOpacity={0.7}
        >
          <BlockIcon size={UtilityMethods.wp(4)} color="#F44336" />
          <Text style={styles.blockButtonText}>Block</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(249, 250, 251, 1)',
    borderColor: 'rgba(229, 231, 235, 1)',
    borderWidth: 1,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    marginBottom: UtilityMethods.hp(2),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardWarningWrapper: {
    borderWidth: 1.09,
    borderColor: '#F59E0B',
    borderRadius: UtilityMethods.wp(3),
    marginBottom: UtilityMethods.hp(2),
  },
  cardWarning: {
    borderColor: 'transparent',
  },
  warningBadge: {
    position: 'absolute',
    top: UtilityMethods.hp(1.5),
    right: UtilityMethods.wp(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(1),
    backgroundColor: '#FEF3C7',
    paddingHorizontal: UtilityMethods.wp(2.5),
    paddingVertical: UtilityMethods.hp(0.5),
    borderRadius: UtilityMethods.wp(1.5),
    zIndex: 1,
  },
  warningBadgeText: {
    fontSize: FontSize.VALUE(11),
    fontWeight: '700',
    color: '#F59E0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(1.5),
  },
  avatar: {
    width: UtilityMethods.wp(10),
    height: UtilityMethods.wp(10),
    borderRadius: UtilityMethods.wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  avatarText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '700',
    color: Colors.white,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  meta: {
    fontSize: FontSize.VALUE(13),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  content: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.textDark,
    lineHeight: FontSize.VALUE(20),
    marginBottom: UtilityMethods.hp(1.5),
  },
  postMedia: {
    width: '100%',
    height: UtilityMethods.hp(20),
    borderRadius: UtilityMethods.wp(2),
    marginBottom: UtilityMethods.hp(1.5),
    backgroundColor: '#EFEFEF',
  },
  engagementRow: {
    flexDirection: 'row',
    marginBottom: UtilityMethods.hp(1.5),
    gap: UtilityMethods.wp(5),
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(1.5),
  },
  engagementCount: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: Colors.textDark,
  },
  actionRow: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(3),
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(1.5),
    backgroundColor: '#F0F0F0',
    paddingVertical: UtilityMethods.hp(1.2),
    borderRadius: UtilityMethods.wp(2),
  },
  viewButtonText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: '#333333',
  },
  warnButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(1.5),
    backgroundColor: Colors.adminWarningYellowLight,
    paddingVertical: UtilityMethods.hp(1.2),
    borderRadius: UtilityMethods.wp(2),
  },
  warnButtonText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.adminWarningYellow,
  },
  blockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(1.5),
    backgroundColor: Colors.adminErrorRedLight,
    paddingVertical: UtilityMethods.hp(1.2),
    borderRadius: UtilityMethods.wp(2),
  },
  blockButtonText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.adminErrorRed,
  },
});
