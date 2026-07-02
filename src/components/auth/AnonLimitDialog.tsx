import { CheckCircle2, Flame, History, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AnonLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AnonLimitDialog = ({
  open,
  onOpenChange,
}: AnonLimitDialogProps) => {
  const { isAuthenticated, login, isLoading } = useAuth();
  const { subscribe, actionPending, dailyLimit, planPriceLabel } =
    useSubscription();

  const limit = dailyLimit ?? 1;

  if (isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>You've hit today's free limit</DialogTitle>
            <DialogDescription>
              You've used your {limit} free workout{limit === 1 ? "" : "s"} for
              today.
              {planPriceLabel ? (
                <>
                  {" "}Subscribe for{" "}
                  <span className="font-semibold text-foreground">
                    {planPriceLabel}
                  </span>{" "}
                  and generate as many as you want — cancel anytime.
                </>
              ) : (
                <>
                  {" "}Subscribe to generate as many as you want — cancel
                  anytime.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
              Unlimited workouts every day
            </li>
            <li className="flex items-center gap-2">
              <Flame className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
              Keep your streak going without limits
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-green-600"
                aria-hidden
              />
              Cancel any time from the customer portal
            </li>
          </ul>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={actionPending}
            >
              Maybe later
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={() => subscribe()}
              disabled={actionPending}
            >
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              {actionPending ? "Redirecting…" : "Subscribe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You've hit today's free limit</DialogTitle>
          <DialogDescription>
            You've used your {limit} free workout{limit === 1 ? "" : "s"} for
            today. Create a free account and subscribe for unlimited workouts —
            it takes a few seconds.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
            Subscribe for unlimited workouts every day
          </li>
          <li className="flex items-center gap-2">
            <Flame className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
            Track your weekly streak
          </li>
          <li className="flex items-center gap-2">
            <History
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Full workout history
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-green-600"
              aria-hidden
            />
            Mark workouts completed to grow your streak
          </li>
        </ul>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Maybe later
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={() => login()}
            disabled={isLoading}
          >
            <LogIn className="h-4 w-4 shrink-0" aria-hidden />
            Sign in or create account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
