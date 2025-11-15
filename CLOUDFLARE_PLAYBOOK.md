# Cloudflare Workers - Last Mile Checklist

**Worker:** `scanminers`  
**Status:** ✅ Live and operational  
**Date:** November 8, 2025

---

## 🎯 Phase Completion Checklist

Complete these 6 items to wrap the OpenNext → Workers migration:

- [ ] **1. Detach Pages Domain** - Remove `scanminers.com` from Pages project
- [ ] **2. Enable Live Logs** - Set up `wrangler tail` for real-time debugging
- [ ] **3. WAF + Rate Limiting** - Enable OWASP rules and throttle `/api/*` POSTs
- [ ] **4. OG Image Cache Headers** - Set long TTL on `/images/og/*` via Transform Rule
- [ ] **5. Sentry Error Tracking** - Add Cloudflare SDK for Worker errors (optional)
- [ ] **6. Merge PR #57** - LiDAR redirect for slug variants

**Phase Complete When:** Pages detached, logs tailing, WAF on, OG cache rule set, PR #57 merged.

---

## 1️⃣ Detach Pages Domain (5 min)

### Goal
Ensure `scanminers.com` points **only** to Worker, not the old Pages project.

### Steps

#### A. Check Current Domain Setup
```bash
# List Workers custom domains
wrangler deployments list --name scanminers

# Or in Dashboard:
# Workers & Pages → scanminers (Worker) → Settings → Domains
```

**Expected:** `scanminers.com` and `www.scanminers.com` attached to **Worker**

#### B. Detach from Pages Project
In Cloudflare Dashboard:

1. Go to **Workers & Pages** → Find `scanminers-website` (Pages project)
2. Click **Settings** → **Custom domains**
3. If `scanminers.com` is listed, click **...** → **Remove**
4. Confirm removal

**Verification:**
```bash
curl -I https://scanminers.com/api/health | grep "x-opennext"
# Should see: x-opennext: 1 (confirms Worker is serving)
```

