-- Add project_id to lead_events to link historical events to projects
ALTER TABLE lead_events ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;

-- Create index for efficient project event queries
CREATE INDEX idx_lead_events_project_id ON lead_events(project_id, created_at DESC);

-- Create dedicated project_emails table for email communications
CREATE TABLE project_emails (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  from_email TEXT,
  to_email TEXT,
  resend_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sent', 'delivered', 'failed', 'bounced')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for efficient email queries
CREATE INDEX idx_project_emails_project_id ON project_emails(project_id, created_at DESC);
CREATE INDEX idx_project_emails_resend_id ON project_emails(resend_id);
