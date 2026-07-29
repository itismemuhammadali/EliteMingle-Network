import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import PersonPlusWhiteIcon from '../../assets/Icons/profile/personPlusWhite.svg';
import CommentOutlineIcon from '../../assets/Icons/profile/commentOutline.svg';

const ICON = UtilityMethods.wp(4.75);

export interface UserPublicProfileActionsProps {
  onFriendsPress?: () => void;
  onMessagePress?: () => void;
}

export function UserPublicProfileActions({
  onFriendsPress,
  onMessagePress,
}: UserPublicProfileActionsProps) {
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
      friendsLabel: {
        marginLeft: UtilityMethods.wp(2),
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
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
        style={styles.friendsBtn}
        onPress={onFriendsPress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Friends"
      >
        <PersonPlusWhiteIcon width={ICON} height={ICON} color={Colors.white} />
        <Text style={styles.friendsLabel}>Friends</Text>
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
