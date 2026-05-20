# Email/password authentication — implementation plan

Adding username/password registration alongside the existing Google login,
using Microsoft Entra External ID as a custom OpenID Connect provider in
Azure Static Web Apps.

## Approach

- **Identity strategy:** Microsoft Entra External ID only, with Google added
  as a federated provider *inside* External ID. Single user namespace going
  forward. Existing Google users migrated lazily by email on first sign-in.
- **UI strategy:** External ID hosted sign-up/sign-in pages. No registration
  forms, password fields, or reset flows in the React app.
- **Backend:** `x-ms-client-principal` plumbing keeps working. User blob path
  changes from Google `userId` to External ID `oid`; a migration helper
  resolves the right path per request.

## Cost summary

| Item | Cost |
| --- | --- |
| SWA Standard plan (required for custom auth) | flat monthly fee per app — confirm current rate at <https://azure.microsoft.com/pricing/details/app-service/static/> |
| SWA bandwidth | 100 GB/month included, then $0.20/GB |
| Entra External ID | First 50,000 MAU free; per-MAU pricing above that |
| External ID add-ons (SMS MFA, ID Protection) | No free tier — skip unless needed |
| Azure Functions / Blob Storage / OpenAI | Unchanged |

Realistic monthly impact for a small-scale app: SWA Standard fee only;
everything else effectively $0.

## Open questions to resolve before starting

1. **Email index for migration (Step 8a):** Does the existing "user
   notification tracking" feature (commit `b8e61a5`) store user emails in a
   form we can dump? If yes, migration is straightforward; if no, we need a
   different strategy (e.g. prompt returning users on first sign-in to
   claim their old history by email).
2. **Wildcard preview URLs in External ID:** Confirm whether the app
   registration accepts wildcard redirect URIs, or whether previews need a
   separate app registration.

---

## Step 0 — Prerequisites

- [ ] Owner or Contributor on the Azure subscription that hosts the SWA.
- [ ] Access to the existing Google Cloud project (new redirect URI needed).
- [ ] Branch off main: `git checkout -b auth/email-password`.

## Step 1 — Upgrade SWA to the Standard plan

1. Azure portal → SWA resource → **Settings → Hosting plan**.
2. Select **Standard**, click **Save**.
3. Verify: Standard is shown, and `Custom registrations` is available on
   Authentication settings.

Billing impact starts immediately (prorated).

## Step 2 — Create the External ID external tenant

1. Open <https://entra.microsoft.com>.
2. **Identity → Overview → Manage tenants → Create**.
3. Pick **External** (not Workforce).
4. Fill in:
   - Tenant name: `wodgpt`
   - Initial domain: `wodgpt` → becomes `wodgpt.onmicrosoft.com`
   - Region: closest to users
5. Switch into the new tenant via the top-right tenant switcher.
6. **Billing → Link a subscription** → point at the same Azure subscription
   as the SWA.

Record:

- Tenant ID (GUID)
- Tenant subdomain (`wodgpt`)
- Well-known endpoint:
  `https://wodgpt.ciamlogin.com/<tenant-id>/v2.0/.well-known/openid-configuration`

## Step 3 — Register the SWA app inside the External ID tenant

1. **Applications → App registrations → New registration**.
2. Name: `wod-gpt-web`.
3. Supported account types: **Accounts in this organizational directory only**.
4. Redirect URI:
   - Platform: **Web**
   - URI: `https://<your-swa-hostname>/.auth/login/entraExternal/callback`
5. Click **Register**.
6. **Certificates & secrets → Client secrets → New client secret**. Expiry
   24 months. Copy the **Value** immediately.
7. **API permissions** → ensure `openid`, `profile`, `email`,
   `offline_access` are granted (delegated, Microsoft Graph). Grant admin
   consent.
8. Record the **Application (client) ID** and the **client secret value**.

For local dev against real External ID, add a second redirect URI:
`http://localhost:4280/.auth/login/entraExternal/callback`.

## Step 4 — Create the sign-up / sign-in user flow

1. **External Identities → User flows → New user flow**.
2. Type: **Sign up and sign in**.
3. Name: `signinsignup`.
4. Identity providers:
   - **Email with password** — enabled.
   - **Google** — add now (see Step 4a).
5. User attributes to collect at sign-up: **Email**, **Display name**.
6. Application claims to return: **Email**, **Display name**, **Object ID**
   (`oid`), **Subject** (`sub`).
7. Save, then on the user flow's **Applications** tab: associate the
   `wod-gpt-web` app from Step 3.

### Step 4a — Configure Google as a federated provider

1. Google Cloud Console → existing OAuth client → **Authorized redirect URIs**
   → add `https://wodgpt.ciamlogin.com/wodgpt.onmicrosoft.com/oauth2/authresp`.
2. External ID admin: **External Identities → All identity providers → Google**
   → paste Google client ID and secret.
3. Add Google to the user flow's identity providers (Step 4.4).

## Step 5 — Add app settings to the SWA

1. Azure portal → SWA → **Settings → Configuration → Application settings → Add**:
   - `EXTERNAL_ID_CLIENT_ID` = client ID from Step 3.8
   - `EXTERNAL_ID_CLIENT_SECRET` = client secret value from Step 3.6
2. Save. The SWA restarts to pick up new settings.

Do **not** check secrets into source control or `.env.local`.

