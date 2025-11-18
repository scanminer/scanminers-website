# Comms Tracking Implementation Guide

## Overview

The comms tracking feature allows admins to reply to leads via email and track contact metadata (last contacted timestamp, actor, status) without requiring Gmail API integration.

## Database Changes

### Migration 005: Leads Comms Extension

**File:** `database/migrations/005_leads_comms_extension.sql`

Adds three new columns to the `leads` table:

- `last_contacted_at TEXT` – ISO timestamp of the last contact
- `last_contacted_by TEXT` – Email/identifier of the actor who initiated contact
- `contact_status TEXT NOT NULL DEFAULT 'not_contacted'` – Contact state (`not_contacted` | `contacted`)

Also creates an index on `contact_status` for efficient filtering.

**Apply migration:**

```bash
wrangler d1 execute scanminers-leads --remote --file=database/migrations/005_leads_comms_extension.sql
```

## Code Changes

### Lead Store (`lib/lead-store.ts`)

- **New type:** `LeadContactStatus` (`not_contacted` | `contacted`)
- **Updated `LeadRecord`** to include:
  - `contactStatus: LeadContactStatus`
  - `lastContactedAt: string | null`
  - `lastContactedBy: string | null`
- **New adapter method:** `markContacted(id, actorEmail?)`
- **New public helper:** `markLeadContacted(id, actorEmail?)`

Both `D1LeadStore` and `MemoryLeadStore` implement the new method, updating the contact fields and returning the updated lead.

### Server Actions (`app/admin/leads/actions.ts`)

- **New action:** `markLeadContactedAction(leadId: string)`
  - Requires admin session
  - Calls `markLeadContacted` with current actor's email
  - Revalidates `/admin/leads` and detail paths
  - Returns `{ success: boolean, message?: string }`

### UI Components

#### LeadContactBadge (`components/admin/leads/LeadContactBadge.tsx`)

New component displaying contact status:

- `not_contacted` → grey badge
- `contacted` → blue badge

#### LeadActions (`components/admin/leads/LeadActions.tsx`)

- **New prop:** `email: string`
- **New button:** "Reply via email" (primary, with mail icon)
  - Triggers `markLeadContactedAction` → `mailto:` link → refresh
- Reordered actions: reply-via-email (primary), mark-replied (secondary), convert-to-project (outline)

### Admin Pages

#### Lead Detail (`app/admin/leads/[id]/page.tsx`)

- Displays `LeadContactBadge` next to status pill
- Shows contact metadata in "Lead details" section:
  - Last contacted (timestamp)
  - Contacted by (actor email)
- Passes `email` prop to `LeadActions`

#### Leads List (`app/admin/leads/page.tsx`)

- Shows `LeadContactBadge` for each lead in list view

## Testing

### Unit Tests (`tests/unit/lead-store.test.ts`)

Added three test cases for `markLeadContacted`:

1. Mark as contacted with actor email
2. Handle null actor email
3. Return null for non-existent lead

**Run tests:**

```bash
npm test
```

## Usage Workflow

1. Admin views a lead detail page
2. Clicks "Reply via email" button
3. System marks lead as contacted (stores timestamp + actor)
4. Opens default email client with `mailto:` link (pre-filled subject)
5. Admin sends reply manually via email
6. Lead now shows "Contacted" badge and last-contact metadata in the UI

## Notes

- Contact tracking is lightweight metadata only—no email content is stored
- The `mailto:` link opens the system's default email client
- `markLeadContacted` is idempotent—can be called multiple times; latest timestamp wins
- Contact status is separate from lead status (`new` / `viewed` / `replied`)

## Future Enhancements

- Filter leads by contact status
- Add "mark as not contacted" action
- Track multiple contact events (timeline integration)
- Integrate with email service providers for automatic tracking
