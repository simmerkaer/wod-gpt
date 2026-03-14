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
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import { formatWorkoutDateTime } from "@/utils/DateHelpers";

type AdminUserRow = {
  userId: string;
  workoutCount: number;
  favoriteCount: number;
  /** API: last workout generation (system.generated) or save time (savedAt). */
  lastWorkoutAt?: string;
};

type UserSortKey = "userId" | "lastWorkoutAt" | "workoutCount" | "favoriteCount";
type SortDir = "asc" | "desc";

function compareUserRows(
  a: AdminUserRow,
  b: AdminUserRow,
  key: UserSortKey,
  dir: SortDir,
): number {
  const mul = dir === "asc" ? 1 : -1;
  if (key === "userId") {
    return mul * a.userId.localeCompare(b.userId, undefined, { sensitivity: "base" });
  }
  if (key === "workoutCount" || key === "favoriteCount") {
    return mul * (a[key] - b[key]);
  }
  // lastWorkoutAt — missing sorts last when asc (oldest empty), first when desc... actually put missing at end always
  const ta = a.lastWorkoutAt ? new Date(a.lastWorkoutAt).getTime() : NaN;
  const tb = b.lastWorkoutAt ? new Date(b.lastWorkoutAt).getTime() : NaN;
  const aMissing = Number.isNaN(ta);
  const bMissing = Number.isNaN(tb);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1; // a after b
  if (bMissing) return -1;
  return mul * (ta - tb);
}

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
  /** Single object so Strict Mode doesn’t double-toggle via nested setState. */
  const [sort, setSort] = useState<{ key: UserSortKey; dir: SortDir }>({
    key: "userId",
    dir: "asc",
  });

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

  const userRows = stats?.users ?? [];

  const applySortColumn = useCallback((key: UserSortKey) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }, []);

  const sortedUserRows = useMemo(() => {
    if (userRows.length === 0) return userRows;
    return [...userRows].sort((a, b) =>
      compareUserRows(a, b, sort.key, sort.dir),
    );
  }, [userRows, sort.key, sort.dir]);

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

  const SortHeader = ({
    column,
    label,
    className,
    align = "left",
  }: {
    column: UserSortKey;
    label: string;
    className?: string;
    align?: "left" | "right";
  }) => {
    const active = sort.key === column;
    return (
      <TableHead className={className}>
        <button
          type="button"
          className={`inline-flex w-full items-center gap-1 rounded-md px-1 py-1.5 text-left text-sm font-medium hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            align === "right" ? "justify-end" : "justify-start"
          }`}
          onClick={() => applySortColumn(column)}
          aria-sort={
            active
              ? sort.dir === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
        >
          <span>{label}</span>
          {active ? (
            sort.dir === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
          )}
        </button>
      </TableHead>
    );
  };

  return (
    <div className="mx-auto min-w-0 max-w-4xl px-4 py-6 sm:py-10">
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
        <CardContent className="min-w-0 px-3 sm:px-6">
          {userRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No saved workouts yet.
            </p>
          ) : (
            <>
              {/* Mobile: sort controls + stacked cards */}
              <div className="mb-3 flex flex-col gap-2 sm:hidden">
                <span className="text-xs font-medium text-muted-foreground">
                  Sort by
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["userId", "User"],
                      ["lastWorkoutAt", "Last workout"],
                      ["workoutCount", "Workouts"],
                      ["favoriteCount", "Favorites"],
                    ] as const
                  ).map(([key, label]) => {
                    const active = sort.key === key;
                    return (
                      <Button
                        key={key}
                        type="button"
                        variant={active ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => applySortColumn(key)}
                      >
                        {label}
                        {active &&
                          (sort.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" aria-hidden />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden />
                          ))}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <ul className="max-h-[min(70vh,28rem)] space-y-3 overflow-y-auto pr-1 sm:hidden">
                {sortedUserRows.map((row) => (
                  <li
                    key={row.userId}
                    className="rounded-lg border bg-card p-3 text-left text-sm shadow-sm"
                  >
                    <p
                      className="break-all font-medium leading-snug"
                      title={row.userId}
                    >
                      {row.userId}
                    </p>
                    <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <dt className="col-span-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground/90">
                        Last workout
                      </dt>
                      <dd className="col-span-2 tabular-nums text-foreground">
                        {row.lastWorkoutAt
                          ? formatWorkoutDateTime(row.lastWorkoutAt)
                          : "—"}
                      </dd>
                      <dt>Workouts</dt>
                      <dd className="text-right font-medium tabular-nums text-foreground">
                        {row.workoutCount}
                      </dd>
                      <dt>Favorites</dt>
                      <dd className="text-right font-medium tabular-nums text-foreground">
                        {row.favoriteCount}
                      </dd>
                    </dl>
                  </li>
                ))}
              </ul>
              {/* sm+: table with horizontal scroll if needed */}
              <div className="hidden max-h-[min(70vh,28rem)] overflow-auto rounded-md border sm:block">
                <Table className="min-w-[28rem]">
                  <TableHeader className="sticky top-0 z-[1] bg-muted/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-muted/80 [&_tr]:border-b">
                    <TableRow className="hover:bg-transparent">
                      <SortHeader column="userId" label="User" />
                      <SortHeader
                        column="lastWorkoutAt"
                        label="Last workout"
                        className="whitespace-nowrap"
                      />
                      <SortHeader
                        column="workoutCount"
                        label="Workouts"
                        className="tabular-nums"
                        align="right"
                      />
                      <SortHeader
                        column="favoriteCount"
                        label="Favorites"
                        className="tabular-nums"
                        align="right"
                      />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUserRows.map((row) => (
                      <TableRow key={row.userId}>
                        <TableCell
                          className="max-w-[12rem] break-all font-medium lg:max-w-none"
                          title={row.userId}
                        >
                          {row.userId}
                        </TableCell>
                        <TableCell
                          className="whitespace-nowrap text-left text-muted-foreground tabular-nums"
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
            </>
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
