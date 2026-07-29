import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface AnalyticsIconProps {
  size?: number;
}

export function AnalyticsIcon({ size = 44 }: AnalyticsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Path
        d="M0 12C0 5.37258 5.37258 0 12 0H31.9987C38.6261 0 43.9987 5.37258 43.9987 12V31.9987C43.9987 38.6261 38.6261 43.9987 31.9987 43.9987H12C5.37258 43.9987 0 38.6261 0 31.9987V12Z"
        fill="url(#paint0_linear_195_363)"
      />
      <Path
        d="M25.9978 17.001H31.9957V22.9989"
        stroke="white"
        strokeWidth="1.9993"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M31.9957 17.001L23.4986 25.498L18.5004 20.4997L12.0027 26.9975"
        stroke="white"
        strokeWidth="1.9993"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_195_363"
          x1="0"
          y1="0"
          x2="43.9987"
          y2="43.9987"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#10B981" />
          <Stop offset="1" stopColor="#059669" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}
