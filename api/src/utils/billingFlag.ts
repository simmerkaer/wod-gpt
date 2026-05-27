/**
 * Feature flag for the billing/subscription feature.
 *
 * Controlled by the BILLING_ALLOWLIST env var (comma-separated emails):
 *   - unset / empty  -> billing OFF for everyone (UI hidden, no daily cap)
 *   - "a@x.com,b@y"  -> billing ON only for those emails
 *   - "*"            -> billing ON for everyone (launch)
 *
 * Lets us deploy the code to prod while only the allowlisted accounts see the
 * subscription UI and have the daily cap enforced. Everyone else gets the
 * pre-billing behaviour (logged-in = unlimited).
 */
function parseAllowlist(): { all: boolean; emails: string[] } {
  const raw = process.env.BILLING_ALLOWLIST || '';
  const entries = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return { all: entries.includes('*'), emails: entries };
}

export function isBillingEnabledForEmail(email?: string): boolean {
  const { all, emails } = parseAllowlist();
  if (all) return true;
  if (!email) return false;
  return emails.includes(email.toLowerCase());
}
