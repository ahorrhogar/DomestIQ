import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  acceptAllCookies,
  canUseAnalytics as canUseAnalyticsFromService,
  dispatchOpenCookieSettings,
  getCookieConsentState,
  hasConsent as hasConsentFromService,
  rejectOptionalCookies,
  saveCookiePreferences,
  subscribeCookieConsent,
  type CookieConsentState,
} from "@/services/cookieConsentService";

interface CookieConsentContextValue {
  consent: CookieConsentState;
  isBannerVisible: boolean;
  isSettingsOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: { analytics: boolean; marketing: boolean }) => void;
  canUseAnalytics: () => boolean;
  hasConsent: () => boolean;
  openCookieSettings: () => void;
  closeCookieSettings: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentState>(() => getCookieConsentState());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    return subscribeCookieConsent((state) => {
      setConsent(state);
    });
  }, []);

  useEffect(() => {
    const handler = () => setIsSettingsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      isBannerVisible: consent.decision === "unset",
      isSettingsOpen,
      acceptAll: () => {
        acceptAllCookies();
        setIsSettingsOpen(false);
      },
      rejectAll: () => {
        rejectOptionalCookies();
        setIsSettingsOpen(false);
      },
      savePreferences: (preferences) => {
        saveCookiePreferences(preferences);
        setIsSettingsOpen(false);
      },
      canUseAnalytics: () => canUseAnalyticsFromService(),
      hasConsent: () => hasConsentFromService(),
      openCookieSettings: () => {
        dispatchOpenCookieSettings();
      },
      closeCookieSettings: () => {
        setIsSettingsOpen(false);
      },
    }),
    [consent, isSettingsOpen],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsentContext(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsentContext must be used within CookieConsentProvider");
  }

  return context;
}
