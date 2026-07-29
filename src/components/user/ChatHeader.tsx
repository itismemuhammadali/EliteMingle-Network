import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { ChatBackArrowIcon } from './icons';

const AV = UtilityMethods.wp(11);

export interface ChatHeaderProps {
  peerName: string;
  peerAvatarUri: string;
  /** e.g. "Online" (green) or "12 member" */
  statusText?: string;
  /** When true, status uses online green; when false, uses muted grey (e.g. member count). */
  isOnlineStatus?: boolean;
  onBackPress: () => void;
}

export function ChatHeader({
  peerName,
  peerAvatarUri,
  statusText = 'Online',
  isOnlineStatus = true,
  onBackPress,
}: ChatHeaderProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderGrey,
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.25),
      },
      backBtn: {
        marginRight: UtilityMethods.wp(2),
        padding: UtilityMethods.wp(0.5),
      },
      avatar: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        backgroundColor: Colors.inputBackground,
      },
      titleBlock: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        justifyContent: 'center',
        minWidth: 0,
      },
      name: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
      status: {
        marginTop: UtilityMethods.hp(0.2),
        fontSize: FontSize.VALUE(13),
        fontWeight: '500',
      },
      statusOnline: {
        color: Colors.adminSuccessGreen,
      },
      statusMuted: {
        color: Colors.placeholderGrey,
        fontWeight: '400',
      },
    }),
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBackPress}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <ChatBackArrowIcon
          size={UtilityMethods.wp(5.5)}
          color={Colors.textDark}
        />
      </TouchableOpacity>

      <Image source={{ uri: peerAvatarUri }} style={styles.avatar} />

      <View style={styles.titleBlock}>
        <Text style={styles.name} numberOfLines={1}>
          {peerName}
        </Text>
        <Text
          style={[
            styles.status,
            isOnlineStatus ? styles.statusOnline : styles.statusMuted,
          ]}
          numberOfLines={1}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
}
