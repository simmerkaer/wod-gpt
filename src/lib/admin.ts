import type { User } from "@/types/auth";

function allowlist(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;
  return (raw || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Match server ADMIN_EMAILS (emails + optional GitHub username). */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const allowed = allowlist();
  if (!allowed.length) return false;
  const emails = [
    user.email,
    user.claims?.email,
    user.claims?.emailaddress,
    user.claims?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ],
  ]
    .filter(Boolean)
    .map((e) => String(e).toLowerCase());
  const name = (user.name || "").toLowerCase();
  const id = (user.id || "").toLowerCase();
  return allowed.some(
    (a) => emails.includes(a) || name === a || id === a,
  );
}
