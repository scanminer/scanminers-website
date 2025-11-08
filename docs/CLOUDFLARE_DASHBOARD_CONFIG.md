# Cloudflare Workers Build Configuration

## 📍 Location
Cloudflare Dashboard → Workers & Pages → **scanminers-website** → Settings → **Builds**

---

## ⚙️ Build Settings

| Setting | Value |
|---------|-------|
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx opennextjs-cloudflare deploy` |
| **Build output directory** | `.open-next` |
| **Root directory** | `.` (project root) |

---

## 🔐 Environment Variables

Navigate to: Workers & Pages → **scanminers-website** → Settings → **Variables**

### Add for Both Production AND Preview:

| Variable Name | Value | Type |
|--------------|-------|------|
| `ENABLE_INITIATE_API` | `false` | Plain text |
| `NEXT_PUBLIC_GITHUB_REPO` | `scanminer/scanminers-website` | Plain text |

### Existing Secrets (copy from Pages if needed):

| Variable Name | Type |
|--------------|------|
| `GH_TOKEN` | Secret |
| `PERPLEXITY_API_KEY` | Secret |
| `ANTHROPIC_API_KEY` | Secret |

> **Note**: `NEXT_PUBLIC_*` vars are embedded at build time. Other vars are runtime-accessible in Worker.

---

## 🌐 Domain Configuration

Navigate to: Workers → **scanminers-website** → Settings → **Domains & Routes**

### Before Cutover:
1. Test on default subdomain: `scanminers-website.{your-account}.workers.dev`
2. Run smoke tests on workers.dev URL

### During Cutover:
1. Remove `scanminers.com` from Cloudflare Pages custom domains
2. Add **Custom Domain** in Workers:
   - `scanminers.com`
   - `www.scanminers.com` (if used)
3. DNS propagates instantly (same Cloudflare account)

---

## ✅ Verification Commands

After first deploy to workers.dev:

```bash
# Replace {subdomain} with your actual workers.dev subdomain
WORKER_URL="https://scanminers-website.{your-account}.workers.dev"

# API gate: Should return 403 (not 404)
curl -i -X POST $WORKER_URL/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test"}'

# Health check: Should return 200
curl -i $WORKER_URL/api/health

# Static asset: Should return 200 from ASSETS binding
curl -I $WORKER_URL/images/og/using-lidar-for-tailing-dam-monitoring.png
```

After domain cutover to production:

```bash
# API gate: 403
curl -i -X POST https://scanminers.com/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test"}'

# Health check: 200
curl -i https://scanminers.com/api/health

# Static asset: 200
curl -I https://scanminers.com/images/og/using-lidar-for-tailing-dam-monitoring.png
```

---

## 🚨 Expected Behavior

### ✅ Success Indicators:
- Build completes in ~2-3 minutes
- Worker deploys successfully
- `/api/initiate` returns **403** with gate message (not 404)
- `/api/health` returns **200**
- Static assets load quickly from ASSETS binding
- No increase in error rate

### ⚠️ Common Issues:

**Build fails**: Check `npx opennextjs-cloudflare build` runs locally

**404 on API routes**: Verify `compatibility_flags = ["nodejs_compat"]` in wrangler.toml

**Env vars not working**: 
- `NEXT_PUBLIC_*` must be set in build environment
- Runtime vars set in Workers dashboard

**Static assets slow**: Verify `[assets]` configuration in wrangler.toml

---

## 📚 Resources

- [OpenNext CLI Documentation](https://opennext.js.org/cloudflare/cli)
- [Cloudflare Workers Next.js Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Node.js Compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [OpenNext Assets Configuration](https://opennext.js.org/cloudflare/howtos/assets)

---

## 🔄 Rollback Plan

If issues arise:
1. Keep Pages configuration until Worker is verified
2. Test Worker on `*.workers.dev` subdomain first
3. If needed, reattach domain to Pages temporarily
4. Fix Worker configuration and redeploy
5. OpenNext changes are build-time only, so rollback is fast
