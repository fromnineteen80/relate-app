-- RELATE App — Migration: Add assessment progress persistence
-- Run this in your Supabase SQL Editor AFTER the initial schema.sql

-- ============================================================
-- 1. Add profile name fields to users table
-- ============================================================
alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name text;

-- ============================================================
-- 2. USER_PROGRESS table — stores assessment responses & results
-- ============================================================
create table if not exists public.user_progress (
  user_id uuid primary key references public.users(id) on delete cascade,
  m1_responses jsonb,
  m2_responses jsonb,
  m3_responses jsonb,
  m4_responses jsonb,
  m5_responses jsonb,
  m1_completed boolean default false,
  m2_completed boolean default false,
  m3_completed boolean default false,
  m4_completed boolean default false,
  m5_completed boolean default false,
  m1_scored jsonb,
  m2_scored jsonb,
  m3_scored jsonb,
  m4_scored jsonb,
  m5_scored jsonb,
  results jsonb,
  updated_at timestamp with time zone default now()
);

-- Disable RLS for testing (match existing pattern)
alter table public.user_progress disable row level security;

-- RLS policies (for when RLS is re-enabled)
create policy "Users can read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);
