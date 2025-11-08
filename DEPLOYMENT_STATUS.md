# OpenNext Workers Deployment - Ready for Dashboard Configuration

**Date**: November 8, 2025  
**Status**: ⏳ Awaiting Cloudflare Workers Builds configuration

## ✅ Completed

1. **PR #58 Merged** (commit: 202100f)
   - OpenNext configuration added
   - `wrangler.toml` configured with `[assets]` binding
   - All API routes updated (removed edge runtime exports)
   - Documentation complete

2. **PR #59 Merged** (commit: fbb1194)
   - Deployment helper documents
   - Dashboard configuration guides
   - Critical alerts and instructions

**All code changes complete! 🎉**

## 🔄 Next: Configure Cloudflare Dashboard

### Step 1: Workers Builds Settings

Navigate to: **Cloudflare Dashboard → Workers & Pages → scanminers-website → Settings → Builds**

Set:
```
Build command:  npx opennextjs-cloudflare build
Deploy command: npx opennextjs-cloudflare deploy
```

### Step 2: Build-Time Variables

Navigate to: **Workers & Pages → scanminers-website → Settings → Build → Build Variables**

Add:
```
NEXT_PUBLIC_GITHUB_REPO = scanminer/scanminers-website
```

### Step 3: Runtime Variables

Navigate to: **Workers & Pages → scanminers-website → Settings → Variables and Secrets**

Add:
- `ENABLE_INITIATE_API = false` (Variable)
- `GH_TOKEN` (Secret)
- `PERPLEXITY_API_KEY` (Secret)
- `ANTHROPIC_API_KEY` (Secret)

## 📋 Remaining Steps

1. ✅ Merge PR #58 → **DONE**
2. ✅ Merge PR #59 → **DONE**
3. ⏳ Configure Workers Builds → **IN PROGRESS**
4. ⏹️ Set build-time variables
5. ⏹️ Set runtime variables
6. ⏹️ Test on *.workers.dev subdomain
7. ⏹️ Cutover domain (Pages → Worker)
8. ⏹️ Verify production
9. ⏹️ Merge PR #57 (LiDAR redirect)

## 🎯 Success Criteria

When deployment is complete, these should all return proper responses:

```bash
# API gate: 403 (not 404)
curl -i -X POST https://scanminers.com/api/initiate \
  -H 'content-type: application/json' \
  -d '{"title":"Test"}'

# Health check: 200
curl -i https://scanminers.com/api/health

# Static assets: 200 (fast from ASSETS binding)
curl -I https://scanminers.com/images/og/using-lidar-for-tailing-dam-monitoring.png
```

## 📚 Reference

- **Deployment Guide**: `docs/OPENNEXT_DEPLOYMENT.md`
- **Root Cause Analysis**: `docs/CLOUDFLARE_DEPLOYMENT_FIX.md`
- **Wrangler Config**: `wrangler.toml` (already configured)
- **OpenNext Config**: `open-next.config.ts` (default settings)

## 🔗 Links

- [OpenNext Cloudflare CLI](https://opennext.js.org/cloudflare/cli)
- [Cloudflare Workers Next.js Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Node.js Compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)

---

**Note**: Cloudflare Pages check will fail on future PRs until we update CI. This is expected - we're now using Workers, not Pages.
