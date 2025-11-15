-- Rename legacy columns to the new canonical names
ALTER TABLE leads RENAME COLUMN kind TO type;
ALTER TABLE leads RENAME COLUMN regions TO region;
ALTER TABLE leads RENAME COLUMN context TO additional_context;

-- Normalize stored type values to snake_case
UPDATE leads SET type = REPLACE(type, '-', '_');

-- Add new structured columns for richer lead data
ALTER TABLE leads ADD COLUMN commodities TEXT;
ALTER TABLE leads ADD COLUMN reference TEXT;

-- Refresh indexes for the renamed columns
DROP INDEX IF EXISTS idx_leads_kind;
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
