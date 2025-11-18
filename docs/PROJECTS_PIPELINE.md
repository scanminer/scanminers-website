# Projects Pipeline Implementation Summary

## Overview

Phase 4.1 adds the first iteration of the Projects engine. Admins can now convert qualified leads into projects, review all engagements at `/admin/projects`, inspect timelines at `/admin/projects/[id]`, update status, and append structured progress notes. The implementation mirrors the existing lead pipeline: Cloudflare D1 is the primary data store with an in-memory fallback for local development and automated testing.

## Schema & Storage

### Tables (Cloudflare D1)

- **`projects`** — Canonical project records created from leads.
  - Columns: `id`, `lead_id`, `client_name`, `project_name`, `status ('new'|'active'|'completed')`, `created_at`, `updated_at`.
  - Foreign key: `lead_id` references `leads(id)`.
  - Indexes on `status` and `created_at` for list views.
- **`project_timeline`** — Append-only log of milestones, blockers, and handoffs tied to a project.
  - Columns: `id`, `project_id`, `message`, `created_at`.
  - Foreign key cascade deletes timelines when a project is removed.

> Migration file: **`database/migrations/004_projects_schema.sql`**
>
> Apply locally:
>
> ```bash
> cd /home/moody/Documents/projects/scanminer/scanminers-website
> npx wrangler d1 execute scanminers-leads --local --file=database/migrations/004_projects_schema.sql
> ```
>
> Apply to production (Cloudflare):
>
> ```bash
> cd /home/moody/Documents/projects/scanminer/scanminers-website
> npx wrangler d1 execute scanminers-leads --remote --file=database/migrations/004_projects_schema.sql
> ```

### Store Module

File: `lib/project-store.ts`

- Dual adapters: `D1ProjectStore` when the `LEADS_DB` binding is available, `MemoryProjectStore` otherwise.
- Public API:
  - `createProjectFromLead(lead)`
  - `listProjects(options)` with filter + limit support
  - `getProjectById(id)`
  - `updateProjectStatus(id, status)`
  - `addProjectTimelineEntry(id, message)` + validation
  - `listProjectTimelineEntries(id)`
  - `assertProjectExists(id)` for guardrails in server actions
- Utility helpers derive sensible defaults for project/client names from lead metadata and enforce sanitized timeline messages.

## Admin Workflow

1. **Convert Lead → Project**
   - Button lives inside `components/admin/leads/LeadActions.tsx`.
   - Server action: `convertLeadToProjectAction` in `app/admin/leads/[id]/actions.ts`.
   - Creates (or reuses) the project, logs a timeline entry, revalidates admin routes, and returns the new `projectId` for client-side redirect.
2. **Project Index**
   - `app/admin/projects/page.tsx`
   - Summary cards + filter chips for `new`, `active`, `completed`.
   - Clicking a row links to `/admin/projects/[id]`.
3. **Project Detail**
   - `app/admin/projects/[id]/page.tsx`
   - Header shows status badge, client, timestamps, and forms to mark **Active** or **Completed**.
   - Timeline card streams entries latest-first.
   - Action panel uses `addProjectTimelineEntryAction` for quick updates.
4. **Status & Timeline Actions**
   - `app/admin/projects/[id]/actions.ts`
   - `updateProjectStatusAction` validates auth, persists the new status, logs a timeline event, and revalidates admin routes.
   - `addProjectTimelineEntryAction` enforces non-empty messages and refreshes the detail page.

## Testing Guide

Run the full suite (includes 60+ unit + Playwright checks):

```bash
cd /home/moody/Documents/projects/scanminer/scanminers-website
npm run test
```

New coverage highlights:

- **`tests/unit/project-store.test.ts`** — Validates the store adapters: creation, idempotent conversions, filtering, status updates, and timeline ordering.
- **`tests/unit/admin-projects-routing.test.tsx`** — Integration-like rendering of `/admin/projects` and `/admin/projects/[id]` using the in-memory store to guarantee pages load with real data after conversion.
- **`tests/unit/convert-lead-to-project-action.test.ts`** — Ensures the server action enforces auth, creates a project, logs timeline entries, revalidates cache paths, and propagates errors correctly.

## Manual QA Checklist

1. **Create a lead** using any public form (contact, consultation, or prospectivity brief).
2. **Visit `/admin/leads`**, open the new lead, and click **Convert to project**.
3. Confirm you are redirected to `/admin/projects/[projectId]` and the header shows the correct client + derived name.
4. Navigate back to `/admin/projects` — the converted project should be listed with the appropriate status badge.
5. On the detail page:
   - Click **Mark Active** → status badge should change and a new timeline entry should appear.
   - Add a note in **Add timeline update** → entry appears at the top.
   - Click **Mark Completed** → badge + timeline confirm completion.
6. Reload both `/admin/projects` and `/admin/leads` to confirm cache revalidation (status + project counts update).
7. Optional: run `npx wrangler d1 execute scanminers-leads --remote --command "SELECT COUNT(*) FROM projects;"` to verify persistence in Cloudflare D1.

## Cloudflare Configuration

- No new bindings are required; the Projects module reuses the existing `LEADS_DB` D1 binding already configured in `wrangler.toml`.
- Ensure production + preview environments have the binding attached to the same database (scanminers-leads).
- Whenever schema changes land, run the migration command (local + `--remote`) listed above before deploying.
- For local development, the `.wrangler/state/v3/d1` SQLite file will pick up `004_projects_schema.sql` automatically the next time you run `npm run dev` or the provided setup script.
