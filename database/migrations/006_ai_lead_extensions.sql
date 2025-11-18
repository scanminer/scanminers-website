-- Migration 006: AI Extensions for Leads
-- Adds AI-generated insights, classifications, and scoring fields
-- Run: wrangler d1 execute scanminers-leads --local --file=database/migrations/006_ai_lead_extensions.sql

ALTER TABLE leads ADD COLUMN ai_summary TEXT;
ALTER TABLE leads ADD COLUMN ai_tags TEXT;
ALTER TABLE leads ADD COLUMN ai_value_tier TEXT;
ALTER TABLE leads ADD COLUMN ai_urgency TEXT;
ALTER TABLE leads ADD COLUMN ai_fit_score REAL;
ALTER TABLE leads ADD COLUMN ai_confidence REAL;

-- Index for filtering by AI classifications
CREATE INDEX idx_leads_ai_value_tier ON leads(ai_value_tier);
CREATE INDEX idx_leads_ai_urgency ON leads(ai_urgency);
