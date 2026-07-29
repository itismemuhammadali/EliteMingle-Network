export interface LanguageOption {
  id: string;
  /** Flag icon name from react-native-ico-flags */
  flagName: string;
  labelEn: string;
  labelNative: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: 'en',
    flagName: 'united-states-of-america',
    labelEn: 'English',
    labelNative: '(English)',
  },
  {
    id: 'es',
    flagName: 'spain',
    labelEn: 'Spanish',
    labelNative: '(Español)',
  },
  {
    id: 'fr',
    flagName: 'france',
    labelEn: 'French',
    labelNative: '(Français)',
  },
  {
    id: 'de',
    flagName: 'germany',
    labelEn: 'German',
    labelNative: '(Deutsch)',
  },
  {
    id: 'it',
    flagName: 'italy',
    labelEn: 'Italian',
    labelNative: '(Italiano)',
  },
  {
    id: 'pt',
    flagName: 'brazil',
    labelEn: 'Portuguese',
    labelNative: '(Português)',
  },
  {
    id: 'ru',
    flagName: 'russia',
    labelEn: 'Russian',
    labelNative: '(Русский)',
  },
  {
    id: 'zh',
    flagName: 'china',
    labelEn: 'Chinese (Simplified)',
    labelNative: '(简体中文)',
  },
  {
    id: 'ja',
    flagName: 'japan',
    labelEn: 'Japanese',
    labelNative: '(日本語)',
  },
  {
    id: 'ko',
    flagName: 'south-korea',
    labelEn: 'Korean',
    labelNative: '(한국어)',
  },
  {
    id: 'ar',
    flagName: 'saudi-arabia',
    labelEn: 'Arabic',
    labelNative: '(العربية)',
  },
  {
    id: 'hi',
    flagName: 'india',
    labelEn: 'Hindi',
    labelNative: '(हिन्दी)',
  },
];
