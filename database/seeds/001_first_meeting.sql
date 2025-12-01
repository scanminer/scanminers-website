-- Seed: First internal meeting - Core Team Alignment
-- Run with: wrangler d1 execute scanminers-leads-v2 --file=database/seeds/001_first_meeting.sql --local
-- For production: wrangler d1 execute scanminers-leads-v2 --file=database/seeds/001_first_meeting.sql --remote

INSERT INTO meetings (
  id,
  title,
  date_time,
  type,
  participants,
  related_lead_id,
  related_project_id,
  notes,
  decisions,
  created_at,
  updated_at
) VALUES (
  'first-meeting-2025',
  'Core Team Alignment – Roles & Next 30 Days',
  '2025-12-01T10:30:00.000Z',
  'internal',
  '["Mahmood", "Dr. Amin", "Dr. Mehrtash"]',
  NULL,
  NULL,
  '**Context**
First core team alignment meeting since Scanminers v0.1 went live on production (scanminers.com).
Goal: walk through the live system, align on the next 30 days, and clarify roles.

Notes and decisions to be filled in immediately after the meeting.',
  NULL,
  datetime('now'),
  datetime('now')
) ON CONFLICT(id) DO NOTHING;
