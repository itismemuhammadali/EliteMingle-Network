import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import PersonPlusWhiteIcon from '../../assets/Icons/profile/personPlusWhite.svg';
import CommentOutlineIcon from '../../assets/Icons/profile/commentOutline.svg';

const ICON = UtilityMethods.wp(4.75);

export type FriendshipStatus =
  | 'none'
  | 'pending_outgoing'
  | 'pending_incoming'
  | 'friends';

export interface UserPublicProfileActionsProps {
  friendshipStatus?: FriendshipStatus;
  onFriendsPress?: () => void;
  onMessagePress?: () => void;
}

export function UserPublicProfileActions({
  friendshipStatus = 'none',
  onFriendsPress,
  onMessagePress,
}: UserPublicProfileActionsProps) {
  const isRequested = friendshipStatus === 'pending_outgoing';
  const isFriends = friendshipStatus === 'friends';
  const isIncoming = friendshipStatus === 'pending_incoming';

  let friendLabel = 'Add Friend';
  if (isRequested) {
    friendLabel = 'Requested';
  } else if (isIncoming) {
    friendLabel = 'Accept Request';
  } else if (isFriends) {
    friendLabel = 'Friends';
  }

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      friendsBtn: {
        flex: 0.58,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.5),
        marginRight: UtilityMethods.wp(2),
      },
      friendsBtnRequested: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 1.5,
        borderColor: Colors.userProfilePurple,
      },
      friendsLabel: {
        marginLeft: UtilityMethods.wp(2),
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      friendsLabelRequested: {
        color: Colors.userProfilePurple,
      },
      messageBtn: {
        flex: 0.42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.5),
        borderWidth: 1,
        borderColor: Colors.textDark,
      },
      messageLabel: {
        marginLeft: UtilityMethods.wp(2),
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
    }),
  );

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[
          styles.friendsBtn,
          isRequested && styles.friendsBtnRequested,
        ]}
        onPress={onFriendsPress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={friendLabel}
      >
        <PersonPlusWhiteIcon
          width={ICON}
          height={ICON}
          color={isRequested ? Colors.userProfilePurple : Colors.white}
        />
        <Text
          style={[
            styles.friendsLabel,
            isRequested && styles.friendsLabelRequested,
          ]}
        >
          {friendLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.messageBtn}
        onPress={onMessagePress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Message"
      >
        <CommentOutlineIcon width={ICON} height={ICON} color={Colors.textDark} />
        <Text style={styles.messageLabel}>Message</Text>
      </TouchableOpacity>
    </View>
  );
}
