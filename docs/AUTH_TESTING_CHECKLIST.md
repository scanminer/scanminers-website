# Admin Authentication Testing Checklist

## ✅ Authentication System Overview
- **Primary Method**: Password-based credentials (username + password)
- **Secondary Method**: GitHub OAuth (optional)
- **Security**: Production-hardened middleware with auth bypass protection

## 🔧 Environment Setup

### Required Environment Variables
```bash
NEXTAUTH_SECRET=<your-secret>     # REQUIRED - Random string for JWT signing
NEXTAUTH_URL=<your-url>            # Your site URL (e.g., http://localhost:3000)
ADMIN_USER=admin                   # Admin username (default: "admin")
ADMIN_PASS=<your-password>         # REQUIRED - Admin password
ADMIN_ACTOR_NAME=<name>            # Display name for admin user
ENABLE_ADMIN_PASSWORD_LOGIN=true   # Enable password login (default: true)
```

### Optional GitHub OAuth
```bash
GITHUB_OAUTH_CLIENT_ID=<client-id>
GITHUB_OAUTH_CLIENT_SECRET=<client-secret>
ADMIN_ALLOWED_GITHUB_LOGINS=<comma-separated-handles>
```

### Development Only
```bash
ALLOW_ADMIN_WITHOUT_AUTH=true      # ⚠️ NEVER use in production!
```

---

## 📋 Manual Testing Checklist

### 1. Local Development Testing

#### 1.1 Password Login Flow
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `http://localhost:3000/admin/login`
- [ ] **Verify**: Login form shows username and password fields
- [ ] **Verify**: No critical warnings displayed (NEXTAUTH_SECRET, ADMIN_PASS configured)
- [ ] Enter correct username and password
- [ ] Click "Sign in with password"
- [ ] **Expected**: Redirect to `/admin` dashboard
- [ ] **Verify**: Can access admin pages (e.g., `/admin/system`, `/admin/leads`)

#### 1.2 Invalid Credentials
- [ ] Navigate to `/admin/login`
- [ ] Enter **wrong username**, correct password
- [ ] **Expected**: Error message "Invalid username or password"
- [ ] Enter correct username, **wrong password**
- [ ] **Expected**: Error message "Invalid username or password"
- [ ] **Verify**: User remains on login page

#### 1.3 Protected Routes
- [ ] Log out or clear cookies
- [ ] Try to access `/admin` directly
- [ ] **Expected**: Redirect to `/admin/login?next=%2Fadmin`
- [ ] Try to access `/admin/system` directly
- [ ] **Expected**: Redirect to `/admin/login?next=%2Fadmin%2Fsystem`
- [ ] After login with correct credentials
- [ ] **Expected**: Redirect back to originally requested page

#### 1.4 Authenticated User Behavior
- [ ] Log in successfully
- [ ] Try to navigate to `/admin/login` manually
- [ ] **Expected**: Auto-redirect to `/admin` (already authenticated)
- [ ] Open `/admin/system` page
- [ ] **Verify**: Authentication Status section shows:
  - Environment: Development
  - NEXTAUTH_SECRET: ✅ Configured
  - ADMIN_PASS: ✅ Configured
  - Password Login: ✅ Enabled
  - Auth Bypass: ✅ Disabled (unless ALLOW_ADMIN_WITHOUT_AUTH=true)

#### 1.5 Missing Configuration Warnings
- [ ] Stop server
- [ ] Remove `ADMIN_PASS` from `.env.local`
- [ ] Restart server
- [ ] Navigate to `/admin/login`
- [ ] **Verify**: Red warning box shows "Admin password not configured"
- [ ] **Verify**: Password form fields are disabled
- [ ] **Verify**: System page shows ADMIN_PASS: ❌ Missing

#### 1.6 GitHub OAuth (Optional)
- [ ] Configure `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET`
- [ ] Restart server
- [ ] Navigate to `/admin/login`
- [ ] **Verify**: "Continue with GitHub" button appears below password form
- [ ] Click GitHub button
- [ ] **Expected**: Redirects to GitHub OAuth flow
- [ ] Authorize the app
- [ ] **Expected**: Redirect back to admin dashboard (if GitHub user is allowlisted)

---

### 2. Production Testing (After Deployment)

