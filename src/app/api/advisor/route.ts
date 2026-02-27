import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

export async function POST(request: NextRequest) {
  const useMockAdvisor = process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true';
  const body = await request.json();
  const { message, history, persona, results, mode, couplesReport, partnerPersona } = body;

  const isCouplesMode = mode === 'couples' || mode === 'individual';

  if (useMockAdvisor) {
    if (isCouplesMode) {
      const couplesResponses = [
        `As a ${persona?.name || 'persona'} paired with a ${partnerPersona?.name || 'partner'}, your key dynamic is the balance between what you each bring to connection. Your couple's compatibility suggests focusing on daily rituals that bridge your connection styles.`,
        `Your conflict choreography shows a ${couplesReport?.conflictChoreography?.dynamic?.label || 'distinctive'} pattern. This isn't inherently good or bad — it's about awareness. When you notice the pattern starting, name it: "I think we're doing our thing." That alone can interrupt the cycle.`,
        "Looking at your repair compatibility, the most impactful thing you can practice is signaling. When you need space to process, tell your partner: 'I need 20 minutes, but I'm coming back.' This prevents withdrawal from being read as abandonment.",
        `Your ceiling-floor analysis shows ${couplesReport?.ceilingFloor?.growthPotential || 'meaningful'} points of growth potential. The areas with the most leverage are your shared challenges — completing them together builds both the relationship and your individual awareness.`,
      ];
      const idx = (history?.length || 0) % couplesResponses.length;
      return NextResponse.json({ response: couplesResponses[idx] });
    }

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

    let systemPrompt: string;

    if (isCouplesMode && couplesReport) {
      const overview = couplesReport.overview || {};
      const conflict = couplesReport.conflictChoreography || {};
      const repair = couplesReport.repairCompatibility || {};
      const ceilingFloor = couplesReport.ceilingFloor || {};

      if (mode === 'couples') {
        // Together mode: advice for both partners
        systemPrompt = `You are RELATE Couples Advisor. You are speaking with both partners together.

**Partner 1:** ${overview.user1?.name || 'Partner 1'} (${overview.user1?.code || '—'})
**Partner 2:** ${overview.user2?.name || 'Partner 2'} (${overview.user2?.code || '—'})
**Pairing:** ${overview.archetype?.name || 'N/A'} (Score: ${overview.overallScore || '—'})

**Conflict Dynamic:** ${conflict.dynamic?.label || 'N/A'} — ${conflict.dynamic?.description || ''}
**Emotional Drivers:** ${conflict.driverAnalysis?.user1Driver || '—'} (P1) vs ${conflict.driverAnalysis?.user2Driver || '—'} (P2)${conflict.driverAnalysis?.collision ? ' [DRIVER COLLISION]' : ''}
**Repair:** Speed match: ${repair.repair?.speedMatch ? 'Yes' : 'No'}, Mode match: ${repair.repair?.modeMatch ? 'Yes' : 'No'}
**Overall Risk:** ${repair.overallRisk || 'N/A'}
**Ceiling/Floor:** ${ceilingFloor.ceiling || '—'}/${ceilingFloor.floor || '—'} (Current: ${ceilingFloor.current || '—'})

Address both partners. Reference their specific dynamics. Be balanced — don't take sides. Provide concrete, actionable exercises. Reference their actual scores and patterns. Be direct and data-informed.`;
      } else {
        // Individual mode: advice for one partner about the relationship
        systemPrompt = `You are RELATE Advisor. The user is a ${persona?.name || 'persona type'} (${persona?.code || '—'}) in a relationship with ${partnerPersona?.name || 'their partner'} (${partnerPersona?.code || '—'}).

**Traits:** ${persona?.traits || 'N/A'}
**Pairing:** ${overview.archetype?.name || 'N/A'} (Score: ${overview.overallScore || '—'})

${results?.m4?.summary ? `**User's Conflict Profile:** ${results.m4.summary.approach} approach, ${results.m4.summary.primaryDriver} driver, ${results.m4.summary.repairSpeed}/${results.m4.summary.repairMode} repair` : ''}

**Conflict Dynamic:** ${conflict.dynamic?.label || 'N/A'}
**Overall Risk:** ${repair.overallRisk || 'N/A'}

Provide personalized advice for this individual about their relationship. Reference their specific persona and their partner's persona. Focus on what THIS person can do. Be direct, data-informed, and concise.`;
      }
    } else {
      // Standard individual mode
      systemPrompt = `You are RELATE Advisor. The user is a ${persona?.name || 'persona type'} (${persona?.code || '—'}).

**Traits:** ${persona?.traits || 'N/A'}

${results?.m4?.summary ? `**Conflict Profile:** ${results.m4.summary.approach} approach, ${results.m4.summary.primaryDriver} driver, ${results.m4.summary.repairSpeed}/${results.m4.summary.repairMode} repair` : ''}

Provide specific, actionable advice referencing their persona traits. Be direct, data-informed, and concise. Avoid platitudes.`;
    }

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
