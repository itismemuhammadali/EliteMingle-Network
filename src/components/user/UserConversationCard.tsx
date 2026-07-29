import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { UserChevronRightIcon } from './icons';
import { UserOverlappingAvatars } from './UserOverlappingAvatars';

export type UserConversationCardProps =
  | {
      variant?: 'direct';
      name: string;
      preview: string;
      time: string;
      avatarUri: string;
      unreadCount?: number;
      onPress?: () => void;
    }
  | {
      variant: 'group';
      name: string;
      preview: string;
      memberLabel: string;
      avatarUris: string[];
      onPress?: () => void;
    };

const AV = UtilityMethods.wp(12);

export function UserConversationCard(props: UserConversationCardProps) {
  const onPress = 'onPress' in props ? props.onPress : undefined;

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderGrey,
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(3.5),
        marginBottom: UtilityMethods.hp(1.25),
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      },
      avatar: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        backgroundColor: Colors.inputBackground,
      },
      groupAvatars: {
        marginRight: UtilityMethods.wp(3),
      },
      middle: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
        marginRight: UtilityMethods.wp(2),
        minWidth: 0,
      },
      middleGroup: {
        marginLeft: 0,
      },
      name: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.textDark,
      },
      preview: {
        marginTop: UtilityMethods.hp(0.35),
        fontSize: FontSize.VALUE(13),
        color: Colors.textGrey,
        fontWeight: '400',
      },
      metaCol: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        marginRight: UtilityMethods.wp(1),
        minWidth: UtilityMethods.wp(14),
      },
      metaMuted: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
      },
      unreadBadge: {
        marginTop: UtilityMethods.hp(0.45),
        minWidth: UtilityMethods.wp(5.5),
        height: UtilityMethods.wp(5.5),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: UtilityMethods.wp(1.25),
        borderRadius: UtilityMethods.wp(3),
        backgroundColor: Colors.userActiveTabPurple,
      },
      unreadText: {
        fontSize: FontSize.VALUE(11),
        fontWeight: '700',
        color: Colors.white,
      },
    }),
  );

  if (props.variant === 'group') {
    const { name, preview, memberLabel, avatarUris } = props;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={styles.groupAvatars}>
          <UserOverlappingAvatars uris={avatarUris} />
        </View>
        <View style={[styles.middle, styles.middleGroup]}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaMuted}>{memberLabel}</Text>
        </View>
        <UserChevronRightIcon
          size={UtilityMethods.wp(5)}
          color={Colors.placeholderGrey}
        />
      </TouchableOpacity>
    );
  }

  const {
    name,
    preview,
    time,
    avatarUri,
    unreadCount,
  } = props;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      <View style={styles.metaCol}>
        <Text style={styles.metaMuted}>{time}</Text>
        {unreadCount != null && unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        ) : null}
      </View>
      <UserChevronRightIcon
        size={UtilityMethods.wp(5)}
        color={Colors.placeholderGrey}
      />
    </TouchableOpacity>
  );
}
