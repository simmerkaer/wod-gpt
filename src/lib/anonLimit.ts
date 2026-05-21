export const ANON_DAILY_LIMIT = 3;

const STORAGE_KEY = "wod-gpt:anon-generation";

type Stored = { date: string; count: number };

const today = () => new Date().toISOString().slice(0, 10);

export function readAnonCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed || parsed.date !== today()) return 0;
    return typeof parsed.count === "number" ? parsed.count : 0;
  } catch {
    return 0;
  }
}

export function incrementAnonCount(): number {
  const next = readAnonCount() + 1;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: today(), count: next } satisfies Stored),
    );
  } catch {
    // localStorage unavailable (private mode, quota); fail open
  }
  return next;
}
