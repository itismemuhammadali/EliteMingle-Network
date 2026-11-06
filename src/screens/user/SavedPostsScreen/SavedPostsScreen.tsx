import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import { UserPostCard } from '../../../components/user';
import { Colors } from '../../../constants/colors';
import { subscribeToSavedPosts } from '../../../services/postService';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);

export function SavedPostsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth().currentUser?.uid || '';

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToSavedPosts(currentUserId, posts => {
      setSavedPosts(posts);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUserId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: Colors.userFeedBackground,
      },
      navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(4),
        paddingBottom: UtilityMethods.hp(1.5),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      backBtn: {
        padding: UtilityMethods.wp(1),
        marginRight: UtilityMethods.wp(3),
      },
      navTitleWrap: {
        flex: 1,
      },
      navTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      navSubtitle: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
        marginTop: UtilityMethods.hp(0.2),
      },
      listContent: {
        paddingTop: UtilityMethods.hp(1.5),
        paddingBottom: UtilityMethods.hp(4),
      },
      loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: UtilityMethods.hp(10),
      },
      emptyCard: {
        marginHorizontal: H_PAD,
        marginTop: UtilityMethods.hp(6),
        padding: UtilityMethods.wp(8),
        borderRadius: UtilityMethods.wp(4),
        backgroundColor: Colors.white,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderGrey,
      },
      emptyIcon: {
        fontSize: UtilityMethods.wp(12),
        marginBottom: UtilityMethods.hp(1.5),
      },
      emptyTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.8),
      },
      emptySubtitle: {
        fontSize: FontSize.VALUE(14),
        lineHeight: FontSize.VALUE(20),
        color: Colors.textGrey,
        textAlign: 'center',
      },
    }),
  );

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.userFeedBackground}
      style={styles.container}
    >
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeftIcon
            width={UtilityMethods.wp(5.5)}
            height={UtilityMethods.wp(5.5)}
          />
        </TouchableOpacity>
        <View style={styles.navTitleWrap}>
          <Text style={styles.navTitle} numberOfLines={1}>
            Saved Posts
          </Text>
          <Text style={styles.navSubtitle}>
            {loading
              ? 'Loading saved posts...'
              : `${savedPosts.length} post${savedPosts.length === 1 ? '' : 's'} saved`}
          </Text>
        </View>
      </View>

      {loading && savedPosts.length === 0 ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.userProfilePurple} />
        </View>
      ) : (
        <FlatList
          data={savedPosts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <UserPostCard post={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔖</Text>
              <Text style={styles.emptyTitle}>No Saved Posts</Text>
              <Text style={styles.emptySubtitle}>
                Posts you save will appear here so you can easily view them anytime.
              </Text>
            </View>
          }
        />
      )}
    </MainLayout>
  );
}
