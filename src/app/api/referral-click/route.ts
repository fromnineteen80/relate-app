import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { service, affiliateUrl, userId } = await request.json();

    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
      return NextResponse.json({ tracked: true });
    }

    const supabase = createServerClient();
    await supabase.from('referral_clicks').insert({
      user_id: userId,
      service,
      affiliate_url: affiliateUrl,
    });

    return NextResponse.json({ tracked: true });
  } catch (error: unknown) {
    console.error('Referral tracking error:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
