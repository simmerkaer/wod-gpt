# Stripe subscription setup

A recurring subscription lifts the daily free generation cap.

## Free tier

- Anonymous visitors: `ANON_DAILY_LIMIT`/day, enforced server-side in
  `generateWod`, keyed by hashed client IP. State lives in
  `anon-usage/{ipHash}.json`.
- Logged-in non-subscribers: `DAILY_FREE_LIMIT`/day, enforced server-side in
  `generateWod`. State lives in `users/{userId}/usage.json`.
- Non-subscribers (logged in or not) are locked to the free-tier workout
  options (random format, default intent/length) — enforced both in the UI and
  in `generateWod`.
- Subscribers: unlimited, all options unlocked.
- The entitlement check fails closed: if subscription/usage state can't be
  read, `generateWod` returns 503 instead of generating.

Both limits are in `api/src/utils/limits.ts`.

## Environment variables

Add these to Azure SWA app settings (production) and `api/local.settings.json`
(local dev — gitignored).

| Key                     | Value                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`     | `sk_test_…` / `sk_live_…` from Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from your webhook endpoint                                  |
| `STRIPE_PRICE_ID`       | `price_…` of the recurring Price under your Product                   |
| `PUBLIC_APP_BASE_URL`   | (optional) e.g. `https://wod-gpt.example.com` — used for Checkout success/cancel URLs. Falls back to `x-forwarded-host`/`host` if not set. |

Billing is always on — the `BILLING_ALLOWLIST` staged-rollout flag was removed
when the free-tier limits launched for everyone. The Stripe env vars above are
therefore required in production: without them the daily caps still apply but
checkout fails, leaving users no way to subscribe.

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
- `anon-usage/{ipHash}.json` — `{ date, count }` for today's anonymous
  generation count, keyed by SHA-256 of the client IP (raw IPs are never
  stored).
- `billing/stripe-customers/{customerId}.json` — index from Stripe customer ID
  to our internal `userId`. Used by webhooks since Stripe events only carry
  the customer ID.
