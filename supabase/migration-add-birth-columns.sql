-- Migration: Add birth data columns to users table
-- These columns are needed for the demographics form (astrology/birth info)

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_month integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_day integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_year integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_hour integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_minute integer;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_ampm text CHECK (birth_ampm IN ('AM', 'PM'));
