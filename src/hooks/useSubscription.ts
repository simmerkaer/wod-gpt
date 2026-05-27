import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused"
  | "none";

export interface PlanInfo {
  priceId: string;
  /** Smallest currency unit (cents, øre, etc.). */
  unitAmount: number;
  currency: string;
  /** "month", "year", … */
  interval: string;
  intervalCount: number;
}

export interface SubscriptionStatusResponse {
  authenticated: boolean;
  /** Feature flag — when false the billing UI is hidden and no cap applies. */
  billingEnabled: boolean;
  isSubscribed: boolean;
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  dailyLimit: number | null;
  dailyUsed: number;
  remainingToday: number | null;
  plan?: PlanInfo | null;
}

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

/** Format a Stripe price for display, e.g. "$9.99 / month" or "kr 49 / month". */
export const formatPlanPrice = (plan: PlanInfo): string => {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(plan.currency.toLowerCase());
  const amount = isZeroDecimal ? plan.unitAmount : plan.unitAmount / 100;
  let priceText: string;
  try {
    priceText = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: plan.currency.toUpperCase(),
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(amount);
  } catch {
    priceText = `${amount} ${plan.currency.toUpperCase()}`;
  }
  const cadence =
    plan.intervalCount === 1
      ? `/ ${plan.interval}`
      : `every ${plan.intervalCount} ${plan.interval}s`;
  return `${priceText} ${cadence}`;
};

const STATUS_URL = "/api/billing/status";
const CHECKOUT_URL = "/api/billing/checkout";
const PORTAL_URL = "/api/billing/portal";

export const useSubscription = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<SubscriptionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(STATUS_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as SubscriptionStatusResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscription");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, isAuthenticated, refresh]);

  const subscribe = useCallback(async () => {
    setActionPending(true);
    try {
      const res = await fetch(CHECKOUT_URL, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new Error("Missing checkout URL");
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start checkout");
      setActionPending(false);
    }
  }, []);

  /**
   * Poll /api/billing/status until the user shows as subscribed or the
   * timeout elapses. Used right after returning from Stripe Checkout, since
   * the webhook may not have landed yet when the browser is redirected back.
   */
  const pollUntilSubscribed = useCallback(
    async (timeoutMs = 15000, intervalMs = 1000): Promise<boolean> => {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        try {
          const res = await fetch(STATUS_URL, { cache: "no-store" });
          if (res.ok) {
            const json = (await res.json()) as SubscriptionStatusResponse;
            setData(json);
            if (json.isSubscribed) return true;
          }
        } catch {
          /* keep polling */
        }
        await new Promise((r) => setTimeout(r, intervalMs));
      }
      return false;
    },
    [],
  );

  const manage = useCallback(async () => {
    setActionPending(true);
    try {
      const res = await fetch(PORTAL_URL, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = (await res.json()) as { url?: string };
      if (!url) throw new Error("Missing portal URL");
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open portal");
      setActionPending(false);
    }
  }, []);

  const billingEnabled = !!data?.billingEnabled;
  const isSubscribed = !!data?.isSubscribed;
  const dailyLimit = data?.dailyLimit ?? null;
  const dailyUsed = data?.dailyUsed ?? 0;
  const remainingToday = data?.remainingToday ?? null;
  const limitReached =
    isAuthenticated && !isSubscribed && remainingToday !== null && remainingToday <= 0;
  const plan = data?.plan ?? null;
  const planPriceLabel = plan ? formatPlanPrice(plan) : null;

  return {
    data,
    isLoading,
    error,
    billingEnabled,
    isSubscribed,
    dailyLimit,
    dailyUsed,
    remainingToday,
    limitReached,
    plan,
    planPriceLabel,
    refresh,
    subscribe,
    manage,
    pollUntilSubscribed,
    actionPending,
  };
};
