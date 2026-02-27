import { NextRequest, NextResponse } from 'next/server';
import { RELATE_SYSTEM_PROMPT, RELATE_MODELS, RELATE_MAX_TOKENS } from '@/lib/prompts/relate-system';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

const MOCK_REVEALS: Record<number, (data: any) => string> = {
  1: (data) => `Your preferences are in. Across 134 questions, you've drawn a clear picture of what you're looking for. Your preference code is ${data.result?.code || data.code || '-'}, which means you gravitate toward a specific combination of physical, social, lifestyle, and values traits in a partner. These aren't random. They reflect deep patterns in what draws you in and what sustains your attention. Next up: Module 2 turns the mirror around. You've told us what you want. Now we find out who you are.`,
  2: (data) => {
    const persona = data.personaMetadata || data.persona || {};
    const code = data.result?.code || data.code || '-';
    return `Meet your persona: **The ${persona.name || code}** (${code}). ${persona.traits || 'Your traits shape how you show up in relationships, not who you wish you were, but who you actually are.'} This is the biggest moment in the assessment. Your persona isn't a label; it's a lens. It explains patterns you've noticed but couldn't name. ${data.m1Result ? `Your M1 code was ${data.m1Result.code || '-'}, ${data.m1Result.code === code ? 'which aligns with your persona. You want what you naturally offer.' : 'which differs from your persona. That tension between what you want and who you are is where the real insight lives.'}` : ''} Two more modules to go. Module 3 maps how you connect: the give and take of intimacy.`;
  },
  3: (data) => {
    const result = data.result || data;
    return `Your connection profile is complete. You want at ${result.wantScore || '-'}/100 and offer at ${result.offerScore || '-'}/100. ${result.wantScore > result.offerScore ? 'You want more than you give. This isn\'t selfish; it\'s clarity about your needs. The question is whether you\'re partnering with someone who naturally gives at your level.' : result.offerScore > result.wantScore ? 'You offer more than you ask for. This generosity is a strength, but watch for resentment if the balance stays skewed too long.' : 'Your want and offer scores are balanced, and you exchange connection evenly.'} One module left. Module 4 is where it gets real: how you handle conflict, what drives your emotional reactions, and how you repair after a fight. This is the data that predicts relationship longevity.`;
  },
  4: (data) => {
    const result = data.result || data;
    const approach = result.conflictApproach?.approach || result.summary?.approach || 'your approach';
    const driver = result.emotionalDrivers?.primary || result.summary?.primaryDriver || 'your primary driver';
    return `Assessment complete. Your conflict signature: you ${approach} during disagreements, driven primarily by ${driver}. Your repair style, emotional capacity, and Gottman risk scores round out a complete picture of how you handle the hardest moments in a relationship. This is the data most people never see about themselves, and it's the data that matters most. Your full results are ready. Every dimension, every score, every match ranked and analyzed. This is the most comprehensive relationship profile you'll ever receive.`;
  },
};

export async function POST(request: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true';

  try {
    const body = await request.json();
    const { moduleNumber, moduleScores, demographics, gender, m1Result, personaMetadata } = body;

    if (!moduleNumber || !moduleScores) {
      return NextResponse.json(
        { error: 'moduleNumber and moduleScores are required' },
        { status: 400 },
      );
    }

    if (useMock) {
      const mockFn = MOCK_REVEALS[moduleNumber];
      const reveal = mockFn
        ? mockFn({ ...moduleScores, m1Result, personaMetadata, demographics })
        : 'Module complete. Your data has been recorded.';
      return NextResponse.json({ success: true, reveal });
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    let moduleContext = '';
    if (moduleNumber === 2) {
      moduleContext = 'This is the persona reveal, the biggest moment in the assessment. Make it feel significant.';
    } else if (moduleNumber === 4) {
      moduleContext = 'This is assessment complete. Build anticipation for full results.';
    }

    const response = await anthropic.messages.create({
      model: RELATE_MODELS.moduleReveal,
      max_tokens: RELATE_MAX_TOKENS.moduleReveal,
      system: RELATE_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate the Module ${moduleNumber} completion reveal.

COMPLETED MODULE DATA:
${JSON.stringify(moduleScores, null, 2)}

GENDER: ${gender || 'unknown'}
DEMOGRAPHICS: ${JSON.stringify(demographics || {}, null, 2)}
${m1Result ? `\nM1 RESULT (for comparison):\n${JSON.stringify(m1Result, null, 2)}` : ''}
${personaMetadata ? `\nPERSONA METADATA:\n${JSON.stringify(personaMetadata, null, 2)}` : ''}

${moduleContext}`,
      }],
    });

    const reveal = response.content[0]?.text || 'Module complete.';

    return NextResponse.json({ success: true, reveal });
  } catch (error: any) {
    console.error('Module reveal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Reveal generation failed' },
      { status: 500 },
    );
  }
}
