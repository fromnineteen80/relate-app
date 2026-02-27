import { NextRequest, NextResponse } from 'next/server';
import { RELATE_SYSTEM_PROMPT, RELATE_MODELS, RELATE_MAX_TOKENS } from '@/lib/prompts/relate-system';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

// Build dynamic user context to append after the shared system prompt
function buildAdvisorContext(body: any): string {
  const { persona, results, mode, couplesReport, partnerPersona, locationContext, progress, userData } = body;

  let context = `

## ADVISOR MODE — Additional Context

Only reference scores explicitly provided below. Never invent data you don't have.

`;

  // Location awareness
  if (locationContext) {
    context += `## Current Location\n${locationContext}\n\n`;
  }

  // Demographics
  if (userData?.demographics) {
    const d = userData.demographics;
    context += `## Demographics\n`;
    if (userData.gender) context += `- Gender: ${userData.gender === 'M' ? 'Man' : 'Woman'}\n`;
    if (d.age) context += `- Age: ${d.age}\n`;
    if (d.relationshipStatus) context += `- Relationship status: ${d.relationshipStatus}\n`;
    if (d.seeking) context += `- Seeking: ${d.seeking}\n`;
    context += '\n';
  }

  // Module 1 data
  if (progress?.m1Complete && userData?.m1) {
    const m1 = userData.m1;
    context += `## Module 1 Complete — What They Want\n`;
    if (m1.dimensions) {
      for (const [dim, data] of Object.entries(m1.dimensions) as [string, any][]) {
        if (data?.assignedPole) {
          context += `- ${dim}: ${data.assignedPole} (${data.strength || '?'}% strength)\n`;
        }
      }
    }
    if (m1.code) context += `- M1 Code: ${m1.code}\n`;
    if (m1.keyDriver) context += `- Key Driver: ${typeof m1.keyDriver === 'string' ? m1.keyDriver : m1.keyDriver?.dimension || 'N/A'}\n`;
    context += '\n';
  }

  // Module 2 data
  if (progress?.m2Complete && userData?.m2) {
    const m2 = userData.m2;
    context += `## Module 2 Complete — Who They Are\n`;
    if (m2.persona || m2.personaMetadata) {
      const p = m2.personaMetadata || m2.persona || {};
      context += `- Persona: ${p.name || persona?.name || 'Unknown'} (${m2.code || persona?.code || '—'})\n`;
      if (p.traits) context += `- Traits: ${p.traits}\n`;
    }
    if (m2.dimensions) {
      for (const [dim, data] of Object.entries(m2.dimensions) as [string, any][]) {
        if (data?.assignedPole) {
          context += `- ${dim}: ${data.assignedPole} (${data.strength || '?'}% strength)\n`;
        }
      }
    }
    // M1 vs M2 tensions
    if (userData?.m1?.dimensions && m2.dimensions) {
      const tensions: string[] = [];
      for (const dim of ['physical', 'social', 'lifestyle', 'values']) {
        const m1Pole = userData.m1.dimensions[dim]?.assignedPole;
        const m2Pole = m2.dimensions[dim]?.assignedPole;
        if (m1Pole && m2Pole && m1Pole !== m2Pole) {
          tensions.push(`${dim}: wants ${m1Pole} but is ${m2Pole}`);
        }
      }
      if (tensions.length > 0) {
        context += `\n**M1 vs M2 Tensions (what they want vs who they are):**\n`;
        tensions.forEach(t => context += `- ${t}\n`);
      }
    }
    context += '\n';
  }

  // Module 3 data
  if (progress?.m3Complete && userData?.m3) {
    const m3 = userData.m3;
    context += `## Module 3 Complete — How They Connect\n`;
    if (m3.wantScore != null) context += `- Want Score: ${m3.wantScore}/100 (how much differentiated access they seek)\n`;
    if (m3.offerScore != null) context += `- Offer Score: ${m3.offerScore}/100 (how much they give)\n`;
    if (m3.wantScore != null && m3.offerScore != null) {
      const gap = m3.wantScore - m3.offerScore;
      context += `- Gap: ${gap > 10 ? 'Wants more than offers' : gap < -10 ? 'Offers more than wants' : 'Balanced'}\n`;
    }
    if (m3.typeName) context += `- Context-Switching Type: ${m3.typeName}\n`;
    if (m3.typeDescription) context += `- Description: ${m3.typeDescription}\n`;
    context += '\n';
  }

  // Module 4 data
  if (progress?.m4Complete && userData?.m4) {
    const m4 = userData.m4;
    context += `## Module 4 Complete — Conflict Profile\n`;
    const approach = m4.conflictApproach?.approach || m4.summary?.approach;
    const driver = m4.emotionalDrivers?.primary || m4.summary?.primaryDriver;
    const repairSpeed = m4.repairRecovery?.speed?.style || m4.summary?.repairSpeed;
    const repairMode = m4.repairRecovery?.mode?.style || m4.summary?.repairMode;
    const capacity = m4.emotionalCapacity?.level || m4.summary?.capacity;

    if (approach) context += `- Conflict Approach: ${approach}\n`;
    if (driver) context += `- Primary Emotional Driver: ${driver}\n`;
    if (m4.emotionalDrivers?.secondary) context += `- Secondary Driver: ${m4.emotionalDrivers.secondary}\n`;
    if (repairSpeed) context += `- Repair Speed: ${repairSpeed}\n`;
    if (repairMode) context += `- Repair Mode: ${repairMode}\n`;
    if (capacity) context += `- Emotional Capacity: ${capacity}\n`;

    const gottman = m4.gottmanScreener?.horsemen || m4.gottmanScores;
    if (gottman) {
      context += `\n**Gottman Risk Scores:**\n`;
      for (const [h, score] of Object.entries(gottman) as [string, any][]) {
        const numScore = typeof score === 'number' ? score : 0;
        const risk = numScore > 14 ? ' [HIGH RISK]' : numScore > 10 ? ' [moderate]' : '';
        context += `- ${h}: ${numScore}${risk}\n`;
      }
    }
    context += '\n';
  }

  // Full results
  if (progress?.resultsComplete && results) {
    context += `## Full Results Available\n`;
    if (results.persona) {
      context += `- Persona: ${results.persona.name} (${results.persona.code})\n`;
      if (results.persona.traits) context += `- Traits: ${results.persona.traits}\n`;
    }
    if (results.matches?.length > 0) {
      context += `\n**Top 3 Matches:**\n`;
      results.matches.slice(0, 3).forEach((m: any, i: number) => {
        context += `${i + 1}. ${m.name} (${m.tier}) — ${m.compatibilityScore}%\n`;
      });
    }
    context += '\n';
  }

  // Couples mode context
  if (mode === 'couples' && couplesReport) {
    const overview = couplesReport.overview || {};
    const conflict = couplesReport.conflictChoreography || {};
    const repair = couplesReport.repairCompatibility || {};
    const ceilingFloor = couplesReport.ceilingFloor || {};

    context += `## Couples Data — TOGETHER Mode (speaking to both partners)\n`;
    context += `**Partner 1:** ${overview.user1?.name || 'Partner 1'} (${overview.user1?.code || '—'})\n`;
    context += `**Partner 2:** ${overview.user2?.name || 'Partner 2'} (${overview.user2?.code || '—'})\n`;
    context += `**Pairing:** ${overview.archetype?.name || 'N/A'} (Score: ${overview.overallScore || '—'})\n`;
    context += `**Alignment:** ${overview.alignmentPercent || '—'}% | M3 Compat: ${overview.m3Compat || '—'}% | M4 Compat: ${overview.m4Compat || '—'}%\n`;
    context += `**Conflict Dynamic:** ${conflict.dynamic?.label || 'N/A'} — ${conflict.dynamic?.description || ''}\n`;
    context += `**Drivers:** ${conflict.driverAnalysis?.user1Driver || '—'} vs ${conflict.driverAnalysis?.user2Driver || '—'}${conflict.driverAnalysis?.collision ? ' [COLLISION]' : ''}\n`;
    context += `**Repair Compat:** Speed match: ${repair.repair?.speedMatch ? 'Yes' : 'No'}, Mode match: ${repair.repair?.modeMatch ? 'Yes' : 'No'}\n`;
    context += `**Gottman Risk:** ${repair.overallRisk || 'N/A'}\n`;
    context += `**Ceiling/Floor:** ${ceilingFloor.ceiling || '—'}/${ceilingFloor.floor || '—'} (Current: ${ceilingFloor.current || '—'})\n\n`;
    context += `Address both partners. Be balanced — don't take sides. Provide concrete exercises and conversation prompts.\n\n`;

  } else if (mode === 'individual' && couplesReport) {
    const overview = couplesReport.overview || {};
    const conflict = couplesReport.conflictChoreography || {};

    context += `## Couples Data — INDIVIDUAL Mode (speaking to one partner about the relationship)\n`;
    context += `**User:** ${persona?.name || 'User'} (${persona?.code || '—'})\n`;
    context += `**Partner:** ${partnerPersona?.name || 'Partner'} (${partnerPersona?.code || '—'})\n`;
    context += `**Pairing:** ${overview.archetype?.name || 'N/A'} (Score: ${overview.overallScore || '—'})\n`;
    context += `**Conflict Dynamic:** ${conflict.dynamic?.label || 'N/A'}\n\n`;
    context += `Focus on what THIS person can do. Don't blame the partner. Be direct and actionable.\n\n`;
  }

  return context;
}

