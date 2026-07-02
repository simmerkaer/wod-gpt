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
import { getClientIpHash } from '../utils/clientIp';
import { getPlanInfo } from '../utils/stripe';
import { ANON_DAILY_LIMIT, DAILY_FREE_LIMIT } from '../utils/limits';

export async function getSubscriptionStatus(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const blobService = new BlobStorageService();
    const user = await getAuthedUser(request, blobService);
    const plan = await getPlanInfo().catch(() => null);
    const subService = new SubscriptionService();

    if (!user) {
      // Report the server-tracked anonymous allowance for this IP so the
      // frontend meter reflects what generateWod will actually enforce.
      const usage = await subService
        .getAnonDailyUsage(getClientIpHash(request))
        .catch(() => null);
      const used = usage?.count ?? 0;
      return {
        status: 200,
        jsonBody: {
          authenticated: false,
          billingEnabled: true,
          isSubscribed: false,
          dailyLimit: ANON_DAILY_LIMIT,
          dailyUsed: used,
          remainingToday: Math.max(0, ANON_DAILY_LIMIT - used),
          plan,
        },
      };
    }

    const [sub, usage] = await Promise.all([
      subService.getSubscription(user.userId),
      subService.getDailyUsage(user.userId),
    ]);
    const active = isSubscriptionActive(sub);

    return {
      status: 200,
      jsonBody: {
        authenticated: true,
        billingEnabled: true,
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
