import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityModal } from './AccessibilityModal';

type AccessibilityModalContextValue = {
  openAccessibilityModal: () => void;
};

const AccessibilityModalContext = createContext<
  AccessibilityModalContextValue | undefined
>(undefined);

export function AccessibilityModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const openAccessibilityModal = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const value = useMemo(
    () => ({ openAccessibilityModal }),
    [openAccessibilityModal],
  );

  return (
    <AccessibilityModalContext.Provider value={value}>
      {children}
      <AccessibilityModal visible={visible} onClose={close} />
    </AccessibilityModalContext.Provider>
  );
}

export function useAccessibilityModal(): AccessibilityModalContextValue {
  const ctx = useContext(AccessibilityModalContext);
  if (!ctx) {
    return { openAccessibilityModal: () => { } };
  }
  return ctx;
}
