export type CookieCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type CookieDecision = "unset" | "accepted_all" | "rejected_all" | "customized";

export interface CookieConsentState {
  version: 1;
  decision: CookieDecision;
  categories: CookieCategories;
  updatedAt: string | null;
}

export const COOKIE_CONSENT_STORAGE_KEY = "homara_cookie_consent_v1";
export const OPEN_COOKIE_SETTINGS_EVENT = "homara:open-cookie-settings";

const DEFAULT_STATE: CookieConsentState = {
  version: 1,
  decision: "unset",
  categories: {
    necessary: true,
    analytics: false,
    marketing: false,
  },
  updatedAt: null,
};

type Listener = (state: CookieConsentState) => void;

let currentState: CookieConsentState = DEFAULT_STATE;
let initialized = false;
const listeners = new Set<Listener>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function sanitizeState(raw: unknown): CookieConsentState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_STATE;
  }

  const record = raw as Record<string, unknown>;
  const decisionRaw = String(record.decision || "unset");
  const decision: CookieDecision =
    decisionRaw === "accepted_all" ||
    decisionRaw === "rejected_all" ||
    decisionRaw === "customized"
      ? decisionRaw
      : "unset";

  const categoriesRaw = record.categories as Record<string, unknown> | undefined;

  return {
    version: 1,
    decision,
    categories: {
      necessary: true,
      analytics: Boolean(categoriesRaw?.analytics),
      marketing: Boolean(categoriesRaw?.marketing),
    },
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null,
  };
}

function persistState(nextState: CookieConsentState): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore storage write failures.
  }
}

function loadState(): CookieConsentState {
  if (!isBrowser()) {
    return DEFAULT_STATE;
  }

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_STATE;
    }

    return sanitizeState(JSON.parse(stored));
  } catch {
    return DEFAULT_STATE;
  }
}

function notify(): void {
  listeners.forEach((listener) => {
    listener(currentState);
  });
}

function ensureInitialized(): void {
  if (initialized) {
    return;
  }

  initialized = true;
  currentState = loadState();
}

function updateState(nextState: CookieConsentState): CookieConsentState {
  ensureInitialized();
  currentState = nextState;
  persistState(nextState);
  notify();
  return currentState;
}

export function getCookieConsentState(): CookieConsentState {
  ensureInitialized();
  return currentState;
}

export function subscribeCookieConsent(listener: Listener): () => void {
  ensureInitialized();
  listeners.add(listener);
  listener(currentState);
  return () => {
    listeners.delete(listener);
  };
}

export function acceptAllCookies(): CookieConsentState {
  return updateState({
    version: 1,
    decision: "accepted_all",
    categories: {
      necessary: true,
      analytics: true,
      marketing: true,
    },
    updatedAt: new Date().toISOString(),
  });
}

export function rejectOptionalCookies(): CookieConsentState {
  return updateState({
    version: 1,
    decision: "rejected_all",
    categories: {
      necessary: true,
      analytics: false,
      marketing: false,
    },
    updatedAt: new Date().toISOString(),
  });
}

export function saveCookiePreferences(preferences: { analytics: boolean; marketing: boolean }): CookieConsentState {
  return updateState({
    version: 1,
    decision: "customized",
    categories: {
      necessary: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
    },
    updatedAt: new Date().toISOString(),
  });
}

export function hasConsent(): boolean {
  return getCookieConsentState().decision !== "unset";
}

export function canUseAnalytics(): boolean {
  const state = getCookieConsentState();
  return state.categories.analytics;
}

export function dispatchOpenCookieSettings(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
}
