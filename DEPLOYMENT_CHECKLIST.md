# Production Deployment Checklist

**Date:** November 18, 2025  
**Feature:** Phase 4.3 - AI Superpowers + Projects Pipeline  
**Status:** ✅ Ready to Deploy

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All tests passing (16/16 tests)
- [x] Build successful
- [x] Lint passing
- [x] TypeScript errors resolved
- [x] Git committed with descriptive message

### ✅ Database Migrations
Local migrations applied:
- [x] 004_projects_schema.sql
- [x] 005_leads_comms_extension.sql
- [x] 006_ai_lead_extensions.sql
- [x] 007_ai_project_extensions.sql

### ✅ Environment Variables (Must be set in Production)
```bash
# Existing (should already be set)
OPENAI_API_KEY=sk-proj-***
RESEND_API_KEY=re_***
RESEND_FROM=contact@scanminers.com
RESEND_TO=founders@scanminers.com
TURNSTILE_SECRET_KEY=***
NEXT_PUBLIC_TURNSTILE_SITE_KEY=***

# New requirement for OPENAI_MODEL (optional - defaults to gpt-4o)
OPENAI_MODEL=gpt-4o
```

## Deployment Steps

### 1. Push to GitHub
```bash
git push origin main
```

This will trigger Cloudflare Pages automatic deployment.

### 2. Apply Database Migrations to Production

**CRITICAL:** Run these commands to update the production D1 database:

```bash
# Apply all migrations to remote database
wrangler d1 migrations apply scanminers-leads --remote

# Verify migrations applied
wrangler d1 execute scanminers-leads --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected tables:**
- leads
- lead_events
- projects
- project_timeline

**Verify AI columns exist:**
```bash
# Check leads table has AI columns
wrangler d1 execute scanminers-leads --remote --command "PRAGMA table_info(leads);"

# Check projects table has ai_project_summary
wrangler d1 execute scanminers-leads --remote --command "PRAGMA table_info(projects);"
```

### 3. Verify Environment Variables in Cloudflare Pages

Go to: https://dash.cloudflare.com → Pages → scanminers-website → Settings → Environment Variables

**Check these are set:**
- ✅ OPENAI_API_KEY
- ✅ RESEND_API_KEY
- ✅ RESEND_FROM
- ✅ RESEND_TO
- ✅ TURNSTILE_SECRET_KEY
- ✅ NEXT_PUBLIC_TURNSTILE_SITE_KEY

**Add if missing:**
- OPENAI_MODEL=gpt-4o (optional)

### 4. Wait for Deployment to Complete

Monitor at: https://dash.cloudflare.com → Pages → scanminers-website → Deployments

Look for:
- ✅ Build successful
- ✅ Deployment successful
- ✅ No build errors

### 5. Post-Deployment Testing

#### Test Lead AI Classification
1. Go to https://scanminers.com/admin/leads
2. Click on a lead
3. Click "Generate AI Insight" button
4. Verify AI summary and tags appear
5. Check browser console for logs

#### Test Project Management
1. Go to https://scanminers.com/admin/projects
2. Verify projects list loads
3. Click "Create from Lead" on a lead
4. Verify project created successfully
5. Open project detail page

#### Test Project AI Features
1. On project detail page
2. Click "Summarize project" - verify summary generates
3. Click "Kickoff email" - verify email draft appears
4. Click "Data request email" - verify checklist appears
5. Test mailto: links open correctly

#### Test Contact Form
1. Go to https://scanminers.com/contact
2. Fill out form with test data
3. Complete Turnstile challenge
4. Submit form
5. Verify success message
6. Check founders@scanminers.com inbox

#### Test Email Sending
```bash
# From your local machine, test production endpoint
curl -X POST https://scanminers.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test","token":"dummy"}'

# Should return: {"success":false,"message":"Invalid Turnstile token."}
# This confirms the endpoint is working
```

## Rollback Plan (If Issues Occur)

### Option 1: Revert Cloudflare Pages Deployment
1. Go to Cloudflare Pages dashboard
2. Find previous successful deployment
3. Click "Rollback to this deployment"

### Option 2: Revert Git Commit
```bash
git revert HEAD
git push origin main
```

### Option 3: Database Rollback (Last Resort)
```bash
# Restore database from backup
# Contact Cloudflare support if needed
```

## Known Limitations (Safe to Deploy)

These are minor enhancements that can be added later:

1. **Rate Limiting on AI Calls**
   - Currently no rate limit on AI generation
   - Can be added if abuse occurs

2. **AI Result Caching**
   - Each generation calls OpenAI API (costs ~$0.01-0.05)
   - Can cache results to reduce costs

3. **Regenerate AI Content**
   - Currently can only generate once per lead/project
   - Can add "regenerate" button if needed

4. **AI Email Template Library**
   - Only kickoff and data request emails
   - Can add more templates as needed

5. **Metrics Dashboard**
   - No tracking of AI usage/costs
   - Can add analytics later

## Success Criteria

Deployment is successful if:
- ✅ Website loads without errors
- ✅ Admin panel accessible at /admin
- ✅ Leads list and detail pages work
- ✅ Projects list and detail pages work
- ✅ AI insight generation works (1 test is enough)
- ✅ Contact form submits successfully
- ✅ No console errors in browser
- ✅ No 500 errors in Cloudflare logs

## Monitoring After Deployment

### Week 1 Checklist
- [ ] Monitor Cloudflare error logs daily
- [ ] Check Resend dashboard for email delivery
- [ ] Check OpenAI usage/costs in dashboard
- [ ] Verify all contact forms working
- [ ] Test AI features with real leads/projects
- [ ] Gather user feedback on AI quality

### Performance Metrics to Track
- API response times (/api/contact, /api/consultation)
- AI generation times (should be 5-10 seconds)
- Email delivery rates (should be >95%)
- Error rates (should be <1%)
- OpenAI API costs per day

## Support Contacts

- **Cloudflare Issues:** support@cloudflare.com
- **Resend Issues:** support@resend.com  
- **OpenAI Issues:** help.openai.com
- **Repository:** github.com/scanminer/scanminers-website

## Documentation Links

- [AI Functionality Test Results](../AI_FUNCTIONALITY_TEST_RESULTS.md)
- [Email Diagnostic Report](../EMAIL_DIAGNOSTIC_REPORT.md)
- [Phase 4.3 Implementation](../docs/PHASE_4_3_AI_SUPERPOWERS.md)
- [Projects Pipeline](../docs/PROJECTS_PIPELINE.md)

---

## Quick Deploy Commands

```bash
# 1. Push to trigger deployment
git push origin main

# 2. Apply database migrations
wrangler d1 migrations apply scanminers-leads --remote

# 3. Monitor deployment
# Go to: https://dash.cloudflare.com/pages

# 4. Test production
# Go to: https://scanminers.com/admin

# Done! 🎉
```

## Deployment Complete! 🚀

Once deployed, the AI features will be live and you can:
- Automatically classify leads with AI
- Generate project summaries from timeline
- Create professional email drafts instantly
- Track lead communications
- Manage projects end-to-end

All enhancements can be added incrementally without disrupting the current functionality.
