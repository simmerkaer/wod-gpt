import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/ThemeProvider";
import { Switch } from "./ui/switch";

export function ToggleDarkMode() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex justify-end items-center space-x-2 mb-2">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90" />
      <Switch
        id="dark-mode"
        checked={theme === "dark"}
        onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0 dark:scale-100" />
    </div>
  );
}
