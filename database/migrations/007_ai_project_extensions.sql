-- Migration 007: AI Extensions for Projects
-- Adds AI-generated project summary field
-- Run: wrangler d1 execute scanminers-leads --local --file=database/migrations/007_ai_project_extensions.sql

ALTER TABLE projects ADD COLUMN ai_project_summary TEXT;
