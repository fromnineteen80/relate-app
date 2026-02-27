-- RELATE App — Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ============================================================
-- 1. USERS table (extends auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  gender char(1) check (gender in ('M', 'W')),
  age integer,
  zip_code text,
  ethnicity text,
  orientation text,
  income integer,
  education text,
  height text,
  body_type text,
  fitness_level text,
  political text,
  smoking boolean,
  has_kids boolean,
  want_kids text,
  relationship_status text,
  pref_age_min integer,
  pref_age_max integer,
  pref_income_min integer,
  pref_height_min text,
  pref_body_types text[],
  pref_fitness_levels text[],
  pref_smoking text,
  pref_has_kids text,
  pref_want_kids text,
  pref_ethnicities text[],
  pref_political text[],
  pref_education_min text,
  seeking text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- 2. PARTNERSHIPS table
-- ============================================================
create table if not exists public.partnerships (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references public.users(id) on delete cascade,
  user2_id uuid references public.users(id) on delete set null,
  invite_email text not null,
  invite_token text unique not null,
  status text default 'pending' check (status in ('pending', 'active', 'declined')),
  couples_report jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  accepted_at timestamp with time zone
);

-- ============================================================
-- 3. CHECKINS table
-- ============================================================
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid references public.partnerships(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  satisfaction integer check (satisfaction between 1 and 10),
  communication integer check (communication between 1 and 10),
  connection integer check (connection between 1 and 10),
  notes text default '',
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 4. CHALLENGE_PROGRESS table
-- ============================================================
create table if not exists public.challenge_progress (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid references public.partnerships(id) on delete cascade,
  challenge_id text not null,
  status text default 'active' check (status in ('active', 'completed')),
  reflection text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 5. PAYMENTS table
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  product text check (product in ('full_report', 'couples_report')),
  amount integer,
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text default 'completed' check (status in ('completed', 'failed', 'refunded')),
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 6. REFERRAL_CLICKS table
-- ============================================================
create table if not exists public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  service text,
  affiliate_url text,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.partnerships enable row level security;
alter table public.checkins enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.payments enable row level security;
alter table public.referral_clicks enable row level security;

-- USERS: read/write own record
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- PARTNERSHIPS: read/write partnerships you're part of
create policy "Users can read own partnerships"
  on public.partnerships for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can create partnerships"
  on public.partnerships for insert
  with check (auth.uid() = user1_id);

create policy "Users can update own partnerships"
  on public.partnerships for update
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- CHECKINS: read/write for your partnerships
create policy "Users can read checkins for own partnerships"
  on public.checkins for select
  using (
    partnership_id in (
      select id from public.partnerships
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Users can create checkins for own partnerships"
  on public.checkins for insert
  with check (
    auth.uid() = user_id
    and partnership_id in (
      select id from public.partnerships
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

-- CHALLENGE_PROGRESS: read/write for your partnerships
create policy "Users can read challenges for own partnerships"
  on public.challenge_progress for select
  using (
    partnership_id in (
      select id from public.partnerships
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Users can create challenges for own partnerships"
  on public.challenge_progress for insert
  with check (
    partnership_id in (
      select id from public.partnerships
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Users can update challenges for own partnerships"
  on public.challenge_progress for update
  using (
    partnership_id in (
      select id from public.partnerships
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

-- PAYMENTS: users can read their own payments (inserts via service role / webhook)
create policy "Users can read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- REFERRAL_CLICKS: users can read their own clicks (inserts via service role)
create policy "Users can read own referral clicks"
  on public.referral_clicks for select
  using (auth.uid() = user_id);

-- ============================================================
-- Indexes for performance
-- ============================================================
create index if not exists idx_partnerships_user1 on public.partnerships(user1_id);
create index if not exists idx_partnerships_user2 on public.partnerships(user2_id);
create index if not exists idx_partnerships_token on public.partnerships(invite_token);
create index if not exists idx_checkins_partnership on public.checkins(partnership_id);
create index if not exists idx_checkins_created on public.checkins(created_at desc);
create index if not exists idx_challenge_partnership on public.challenge_progress(partnership_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_session on public.payments(stripe_session_id);
