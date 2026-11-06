import type { ImageSourcePropType } from 'react-native';

/**
 * Hero images for onboarding (order: Text-to-Speech → Voice Commands → Simplified Interface → Privacy & Safety).
 * Files live in `src/assets/images/` as Slide1.png … Slide4.png.
 */
export const ONBOARDING_SLIDE_IMAGES: ImageSourcePropType[] = [
  require('../assets/images/Slide1.webp'),
  require('../assets/images/Slide2.webp'),
  require('../assets/images/Slide3.webp'),
  require('../assets/images/Slide4.webp'),
];
