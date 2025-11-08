# 🎯 Final Cutover Checklist - Workers Deployment

**Status**: Ready to complete (env vars + domain already configured!)

---

## ✅ Already Done

- ✅ Environment variables configured
- ✅ Custom domain attached to Worker
- ✅ Code merged (PRs #58, #59)
- ✅ `wrangler.toml` configured
- ✅ `open-next.config.ts` ready

---

## 🔧 Final Steps (Do Now)

### 1. Update Workers Builds Commands ⚡

**Location:** Workers & Pages → scanminers-website → Settings → **Builds**

**Current (wrong):** `npx @cloudflare/next-on-pages@1`  
**Change to:**
```
Build command:  npx opennextjs-cloudflare build
Deploy command: npx opennextjs-cloudflare deploy
```

**Why:** This uses the official OpenNext adapter for full-stack Next.js on Workers.

---

### 2. Trigger Deploy 🚀

1. Save the build command changes
2. Click **"Retry deployment"** or push to main
3. Watch build logs for:
   - ✅ `npx opennextjs-cloudflare build` running
   - ✅ `.open-next/worker.js` generated
   - ✅ `[assets]` binding connected
   - ✅ Worker deployed successfully

**Expected build time:** ~2-3 minutes

---

### 3. Smoke Test Production 🧪

Run these commands immediately after deploy:

#### Test 1: API Gate (most important!)
```bash
curl -i -X POST https://scanminers.com/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Tripwire brief"}'
```
**Expected:**
```
HTTP/2 403
content-type: application/json

{"error":"Initiate API is disabled in this environment."}
```

**If you get 404:** Worker not routing correctly  
**If you get 500:** Check Worker logs for errors  
**If you get 403:** ✅ SUCCESS! Gate is working!

---

#### Test 2: Health Check
```bash
curl -i https://scanminers.com/api/health
```
**Expected:**
```
HTTP/2 200
content-type: application/json

{"status":"ok"}
```

---

#### Test 3: Static Assets (ASSETS binding)
```bash
curl -I https://scanminers.com/images/og/using-lidar-for-tailing-dam-monitoring.png
```
**Expected:**
```
HTTP/2 200
content-type: image/png
cf-cache-status: HIT (or MISS first time)
```

---

### 4. Verify Pages Detached 📌

**Check:** Workers & Pages → scanminers-website (Pages) → Settings → Custom Domains

**Should be:** Empty or different domain  
**If still attached:** Remove `scanminers.com` from Pages to avoid split origin

Your Worker should be the **only** binding for scanminers.com.

---

### 5. Merge LiDAR Redirect PR (#57) 🔀

After smoke tests pass:

```bash
gh pr merge 57 --squash
```

OpenNext preserves Next.js redirects. Verify:
```bash
curl -I https://scanminers.com/insights/using-lidar-for-tailings-dam-monitoring
```
**Expected:** HTTP/2 301 or 308 with `Location:` header to canonical slug

---

## 🎯 Success Criteria

All of these should be true:

- ✅ `POST /api/initiate` → **403** (gate respected)
- ✅ `GET /api/health` → **200**
- ✅ Static assets → **200** from ASSETS binding
- ✅ Domain points only to Worker (Pages detached)
- ✅ Build uses OpenNext commands
- ✅ LiDAR redirect working (PR #57 merged)

---

## 🛡️ Hardening (Optional but Recommended)

### Update CI Status Checks

**Remove:** Cloudflare Pages check (legacy)  
**Keep:** Build, Lint, Test, E2E, Content QA, qa

**How:** Repository Settings → Branches → main → Edit branch protection rule

### Monitor Worker Logs

```bash
# Real-time logs
wrangler tail scanminers-website

# Or in dashboard
Workers → scanminers-website → Logs → Real-time logs
```

### Sentry Integration (if used)

Add Sentry DSN as **Secret** (not Build variable):
```
Workers → Settings → Variables and Secrets → Add Secret
Name: SENTRY_DSN
Value: https://...
```

### Preview URLs for PRs

Workers automatically generates preview URLs for each deployment. Use these to test PRs before merging.

---

## 🚨 Troubleshooting

### Issue: Still getting 404 on API routes

**Check:**
1. Build command updated to OpenNext?
2. Deployment succeeded without errors?
3. Worker logs showing requests?

**Fix:** Re-deploy with correct build command

### Issue: 500 errors

**Check Worker logs:**
```bash
wrangler tail scanminers-website
```
Look for Node.js compatibility issues or missing env vars.

### Issue: Static assets slow

**Check:**
- `[assets]` binding in wrangler.toml
- `run_worker_first = false` (default, recommended)
- CDN cache headers

---

## 📊 Post-Deployment Verification

After completing steps 1-5, paste these results here:

```bash
# 1. API gate response
curl -i -X POST https://scanminers.com/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test"}'

# 2. Health check
curl -i https://scanminers.com/api/health

# 3. Static asset headers
curl -I https://scanminers.com/images/og/using-lidar-for-tailing-dam-monitoring.png
```

**I'll verify the headers/body to confirm everything's wired correctly!**

---

## 🎉 You're 90% There!

Only need to:
1. Change build command in dashboard (2 minutes)
2. Deploy (3 minutes)
3. Run smoke tests (1 minute)
4. Merge PR #57 (1 minute)

**Total time: ~7 minutes to completion!** 🚀
