# How to Delete Cloudflare Pages Project with Many Deployments

## Issue

Cloudflare Pages projects with a high number of deployments (typically >1000) may fail to delete through the dashboard due to timeout issues.

---

## Solution: Use Wrangler CLI

### Step 1: Install/Update Wrangler

```bash
npm install -g wrangler@latest
```

### Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authorize Wrangler with your Cloudflare account.

### Step 3: Delete the Pages Project

```bash
wrangler pages project delete scanminers-website
```

**Expected output:**
```
? Are you sure you want to delete "scanminers-website"? This action cannot be undone. › (y/N)
```

Type `y` and press Enter.

---

## Alternative: Delete via API

If Wrangler doesn't work, use the Cloudflare API directly:

### Step 1: Get Your API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Create token or use existing one with **Cloudflare Pages:Edit** permissions
3. Copy the token

### Step 2: Get Your Account ID

1. Go to: https://dash.cloudflare.com/
2. Select any domain
3. Copy **Account ID** from the right sidebar

### Step 3: Delete Project via API

```bash
# Set your credentials
export CF_ACCOUNT_ID="your-account-id-here"
export CF_API_TOKEN="your-api-token-here"

# Delete the project
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/scanminers-website" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "result": {
    "id": "...",
    "name": "scanminers-website",
    "deleted": true
  },
  "success": true
}
```

---

## Step 4: Verify Deletion

Check that the project is gone:

```bash
wrangler pages project list
```

Or via dashboard: https://dash.cloudflare.com/ → Workers & Pages

---

## Important Notes

### ⚠️ Before Deleting

1. **Verify Worker is Live**: Make sure your new Worker deployment is working
2. **Check Custom Domain**: Ensure `scanminers.com` is attached to Worker (not Pages)
3. **Backup if Needed**: Pages project will be permanently deleted

### ✅ After Deleting

1. **Pages check in CI will fail** - This is expected, remove it from required checks
2. **Worker becomes sole deployment** - All traffic goes through OpenNext Workers
3. **Preview URLs change** - Use Worker preview URLs instead of Pages

---

## Update CI After Deletion

### Remove Pages Check from Branch Protection

1. Go to: https://github.com/scanminer/scanminers-website/settings/branches
2. Edit branch protection rule for `main`
3. Under "Status checks", **remove** "Cloudflare Pages"
4. Keep: Build, Lint, Test, E2E, Content QA, qa

---

## Recommended Deletion Order

1. ✅ **Verify Worker is deployed and working**
   - Run smoke tests on Worker
   - Confirm domain attached to Worker

2. ✅ **Detach custom domains from Pages**
   - Remove `scanminers.com` from Pages
   - Verify domain only on Worker

3. ✅ **Delete Pages project**
   - Use `wrangler pages project delete scanminers-website`
   - Or use API method above

4. ✅ **Update CI**
   - Remove Cloudflare Pages from required checks
   - PRs will no longer wait for Pages builds

---

## Troubleshooting

### Error: "Project not found"

**Cause:** Already deleted or wrong project name

**Fix:** List projects to confirm:
```bash
wrangler pages project list
```

### Error: "Unauthorized"

**Cause:** API token doesn't have Pages:Edit permission

**Fix:** Create new token with correct permissions:
1. https://dash.cloudflare.com/profile/api-tokens
2. Create Token → Custom Token
3. Permissions: Account → Cloudflare Pages → Edit

### Error: "Timeout"

**Cause:** Too many deployments (this is the known issue)

**Solution:** Must use Wrangler CLI or API (not dashboard)

---

## Quick Command Reference

```bash
# Login to Cloudflare
wrangler login

# List Pages projects
wrangler pages project list

# Delete project (safe method for high deployment count)
wrangler pages project delete scanminers-website

# Verify deletion
wrangler pages project list | grep scanminers-website
# Should return nothing
```

---

## After Deletion Checklist

- [ ] Pages project deleted
- [ ] Custom domain confirmed on Worker only
- [ ] CI branch protection updated (Pages check removed)
- [ ] Worker smoke tests passing
- [ ] No references to Pages in deployment docs
- [ ] Team notified of Worker-only deployment

---

**Reference:** https://developers.cloudflare.com/pages/platform/known-issues/#delete-a-project-with-a-high-amount-of-deployments

**Ready to proceed?** Make sure Worker is verified first, then run:

```bash
wrangler pages project delete scanminers-website
```
