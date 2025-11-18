# Leads Pipeline Setup & Documentation

## Overview

The Scanminers website now has a fully operational, persistent leads pipeline backed by Cloudflare D1 (SQLite). All contact forms, consultation requests, and prospectivity brief submissions are captured, stored, and available for viewing in the admin portal.

## Architecture

### Components

1. **Database Layer**: Cloudflare D1 (SQLite)

   - Tables: `leads`, `lead_events`
   - Migration: `database/migrations/0001_init_leads.sql`

2. **Storage Abstraction**: `lib/lead-store.ts`

   - Provides a unified interface for lead operations
   - Automatically falls back to in-memory storage if D1 not available
   - Supports: create, list, get, markViewed, markReplied, addEvent

3. **API Endpoints**:

   - `/api/leads` - Unified endpoint for lead creation (with Turnstile verification)
   - `/api/contact` - Contact form (uses `createLead` directly)
   - `/api/consultation` - Consultation requests (uses `createLead` directly)
   - `/api/prospectivity-brief` - Brief requests (uses `createLead` directly)

4. **Admin UI**:
   - `/admin/leads` - List all leads with filtering by status/type
   - `/admin/leads/[id]` - Individual lead details with timeline

### Data Flow

```
User submits form
       ↓
API endpoint validates (Turnstile, rate limit, required fields)
       ↓
createLead() called with typed input
       ↓
D1LeadStore writes to database (or MemoryLeadStore if D1 unavailable)
       ↓
Lead appears in /admin/leads immediately
```

## Setup Instructions

### Local Development

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Create D1 Database**

   ```bash
   # Create the database
   wrangler d1 create scanminers-leads

   # Copy the database_id from output and update wrangler.toml
   # Then run:
   bash scripts/setup-d1.sh
   ```

3. **Run Migrations**

   ```bash
   # Apply schema to local database
   wrangler d1 execute scanminers-leads --local --file=database/migrations/0001_init_leads.sql
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Test Lead Creation**
   - Visit http://localhost:3000/contact
   - Fill out form and submit
   - Check http://localhost:3000/admin/leads

### Production Setup

1. **Create Production D1 Database**

   ```bash
   # Create database in Cloudflare
   wrangler d1 create scanminers-leads

   # Note the database_id and update wrangler.toml
   ```

2. **Update wrangler.toml**

   ```toml
   [[d1_databases]]
   binding = "LEADS_DB"
   database_name = "scanminers-leads"
   database_id = "YOUR_ACTUAL_DATABASE_ID_HERE"
   ```

3. **Run Production Migrations**

   ```bash
   wrangler d1 execute scanminers-leads --remote --file=database/migrations/0001_init_leads.sql
   ```

4. **Deploy to Cloudflare Pages**

   ```bash
   git push origin main
   # Cloudflare Pages will automatically build and deploy
   ```

5. **Verify Database Binding**
   - In Cloudflare Dashboard: Workers & Pages → scanminers-website → Settings → Bindings
   - Ensure `LEADS_DB` is listed

## Configuration

### Environment Variables

No additional environment variables needed! The D1 binding is configured in `wrangler.toml` and automatically available in the Cloudflare Workers runtime.

**Existing variables used by lead forms:**

- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile verification (already configured)
- `RESEND_API_KEY` - Email notifications (optional, for contact/consultation forms)
- `RESEND_FROM` - Sender email address
- `RESEND_TO` - Team recipient emails (comma-separated)

### wrangler.toml Configuration

```toml
[[d1_databases]]
binding = "LEADS_DB"
database_name = "scanminers-leads"
database_id = "ab5a9ca1-0c10-4ed4-8d04-8df2a910b9da"  # Your actual ID
```

## Database Schema

### `leads` Table

| Column               | Type      | Description                                           |
| -------------------- | --------- | ----------------------------------------------------- |
| `id`                 | TEXT (PK) | Unique lead ID (nanoid)                               |
| `type`               | TEXT      | Lead type: contact, consultation, prospectivity_brief |
| `source`             | TEXT      | Form source identifier                                |
| `status`             | TEXT      | Status: new, viewed, replied                          |
| `name`               | TEXT      | Lead name                                             |
| `email`              | TEXT      | Lead email                                            |
| `company`            | TEXT      | Company name (optional)                               |
| `role`               | TEXT      | Job title (optional)                                  |
| `message`            | TEXT      | Message content                                       |
| `goal`               | TEXT      | Project goal (for briefs)                             |
| `region`             | TEXT      | Geographic region                                     |
| `stage`              | TEXT      | Project stage                                         |
| `timing`             | TEXT      | Project timeline                                      |
| `additional_context` | TEXT      | Additional notes                                      |
| `created_at`         | TEXT      | ISO timestamp                                         |
| `updated_at`         | TEXT      | ISO timestamp                                         |
| `viewed_at`          | TEXT      | When first viewed                                     |
| `replied_at`         | TEXT      | When marked replied                                   |
| `last_reply_draft`   | TEXT      | Saved draft reply                                     |
| `metadata`           | TEXT      | JSON blob for extra data                              |
| `commodities`        | TEXT      | JSON array of commodities                             |
| `reference`          | TEXT      | Reference number (consultations)                      |

### `lead_events` Table

| Column       | Type                        | Description                                           |
| ------------ | --------------------------- | ----------------------------------------------------- |
| `id`         | INTEGER (PK, AUTOINCREMENT) | Event ID                                              |
| `lead_id`    | TEXT (FK)                   | Lead ID                                               |
| `action`     | TEXT                        | Event type: submitted, viewed, replied, drafted, note |
| `actor`      | TEXT                        | Who performed the action                              |
| `detail`     | TEXT                        | Additional details                                    |
| `created_at` | TEXT                        | ISO timestamp                                         |

## API Reference

### POST /api/leads

Unified endpoint for creating leads from any public form.

**Request:**

```json
{
  "type": "contact | consultation | prospectivity_brief",
  "source": "contact-form",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Inc",
  "message": "Interested in your services",
  "token": "TURNSTILE_TOKEN",
  "metadata": {}
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Thank you for your submission. We'll be in touch soon!",
  "leadId": "abc123xyz"
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "Error description"
}
```

### Admin Endpoints

All admin endpoints require authentication (see admin auth setup).

- **GET /admin/leads** - List leads with filtering
- **GET /admin/leads/[id]** - View individual lead with timeline
- **POST /admin/leads/[id]/actions** - Mark viewed, save draft, mark replied

## Usage Guide

### Viewing Leads

1. Navigate to https://scanminers.com/admin/login
2. Sign in with admin credentials
3. Click "Leads" in the sidebar
4. Use filters to view by status (New, Viewed, Replied) or type

### Managing Leads

1. Click on any lead to view details
2. View complete submission data and timeline
3. Use action buttons to:
   - Mark as viewed (automatically happens on page load)
   - Save draft replies
   - Mark as replied

### Querying the Database Directly

**Local development:**

```bash
# List all leads
wrangler d1 execute scanminers-leads --local --command="SELECT id, name, email, status, created_at FROM leads ORDER BY created_at DESC LIMIT 10"

