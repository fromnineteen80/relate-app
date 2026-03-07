-- Migration: Add Module 5 (Know Your Patterns) columns to user_progress
-- This migration adds M5 support for existing databases.
-- Safe to run multiple times (uses IF NOT EXISTS pattern via DO blocks).

DO $$
BEGIN
  -- Add m5_responses column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'm5_responses'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN m5_responses jsonb;
  END IF;

  -- Add m5_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'm5_completed'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN m5_completed boolean DEFAULT false;
  END IF;

  -- Add m5_scored column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'm5_scored'
  ) THEN
    ALTER TABLE public.user_progress ADD COLUMN m5_scored jsonb;
  END IF;
END $$;
