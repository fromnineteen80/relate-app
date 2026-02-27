import { NextRequest, NextResponse } from 'next/server';
import { generateCouplesReport } from '@/lib/couples';

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

    // Generate the 7-section couples report
    const couplesReport = generateCouplesReport(user1Results, user2Results);

    return NextResponse.json({
      success: true,
      report: {
        ...couplesReport,
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
