import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CheckAllIconProps {
  size?: number;
  color?: string;
}

export function CheckAllIcon({
  size = 24,
  color = '#FFFFFF',
}: CheckAllIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 11L12 14L22 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12V19C20.9996 19.5304 20.7887 20.039 20.4136 20.4139C20.0386 20.7888 19.5300 20.9995 19 21H5C4.46995 20.9995 3.96144 20.7888 3.58646 20.4139C3.21149 20.039 3.00061 19.5304 3 19V5C3.00061 4.46957 3.21149 3.96095 3.58646 3.58599C3.96144 3.21102 4.46995 3.00039 5 3H16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
