import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";

export const LogoutButton = () => {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      onClick={logout}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className="gap-2"
    >
      <LogOut size={16} />
      Sign Out
    </Button>
  );
};