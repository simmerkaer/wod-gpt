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
          isSubscribed: false,
          dailyLimit: DAILY_FREE_LIMIT,
          dailyUsed: 0,
          remainingToday: DAILY_FREE_LIMIT,
          plan,
        },
      };
    }

    const subService = new SubscriptionService();
    const [sub, usage] = await Promise.all([
      subService.getSubscription(user.userId),
      subService.getDailyUsage(user.userId),
    ]);
    const active = isSubscriptionActive(sub);

    return {
      status: 200,
      jsonBody: {
        authenticated: true,
        isSubscribed: active,
        status: sub?.status ?? 'none',
        cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
        currentPeriodEnd: sub?.currentPeriodEnd ?? null,
        dailyLimit: active ? null : DAILY_FREE_LIMIT,
        dailyUsed: usage.count,
        remainingToday: active
          ? null
          : Math.max(0, DAILY_FREE_LIMIT - usage.count),
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
