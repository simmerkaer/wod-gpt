import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { BlobStorageService } from '../services/blobStorageService';
import { SubscriptionService } from '../services/subscriptionService';
import { getAuthedUser } from '../utils/billingAuth';
import { isBillingEnabledForEmail } from '../utils/billingFlag';
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
    if (!isBillingEnabledForEmail(user.email)) {
      return { status: 403, jsonBody: { error: 'Billing is not available' } };
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
      // Require the customer to tick a Terms-of-Service box before paying.
      // NOTE: this requires a Terms-of-Service URL configured in
      // Stripe Dashboard -> Settings -> Public details, otherwise the API
      // call errors with "terms of service URL is not set".
      consent_collection: {
        terms_of_service: 'required',
      },
      custom_text: {
        terms_of_service_acceptance: {
          // EU right-of-withdrawal waiver: the customer must acknowledge that
          // the service starts immediately and they give up the 14-day
          // withdrawal right. Keeping this on the ToS checkbox stores proof of
          // consent on Stripe's side.
          message:
            'I agree to the Terms of Service and Privacy Policy. I understand my ' +
            'subscription starts immediately and I waive my 14-day right of ' +
            'withdrawal for the portion of the service already delivered.',
        },
      },
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
