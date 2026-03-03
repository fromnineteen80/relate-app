-- RELATE App — Enable Row Level Security
-- Run this in Supabase SQL Editor to enable RLS on all tables.
-- Policies already exist from schema.sql; this just activates enforcement.

alter table public.users enable row level security;
alter table public.partnerships enable row level security;
alter table public.checkins enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.payments enable row level security;
alter table public.referral_clicks enable row level security;
alter table public.user_progress enable row level security;
