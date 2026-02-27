import { NextRequest, NextResponse } from 'next/server';
import { RELATE_SYSTEM_PROMPT, RELATE_MODELS, RELATE_MAX_TOKENS } from '@/lib/prompts/relate-system';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true';

  try {
    const body = await request.json();
    const { userData, gender, demographics } = body;

    if (!userData) {
      return NextResponse.json({ error: 'userData is required' }, { status: 400 });
    }

    if (useMock) {
      return NextResponse.json({
        success: true,
        report: {
          executiveSummary: `As a ${userData.persona?.name || 'your persona'}, your assessment reveals a clear pattern: you know what you want, and your self-awareness is higher than most. Your Module 1 preferences and Module 2 persona show ${userData.m1?.code === userData.m2?.code ? 'strong alignment - you want what you naturally offer' : 'interesting tension between what you seek and who you are'}. Your connection style (M3) and conflict patterns (M4) complete a picture of someone who ${userData.m3?.wantScore > userData.m3?.offerScore ? 'wants more than they give - not selfish, just clear about needs' : 'gives generously, sometimes at their own expense'}. This report walks through every dimension of your relational self.`,
          personaSection: `You are the ${userData.persona?.name || 'Unknown'} (${userData.persona?.code || '-'}). ${userData.persona?.traits || 'Your traits define how you show up in relationships.'}`,
          m1DeepDive: 'Your preferences across the four dimensions reveal what you instinctively seek in a partner. These aren\'t aspirational - they\'re the patterns your assessment captured.',
          m3DeepDive: `Your Want Score of ${userData.m3?.wantScore || '-'} and Offer Score of ${userData.m3?.offerScore || '-'} tell a story about how you exchange intimacy and access.`,
          m4DeepDive: `Your conflict approach is ${userData.m4?.conflictApproach?.approach || 'not yet assessed'}. Your primary emotional driver is ${userData.m4?.emotionalDrivers?.primary || 'not yet assessed'}.`,
          matches: 'Your compatibility rankings are based on persona alignment, dimension matching, connection style fit, and conflict compatibility.',
          growthPath: 'Your growth path focuses on the areas where self-awareness can translate into better relationship outcomes.',
          generatedAt: new Date().toISOString(),
        },
      });
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: RELATE_MODELS.report,
      max_tokens: RELATE_MAX_TOKENS.report,
      system: RELATE_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate the full RELATE report for this user.

USER DATA:
${JSON.stringify(userData, null, 2)}

GENDER: ${gender || userData.gender || 'unknown'}
DEMOGRAPHICS: ${JSON.stringify(demographics || userData.demographics || {}, null, 2)}

Generate all sections following the report structure: Executive Summary, Your Persona, What You Want (M1 Deep Dive), How You Connect (M3 Deep Dive), When Things Get Hard (M4 Deep Dive), Your 16 Matches, and Growth Path.`,
      }],
    });

    const content = response.content[0]?.text || '';

    return NextResponse.json({
      success: true,
      report: {
        content,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Report generation failed' },
      { status: 500 },
    );
  }
}
