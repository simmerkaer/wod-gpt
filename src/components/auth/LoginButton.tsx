import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { GoogleIcon } from "../icons/GoogleIcon";
import { LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function LoginButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const { login, isLoading, authProvider } = useAuth();
  const isAuth0 = authProvider === "auth0";

  return (
    <div className={cn("flex gap-2", fullWidth && "w-full px-4")}>
      <Button
        onClick={() => login()}
        disabled={isLoading}
        variant="outline"
        size={fullWidth ? "default" : "sm"}
        className={cn(
          "gap-2",
          fullWidth && "h-11 w-full justify-start px-4 font-normal",
        )}
      >
        {isAuth0 ? (
          <LogIn className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <GoogleIcon className="h-4 w-4 shrink-0" aria-hidden />
        )}
        {isAuth0 ? "Sign in or create account" : "Sign In With Google"}
      </Button>
    </div>
  );
}
