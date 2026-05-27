import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import type Stripe from 'stripe';
import {
  SubscriptionService,
  SubscriptionStatus,
  UserSubscription,
} from '../services/subscriptionService';
import {
  getStripeClient,
  getStripeWebhookSecret,
} from '../utils/stripe';

export async function stripeWebhook(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return { status: 400, body: 'Missing stripe-signature header' };
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    context.error('Could not read webhook body', err);
    return { status: 400, body: 'Invalid body' };
  }

  let stripe: Stripe;
  let event: Stripe.Event;
  try {
    stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (err: any) {
    context.error('Webhook signature verification failed', err?.message ?? err);
    return { status: 400, body: `Webhook Error: ${err?.message ?? 'invalid'}` };
  }

  context.log(`Stripe webhook: ${event.type} (${event.id})`);

  try {
    const subService = new SubscriptionService();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ||
          (session.metadata && session.metadata.userId);
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;
        if (userId && customerId) {
          await subService.setCustomerIndex(customerId, userId);
        }
        if (session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await persistSubscription(subService, stripe, subscription, event, userId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await persistSubscription(subService, stripe, subscription, event);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await persistSubscription(subService, stripe, subscription, event);
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return { status: 200, jsonBody: { received: true } };
  } catch (err) {
    context.error('Webhook handler error', err);
    return { status: 500, body: 'Webhook handler error' };
  }
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const raw = (invoice as any).subscription;
  if (!raw) return null;
  return typeof raw === 'string' ? raw : raw.id;
}

function getCurrentPeriodEndIso(subscription: Stripe.Subscription): string | undefined {
  const item = subscription.items?.data?.[0] as any;
  const candidate =
    (item && typeof item.current_period_end === 'number'
      ? item.current_period_end
      : undefined) ?? (subscription as any).current_period_end;
  if (typeof candidate !== 'number') return undefined;
  return new Date(candidate * 1000).toISOString();
}

async function persistSubscription(
  subService: SubscriptionService,
  _stripe: Stripe,
  subscription: Stripe.Subscription,
  event: Stripe.Event,
  preferredUserId?: string,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  const metaUserId = (subscription.metadata && subscription.metadata.userId) || undefined;
  const userId =
    preferredUserId ||
    metaUserId ||
    (await subService.getUserIdByCustomerId(customerId));

  if (!userId) {
    // We can't map this Stripe customer to one of our users — drop it.
    return;
  }

  const priceId = subscription.items?.data?.[0]?.price?.id;
  const next: UserSubscription = {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status as SubscriptionStatus,
    priceId,
    currentPeriodEnd: getCurrentPeriodEndIso(subscription),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    updatedAt: new Date().toISOString(),
  };
  // `event.created` is unix seconds; convert to ISO so the blob is human-readable.
  const eventCreatedIso = new Date(event.created * 1000).toISOString();
  await subService.saveSubscriptionIfNewer(next, eventCreatedIso);
}

app.http('stripeWebhook', {
  route: 'billing/webhook',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: stripeWebhook,
});
