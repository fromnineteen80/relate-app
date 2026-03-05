import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * POST /api/partner-lookup
 * Looks up a user by email and creates/activates a partnership between two users.
 *
 * Body: { email: string, userId: string, userEmail: string }
 * - email: the partner's email to look up
 * - userId: the current user's ID
 * - userEmail: the current user's email
 */
export async function POST(request: NextRequest) {
  try {
    const { email, userId, userEmail } = await request.json();

    if (!email || !userId || !userEmail) {
      return NextResponse.json({ error: 'Email, userId, and userEmail are required' }, { status: 400 });
    }

    if (email.toLowerCase() === userEmail.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot add yourself as a partner' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Look up the partner in the users table
    const { data: partnerUser, error: lookupError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('email', email.toLowerCase())
      .single();

    if (lookupError || !partnerUser) {
      return NextResponse.json({ error: 'No account found with that email address. They need to sign up first.' }, { status: 404 });
    }

    // Prevent self-pairing by ID
    if (partnerUser.id === userId) {
      return NextResponse.json({ error: 'You cannot add yourself as a partner' }, { status: 400 });
    }

    // Check if there's already an active partnership between these two users
    const { data: existingPartnership } = await supabase
      .from('partnerships')
      .select('id, status')
      .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerUser.id}),and(user1_id.eq.${partnerUser.id},user2_id.eq.${userId})`)
      .eq('status', 'active')
      .single();

    if (existingPartnership) {
      return NextResponse.json({
        success: true,
        alreadyConnected: true,
        partnershipId: existingPartnership.id,
        partner: {
          id: partnerUser.id,
          email: partnerUser.email,
          firstName: partnerUser.first_name,
          lastName: partnerUser.last_name,
        },
      });
    }

    // Create a new active partnership (direct connection, no invite needed)
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const { data: partnership, error: insertError } = await supabase
      .from('partnerships')
      .insert({
        user1_id: userId,
        user2_id: partnerUser.id,
        invite_email: email.toLowerCase(),
        invite_token: token,
        status: 'active',
        accepted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Partnership insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alreadyConnected: false,
      partnershipId: partnership.id,
      partner: {
        id: partnerUser.id,
        email: partnerUser.email,
        firstName: partnerUser.first_name,
        lastName: partnerUser.last_name,
      },
    });
  } catch (error: unknown) {
    console.error('Partner lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up partner' }, { status: 500 });
  }
}

/**
 * GET /api/partner-lookup?userId=xxx
 * Returns the current user's active partnership info, if any.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ partner: null });
  }

  try {
    const supabase = createServerClient();

    // Find active partnership
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('id, user1_id, user2_id, status, accepted_at, created_at')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!partnership) {
      return NextResponse.json({ partner: null });
    }

    // Get partner's info
    const partnerId = partnership.user1_id === userId ? partnership.user2_id : partnership.user1_id;

    const [{ data: partnerUser }, { data: partnerProgress }] = await Promise.all([
      supabase
        .from('users')
        .select('id, email, first_name, last_name, gender')
        .eq('id', partnerId)
        .single(),
      supabase
        .from('user_progress')
        .select('m1_completed, m2_completed, m3_completed, m4_completed, results, m2_scored')
        .eq('user_id', partnerId)
        .maybeSingle(),
    ]);

    // Extract persona name from partner's results or m2_scored
    let partnerPersonaName: string | null = null;
    let partnerPersonaCode: string | null = null;
    let partnerHasResults = false;
    if (partnerProgress?.results) {
      const r = partnerProgress.results as Record<string, any>;
      partnerPersonaName = r.persona?.name || null;
      partnerPersonaCode = r.persona?.code || null;
      partnerHasResults = true;
    } else if (partnerProgress?.m2_scored) {
      const m2 = partnerProgress.m2_scored as Record<string, any>;
      partnerPersonaName = m2.personaMetadata?.name || null;
      partnerPersonaCode = m2.result?.code || null;
    }

    const assessmentComplete = !!(
      partnerProgress?.m1_completed &&
      partnerProgress?.m2_completed &&
      partnerProgress?.m3_completed &&
      partnerProgress?.m4_completed
    );

    return NextResponse.json({
      partner: partnerUser ? {
        id: partnerUser.id,
        email: partnerUser.email,
        firstName: partnerUser.first_name,
        lastName: partnerUser.last_name,
        gender: partnerUser.gender,
        personaName: partnerPersonaName,
        personaCode: partnerPersonaCode,
        assessmentComplete,
        hasResults: partnerHasResults,
      } : null,
      partnershipId: partnership.id,
      connectedAt: partnership.accepted_at || partnership.created_at,
    });
  } catch (error: unknown) {
    console.error('Partner lookup GET error:', error);
    return NextResponse.json({ partner: null });
  }
}
