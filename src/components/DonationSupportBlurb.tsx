import { KoFiDonateDialog } from "@/components/KoFiDonateDialog";
import { Heart } from "lucide-react";

/**
 * Short note on running costs; "donation" opens Ko-fi embed in a dialog (mobile-friendly).
 */
export function DonationSupportBlurb() {
  return (
    <div className="text-left text-sm leading-relaxed text-muted-foreground">
      I spend around{" "}
      <strong className="font-medium text-foreground">$50/month</strong> on
      hosting and AI to keep this site running. Any{" "}
      <KoFiDonateDialog>
        <button
          type="button"
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/90 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring"
        >
          donation
        </button>
      </KoFiDonateDialog>{" "}
      is welcome - thank you for helping keep WOD-GPT free{" "}
      <Heart
        className="inline-block size-3.5 align-[-0.125em] text-red-500"
        aria-hidden
        strokeWidth={2}
        fill="currentColor"
      />
    </div>
  );
}
