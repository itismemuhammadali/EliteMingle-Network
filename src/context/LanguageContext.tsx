import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  LanguageCode,
  getLanguage,
  setLanguage as setLangService,
  subscribeLanguage,
  initLanguageFromProfile,
  t as translateHelper,
} from '../services/localizationService';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (path: string, fallback?: string) => string;
  isSpanish: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (path: string, fallback?: string) => fallback || path,
  isSpanish: false,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(getLanguage());

  useEffect(() => {
    initLanguageFromProfile().then(lang => setLanguageState(lang));
    const unsubscribe = subscribeLanguage(lang => {
      setLanguageState(lang);
    });
    return () => unsubscribe();
  }, []);

  const handleSetLanguage = useCallback(async (newLang: LanguageCode) => {
    await setLangService(newLang);
    setLanguageState(newLang);
  }, []);

  const t = useCallback(
    (path: string, fallback?: string) => {
      return translateHelper(path, fallback);
    },
    // re-trigger when language updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t,
      isSpanish: language === 'es',
    }),
    [language, handleSetLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
};
