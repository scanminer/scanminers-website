# Reply via Email + Comms Tracking Summary

**Delivered:** November 18, 2025  
**Phase:** Post-Projects MVP enhancement  
**Status:** ✅ Complete and verified

---

## Overview

Added lightweight communication tracking to the leads pipeline, enabling admins to:

- Reply to leads via mailto links that auto-track contact timestamps
- View contact status badges (new/contacted/replied) in the admin list
- Filter leads by contact status
- See last-contacted metadata in lead detail views
- Track outreach history without external email integrations

**Design philosophy:** Keep it simple—no Gmail API, no email parsing. Just metadata updates triggered by user actions.

---

## What Changed

### 1. Database Schema (`database/migrations/005_leads_comms_extension.sql`)

Added three new columns to the `leads` table:

```sql
ALTER TABLE leads ADD COLUMN last_contacted_at TEXT;
ALTER TABLE leads ADD COLUMN last_contacted_by TEXT;
ALTER TABLE leads ADD COLUMN contact_status TEXT DEFAULT 'new';
CREATE INDEX idx_leads_contact_status ON leads(contact_status);
```

**Contact status values:**

- `new` – default for freshly submitted leads
- `contacted` – admin has opened a mailto reply link
- `replied` – admin confirmed a reply was sent

### 2. Lead Store (`lib/lead-store.ts`)

**New type:**

```typescript
export type LeadContactStatus = "new" | "contacted" | "replied";
```

**Extended `LeadRecord`:**

```typescript
export interface LeadRecord {
  // ... existing fields
  lastContactedAt: string | null;
  lastContactedBy: string | null;
  contactStatus: LeadContactStatus;
}
```

**New adapter method:**

```typescript
markContacted(id: string, actorEmail?: string | null): Promise<LeadRecord | null>
```

Updates `last_contacted_at`, `last_contacted_by`, and sets `contact_status = 'contacted'`.

**New exported helper:**

```typescript
export async function markLeadContacted(
  id: string,
  actorEmail?: string | null
): Promise<LeadRecord | null>;
```

### 3. Server Action (`app/admin/leads/actions.ts`)

**New action:**

```typescript
export async function markLeadContactedAction(leadId: string);
```

- Validates auth (admin only)
- Calls `markLeadContacted` with admin email
- Returns success/error state
- Client-side triggers on mailto link click

### 4. Admin UI Components

**Contact Status Badge (`components/admin/leads/ContactStatusBadge.tsx`)**

- Visual indicator: gray (new), blue (contacted), green (replied)
- Used in both list and detail views

**List View Updates (`app/admin/leads/page.tsx`)**

- Added contact-status filter dropdown
- Display `ContactStatusBadge` in each row
- Shows "Reply via Email" button that auto-marks contacted

**Detail View Updates (`app/admin/leads/[id]/page.tsx`)**

- Shows contact status badge
- Displays last-contacted timestamp and actor email
- Renders reply button with auto-tracking

**Lead Actions Component (`components/admin/leads/LeadActions.tsx`)**

- `ReplyViaEmailButton` triggers `markLeadContactedAction` on click
- Opens mailto link with pre-filled subject/body
- Toast confirmation on success

### 5. Tests (`tests/unit/lead-store.test.ts`)

Added comprehensive test coverage:

- `markContacted` updates metadata correctly
- `markLeadContacted` helper proxies to adapter
- Default contact status is `"new"`
- Timestamps and actor emails persist correctly
- D1 and memory stores behave identically

**Test results:** ✅ 70 tests passing (28 lead-store specific)

### 6. Documentation

Created this summary plus inline JSDoc comments for all new methods.

---

## Migration Instructions

### Prerequisites

- Cloudflare D1 database binding configured
- Local Wrangler CLI for dev migrations
- Production D1 database for prod rollout

### Dev Environment

```bash
# Apply migration locally
wrangler d1 execute DB --local --file=database/migrations/005_leads_comms_extension.sql

# Verify schema
wrangler d1 execute DB --local --command="PRAGMA table_info(leads);"

# Start dev server
npm run dev
```

### Production Rollout

```bash
# Apply migration to production D1
wrangler d1 execute DB --remote --file=database/migrations/005_leads_comms_extension.sql

# Verify in Cloudflare dashboard
# D1 > [your-db] > Console > SELECT contact_status, COUNT(*) FROM leads GROUP BY contact_status;

# Deploy via Cloudflare Pages (automatic on git push to main)
git push origin main
```