#### 2.1 Configuration Verification
- [ ] Navigate to `/admin/system`
- [ ] **Verify**: Environment shows "PRODUCTION"
- [ ] **Verify**: All critical env vars configured:
  - NEXTAUTH_SECRET: ✅
  - ADMIN_PASS: ✅
  - ADMIN_USER: ✅
- [ ] **Critical**: Auth Bypass shows "✅ Disabled"

#### 2.2 Production Login Flow
- [ ] Navigate to `/admin/login` in production
- [ ] Enter production admin credentials
- [ ] **Expected**: Successful login and redirect to `/admin`
- [ ] **Verify**: Can access all admin pages
- [ ] **Verify**: Console shows middleware logs:
  - `✅ Admin access granted to /admin`
  - `✅ Admin access granted to /admin/system`

#### 2.3 Security: Auth Bypass Protection
- [ ] **DO NOT SET** `ALLOW_ADMIN_WITHOUT_AUTH=true` in production
- [ ] If accidentally set, middleware will:
  - Reject requests with 403 status
  - Log: "❌ SECURITY VIOLATION: ALLOW_ADMIN_WITHOUT_AUTH is enabled in production"
  - Return JSON error: "Authentication bypass not allowed in production"
- [ ] **Verify**: This protection is active by checking middleware.ts code

#### 2.4 Session Persistence
- [ ] Log in to production admin
- [ ] Close browser tab
- [ ] Reopen and navigate to `/admin`
- [ ] **Expected**: Still authenticated (session persists via JWT cookie)
- [ ] Wait for session expiration (default: 30 days)
- [ ] **Expected**: Eventually require re-login

---

### 3. Edge Cases & Error Handling

#### 3.1 Middleware Logging
- [ ] Check browser console or server logs for:
  - `🔒 Unauthorized access attempt to <path>` - when not logged in
  - `✅ Admin access granted to <path>` - when accessing protected pages
  - `↩️ Redirecting authenticated user from login to <path>` - when visiting login while authenticated
  - `⚠️ DEV MODE: Authentication bypass active` - only in development with ALLOW_ADMIN_WITHOUT_AUTH=true

#### 3.2 Username Case Sensitivity
- [ ] Configure `ADMIN_USER=myuser`
- [ ] Try login with `MyUser` (different case)
- [ ] **Expected**: Login fails (usernames are case-sensitive)

#### 3.3 Empty/Missing Fields
- [ ] Try to submit login form with empty username
- [ ] **Expected**: Error "Username and password are required"
- [ ] Try to submit with empty password
- [ ] **Expected**: Same error message

---

## 🐛 Troubleshooting

### Issue: "NO_SECRET" error during build
**Cause**: NEXTAUTH_SECRET not set at build time  
**Solution**: Ensure NEXTAUTH_SECRET is configured in:
- `.env.local` for local development
- Cloudflare Pages environment variables for production
- GitHub Actions secrets for CI/CD

### Issue: Login button does nothing
**Check**:
1. Browser console for errors
2. Network tab for failed API calls to `/api/auth/callback/credentials`
3. Verify NEXTAUTH_URL matches your actual URL
4. Check server logs for authentication errors

### Issue: "Invalid username or password" for correct credentials
**Check**:
1. Verify `ADMIN_USER` and `ADMIN_PASS` exactly match your input (case-sensitive for username)
2. Check for trailing spaces in environment variables
3. Restart dev server after changing env vars
4. Verify env vars loaded: check `/admin/system` page

### Issue: Infinite redirect loop
**Cause**: Usually JWT token not being set or read correctly  
**Solution**:
1. Clear all cookies for the domain
2. Verify NEXTAUTH_SECRET is consistent across requests
3. Check middleware.ts is correctly reading token via `getToken()`

---

## ✅ Sign-off

Once all checklist items pass:

- [ ] **Local**: All tests pass ✅
- [ ] **Production**: Login working ✅
- [ ] **Security**: Auth bypass disabled in production ✅
- [ ] **Diagnostics**: System page shows correct configuration ✅
- [ ] **Tests**: `npm run lint` passes ✅
- [ ] **Tests**: `npm run test` passes ✅
- [ ] **Build**: `npm run build` succeeds ✅

**Tested by**: _________________  
**Date**: _________________  
**Environment**: [ ] Local [ ] Production  
**Notes**: _________________
