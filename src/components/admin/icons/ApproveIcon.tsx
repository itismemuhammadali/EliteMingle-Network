import React from 'react';
import Svg, { Path, G, ClipPath, Rect } from 'react-native-svg';

interface ApproveIconProps {
  size?: number;
  color?: string;
}

export function ApproveIcon({
  size = 24,
  color = '#059669',
}: ApproveIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#clip0_195_1446)">
        <Path
          d="M14.5238 6.66192C14.828 8.15507 14.6112 9.70739 13.9095 11.06C13.2077 12.4126 12.0634 13.4838 10.6675 14.0949C9.27158 14.706 7.70834 14.82 6.2385 14.418C4.76865 14.016 3.48104 13.1223 2.59039 11.8859C1.69974 10.6494 1.25989 9.145 1.34419 7.6235C1.42849 6.10201 2.03185 4.6554 3.05364 3.52492C4.07544 2.39443 5.4539 1.64841 6.95917 1.41126C8.46443 1.17411 10.0055 1.46016 11.3254 2.22172"
          stroke={color}
          strokeWidth="1.33239"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M5.99585 7.32817L7.99444 9.32676L14.6564 2.66479"
          stroke={color}
          strokeWidth="1.33239"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <ClipPath id="clip0_195_1446">
        <Rect width="15.9887" height="15.9887" fill="white" />
      </ClipPath>
    </Svg>
  );
}
