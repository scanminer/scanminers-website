# Production Smoke Test Checklist

## Automated Tests (Passed)

- [x] **Database Connectivity**: Verified write/read access to `scanminers-leads-v2`.
- [x] **Schema Validation**: Confirmed `leads`, `projects`, and `project_timeline` tables are active and correct.
- [x] **Workflow Simulation**: Successfully simulated Lead -> Project -> Active Status workflow via D1.
- [x] **Endpoint Reachability**: Confirmed `https://scanminers.com` is reachable (protected by Cloudflare).

## Manual Browser Tests (Required)

Since the site is protected by Cloudflare Turnstile/Access, automated tools cannot fully verify the frontend-to-backend integration. Please perform the following:

### 1. Public Site

- [ ] Visit [https://scanminers.com](https://scanminers.com).
- [ ] Navigate to the **Contact** page.
- [ ] Fill out the form with test data.
- [ ] Submit and verify the "Success" message appears.
- [ ] _Optional_: Ask me to check D1 for your new submission (provide the email you used).

### 2. Admin Access

- [ ] Visit [https://scanminers.com/admin](https://scanminers.com/admin).
- [ ] Verify you are redirected to the login page (or auto-logged in if using Access).
- [ ] Check if you can see the "Leads" dashboard.

### 3. Consultation Flow

- [ ] Visit `/consultation`.
- [ ] Submit a dummy consultation request.
- [ ] Verify the success message.

## Cleanup

After testing, you may want to delete the test data.
Run this command to clean up the automated test data:

```bash
npx wrangler d1 execute scanminers-leads-v2 --remote --command "DELETE FROM project_timeline WHERE project_id = 'proj-smoke-test-2024'; DELETE FROM projects WHERE id = 'proj-smoke-test-2024'; DELETE FROM leads WHERE id = 'smoke-test-2024';"
```
