import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import {
  SubscriptionService,
  isSubscriptionActive,
} from '../services/subscriptionService';
import { getAuthedUser } from '../utils/billingAuth';
import { getPlanInfo } from '../utils/stripe';
import { isBillingEnabledForEmail } from '../utils/billingFlag';

export const DAILY_FREE_LIMIT = 3;

export async function getSubscriptionStatus(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const blobService = new BlobStorageService();
    const user = await getAuthedUser(request, blobService);
    const plan = await getPlanInfo().catch(() => null);
    if (!user) {
      return {
        status: 200,
        jsonBody: {
          authenticated: false,
          billingEnabled: false,
          isSubscribed: false,
          dailyLimit: null,
          dailyUsed: 0,
          remainingToday: null,
          plan,
        },
      };
    }

    const billingEnabled = isBillingEnabledForEmail(user.email);
    const subService = new SubscriptionService();
    const [sub, usage] = await Promise.all([
      subService.getSubscription(user.userId),
      subService.getDailyUsage(user.userId),
    ]);
    const active = isSubscriptionActive(sub);
    // When billing is disabled for this user, behave like the pre-billing app:
    // no cap, no subscribe UI (the frontend hides everything on billingEnabled).
    const capped = billingEnabled && !active;

    return {
      status: 200,
      jsonBody: {
        authenticated: true,
        billingEnabled,
        isSubscribed: active,
        status: sub?.status ?? 'none',
        cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
        currentPeriodEnd: sub?.currentPeriodEnd ?? null,
        dailyLimit: capped ? DAILY_FREE_LIMIT : null,
        dailyUsed: usage.count,
        remainingToday: capped
          ? Math.max(0, DAILY_FREE_LIMIT - usage.count)
          : null,
        plan,
      },
    };
  } catch (err) {
    context.error('getSubscriptionStatus failed', err);
    return {
      status: 500,
      jsonBody: { error: 'Failed to load subscription status' },
    };
  }
}

app.http('getSubscriptionStatus', {
  route: 'billing/status',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getSubscriptionStatus,
});
