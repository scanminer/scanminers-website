# Cloudflare Pages Build Failure - Expected

## Why This Happens

This branch (`feat/migrate-to-opennext-workers`) is migrating from **Cloudflare Pages** to **Cloudflare Workers** using OpenNext.

The Cloudflare Pages build fails because:
1. We removed `export const runtime = 'edge'` from API routes
2. Pages is still trying to use `@cloudflare/next-on-pages` adapter
3. `@cloudflare/next-on-pages` requires edge runtime declarations

## This Is Expected Behavior

✅ **This failure is intentional and correct** for this migration branch.

The routes listed in the error are exactly the ones we updated:
- All `/api/*` routes
- `/admin/initiate` page

After merging to `main`, we will:
1. Switch from Pages to Workers in Cloudflare dashboard
2. Use `opennextjs-cloudflare` build command
3. Deploy as a Worker (not Pages)

## CI Status

- ❌ **Cloudflare Pages**: Expected to fail (using wrong adapter)
- ✅ **All other checks**: Should pass (build, lint, test, typecheck, QA)

## Next Steps

Once all non-Pages CI checks pass:
1. Merge PR #58 to main
2. Configure Workers build in Cloudflare dashboard
3. Deploy with OpenNext Workers adapter
4. Verify API routes return 403 (not 404)

See `docs/OPENNEXT_DEPLOYMENT.md` for complete deployment instructions.
