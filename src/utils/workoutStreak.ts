/**
 * Weekly workout streak utilities.
 *
 * A "completed workout" is one with a `completedAt` ISO timestamp set by the
 * user. Streaks count consecutive ISO weeks (Monday–Sunday) containing at
 * least one completed workout.
 */

type WorkoutLike = { completedAt?: string | null };

/**
 * Returns an ISO week key like "2026-21" for the given date, using
 * Monday-as-first-day-of-week semantics (matching ISO-8601).
 */
export function getIsoWeekKey(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // Shift to the Thursday of the same ISO week (Mon=0..Sun=6).
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${d.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
}

function buildCompletedWeekSet(workouts: WorkoutLike[]): Set<string> {
  const weeks = new Set<string>();
  for (const w of workouts) {
    if (!w.completedAt) continue;
    const d = new Date(w.completedAt);
    if (Number.isNaN(d.getTime())) continue;
    weeks.add(getIsoWeekKey(d));
  }
  return weeks;
}

/**
 * Current streak = number of consecutive ISO weeks (counting back from this
 * week, or last week if nothing is completed in the current week yet) that
 * contain at least one completed workout.
 */
export function computeCurrentWorkoutStreak(workouts: WorkoutLike[]): number {
  const weeks = buildCompletedWeekSet(workouts);
  if (weeks.size === 0) return 0;

  const cursor = new Date();
  if (!weeks.has(getIsoWeekKey(cursor))) {
    cursor.setDate(cursor.getDate() - 7);
  }

  let streak = 0;
  while (weeks.has(getIsoWeekKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/**
 * Longest streak = max run of consecutive ISO weeks (each containing ≥1
 * completed workout) anywhere in the user's history.
 */
export function computeLongestWorkoutStreak(workouts: WorkoutLike[]): number {
  const weeks = buildCompletedWeekSet(workouts);
  if (weeks.size === 0) return 0;

  // Walk from the earliest completion week forward, week by week, tracking
  // longest run of "present" weeks.
  let earliest: Date | null = null;
  for (const w of workouts) {
    if (!w.completedAt) continue;
    const d = new Date(w.completedAt);
    if (Number.isNaN(d.getTime())) continue;
    if (!earliest || d < earliest) earliest = d;
  }
  if (!earliest) return 0;

  const cursor = new Date(earliest);
  const today = new Date();
  let longest = 0;
  let current = 0;
  while (cursor <= today) {
    if (weeks.has(getIsoWeekKey(cursor))) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
    cursor.setDate(cursor.getDate() + 7);
  }
  return longest;
}
