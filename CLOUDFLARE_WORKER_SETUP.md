# Cloudflare Workers Application Setup - Complete Configuration Guide

## 📋 New Worker Application Configuration

Use this checklist when creating your new Worker application in Cloudflare Dashboard.

---

## 1. Create New Worker Application

1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Click **Create Application** → **Workers** tab
3. Connect to GitHub:
   - Repository: `scanminer/scanminers-website`
   - Branch: `main`
4. **Worker Name:** `scanminers` (matches `wrangler.toml`)
5. Click **Save and Deploy** (initial deploy will configure the project)

---

## Step 2: Build Configuration

**Navigate to:** Settings → **Builds**

### Build Settings
```
Build command:  npx opennextjs-cloudflare build
Deploy command: npx opennextjs-cloudflare deploy
Build output directory: .open-next
Root directory: .
Node version: 20.x (auto-detected)
```

### Build Environment Variables
**Location:** Settings → Build → **Build Variables and Secrets**

These are baked into the client bundle at build time:

| Variable Name | Value | Type |
|--------------|-------|------|
| `NEXT_PUBLIC_SITE_URL` | `https://scanminers.com` | Variable |
| `NEXT_PUBLIC_GITHUB_REPO` | `scanminer/scanminers-website` | Variable |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `0x4AAAAAAB6CwlnnHkgvvHO7` | Variable |
| `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` | `EYcwK7fup8jrbRd9aomIdnui-8xxDsFhd6zX17la` | Variable |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://b53612d82fc99224ef09db277d60ad97@o4510172336291840.ingest.de.sentry.io/4510172344025168` | Variable |

> **Note:** All `NEXT_PUBLIC_*` variables must be set in Build Variables (not Runtime Variables) because Next.js inlines them into the client bundle during build.

---

## Step 3: Runtime Environment Variables

**Navigate to:** Settings → **Variables and Secrets**

### Production Environment

#### Plain Text Variables

| Variable Name | Value | Type |
|--------------|-------|------|
| `ENABLE_INITIATE_API` | `false` | Variable |
| `GH_REPO` | `scanminer/scanminers-website` | Variable |
| `GIT_DEFAULT_BRANCH` | `main` | Variable |
| `CONTENT_AUTHOR_NAME` | `ScanminersBot` | Variable |
| `CONTENT_AUTHOR_EMAIL` | `bot@scanminers.com` | Variable |
| `SENTRY_ENVIRONMENT` | `production` | Variable |
| `PERPLEXITY_MODEL` | `sonar-pro` | Variable |
| `OPENAI_MODEL` | `gpt-4o` | Variable |
| `WEEKLY_TOKENS` | `6000` | Variable |
| `MONTHLY_TOKENS` | `20000` | Variable |
| `RESEND_FROM` | `contact@scanminers.com` | Variable |
| `RESEND_TO` | `founders@scanminers.com` | Variable |
| `ADMIN_USER` | `admin` | Variable |
| `GITHUB_OAUTH_CLIENT_ID` | `Ov23lidOWfKPNvTsn170` | Variable |

#### Secrets (Encrypted)

| Secret Name | Value | Notes |
|------------|-------|-------|
| `TURNSTILE_SECRET_KEY` | `0x4AAAAAAB6CwvpKS4CKckRYyNENVwPfdLw` | CAPTCHA verification |
| `RESEND_API_KEY` | `re_c5xfWJps_7PTm2fJfpfei5dCPNsKf8TDy` | Email sending |
| `ADMIN_ACTION_TOKEN` | `j6Oda9GKkkhbHACA6aoiZyq9ruOUztdY0ESE7zOpdNc=` | Admin workflow auth |
| `PERPLEXITY_KEY` | `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` | AI API |
| `STABILITY_API_KEY` | `sk-zNEtXnhGbIzvlvY23BwNDvFaKv09pEPv9nIbzx3S94ZWzgNt` | Image generation |
| `OPENAI_API_KEY` | `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` | AI API |
| `CONTENT_BOT_TOKEN` | `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` | GitHub automation |
| `GH_TOKEN` | `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` | GitHub API |
| `GITHUB_OAUTH_CLIENT_SECRET` | `983369da48f5ec06899b3540030fbdf7f36f24dc` | Decap CMS OAuth |
| `ADMIN_PASS` | `Kualalumpur123!` | Admin basic auth |

> **Important:** Set these as **Secrets** (not Variables) to encrypt them. Once saved, they cannot be viewed again.

---

### Preview Environment (Optional)

If you want different values for preview deployments, set these separately:

#### Preview-specific Variables
| Variable Name | Value | Notes |
|--------------|-------|-------|
| `ENABLE_INITIATE_API` | `true` | Allow API in preview |
| `SENTRY_ENVIRONMENT` | `preview` | Distinguish preview errors |
| `NEXT_PUBLIC_SITE_URL` | `https://scanminers-website.workers.dev` | Preview URL |

> **Tip:** Most variables can inherit from Production. Only override what needs to be different.

---

## Step 4: Domain Configuration

**Navigate to:** Settings → Domains & Routes → **Custom Domains**

