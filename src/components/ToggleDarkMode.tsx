import { Moon, Sun, User, History, Menu, LayoutDashboard } from "lucide-react";
import { isAdminUser } from "@/lib/admin";
import { Link } from "react-router-dom";
import { useTheme } from "@/ThemeProvider";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { LoginButton, LogoutButton } from "./auth";
import { BillingMenuItem } from "./billing/BillingMenuItem";
import { useAuth, useUser } from "../hooks/useAuth";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import UnitSelector from "./UnitSelector";
import { useWeightUnit } from "@/contexts/WeightUnitContext";

function ThemeToggleRow() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      className="flex h-11 w-full items-center justify-between gap-3 rounded-md px-4 text-sm font-normal"
      role="group"
      aria-label="Theme"
    >
      <span className="text-foreground">Theme</span>
      <div className="flex items-center gap-2 shrink-0">
        <Sun className="h-4 w-4 text-muted-foreground" aria-hidden />
        <Switch
          id="dark-mode-sheet"
          checked={theme === "dark"}
          onCheckedChange={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
        />
        <Moon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}

function profileLabel(u: ReturnType<typeof useUser>) {
  if (!u) return "Profile";
  return (u.name || u.email || u.id || "Profile").trim() || "Profile";
}

export function ToggleDarkMode() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const user = useUser();
  const profileName = profileLabel(user);
  const showAdmin = isAuthenticated && isAdminUser(user);
  const { weightUnit, setWeightUnit } = useWeightUnit();

  return (
    <>
      {/* Mobile: menu left, profile right (theme in menu) */}
      <div className="flex md:hidden w-full items-center justify-between gap-2 mb-2 px-1">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[min(100vw-2rem,20rem)] flex-col">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Account, navigation, and display
              </SheetDescription>
            </SheetHeader>
            <nav
              className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto"
              aria-label="Main menu"
            >
              <div className="mb-4 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <p
                      className="truncate px-4 text-sm font-medium text-foreground"
                      title={profileName}
                    >
                      {profileName}
                    </p>
                    <LogoutButton className="h-11 w-full justify-start px-4" />
                  </>
                ) : (
                  <LoginButton fullWidth />
                )}
              </div>
              <Separator className="my-2" />
              {isAuthenticated && (
                <>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="h-11 w-full justify-start gap-2 font-normal"
                      asChild
                    >
                      <Link to="/profile">
                        <User className="h-4 w-4 shrink-0" />
                        Profile
                      </Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="h-11 w-full justify-start gap-2 font-normal"
                      asChild
                    >
                      <Link to="/history">
                        <History className="h-4 w-4" />
                        Workout history
                      </Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <BillingMenuItem variant="sheet" />
                  </SheetClose>
                  {showAdmin && (
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="h-11 w-full justify-start gap-2 font-normal"
                        asChild
                      >
                        <Link to="/admin">
                          <LayoutDashboard className="h-4 w-4 shrink-0" />
                          Admin
                        </Link>
                      </Button>
                    </SheetClose>
                  )}
                  <Separator className="my-2" />
                </>
              )}
              <div className="space-y-2 px-4 py-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Weight Units
                </p>
                <UnitSelector
                  value={weightUnit}
                  onValueChange={setWeightUnit}
                  compact
                />
              </div>
              <Separator className="my-2" />
              <ThemeToggleRow />
            </nav>
          </SheetContent>
        </Sheet>
        {isAuthenticated && (
          <div className="flex min-w-0 flex-1 justify-end">
            <Button asChild variant="outline" size="sm" className="h-9 shrink-0">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-2"
              >
                <User className="h-4 w-4 shrink-0" />
                Profile
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Desktop / tablet: full header row */}
      <div className="mb-2 hidden items-center justify-between md:flex">
        <div className="flex items-center space-x-2">
          {isAuthenticated && <LogoutButton />}
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <>
              <Button asChild variant="ghost" size="sm" className="max-w-[min(18rem,40vw)]">
                <Link
                  to="/profile"
                  className="inline-flex min-w-0 max-w-full items-center gap-2"
                  title={user?.email || user?.id}
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate text-sm font-medium">
                    {profileName}
                  </span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/history">
                  <History className="h-4 w-4" />
                  <span className="sr-only">Workout History</span>
                </Link>
              </Button>
              <BillingMenuItem variant="header" />
              {showAdmin && (
                <Button asChild variant="ghost" size="sm" title="Admin">
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="sr-only">Admin</span>
                  </Link>
                </Button>
              )}
            </>
          )}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90" />
          <Switch
            id="dark-mode"
            checked={theme === "dark"}
            onCheckedChange={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          />
          <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0 dark:scale-100" />
        </div>
      </div>
    </>
  );
}