# Count leads by status
wrangler d1 execute scanminers-leads --local --command="SELECT status, COUNT(*) as count FROM leads GROUP BY status"

# View recent events
wrangler d1 execute scanminers-leads --local --command="SELECT * FROM lead_events ORDER BY created_at DESC LIMIT 10"
```

**Production:**

```bash
# Same commands but with --remote flag
wrangler d1 execute scanminers-leads --remote --command="SELECT COUNT(*) as total FROM leads"
```

## Testing

### Unit Tests

```bash
npm run test
```

Tests cover:

- Type definitions (LeadRecord, LeadCreateInput)
- LeadStatus and LeadType validation
- Metadata structure
- All field combinations

### Manual QA Checklist

#### Contact Form

- [ ] Visit http://localhost:3000/contact (or production URL)
- [ ] Fill out: Name, Email, Company, Message
- [ ] Complete Turnstile challenge
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Check `/admin/leads` - new lead should appear with type "contact"
- [ ] Click lead to view details - all fields should match submission

#### Consultation Form

- [ ] Visit http://localhost:3000/consultation
- [ ] Fill out complete consultation form
- [ ] Include commodities, regions, stage, timing
- [ ] Complete Turnstile and submit
- [ ] Verify email confirmation received
- [ ] Check `/admin/leads` - new lead with type "consultation"
- [ ] Verify reference number appears in lead details

#### Prospectivity Brief Form

- [ ] Visit http://localhost:3000/prospectivity-brief
- [ ] Fill out brief request form
- [ ] Include goal, commodities, data sources
- [ ] Complete Turnstile and submit
- [ ] Check `/admin/leads` - new lead with type "prospectivity_brief"
- [ ] Verify all fields captured correctly

#### Admin Lead Management

- [ ] Navigate to `/admin/leads`
- [ ] Verify lead count summary displays correctly
- [ ] Filter by status: All, New, Viewed, Replied
- [ ] Filter by type: All types, Contact, Consultation, Prospectivity brief
- [ ] Click a lead to view details
- [ ] Verify timeline shows "submitted" event
- [ ] Refresh page - status should change to "viewed"
- [ ] Verify timeline shows new "viewed" event
- [ ] Save a draft reply (if implemented)
- [ ] Mark as replied
- [ ] Verify status updates to "replied"

#### Database Persistence

- [ ] Submit a lead
- [ ] Restart development server (`npm run dev`)
- [ ] Check `/admin/leads` - lead should still be there
- [ ] Submit another lead
- [ ] Query database: `wrangler d1 execute scanminers-leads --local --command="SELECT * FROM leads"`
- [ ] Verify both leads present

#### Fallback Mode (In-Memory)

- [ ] Comment out D1 binding in wrangler.toml
- [ ] Restart server
- [ ] Submit a lead
- [ ] Check `/admin/leads` - lead should appear (stored in memory)
- [ ] Console should show warning: "[leads] Cloudflare context unavailable"
- [ ] Restart server - leads should be gone (memory cleared)
- [ ] Re-enable D1 binding

#### Rate Limiting

- [ ] Submit same form 5+ times rapidly from same IP
- [ ] Verify rate limit error after threshold
- [ ] Wait 60 seconds
- [ ] Verify can submit again

#### Error Handling

- [ ] Submit form without Turnstile token (should fail)
- [ ] Submit form with invalid email format (should fail client-side)
- [ ] Submit form with missing required fields (should fail)
- [ ] Temporarily break database connection
- [ ] Submit form - should see user-friendly error
- [ ] Check server logs for detailed error

## Troubleshooting

### "Cloudflare context unavailable" Warning

**Cause:** D1 binding not available (local dev without wrangler, or missing binding).

**Solution:**

- For local dev: Run migrations with `wrangler d1 execute`
- For production: Verify D1 binding in Cloudflare Dashboard
- Fallback: In-memory store will work but data isn't persistent

### Leads Not Appearing in Admin

**Check:**

1. Database connection: `wrangler d1 execute scanminers-leads --local --command="SELECT COUNT(*) FROM leads"`
2. Migration ran: Tables should exist
3. Form submission: Check browser network tab for API errors
4. Auth: Ensure signed in to admin portal

### Form Submission Fails

**Common causes:**

1. Turnstile token invalid/expired - User needs to retry
2. Rate limit exceeded - Wait 60 seconds
3. Missing environment variables - Check `TURNSTILE_SECRET_KEY`
4. Database connection - Check D1 binding

### Build Errors

```bash
# Clean and rebuild
rm -rf .next .open-next
npm run build
```

## Files Changed

### New Files

- `database/migrations/0001_init_leads.sql` - D1 schema
- `scripts/setup-d1.sh` - Setup helper script
- `app/api/leads/route.ts` - Unified API endpoint
- `tests/unit/lead-store.test.ts` - Comprehensive tests
- `docs/LEADS_SETUP.md` - This documentation

### Modified Files

- `wrangler.toml` - Uncommented D1 binding
- `lib/lead-store.ts` - Already had D1 support, now fully utilized
- `app/admin/leads/page.tsx` - Already connected to lead store
- `app/admin/leads/[id]/page.tsx` - Already shows lead details
- `app/api/contact/route.ts` - Already uses `createLead`
- `app/api/consultation/route.ts` - Already uses `createLead`
- `app/api/prospectivity-brief/route.ts` - Already uses `createLead`
- `app/api/admin/env-check/route.ts` - Fixed lint warning

### Behavior Changes

- **Before:** Leads stored in GitHub issues only, not queryable
- **After:** Leads stored in D1 database, fully searchable in admin UI
- **Before:** No persistent lead history across server restarts
- **After:** All leads persisted permanently in D1
- **Before:** No lead filtering or status tracking
- **After:** Filter by status/type, track viewed/replied states
- **Before:** No event timeline
- **After:** Full audit trail of all lead interactions

## Performance Notes

- D1 queries are fast (SQLite, edge-colocated)
- Indexes on status, type, created_at for optimal filtering
- Lead listing limited to 120 records by default (configurable)
- In-memory fallback has no persistence cost but limited capacity

## Security Notes

- All admin routes protected by NextAuth middleware
- Rate limiting prevents abuse (IP-based, 60s cooldown)
- Turnstile verification on all public form submissions
- No sensitive data exposed in API responses
- Database access restricted to Cloudflare Workers runtime

## Next Steps

1. ✅ Database schema created
2. ✅ Migrations ready
3. ✅ API endpoints functional
4. ✅ Admin UI connected
5. ✅ Tests passing
6. ⏭️ Deploy to production
7. ⏭️ Run production migrations
8. ⏭️ Manual QA on production
9. ⏭️ Monitor lead submissions
10. ⏭️ Consider email notifications for new leads (optional)

## Support

For issues or questions:

- Check server logs for errors
- Query database directly for debugging
- Review Cloudflare Dashboard for D1 status
- Check admin portal at `/admin/system` for environment health
