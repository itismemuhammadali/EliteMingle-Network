import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { UserTabProfileIcon } from '../user/icons/UserTabProfileIcon';
import { Colors } from '../../constants/colors';

export interface ProfileAvatarProps {
  uri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  backgroundColor?: string;
  iconColor?: string;
}

/**
 * Reusable Avatar component:
 * Renders the user's remote/local photo if valid.
 * When absent or empty, displays the official bottom navigation UserTabProfileIcon SVG.
 * Always respects the outer `style` (margins, layout) regardless of image presence.
 */
export function ProfileAvatar({
  uri,
  size = 40,
  style,
  imageStyle,
  backgroundColor = Colors.inputBackground,
  iconColor = Colors.userProfilePurple,
}: ProfileAvatarProps) {
  const hasValidUri =
    typeof uri === 'string' &&
    uri.trim().length > 0 &&
    (uri.startsWith('http://') ||
      uri.startsWith('https://') ||
      uri.startsWith('file://') ||
      uri.startsWith('content://'));

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {hasValidUri ? (
        <Image
          source={{ uri }}
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            imageStyle,
          ]}
          resizeMode="cover"
        />
      ) : (
        <UserTabProfileIcon size={Math.round(size * 0.55)} color={iconColor} />
      )}
    </View>
  );
}
