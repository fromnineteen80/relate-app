import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = config.useMockAuth
  ? (null as unknown as ReturnType<typeof createClient>)
  : createClient(supabaseUrl, supabaseAnonKey);

export function getSupabase() {
  if (config.useMockAuth) {
    return null;
  }
  return supabase;
}
