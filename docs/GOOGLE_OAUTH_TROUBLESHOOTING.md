# Google OAuth Not Showing - Troubleshooting Guide

## Problem

The Google login button is not appearing on https://scanminers.com/admin/login even though:

- ✅ Code is deployed (commit c874d21)
- ✅ Cloudflare build successful
- ✅ Environment variables are set (according to user)

## Root Cause Analysis

The login button visibility is controlled server-side by checking if both environment variables are set:

```typescript
const googleClientId = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET ?? "").trim();
const googleProviderEnabled = Boolean(googleClientId && googleClientSecret);
```

If `googleProviderEnabled` is `false`, the button won't render.

## Most Likely Issues

### 1. Environment Variable Names (MOST COMMON)

The **exact** variable names must be:

- `GOOGLE_CLIENT_ID` (not GOOGLE_OAUTH_CLIENT_ID, not Google_Client_Id, etc.)
- `GOOGLE_CLIENT_SECRET` (not GOOGLE_OAUTH_CLIENT_SECRET, etc.)

**Case-sensitive!** Cloudflare Pages is case-sensitive for environment variables.

### 2. Environment Variable Scope

In Cloudflare Pages, variables can be set for:

- **Production** - Used by production deployments
- **Preview** - Used by PR preview deployments

Make sure variables are set for **Production** (not just Preview).

### 3. Deployment Timing

Variables are read at **build time** for some Next.js features. If you:

1. Set the variables
2. Then the build completed

The variables should be available. However, if the build started _before_ you saved the variables, you may need to trigger a new deployment.

### 4. Whitespace Issues

Environment variables are trimmed in code with `.trim()`, but Cloudflare might have leading/trailing spaces in the value. Make sure there are no extra spaces.

## Diagnostic Steps

### Step 1: Check Environment Variables in Cloudflare Dashboard

1. Go to: **Cloudflare Dashboard** → **Workers & Pages** → **scanminers-website**
2. Click: **Settings** → **Environment variables**
3. Verify these exact names exist for **Production**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Check the values don't have leading/trailing spaces
5. Confirm `GOOGLE_CLIENT_SECRET` is marked as "Encrypt" (secret)

### Step 2: Use the Diagnostic Endpoint

Once PR #79 is deployed, visit:

```
https://scanminers.com/api/admin/env-check
```

Expected response when working:

```json
{
  "timestamp": "2025-11-17T...",
  "nodeEnv": "production",
  "variables": {
    "GOOGLE_CLIENT_ID": true,
    "GOOGLE_CLIENT_SECRET": true,
    "NEXTAUTH_SECRET": true,
    "ADMIN_ALLOWED_EMAIL_DOMAINS": true
  },
  "googleOAuthReady": true
}
```

If `"googleOAuthReady": false`, the variables aren't being read correctly.

### Step 3: Check the Login Page HTML

View source of https://scanminers.com/admin/login

If Google OAuth is configured correctly, you should see:

- No blue warning box mentioning "Google OAuth isn't configured"
- A button with text "Continue with Google"

### Step 4: Force New Deployment (if needed)

If variables were set _after_ the last deployment started:

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **scanminers-website**
2. Click **View builds**
3. Find latest deployment, click **"..."** → **Retry deployment**

Or simply push a dummy commit to trigger a new build.

## Quick Fix Checklist

- [ ] Verify exact variable names: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Check variables are set for **Production** environment
- [ ] Confirm no leading/trailing whitespace in values
- [ ] Check OAuth redirect URI matches in Google Cloud Console
- [ ] Wait for PR #79 to deploy, then check `/api/admin/env-check`
- [ ] If endpoint shows `false`, re-save environment variables in Cloudflare
- [ ] Trigger new deployment after fixing variables

## Expected OAuth Redirect URI

In Google Cloud Console, the authorized redirect URI must be:

```
https://scanminers.com/api/auth/callback/google
```

(Not `localhost`, not `http://`, must be exact production URL)

## Reference Files

- Environment config: `lib/admin-auth.ts` (lines 56-58)
- Login page logic: `app/admin/login/page.tsx` (line 104)
- Login form: `app/admin/login/login-form.tsx` (line 116)
- Auth config: `auth.ts` (Google provider)

## Next Steps

1. Wait for PR #79 to deploy (~5 minutes)
2. Visit `/api/admin/env-check` to see current state
3. Based on the response, we'll know if it's:
   - Environment variables not set correctly
   - OAuth redirect URI mismatch
   - Other configuration issue
