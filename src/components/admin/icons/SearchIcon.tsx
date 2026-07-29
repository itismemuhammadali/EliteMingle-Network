import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface SearchIconProps {
  size?: number;
  color?: string;
}

export function SearchIcon({
  size = 24,
  color = '#888888',
}: SearchIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="11"
        cy="11"
        r="8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 21L16.65 16.65"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
