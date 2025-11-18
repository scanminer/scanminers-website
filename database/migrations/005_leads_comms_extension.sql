ALTER TABLE leads ADD COLUMN last_contacted_at TEXT;
ALTER TABLE leads ADD COLUMN last_contacted_by TEXT;
ALTER TABLE leads ADD COLUMN contact_status TEXT NOT NULL DEFAULT 'not_contacted';

CREATE INDEX IF NOT EXISTS idx_leads_contact_status ON leads(contact_status, datetime(created_at) DESC);
