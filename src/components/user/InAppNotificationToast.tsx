import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { UserStackParamList } from '../../navigation/User/types';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import ChatIcon from '../../assets/Icons/profile/privacy/chat.svg';
import { markNotificationAsRead } from '../../services/notificationService';

export interface ToastMessageData {
  id: string;
  title: string;
  subtitle: string;
  actorId?: string;
  conversationId?: string;
  groupId?: string;
  groupName?: string;
  isGroup?: boolean;
}

export function InAppNotificationToast() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [currentToast, setCurrentToast] = useState<ToastMessageData | null>(null);

  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const seenNotifIds = useRef<Set<string>>(new Set());

  const hideToast = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (toast: ToastMessageData) => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      setCurrentToast(toast);

      translateY.setValue(-150);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      dismissTimerRef.current = setTimeout(() => {
        hideToast();
      }, 4500);
    },
    [hideToast, opacity, translateY],
  );

  const handlePress = useCallback(() => {
    if (!currentToast) return;
    const toast = currentToast;
    hideToast();

    // Mark as read in Firestore
    if (toast.id) {
      markNotificationAsRead(toast.id).catch(() => {});
    }

    if (toast.isGroup || toast.groupId) {
      const gId =
        toast.groupId ||
        (toast.conversationId && toast.conversationId.startsWith('group_')
          ? toast.conversationId.replace(/^group_/, '')
          : '');
      const finalConvId =
        toast.conversationId || (gId ? `group_${gId}` : '');
      const gName = toast.groupName || 'Group Chat';

      navigation.navigate('Chat', {
        conversationId: finalConvId,
        peerId: gId || finalConvId,
        peerName: gName,
        peerAvatarUri: '',
        statusText: 'Group',
        isOnlineStatus: false,
        isGroup: true,
      });
    } else {
      const peerName =
        toast.title
          .replace(/^New message from\s*/i, '')
          .replace(/^Message from\s*/i, '')
          .trim() || 'User';

      navigation.navigate('Chat', {
        conversationId: toast.conversationId,
        peerId: toast.actorId || '',
        peerName,
        peerAvatarUri: '',
        statusText: 'Online',
        isOnlineStatus: true,
        isGroup: false,
      });
    }
  }, [currentToast, hideToast, navigation]);

  // PanResponder to allow swiping up to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20) {
          hideToast();
        }
      },
    }),
  ).current;

  // Real-time listener for incoming unread notifications
  useEffect(() => {
    const currentUserId = auth().currentUser?.uid;
    if (!currentUserId) return;

    const unsub = firestore()
      .collection('notifications')
      .where('recipientId', '==', currentUserId)
      .where('isRead', '==', false)
      .where('type', '==', 'message')
      .onSnapshot(
        snapshot => {
          if (!snapshot || snapshot.empty) return;

          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const docId = change.doc.id;
              if (seenNotifIds.current.has(docId)) return;
              seenNotifIds.current.add(docId);

              const data = change.doc.data();
              // Skip notifications created more than 15 seconds before this session mounted
              const createdAt = data.createdAt?.toDate
                ? data.createdAt.toDate().getTime()
                : Date.now();
              if (createdAt < mountTimeRef.current - 15000) return;

              // Don't show toast for self
              if (data.actorId === currentUserId) return;

              const hasGroupInTitle =
                typeof data.title === 'string' && data.title.includes(' in ');
              const isGroup = Boolean(
                data.groupId ||
                  (data.conversationId &&
                    data.conversationId.startsWith('group_')) ||
                  hasGroupInTitle ||
                  data.groupName,
              );

              let extractedGroupName = data.groupName;
              if (!extractedGroupName && hasGroupInTitle) {
                extractedGroupName = data.title.split(' in ')[1]?.trim();
              }

              showToast({
                id: docId,
                title: data.title || (isGroup ? 'Group Message' : 'New Message'),
                subtitle: data.subtitle || 'Sent you a message',
                actorId: data.actorId,
                conversationId: data.conversationId,
                groupId: data.groupId,
                groupName: extractedGroupName,
                isGroup,
              });
            }
          });
        },
        err => console.warn('InAppNotificationToast listener error:', err),
      );

    return () => {
      unsub();
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [showToast]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        position: 'absolute',
        top: Math.max(insets.top, Platform.OS === 'android' ? 14 : 44),
        left: UtilityMethods.wp(3.5),
        right: UtilityMethods.wp(3.5),
        zIndex: 99999,
        elevation: 99999,
      },
      card: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.3),
        paddingHorizontal: UtilityMethods.wp(3.5),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
      },
      iconBox: {
        width: UtilityMethods.wp(10),
        height: UtilityMethods.wp(10),
        borderRadius: UtilityMethods.wp(5),
        backgroundColor: Colors.userProfilePurple,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      textCol: {
        flex: 1,
        minWidth: 0,
      },
      headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: UtilityMethods.hp(0.2),
      },
      title: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.textDark,
        flex: 1,
        marginRight: UtilityMethods.wp(2),
      },
      nowBadge: {
        fontSize: FontSize.VALUE(11),
        fontWeight: '500',
        color: Colors.userProfilePurple,
      },
      subtitle: {
        fontSize: FontSize.VALUE(13),
        color: Colors.textGrey,
        lineHeight: FontSize.VALUE(17),
      },
      closeBtn: {
        padding: UtilityMethods.wp(1.5),
        marginLeft: UtilityMethods.wp(1),
      },
      closeText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.placeholderGrey,
      },
    }),
  );

  if (!currentToast) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={currentToast.title}
      >
        <View style={styles.iconBox}>
          <ChatIcon
            width={UtilityMethods.wp(5)}
            height={UtilityMethods.wp(5)}
            color={Colors.white}
          />
        </View>

        <View style={styles.textCol}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {currentToast.title}
            </Text>
            <Text style={styles.nowBadge}>Now</Text>
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            {currentToast.subtitle}
          </Text>
        </View>

        <TouchableOpacity
          hitSlop={10}
          onPress={hideToast}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

