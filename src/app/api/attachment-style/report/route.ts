import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const attachmentScoringModule = require('../../../../../relate_attachment_scoring.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprintResults, assessmentResults, personaMetadata } = body;

    if (!blueprintResults || !assessmentResults || !personaMetadata) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: blueprintResults, assessmentResults, and personaMetadata are required' },
        { status: 400 }
      );
    }

    // generateAttachmentReport builds the structured report input.
    // If it is not yet fully wired to Claude, it returns a section-structured
    // object that can be used as a placeholder.
    let report;
    try {
      report = attachmentScoringModule.generateAttachmentReport(
        blueprintResults,
        assessmentResults,
        personaMetadata
      );
    } catch {
      // Stub fallback: return structured placeholder sections
      report = {
        sections: {
          relationalHistory: { sectionNumber: 1, status: 'pending', content: null },
          emotionUnderneath: { sectionNumber: 2, status: 'pending', content: null },
          howYouNavigateUncertainty: { sectionNumber: 3, status: 'pending', content: null },
          personaInContext: { sectionNumber: 4, status: 'pending', content: null },
          thePortrait: { sectionNumber: 5, status: 'pending', content: null },
          whatThisMeansForPartnership: { sectionNumber: 6, status: 'pending', content: null },
          theGrowingEdge: { sectionNumber: 7, status: 'pending', content: null },
        },
        metadata: {
          personaCode: assessmentResults.personaCode,
          attachmentType: assessmentResults.attachmentType,
          generatedAt: new Date().toISOString(),
          stubbed: true,
        },
      };
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Blueprint report generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Report generation failed' },
      { status: 500 }
    );
  }
}
