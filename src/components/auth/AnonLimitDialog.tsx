import { Flame, Heart, History, LogIn } from "lucide-react";
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
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { ANON_DAILY_LIMIT } from "@/lib/anonLimit";

interface AnonLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AnonLimitDialog = ({
  open,
  onOpenChange,
}: AnonLimitDialogProps) => {
  const { login, isLoading, authProvider } = useAuth();
  const isAuth0 = authProvider === "auth0";

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
            Unlimited workouts &amp; daily streak
          </li>
          <li className="flex items-center gap-2">
            <History
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            Full workout history
          </li>
          <li className="flex items-center gap-2">
            <Heart className="h-4 w-4 shrink-0 text-rose-500" aria-hidden />
            Favorite workouts to revisit
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
            {isAuth0 ? (
              <LogIn className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <GoogleIcon className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {isAuth0 ? "Sign in or create account" : "Sign in with Google"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
