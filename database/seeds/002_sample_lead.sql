-- Seed: Sample test lead - DRC Cobalt Screening prospect
-- Run with: wrangler d1 execute scanminers-leads-v2 --file=database/seeds/002_sample_lead.sql --local
-- For production: wrangler d1 execute scanminers-leads-v2 --file=database/seeds/002_sample_lead.sql --remote

INSERT INTO leads (
  id,
  type,
  source,
  status,
  name,
  email,
  company,
  role,
  message,
  goal,
  region,
  stage,
  timing,
  additional_context,
  commodities,
  contact_status,
  created_at,
  updated_at
) VALUES (
  'lead-drc-cobalt-2025',
  'consultation',
  'website',
  'new',
  'Jean-Pierre Kabongo',
  'jp.kabongo@congomines.cd',
  'Congo Mineral Exploration SA',
  'VP Exploration',
  'We are exploring cobalt and copper opportunities in the Katanga region of DRC. Looking for satellite-based screening to prioritize our license areas before committing to ground surveys. We have 12 license blocks totaling ~4,500 km² and need to identify the highest-potential zones for drilling.',
  'prospectivity_mapping',
  'Africa',
  'exploration',
  'next_quarter',
  'Previous experience with airborne EM but found it too expensive for early-stage screening. Interested in multi-sensor fusion approach combining SAR, hyperspectral, and gravity data. Budget approved for Q1 2026.',
  '["cobalt", "copper"]',
  'not_contacted',
  datetime('now'),
  datetime('now')
) ON CONFLICT(id) DO NOTHING;

-- Add a lead event for context
INSERT INTO lead_events (
  lead_id,
  action,
  actor,
  detail,
  created_at
) VALUES (
  'lead-drc-cobalt-2025',
  'note',
  'system',
  'High-value prospect from DRC. VP-level contact with approved budget. Matches our core capability in remote sensing for mineral exploration. Priority follow-up recommended.',
  datetime('now')
);
