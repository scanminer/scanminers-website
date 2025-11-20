-- Legacy migrations previously handled column renames and additions.
-- The current baseline schema already uses the canonical column names,
-- so this migration now normalizes existing rows and ensures the
-- type index is present without attempting duplicate renames.

-- Normalize stored type values to snake_case
UPDATE leads SET type = REPLACE(type, '-', '_');

-- Refresh indexes for the canonical column name
DROP INDEX IF EXISTS idx_leads_kind;
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
