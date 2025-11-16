# Production Environment Configuration for Admin Auth

After merging the NextAuth migration PR, you'll need to configure the following environment variables in your Cloudflare Pages/Workers dashboard to enable admin login in production.

## Critical Variables (Required for Password Login)

Navigate to your Cloudflare Pages project → **Settings** → **Environment Variables** → **Production**.

Add or update these variables:

| Variable | Production Value | Notes |
| --- | --- | --- |
| `NEXTAUTH_URL` | `https://scanminers.com` | Must match your canonical domain (no trailing slash) |
| `NEXTAUTH_SECRET` | *(generate a new 32+ char secret)* | Use `openssl rand -base64 32` to create one; never reuse dev secrets in prod |
| `ADMIN_PASS` | *(strong password)* | The password you'll type on `/admin/login` |
| `ENABLE_ADMIN_PASSWORD_LOGIN` | `true` | Renders the password form on the login page |
| `ADMIN_USER` | `admin` | Username for audit logs and display |
| `ADMIN_ACTOR_NAME` | `Your Name` | Full name shown in the admin UI and git commits |
| `ALLOW_ADMIN_WITHOUT_AUTH` | *(leave unset or `false`)* | Must be false/unset in production; bypass is dev-only |

## Optional Variables (for future GitHub SSO)

If you plan to enable GitHub OAuth later, also set:

| Variable | Production Value | Notes |
| --- | --- | --- |
| `GITHUB_OAUTH_CLIENT_ID` | *(from GitHub OAuth app)* | Client ID for SSO |
| `GITHUB_OAUTH_CLIENT_SECRET` | *(from GitHub OAuth app)* | Client secret for SSO |
| `ADMIN_ALLOWED_EMAILS` | `you@scanminers.com,ab@scanminers.com` | Comma-separated list of allowed email addresses |
| `ADMIN_ALLOWED_EMAIL_DOMAINS` | `scanminers.com` | Comma-separated domains; any email from these domains is allowed |
| `ADMIN_ALLOWED_GITHUB_LOGINS` | `scanminers-founder` | Comma-separated GitHub usernames |

## Steps to Apply

1. **Add variables in Cloudflare Pages**
   - Go to your project → Settings → Environment Variables → Production
   - Click "Add variable" for each of the critical variables above
   - Save changes

2. **Trigger a new deployment**
   - After merging the PR, Cloudflare Pages will auto-deploy
   - Alternatively, manually redeploy from the Deployments tab to pick up the new env vars immediately

3. **Verify env vars are loaded**
   - Once deployed, visit `https://scanminers.com/admin/login` (you'll be redirected if not logged in)
   - After logging in with the password, visit `/admin/system`
   - Check that all the env vars you just set show ✅ in the table

4. **Test the full login flow**
   - Log out using the "Sign out" button
   - Visit `/admin` → confirm redirect to `/admin/login`
   - Enter your production `ADMIN_PASS` → confirm successful login and access to admin routes

## Troubleshooting

- **Login loops back to `/admin/login`**: Verify `NEXTAUTH_URL` exactly matches your domain (no `http://`, no trailing slash) and that `NEXTAUTH_SECRET` is set. Check Cloudflare Pages logs for middleware errors.
- **Password form not visible**: Ensure `ENABLE_ADMIN_PASSWORD_LOGIN=true` is set in production and redeploy.
- **Middleware errors**: Confirm all required env vars are in the **Production** environment (not just Preview). Double-check spelling and values.
- **Session not persisting**: Make sure cookies are allowed in your browser and `NEXTAUTH_URL` matches the exact domain you're visiting.

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is unique for production (not copied from dev)
- [ ] `ADMIN_PASS` is strong (12+ chars, mixed case, numbers, symbols)
- [ ] `ALLOW_ADMIN_WITHOUT_AUTH` is unset or explicitly `false`
- [ ] `NEXTAUTH_URL` uses `https://` and matches your canonical domain
- [ ] GitHub OAuth secrets (if used) are production-only credentials

Once all variables are set and deployment succeeds, follow the manual testing checklist in `docs/admin-login-testing.md` to validate end-to-end.
