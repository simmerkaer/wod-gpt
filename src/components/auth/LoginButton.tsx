import { LogIn } from "lucide-react";
import { Button } from "../ui/button";
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
        <LogIn size={16} />
        Sign In With Google
      </Button>
    </div>
  );
};
