import { CreditCard, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

interface BillingMenuItemProps {
  /** Render as a full-width sheet row instead of a compact icon button. */
  variant?: "sheet" | "header";
  /** Optional click handler that fires before the action (e.g. closing a sheet). */
  onBeforeAction?: () => void;
}

export const BillingMenuItem = ({
  variant = "header",
  onBeforeAction,
}: BillingMenuItemProps) => {
  const { isSubscribed, subscribe, manage, actionPending, isLoading, billingEnabled } =
    useSubscription();

  if (!billingEnabled) return null;

  const handleClick = () => {
    onBeforeAction?.();
    if (isSubscribed) manage();
    else subscribe();
  };

  const label = isSubscribed ? "Manage subscription" : "Upgrade";
  const Icon = isSubscribed ? CreditCard : Sparkles;
  const disabled = actionPending || isLoading;

  if (variant === "sheet") {
    return (
      <Button
        variant="ghost"
        onClick={handleClick}
        disabled={disabled}
        className={cn("h-11 w-full justify-start gap-2 font-normal")}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {actionPending ? "Redirecting…" : label}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
};
