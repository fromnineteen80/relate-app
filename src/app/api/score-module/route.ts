import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const questionsModule = require('../../../../relate_questions.js');
const personaModule = require('../../../../relate_persona_definitions.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module: moduleNumber, gender, responses, m1Responses, m3Responses } = body;
    const genderArg = gender === 'M' ? 'male' : 'female';

    switch (moduleNumber) {
      case 1: {
        const m1Result = questionsModule.scoreModule1(genderArg, responses);
        // Get pole names for this gender
        const poles = gender === 'M' ? questionsModule.MEN_POLES : questionsModule.WOMEN_POLES;
        return NextResponse.json({
          success: true,
          result: m1Result,
          poles,
        });
      }

      case 2: {
        const m2Result = questionsModule.scoreModule2(genderArg, responses);
        const personaCode = m2Result?.code || 'BDFH';
        // Get persona metadata
        const personaMetadata = gender === 'M'
          ? personaModule.M2_PERSONA_METADATA?.[personaCode]
          : personaModule.W2_PERSONA_METADATA?.[personaCode];
        // Get M2 poles for this gender
        const m2Poles = gender === 'M' ? questionsModule.MEN_M2_POLES : questionsModule.WOMEN_W2_POLES;
        // Score M1 for comparison if responses provided
        let m1Result = null;
        if (m1Responses && Object.keys(m1Responses).length > 0) {
          try {
            m1Result = questionsModule.scoreModule1(genderArg, m1Responses);
          } catch { /* skip if M1 scoring fails */ }
        }
        return NextResponse.json({
          success: true,
          result: m2Result,
          personaMetadata: personaMetadata || null,
          m2Poles,
          m1Result,
          m1Poles: gender === 'M' ? questionsModule.MEN_POLES : questionsModule.WOMEN_POLES,
        });
      }

      case 3: {
        const m3Result = questionsModule.scoreModule3(genderArg, responses);
        // Attempt partial attentiveness (without M4 data)
        let attentiveness = null;
        try {
          attentiveness = questionsModule.scoreAttentiveness(
            responses, genderArg, m3Result, null, 0
          );
        } catch { /* attentiveness needs M4 data for full score */ }
        return NextResponse.json({
          success: true,
          result: m3Result,
          attentiveness,
        });
      }

      case 4: {
        const m4Result = questionsModule.scoreModule4(genderArg, responses);
        // Score attentiveness with M3 data if available
        let attentiveness = null;
        if (m3Responses && Object.keys(m3Responses).length > 0) {
          try {
            const m3Result = questionsModule.scoreModule3(genderArg, m3Responses);
            const allResponses = { ...m3Responses, ...responses };
            attentiveness = questionsModule.scoreAttentiveness(
              allResponses, genderArg, m3Result,
              m4Result?.gottmanScreener?.horsemen || m4Result?.gottmanScreener,
              0
            );
          } catch { /* skip */ }
        }
        return NextResponse.json({
          success: true,
          result: m4Result,
          attentiveness,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid module' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Module scoring error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Scoring failed' }, { status: 500 });
  }
}
