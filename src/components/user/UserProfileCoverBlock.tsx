import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { UserTabProfileIcon } from './icons/UserTabProfileIcon';

const H_PAD = UtilityMethods.wp(5);
const COVER_H = UtilityMethods.hp(22);
const AVATAR = UtilityMethods.wp(26);
const RING = 4;

function CoverPlaceholderIcon({
  size = 36,
  color = '#7C3AED',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="8.5"
        cy="8.5"
        r="1.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 15L16 10L5 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface UserProfileCoverBlockProps {
  /** Cover image — remote URI or bundled require() */
  coverSource?: ImageSourcePropType | null;
  /** Avatar image; omit or pass `null` to show icon instead */
  avatarSource?: ImageSourcePropType | null;
  /** Shown when avatarSource is missing (unused when icon is shown) */
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
  avatarShape = 'circle',
  avatarRingColor = Colors.white,
}: UserProfileCoverBlockProps) {
  const [coverError, setCoverError] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);

  React.useEffect(() => {
    setCoverError(false);
  }, [coverSource]);

  React.useEffect(() => {
    setAvatarError(false);
  }, [avatarSource]);

  const av = AVATAR;
  const avatarRadius = avatarShape === 'circle' ? av / 2 : UtilityMethods.wp(3);

  const hasCover =
    !coverError &&
    coverSource &&
    typeof coverSource === 'object' &&
    'uri' in coverSource
      ? Boolean(coverSource.uri && String(coverSource.uri).trim().length > 0)
      : Boolean(!coverError && coverSource);

  const hasAvatar =
    !avatarError &&
    avatarSource &&
    typeof avatarSource === 'object' &&
    'uri' in avatarSource
      ? Boolean(avatarSource.uri && String(avatarSource.uri).trim().length > 0)
      : Boolean(!avatarError && avatarSource);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      wrap: {},
      coverContainer: {
        width: '100%',
        height: COVER_H,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderGrey,
        overflow: 'hidden',
      },
      cover: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.inputBackground,
      },
      coverPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      coverPlaceholderText: {
        marginTop: UtilityMethods.hp(0.75),
        fontSize: FontSize.VALUE(12),
        fontWeight: '500',
        color: Colors.userProfilePurple,
        opacity: 0.85,
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
    }),
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.coverContainer}>
        {hasCover && coverSource ? (
          <Image
            source={coverSource}
            style={styles.cover}
            resizeMode="cover"
            onError={() => setCoverError(true)}
          />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <CoverPlaceholderIcon
              size={UtilityMethods.wp(9)}
              color={Colors.userProfilePurple}
            />
            <Text style={styles.coverPlaceholderText}>Cover Poster</Text>
          </View>
        )}
      </View>

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
          {hasAvatar && avatarSource ? (
            <Image
              source={avatarSource}
              style={styles.avatarImg}
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View
              style={[
                styles.avatarImg,
                styles.avatarInitialsWrap,
                {
                  borderRadius:
                    avatarShape === 'circle' ? av / 2 : UtilityMethods.wp(2),
                },
              ]}
            >
              <UserTabProfileIcon size={av * 0.55} color={Colors.white} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
