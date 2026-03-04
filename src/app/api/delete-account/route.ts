import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Delete user data from all tables (order matters for foreign keys)
    const tables = [
      'challenge_progress',
      'checkins',
      'referral_clicks',
      'partnerships',
      'payments',
      'user_progress',
      'users',
    ];

    for (const table of tables) {
      await supabase.from(table).delete().eq('user_id', userId);
    }

    // Delete the auth user via Supabase Admin API
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Failed to delete auth user:', authError);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
