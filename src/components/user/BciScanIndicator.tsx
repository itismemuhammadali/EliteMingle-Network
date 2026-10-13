import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize from '../../utility/FontSize';

export function BciScanIndicator() {
  const enabled = useAppSelector(s => s.bciEnabled);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 1200);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <View style={styles.banner}>
      <View style={[styles.dot, pulse && styles.dotActive]} />
      <Text style={styles.text}>BCI Assistive Switch Active</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF2F8',
    borderBottomWidth: 1,
    borderColor: '#FBCFE8',
    paddingVertical: UtilityMethods.hp(0.6),
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DB2777',
    marginRight: UtilityMethods.wp(2),
    opacity: 0.5,
  },
  dotActive: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  text: {
    fontSize: FontSize.VALUE(11),
    fontWeight: '700',
    color: '#9D174D',
    letterSpacing: 0.4,
  },
});
