import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NewsPostCard, type NewsPost } from '../NewsPostCard';
import { ConfirmationModal } from '../modal';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

interface NewsFeedSectionProps {
  posts: NewsPost[];
  onViewAllPress?: () => void;
  onViewPress?: (post: NewsPost) => void;
}

export function NewsFeedSection({
  posts,
  onViewAllPress,
  onViewPress,
}: NewsFeedSectionProps) {
  const [warnModalPost, setWarnModalPost] = useState<NewsPost | null>(null);
  const [blockModalPost, setBlockModalPost] = useState<NewsPost | null>(null);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>News Feed</Text>
          <Text style={styles.subtitle}>
            Recent user posts and activity
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAllPress}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllButtonText}>View All</Text>
        </TouchableOpacity>
      </View>

      {posts.map((post, index) => (
        <NewsPostCard
          key={post.id}
          post={post}
          onViewPress={onViewPress}
          onWarnPress={p => setWarnModalPost(p)}
          onBlockPress={p => setBlockModalPost(p)}
          style={index === posts.length - 1 ? { marginBottom: 0 } : undefined}
        />
      ))}

      <ConfirmationModal
        visible={!!warnModalPost}
        type="sendWarning"
        entityName={warnModalPost?.userName ?? ''}
        onConfirm={() => setWarnModalPost(null)}
        onCancel={() => setWarnModalPost(null)}
      />
      <ConfirmationModal
        visible={!!blockModalPost}
        type="blockPost"
        entityName={blockModalPost?.userName ?? ''}
        onConfirm={() => setBlockModalPost(null)}
        onCancel={() => setBlockModalPost(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    paddingTop: UtilityMethods.wp(4),
    paddingHorizontal: UtilityMethods.wp(4),
    paddingBottom: UtilityMethods.wp(4),
    marginHorizontal: UtilityMethods.wp(5),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: UtilityMethods.hp(0.5),
    marginBottom: UtilityMethods.hp(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: UtilityMethods.hp(2),
  },
  title: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.5),
  },
  subtitle: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  viewAllButton: {
    backgroundColor: 'rgba(76, 125, 255, 0.1)',
    paddingHorizontal: UtilityMethods.wp(3.5),
    paddingVertical: UtilityMethods.hp(1),
    borderRadius: UtilityMethods.wp(2),
  },
  viewAllButtonText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.adminStatsBlue,
  },
});
