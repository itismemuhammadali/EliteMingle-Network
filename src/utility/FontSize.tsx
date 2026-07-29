import { useMemo } from 'react';
import { RFValue } from './ResponsiveSize.tsx';
import { store } from '../redux/store';
import { useAppSelector } from '../redux/hooks';

const SIMPLIFIED_UI_FONT_BUMP = 7;

function getSimplifiedFontBump(): number {
  const s = store.getState();
  if (s.user && s.simplifiedUi) {
    return SIMPLIFIED_UI_FONT_BUMP;
  }
  return 0;
}

/** User-chosen font-size preference (points), applied in the user flow. */
function getFontScale(): number {
  const s = store.getState();
  return s.user && typeof s.fontScale === 'number' ? s.fontScale : 0;
}

const FontSize = {
  // EXAMPLE: require("your path") | File
  BODY_TEXT: RFValue(16),
  VALUE: (number: number) =>
    RFValue(number + getSimplifiedFontBump() + getFontScale()),
};

/**
 * Use for StyleSheets that call FontSize.VALUE so they recompute when
 * Simplified UI toggles (module-level StyleSheet.create only runs once).
 */
export function useUserFontStyles<T>(createStyles: () => T): T {
  const simplifiedUi = useAppSelector(state => state.simplifiedUi);
  const user = useAppSelector(state => state.user);
  const fontScale = useAppSelector(state => state.fontScale);
  return useMemo(() => createStyles(), [simplifiedUi, user, fontScale]);
}

export default FontSize;
