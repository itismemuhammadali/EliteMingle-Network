import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ONBOARDING_SLIDES } from '../../../constants/onboardingSlidesData';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';
import type { AuthStackParamList } from '../../../navigation/Admin/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_RATIO = 0.45;
const HERO_H = SCREEN_H * HERO_RATIO;
const PURPLE = Colors.userProfilePurple;
const INACTIVE_DOT = '#D0D0D0';

function ConcentricWatermark({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const cx = width / 2;
  const cy = height / 2;
  const rings = 10;
  const step = Math.max(width, height) / (rings * 2);

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {Array.from({ length: rings }).map((_, i) => (
        <Circle
          key={i}
          cx={cx}
          cy={cy}
          r={step * (i + 1)}
          stroke="#E8E8E8"
          strokeWidth={StyleSheet.hairlineWidth}
          fill="none"
          opacity={0.55}
        />
      ))}
    </Svg>
  );
}

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [bottomH, setBottomH] = useState(SCREEN_H - HERO_H);

  const slide = ONBOARDING_SLIDES[index];
  const total = ONBOARDING_SLIDES.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      navigation.navigate('SignIn');
      return;
    }
    setIndex(i => Math.min(i + 1, total - 1));
  }, [isLast, navigation, total]);

  const goBack = useCallback(() => {
    if (isFirst) {
      return;
    }
    setIndex(i => Math.max(i - 1, 0));
  }, [isFirst]);

  const skip = useCallback(() => {
    navigation.navigate('SignIn');
  }, [navigation]);

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { height: HERO_H }]}>
        <Image
          source={slide.image}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>

      <View
        style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, UtilityMethods.hp(1.5)) }]}
        onLayout={e => setBottomH(e.nativeEvent.layout.height)}
      >
        <ConcentricWatermark width={SCREEN_W} height={bottomH} />

        <View style={styles.bottomInner}>
          <View style={styles.pagination}>
            {ONBOARDING_SLIDES.map((_, i) =>
              i === index ? (
                <View key={i} style={styles.pill} />
              ) : (
                <View key={i} style={styles.dot} />
              ),
            )}
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={goNext}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Continue to sign in' : 'Next slide'}
          >
            <Text style={styles.nextLabel}>Next</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={goBack}
              disabled={isFirst}
              activeOpacity={0.65}
              style={styles.footerHit}
              accessibilityRole="button"
              accessibilityLabel="Back"
              accessibilityState={{ disabled: isFirst }}
            >
              <Text style={[styles.footerLink, isFirst && styles.footerDisabled]}>
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={skip}
              activeOpacity={0.65}
              style={styles.footerHit}
              accessibilityRole="button"
              accessibilityLabel="Skip"
            >
              <Text style={styles.footerLink}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const RADIUS = UtilityMethods.wp(4);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  hero: {
    width: '100%',
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: Colors.inputBackground,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bottom: {
    flex: 1,
    backgroundColor: Colors.white,
    position: 'relative',
  },
  bottomInner: {
    flex: 1,
    paddingHorizontal: UtilityMethods.wp(6),
    paddingTop: UtilityMethods.hp(2),
    zIndex: 1,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UtilityMethods.hp(2),
  },
  pill: {
    width: UtilityMethods.wp(8),
    height: UtilityMethods.hp(1),
    borderRadius: UtilityMethods.hp(0.5),
    backgroundColor: PURPLE,
    marginHorizontal: UtilityMethods.wp(1),
  },
  dot: {
    width: UtilityMethods.wp(2),
    height: UtilityMethods.wp(2),
    borderRadius: UtilityMethods.wp(1),
    backgroundColor: INACTIVE_DOT,
    marginHorizontal: UtilityMethods.wp(1),
  },
  title: {
    fontSize: FontSize.VALUE(22),
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginTop: UtilityMethods.hp(20),
    marginBottom: UtilityMethods.hp(1.25),
  },
  description: {
    fontSize: FontSize.VALUE(14),
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: FontSize.VALUE(22),
    marginBottom: UtilityMethods.hp(2.5),
    paddingHorizontal: UtilityMethods.wp(1),
  },
  nextBtn: {
    backgroundColor: PURPLE,
    borderRadius: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(1.75),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '70%',
    marginBottom: UtilityMethods.hp(2.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  nextLabel: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.white,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: UtilityMethods.hp(1),
  },
  footerHit: {
    paddingVertical: UtilityMethods.hp(1),
    paddingHorizontal: UtilityMethods.wp(2),
    minWidth: UtilityMethods.wp(18),
  },
  footerLink: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '500',
    color: Colors.textGrey,
  },
  footerDisabled: {
    color: Colors.borderGrey,
    opacity: 0.5,
  },
});
