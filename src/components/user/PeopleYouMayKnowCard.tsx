import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import type { SuggestedPerson } from '../../constants/userPeopleYouMayKnowData';
import { PeopleMutualIcon } from './icons/PeopleMutualIcon';
import { MapPinSmallIcon } from './icons/MapPinSmallIcon';
import { UserPlusGlyphIcon } from './icons/UserPlusGlyphIcon';
import { UserTabMessagesIcon } from './icons/UserTabMessagesIcon';
import { sendFriendRequest } from '../../services/friendService';

const AVATAR = UtilityMethods.wp(14);
const ONLINE = UtilityMethods.wp(2.75);
const META_ICON = UtilityMethods.wp(3.5);
const TAG_PAD_H = UtilityMethods.wp(2.25);
const TAG_PAD_V = UtilityMethods.hp(0.45);
const MESSAGE_BTN = UtilityMethods.wp(12);

export interface PeopleYouMayKnowCardProps {
  person: SuggestedPerson;
  onMessage: (person: SuggestedPerson) => void;
  onProfilePress?: (person: SuggestedPerson) => void;
}

export function PeopleYouMayKnowCard({
  person,
  onMessage,
  onProfilePress,
}: PeopleYouMayKnowCardProps) {
  const [requested, setRequested] = useState(false);
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3.5),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.75),
        marginBottom: UtilityMethods.hp(1.75),
        marginHorizontal: UtilityMethods.wp(5),
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      },
      topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
      avatarWrap: {
        width: AVATAR,
        height: AVATAR,
        marginRight: UtilityMethods.wp(3),
      },
      avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
        backgroundColor: Colors.inputBackground,
      },
      onlineDot: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: ONLINE,
        height: ONLINE,
        borderRadius: ONLINE / 2,
        backgroundColor: Colors.adminSuccessGreen,
        borderWidth: 2,
        borderColor: Colors.white,
      },
      nameCol: {
        flex: 1,
        minWidth: 0,
        paddingTop: UtilityMethods.hp(0.15),
      },
      name: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.5),
      },
      metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(0.35),
      },
      metaText: {
        marginLeft: UtilityMethods.wp(1.25),
        fontSize: FontSize.VALUE(12),
        fontWeight: '400',
        color: Colors.placeholderGrey,
        flex: 1,
      },
      bio: {
        marginTop: UtilityMethods.hp(1.25),
        fontSize: FontSize.VALUE(14),
        fontWeight: '400',
        color: Colors.textGrey,
        lineHeight: FontSize.VALUE(20),
      },
      tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: UtilityMethods.hp(1.1),
      },
      tag: {
        paddingHorizontal: TAG_PAD_H,
        paddingVertical: TAG_PAD_V,
        borderRadius: UtilityMethods.wp(5),
        backgroundColor: Colors.userProfileBadgeBg,
        marginRight: UtilityMethods.wp(1.5),
        marginBottom: UtilityMethods.hp(0.35),
      },
      tagText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.userProfilePurple,
      },
      actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: UtilityMethods.hp(1.5),
      },
      addFriendBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryPurple,
        borderRadius: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(1.35),
        marginRight: UtilityMethods.wp(2.5),
      },
      addFriendBtnDisabled: {
        opacity: 0.75,
      },
      addFriendLabel: {
        marginLeft: UtilityMethods.wp(1.5),
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.white,
      },
      messageBtn: {
        width: MESSAGE_BTN,
        height: MESSAGE_BTN,
        borderRadius: UtilityMethods.wp(2.5),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
  );

  const onAddFriend = useCallback(() => {
    setRequested(true);
    const currentUser = auth().currentUser;
    const currentUid = currentUser?.uid || 'dev_user_123';
    if (person.id) {
      sendFriendRequest(currentUid, person.id).catch(err => {
        console.warn('Friend request dispatch error:', err?.message);
      });
    }
  }, [person.id]);

  const onPressMessage = useCallback(() => {
    onMessage(person);
  }, [onMessage, person]);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.avatarWrap}
          activeOpacity={0.8}
          onPress={() => onProfilePress?.(person)}
          disabled={!onProfilePress}
          accessibilityRole="button"
          accessibilityLabel={`${person.name} profile`}
        >
          <Image
            source={{ uri: person.avatarUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />
          {person.isOnline ? <View style={styles.onlineDot} /> : null}
        </TouchableOpacity>
        <View style={styles.nameCol}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onProfilePress?.(person)}
            disabled={!onProfilePress}
            accessibilityRole="button"
            accessibilityLabel={`${person.name} profile`}
          >
            <Text style={styles.name} numberOfLines={1}>
              {person.name}
            </Text>
          </TouchableOpacity>
          <View style={styles.metaRow}>
            <PeopleMutualIcon size={META_ICON} color={Colors.placeholderGrey} />
            <Text style={styles.metaText}>
              {person.mutualFriendsCount} mutual friends
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPinSmallIcon size={META_ICON} color={Colors.placeholderGrey} />
            <Text style={styles.metaText} numberOfLines={1}>
              {person.location}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.bio}>{person.bio}</Text>

      <View style={styles.tagsRow}>
        {person.interests.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.addFriendBtn,
            requested && styles.addFriendBtnDisabled,
          ]}
          onPress={onAddFriend}
          activeOpacity={0.85}
          disabled={requested}
          accessibilityRole="button"
          accessibilityLabel={
            requested ? 'Friend request sent' : 'Add friend'
          }
        >
          <UserPlusGlyphIcon
            size={UtilityMethods.wp(4.75)}
            color={Colors.white}
          />
          <Text style={styles.addFriendLabel}>
            {requested ? 'Requested' : 'Add Friend'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={onPressMessage}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Message ${person.name}`}
        >
          <UserTabMessagesIcon
            size={UtilityMethods.wp(5.25)}
            color={Colors.textGrey}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
