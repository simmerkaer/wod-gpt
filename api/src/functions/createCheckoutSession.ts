import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import { SubscriptionService } from '../services/subscriptionService';
import { getAuthedUser } from '../utils/billingAuth';
import {
  getAppBaseUrl,
  getStripeClient,
  getStripePriceId,
} from '../utils/stripe';

export async function createCheckoutSession(
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
    const existing = await subService.getSubscription(user.userId);
    const stripe = getStripeClient();
    const priceId = getStripePriceId();

    let stripeCustomerId = existing?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName,
        metadata: { userId: user.userId },
      });
      stripeCustomerId = customer.id;
      await subService.setCustomerIndex(stripeCustomerId, user.userId);
    }

    const baseUrl = getAppBaseUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      client_reference_id: user.userId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${baseUrl}/?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?subscribed=0`,
      subscription_data: {
        metadata: { userId: user.userId },
      },
    });

    return {
      status: 200,
      jsonBody: { url: session.url, sessionId: session.id },
    };
  } catch (err) {
    context.error('createCheckoutSession failed', err);
    return {
      status: 500,
      jsonBody: { error: 'Failed to start checkout' },
    };
  }
}

app.http('createCheckoutSession', {
  route: 'billing/checkout',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: createCheckoutSession,
});
