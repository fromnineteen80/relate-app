-- Add growth_data JSONB column to user_progress for cross-device sync
-- Stores individual growth plan state: exercises, points, active exercise, etc.
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS growth_data jsonb;

-- Enable Supabase Realtime on users and user_progress tables
-- so partners can see profile/results changes in real time.
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
