import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import Logo from '../../assets/svgs/logo.svg';

const { width: SCREEN_W } = Dimensions.get('window');

interface SplashScreenViewProps {
  onAnimationEnd?: () => void;
}

export function SplashScreenView({ onAnimationEnd }: SplashScreenViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // 1. Logo zoom & fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Text fade in
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    // 3. Subtle ambient pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, textFadeAnim, pulseAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative background overlay */}
      <Image
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Animated Logo Container */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Logo width={UtilityMethods.wp(32)} height={UtilityMethods.wp(32)} />
          </View>
        </Animated.View>

        {/* Brand Name & Tagline */}
        <Animated.View style={[styles.textWrapper, { opacity: textFadeAnim }]}>
          <Text style={styles.brandTitle}>Exceptional People</Text>
          <Text style={styles.brandSubtitle}>MINGLE</Text>
          <View style={styles.taglineBadge}>
            <Text style={styles.taglineText}>Connect • Share • Belong</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Loading Indicator */}
      <View style={styles.footer}>
        <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
        <Text style={styles.loadingText}>A Safe Space For Everyone</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B0764', // Deep rich purple
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: UtilityMethods.hp(3),
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  logoCircle: {
    width: UtilityMethods.wp(42),
    height: UtilityMethods.wp(42),
    borderRadius: UtilityMethods.wp(21),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  textWrapper: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: UtilityMethods.wp(6.5),
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: UtilityMethods.wp(5.5),
    fontWeight: '800',
    color: '#F0ABFC', // Vibrant pastel lavender-pink
    letterSpacing: 3,
    marginTop: UtilityMethods.hp(0.3),
    textAlign: 'center',
  },
  taglineBadge: {
    marginTop: UtilityMethods.hp(2),
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(0.8),
    borderRadius: UtilityMethods.wp(4),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  taglineText: {
    fontSize: UtilityMethods.wp(3.5),
    fontWeight: '600',
    color: '#FAF5FF',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: UtilityMethods.hp(6),
    alignItems: 'center',
  },
  pulseDot: {
    width: UtilityMethods.wp(2),
    height: UtilityMethods.wp(2),
    borderRadius: UtilityMethods.wp(1),
    backgroundColor: '#E879F9',
    marginBottom: UtilityMethods.hp(1),
  },
  loadingText: {
    fontSize: UtilityMethods.wp(3.2),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
