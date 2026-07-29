import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BackArrowIconProps {
  size?: number;
  color?: string;
}

export function BackArrowIcon({
  size = 24,
  color = '#85138C',
}: BackArrowIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