**Reference:** [Custom Domains for Workers](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

---

## 2️⃣ Enable Live Logs (2 min)

### Goal
Real-time log streaming for debugging and monitoring.

### Setup Live Tail

```bash
# Stream all logs (pretty format)
wrangler tail scanminers --format=pretty

# Filter by status code
wrangler tail scanminers --status error

# Filter by HTTP method
wrangler tail scanminers --method POST

# Sample rate (10% of requests)
wrangler tail scanminers --sampling-rate 0.1
```

**Common Filters:**
- `--status error` - Only 4xx/5xx responses
- `--header "x-custom: value"` - Filter by header
- `--search "keyword"` - Text search in logs
- `--ip-address 1.2.3.4` - Specific IP

**Keep Running:** Leave `wrangler tail` running in a terminal tab during deployment/testing.

### Enable Logpush (Optional - Long-term Storage)

For historical logs and analytics:

**Dashboard:** Workers & Pages → scanminers → Logs → **Enable Logpush**

**Destinations:**
- **Cloudflare Datasets** (recommended - built-in analytics)
- R2 (Cloudflare object storage)
- S3, BigQuery, Datadog, etc.

**Cost:** Free for Datasets, R2 storage costs apply

**Reference:** [Wrangler Commands](https://developers.cloudflare.com/workers/wrangler/commands/)

---

## 3️⃣ Security Hardening (10 min)

### Goal
Add WAF protection and rate limiting for API endpoints.

### A. Enable Managed WAF Rules (OWASP) - NEW DASHBOARD

**Quick Link:** [Go to Security > WAF](https://dash.cloudflare.com/?to=/:account/:zone/security/waf)

**Steps:**
1. Log in to Cloudflare Dashboard
2. Select your **scanminers.com** zone
3. Go to **Security** → **WAF** → **Managed rules** tab
4. Under **Managed Rulesets**, find **Cloudflare OWASP Core Ruleset**
5. Click **Deploy** button next to it
6. (Optional) Click the ruleset name to configure:
   - **Ruleset action**: Keep as **Block** (recommended)
   - **Sensitivity**: Leave at default
7. Click **Deploy** (or **Save** if already deployed)

**What it protects:**
- SQL injection
- XSS (Cross-Site Scripting)
- RCE (Remote Code Execution)
- CSRF attacks
- Known CVEs

**Verify:** Ruleset should show as **Enabled** in the Managed rules list

### B. Rate Limit API POSTs - NEW DASHBOARD

**Quick Link:** [Go to Security](https://dash.cloudflare.com/?to=/:account/:zone/security)

**Steps:**
1. Stay in **Security** section
2. Go to **WAF** → **Rate limiting rules** tab
3. Click **Create rule** button
4. Enter **Rule name**: `API POST Rate Limit`
5. Under **When incoming requests match**:
   - Click **Edit expression**
   - Use Expression Builder or paste: 
     ```
     (http.request.uri.path contains "/api/") and (http.request.method eq "POST")
     ```
6. Under **Then**:
   - Select action: **Block** (or **Managed Challenge** for softer approach)
7. Under **With the same characteristics**:
   - Select: **IP Address**
8. Under **Rate limiting configuration**:
   - **Requests**: `20`
   - **Period**: `10 seconds`
   - **Mitigation timeout**: `1 minute`
9. Click **Deploy**

**What this does:**
- Allows 20 POST requests to /api/* per IP every 10 seconds
- Blocks (or challenges) excess requests for 1 minute
- Protects against API abuse and brute force

**Reference:** 
- [WAF Managed Rules](https://developers.cloudflare.com/waf/managed-rules/deploy-zone-dashboard/)
- [Rate Limiting Rules](https://developers.cloudflare.com/waf/rate-limiting-rules/create-zone-dashboard/)

---

## 4️⃣ OG Image Cache Headers (3 min)

### Goal
Set long TTL on social share images (content-addressed by slug, never change).

### Create Response Header Transform Rule - NEW DASHBOARD

**Quick Link:** [Go to Rules Overview](https://dash.cloudflare.com/?to=/:account/:zone/rules/overview)

**Steps:**
1. Log in to Cloudflare Dashboard
2. Select your **scanminers.com** zone
3. Go to **Rules** (in left sidebar)
4. Click **Create rule** → **Response Header Transform Rule**
5. Enter **Rule name**: `OG Images Long Cache`
6. Under **When incoming requests match**:
   - Select **Custom filter expression**
   - Click **Edit expression**
   - Paste: `(http.request.uri.path wildcard "/images/og/*")`
7. Under **Modify response header**:
   - Select **Set static**
   - **Header name**: `Cache-Control`
   - **Value**: `public, max-age=31536000, immutable`
8. Click **Deploy**

**Alternative using Expression Builder:**
- **Field**: `URI Path`
- **Operator**: `wildcard match`  
- **Value**: `/images/og/*`

**Why this works:**
- OG images named by slug: `bauxite-mapping-advances.png`
- Content never changes (slug = immutable identifier)
- 1 year cache = fewer origin hits
- `immutable` = browsers never revalidate

**Verify After Deploy:**
```bash
curl -I https://scanminers.com/images/og/bauxite-mapping-advances.png | grep -i cache-control
# Expected: Cache-Control: public, max-age=31536000, immutable
```

**Reference:** 
- [Response Header Transform Rules](https://developers.cloudflare.com/rules/transform/response-header-modification/create-dashboard/)
- [Transform Rules Overview](https://developers.cloudflare.com/rules/transform/)

---

## 5️⃣ Sentry Error Tracking (Optional - 15 min)

### Goal
Capture Worker errors and performance traces.

### Install Sentry Cloudflare SDK

```bash
npm install @sentry/cloudflare --save
```

### Configure in Worker Entry Point

Create `instrumentation-worker.ts`:
```typescript
import * as Sentry from '@sentry/cloudflare';

export function instrument(env: Env) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || 'production',
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Cloudflare Workers specific
    integrations: [
      Sentry.cloudflareIntegration(),
    ],
  });
}
```

### Add to Worker Handler

Update `.open-next/worker.js` wrapper (if needed):
```typescript
import { instrument } from './instrumentation-worker';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    instrument(env);
    
    try {
      // Your OpenNext handler here
      return await openNextHandler(request, env, ctx);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }
};
```

### Add Sentry DSN to Environment

**Dashboard:** Workers & Pages → scanminers → Settings → Variables and secrets

```
Variable: SENTRY_DSN
Value: https://b53612d82fc99224ef09db277d60ad97@o4510172336291840.ingest.de.sentry.io/4510172344025168
```

**Reference:** [Sentry Cloudflare Frameworks](https://docs.sentry.io/platforms/javascript/guides/cloudflare/frameworks/)

**Note:** This is optional but highly recommended for production error tracking.

---

## 6️⃣ Merge PR #57 (LiDAR Redirect) (1 min)

### Current Status
- **PR #57:** Open
- **Title:** "fix: add redirect for LiDAR slug variant (tailings → tailing)"
- **Purpose:** Handle both plural and singular slug variants

### Merge Command

```bash
gh pr merge 57 --squash
```

### Verify Redirect After Merge

```bash
curl -I https://scanminers.com/insights/using-lidar-for-tailings-dam-monitoring
# Expected: HTTP/2 308 (Permanent Redirect)
# Location: https://scanminers.com/insights/using-lidar-for-tailing-dam-monitoring
```

**Why Important:** Fixes broken links where "tailings" (plural) was used instead of "tailing" (singular).

---

## 🎯 Phase Completion Definition

**Phase is COMPLETE when:**

✅ **1. Pages detached** - Custom domain only on Worker  
✅ **2. Logs tailing** - `wrangler tail scanminers --format=pretty` working  
✅ **3. WAF enabled** - OWASP rules + API rate limit configured  
✅ **4. OG cache rule** - Transform Rule set for `/images/og/*`  
✅ **5. PR #57 merged** - LiDAR redirect active  

**Optional (Nice-to-Have):**
- [ ] Logpush to Datasets/R2
- [ ] Sentry error tracking
- [ ] Staging Worker environment
- [ ] Terraform/IaC for config

---

## 📋 Quick Command Reference

### Daily Operations
```bash
# Live tail logs
wrangler tail scanminers --format=pretty

# Deploy changes
git push origin main  # Triggers Workers build automatically

# Check deployment status
gh run list --workflow=".github/workflows/ci.yml" --limit 3

# Test health check
curl -i https://scanminers.com/api/health
```

### Emergency Rollback
```bash
# List recent deployments
wrangler deployments list --name scanminers

# Rollback to previous version
wrangler rollback --name scanminers --deployment-id <DEPLOYMENT_ID>
```

### Monitoring
```bash
# Watch for errors
wrangler tail scanminers --status error --format=pretty

# Check cache hit rate
curl -I https://scanminers.com/images/og/bauxite-mapping-advances.png | grep cf-cache-status
```

---

## 📚 Key References

- [Custom Domains for Workers](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Wrangler Commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Cloudflare WAF](https://developers.cloudflare.com/waf/)
- [Transform Rules](https://developers.cloudflare.com/rules/transform/)
- [Sentry Cloudflare](https://docs.sentry.io/platforms/javascript/guides/cloudflare/frameworks/)
- [Workers Observability](https://developers.cloudflare.com/workers/observability/)
- [Cache-Control Best Practices](https://developers.cloudflare.com/cache/concepts/cache-control/)

---

## 🎊 What You've Accomplished

✅ **OpenNext Migration Complete** - From Cloudflare Pages to Workers  
✅ **All Routes Working** - API routes, pages, static assets  
✅ **Environment Configured** - 29 variables set correctly  
✅ **Production Verified** - 3 smoke tests passing  
✅ **CDN Caching Active** - Fast asset delivery  

**Next:** Complete the 6 items above to fully harden and optimize your production deployment! 🚀
