# OpenNext Workers Deployment - In Progress

**Date**: November 8, 2025  
**Status**: ⏳ Awaiting Cloudflare configuration

## ✅ Completed

1. **PR #58 Merged** (commit: 202100f)
   - OpenNext configuration added
   - `wrangler.toml` configured with `[assets]` binding
   - All API routes updated (removed edge runtime exports)
   - Documentation complete

## 🔄 In Progress

### Next: Configure Cloudflare Workers Builds

Navigate to: **Cloudflare Dashboard → Workers & Pages → scanminers-website → Settings → Builds**

**Set these values:**
```
Build command: npx opennextjs-cloudflare build
Deploy command: npx opennextjs-cloudflare deploy
```

## 📋 Remaining Steps

1. ✅ Merge PR #58 → **DONE**
2. ⏳ Configure Workers Builds → **IN PROGRESS**
3. ⏹️ Set environment variables
4. ⏹️ Test on *.workers.dev subdomain
5. ⏹️ Cutover domain (Pages → Worker)
6. ⏹️ Run smoke tests
7. ⏹️ Merge PR #57 (LiDAR redirect)

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
