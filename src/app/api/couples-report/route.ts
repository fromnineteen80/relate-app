import { NextRequest, NextResponse } from 'next/server';
import { generateCouplesReport } from '@/lib/couples';
import { RELATE_SYSTEM_PROMPT, RELATE_MODELS, RELATE_MAX_TOKENS } from '@/lib/prompts/relate-system';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const questionsModule = require('../../../../relate_questions.js');
const frameworksModule = require('../../../../relate_frameworks.js');

function scoreUserResults(gender: string, m1Responses: any, m2Responses: any, m3Responses: any, m4Responses: any, demographics: any) {
  const genderArg = gender === 'M' ? 'male' : 'female';

  const m1Result = questionsModule.scoreModule1(genderArg, m1Responses);
  const m2Result = questionsModule.scoreModule2(genderArg, m2Responses);
  const m3Result = questionsModule.scoreModule3(genderArg, m3Responses);
  const m4Result = questionsModule.scoreModule4(genderArg, m4Responses);

  const allResponses = { ...m1Responses, ...m2Responses, ...m3Responses, ...m4Responses };
  let attentiveness = null;
  try {
    attentiveness = questionsModule.scoreAttentiveness(
      allResponses, genderArg, m3Result, m4Result?.gottmanScreener || m4Result?.gottmanScores, m2Result?.overallSelfPerceptionGap || 0
    );
  } catch { /* optional */ }

  let tensionStacks = null;
  try {
    tensionStacks = frameworksModule.computeAllTensionStacks(m1Result, m2Result, m3Result, m4Result, demographics || {}, genderArg);
  } catch { /* optional */ }

  const personaModule = require('../../../../relate_persona_definitions.js');
  const personaCode = m2Result?.code || m2Result?.personaCode || 'BDFH';
  const personaMetadata = gender === 'M'
    ? personaModule.M2_PERSONA_METADATA?.[personaCode]
    : personaModule.W2_PERSONA_METADATA?.[personaCode];

  return {
    gender,
    personaCode,
    persona: {
      code: personaCode,
      name: personaMetadata?.name || personaCode,
      traits: personaMetadata?.traits || '',
    },
    m1: m1Result,
    m2: m2Result,
    m3: m3Result,
    m4: m4Result,
    attentiveness,
    tensionStacks,
    demographics,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user1, user2 } = body;

    if (!user1 || !user2) {
      return NextResponse.json({ error: 'Both user1 and user2 data required' }, { status: 400 });
    }

    // If pre-scored results are provided, use them directly
    let user1Results: any;
    let user2Results: any;

    if (user1.report) {
      // Already scored (from localStorage)
      user1Results = { ...user1.report, gender: user1.gender };
    } else {
      // Score from raw responses
      user1Results = scoreUserResults(
        user1.gender, user1.m1Responses, user1.m2Responses, user1.m3Responses, user1.m4Responses, user1.demographics
      );
    }

    if (user2.report) {
      user2Results = { ...user2.report, gender: user2.gender };
    } else {
      user2Results = scoreUserResults(
        user2.gender, user2.m1Responses, user2.m2Responses, user2.m3Responses, user2.m4Responses, user2.demographics
      );
    }

    // Generate tension stack compatibility if both have stacks
    let tensionCompatibility = null;
    try {
      if (user1Results.tensionStacks && user2Results.tensionStacks) {
        tensionCompatibility = frameworksModule.computeAllTensionStackCompatibilities(
          user1Results.tensionStacks, user2Results.tensionStacks
        );
      }
    } catch { /* optional */ }

    // Generate parallels analysis
    let parallels = null;
    try {
      parallels = frameworksModule.calculateParallels(user1Results.m1, user2Results.m1);
    } catch { /* optional */ }

    // Generate the 7-section couples report (computed data)
    const couplesReport = generateCouplesReport(user1Results, user2Results);

    // Generate AI narrative for the couples report
    let aiNarrative: string | null = null;
    const useMock = process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true';

    if (useMock) {
      const u1Name = user1Results.persona?.name || 'Partner 1';
      const u2Name = user2Results.persona?.name || 'Partner 2';
      aiNarrative = `The ${u1Name} and ${u2Name} pairing brings together two distinct relational profiles. Your overall compatibility score of ${couplesReport.overview?.overallScore || '—'} reflects ${couplesReport.overview?.archetype?.name === 'Natural Partners' ? 'strong natural alignment' : 'areas of both harmony and productive tension'}. ${couplesReport.conflictChoreography?.dynamic?.description || 'Your conflict dynamic shapes how you navigate disagreements.'} The data suggests focusing on ${couplesReport.repairCompatibility?.highRiskHorsemen?.length > 0 ? 'your Gottman risk areas' : 'deepening your communication patterns'} as the highest-leverage growth area for this relationship.`;
    } else {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const response = await anthropic.messages.create({
          model: RELATE_MODELS.couplesReport,
          max_tokens: RELATE_MAX_TOKENS.couplesReport,
          system: RELATE_SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Generate the couples compatibility report.

PARTNER 1:
${JSON.stringify({ gender: user1Results.gender, persona: user1Results.persona, m1: user1Results.m1, m2: user1Results.m2, m3: user1Results.m3, m4: user1Results.m4, demographics: user1Results.demographics }, null, 2)}

PARTNER 2:
${JSON.stringify({ gender: user2Results.gender, persona: user2Results.persona, m1: user2Results.m1, m2: user2Results.m2, m3: user2Results.m3, m4: user2Results.m4, demographics: user2Results.demographics }, null, 2)}

COMPUTED REPORT DATA:
${JSON.stringify(couplesReport, null, 2)}

Generate all 8 sections of the couples report as flowing prose narrative.`,
          }],
        });

        aiNarrative = response.content[0]?.text || null;
      } catch (err) {
        console.error('AI narrative generation failed, returning data-only report:', err);
      }
    }

    return NextResponse.json({
      success: true,
      report: {
        ...couplesReport,
        aiNarrative,
        tensionCompatibility,
        frameworkParallels: parallels,
        user1Summary: {
          code: user1Results.personaCode || user1Results.persona?.code,
          name: user1Results.persona?.name,
          gender: user1Results.gender,
        },
        user2Summary: {
          code: user2Results.personaCode || user2Results.persona?.code,
          name: user2Results.persona?.name,
          gender: user2Results.gender,
        },
      },
    });
  } catch (error: any) {
    console.error('Couples report error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Report generation failed' }, { status: 500 });
  }
}
