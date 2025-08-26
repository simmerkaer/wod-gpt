import { Moon, Sun, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/ThemeProvider";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { AuthButton, UserProfile } from "./auth";
import { useAuth } from "../hooks/useAuth";

export function ToggleDarkMode() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center space-x-2">
        <UserProfile />
        <AuthButton />
      </div>
      <div className="flex items-center space-x-2">
        {isAuthenticated && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/profile">
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        )}
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90" />
        <Switch
          id="dark-mode"
          checked={theme === "dark"}
          onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0 dark:scale-100" />
      </div>
    </div>
  );
}
