/**
 * Current streak = consecutive local calendar days with at least one saved workout,
 * counting backward from today (or from yesterday if nothing saved today yet).
 */
export function computeCurrentWorkoutStreak(
  workouts: { completedAt?: string; savedAt: string }[],
): number {
  if (!workouts.length) return 0;

  const dates = new Set<string>();
  for (const w of workouts) {
    const d = new Date(w.completedAt || w.savedAt);
    if (Number.isNaN(d.getTime())) continue;
    dates.add(d.toDateString());
  }
  if (dates.size === 0) return 0;

  const today = new Date();
  const cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  if (!dates.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dates.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
