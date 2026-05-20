# Email/password authentication — implementation plan

Adding username/password registration alongside the existing Google login,
using Auth0 as a custom OpenID Connect provider in Azure Static Web Apps.

## Approach

- **Identity strategy:** Auth0 only, with Google added as a social
  connection *inside* Auth0. Single user namespace going forward. Existing
  Google users migrated lazily by email on first sign-in.
- **UI strategy:** Auth0 Universal Login hosted pages. No registration
  forms, password fields, or reset flows in the React app.
- **Backend:** `x-ms-client-principal` plumbing keeps working. User blob
  path changes from Google `userId` to Auth0 `sub` (e.g. `auth0|abc123` or
  `google-oauth2|123`); a migration helper resolves the right path per
  request.

## Cost summary

| Item | Cost |
| --- | --- |
| SWA Standard plan (required for custom auth) | flat monthly fee per app — confirm current rate at <https://azure.microsoft.com/pricing/details/app-service/static/> |
| SWA bandwidth | 100 GB/month included, then $0.20/GB |
| Auth0 free plan | Generous MAU cap (verify on <https://auth0.com/pricing>); email/password, social, Universal Login, 1 custom domain all included |
| Auth0 paid features (MFA, multiple custom domains, enterprise connections) | Not needed for this app |
| Azure Functions / Blob Storage / OpenAI | Unchanged |

Realistic monthly impact: SWA Standard fee only; Auth0 is free at this
scale.

## Open questions to resolve before starting

1. **Email index for migration (Step 8a):** Does the existing "user
   notification tracking" feature (commit `b8e61a5`) store user emails in
   a form we can dump? If yes, migration is straightforward; if no, we
   need a different strategy (e.g. prompt returning users on first
   sign-in to claim their old history by email).
2. **Wildcard preview URLs in Auth0:** Auth0 application settings accept
   multiple callback URLs but not wildcards. For SWA preview environments,
   either pre-register a few preview hostnames or skip auth testing on
   previews.

---

## Step 0 — Prerequisites

- [ ] Owner or Contributor on the Azure subscription that hosts the SWA.
- [ ] Access to the existing Google Cloud project (new redirect URI
      needed).
- [ ] Auth0 account (free signup at <https://auth0.com/signup>).
- [ ] Branch off main: `git checkout -b auth/email-password`.

## Step 1 — Upgrade SWA to the Standard plan

1. Azure portal → SWA resource → **Settings → Hosting plan**.
2. Select **Standard**, click **Save**.
3. Verify: Standard is shown, and `Custom registrations` is available on
   Authentication settings.

Billing impact starts immediately (prorated).

## Step 2 — Create the Auth0 tenant

1. Sign in to <https://manage.auth0.com>.
2. If you don't already have a tenant: top-left tenant switcher →
   **Create tenant**.
3. Pick:
   - Tenant domain: e.g. `wodgpt` → becomes `wodgpt.<region>.auth0.com`
   - Region: closest to users (EU/US/AU). Region affects the issuer URL,
     so pick deliberately — it's painful to change later.
   - Environment tag: **Development**
4. Save.

Record:

- Tenant domain (full): `wodgpt.<region>.auth0.com`
- Well-known endpoint: `https://wodgpt.<region>.auth0.com/.well-known/openid-configuration`

## Step 3 — Create the Auth0 Application

1. Auth0 dashboard → **Applications → Applications → Create Application**.
2. Name: `wod-gpt-web`.
3. Type: **Regular Web Application** (not SPA — SWA terminates the OIDC
   flow server-side via `/.auth/login/auth0/callback`, so it acts as a
   confidential client).
4. Skip the technology picker (we're integrating via SWA's OIDC config,
   not an Auth0 SDK).
5. On the **Settings** tab:
   - Copy the **Domain**, **Client ID**, and **Client Secret**.
   - **Allowed Callback URLs:**
     `https://<your-swa-hostname>/.auth/login/auth0/callback`
   - **Allowed Logout URLs:**
     `https://<your-swa-hostname>`
   - **Application Login URI** (optional but recommended for initiating
     login from Auth0 dashboard): `https://<your-swa-hostname>/login`
6. **Save Changes** at the bottom.
7. On the **Advanced Settings → OAuth** tab, confirm:
   - **JsonWebToken Signature Algorithm:** `RS256`
   - **OIDC Conformant:** on

For local dev against real Auth0, add a second callback URL:
`http://localhost:4280/.auth/login/auth0/callback` and a second logout
URL: `http://localhost:4280`.

## Step 4 — Configure the database connection

1. **Authentication → Database → Create DB Connection** (or use the
   default `Username-Password-Authentication` connection).
2. Name: `Username-Password-Authentication` (default is fine).
3. **Settings:**
   - **Requires Username:** off (email is the username).
   - **Disable Sign Ups:** off (we want self-service registration).
   - **Password Strength:** at least "Good" (8+ chars, mix of types).
4. **Applications** tab on the connection → enable `wod-gpt-web`.
5. Save.

### Step 4a — Configure Google as a social connection

1. **Google Cloud Console** → existing OAuth 2.0 Client ID → **Authorized
   redirect URIs** → add `https://wodgpt.<region>.auth0.com/login/callback`.
2. Auth0 dashboard → **Authentication → Social → Create Connection →
   Google / Gmail**.
3. Paste the Google **Client ID** and **Client Secret** from the existing
   OAuth client.
4. **Permissions:** Email, Profile (default).
5. **Applications** tab on the Google connection → enable `wod-gpt-web`.
6. Save.

Auth0 will now show users both "Continue with Google" and "Sign up with
email and password" on the Universal Login page.

## Step 5 — Add app settings to the SWA

1. Azure portal → SWA → **Settings → Configuration → Application settings → Add**:
   - `AUTH0_CLIENT_ID` = Client ID from Step 3.5
   - `AUTH0_CLIENT_SECRET` = Client Secret from Step 3.5
2. Save. The SWA restarts to pick up new settings.

Do **not** check secrets into source control or `.env.local`.

## Step 6 — Update `staticwebapp.config.json`

Replace the current `auth` and `routes` blocks with:

```json
"auth": {
  "identityProviders": {
    "customOpenIdConnectProviders": {
      "auth0": {
        "registration": {
          "clientIdSettingName": "AUTH0_CLIENT_ID",
          "clientCredential": {
            "clientSecretSettingName": "AUTH0_CLIENT_SECRET"
          },
          "openIdConnectConfiguration": {
            "wellKnownOpenIdConfiguration": "https://wodgpt.<region>.auth0.com/.well-known/openid-configuration"
          }
        },
        "login": {
          "nameClaimType": "name",
          "scopes": ["openid", "profile", "email"]
        }
      }
    }
  }
},
"routes": [
  { "route": "/login", "redirect": "/.auth/login/auth0" },
  { "route": "/logout", "redirect": "/.auth/logout" }
]
```

Substitute the real Auth0 domain (including region). Keep the rest of the
file (`navigationFallback`, etc.) untouched.

## Step 7 — Frontend changes

- **`src/contexts/AuthContext.tsx:79-81`** — change `login(idp)` to
  hardcode `/.auth/login/auth0`. Drop the `idp` parameter.
- **`src/components/auth/LoginButton.tsx:12`** — rename label to "Sign in
  / Create account".
- **Delete any provider-picker UI.** Auth0 Universal Login is the picker
  now.
- **`src/types/auth.ts:20-27`** — `ClientPrincipal.userDetails` will be
  the email claim from Auth0; `provider` will be `"auth0"`. Update UI
  that displays `provider`.
- **`src/contexts/AuthContext.tsx:55-70`** — verify `/.auth/me` parsing
  still works. Read `email` from the claims array rather than relying on
  `userDetails`.

No registration form, password field, or reset-password UI in React —
Auth0 hosts all of it.

## Step 8 — Backend migration helper

Existing blob path: `users/{userId}/workouts.json` (Google `userId`). New
sign-ins produce Auth0 `sub` values like `auth0|abc123` (database) or
`google-oauth2|123...` (social). Lazy migration runs on first sign-in.

1. **New file**: `api/src/utils/userMigration.ts` —
   `resolveBlobUserId(principal)`:
   1. `newId = principal.userDetails || principal.userId`
   2. If `users/{newId}/workouts.json` exists → return `newId`.
   3. Else, look up email from `principal.claims` (try `email`, `emails`,
      `emailaddress`).
   4. Maintain index blob `users/_email-index.json` mapping
      email → old Google user ID.
   5. If email maps to existing Google user ID with a blob → copy blob to
      `users/{newId}/workouts.json`, delete old blob, update index,
      return `newId`.
   6. Else return `newId` (fresh user).
2. **Edit** `api/src/functions/saveWorkout.ts:34` and
   `api/src/functions/getWorkoutHistory.ts:18` — replace inline
   `userInfo.userDetails || userInfo.userId` with
   `await resolveBlobUserId(userInfo)`.

**Note on the `sub` format:** Auth0 prefixes the subject with the
connection type. Users who sign up with email/password get
`auth0|<id>`; users who sign in with Google through Auth0 get
`google-oauth2|<google-id>`. The `|` character is safe in blob path
segments but watch for any string handling that assumes the userId is
GUID-shaped.

### Step 8a — Build the email index

Add a one-shot script `api/scripts/buildEmailIndex.ts`. Source of
emails: the existing "user notification tracking" data from commit
`b8e61a5` (this needs verification — see open question 1).

## Step 9 — Admin auth verification

`api/src/utils/adminAuth.ts:54-77` checks the admin allowlist against
email claims. Confirm:

- Admin entry is matched against the Auth0 `email` claim.
- Run through the parse path with a sample Auth0
  `x-ms-client-principal` payload before deploying.
- If you want to restrict admin to only verified emails, also check
  `email_verified` claim is `true`.

## Step 10 — Local dev wiring

Two options:

- **(a) SWA CLI emulator (default for dev):** SWA CLI fakes auth at
  `http://localhost:4280/.auth/login/<provider>`. Accepts any provider
  name.
- **(b) Real OIDC locally:** add `AUTH0_CLIENT_ID` and
  `AUTH0_CLIENT_SECRET` to `.env.local`. The
  `dotenv -e .env.local -- swa start ...` command in `package.json:7`
  forwards them. Requires the `localhost:4280` callback URL from Step 3.

Use (a) for everyday dev, (b) once before deploying to staging.

## Step 11 — Deploy to a SWA staging environment first

1. Push the branch. Preview environment is created per PR.
2. **Caveat:** preview environments share auth config with production.
   Auth0 does not support wildcard callback URLs — pre-register one or
   two preview hostnames in the Auth0 application's Allowed Callback URLs,
   or skip auth testing on previews.
3. Sign up a throwaway account on the preview, sign in, generate a
   workout, verify save and read.
4. Sign out, sign back in via Google through Auth0, verify the migration
   path.

## Step 12 — Production cutover

1. Merge the PR.
2. Watch the deploy. First request after the new config lands triggers
   SWA to pull OIDC metadata — give ~30 seconds before testing.
3. Sign in yourself first as a smoke test.
4. Run the email-index build script (Step 8a) against production storage
   before announcing.
5. Monitor:
   - Application Insights for `x-ms-client-principal` parse failures.
   - Auth0 dashboard → **Monitoring → Logs** for failed sign-ins or
     sign-up errors.
   - The new-user email notification path (commit `fcd94f4`) — should
     fire for genuinely new sign-ups, not for migrating Google users.

## Step 13 — Communication and follow-up

- [ ] Send heads-up email to existing users about the new sign-in
      options.
- [ ] Add "forgot password" reference in FAQ — Auth0's hosted reset flow
      handles it, no code needed.
- [ ] After 30 days, review MAU usage in the Auth0 dashboard →
      **Monitoring → Tenant Stats**. Confirm still inside the free tier.
- [ ] Optional: configure a custom domain (`auth.wodgpt.com`) in Auth0
      so the login page doesn't show `wodgpt.<region>.auth0.com` in the
      browser bar. Free plan includes one custom domain.
