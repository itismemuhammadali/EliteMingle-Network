import type { ImageSourcePropType } from 'react-native';
import { ONBOARDING_SLIDE_IMAGES } from './onboardingSlideImages';

export type OnboardingSlide = {
  title: string;
  description: string;
  image: ImageSourcePropType;
};

const COPY: Omit<OnboardingSlide, 'image'>[] = [
  {
    title: 'Text-to-Speech',
    description:
      'Listen to posts, messages, and content read aloud with our advanced text-to-speech technology.',
  },
  {
    title: 'Voice Commands',
    description:
      'Navigate the app hands-free with voice commands. Just say what you want to do.',
  },
  {
    title: 'Simplified Interface',
    description:
      'Choose a streamlined interface with larger buttons and clearer navigation for easier use.',
  },
  {
    title: 'Privacy & Safety',
    description:
      'Your data is protected with end-to-end encryption. Report content and block users to stay safe.',
  },
];

export const ONBOARDING_SLIDES: OnboardingSlide[] = COPY.map((slide, index) => ({
  ...slide,
  image: ONBOARDING_SLIDE_IMAGES[index],
}));
