import { en } from '../localization/translations/en';
import { es } from '../localization/translations/es';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export type LanguageCode = 'en' | 'es';

const translations: Record<LanguageCode, typeof en> = {
  en,
  es,
};

let currentLanguage: LanguageCode = 'en';
type Listener = (lang: LanguageCode) => void;
const listeners = new Set<Listener>();

export const getLanguage = (): LanguageCode => currentLanguage;

export const setLanguage = async (lang: LanguageCode): Promise<void> => {
  if (lang !== 'en' && lang !== 'es') return;
  currentLanguage = lang;
  listeners.forEach(cb => {
    try {
      cb(lang);
    } catch (e) {
      console.warn('Language listener error:', e);
    }
  });

  const uid = auth().currentUser?.uid;
  if (uid) {
    try {
      await firestore().collection('users').doc(uid).set(
        { preferredLanguage: lang },
        { merge: true },
      );
    } catch (e) {
      console.warn('Failed to persist preferredLanguage in Firestore:', e);
    }
  }
};

export const subscribeLanguage = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const initLanguageFromProfile = async (): Promise<LanguageCode> => {
  const uid = auth().currentUser?.uid;
  if (uid) {
    try {
      const doc = await firestore().collection('users').doc(uid).get();
      const lang = doc.data()?.preferredLanguage;
      if (lang === 'en' || lang === 'es') {
        currentLanguage = lang;
        listeners.forEach(cb => cb(lang));
        return lang;
      }
    } catch (e) {
      console.warn('Failed to load preferredLanguage:', e);
    }
  }
  return currentLanguage;
};

/**
 * Nested key lookup, e.g. t('adminSettings.title')
 */
export const t = (path: string, fallback?: string): string => {
  const dict = translations[currentLanguage] || translations.en;
  const parts = path.split('.');
  let curr: any = dict;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in curr) {
      curr = curr[part];
    } else {
      curr = undefined;
      break;
    }
  }

  if (typeof curr === 'string') {
    return curr;
  }

  // Fallback to English dictionary if current is Spanish
  if (currentLanguage !== 'en') {
    let enCurr: any = translations.en;
    for (const part of parts) {
      if (enCurr && typeof enCurr === 'object' && part in enCurr) {
        enCurr = enCurr[part];
      } else {
        enCurr = undefined;
        break;
      }
    }
    if (typeof enCurr === 'string') {
      return enCurr;
    }
  }

  return fallback !== undefined ? fallback : path;
};