### Primary Domain
- **Domain:** `scanminers.com`
- **Type:** Custom Domain (not Route)

### WWW Redirect (if needed)
- **Domain:** `www.scanminers.com`
- **Type:** Custom Domain (not Route)

> **Before adding:** Remove these domains from Cloudflare Pages if still attached there.

---

## Step 5: Verify wrangler.toml (Already in Repo)

Your `wrangler.toml` should have these settings:

```toml
name = "scanminers-website"
main = ".open-next/worker.js"
compatibility_date = "2025-09-23"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"
# run_worker_first = false (default - recommended)
```

✅ This is already configured correctly in your repo.

---

## Step 6: Deploy & Test

### 6.1 Trigger First Deploy

1. Click **"Deploy"** or push to main branch
2. Monitor build logs for:
   - ✅ `npx opennextjs-cloudflare build`
   - ✅ `.open-next/worker.js` generated
   - ✅ ASSETS binding connected
   - ✅ Deployment successful

### 6.2 Test on Workers.dev Subdomain

Your Worker will be available at: `https://scanminers-website.{your-account}.workers.dev`

```bash
# Replace {your-account} with your actual subdomain
WORKER_URL="https://scanminers-website.{your-account}.workers.dev"

# Test 1: API gate (expect 403 - gate working)
curl -i -X POST $WORKER_URL/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test"}'

# Test 2: Health check (expect 200)
curl -i $WORKER_URL/api/health

# Test 3: Static asset (expect 200)
curl -I $WORKER_URL/images/og/using-lidar-for-tailing-dam-monitoring.png
```

### 6.3 Attach Custom Domain

After workers.dev tests pass:

1. Remove `scanminers.com` from Pages (if attached)
2. Add `scanminers.com` to Worker → Custom Domains
3. DNS propagates instantly (same Cloudflare account)

### 6.4 Test Production Domain

```bash
# Test 1: API gate (expect 403)
curl -i -X POST https://scanminers.com/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test"}'

# Test 2: Health check (expect 200)
curl -i https://scanminers.com/api/health

# Test 3: Static asset (expect 200)
curl -I https://scanminers.com/images/og/using-lidar-for-tailing-dam-monitoring.png
```

---

## 📊 Configuration Summary

### Total Variables to Set

| Category | Count |
|----------|-------|
| Build Variables (NEXT_PUBLIC_*) | 5 |
| Runtime Variables (plain text) | 14 |
| Runtime Secrets (encrypted) | 10 |
| **Total** | **29** |

### Critical for Basic Function

Minimum required for site to work:

**Build Variables:**
- ✅ `NEXT_PUBLIC_SITE_URL`
- ✅ `NEXT_PUBLIC_GITHUB_REPO`

**Runtime Variables:**
- ✅ `ENABLE_INITIATE_API = false`

**Runtime Secrets:**
- ✅ `GH_TOKEN` (for admin features)
- ✅ `RESEND_API_KEY` (for contact form)

---

## 🔒 Security Notes

1. **Never commit secrets to git** - Use Cloudflare Secrets for sensitive values
2. **Use different tokens for Production vs Preview** if possible
3. **Rotate tokens periodically** (especially GitHub PATs)
4. **Review permissions** on GitHub tokens - use minimum required scopes
5. **Monitor usage** in Cloudflare dashboard for anomalies

---

## 🚨 Common Issues

### Issue: Build fails with "OpenNext not found"

**Fix:** Verify build command is exactly:
```
npx opennextjs-cloudflare build
```

### Issue: 404 on API routes after deploy

**Fix:** Check:
1. Build command uses OpenNext (not next-on-pages)
2. `compatibility_flags = ["nodejs_compat"]` in wrangler.toml
3. Deployment logs show `.open-next/worker.js` created

### Issue: Environment variables not working

**Fix:**
- `NEXT_PUBLIC_*` → Set in **Build Variables**
- Runtime vars → Set in **Variables and Secrets**
- Secrets → Use **Add Secret** (not Add Variable)

### Issue: Static assets slow or 404

**Fix:** Verify `[assets]` binding in wrangler.toml:
```toml
[assets]
directory = ".open-next/assets"
binding = "ASSETS"
```

---

## ✅ Post-Configuration Checklist

After setting everything up:

- [ ] All 5 Build Variables set
- [ ] All 14 Runtime Variables set
- [ ] All 10 Runtime Secrets set
- [ ] Build command updated to OpenNext
- [ ] Custom domain attached
- [ ] Smoke tests pass (403, 200, 200)
- [ ] Pages domain removed (no split origin)
- [ ] Worker logs showing requests

---

## 📞 Need Help?

If any tests fail, post the curl output and Worker logs. See:
- `FINAL_CUTOVER_CHECKLIST.md` for deployment steps
- `docs/OPENNEXT_DEPLOYMENT.md` for troubleshooting
- `CLOUDFLARE_DASHBOARD_ACTION_REQUIRED.md` for detailed setup

---

**Ready to configure!** Use this as your checklist when setting up the new Worker in Cloudflare Dashboard. 🚀
