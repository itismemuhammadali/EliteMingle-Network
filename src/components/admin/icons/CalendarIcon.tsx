import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface CalendarIconProps {
  size?: number;
  color?: string;
}

export function CalendarIcon({
  size = 24,
  color = '#888888',
}: CalendarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M16 2V6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M8 2V6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M3 10H21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
