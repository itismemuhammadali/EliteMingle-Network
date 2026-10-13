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
];

