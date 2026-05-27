import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function CookieConsentBanner() {
  const { consent, accept, decline } = useCookieConsent();

  // Only show until the user makes a choice.
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use analytics cookies (Google Analytics) to understand how the site
          is used. They load only if you accept. See our{" "}
          <Link
            to="/cookies"
            className="font-medium text-primary underline underline-offset-2"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={decline}
            className="flex-1 sm:flex-initial"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="flex-1 sm:flex-initial"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
