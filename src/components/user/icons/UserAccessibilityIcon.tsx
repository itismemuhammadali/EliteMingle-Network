import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/** Wheelchair / accessibility symbol (outline). */
export function UserAccessibilityIcon({
  size = 22,
  color = '#4a4a4a',
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth="1.8" />
      <Path
        d="M12 7v5M9 14h4l3 5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 20c1.5-3 4.5-3 6 0"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M17 9.5a6.5 6.5 0 11-6.5 6.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}