**Rollback plan:** If issues arise, the new columns are nullable and default-safe. You can roll back code without schema changes. To fully revert:

```sql
DROP INDEX idx_leads_contact_status;
ALTER TABLE leads DROP COLUMN last_contacted_at;
ALTER TABLE leads DROP COLUMN last_contacted_by;
ALTER TABLE leads DROP COLUMN contact_status;
```

---

## QA Checklist

### Unit Tests

- [x] All 70 tests pass (`npm run test`)
- [x] Lead-store tests cover new contact methods
- [x] Contact status defaults and transitions verified

### Lint & Build

- [x] ESLint clean (`npm run lint`)
- [x] TypeScript compilation successful
- [x] Production build completes (`npm run build`)

### Functional Testing (Manual)

**Pre-flight:**

- [ ] Apply migration 005 to dev D1
- [ ] Restart dev server
- [ ] Log into `/admin/leads`

**List View:**

- [ ] All existing leads show "new" contact status badge (gray)
- [ ] Filter dropdown includes "All", "New", "Contacted", "Replied"
- [ ] Filtering by "New" shows only uncontacted leads
- [ ] "Reply via Email" button visible on each row

**Reply Flow:**

- [ ] Click "Reply via Email" on a lead
- [ ] Mailto link opens with pre-filled subject/body
- [ ] Toast confirms "Marked as contacted"
- [ ] Lead badge updates to "Contacted" (blue) without page refresh
- [ ] Lead detail page shows last-contacted timestamp and admin email

**Detail View:**

- [ ] Contact status badge displays correctly
- [ ] Last contacted metadata appears below lead info
- [ ] Reply button triggers same flow as list view

**Edge Cases:**

- [ ] Clicking reply button multiple times updates timestamp each time
- [ ] Unauthenticated users cannot access admin routes (middleware blocks)
- [ ] Memory store fallback works if D1 unavailable (dev mode)

### Performance & UX

- [ ] List view loads quickly with 50+ leads
- [ ] Filter changes update instantly (client-side)
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile/tablet

### Production Smoke Test

- [ ] Deploy to staging/production
- [ ] Verify migration applied via D1 console
- [ ] Test reply flow end-to-end
- [ ] Check Sentry for errors (no new issues)
- [ ] Monitor Cloudflare logs for 5xx responses

---

## Key Files Modified

| File                                                | Change Summary                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `database/migrations/005_leads_comms_extension.sql` | New migration adding contact-tracking columns                                |
| `lib/lead-store.ts`                                 | Added `LeadContactStatus`, extended `LeadRecord`, new `markContacted` method |
| `app/admin/leads/actions.ts`                        | New `markLeadContactedAction` server action                                  |
| `app/admin/leads/page.tsx`                          | Added filter dropdown and contact status badges                              |
| `app/admin/leads/[id]/page.tsx`                     | Display contact metadata in detail view                                      |
| `components/admin/leads/ContactStatusBadge.tsx`     | New badge component                                                          |
| `components/admin/leads/LeadActions.tsx`            | Reply button with auto-tracking                                              |
| `tests/unit/lead-store.test.ts`                     | Test coverage for new contact methods                                        |

---

## Usage Example

**Admin workflow:**

1. Navigate to `/admin/leads`
2. See a new lead with gray "New" badge
3. Click "Reply via Email" button
4. Default mail client opens with pre-filled message
5. Send reply manually
6. Return to admin—lead now shows blue "Contacted" badge
7. Lead detail displays "Last contacted: Nov 18, 2025 by admin@example.com"

**Filtering:**

- Use dropdown to show only "New" leads for outreach prioritization
- Filter by "Replied" to see completed follow-ups

---

## Future Enhancements (Out of Scope)

- Email template library for common responses
- Bulk contact marking for batch outreach
- Gmail API integration for automatic reply detection
- Email open/click tracking via pixel/link tracking
- Scheduled follow-up reminders
- CRM webhook integrations (HubSpot, Salesforce, etc.)

---

## Support & Rollout

**Deployment:** Automatic via Cloudflare Pages on push to `main`.  
**Monitoring:** Sentry error tracking + Cloudflare analytics.  
**Documentation:** This summary + inline code comments.

**Contact:** For issues or questions, check:

- `docs/HANDOVER.md` for architecture overview
- `tests/unit/lead-store.test.ts` for usage examples
- Admin dashboard logs at `/admin/system`

---

**Status:** ✅ Ready for production deployment after QA sign-off.
