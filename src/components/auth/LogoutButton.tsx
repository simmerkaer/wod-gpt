import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
}

export const LogoutButton = ({ className }: LogoutButtonProps) => {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      onClick={logout}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className={cn("gap-2", className)}
    >
      <LogOut size={16} />
      Sign Out
    </Button>
  );
};