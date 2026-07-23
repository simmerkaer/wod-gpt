import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import type Stripe from 'stripe';
import { EmailClient } from '@azure/communication-email';
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
          // Fire-and-forget: a failed notification must not fail the webhook,
          // or Stripe will retry and we'd double-process the event.
          void notifyNewSubscriber(session, context).catch((err) =>
            context.error('New subscriber notification failed', err),
          );
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

const NOTIFICATION_EMAIL_SENDER =
  'DoNotReply@cfb782b4-b261-44b6-84df-c552ce46488d.azurecomm.net';

/** Email the admin when a checkout completes for a new subscription. */
async function notifyNewSubscriber(
  session: Stripe.Checkout.Session,
  context: InvocationContext,
): Promise<void> {
  const connectionString = process.env.EMAIL_CONNECTION_STRING;
  if (!connectionString) {
    context.warn('EMAIL_CONNECTION_STRING not set; skipping new subscriber email');
    return;
  }

  const dateUtc = new Date().toISOString();
  const userId =
    session.client_reference_id ||
    (session.metadata && session.metadata.userId) ||
    '(unknown)';
  const customerEmail =
    session.customer_details?.email || session.customer_email || '';

  const html = `
<html>
  <body>
    <h1>wod-gpt: New subscriber 🎉</h1>
    <p><b>Date (UTC):</b> ${dateUtc}</p>
    <p><b>UserId:</b> ${userId}</p>
    ${customerEmail ? `<p><b>Email:</b> ${customerEmail}</p>` : ''}
  </body>
</html>`;

  const emailClient = new EmailClient(connectionString);
  const poller = await emailClient.beginSend({
    senderAddress: NOTIFICATION_EMAIL_SENDER,
    content: {
      subject: 'wod-gpt: New subscriber',
      html,
    },
    recipients: { to: [{ address: 'simmerkaer@gmail.com' }] },
  });
  await poller.pollUntilDone();
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
