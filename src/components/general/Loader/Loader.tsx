import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import UtilityMethods from '../../../utility/UtilityMethods';
import { Colors } from '../../../constants/colors';

interface LoaderProps {
  size?: number;
}

export function Loader({ size }: LoaderProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  const sizeValue = size || UtilityMethods.wp(12);
  const strokeWidth = sizeValue * 0.08;

  // 4 curved segments - each arc is 90 degrees (quarter circle)
  // Path: M startX startY A radius radius 0 0 1 endX endY
  const radius = (sizeValue - strokeWidth) / 2;
  const cx = sizeValue / 2;
  const cy = sizeValue / 2;

  const createArc = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const segments = [
    createArc(10, 80),
    createArc(100, 170),
    createArc(190, 260),
    createArc(280, 350),
  ];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ rotate: spin }] }]}
    >
      <Svg
        width={sizeValue}
        height={sizeValue}
        viewBox={`0 0 ${sizeValue} ${sizeValue}`}
      >
        {segments.map((d, i) => (
          <Path
            key={i}
            d={d}
            stroke={Colors.primaryPurple}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
