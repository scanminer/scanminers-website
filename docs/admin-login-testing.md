# Admin Login Testing Guide

This runbook walks you through validating the legacy password-based admin login both locally and in production. Follow these steps any time credentials or environment variables change.

## 1. Required Environment Variables

These variables must exist in **both** environments (local overrides can live in `.env.local` or your platform secrets):

| Variable | Purpose |
| --- | --- |
| `NEXTAUTH_URL` | Absolute site URL (e.g. `http://localhost:3000` locally, `https://scanminers.com` in prod). |
| `NEXTAUTH_SECRET` | Random 32+ character secret for session signing. |
| `ADMIN_PASS` | Legacy admin password you plan to type on `/admin/login`. |
| `ENABLE_ADMIN_PASSWORD_LOGIN` | Must be `true` to render the password form. |
| `ADMIN_USER` / `ADMIN_ACTOR_NAME` | Name displayed after login and used for audit logs. |
| `ALLOW_ADMIN_WITHOUT_AUTH` | **Keep `false` in production.** You may set `true` locally for quick UI review, but disable it before testing real login. |

Optional but recommended:

- `ADMIN_ALLOWED_EMAILS` / domains / GitHub handles (used when GitHub SSO is enabled later).
- `GITHUB_OAUTH_CLIENT_ID` / `SECRET` (not required for password-only flows; the button will stay disabled if unset).

## 2. Local Login Test

1. **Prep environment**
   - Update `.env.local` with the variables above.
   - Ensure `NEXTAUTH_URL=http://localhost:3000` (or whatever port you use).
   - Set `ALLOW_ADMIN_WITHOUT_AUTH=false` so the middleware actually enforces login during the test.
2. **Start the dev server**
   ```bash
   npm install
   npm run dev
   ```
3. **Verify logged-out redirect**
   - In a private browser window visit `http://localhost:3000/admin`.
   - Confirm you are redirected to `/admin/login?next=/admin`.
4. **Validate the login page**
   - GitHub button should be disabled (with a warning) if OAuth isn’t configured.
   - The “Legacy admin password” form should be visible because `ENABLE_ADMIN_PASSWORD_LOGIN=true`.
5. **Sign in with the legacy password**
   - Enter the configured password and submit.
   - You should land on `/admin` (Review Queue) without errors; the sidebar should show the admin name from `ADMIN_ACTOR_NAME`.
6. **Smoke-test routes**
   - While still logged in, open `/admin/system`, `/admin/leads`, `/admin/drafts`, `/admin/brand`, `/admin/content`, and `/admin/editor/<existing-slug>`.
   - Each should load; `/admin/system` should show ✅ next to the env vars you just set.
7. **Logout regression**
   - Click the “Sign out” button (top-right or sidebar).
   - Verify you’re taken back to `/admin/login` and `/admin` immediately redirects again if refreshed.

## 3. Production Login Test

1. **Pre-flight checks**
   - In your hosting dashboard (Cloudflare Pages/Workers), confirm every env variable listed in Section 1 is set with production values.
   - Double-check `ALLOW_ADMIN_WITHOUT_AUTH` is **unset or false**.
   - Deploy the latest build (`npm run build` already passes locally).
2. **System page verification**
   - Still logged out, visit `https://<prod-domain>/admin/system` → you should be redirected to `/admin/login` (ensures middleware is active).
3. **Login walkthrough**
   - Visit `/admin/login` directly.
   - Confirm the password form is present and GitHub SSO is optional (disabled if creds absent).
   - Enter the production `ADMIN_PASS`. After submitting you should arrive at `/admin` with session data showing the correct user name.
4. **Route access**
   - Navigate through the same route list as local to ensure data loads with production services:
     - `/admin/system` → check env checklist.
     - `/admin/leads` & `/admin/leads/<id>` → confirm D1/lead store connectivity.
     - `/admin/drafts`, `/admin/brand`, `/admin/editor/<slug>` → ensure GitHub/Contentlayer features respond.
5. **Logout and re-protection**
   - Use the “Sign out” button.
   - Revisit `/admin` to confirm it redirects back to `/admin/login`, guaranteeing the session cookie cleared.
6. **Troubleshooting tips**
   - If login loops back to `/admin/login`, check Cloudflare logs for middleware errors and re-confirm `NEXTAUTH_URL` matches the canonical HTTPS URL.
   - If the password form is hidden, ensure `ENABLE_ADMIN_PASSWORD_LOGIN=true` and redeploy.
   - If the login form errors immediately, confirm `NEXTAUTH_SECRET` and `ADMIN_PASS` are set in the same environment (Pages vs Worker) and that the deployment picked up the new secrets.

## 4. Optional Automation Hooks

- `npm run test` already covers the password helper and middleware behavior.
- For additional coverage you can add a small Playwright spec that fills the password form against a local build; reuse the checklist above as the script.

Document any findings (screenshots, error logs) in your deployment notes so future runs can reuse this procedure.
