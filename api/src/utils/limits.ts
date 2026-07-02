/**
 * Free-tier generation limits, enforced server-side in generateWod and
 * reported by /api/billing/status. Subscribers are unlimited.
 */

/** Free generations per day for logged-in users without an active subscription. */
export const DAILY_FREE_LIMIT = 1;

/** Free generations per day for anonymous visitors, keyed by hashed client IP. */
export const ANON_DAILY_LIMIT = 1;
