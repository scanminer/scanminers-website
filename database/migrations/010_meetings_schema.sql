-- Meetings table for internal, prospect, and client meetings
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date_time TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'internal' CHECK (type IN ('internal', 'prospect', 'client')),
  participants TEXT, -- JSON array of participant names/emails
  related_lead_id TEXT,
  related_project_id TEXT,
  notes TEXT,
  decisions TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (related_lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(datetime(date_time) DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_type ON meetings(type);
CREATE INDEX IF NOT EXISTS idx_meetings_lead ON meetings(related_lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON meetings(related_project_id);

-- Meeting action items table
CREATE TABLE IF NOT EXISTS meeting_actions (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  description TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
  due_date TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meeting_actions_meeting ON meeting_actions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_actions_status ON meeting_actions(status);
CREATE INDEX IF NOT EXISTS idx_meeting_actions_owner ON meeting_actions(owner);
CREATE INDEX IF NOT EXISTS idx_meeting_actions_due ON meeting_actions(due_date);
