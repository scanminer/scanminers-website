-- Add contact information fields to projects table
ALTER TABLE projects ADD COLUMN client_email TEXT;
ALTER TABLE projects ADD COLUMN client_phone TEXT;

-- Add index on client email for lookups
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON projects(client_email);
