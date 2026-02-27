import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const inviteUrl = `${process.env.NEXT_PUBLIC_URL}/auth/invite/${token}`;

    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
      return NextResponse.json({ success: true, token, inviteUrl });
    }

    const supabase = createServerClient();
    const { error: dbError } = await supabase.from('partnerships').insert({
      user1_id: userId,
      invite_email: email,
      invite_token: token,
    });

    if (dbError) throw dbError;

    // Send email via Resend API if configured
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'RELATE <noreply@relate.app>',
            to: email,
            subject: 'You\'ve been invited to RELATE',
            html: `<p>Someone special has invited you to take the RELATE assessment.</p><p><a href="${inviteUrl}">Accept Invitation</a></p>`,
          }),
        });
      } catch {
        console.warn('Failed to send email, skipping');
      }
    }

    return NextResponse.json({ success: true, token, inviteUrl });
  } catch (error: unknown) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 });
  }
}
