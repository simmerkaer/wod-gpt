import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { loadGoogleAnalytics } from "@/lib/analytics";

export type ConsentChoice = "granted" | "denied";

const STORAGE_KEY = "wod-gpt:cookie-consent";

interface CookieConsentValue {
  /** null = the user hasn't chosen yet (show the banner). */
  consent: ConsentChoice | null;
  accept: () => void;
  decline: () => void;
  /** Clear the stored choice so the banner shows again. */
  reset: () => void;
}

const CookieConsentContext = createContext<CookieConsentValue | undefined>(
  undefined,
);

function readStored(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "granted" || raw === "denied" ? raw : null;
  } catch {
    return null;
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  // Load the persisted choice on mount and start analytics if already granted.
  useEffect(() => {
    const stored = readStored();
    setConsent(stored);
    if (stored === "granted") {
      loadGoogleAnalytics();
    }
  }, []);

  const persist = useCallback((choice: ConsentChoice) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* storage unavailable — keep in-memory only */
    }
    setConsent(choice);
  }, []);

  const accept = useCallback(() => {
    persist("granted");
    loadGoogleAnalytics();
  }, [persist]);

  const decline = useCallback(() => {
    persist("denied");
    // GA is never loaded; nothing to tear down on the current page load.
  }, [persist]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setConsent(null);
  }, []);

  return (
    <CookieConsentContext.Provider value={{ consent, accept, decline, reset }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider",
    );
  }
  return ctx;
}
