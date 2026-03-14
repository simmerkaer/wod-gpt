import { useAuth } from "@/hooks/useAuth";
import { isAdminUser } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { formatWorkoutDateTime } from "@/utils/DateHelpers";

type AdminUserRow = {
  userId: string;
  workoutCount: number;
  favoriteCount: number;
  /** API: last workout generation (system.generated) or save time (savedAt). */
  lastWorkoutAt?: string;
};

type AdminStats = {
  userCount: number;
  totalSavedWorkouts: number;
  totalFavorites: number;
  totalGenerations: number;
  generationsToday: number;
  statsComputedAt: string;
  users?: AdminUserRow[];
  note?: string;
};

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const admin = isAdminUser(user);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/stats", { credentials: "include" });
      if (res.status === 403 || res.status === 401) {
        setError("Not authorized (check ADMIN_EMAILS matches your login).");
        setStats(null);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error || `HTTP ${res.status}`);
        setStats(null);
        return;
      }
      const data = (await res.json()) as AdminStats;
      setStats(data);
    } catch {
      setError("Failed to load stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    if (admin && isAuthenticated) void load();
  }, [admin, isAuthenticated, load]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>Sign in to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Not available</CardTitle>
            <CardDescription>
              This page is restricted. If you are the site owner, set
              VITE_ADMIN_EMAILS and ADMIN_EMAILS to your email (and redeploy).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/">Back home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRows = stats?.users ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8 text-muted-foreground" aria-hidden />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-muted-foreground">
              Owner-only analytics
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 self-start sm:self-auto"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden
          />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Users (saved)</CardTitle>
            <CardDescription className="text-xs">
              Distinct users with ≥1 saved workout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {stats?.userCount ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Saved workouts</CardTitle>
            <CardDescription className="text-xs">Total across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {stats?.totalSavedWorkouts ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Favorites</CardTitle>
            <CardDescription className="text-xs">Favorited saved workouts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {stats?.totalFavorites ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Generations</CardTitle>
            <CardDescription className="text-xs">generateWod calls (all time / today)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {stats != null ? (
                <>
                  {stats.totalGenerations}
                  <span className="ml-2 text-lg font-normal text-muted-foreground">
                    / {stats.generationsToday} today
                  </span>
                </>
              ) : (
                "—"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Users</CardTitle>
          <CardDescription className="text-xs">
            Last workout = most recent saved workout (generation time when available,
            else when saved)—PII, owner only.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {userRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No saved workouts yet.
            </p>
          ) : (
            <div className="max-h-[min(70vh,28rem)] overflow-auto rounded-md border">
              <Table className="min-w-[28rem]">
                <TableHeader className="sticky top-0 z-[1] bg-muted/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-muted/80 [&_tr]:border-b">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead className="whitespace-nowrap text-right sm:text-left">
                      Last workout
                    </TableHead>
                    <TableHead className="text-right tabular-nums">
                      Workouts
                    </TableHead>
                    <TableHead className="text-right tabular-nums">
                      Favorites
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRows.map((row) => (
                    <TableRow key={row.userId}>
                      <TableCell
                        className="max-w-[10rem] truncate font-medium sm:max-w-none sm:whitespace-normal sm:break-all"
                        title={row.userId}
                      >
                        {row.userId}
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap text-right text-muted-foreground tabular-nums sm:text-left"
                        title={row.lastWorkoutAt ?? undefined}
                      >
                        {row.lastWorkoutAt
                          ? formatWorkoutDateTime(row.lastWorkoutAt)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.workoutCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.favoriteCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {stats?.statsComputedAt && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Computed {new Date(stats.statsComputedAt).toLocaleString()}
        </p>
      )}
      {stats?.note && (
        <p className="mt-2 text-center text-xs text-muted-foreground">{stats.note}</p>
      )}

      <div className="mt-8 text-center">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
