import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function ChatPaperclipIcon({ size = 22, color = '#888888' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.8858 21.3658 3.76 20.24C2.6342 19.1142 2.00174 17.5872 2.00174 15.995C2.00174 14.4028 2.6342 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80943 14.7186 1.38776 15.78 1.38776C16.8414 1.38776 17.8594 1.80943 18.61 2.56C19.3606 3.31057 19.7823 4.32855 19.7823 5.39C19.7823 6.45145 19.3606 7.46943 18.61 8.22L9.41 17.41C9.03481 17.7852 8.52574 17.996 7.995 17.996C7.46426 17.996 6.95519 17.7852 6.58 17.41C6.20481 17.0348 5.99402 16.5257 5.99402 15.995C5.99402 15.4643 6.20481 14.9552 6.58 14.58L15.07 6.1"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
