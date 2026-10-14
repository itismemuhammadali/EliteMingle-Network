import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import type { RootStackParamList } from '../../../navigation/MainStack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import type { FeedEngagementKind, FeedEngagementPerson } from '../../../constants/adminFeedEngagementMock';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);

function initials(name?: string | null): string {
  const safeName = (name || '').trim();
  if (!safeName) return '?';
  const p = safeName.split(/\s+/).filter(Boolean);
  if (p.length >= 2) {
    return (p[0][0] + p[1][0]).toUpperCase();
  }
  return (p[0]?.slice(0, 2) ?? '?').toUpperCase();
}

type Props = {
  postId: string;
  kind: FeedEngagementKind;
};

const TITLES: Record<FeedEngagementKind, string> = {
  likes: 'Likes',
  comments: 'Comments',
  shares: 'Shares',
};

const SUBTITLES: Record<FeedEngagementKind, string> = {
  likes: 'People who reacted to this post',
  comments: 'Comments on this post',
  shares: 'People who shared this post',
};

export function AdminFeedEngagementListBody({ postId, kind }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [livePost, setLivePost] = useState<any>(null);
  const [livePeople, setLivePeople] = useState<FeedEngagementPerson[]>([]);

  useEffect(() => {
    const unsubPost = firestore()
      .collection('posts')
      .doc(postId)
      .onSnapshot(
        doc => {
          if (doc && (typeof doc.exists === 'function' ? doc.exists() : doc.exists)) {
            const d = doc.data() || {};
            setLivePost({
              id: doc.id,
              content: d.text || d.content || '',
              likes: d.likesCount || 0,
              comments: d.commentsCount || 0,
              shares: d.sharesCount || 0,
            });
          }
        },
        () => {},
      );

    return () => unsubPost();
  }, [postId]);

  useEffect(() => {
    if (kind === 'comments') {
      const unsubComments = firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          snap => {
            if (snap && !snap.empty) {
              const mapped: FeedEngagementPerson[] = snap.docs.map(d => {
                const data = d.data();
                return {
                  rowId: d.id,
                  userId: data.authorUserId || data.userId || d.id,
                  name: data.authorName || data.userName || 'Member',
                  subtitle: 'Commented on post',
                  avatarUrl: data.authorAvatar || undefined,
                  avatarColor: Colors.adminStatsBlue,
                  detail: data.text || '',
                };
              });
              setLivePeople(mapped);
            }
          },
          () => {},
        );
      return () => unsubComments();
    } else if (kind === 'likes') {
      const unsubLikes = firestore()
        .collection('posts')
        .doc(postId)
        .collection('likes')
        .onSnapshot(
          snap => {
            if (snap && !snap.empty) {
              const mapped: FeedEngagementPerson[] = snap.docs.map(d => {
                const data = d.data();
                return {
                  rowId: d.id,
                  userId: data.userId || d.id,
                  name: data.userName || data.name || 'Member',
                  subtitle: 'Liked this post',
                  avatarUrl: data.avatarUrl || undefined,
                  avatarColor: Colors.adminStatsBlue,
                };
              });
              setLivePeople(mapped);
            }
          },
          () => {},
        );
      return () => unsubLikes();
    }
  }, [postId, kind]);

  const post = livePost;

  const people = livePeople;

  const onRowPress = useCallback(
    (userId: string) => {
      navigation.navigate('UserDetails', { userId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedEngagementPerson }) => (
      <TouchableOpacity
        style={styles.row}
        onPress={() => onRowPress(item.userId)}
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, open profile`}
      >
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.avatarImg}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.avatarFallback, { backgroundColor: item.avatarColor }]}
          >
            <Text style={styles.avatarInitials}>{initials(item.name)}</Text>
          </View>
        )}
        <View style={styles.textCol}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
          {item.detail ? (
            <Text style={styles.detail} numberOfLines={3}>
              {item.detail}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    ),
    [onRowPress],
  );

  const keyExtractor = useCallback((item: FeedEngagementPerson) => item.rowId, []);

  const countLabel = useMemo(() => {
    if (!post) {
      return '';
    }
    const n = kind === 'likes' ? post.likes : kind === 'comments' ? post.comments : post.shares;
    return `${n.toLocaleString()} total · sample below`;
  }, [post, kind]);

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.adminBackgroundGrey}
      style={styles.layoutFlex}
    >
      <ScreenHeader
        title={TITLES[kind]}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle} numberOfLines={3}>
          {post?.content
            ? `${post.content.slice(0, 100)}${
                post.content.length > 100 ? '…' : ''
              }`
            : 'Post'}
        </Text>
        <Text style={styles.summaryMeta}>{countLabel}</Text>
        <Text style={styles.summaryHint}>{SUBTITLES[kind]}</Text>
      </View>

      <FlatList
        style={styles.listFlex}
        data={people}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  layoutFlex: { flex: 1 },
  listFlex: { flex: 1 },
  summaryCard: {
    marginHorizontal: H_PAD,
    marginTop: UtilityMethods.hp(1.5),
    marginBottom: UtilityMethods.hp(1),
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
  },
  summaryTitle: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.textDark,
    lineHeight: FontSize.VALUE(20),
    marginBottom: UtilityMethods.hp(0.75),
  },
  summaryMeta: {
    fontSize: FontSize.VALUE(12),
    fontWeight: '600',
    color: Colors.adminStatsBlue,
    marginBottom: UtilityMethods.hp(0.35),
  },
  summaryHint: {
    fontSize: FontSize.VALUE(12),
    color: Colors.adminInactiveGrey,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: UtilityMethods.hp(4),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    paddingVertical: UtilityMethods.hp(1.5),
    paddingHorizontal: UtilityMethods.wp(4),
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
  },
  separator: {
    height: UtilityMethods.hp(1),
  },
  avatarImg: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.wp(12),
    borderRadius: UtilityMethods.wp(6),
    backgroundColor: Colors.inputBackground,
    marginRight: UtilityMethods.wp(3),
  },
  avatarFallback: {
    width: UtilityMethods.wp(12),
    height: UtilityMethods.wp(12),
    borderRadius: UtilityMethods.wp(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  avatarInitials: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '700',
    color: Colors.white,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  subtitle: {
    fontSize: FontSize.VALUE(13),
    color: Colors.adminInactiveGrey,
  },
  detail: {
    marginTop: UtilityMethods.hp(0.5),
    fontSize: FontSize.VALUE(14),
    color: Colors.textGrey,
    lineHeight: FontSize.VALUE(20),
  },
});
