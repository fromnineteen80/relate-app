import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, category, message } = await request.json();

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const categoryLabel = category || 'General';
    const htmlBody = `
      <h2>RELATE Feedback</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${firstName} ${lastName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: bold;">Category</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${categoryLabel}</td>
        </tr>
      </table>
      <h3 style="margin-top: 24px;">Message</h3>
      <div style="padding: 16px; background: #f9f9f9; border-radius: 4px; white-space: pre-wrap;">${message}</div>
    `;

    await resend.emails.send({
      from: 'RELATE <noreply@relate.app>',
      to: 'colin@colinmaynard.net',
      replyTo: email,
      subject: 'Re: Relate Feedback',
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Feedback email error:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback' },
      { status: 500 },
    );
  }
}
