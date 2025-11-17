# Production Deployment Checklist - Google OAuth

## ✅ Pull Request Created

**PR #77**: https://github.com/scanminer/scanminers-website/pull/77

---

## 📋 Pre-Deployment Checklist

### 1. Review & Approve PR

- [ ] Review the code changes in PR #77
- [ ] Verify all CI checks pass
- [ ] Get approval from team members (if required)
- [ ] Merge PR to `main` branch

### 2. Verify Google OAuth App Configuration

- [ ] Google Cloud Console project created
- [ ] OAuth consent screen configured (Internal for Workspace)
- [ ] Production callback URL added:
  - `https://scanminers.com/api/auth/callback/google`
- [ ] Client ID and Secret generated and saved securely

---

## 🚀 Production Deployment Steps

### Step 1: Configure Cloudflare Pages Environment Variables

1. **Go to Cloudflare Dashboard**

   - Navigate to: **Workers & Pages** → `scanminers-website` → **Settings** → **Environment variables**

2. **Add Production Variables**

   Click **Add variable** for each:

   | Variable Name                 | Value                                                                      | Type         |
   | ----------------------------- | -------------------------------------------------------------------------- | ------------ |
   | `GOOGLE_CLIENT_ID`            | `308591175886-chff6t1rttnb0jbf62f0rdvhq07dj8up.apps.googleusercontent.com` | Plain text   |
   | `GOOGLE_CLIENT_SECRET`        | `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`                                      | **Secret** ✓ |
   | `ADMIN_ALLOWED_EMAIL_DOMAINS` | `scanminers.com`                                                           | Plain text   |

3. **Save Changes**

### Step 2: Verify Existing Variables

Ensure these are still configured:

- [ ] `NEXTAUTH_SECRET` - ✓ Should already exist
- [ ] `NEXTAUTH_URL` - Should be `https://scanminers.com`
- [ ] `ADMIN_PASS` - ✓ Should already exist
- [ ] `ADMIN_ALLOWED_EMAILS` - ✓ Should already exist
- [ ] `GITHUB_OAUTH_CLIENT_ID` - ✓ Should already exist (if using GitHub OAuth)
- [ ] `GITHUB_OAUTH_CLIENT_SECRET` - ✓ Should already exist (if using GitHub OAuth)

### Step 3: Deploy

Once PR is merged, Cloudflare Pages will automatically deploy.

**Monitor deployment:**

```bash
# Watch deployment status
wrangler tail scanminers --format=pretty
```

---

## 🧪 Post-Deployment Testing

### Test 1: Verify Login Page Shows Google Button

1. **Visit**: https://scanminers.com/admin/login
2. **Verify**: You should see three login options:
   - Username/password form
   - "Continue with GitHub" button
   - "Continue with Google" button ⭐ (new)

### Test 2: Test Google Sign-In

1. **Click**: "Continue with Google"
2. **Select**: Your Google Workspace account (e.g., `admin@scanminers.com`)
3. **Verify**: Redirected to `/admin` dashboard
4. **Verify**: Top-right shows your name from Google account

### Test 3: Test Domain Access Control

**Allowed User** (in `scanminers.com` domain):

- ✅ Should successfully sign in
- ✅ Should have admin access

**Non-Workspace User** (different domain):

- ❌ Should be rejected with "not in allowlist" message

### Test 4: Test Sign-Out

1. **Click**: "Sign out" button in admin panel
2. **Verify**: Redirected to `/admin/login`
3. **Verify**: Admin menu no longer visible
4. **Verify**: No flash of admin UI
5. **Verify**: Can sign in again

### Test 5: Verify Password Login Still Works

1. **Visit**: https://scanminers.com/admin/login
2. **Enter**: Username and password
3. **Click**: "Sign in with password"
4. **Verify**: Successfully signs in

### Test 6: Check System Diagnostics

1. **Sign in** to admin panel
2. **Visit**: https://scanminers.com/admin/system
3. **Verify** in "Authentication Status" section:
   - Google OAuth: ✅ Enabled
   - Password Login: ✅ Enabled
   - GitHub OAuth: ✅ Enabled (if configured)
   - Auth Bypass: ✅ Disabled

---

## 🔍 Troubleshooting

### Issue: Google button doesn't appear

**Check:**

```bash
# Via browser console or /admin/system page
# Verify these are set:
GOOGLE_CLIENT_ID=308591175886-...
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

**Solution:**

1. Verify environment variables are set in Cloudflare Pages
2. Redeploy if variables were just added
3. Clear browser cache

### Issue: "Redirect URI mismatch" error

**Solution:**

1. Go to Google Cloud Console → Credentials
2. Edit OAuth client
3. Ensure exact callback URL: `https://scanminers.com/api/auth/callback/google`
4. No trailing slash, exact match required

### Issue: "User not in allowlist" after Google sign-in

**Check:**

```bash
# Verify in Cloudflare Pages environment variables:
ADMIN_ALLOWED_EMAIL_DOMAINS=scanminers.com
```

**Solution:**

1. Ensure your domain is in `ADMIN_ALLOWED_EMAIL_DOMAINS`
2. Or add specific email to `ADMIN_ALLOWED_EMAILS`
3. Redeploy after adding variables

### Issue: Admin menu still shows after sign-out

**This should be fixed!** But if it happens:

1. Clear browser cookies for `scanminers.com`
2. Clear browser cache
3. Try in incognito/private window
4. Check browser console for errors

---

## 📊 Success Criteria

✅ All tests passed
✅ Google OAuth sign-in works
✅ Domain access control works correctly  
✅ Sign-out properly clears session
✅ Password login still works
✅ GitHub OAuth still works (if configured)
✅ No breaking changes to existing functionality

---

## 🎉 Completion

Once all tests pass:

- [ ] Mark this deployment as complete
- [ ] Notify team members
- [ ] Update internal docs if needed
- [ ] Monitor error logs for first 24 hours

---

## 📞 Support

**Issues?**

- Check `/admin/system` page for diagnostics
- Review Cloudflare Pages deployment logs
- Check browser console for client-side errors
- Use `wrangler tail scanminers` for real-time logs

**Documentation:**

- `docs/GOOGLE_OAUTH_SETUP.md` - Setup guide
- `docs/AUTH_TESTING_CHECKLIST.md` - Testing procedures
- `docs/AUTH_IMPLEMENTATION_SUMMARY.md` - Technical details

---

**Last Updated:** November 17, 2025  
**PR:** #77  
**Branch:** `feat/google-oauth-workspace-sso`
