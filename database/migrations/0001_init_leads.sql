-- Scanminers Leads Database Schema
-- Cloudflare D1 Migration v1

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL DEFAULT 'contact',
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  message TEXT,
  goal TEXT,
  region TEXT,
  stage TEXT,
  timing TEXT,
  additional_context TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  viewed_at TEXT,
  replied_at TEXT,
  last_reply_draft TEXT,
  metadata TEXT DEFAULT '{}',
  commodities TEXT DEFAULT '[]',
  reference TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create lead_events table for timeline/audit trail
CREATE TABLE IF NOT EXISTS lead_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Create index for event queries
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON lead_events(lead_id, created_at ASC);