export async function POST(request: NextRequest) {
  const useMockAdvisor = process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true';
  const body = await request.json();
  const { message, history, persona, mode, couplesReport, partnerPersona, progress, userData } = body;

  const isCouplesMode = mode === 'couples' || mode === 'individual';

  if (useMockAdvisor) {
    const personaName = persona?.name || userData?.m2?.personaMetadata?.name || 'your persona';
    const partnerName = partnerPersona?.name || couplesReport?.overview?.user2?.name || 'your partner';

    if (isCouplesMode) {
      const couplesResponses = [
        `As a ${personaName} paired with ${partnerName}, your key dynamic is the balance between what you each bring to connection. ${couplesReport?.conflictChoreography?.dynamic?.label ? `Your ${couplesReport.conflictChoreography.dynamic.label} conflict pattern` : 'Your conflict pattern'} means you need to be especially mindful of how you initiate difficult conversations.`,
        `Your conflict choreography shows a ${couplesReport?.conflictChoreography?.dynamic?.label || 'distinctive'} pattern. This isn't inherently good or bad — it's about awareness. When you notice the pattern starting, name it: "I think we're doing our thing." That alone can interrupt the cycle.`,
        "Looking at your repair compatibility, the most impactful thing you can practice is signaling. When you need space to process, tell your partner: 'I need 20 minutes, but I'm coming back.' This prevents withdrawal from being read as abandonment.",
        `Your ceiling-floor analysis shows ${couplesReport?.ceilingFloor?.growthPotential || 'meaningful'} points of growth potential. The areas with the most leverage are your shared challenges — completing them together builds both the relationship and your individual awareness.`,
      ];
      const idx = (history?.length || 0) % couplesResponses.length;
      return NextResponse.json({ response: couplesResponses[idx] });
    }

    // Context-aware individual mock responses
    let responses: string[];

    if (progress?.m4Complete || userData?.m4) {
      const m4 = userData?.m4 || {};
      const approach = m4.conflictApproach?.approach || m4.summary?.approach || 'your approach';
      const driver = m4.emotionalDrivers?.primary || m4.summary?.primaryDriver || 'your driver';
      responses = [
        `Based on your ${personaName} profile, I'd suggest focusing on your conflict repair patterns. Your ${approach} approach and ${driver} driver shape how you navigate disagreements. Understanding this pattern is the first step to changing it.`,
        `Your connection style scores suggest ${userData?.m3?.wantScore > userData?.m3?.offerScore ? 'you want more than you offer' : 'you offer more than you ask for'}. ${userData?.m3?.wantScore > userData?.m3?.offerScore ? "This isn't selfish — it's clarity about your needs. The work is finding someone who naturally gives at your level." : 'This generosity is a strength, but watch for resentment building if the balance stays skewed too long.'}`,
        "Looking at your compatibility rankings, your top matches share your values dimension. This is significant — values alignment predicts long-term satisfaction more reliably than physical or social chemistry.",
        `Your Gottman scores are worth paying attention to. ${m4.gottmanScreener?.primary ? `Your highest area is ${m4.gottmanScreener.primary}` : 'The area to watch is defensiveness'} — even moderate scores here can escalate conflicts. Try acknowledging your partner's perspective before explaining yours.`,
      ];
    } else if (progress?.m2Complete || userData?.m2) {
      responses = [
        `Your ${personaName} persona reveals interesting tensions in who you are versus what you want. This gap isn't a flaw — it's where your growth edge lives. The question is whether you lean into who you are or chase what you want.`,
        "You're still in the assessment, so I don't have your full profile yet. But based on what I can see, you have strong self-awareness in how you describe yourself. That's a genuine asset in relationships.",
        "Finishing Modules 3 and 4 will give us much more to work with — your connection style and conflict patterns are where the real coaching insights emerge.",
      ];
    } else if (progress?.m1Complete || userData?.m1) {
      responses = [
        "Your Module 1 results show clear preferences. The strength of your convictions matters — strong preferences make matching more precise but narrow the pool. Moderate preferences increase options but may mean more compromise.",
        "You're early in the assessment — complete Module 2 to discover your persona, which is where the real insights begin.",
        "Keep answering honestly, not aspirationally. The assessment works best when it captures who you actually are, not who you wish you were.",
      ];
    } else {
      responses = [
        "Welcome to RELATE. I'm here to help as you work through the assessment. Feel free to ask if any question feels confusing or uncomfortable — that's often where the most important data lives.",
        "The assessment is designed to capture your actual patterns, not your ideal self. Answer with your gut — overthinking tends to introduce noise.",
        "Take your time. There are no wrong answers, and you can always come back to me if something feels off.",
      ];
    }

    const idx = (history?.length || 0) % responses.length;
    return NextResponse.json({ response: responses[idx] });
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userContext = buildAdvisorContext(body);
    const systemPrompt = RELATE_SYSTEM_PROMPT + userContext;

    const messages = [
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: RELATE_MODELS.advisor,
      max_tokens: RELATE_MAX_TOKENS.advisor,
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
