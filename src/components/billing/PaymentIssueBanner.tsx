import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { useSubscription, SubscriptionStatus } from "@/hooks/useSubscription";

const ATTENTION_STATUSES: SubscriptionStatus[] = [
  "past_due",
  "unpaid",
  "incomplete",
];

const STATUS_MESSAGES: Partial<Record<SubscriptionStatus, string>> = {
  past_due:
    "Your last payment failed. Update your payment method to keep unlimited workouts.",
  unpaid:
    "Your subscription is unpaid. Update your payment method to restore unlimited workouts.",
  incomplete:
    "Your subscription needs a quick step to finish. Open the billing portal to complete it.",
};

export const PaymentIssueBanner = () => {
  const { data, manage, actionPending, isLoading } = useSubscription();
  const status = data?.status;

  if (isLoading || !status || !ATTENTION_STATUSES.includes(status)) {
    return null;
  }

  const message = STATUS_MESSAGES[status] ?? STATUS_MESSAGES.past_due!;

  return (
    <div
      role="alert"
      className="mx-2 sm:mx-0 mb-3 flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>{message}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="self-stretch sm:self-auto"
        onClick={() => manage()}
        disabled={actionPending}
      >
        {actionPending ? "Opening…" : "Update payment method"}
      </Button>
    </div>
  );
};
