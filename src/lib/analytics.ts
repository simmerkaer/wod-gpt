/** Google Analytics 4 measurement ID. Not secret — safe to ship in client code. */
export const GA_MEASUREMENT_ID = "G-JJER8056TL";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Injects the Google Analytics gtag script and initialises it. Idempotent —
 * calling it more than once is a no-op. Only call this after the user has
 * consented to analytics cookies.
 */
export function loadGoogleAnalytics(): void {
  if (typeof window === "undefined") return;
  if (document.getElementById("ga-gtag")) return;

  const script = document.createElement("script");
  script.id = "ga-gtag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag relies on `arguments`, so forward them verbatim.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
}
