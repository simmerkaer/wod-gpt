/**
 * Locale-aware dates with unambiguous month names; 24h times (e.g. 16:57).
 */

const workoutDateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const workoutDateTimeOptions: Intl.DateTimeFormatOptions = {
  ...workoutDateOptions,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

export function formatWorkoutDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(undefined, workoutDateOptions).format(d);
}

export function formatWorkoutDateTime(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(undefined, workoutDateTimeOptions).format(d);
}

/** e.g. "2025-03" → locale month + year (unambiguous) */
export function formatYearMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return yearMonth;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
