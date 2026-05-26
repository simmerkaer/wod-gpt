import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import { SubscriptionService } from '../services/subscriptionService';
import { getAuthedUser } from '../utils/billingAuth';
import { getAppBaseUrl, getStripeClient } from '../utils/stripe';

export async function createPortalSession(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const blobService = new BlobStorageService();
    const user = await getAuthedUser(request, blobService);
    if (!user) {
      return { status: 401, jsonBody: { error: 'Sign in required' } };
    }

    const subService = new SubscriptionService();
    const sub = await subService.getSubscription(user.userId);
    if (!sub?.stripeCustomerId) {
      return {
        status: 400,
        jsonBody: { error: 'No Stripe customer for this user' },
      };
    }

    const baseUrl = getAppBaseUrl(request);
    const session = await getStripeClient().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${baseUrl}/`,
    });

    return { status: 200, jsonBody: { url: session.url } };
  } catch (err) {
    context.error('createPortalSession failed', err);
    return {
      status: 500,
      jsonBody: { error: 'Failed to open customer portal' },
    };
  }
}

app.http('createPortalSession', {
  route: 'billing/portal',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: createPortalSession,
});
