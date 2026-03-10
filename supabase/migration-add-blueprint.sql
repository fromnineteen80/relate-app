-- Migration: Add Blueprint (attachment style assessment) storage
-- Adds columns to user_progress and partnerships tables for Blueprint data.
-- Uses ADD COLUMN IF NOT EXISTS for idempotent/safe re-runs.

-- =============================================================================
-- 1. Blueprint columns on user_progress
-- =============================================================================

-- Session checkpoint data (allows resuming an in-progress assessment)
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS blueprint_checkpoint jsonb;

-- Four quadrant results, axis scores, emergent pattern, confidence scores
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS blueprint_results jsonb;

-- Six report sections as named fields
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS blueprint_report jsonb;

-- Four growth plan parts as named fields
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS blueprint_growth jsonb;

-- Whether the user has completed the Blueprint assessment
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS blueprint_completed boolean DEFAULT false;

-- Timestamp when the user started the Blueprint assessment
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS blueprint_started_at timestamp with time zone;

-- Timestamp when the user completed the Blueprint assessment
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS blueprint_completed_at timestamp with time zone;

-- =============================================================================
-- 2. Persona history on user_progress (Section 7 of Blueprint spec)
--    Stores an array of {code, timestamp, source} objects tracking how the
--    user's persona evolves over time.
-- =============================================================================

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS persona_history jsonb;

-- =============================================================================
-- 3. Blueprint couples overlay on partnerships
-- =============================================================================

-- Couples overlay report generated when both partners complete Blueprint
ALTER TABLE partnerships
  ADD COLUMN IF NOT EXISTS blueprint_couples_overlay jsonb;

-- =============================================================================
-- 4. Payments — no schema change needed
--    The existing payments.product text field already supports storing
--    'blueprint' or 'blueprint_couples' as product identifiers.
-- =============================================================================
