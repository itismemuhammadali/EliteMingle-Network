import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/** Four-point star (diamond) + small plus at upper-right (Friends / sparkle). */
export function UserFilterFriendsIcon({ size = 18, color = '#1a1a1a' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4.5L16 11.5L12 18.5L8 11.5L12 4.5Z"
        stroke={color}
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 4.5V8.5M16.5 6.5H20.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
