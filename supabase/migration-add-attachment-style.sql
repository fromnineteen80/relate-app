-- Migration: Add Attachment Style (attachment style assessment) storage
-- Adds columns to user_progress and partnerships tables for Attachment Style data.
-- Uses ADD COLUMN IF NOT EXISTS for idempotent/safe re-runs.

-- =============================================================================
-- 1. Attachment Style columns on user_progress
-- =============================================================================

-- Session checkpoint data (allows resuming an in-progress assessment)
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS attachment_style_checkpoint jsonb;

-- Four quadrant results, axis scores, emergent pattern, confidence scores
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS attachment_style_results jsonb;

-- Six report sections as named fields
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS attachment_style_report jsonb;

-- Four growth plan parts as named fields
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS attachment_style_growth jsonb;

-- Whether the user has completed the Attachment Style assessment
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS attachment_style_completed boolean DEFAULT false;

-- Timestamp when the user started the Attachment Style assessment
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS attachment_style_started_at timestamp with time zone;

-- Timestamp when the user completed the Attachment Style assessment
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS attachment_style_completed_at timestamp with time zone;

-- =============================================================================
-- 2. Persona history on user_progress (Section 7 of Attachment Style spec)
--    Stores an array of {code, timestamp, source} objects tracking how the
--    user's persona evolves over time.
-- =============================================================================

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS persona_history jsonb;

-- =============================================================================
-- 3. Attachment Style couples overlay on partnerships
-- =============================================================================

-- Couples overlay report generated when both partners complete Attachment Style
ALTER TABLE partnerships
  ADD COLUMN IF NOT EXISTS attachment_style_couples_overlay jsonb;

-- =============================================================================
-- 4. Payments — no schema change needed
--    The existing payments.product text field already supports storing
--    'attachment_style' or 'attachment_style_couples' as product identifiers.
-- =============================================================================
