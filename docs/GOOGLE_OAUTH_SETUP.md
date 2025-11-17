# Google OAuth Setup for Admin Portal

This guide walks you through setting up Google OAuth (Google Workspace) as an authentication method for the Scanminers admin portal.

## Overview

Google OAuth has been added as a **third authentication method** alongside:

1. **Password login** (primary, always active)
2. **GitHub OAuth** (optional, for developers)
3. **Google OAuth** (optional, for Google Workspace users)

## Prerequisites

✅ Google Workspace account with admin access
✅ Domain DNS configured in Cloudflare (MX, SPF, DKIM, DMARC)
✅ NextAuth configured with `NEXTAUTH_SECRET`

## Step 1: Create Google OAuth App

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google Workspace admin account
3. Select or create a project (e.g., "Scanminers Admin Auth")

### 1.2 Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **Internal** (for Google Workspace users only)
   - This restricts access to users in your organization
3. Fill in the required fields:
   - **App name**: `Scanminers Admin Portal`
   - **User support email**: Your admin email (e.g., `admin@scanminers.com`)
   - **Developer contact information**: Same email
4. Click **Save and Continue**
5. Skip "Scopes" (default scopes are sufficient)
6. Click **Save and Continue**
7. Review and click **Back to Dashboard**

### 1.4 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type**: **Web application**
4. Configure the following:
   - **Name**: `Scanminers Admin Web Client`
   - **Authorized JavaScript origins**:
     - `https://scanminers.com` (production)
     - `https://scanminers.pages.dev` (preview/staging)
     - `http://localhost:3000` (local development)
   - **Authorized redirect URIs**:
     - `https://scanminers.com/api/auth/callback/google`
     - `https://scanminers.pages.dev/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
5. Click **Create**
6. **Save your credentials**:
   - Copy the **Client ID** (starts with something like `123456789-abc...apps.googleusercontent.com`)
   - Copy the **Client Secret**

## Step 2: Configure Environment Variables

### 2.1 Local Development (`.env.local`)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# Domain allowlist (use your Google Workspace domain)
ADMIN_ALLOWED_EMAIL_DOMAINS=scanminers.com

# Or specific emails
ADMIN_ALLOWED_EMAILS=admin@scanminers.com,founder@scanminers.com
```

### 2.2 Production (Cloudflare Pages)

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Select your project (`scanminers-website`)
3. Go to **Settings** → **Environment variables**
4. Add for **Production** environment:
   - `GOOGLE_CLIENT_ID` = (your client ID)
   - `GOOGLE_CLIENT_SECRET` = (your client secret) - Mark as **Secret**
   - `ADMIN_ALLOWED_EMAIL_DOMAINS` = `scanminers.com`
5. Repeat for **Preview** environment if needed

## Step 3: Test the Integration

### 3.1 Local Testing

1. Start your dev server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/admin/login`

3. You should see three login options:

   - **Password login** (username + password)
   - **Continue with GitHub** (if GitHub OAuth configured)
   - **Continue with Google** ⭐ (new)

4. Click **Continue with Google**

5. You'll be redirected to Google's sign-in page

6. Select your Google Workspace account

7. Grant permissions (first time only)

8. You should be redirected back to `/admin` dashboard

### 3.2 Verify Access Control

Test with different scenarios:

✅ **Allowed user** (in `ADMIN_ALLOWED_EMAIL_DOMAINS` or `ADMIN_ALLOWED_EMAILS`):

- Should successfully sign in
- Should have admin access

❌ **Non-workspace user** (e.g., personal Gmail):

- If consent screen is "Internal", they won't even see the app
- If "External", they'll be rejected after sign-in

❌ **Workspace user from different domain**:

- Will be rejected after sign-in with "not in allowlist" error

## Step 4: Production Deployment

### 4.1 Deploy to Production

```bash
git add .
git commit -m "feat(auth): add Google OAuth as third login method"
git push origin main
```

### 4.2 Verify Production

1. Visit `https://scanminers.com/admin/login`
2. Click **Continue with Google**
3. Sign in with your Google Workspace account
4. Verify you're redirected to admin dashboard

## Configuration Reference

### Environment Variables

| Variable                      | Required    | Description                                      |
| ----------------------------- | ----------- | ------------------------------------------------ |
| `GOOGLE_CLIENT_ID`            | Yes         | OAuth 2.0 Client ID from Google Cloud Console    |
| `GOOGLE_CLIENT_SECRET`        | Yes         | OAuth 2.0 Client Secret (keep secret!)           |
| `ADMIN_ALLOWED_EMAIL_DOMAINS` | Recommended | Comma-separated domains (e.g., `scanminers.com`) |
| `ADMIN_ALLOWED_EMAILS`        | Optional    | Comma-separated specific emails to allow         |
| `NEXTAUTH_SECRET`             | Yes         | Secret for signing JWT tokens                    |

### Access Control Logic

Google OAuth users are granted admin access if:

1. Their email domain is in `ADMIN_ALLOWED_EMAIL_DOMAINS`, OR
2. Their email is in `ADMIN_ALLOWED_EMAILS`

**Recommended for Google Workspace:**

```bash
# Allow all users from your workspace
ADMIN_ALLOWED_EMAIL_DOMAINS=scanminers.com
```

**Alternative (more restrictive):**

```bash
# Allow only specific users
ADMIN_ALLOWED_EMAILS=admin@scanminers.com,founder@scanminers.com,ops@scanminers.com
```

## Troubleshooting

### Issue: "Redirect URI mismatch" error

**Solution:** Add your exact callback URL to Google Cloud Console:

- Go to **Credentials** → Edit your OAuth client
- Add the exact URL: `https://yourdomain.com/api/auth/callback/google`
- Make sure there are no trailing slashes

### Issue: Google button doesn't appear

**Check:**

1. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Restart your dev server after adding env vars
3. Check browser console for errors
4. Visit `/admin/system` to verify configuration

### Issue: "User not in allowlist" after Google sign-in

**Solution:**

1. Check your email domain is in `ADMIN_ALLOWED_EMAIL_DOMAINS`
2. Or add your specific email to `ADMIN_ALLOWED_EMAILS`
3. Verify case sensitivity (domains are normalized to lowercase)
4. Check `/admin/system` page for current allowlist

### Issue: "Internal" vs "External" OAuth consent screen

**For Google Workspace (recommended):**

- Use **Internal** consent screen
- Only users in your workspace can see/use the app
- No Google verification required

**For external users:**

- Use **External** consent screen
- Requires Google verification (lengthy process)
- Not recommended for internal admin tools

## Security Best Practices

✅ **Use "Internal" OAuth consent screen** for Google Workspace
✅ **Use domain-based allowlist** (`ADMIN_ALLOWED_EMAIL_DOMAINS`)
✅ **Keep `GOOGLE_CLIENT_SECRET` secure** (never commit to git)
✅ **Use strong `NEXTAUTH_SECRET`** (generated with `openssl rand -base64 32`)
✅ **Keep password login enabled** as a backup method
✅ **Test in staging/preview** before deploying to production

## Migration from GitHub-Only Auth

If you were using only GitHub OAuth before:

1. ✅ Google OAuth is **additive** - GitHub still works
2. ✅ Password login is **unchanged** - still works as before
3. ✅ No breaking changes - all existing auth methods remain functional
4. ✅ Users can choose their preferred sign-in method

## Support

For issues or questions:

- Check `/admin/system` page for configuration diagnostics
- Review server logs for authentication errors
- Verify Google Cloud Console configuration
- Ensure DNS and Google Workspace are properly configured

---

**Last Updated:** November 17, 2025
**Version:** 1.0.0
