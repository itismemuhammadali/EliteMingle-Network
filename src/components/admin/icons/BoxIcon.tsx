import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BoxIconProps {
  size?: number;
  color?: string;
}

export function BoxIcon({
  size = 24,
  color = '#FFFFFF',
}: BoxIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 16V8C20.9996 7.46957 20.7887 6.96095 20.4136 6.58599C20.0386 6.21102 19.5300 5.99939 19 6H5C4.46995 5.99939 3.96144 6.21102 3.58646 6.58599C3.21149 6.96095 3.00061 7.46957 3 8V16C3.00061 16.5304 3.21149 17.039 3.58646 17.4139C3.96144 17.7888 4.46995 18 5 18H19C19.5300 18 20.0386 17.7888 20.4136 17.4139C20.7887 17.039 20.9996 16.5304 21 16Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 10H21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10V18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
