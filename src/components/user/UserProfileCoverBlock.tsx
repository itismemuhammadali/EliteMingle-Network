import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);
const COVER_H = UtilityMethods.hp(22);
const AVATAR = UtilityMethods.wp(26);
const RING = 4;

export interface UserProfileCoverBlockProps {
  /** Cover image — remote URI or bundled require() */
  coverSource: ImageSourcePropType;
  /** Avatar image; omit or pass `null` to show initials instead */
  avatarSource?: ImageSourcePropType | null;
  /** Shown when `avatarSource` is missing (e.g. initials on purple) */
  avatarInitials?: string;
  /** Profile uses circle; group pages often use a rounded square */
  avatarShape?: 'circle' | 'roundedSquare';
  /** Outer ring around avatar (default white); use gold on public profiles */
  avatarRingColor?: string;
}

/**
 * Full-width cover with an avatar overlapping the bottom edge (white ring).
 * Reusable on profile and group screens.
 */
export function UserProfileCoverBlock({
  coverSource,
  avatarSource,
  avatarInitials,
  avatarShape = 'circle',
  avatarRingColor = Colors.white,
}: UserProfileCoverBlockProps) {
  const av = AVATAR;
  const avatarRadius = avatarShape === 'circle' ? av / 2 : UtilityMethods.wp(3);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      wrap: {
        //backgroundColor: Colors.white,
      },
      cover: {
        width: '100%',
        height: COVER_H,
        backgroundColor: Colors.inputBackground,
      },
      avatarRow: {
        marginTop: -AVATAR / 2,
        marginBottom: UtilityMethods.hp(0.5),
      },
      avatarRing: {
        borderWidth: RING,
        overflow: 'hidden',
        backgroundColor: Colors.inputBackground,
      },
      avatarImg: {
        width: '100%',
        height: '100%',
      },
      avatarInitialsWrap: {
        backgroundColor: Colors.userProfilePurple,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarInitialsText: {
        fontSize: FontSize.VALUE(28),
        fontWeight: '700',
        color: Colors.white,
      },
    }),
  );

  return (
    <View style={styles.wrap}>
      <Image source={coverSource} style={styles.cover} resizeMode="cover" />
      <View style={[styles.avatarRow, { paddingHorizontal: H_PAD }]}>
        <View
          style={[
            styles.avatarRing,
            {
              width: av,
              height: av,
              borderRadius: avatarRadius,
              borderColor: avatarRingColor,
            },
          ]}
        >
          {avatarSource ? (
            <Image
              source={avatarSource}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarImg,
                styles.avatarInitialsWrap,
                { borderRadius: avatarShape === 'circle' ? av / 2 : UtilityMethods.wp(2) },
              ]}
            >
              <Text style={styles.avatarInitialsText} numberOfLines={1}>
                {avatarInitials ?? '?'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
