import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function UserFeelingIcon({ size = 24, color = '#FFC107' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path
        d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="9" cy="9" r="1" fill={color} />
      <Circle cx="15" cy="9" r="1" fill={color} />
    </Svg>
  );
}
