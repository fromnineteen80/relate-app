import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const attachmentScoringModule = require('../../../../../relate_attachment_scoring.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      partner1AttachmentResults,
      partner2AttachmentResults,
      partner1AssessmentResults,
      partner2AssessmentResults,
    } = body;

    if (
      !partner1AttachmentResults ||
      !partner2AttachmentResults ||
      !partner1AssessmentResults ||
      !partner2AssessmentResults
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: partner1AttachmentResults, partner2AttachmentResults, partner1AssessmentResults, and partner2AssessmentResults are all required',
        },
        { status: 400 }
      );
    }

    let overlay;
    try {
      overlay = attachmentScoringModule.generateCouplesOverlay(
        partner1AttachmentResults,
        partner2AttachmentResults,
        partner1AssessmentResults,
        partner2AssessmentResults
      );
    } catch {
      // Stub fallback: return structured placeholder sections
      overlay = {
        sections: {
          systemYouHaveBuilt: {
            sectionNumber: 1,
            wordRange: { min: 250, max: 300 },
            status: 'pending',
            content: null,
          },
          emotionCollision: {
            sectionNumber: 2,
            wordRange: { min: 300, max: 350 },
            status: 'pending',
            content: null,
          },
          gapBetweenYou: {
            sectionNumber: 3,
            wordRange: { min: 250, max: 300 },
            status: 'pending',
            content: null,
          },
          whatYouMakePossible: {
            sectionNumber: 4,
            wordRange: { min: 150, max: 200 },
            status: 'pending',
            content: null,
          },
          whatBothAreAskedToUnderstand: {
            sectionNumber: 5,
            wordRange: { min: 250, max: 300 },
            status: 'pending',
            content: null,
          },
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          stubbed: true,
        },
      };
    }

    return NextResponse.json({
      success: true,
      overlay,
    });
  } catch (error: any) {
    console.error('Attachment style couples overlay generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Couples overlay generation failed' },
      { status: 500 }
    );
  }
}
