import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const questionsModule = require('../../../../relate_questions.js');
const personaModule = require('../../../../relate_persona_definitions.js');
const frameworksModule = require('../../../../relate_frameworks.js');
const modifierModule = require('../../../../relate_modifier_system.js');

// Persona typical profiles for M3/M4 compatibility scoring
const PERSONA_TYPICAL_PROFILES: Record<string, any> = {
  // Men's personas
  'ACEG': { m3: { typicalWant: 45, typicalOffer: 35, typicalAttentiveness: 'self-focused' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'physical', typicalCapacity: 'high' } },
  'ACEH': { m3: { typicalWant: 50, typicalOffer: 40, typicalAttentiveness: 'balanced' }, m4: { typicalApproach: 'pursue', typicalDriver: 'injustice', typicalRepairSpeed: 'quick', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'ACFG': { m3: { typicalWant: 55, typicalOffer: 45, typicalAttentiveness: 'self-focused' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'engulfment', typicalRepairSpeed: 'slow', typicalRepairMode: 'physical', typicalCapacity: 'medium' } },
  'ACFH': { m3: { typicalWant: 60, typicalOffer: 65, typicalAttentiveness: 'other-focused' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'ADEG': { m3: { typicalWant: 40, typicalOffer: 30, typicalAttentiveness: 'self-focused' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'engulfment', typicalRepairSpeed: 'slow', typicalRepairMode: 'physical', typicalCapacity: 'medium' } },
  'ADEH': { m3: { typicalWant: 55, typicalOffer: 60, typicalAttentiveness: 'other-focused' }, m4: { typicalApproach: 'pursue', typicalDriver: 'abandonment', typicalRepairSpeed: 'quick', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'ADFG': { m3: { typicalWant: 65, typicalOffer: 60, typicalAttentiveness: 'balanced' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'physical', typicalCapacity: 'medium' } },
  'ADFH': { m3: { typicalWant: 70, typicalOffer: 75, typicalAttentiveness: 'other-focused' }, m4: { typicalApproach: 'pursue', typicalDriver: 'abandonment', typicalRepairSpeed: 'quick', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'BCEG': { m3: { typicalWant: 50, typicalOffer: 40, typicalAttentiveness: 'self-focused' }, m4: { typicalApproach: 'pursue', typicalDriver: 'injustice', typicalRepairSpeed: 'quick', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'BCEH': { m3: { typicalWant: 55, typicalOffer: 55, typicalAttentiveness: 'balanced' }, m4: { typicalApproach: 'pursue', typicalDriver: 'injustice', typicalRepairSpeed: 'quick', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'BCFG': { m3: { typicalWant: 60, typicalOffer: 55, typicalAttentiveness: 'balanced' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'BCFH': { m3: { typicalWant: 65, typicalOffer: 70, typicalAttentiveness: 'other-focused' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'BDEG': { m3: { typicalWant: 45, typicalOffer: 40, typicalAttentiveness: 'self-focused' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'engulfment', typicalRepairSpeed: 'slow', typicalRepairMode: 'physical', typicalCapacity: 'medium' } },
  'BDEH': { m3: { typicalWant: 60, typicalOffer: 65, typicalAttentiveness: 'other-focused' }, m4: { typicalApproach: 'pursue', typicalDriver: 'abandonment', typicalRepairSpeed: 'quick', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  'BDFG': { m3: { typicalWant: 70, typicalOffer: 65, typicalAttentiveness: 'balanced' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'physical', typicalCapacity: 'medium' } },
  'BDFH': { m3: { typicalWant: 75, typicalOffer: 80, typicalAttentiveness: 'other-focused' }, m4: { typicalApproach: 'withdraw', typicalDriver: 'inadequacy', typicalRepairSpeed: 'slow', typicalRepairMode: 'verbal', typicalCapacity: 'high' } },
  // Women's personas (same codes, different behavioral profiles)
};

// Copy men's profiles as defaults for women's personas
for (const code of Object.keys(PERSONA_TYPICAL_PROFILES)) {
  if (!PERSONA_TYPICAL_PROFILES[`W_${code}`]) {
    PERSONA_TYPICAL_PROFILES[`W_${code}`] = PERSONA_TYPICAL_PROFILES[code];
  }
}

const TIER_BASE_SCORES: Record<string, number> = { ideal: 80, kismet: 65, effort: 45, longShot: 25, atRisk: 10, incompatible: 2 };

function getTierForMatch(tierAssignments: Record<string, string[]>, matchCode: string): string {
  for (const [tier, codes] of Object.entries(tierAssignments)) {
    if (codes.includes(matchCode)) return tier;
  }
  return 'incompatible';
}

function calculateDimensionAlignment(userDimensions: any, targetPersona: any): number {
  // Simple alignment based on shared poles
  let shared = 0;
  const total = 4;
  if (userDimensions && targetPersona) {
    // Compare dimension assignments
    const dims = ['physical', 'social', 'lifestyle', 'values'];
    for (const dim of dims) {
      if (userDimensions[dim]?.assignedPole && targetPersona.traits) {
        shared += 0.5; // Base partial alignment
      }
    }
  }
  return Math.round((shared / total) * 100);
}

function calculateM3Compatibility(userM3: any, targetM3: any): number {
  if (!userM3 || !targetM3) return 50;
  const wantDiff = Math.abs((userM3.wantScore || 50) - (targetM3.typicalOffer || 50));
  const offerDiff = Math.abs((userM3.offerScore || 50) - (targetM3.typicalWant || 50));
  return Math.max(0, Math.round(100 - (wantDiff + offerDiff) / 2));
}

function calculateM4Compatibility(userM4: any, targetM4: any): number {
  if (!userM4 || !targetM4) return 50;
  let score = 50;
  // Pursue-withdraw complementarity
  if (userM4.approach !== targetM4.typicalApproach) score += 10;
  // Repair compatibility
  if (userM4.repairSpeed === targetM4.typicalRepairSpeed) score += 10;
  if (userM4.repairMode === targetM4.typicalRepairMode) score += 5;
  // Capacity match
  if (userM4.capacity === targetM4.typicalCapacity) score += 10;
  if (userM4.capacity === 'high') score += 5;
  // Driver collision risk
  if (userM4.primaryDriver === targetM4.typicalDriver) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function rankCompatiblePersonas(userResults: any) {
  const { gender, personaCode, m2, m3, m4 } = userResults;
  const compatTable = gender === 'M' ? personaModule.M2_COMPATIBILITY_TABLE : personaModule.W2_COMPATIBILITY_TABLE;
  const targetPersonas = gender === 'M' ? personaModule.W2_PERSONA_METADATA : personaModule.M2_PERSONA_METADATA;

  if (!compatTable || !targetPersonas || !compatTable[personaCode]) {
    return [];
  }

  const tierAssignments = compatTable[personaCode];

  const matches = Object.entries(targetPersonas).map(([code, persona]: [string, any]) => {
    const tier = getTierForMatch(tierAssignments, code);
    const tierScore = TIER_BASE_SCORES[tier] || 2;
    const dimensionScore = calculateDimensionAlignment(m2?.dimensions, persona);
    const targetProfile = PERSONA_TYPICAL_PROFILES[code] || PERSONA_TYPICAL_PROFILES['BDFH'];
    const m3Score = calculateM3Compatibility(m3, targetProfile.m3);
    const m4Score = calculateM4Compatibility(m4, targetProfile.m4);

    const compatibilityScore = Math.round(
      tierScore * 0.50 + dimensionScore * 0.20 + m3Score * 0.15 + m4Score * 0.15
    );

    return { code, persona, tier, tierScore, dimensionScore, m3Score, m4Score, compatibilityScore, rank: 0 };
  });

  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  matches.forEach((m, i) => { m.rank = i + 1; });
  return matches;
}

function generateMatchSummary(userResults: any, match: any): string {
  const tierDescriptions: Record<string, string> = {
    ideal: 'Strong natural compatibility. Your values and behavioral patterns align well.',
    kismet: 'High potential for connection. Key dimensions complement each other.',
    effort: 'Promising match that requires conscious effort in specific areas.',
    longShot: 'Significant differences that would need sustained work to bridge.',
    atRisk: 'Core value conflicts present. Proceed with clear expectations.',
    incompatible: 'Fundamental misalignment in values and behavioral patterns.',
  };
  return tierDescriptions[match.tier] || 'Compatibility assessment available.';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gender, m1Responses, m2Responses, m3Responses, m4Responses, demographics } = body;

    const genderArg = gender === 'M' ? 'male' : 'female';

    // Score each module
    const m1Result = questionsModule.scoreModule1(genderArg, m1Responses);
    const m2Result = questionsModule.scoreModule2(genderArg, m2Responses);
    const m3Result = questionsModule.scoreModule3(genderArg, m3Responses);
    const m4Result = questionsModule.scoreModule4(genderArg, m4Responses);

    // Calculate attentiveness
    const allResponses = { ...m1Responses, ...m2Responses, ...m3Responses, ...m4Responses };
    let attentiveness = null;
    try {
      attentiveness = questionsModule.scoreAttentiveness(
        allResponses, genderArg, m3Result, m4Result?.gottmanScreener || m4Result?.gottmanScores, m2Result?.overallSelfPerceptionGap || 0
      );
    } catch { /* attentiveness is optional */ }

    // Calculate tension stacks
    let tensionStacks = null;
    try {
      tensionStacks = frameworksModule.computeAllTensionStacks(m1Result, m2Result, m3Result, m4Result, demographics || {}, genderArg);
    } catch { /* tension stacks are optional */ }

    // Calculate modifiers
    let modifiers = null;
    try {
      modifiers = modifierModule.calculateRelateModifiers?.(m1Result, m2Result, m3Result, m4Result, demographics || {});
    } catch { /* modifiers are optional */ }

    const personaCode = m2Result?.code || m2Result?.personaCode || 'BDFH';

    // Build user results
    const userResults = {
      gender,
      personaCode,
      m1: m1Result,
      m2: m2Result,
      m3: m3Result,
      m4: m4Result,
      attentiveness,
      tensionStacks,
      modifiers,
      demographics,
    };

    // Rank matches
    const rankedMatches = rankCompatiblePersonas(userResults);

    // Get persona metadata
    const personaMetadata = gender === 'M'
      ? personaModule.M2_PERSONA_METADATA?.[personaCode]
      : personaModule.W2_PERSONA_METADATA?.[personaCode];

    // Build report
    const report = {
      persona: {
        code: personaCode,
        name: personaMetadata?.name || personaCode,
        traits: personaMetadata?.traits || '',
        datingBehavior: personaMetadata?.datingBehavior || [],
        inRelationships: personaMetadata?.inRelationships || [],
        mostAttractive: personaMetadata?.mostAttractive || [],
        leastAttractive: personaMetadata?.leastAttractive || [],
      },
      dimensions: m2Result?.dimensions || m1Result?.dimensions || {},
      m1: m1Result,
      m2: m2Result,
      m3: m3Result,
      m4: m4Result,
      attentiveness,
      tensionStacks,
      modifiers,
      matches: rankedMatches.map((match: any) => ({
        rank: match.rank,
        code: match.code,
        name: match.persona?.name || match.code,
        tier: match.tier,
        compatibilityScore: match.compatibilityScore,
        traits: match.persona?.traits || '',
        summary: generateMatchSummary(userResults, match),
      })),
    };

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Results calculation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Scoring failed' }, { status: 500 });
  }
}
