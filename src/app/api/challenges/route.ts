import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

const mockChallenges: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnershipId, challengeId, status, reflection } = body;

    if (status === 'completed') {
      // Mark challenge as completed
      const entry = {
        id: `cp_${Date.now()}`,
        partnership_id: partnershipId || 'mock',
        challenge_id: challengeId,
        status: 'completed',
        reflection: reflection || '',
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
        mockChallenges.push(entry);
        return NextResponse.json({ success: true, challenge: entry });
      }

      const { createServerClient } = await import('@/lib/supabase/server');
      const supabase = createServerClient();
      const { data, error } = await supabase.from('challenge_progress').insert(entry).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, challenge: data });
    }

    // Start a new challenge
    const entry = {
      id: `cp_${Date.now()}`,
      partnership_id: partnershipId || 'mock',
      challenge_id: challengeId,
      status: 'active',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
      mockChallenges.push(entry);
      return NextResponse.json({ success: true, challenge: entry });
    }

    const { createServerClient } = await import('@/lib/supabase/server');
    const supabase = createServerClient();
    const { data, error } = await supabase.from('challenge_progress').insert(entry).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, challenge: data });
  } catch (error: any) {
    console.error('Challenge error:', error);
    return NextResponse.json({ error: error.message || 'Challenge operation failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnershipId = searchParams.get('partnershipId') || 'mock';

    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
      const filtered = mockChallenges.filter(c => c.partnership_id === partnershipId);
      return NextResponse.json({ success: true, challenges: filtered });
    }

    const { createServerClient } = await import('@/lib/supabase/server');
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, challenges: data || [] });
  } catch (error: any) {
    console.error('Challenges fetch error:', error);
    return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 });
  }
}
