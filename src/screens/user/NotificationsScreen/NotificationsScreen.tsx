import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import MainLayout from '../../../components/general/MainLayout';
import { UserNotificationRow } from '../../../components/user';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import { Colors } from '../../../constants/colors';
import { type UserAppNotification } from '../../../constants/userNotificationsData';
import {
  subscribeToNotifications,
  markAllNotificationsRead,
} from '../../../services/notificationService';
import type { UserStackParamList } from '../../../navigation/User/types';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);
const CHECK = UtilityMethods.wp(3.5);

function CheckMarkIcon({ color }: { color: string }) {
  return (
    <Svg width={CHECK} height={CHECK} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NotificationsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();

  const [notifications, setNotifications] = useState<UserAppNotification[]>([]);
  const currentUserId = auth().currentUser?.uid || 'dev_user_123';

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(currentUserId, setNotifications);
    return () => unsubscribe();
  }, [currentUserId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const allRead = useMemo(
    () => notifications.every(n => n.isRead),
    [notifications],
  );

  const markAllRead = useCallback(() => {
    markAllNotificationsRead(currentUserId);
  }, [currentUserId]);

  const renderItem = useCallback(
    ({ item }: { item: UserAppNotification }) => (
      <UserNotificationRow notification={item} />
    ),
    [],
  );

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: Colors.userFeedBackground,
      },
      navBar: {
        position: 'relative',
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(7),
        paddingBottom: UtilityMethods.hp(1.25),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
        backgroundColor: Colors.white,
        minHeight: UtilityMethods.hp(6.5),
        justifyContent: 'center',
      },
      navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      backBtn: {
        padding: UtilityMethods.wp(0.5),
      },
      navTitleWrap: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(28),
      },
      navTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
      },
      markAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(0.5),
        paddingLeft: UtilityMethods.wp(0.5),
      },
      markAllBtnDisabled: {
        opacity: 0.45,
      },
      markAllText: {
        marginLeft: UtilityMethods.wp(1),
        fontSize: FontSize.VALUE(10),
        fontWeight: '400',
        color: Colors.textGrey,
      },
      markAllTextDisabled: {
        color: Colors.placeholderGrey,
      },
      listContent: {
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(1.5),
        paddingBottom: UtilityMethods.hp(3),
      },
      empty: {
        textAlign: 'center',
        color: Colors.placeholderGrey,
        fontSize: FontSize.VALUE(14),
        marginTop: UtilityMethods.hp(5),
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
    >
      <View style={styles.root}>
        <View style={styles.navBar}>
          <View style={styles.navRow}>
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
            <TouchableOpacity
              style={[styles.markAllBtn, allRead && styles.markAllBtnDisabled]}
              onPress={markAllRead}
              disabled={allRead}
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel="Mark all read"
              accessibilityState={{ disabled: allRead }}
            >
              <CheckMarkIcon
                color={allRead ? Colors.placeholderGrey : Colors.textGrey}
              />
              <Text
                style={[
                  styles.markAllText,
                  allRead && styles.markAllTextDisabled,
                ]}
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.navTitleWrap} pointerEvents="none">
            <Text style={styles.navTitle} numberOfLines={1}>
              Notifications
            </Text>
          </View>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          extraData={notifications}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet.</Text>
          }
        />
      </View>
    </MainLayout>
  );
}
