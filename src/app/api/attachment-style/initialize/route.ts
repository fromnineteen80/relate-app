import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const attachmentQuestionsModule = require('../../../../../relate_attachment_questions.js');
const personaModule = require('../../../../../relate_persona_definitions.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personaCode, personaName, attachmentType, gender } = body;

    if (!personaCode || !attachmentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: personaCode and attachmentType are required' },
        { status: 400 }
      );
    }

    // Look up persona metadata from definitions
    const personaMetadata = gender === 'M'
      ? personaModule.M2_PERSONA_METADATA?.[personaCode]
      : personaModule.W2_PERSONA_METADATA?.[personaCode];

    // Get attachment questions with persona context
    const questions = attachmentQuestionsModule.getAttachmentQuestions({
      personaCode,
      personaMetadata: personaMetadata || {},
      personaName: personaName || personaMetadata?.name || personaCode,
      attachmentType,
    });

    return NextResponse.json({
      success: true,
      questions,
      sessionConfig: {
        personaCode,
        personaName: personaName || personaMetadata?.name || personaCode,
        attachmentType,
        gender,
      },
    });
  } catch (error: any) {
    console.error('Attachment style initialize error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize attachment style session' },
      { status: 500 }
    );
  }
}
