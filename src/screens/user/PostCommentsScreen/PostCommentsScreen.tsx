import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import type { UserStackParamList } from '../../../navigation/User/types';
import MainLayout from '../../../components/general/MainLayout';
import { ChatBackArrowIcon } from '../../../components/user/icons';
import { Colors } from '../../../constants/colors';
import { type PostCommentItem } from '../../../constants/postCommentsMockData';
import { useUserProfile } from '../../../components/user';
import {
  addComment,
  subscribeToComments,
} from '../../../services/postService';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);

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

export function PostCommentsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const route = useRoute<RouteProp<UserStackParamList, 'PostComments'>>();
  const { postId, authorName } = route.params;
  const { profile } = useUserProfile();
  const insets = useSafeAreaInsets();

  const [comments, setComments] = useState<PostCommentItem[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToComments(postId, list => {
      setComments(list as PostCommentItem[]);
    });
    return () => unsubscribe();
  }, [postId]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    const currentUser = auth().currentUser;
    setSending(true);
    setDraft('');
    try {
      await addComment({
        postId,
        userId: currentUser?.uid || 'dev_user_123',
        authorName:
          profile?.displayName || currentUser?.displayName || 'User',
        avatarUrl: profile?.avatarUri || currentUser?.photoURL || '',
        text,
      });
    } catch (err) {
      console.error('Failed to add comment:', err);
      setDraft(text); // restore so the user doesn't lose their text
    } finally {
      setSending(false);
    }
  }, [draft, sending, postId, profile]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: H_PAD,
        paddingVertical: UtilityMethods.hp(1.25),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      backBtn: {
        marginRight: UtilityMethods.wp(2),
        padding: UtilityMethods.wp(0.5),
      },
      navTitle: {
        flex: 1,
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      sub: {
        fontSize: FontSize.VALUE(13),
        color: Colors.placeholderGrey,
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(1),
        paddingBottom: UtilityMethods.hp(0.5),
      },
      list: {
        paddingHorizontal: H_PAD,
        paddingBottom: UtilityMethods.hp(3),
      },
      row: {
        flexDirection: 'row',
        paddingVertical: UtilityMethods.hp(1.25),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      avatarImg: {
        width: UtilityMethods.wp(11),
        height: UtilityMethods.wp(11),
        borderRadius: UtilityMethods.wp(5.5),
        backgroundColor: Colors.inputBackground,
        marginRight: UtilityMethods.wp(3),
      },
      avatarFallback: {
        width: UtilityMethods.wp(11),
        height: UtilityMethods.wp(11),
        borderRadius: UtilityMethods.wp(5.5),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      avatarInitials: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '700',
        color: Colors.white,
      },
      bodyCol: {
        flex: 1,
        minWidth: 0,
      },
      meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(0.35),
      },
      author: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.textDark,
        marginRight: UtilityMethods.wp(2),
      },
      time: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
      },
      body: {
        fontSize: FontSize.VALUE(14),
        lineHeight: FontSize.VALUE(20),
        color: Colors.textGrey,
      },
      empty: {
        textAlign: 'center',
        color: Colors.placeholderGrey,
        fontSize: FontSize.VALUE(14),
        marginTop: UtilityMethods.hp(4),
      },
      inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: H_PAD,
        paddingVertical: UtilityMethods.hp(1),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      input: {
        flex: 1,
        maxHeight: UtilityMethods.hp(12),
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(6),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
        marginRight: UtilityMethods.wp(2),
      },
      sendBtn: {
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1),
        borderRadius: UtilityMethods.wp(6),
        backgroundColor: Colors.userProfilePurple,
      },
      sendBtnDisabled: {
        opacity: 0.45,
      },
      sendText: {
        color: Colors.white,
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
      },
    }),
  );

  const renderItem = useCallback(
    ({ item }: { item: PostCommentItem }) => (
      <View style={styles.row}>
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.avatarImg}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              { backgroundColor: item.avatarColor ?? Colors.userProfilePurple },
            ]}
          >
            <Text style={styles.avatarInitials}>
              {item.initials ?? initials(item.authorName)}
            </Text>
          </View>
        )}
        <View style={styles.bodyCol}>
          <View style={styles.meta}>
            <Text style={styles.author} numberOfLines={1}>
              {item.authorName}
            </Text>
            <Text style={styles.time}>{item.timeAgo}</Text>
          </View>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      </View>
    ),
    [styles],
  );

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.userFeedBackground}
      style={layoutStyles.flex}
    >
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top + UtilityMethods.hp(1.25) },
        ]}
      >
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChatBackArrowIcon
            size={UtilityMethods.wp(5.5)}
            color={Colors.textDark}
          />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Comments
        </Text>
      </View>
      <Text style={styles.sub} numberOfLines={1}>
        {`On ${authorName}'s post`}
      </Text>
      <KeyboardAvoidingView
        style={layoutStyles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          style={layoutStyles.listFlex}
          data={comments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No comments yet. Be the first!</Text>
          }
        />
        <View
          style={[
            styles.inputBar,
            { paddingBottom: keyboardOpen ? UtilityMethods.hp(1) : insets.bottom + UtilityMethods.hp(1) },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor={Colors.placeholderGrey}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!draft.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!draft.trim() || sending}
            activeOpacity={0.85}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

const layoutStyles = StyleSheet.create({
  flex: { flex: 1 },
  listFlex: { flex: 1 },
});
