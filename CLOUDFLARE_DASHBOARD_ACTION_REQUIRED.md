# 🚨 CRITICAL: Cloudflare Dashboard Configuration Required

## ⚠️ Current Issue

**Cloudflare Pages is still using the old build command**, which causes builds to fail:

```
Executing user command: npx @cloudflare/next-on-pages@1
ERROR: The following routes were not configured to run with the Edge Runtime
```

This is **expected** - we've migrated to OpenNext Workers, but the Cloudflare dashboard hasn't been updated yet.

---

## ✅ Solution: Update Cloudflare Dashboard

### Option A: Switch to Workers (Recommended)

**This is what we need to do:**

1. **Go to Cloudflare Dashboard**
2. **Navigate to:** Workers & Pages → **scanminers-website**
3. **Create a NEW Worker deployment** (not Pages)
4. **In Settings → Builds, set:**
   ```
   Build command:  npx opennextjs-cloudflare build
   Deploy command: npx opennextjs-cloudflare deploy
   ```
5. **Set environment variables** in Workers → Settings → Variables
6. **Deploy and test** on `*.workers.dev` subdomain first
7. **Cutover domain** from Pages to Worker when verified

### Option B: Temporarily Disable Pages Builds

Until we configure Workers, we can disable automatic Pages builds:

1. Go to: Workers & Pages → **scanminers-website** (Pages)
2. Settings → Builds → **Pause builds**
3. This stops the failing Pages builds
4. CI will still fail on Pages check (expected)

---

## 📋 Step-by-Step: Configure OpenNext Workers

### Step 1: Create Worker Project

1. **Cloudflare Dashboard** → Workers & Pages → **Create**
2. Choose **"Create Worker"**
3. Name: `scanminers-website` (or `scanminers-website-worker` if name taken)

### Step 2: Connect to GitHub

1. In Worker settings → **Git Integration**
2. Connect to: `scanminer/scanminers-website`
3. Branch: `main`
4. Set build settings:
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy`
   - **Build output directory:** `.open-next`
   - **Root directory:** `.` (project root)

### Step 3: Environment Variables

Navigate to: Worker → Settings → **Variables**

Add for **Production and Preview**:

| Variable | Value | Type |
|----------|-------|------|
| `ENABLE_INITIATE_API` | `false` | Plain text |
| `NEXT_PUBLIC_GITHUB_REPO` | `scanminer/scanminers-website` | Plain text |
| `GH_TOKEN` | (your token) | Secret |
| `PERPLEXITY_API_KEY` | (your key) | Secret |
| `ANTHROPIC_API_KEY` | (your key) | Secret |

### Step 4: Test on Workers.dev

1. Trigger a build (push to main or manual)
2. Note the `*.workers.dev` subdomain assigned
3. Run smoke tests:

```bash
WORKER_URL="https://scanminers-website.YOUR-ACCOUNT.workers.dev"

# API gate: Should return 403 (not 404!)
curl -i -X POST $WORKER_URL/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test"}'

# Health check: Should return 200
curl -i $WORKER_URL/api/health

# Static asset: Should return 200
curl -I $WORKER_URL/images/og/using-lidar-for-tailing-dam-monitoring.png
```

### Step 5: Cutover Domain

When tests pass:

1. **Remove domain from Pages:**
   - Workers & Pages → scanminers-website (Pages)
   - Settings → Custom domains
   - Remove `scanminers.com`

2. **Add domain to Worker:**
   - Workers & Pages → scanminers-website (Worker)
   - Settings → Domains & Routes → Custom Domains
   - Add `scanminers.com`
   - Add `www.scanminers.com` (if used)

3. **Verify production:**
   ```bash
   curl -i -X POST https://scanminers.com/api/initiate \
     -H 'content-type: application/json' \
     -d '{"title":"Test"}'
   # Expected: HTTP/2 403
   ```

---

## 🔍 Why This Happens

1. **Code is correct** ✅
   - `wrangler.toml` configured for Workers
   - `open-next.config.ts` added
   - Edge runtime exports removed
   - All merged to main in PR #58

2. **Dashboard not updated** ❌
   - Pages still using old build command
   - Needs manual reconfiguration
   - Can't be done via code/wrangler.toml

---

## 📚 Current State

| Component | Status | Action |
|-----------|--------|--------|
| **Code** | ✅ Ready | Merged in PR #58 |
| **wrangler.toml** | ✅ Configured | Workers config with [assets] |
| **open-next.config.ts** | ✅ Present | Default settings |
| **Cloudflare Pages** | ❌ Wrong config | Using old `next-on-pages` |
| **Cloudflare Workers** | ⏳ Not configured | Needs dashboard setup |

---

## 🎯 Next Actions

**Immediate (to stop failing builds):**
1. Pause Pages builds in dashboard
2. Or ignore Pages build failures (they're expected)

**To complete migration:**
1. Configure OpenNext Workers in dashboard (steps above)
2. Test on `*.workers.dev` subdomain
3. Cutover domain when verified
4. Merge PR #57 (LiDAR redirect)
5. Update CI to remove Pages check

---

## 📞 Need Help?

Reference documents:
- `docs/OPENNEXT_DEPLOYMENT.md` - Full deployment guide
- `docs/CLOUDFLARE_DASHBOARD_CONFIG.md` - Dashboard configuration
- `docs/CLOUDFLARE_DEPLOYMENT_FIX.md` - Root cause analysis

The code is ready! Just need dashboard configuration. 🚀
