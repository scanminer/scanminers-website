# Cloudflare Pages Deployment Fix

## Issue: Edge Runtime API Routes Return 404 in Production

**Current Status:** Edge Runtime API routes (e.g., `/api/initiate`, `/api/admin/*`) return 404 in production even though they work locally.

**Root Cause:** Cloudflare Pages is using the standard `next build` command instead of `@cloudflare/next-on-pages`, which is required to properly package Edge Runtime routes as Cloudflare Workers Functions.

---

## Fix: Update Cloudflare Pages Build Configuration

### 1. Update Build Command in Cloudflare Pages

Go to: **Cloudflare Dashboard → Pages → scanminers-website → Settings → Builds & deployments**

Change the build command from:
```bash
npm run build
```

To:
```bash
npm run build && npx @cloudflare/next-on-pages
```

**OR** update the `package.json` build script to automatically include the Cloudflare adapter:
```json
"build": "npm run contentlayer && next build && npx @cloudflare/next-on-pages && node scripts/generate-feeds.mjs && npx pagefind --site .next/server/app --output-subdir ../../public/pagefind",
```

### 2. Verify Build Output Directory

Ensure the build output directory is set to: `.vercel/output/static`

This is the output directory created by `@cloudflare/next-on-pages`.

### 3. Set Required Environment Variables

Go to: **Cloudflare Pages → Settings → Environment variables**

Add these variables for **both Production and Preview environments**:

#### Required for Admin UI Fallback:
```env
NEXT_PUBLIC_GITHUB_REPO=scanminer/scanminers-website
```

#### Required for Initiate API Gate:
```env
ENABLE_INITIATE_API=false
```
> **Important:** Keep this `false` in production to prevent unauthorized draft creation.

#### Existing Required Variables (should already be set):
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<your-turnstile-site-key>
TURNSTILE_SECRET_KEY=<your-turnstile-secret-key>
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM=contact@scanminers.com
RESEND_TO=founders@scanminers.com
NEXT_PUBLIC_SITE_URL=https://scanminers.com
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_DSN=<your-sentry-dsn>
```

#### Optional Admin/Automation Variables:
```env
GH_REPO=scanminer/scanminers-website
CONTENT_REPO=scanminer/scanminers-website
PERPLEXITY_KEY=<if-using-draft-generation>
PERPLEXITY_MODEL=<if-using-draft-generation>
CONTENT_BOT_TOKEN=<github-token-for-automation>
ADMIN_ACTION_TOKEN=<token-for-admin-actions>
WORKFLOW_DISPATCH_TOKEN=<token-for-workflow-triggers>
ADMIN_ALLOWED_EMAILS=you@scanminers.com
ADMIN_ALLOWED_EMAIL_DOMAINS=scanminers.com
ADMIN_ALLOWED_GITHUB_LOGINS=scanminers-founder
NEXTAUTH_SECRET=<openssl-rand-base64-32>
ADMIN_PASS=<optional-legacy-password>
```

---

## 4. Redeploy

After updating the build command and environment variables:

1. Go to **Deployments** tab
2. Click the **⋮** menu on the latest deployment
3. Select **Retry deployment** OR
4. Push a new commit to trigger a fresh build

---

## 5. Verify the Fix

### Test the Initiate API Gate (expect 403):
```bash
curl -i -X POST https://scanminers.com/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test brief"}'
```

**Expected Response:**
```
HTTP/2 403
content-type: application/json

{"error":"Initiate API is disabled in this environment."}
```

If you still get a **404**, check:
1. Cloudflare Pages build logs for errors
2. Functions tab in the deployment details to see if `/api/initiate` is listed
3. `wrangler.toml` compatibility flags are being picked up

### Test Admin Pages:
```bash
# Should redirect to /admin/index.html
curl -I https://scanminers.com/admin

# Should show environment variable status
curl -I https://scanminers.com/admin/system
```

### Test Other Admin API Routes:
```bash
# These should require authentication
curl -i https://scanminers.com/api/admin/list-content
curl -i https://scanminers.com/api/admin/approve-publish
```

---

## Understanding Next-on-Pages

`@cloudflare/next-on-pages` is a build adapter that:
1. Analyzes your Next.js build output
2. Converts Edge Runtime routes to Cloudflare Workers Functions
3. Generates a `_worker.js` file that handles routing
4. Outputs to `.vercel/output/static` (compatible with Cloudflare Pages)

Without this adapter, Edge Runtime routes are bundled but not properly exposed as Functions, causing 404s in production.

**Key Files:**
- `wrangler.toml`: Sets compatibility flags for the Worker runtime
- `next.config.ts`: Configuration for Next.js
- `.vercel/output/static`: Build output directory after running next-on-pages

---

## Debugging Cloudflare Pages Deployments

### View Build Logs:
1. Go to **Deployments** tab
2. Click on a deployment
3. View the **Build log** to see if `@cloudflare/next-on-pages` ran successfully

### View Functions:
1. In a deployment details page
2. Click **Functions** tab
3. You should see entries for:
   - `/api/initiate`
   - `/api/admin/approve-publish`
   - `/api/admin/generate-draft`
   - etc.

### Check Environment Variables at Build Time:
- `NEXT_PUBLIC_*` vars are baked into the client bundle **at build time**
- If you change them, you **must trigger a rebuild**
- Other env vars are read at runtime by Functions

### Common Issues:
1. **404 on API routes**: Next-on-Pages not running in build
2. **Environment variables not found**: Not set in Cloudflare Pages settings or wrong environment (Production vs Preview)
3. **Compatibility errors**: Missing `nodejs_compat` flag in `wrangler.toml`
4. **Build failures**: Check Node version (must be 20.x), peer dependency issues

---

## Additional Resources

- [Cloudflare Next-on-Pages](https://github.com/cloudflare/next-on-pages)
- [Cloudflare Pages Build Configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Next.js Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables)
- [Cloudflare Workers Functions](https://developers.cloudflare.com/pages/functions/)

---

## Rollback Plan

If the deployment breaks after these changes:

1. Go to **Deployments** → Select a previous working deployment
2. Click **⋮** → **Rollback to this deployment**
3. Or revert the build command change in Settings

The previous static-only deployment will continue to work for pages, but Edge Runtime API routes will remain 404.
