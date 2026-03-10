import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const attachmentScoringModule = require('../../../../../relate_attachment_scoring.js');
const personaModule = require('../../../../../relate_persona_definitions.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responses, personaCode, personaName, gender } = body;

    if (!responses || !personaCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: responses and personaCode are required' },
        { status: 400 }
      );
    }

    // Look up persona metadata from definitions
    const personaMetadata = gender === 'M'
      ? personaModule.M2_PERSONA_METADATA?.[personaCode]
      : personaModule.W2_PERSONA_METADATA?.[personaCode];

    // Build assessment results object expected by scoreAttachmentSession
    const assessmentResults = {
      personaCode,
      personaName: personaName || personaMetadata?.name || personaCode,
      attachmentType: responses.attachmentType || 'unknown',
      gender,
    };

    // Score all quadrants
    const scoringResult = attachmentScoringModule.scoreAttachmentSession(responses, assessmentResults);

    return NextResponse.json({
      success: true,
      result: scoringResult,
      personaMetadata: personaMetadata || null,
    });
  } catch (error: any) {
    console.error('Blueprint scoring error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Scoring failed' },
      { status: 500 }
    );
  }
}
