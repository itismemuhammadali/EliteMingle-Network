import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import {
  FeedFilterTabs,
  PeopleYouMayKnowSection,
  FriendRequestsSection,
} from '../../../components/user';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import { Colors } from '../../../constants/colors';
import type { UserFeedFilter } from '../../../constants/userFeedData';
import type { UserStackParamList } from '../../../navigation/User/types';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);

export function FindFriendsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [filter, setFilter] = useState<UserFeedFilter | null>('friends');

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      contentContainer: {
        paddingTop: UtilityMethods.hp(0.5),
        paddingBottom: UtilityMethods.hp(3),
        backgroundColor: Colors.userFeedBackground,
      },
      navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(4),
        paddingBottom: UtilityMethods.hp(1.25),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
        backgroundColor: Colors.userFeedBackground,
      },
      backBtn: {
        padding: UtilityMethods.wp(0.5),
      },
      navTitleWrap: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(28),
        paddingBottom: UtilityMethods.hp(1.25),
      },
      navTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
      },
      hintWrap: {
        paddingHorizontal: H_PAD,
        paddingVertical: UtilityMethods.hp(2),
      },
      hint: {
        fontSize: FontSize.VALUE(14),
        color: Colors.placeholderGrey,
        textAlign: 'center',
        lineHeight: FontSize.VALUE(21),
      },
    }),
  );

  return (
    <MainLayout
      isScrollable={true}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.userFeedBackground}
      bottomColor={Colors.userFeedBackground}
      contentContainerStyle={styles.contentContainer}
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
        <View style={styles.navTitleWrap} pointerEvents="none">
          <Text style={styles.navTitle} numberOfLines={1}>
            Find Friends
          </Text>
        </View>
      </View>

      <FriendRequestsSection />

      <FeedFilterTabs active={filter} onChange={setFilter} />

      {filter != null ? (
        <PeopleYouMayKnowSection filter={filter} />
      ) : (
        <View style={styles.hintWrap}>
          <Text style={styles.hint}>
            Select Friends, Nearby, or Interests to see suggested people.
          </Text>
        </View>
      )}
    </MainLayout>
  );
}
