import { CheckCircle2, Flame, History, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ANON_DAILY_LIMIT } from "@/lib/anonLimit";

interface AnonLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AnonLimitDialog = ({
  open,
  onOpenChange,
}: AnonLimitDialogProps) => {
  const { login, isLoading } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You've hit today's free limit</DialogTitle>
          <DialogDescription>
            You've used your {ANON_DAILY_LIMIT} free workouts for today. Sign in
            to keep going — it's free and takes a few seconds.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Flame className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
            Unlimited workouts &amp; weekly streak
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
