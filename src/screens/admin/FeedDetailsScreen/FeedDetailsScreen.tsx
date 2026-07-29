import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/MainStack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import Svg, { Path } from 'react-native-svg';
import {
  CommentIcon,
  WarnIcon,
  BlockIcon,
  PersonIcon,
} from '../../../components/admin/icons';
import ShareIconSvg from '../../../assets/Icons/share.svg';

const FilledHeartIcon = ({ size = 24, color = '#F44336' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
import { MOCK_NEWS_POSTS } from '../../../constants/mockData';
import { ConfirmationModal } from '../../../components/admin/modal';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

export function FeedDetailsScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'FeedDetails'>
    >();
  const route = useRoute<RouteProp<RootStackParamList, 'FeedDetails'>>();
  const insets = useSafeAreaInsets();
  const { postId } = route.params;

  const post = MOCK_NEWS_POSTS.find(p => p.id === postId);
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  if (!post) {
    return null;
  }

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={false}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.adminBackgroundGrey}
      style={{ backgroundColor: Colors.adminBackgroundGrey }}
    >
      <View
        style={[
          styles.headerBg,
          { paddingTop: insets.top * 0.4 },
        ]}
      >
        <ScreenHeader
          title="Post Details"
          onBackPress={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
      >
        <View style={styles.card}>
          <View style={styles.userRow}>
            <View
              style={[
                styles.avatar,
                styles.avatarRing,
                { backgroundColor: post.avatarColor },
              ]}
            >
              <Text style={styles.avatarText}>
                {(post?.userName || '')
                  .split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .join('') || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{post.userName}</Text>
              <Text style={styles.meta}>
                {post.status} • {post.timeAgo}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() =>
                post.userId &&
                navigation.navigate('UserDetails', { userId: post.userId })
              }
              activeOpacity={0.7}
            >
              <PersonIcon
                size={UtilityMethods.wp(4)}
                color={Colors.adminStatsBlue}
              />
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.content}>{post.content}</Text>

          <View style={styles.engagementContainer}>
            <TouchableOpacity
              style={styles.engagementButton}
              onPress={() =>
                navigation.navigate('FeedPostLikers', { postId: post.id })
              }
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel={`View ${post.likes} likes`}
            >
              <View style={styles.interactBox}>
                <FilledHeartIcon size={UtilityMethods.wp(5)} color="#F44336" />
                <Text style={styles.engagementNumber}>{post.likes}</Text>
              </View>
              <Text style={styles.engagementLabel}>Likes</Text>
            </TouchableOpacity>
            <View style={styles.engagementDivider} />

            <TouchableOpacity
              style={styles.engagementButton}
              onPress={() =>
                navigation.navigate('FeedPostCommenters', { postId: post.id })
              }
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel={`View ${post.comments} comments`}
            >
              <View style={styles.interactBox}>
                <CommentIcon size={UtilityMethods.wp(5)} color="#4C7DFF" />
                <Text style={styles.engagementNumber}>{post.comments}</Text>
              </View>
              <Text style={styles.engagementLabel}>Comments</Text>
            </TouchableOpacity>
            <View style={styles.engagementDivider} />

            <TouchableOpacity
              style={styles.engagementButton}
              onPress={() =>
                navigation.navigate('FeedPostSharers', { postId: post.id })
              }
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel={`View ${post.shares} shares`}
            >
              <View style={styles.interactBox}>
                <ShareIconSvg width={UtilityMethods.wp(5)} height={UtilityMethods.wp(5)} />
                <Text style={styles.engagementNumber}>{post.shares}</Text>
              </View>
              <Text style={styles.engagementLabel}>Shares</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.warnButton}
              onPress={() => setShowWarnModal(true)}
              activeOpacity={0.7}
            >
              <WarnIcon size={UtilityMethods.wp(5)} color={Colors.white} />
              <Text style={styles.actionButtonText}>Send Warning</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blockButton}
              onPress={() => setShowBlockModal(true)}
              activeOpacity={0.7}
            >
              <BlockIcon size={UtilityMethods.wp(5)} color={Colors.white} />
              <Text style={styles.actionButtonText}>Block Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showWarnModal}
        type="sendWarning"
        entityName={post.userName}
        onConfirm={() => setShowWarnModal(false)}
        onCancel={() => setShowWarnModal(false)}
      />
      <ConfirmationModal
        visible={showBlockModal}
        type="blockPost"
        entityName={post.userName}
        onConfirm={() => setShowBlockModal(false)}
        onCancel={() => setShowBlockModal(false)}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  headerBg: {
    backgroundColor: Colors.white,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UtilityMethods.hp(2),
  },
  avatar: {
    width: UtilityMethods.wp(14),
    height: UtilityMethods.wp(14),
    borderRadius: UtilityMethods.wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: Colors.primaryPurple,
  },
  avatarText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.25),
  },
  meta: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UtilityMethods.wp(1.5),
    backgroundColor: 'rgba(76, 125, 255, 0.1)',
    paddingHorizontal: UtilityMethods.wp(3),
    paddingVertical: UtilityMethods.hp(1),
    borderRadius: UtilityMethods.wp(2),
  },
  profileButtonText: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.adminStatsBlue,
  },
  content: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '400',
    color: Colors.textDark,
    lineHeight: FontSize.VALUE(22),
    marginBottom: UtilityMethods.hp(2),
  },
  engagementContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: UtilityMethods.wp(2),
    paddingVertical: UtilityMethods.hp(2),
    marginBottom: UtilityMethods.hp(2),
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  engagementButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: UtilityMethods.hp(0.5),
    borderRadius: UtilityMethods.wp(1.5),
  },
  engagementNumber: {
    fontSize: FontSize.VALUE(18),
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: UtilityMethods.hp(0.5),
  },
  engagementLabel: {
    fontSize: FontSize.VALUE(12),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
    marginTop: UtilityMethods.hp(0.25),
  },
  engagementDivider: {
    width: 1,
    height: UtilityMethods.hp(4),
    backgroundColor: 'rgba(229, 231, 235, 1)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(3),
  },
  warnButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    backgroundColor: Colors.adminWarningYellow,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
  },
  blockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    backgroundColor: Colors.adminErrorRed,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
  },
  actionButtonText: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '600',
    color: Colors.white,
  },
  interactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(1),
  },
});
