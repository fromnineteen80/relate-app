import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const useMockAdvisor = process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true';
  const body = await request.json();
  const { message, history, persona, results } = body;

  if (useMockAdvisor) {
    const responses = [
      `Based on your ${persona?.name || 'persona'} profile, I'd suggest focusing on your conflict repair patterns. Your tendency toward slow repair could be an asset — it means you process deeply — but it may frustrate partners who need quicker resolution.`,
      "Your connection style scores suggest you offer more than you ask for. This generosity is a strength, but watch for resentment building if the balance stays skewed too long.",
      "Looking at your compatibility rankings, your top matches share your values dimension. This is significant — values alignment predicts long-term satisfaction more reliably than physical or social chemistry.",
      "Your Gottman scores are in a healthy range. The area to watch is defensiveness — even moderate scores here can escalate conflicts. Try acknowledging your partner's perspective before explaining yours.",
    ];
    const idx = (history?.length || 0) % responses.length;
    return NextResponse.json({ response: responses[idx] });
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `You are RELATE Advisor. The user is a ${persona?.name || 'persona type'} (${persona?.code || '—'}).

**Traits:** ${persona?.traits || 'N/A'}

${results?.m4?.summary ? `**Conflict Profile:** ${results.m4.summary.approach} approach, ${results.m4.summary.primaryDriver} driver, ${results.m4.summary.repairSpeed}/${results.m4.summary.repairMode} repair` : ''}

Provide specific, actionable advice referencing their persona traits. Be direct, data-informed, and concise. Avoid platitudes.`;

    const messages = [
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    return NextResponse.json({
      response: response.content[0]?.text || 'No response generated.',
    });
  } catch (error: unknown) {
    console.error('Advisor error:', error);
    return NextResponse.json({ error: 'Advisor failed' }, { status: 500 });
  }
}
