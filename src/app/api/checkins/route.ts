import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Check-in API for growth plan
// In mock mode, stores in-memory; in production, uses Supabase

const mockCheckins: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnershipId, userId, satisfaction, communication, connection, notes } = body;

    const checkin = {
      id: `checkin_${Date.now()}`,
      partnership_id: partnershipId || 'mock',
      user_id: userId || 'mock_user',
      satisfaction: Math.max(1, Math.min(10, satisfaction || 5)),
      communication: Math.max(1, Math.min(10, communication || 5)),
      connection: Math.max(1, Math.min(10, connection || 5)),
      notes: notes || '',
      created_at: new Date().toISOString(),
    };

    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
      mockCheckins.push(checkin);
      return NextResponse.json({ success: true, checkin });
    }

    const { createServerClient } = await import('@/lib/supabase/server');
    const supabase = createServerClient();
    const { data, error } = await supabase.from('checkins').insert(checkin).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, checkin: data });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: error.message || 'Check-in failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnershipId = searchParams.get('partnershipId') || 'mock';

    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
      const filtered = mockCheckins.filter(c => c.partnership_id === partnershipId);
      return NextResponse.json({ success: true, checkins: filtered });
    }

    const { createServerClient } = await import('@/lib/supabase/server');
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false })
      .limit(52);

    if (error) throw error;
    return NextResponse.json({ success: true, checkins: data || [] });
  } catch (error: any) {
    console.error('Checkins fetch error:', error);
    return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 });
  }
}