## Step 6 — Update `staticwebapp.config.json`

Replace the current `auth` and `routes` blocks with:

```json
"auth": {
  "identityProviders": {
    "customOpenIdConnectProviders": {
      "entraExternal": {
        "registration": {
          "clientIdSettingName": "EXTERNAL_ID_CLIENT_ID",
          "clientCredential": {
            "clientSecretSettingName": "EXTERNAL_ID_CLIENT_SECRET"
          },
          "openIdConnectConfiguration": {
            "wellKnownOpenIdConfiguration": "https://wodgpt.ciamlogin.com/<tenant-id>/v2.0/.well-known/openid-configuration"
          }
        },
        "login": {
          "nameClaimType": "name",
          "scopes": ["openid", "profile", "email", "offline_access"]
        }
      }
    }
  }
},
"routes": [
  { "route": "/login", "redirect": "/.auth/login/entraExternal" },
  { "route": "/logout", "redirect": "/.auth/logout" }
]
```

Substitute the real tenant ID. Keep the rest of the file
(`navigationFallback`, etc.) untouched.

## Step 7 — Frontend changes

- **`src/contexts/AuthContext.tsx:79-81`** — change `login(idp)` to hardcode
  `/.auth/login/entraExternal`. Drop the `idp` parameter.
- **`src/components/auth/LoginButton.tsx:12`** — rename label to "Sign in /
  Create account".
- **Delete any provider-picker UI.** The hosted page is the picker now.
- **`src/types/auth.ts:20-27`** — `ClientPrincipal.userDetails` will be the
  email claim from External ID; `provider` will be `"entraExternal"`.
  Update UI that displays `provider`.
- **`src/contexts/AuthContext.tsx:55-70`** — verify `/.auth/me` parsing
  still works. Read `email` from the claims array rather than relying on
  `userDetails`.

No registration form, password field, or reset-password UI in React.

## Step 8 — Backend migration helper

Existing blob path: `users/{userId}/workouts.json` (Google `userId`). New
sign-ins produce External ID `oid` GUIDs. Lazy migration runs on first
sign-in.

1. **New file**: `api/src/utils/userMigration.ts`
   `resolveBlobUserId(principal)`:
   1. `newId = principal.userDetails || principal.userId`
   2. If `users/{newId}/workouts.json` exists → return `newId`.
   3. Else, look up email from `principal.claims` (try `email`, `emails`,
      `emailaddress`).
   4. Maintain index blob `users/_email-index.json` mapping
      email → old Google user ID.
   5. If email maps to existing Google user ID with a blob → copy blob to
      `users/{newId}/workouts.json`, delete old blob, update index, return
      `newId`.
   6. Else return `newId` (fresh user).
2. **Edit** `api/src/functions/saveWorkout.ts:34` and
   `api/src/functions/getWorkoutHistory.ts:18` — replace inline
   `userInfo.userDetails || userInfo.userId` with
   `await resolveBlobUserId(userInfo)`.

### Step 8a — Build the email index

Add a one-shot script `api/scripts/buildEmailIndex.ts`. Source of emails:
the existing "user notification tracking" data from commit `b8e61a5` (this
needs verification — see open question 1).

## Step 9 — Admin auth verification

`api/src/utils/adminAuth.ts:54-77` checks the admin allowlist against email
claims. Confirm:

- Admin entry is matched against the External ID `email` claim.
- Run through the parse path with a sample External ID
  `x-ms-client-principal` payload before deploying.

## Step 10 — Local dev wiring

Two options:

- **(a) SWA CLI emulator (default for dev):** SWA CLI fakes auth at
  `http://localhost:4280/.auth/login/<provider>`. Accepts any provider
  name.
- **(b) Real OIDC locally:** add `EXTERNAL_ID_CLIENT_ID` and
  `EXTERNAL_ID_CLIENT_SECRET` to `.env.local`. The
  `dotenv -e .env.local -- swa start ...` command in `package.json:7`
  forwards them. Requires the `localhost:4280` redirect URI from Step 3.

Use (a) for everyday dev, (b) once before deploying to staging.

## Step 11 — Deploy to a SWA staging environment first

1. Push the branch. Preview environment is created per PR.
2. **Caveat:** preview environments share auth config with production.
   Add preview hostnames to the External ID app registration redirect URIs,
   or use a wildcard pattern (verify support — open question 2).
3. Sign up a throwaway account on the preview, sign in, generate a
   workout, verify save and read.
4. Sign out, sign back in via the Google option inside External ID, verify
   the migration path.

## Step 12 — Production cutover

1. Merge the PR.
2. Watch the deploy. First request after the new config lands triggers SWA
   to pull OIDC metadata — give ~30 seconds before testing.
3. Sign in yourself first as a smoke test.
4. Run the email-index build script (Step 8a) against production storage
   before announcing.
5. Monitor:
   - Application Insights for `x-ms-client-principal` parse failures.
   - The new-user email notification path (commit `fcd94f4`) — should fire
     for genuinely new sign-ups, not for migrating Google users.

## Step 13 — Communication and follow-up

- [ ] Send heads-up email to existing users about the new sign-in options.
- [ ] Add "forgot password" reference in FAQ — hosted reset flow, no code
      needed.
- [ ] After 30 days, review MAU usage in the External ID admin center →
      Usage and Insights. Confirm still inside the 50k free tier.
