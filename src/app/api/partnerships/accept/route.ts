import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return NextResponse.json({ error: 'Token and userId are required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Look up the partnership by invite token
    const { data: partnership, error: lookupError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (lookupError || !partnership) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    if (partnership.status === 'active') {
      return NextResponse.json({ error: 'This invitation has already been accepted' }, { status: 400 });
    }

    if (partnership.status === 'declined') {
      return NextResponse.json({ error: 'This invitation was declined' }, { status: 400 });
    }

    // Prevent self-pairing
    if (partnership.user1_id === userId) {
      return NextResponse.json({ error: 'You cannot accept your own invitation' }, { status: 400 });
    }

    // Accept the partnership: set user2_id, status=active, accepted_at
    const { error: updateError } = await supabase
      .from('partnerships')
      .update({
        user2_id: userId,
        status: 'active',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', partnership.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      partnershipId: partnership.id,
      partnerId: partnership.user1_id,
    });
  } catch (error: unknown) {
    console.error('Partnership accept error:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}

// GET: look up partnership info by token (for the invite page to show details)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: partnership, error } = await supabase
    .from('partnerships')
    .select('id, invite_email, status, created_at')
    .eq('invite_token', token)
    .single();

  if (error || !partnership) {
    return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
  }

  return NextResponse.json({
    id: partnership.id,
    inviteEmail: partnership.invite_email,
    status: partnership.status,
    createdAt: partnership.created_at,
  });
}
