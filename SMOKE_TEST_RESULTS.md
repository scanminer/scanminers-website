# Smoke Test Results - Post PR #60 Merge

**Date:** November 8, 2025  
**PR #60:** ✅ Merged successfully  
**Branch:** main (commit 950257e)

---

## 🧪 Smoke Test Results

### Test 1: Health Check ❓ UNEXPECTED
```bash
curl -i https://scanminers.com/api/health
```

**Expected:** `200 OK` with health response  
**Actual:** `200 OK` but response body = `"Hello world"`

### Test 2: Gated API Endpoint ❌ INCORRECT
```bash
curl -i -X POST https://scanminers.com/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test"}'
```

**Expected:** `403 Forbidden` (API gate enabled)  
**Actual:** `200 OK` with `"Hello world"`

### Test 3: Homepage ✅ SUCCESS
```bash
curl -s https://scanminers.com/ | head -100
```

**Expected:** Full Next.js app HTML  
**Actual:** ✅ **Complete Next.js app loads correctly!**
- HTML with React hydration scripts
- Cloudflare Analytics beacon present
- All content rendering properly
- Navigation, styles, metadata all correct

---

## 🔍 Analysis

### What's Working ✅
- ✅ Worker is deployed and active
- ✅ Static pages rendering correctly
- ✅ Homepage serving full Next.js app
- ✅ Cloudflare CDN working (cf-ray headers present)
- ✅ Domain routing to Worker (not 404ing)

### What's Not Working ❌
- ❌ API routes returning "Hello world" instead of route logic
- ❌ `/api/health` should return health response
- ❌ `/api/initiate` should return 403 (gated) not 200
- ❌ Static assets under `/images/og/` returning "Hello world"

---

## 🎯 Root Cause Hypothesis

The "Hello world" response suggests one of these scenarios:

### Scenario A: Fallback Route Catching Everything
OpenNext may have a catch-all route that's intercepting `/api/*` requests before they reach the proper handlers. Check:
- `app/api/[[...catchall]]/route.ts` or similar
- Middleware that might be catching and responding early

### Scenario B: Worker Not Using OpenNext Bundle
The Cloudflare Worker might be using an old build or different entry point:
- Check Workers dashboard: Is it using `.open-next/worker.js` as `main`?
- Check latest deployment logs for OpenNext banner
- Verify `wrangler.toml` configuration deployed correctly

### Scenario C: Build Issue
The OpenNext build might have succeeded but not packaged API routes correctly:
- API routes may not be detected by OpenNext
- Missing `nodejs_compat` at runtime
- Wrong build output being deployed

---

## 🚀 Recommended Next Steps

### 1. Check Latest Worker Deployment
In Cloudflare Dashboard: **Workers & Pages → scanminers → Deployments**

Look for:
- Latest deployment timestamp (should be within last ~5 minutes)
- Build logs showing OpenNext banner: `"┌─────────────────────────────┐\n│ OpenNext — Cloudflare build │"`
- Success message: `"server function: default..."`
- Entry point: `.open-next/worker.js`

### 2. Verify wrangler.toml Deployed
Check the deployed Worker config matches:
```toml
name = "scanminers"
main = ".open-next/worker.js"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"
```

### 3. Check for Catch-All Routes
Search codebase for:
```bash
# Look for catch-all API routes
grep -r "\\[\\[\\.\\.\\..*\\]\\]" app/api/

# Look for middleware that might intercept
cat middleware.ts
```

### 4. Review Build Logs
Get the full Workers build log (not just CI status):
```bash
# In Cloudflare Dashboard
Workers & Pages → scanminers → Builds → Latest build → View logs
```

Look for:
- ✅ "Bundling server function: default..."
- ✅ "Bundling static assets..."
- ✅ "Bundling cache assets..."
- ❌ Any warnings about missing routes
- ❌ Any errors about edge runtime (should be none after PR #60)

### 5. Test Workers.dev Subdomain
Try hitting the workers.dev subdomain directly to bypass custom domain routing:
```bash
curl -i https://scanminers.{account}.workers.dev/api/health
```

If this works but scanminers.com doesn't, it's a domain routing issue.

---

## 📋 Quick Checklist

Before re-running smoke tests:

- [ ] Verify latest Workers deployment is live (check timestamp)
- [ ] Confirm OpenNext build succeeded in logs
- [ ] Check no catch-all routes in `app/api/`
- [ ] Verify `wrangler.toml` with `main = ".open-next/worker.js"` deployed
- [ ] Confirm 29 environment variables still set
- [ ] Test workers.dev subdomain (bypass custom domain)

---

## 🎯 What to Send Me

For fastest diagnosis, please provide:

1. **Last 50 lines of latest Workers Build log** from Cloudflare Dashboard
2. **Output of:** `curl -v https://scanminers.com/api/health 2>&1 | head -40`
3. **Any catch-all routes found:** Result of `grep -r "\\[\\[\\.\\.\\..*\\]\\]" app/api/`

This will tell us exactly what's deployed and why API routes aren't working.

---

**Status:** 🟡 Partial Success - Pages work, API routes need investigation
