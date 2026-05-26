import Stripe from 'stripe';

let cached: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  cached = new Stripe(key, {
    appInfo: { name: 'wod-gpt', version: '1.0.0' },
  });
  return cached;
}

export interface PlanInfo {
  priceId: string;
  /** Amount in the smallest currency unit (e.g. cents/øre). */
  unitAmount: number;
  currency: string;
  /** "month" / "year" / etc. */
  interval: string;
  intervalCount: number;
}

const PLAN_CACHE_TTL_MS = 5 * 60 * 1000;
let planCache: { value: PlanInfo; expiresAt: number } | null = null;

/** Fetch the configured Stripe Price's display details, cached for 5 min. */
export async function getPlanInfo(): Promise<PlanInfo | null> {
  if (planCache && planCache.expiresAt > Date.now()) return planCache.value;
  let priceId: string;
  try {
    priceId = getStripePriceId();
  } catch {
    return null;
  }
  try {
    const price = await getStripeClient().prices.retrieve(priceId);
    if (
      price.recurring &&
      typeof price.unit_amount === 'number' &&
      price.currency
    ) {
      const info: PlanInfo = {
        priceId,
        unitAmount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring.interval,
        intervalCount: price.recurring.interval_count ?? 1,
      };
      planCache = { value: info, expiresAt: Date.now() + PLAN_CACHE_TTL_MS };
      return info;
    }
  } catch {
    return null;
  }
  return null;
}

export function getStripePriceId(): string {
  const id = process.env.STRIPE_PRICE_ID;
  if (!id) throw new Error('STRIPE_PRICE_ID is not configured');
  return id;
}

export function getStripeWebhookSecret(): string {
  const s = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  return s;
}

export function getAppBaseUrl(request: { headers: { get(name: string): string | null } }): string {
  const configured = process.env.PUBLIC_APP_BASE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) return `${proto}://${host}`;
  return 'http://localhost:4280';
}
