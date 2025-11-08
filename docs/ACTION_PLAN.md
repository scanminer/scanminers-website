# Action Plan: Complete Admin Fallback Rollout

**Status:** Admin fallback PR #56 merged ✅ | LiDAR redirect PR #57 created ⏳

---

## ✅ Completed

1. **Admin Fallback PR (#56)** - Merged to main
   - Added `NEXT_PUBLIC_GITHUB_REPO` fallback in `app/admin/page.tsx`
   - Added environment variable display in `app/admin/system/page.tsx`
   - All CI checks passed

2. **LiDAR Redirect PR (#57)** - Created, waiting for CI
   - Redirects `/insights/using-lidar-for-tailings-dam-monitoring` → `/insights/using-lidar-for-tailing-dam-monitoring`
   - Prevents 404s on plural variant

3. **Branch Protection** - Already active
   - PRs required for main branch
   - Status checks enforced (qa, lint, test, test:e2e, build, content:check)

---

## 🚨 Critical: Fix Cloudflare Pages Deployment

**Problem:** All Edge Runtime API routes return 404 in production (e.g., `/api/initiate`, `/api/admin/*`)

**Root Cause:** Cloudflare Pages is not using the Next-on-Pages adapter to package Edge Runtime routes as Workers Functions.

### Action Steps:

1. **Update Build Command in Cloudflare Pages**
   
   Location: `Cloudflare Dashboard → Pages → scanminers-website → Settings → Builds & deployments`
   
   **Current command:**
   ```bash
   npm run build
   ```
   
   **Change to:**
   ```bash
   npm run build && npx @cloudflare/next-on-pages
   ```

2. **Verify Build Output Directory**
   
   Should be: `.vercel/output/static`

3. **Set Environment Variables**
   
   Location: `Cloudflare Pages → Settings → Environment variables`
   
   **Add to Production AND Preview:**
   ```env
   NEXT_PUBLIC_GITHUB_REPO=scanminer/scanminers-website
   ENABLE_INITIATE_API=false
   ```

4. **Trigger Redeploy**
   
   Go to Deployments → Click ⋮ on latest → "Retry deployment"

5. **Verify Fix**
   
   ```bash
   # Should return 403 (not 404)
   curl -i -X POST https://scanminers.com/api/initiate \
     -H 'content-type: application/json' \
     -d '{"title":"Test brief"}'
   ```
   
   **Expected:**
   ```
   HTTP/2 403
   content-type: application/json
   
   {"error":"Initiate API is disabled in this environment."}
   ```

**Full Documentation:** See `docs/CLOUDFLARE_DEPLOYMENT_FIX.md`

---

## 📋 Remaining Tasks

### High Priority

- [ ] **Update Cloudflare Pages build command** (see above)
- [ ] **Add environment variables** to Cloudflare Pages
- [ ] **Redeploy and verify** with curl test
- [ ] **Merge PR #57** (LiDAR redirect) once CI passes

### Nice to Have

- [ ] **Test admin pages in production** after deployment fix:
  ```bash
  # Basic auth required
  curl -u user:pass https://scanminers.com/admin/system
  ```

- [ ] **Update `.env.example`** to document new variables:
  ```env
  # Admin UI fallback (required in prod if GH_REPO not set)
  NEXT_PUBLIC_GITHUB_REPO=scanminer/scanminers-website
  
  # Initiate API gate (set to false in production)
  ENABLE_INITIATE_API=false
  ```

- [ ] **Add deployment verification to CI** (optional):
  Create a smoke test that runs after Cloudflare deployment to verify API routes are responding correctly.

---

## 🔍 Troubleshooting

### If API routes still 404 after fix:

1. **Check Build Logs**
   - Go to Deployments → Click deployment → View build log
   - Search for `@cloudflare/next-on-pages` output
   - Verify it completed successfully

2. **Check Functions Tab**
   - In deployment details → Functions tab
   - Should list: `/api/initiate`, `/api/admin/approve-publish`, etc.
   - If missing, the adapter didn't run or failed

3. **Check Environment Variables**
   - Verify they're set in the correct environment (Production vs Preview)
   - Remember: `NEXT_PUBLIC_*` vars are baked in at build time
   - Changing them requires a rebuild

4. **Check wrangler.toml**
   - Ensure `nodejs_compat` flag is present
   - Should already be configured correctly

### Common Cloudflare Pages Issues:

- **Build timeout**: Next-on-Pages can take longer; increase timeout in settings
- **Node version**: Must use Node 20.x (check in build settings)
- **Peer dependencies**: Should be handled by `.npmrc` and preinstall script
- **Missing bindings**: Environment variables not set correctly

---

## 📊 Testing Checklist (Post-Deployment)

After fixing the Cloudflare deployment:

- [ ] `/api/initiate` returns 403 (not 404)
- [ ] `/admin` redirects to `/admin/index.html`
- [ ] `/admin/system` shows environment variables status
- [ ] `/api/admin/*` routes require authentication (not 404)
- [ ] `/insights/using-lidar-for-tailings-dam-monitoring` redirects to canonical URL
- [ ] Build logs show `@cloudflare/next-on-pages` ran successfully
- [ ] Functions tab shows Edge Runtime routes

---

## 📚 References

- [Cloudflare Next-on-Pages Docs](https://github.com/cloudflare/next-on-pages)
- [Next.js Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables)
- [Cloudflare Pages Build Configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Workers Functions](https://developers.cloudflare.com/pages/functions/)

---

## 💡 Next Steps After Deployment Works

1. **Document the deployment process** in README.md
2. **Add monitoring** for API route availability (optional)
3. **Set up Sentry for Edge Runtime** once Cloudflare compatibility improves
4. **Consider adding rate limiting** to public API endpoints
5. **Test draft generation workflow** end-to-end with actual Perplexity API

---

**Last Updated:** 2025-11-07  
**Status:** Waiting for Cloudflare Pages configuration update
