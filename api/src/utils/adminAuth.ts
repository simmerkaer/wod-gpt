/**
 * Parse SWA x-ms-client-principal and check allowlist (emails + userDetails, e.g. GitHub login).
 */
export function parseClientPrincipalHeader(
  base64Principal: string,
): { userDetails: string; userId: string; claims: Record<string, string> } | null {
  try {
    const json = Buffer.from(base64Principal, 'base64').toString();
    const p = JSON.parse(json) as {
      userDetails?: string;
      userId?: string;
      claims?: { typ: string; val: string }[];
    };
    const claims: Record<string, string> = {};
    for (const c of p.claims || []) {
      claims[c.typ] = c.val;
    }
    return {
      userDetails: (p.userDetails || '').trim(),
      userId: (p.userId || '').trim(),
      claims,
    };
  } catch {
    return null;
  }
}

function principalEmails(claims: Record<string, string>): string[] {
  // Auth0 emits email_verified; refuse to consider unverified emails for admin auth.
  if (claims.email_verified === 'false') return [];

  const out: string[] = [];
  const keys = [
    'email',
    'emails',
    'emailaddress',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  ];
  for (const k of keys) {
    const v = claims[k];
    if (v && typeof v === 'string') {
      if (k === 'emails' && v.startsWith('[')) {
        try {
          const arr = JSON.parse(v) as string[];
          out.push(...arr.filter(Boolean));
        } catch {
          out.push(v);
        }
      } else {
        out.push(v);
      }
    }
  }
  return out.map((e) => e.toLowerCase().trim()).filter(Boolean);
}

export function isAllowlistedAdmin(
  base64Principal: string,
  allowlistRaw: string | undefined,
): boolean {
  const allowed = (allowlistRaw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.length) return false;

  const parsed = parseClientPrincipalHeader(base64Principal);
  if (!parsed) return false;

  const emails = principalEmails(parsed.claims);
  const details = parsed.userDetails.toLowerCase();
  const userId = parsed.userId.toLowerCase();

  for (const a of allowed) {
    if (emails.includes(a)) return true;
    if (details === a) return true;
    if (userId === a) return true;
  }
  return false;
}
