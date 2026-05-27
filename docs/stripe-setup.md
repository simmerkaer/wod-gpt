# Stripe subscription setup

This branch (`feat/stripe-subscriptions`) wires up a recurring subscription
that lifts the 3-workouts-per-day cap.

## Free tier

- Anonymous visitors: 3/day, enforced client-side via localStorage
  (`src/lib/anonLimit.ts`).
- Logged-in non-subscribers: 3/day, enforced server-side in `generateWod`.
  State lives in `users/{userId}/usage.json`.
- Subscribers: unlimited.

`DAILY_FREE_LIMIT` is in `api/src/functions/getSubscriptionStatus.ts`.

## Environment variables

Add these to Azure SWA app settings (production) and `api/local.settings.json`
(local dev — gitignored).

| Key                     | Value                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`     | `sk_test_…` / `sk_live_…` from Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from your webhook endpoint                                  |
| `STRIPE_PRICE_ID`       | `price_…` of the recurring Price under your Product                   |
| `PUBLIC_APP_BASE_URL`   | (optional) e.g. `https://wod-gpt.example.com` — used for Checkout success/cancel URLs. Falls back to `x-forwarded-host`/`host` if not set. |
| `BILLING_ALLOWLIST`     | Feature flag. Comma-separated emails that see billing + get the daily cap. `*` enables it for everyone (launch). Unset/empty = billing hidden for all (logged-in users stay unlimited). |

## Feature flag / staged rollout

Billing is gated behind `BILLING_ALLOWLIST` so the code can ship to prod while
staying invisible to regular users:

- **Preview**: set it to your own email (e.g. `you@example.com`). Only you see
  the subscribe/manage UI and have the 3/day cap enforced; everyone else gets
  the pre-billing experience (logged-in = unlimited, anonymous = 3/day client
  side as before).
- **Launch**: set it to `*` to enable billing for all users.
- The flag is read server-side in `utils/billingFlag.ts`. `getSubscriptionStatus`
  returns `billingEnabled`, which the frontend uses to show/hide all billing UI;
  `generateWod` only enforces the cap for enabled users; and the
  checkout/portal endpoints 403 for non-enabled users.

## Stripe Dashboard setup

1. **Product → Price**
   - Make sure your Product has a **recurring** Price (monthly).
   - Copy the `price_…` ID into `STRIPE_PRICE_ID`.

2. **API key**
   - Developers → API keys → reveal "Secret key" (`sk_test_…` while testing).

3. **Webhook endpoint**
   - Developers → Webhooks → "+ Add endpoint"
   - URL: `https://<your-domain>/api/billing/webhook`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

4. **Customer Portal**
   - Settings → Billing → Customer Portal → Activate.
   - Allow at least: cancel subscriptions, update payment method.

## Local development with webhooks

Stripe webhooks can't reach `localhost` directly. Use the Stripe CLI:

```sh
stripe login
stripe listen --forward-to http://localhost:7071/api/billing/webhook
```

The CLI prints a `whsec_…` — copy that into `STRIPE_WEBHOOK_SECRET` in
`api/local.settings.json` for local testing. It's different from the
production webhook secret.

Trigger test events:

```sh
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## API endpoints

| Endpoint                     | Method | Auth | Purpose                                    |
| ---------------------------- | ------ | ---- | ------------------------------------------ |
| `/api/billing/status`        | GET    | optional | Returns subscription state + daily quota |
| `/api/billing/checkout`      | POST   | required | Starts Stripe Checkout, returns URL    |
| `/api/billing/portal`        | POST   | required | Opens Stripe Customer Portal, returns URL |
| `/api/billing/webhook`       | POST   | none (Stripe-signed) | Subscription lifecycle events |

## Storage layout

In the existing `workout-history` blob container:

- `users/{userId}/subscription.json` — current subscription record per user.
- `users/{userId}/usage.json` — `{ date, count }` for today's generation count.
- `billing/stripe-customers/{customerId}.json` — index from Stripe customer ID
  to our internal `userId`. Used by webhooks since Stripe events only carry
  the customer ID.
