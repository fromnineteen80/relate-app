import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const attachmentScoringModule = require('../../../../../relate_attachment_scoring.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprintResults, blueprintReport, assessmentResults, personaMetadata } = body;

    if (!blueprintResults || !blueprintReport || !assessmentResults || !personaMetadata) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: blueprintResults, blueprintReport, assessmentResults, and personaMetadata are required' },
        { status: 400 }
      );
    }

    // generateGrowthPlan builds the structured growth plan input.
    // If it is not yet fully wired to Claude, it returns a parts-structured
    // object that can be used as a placeholder.
    let growthPlan;
    try {
      growthPlan = attachmentScoringModule.generateGrowthPlan(
        blueprintResults,
        blueprintReport,
        assessmentResults,
        personaMetadata
      );
    } catch {
      // Stub fallback: return structured placeholder parts
      growthPlan = {
        parts: {
          whatDeepDiveAdds: { partNumber: 1, status: 'pending', content: null },
          reflectionPrompts: { partNumber: 2, status: 'pending', content: null },
          specificWork: { partNumber: 3, status: 'pending', content: null },
          whatToWatchFor: { partNumber: 4, status: 'pending', content: null },
        },
        metadata: {
          personaCode: assessmentResults.personaCode,
          generatedAt: new Date().toISOString(),
          stubbed: true,
        },
      };
    }

    return NextResponse.json({
      success: true,
      growthPlan,
    });
  } catch (error: any) {
    console.error('Blueprint growth plan generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Growth plan generation failed' },
      { status: 500 }
    );
  }
}
