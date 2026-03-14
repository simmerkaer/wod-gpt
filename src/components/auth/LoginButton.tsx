import { Button } from "../ui/button";
import { GoogleIcon } from "../icons/GoogleIcon";
import { useAuth } from "../../hooks/useAuth";

export const LoginButton = () => {
  const { login, isLoading } = useAuth();

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => login("google")}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <GoogleIcon className="h-4 w-4 shrink-0" aria-hidden />
        Sign In With Google
      </Button>
    </div>
  );
};
