# OpenNext Cloudflare Workers Deployment Guide

## Quick Deploy Checklist (15 minutes)

### 1. Merge PR #58
- Review and merge the OpenNext migration PR
- Wait for CI to pass

### 2. Configure Cloudflare Workers Builds

Navigate to: **Cloudflare Dashboard → Workers & Pages → scanminers-website → Settings → Builds**

#### Build Settings
```
Build command: npx opennextjs-cloudflare build
Deploy command: npx opennextjs-cloudflare deploy
```

> **Note**: Use `npx opennextjs-cloudflare upload` if you want gradual rollouts with canary deployments.

#### Build Output Directory
```
.open-next
```

### 3. Environment Variables

Navigate to: **Workers & Pages → scanminers-website → Settings → Variables**

Add these for **both Production and Preview**:

| Variable Name | Value | Type |
|--------------|-------|------|
| `ENABLE_INITIATE_API` | `false` | Plain text |
| `NEXT_PUBLIC_GITHUB_REPO` | `scanminer/scanminers-website` | Plain text |
| `GH_TOKEN` | `(your token)` | Secret |
| `PERPLEXITY_API_KEY` | `(your key)` | Secret |
| `ANTHROPIC_API_KEY` | `(your key)` | Secret |

> **Important**: `NEXT_PUBLIC_*` vars are baked at build time. Other vars are runtime-accessible in Worker.

### 4. Domain Configuration

#### Option A: Custom Domains (Recommended)
Navigate to: **Workers → scanminers-website → Settings → Domains & Routes → Custom Domains**

1. If `scanminers.com` is still attached to Pages, remove it from Pages first
2. Click **Add Custom Domain**
3. Add `scanminers.com`
4. Add `www.scanminers.com` (if used)

#### Option B: Routes (Alternative)
Navigate to: **Workers → scanminers-website → Settings → Domains & Routes → Routes**

Add route:
```
scanminers.com/*
```

### 5. Deploy & Verify

#### Trigger First Deploy
Push to main branch or manually trigger build in Cloudflare dashboard.

#### Smoke Tests
Run these after deployment completes:

```bash
# API gate should return 403 (not 404)
curl -i -X POST https://scanminers.com/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test brief"}'
# Expected: HTTP/2 403 Forbidden

# Health check
curl -i https://scanminers.com/api/health
# Expected: HTTP/2 200 OK

# Ping check
curl -i https://scanminers.com/api/ping
# Expected: HTTP/2 200 OK with "pong"

# Static asset from ASSETS binding
curl -I https://scanminers.com/images/og/using-lidar-for-tailing-dam-monitoring.png
# Expected: HTTP/2 200 OK with fast response
```

### 6. Merge PR #57 (LiDAR Redirect)
After Worker is live and verified:
- Merge PR #57 (LiDAR redirect)
- Next.js redirects work automatically in Worker build
- Verify both slugs redirect correctly

---

## Configuration Details

### wrangler.toml (Already Configured)
```toml
name = "scanminers-website"
main = ".open-next/worker.js"
compatibility_date = "2025-09-23"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"
# run_worker_first = false (default - recommended for performance/cost)
```

**Why these settings?**
- `nodejs_compat` + recent `compatibility_date`: Enable Node.js APIs in Workers
- `[assets]` binding: OpenNext generates static assets here
- `run_worker_first=false`: Serves assets directly from CDN (cheaper, faster)

### open-next.config.ts (Default Config)
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare"

export default defineCloudflareConfig({
  // Default config auto-detects:
  // - API routes → Worker functions
  // - Pages → SSR/SSG in Worker
  // - Static assets → .open-next/assets
  // - Middleware → Worker edge functions
})
```

---

## Cutover Plan (Safe Migration)

### Before Cutover
1. ✅ Merge PR #58
2. ✅ Deploy Worker to Preview environment
3. ✅ Test with temporary `.workers.dev` URL
   ```bash
   curl -i https://scanminers-website.workers.dev/api/initiate
   ```

### During Cutover (5-10 minutes)
1. Remove `scanminers.com` from Cloudflare Pages custom domains
2. Add `scanminers.com` to Worker custom domains
3. DNS propagates instantly (same Cloudflare account)
4. Run smoke tests above

### After Cutover
1. Monitor logs in **Workers → Logs → Real-time logs**
2. Check error rate in **Analytics → Overview**
3. Verify all critical paths:
   - Homepage: https://scanminers.com
   - Insights: https://scanminers.com/insights
   - Admin: https://scanminers.com/admin
   - API routes: `/api/health`, `/api/ping`, `/api/initiate`

### Rollback Plan (if needed)
1. Remove Worker custom domains
2. Re-add domains to Cloudflare Pages
3. Takes ~30 seconds to propagate

---

## Local Development

### Continue using Next.js dev server:
```bash
npm run dev
```

### To test with Cloudflare bindings locally:
```typescript
// In your code (optional)
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

if (process.env.NODE_ENV === 'development') {
  await initOpenNextCloudflareForDev()
}
```

---

## Troubleshooting

### Build Fails
- Check `npx opennextjs-cloudflare build` runs locally
- Verify all dependencies installed: `npm ci`
- Check Node version: ≥18.17.0

### 404 on API Routes
- Verify Worker deployed successfully
- Check environment variables are set
- Ensure `compatibility_flags = ["nodejs_compat"]`
- Check logs in Workers dashboard

### Static Assets Not Loading
- Verify `[assets]` configuration in wrangler.toml
- Check `.open-next/assets/` directory exists after build
- Ensure `binding = "ASSETS"` is set

### Environment Variables Not Working
- `NEXT_PUBLIC_*` vars: Must be set at build time
- Runtime vars: Set in Workers dashboard, accessible via `process.env`
- Rebuild after changing `NEXT_PUBLIC_*` vars

---

## Resources

- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Node.js Compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [OpenNext Assets Configuration](https://opennext.js.org/cloudflare/howtos/assets)
- [OpenNext Environment Variables](https://opennext.js.org/cloudflare/howtos/env-vars)
- [Cloudflare Workers Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)

---

## Success Criteria

✅ All API routes return proper responses (not 404)  
✅ Static assets load quickly from ASSETS binding  
✅ Environment variables accessible in runtime  
✅ Next.js redirects working (PR #57)  
✅ Admin pages functional  
✅ No increase in error rate  
✅ Response times comparable or better than Pages
