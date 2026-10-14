import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@epm_onboarding_completed_v1';

let inMemoryOnboardingCompleted = false;

/**
 * Checks whether the user has completed or skipped the initial onboarding slides.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (value === 'true') {
      inMemoryOnboardingCompleted = true;
      return true;
    }
  } catch (err) {
    console.warn('Failed to read onboarding state from AsyncStorage:', err);
  }
  return inMemoryOnboardingCompleted;
}

/**
 * Marks onboarding as completed in persistent storage so returning users bypass it.
 */
export async function markOnboardingCompleted(): Promise<void> {
  inMemoryOnboardingCompleted = true;
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (err) {
    console.warn('Failed to save onboarding state in AsyncStorage:', err);
  }
}

/**
 * Resets onboarding state (useful for testing or profile reset).
 */
export async function resetOnboardingState(): Promise<void> {
  inMemoryOnboardingCompleted = false;
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (err) {
    console.warn('Failed to reset onboarding state in AsyncStorage:', err);
  }
}
