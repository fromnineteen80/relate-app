import { NextRequest, NextResponse } from 'next/server';
import { buildIndividualCompatibilityProfile } from '@/lib/compatibility';

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

// Decode a persona code letter to an A/B pole for a given dimension position
function codeToPole(code: string, dimIndex: number): string | null {
  const letter = code[dimIndex];
  if (!letter) return null;
  // A/B=physical(A/B), C/D=social(A/B), E/F=lifestyle(A/B), G/H=values(A/B)
  const poleALetters = ['A', 'C', 'E', 'G'];
  const poleBLetters = ['B', 'D', 'F', 'H'];
  if (poleALetters.includes(letter)) return 'A';
  if (poleBLetters.includes(letter)) return 'B';
  return null;
}

function calculateDimensionAlignment(userDimensions: any, targetCode: string): number {
  // Compare user's M2 dimension poles against target persona's code-derived poles
  if (!userDimensions || !targetCode) return 50;
  const dims = ['physical', 'social', 'lifestyle', 'values'];
  let matched = 0;
  let total = 0;
  for (let i = 0; i < dims.length; i++) {
    const userPole = userDimensions[dims[i]]?.direction;
    const targetPole = codeToPole(targetCode, i);
    if (userPole && targetPole) {
      total++;
      if (userPole === targetPole) matched++;
    }
  }
  return total > 0 ? Math.round((matched / total) * 100) : 50;
}

function calculateM1PreferenceAlignment(userM1Dimensions: any, targetCode: string): number {
  // Compare user's M1 wants (what they're looking for) against what the target persona IS
  if (!userM1Dimensions || !targetCode) return 50;
  const dims = ['physical', 'social', 'lifestyle', 'values'];
  let matched = 0;
  let total = 0;
  for (let i = 0; i < dims.length; i++) {
    const wantPole = userM1Dimensions[dims[i]]?.direction;
    const targetPole = codeToPole(targetCode, i);
    if (wantPole && targetPole) {
      total++;
      if (wantPole === targetPole) matched++;
    }
  }
  return total > 0 ? Math.round((matched / total) * 100) : 50;
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
  const { gender, personaCode, m1, m2, m3, m4 } = userResults;
  const compatTable = gender === 'M' ? personaModule.M2_COMPATIBILITY_TABLE : personaModule.W2_COMPATIBILITY_TABLE;
  const targetPersonas = gender === 'M' ? personaModule.W2_PERSONA_METADATA : personaModule.M2_PERSONA_METADATA;

  if (!compatTable || !targetPersonas || !compatTable[personaCode]) {
    return [];
  }

  const tierAssignments = compatTable[personaCode];

  const matches = Object.entries(targetPersonas).map(([code, persona]: [string, any]) => {
    const tier = getTierForMatch(tierAssignments, code);
    const tierScore = TIER_BASE_SCORES[tier] || 2;
    const dimensionScore = calculateDimensionAlignment(m2?.dimensions, code);
    const preferenceScore = calculateM1PreferenceAlignment(m1?.dimensions, code);
    const targetProfile = PERSONA_TYPICAL_PROFILES[code] || PERSONA_TYPICAL_PROFILES['BDFH'];
    const m3Score = calculateM3Compatibility(m3, targetProfile.m3);
    const m4Score = calculateM4Compatibility(m4, targetProfile.m4);

    // Tier (who you are vs who they are): 35%
    // Preference (what you want vs who they are): 20%
    // Dimension alignment (M2 behavioral match): 15%
    // M3 intimacy dynamics: 15%
    // M4 conflict compatibility: 15%
    const compatibilityScore = Math.round(
      tierScore * 0.35 + preferenceScore * 0.20 + dimensionScore * 0.15 + m3Score * 0.15 + m4Score * 0.15
    );

    return { code, persona, tier, tierScore, preferenceScore, dimensionScore, m3Score, m4Score, compatibilityScore, rank: 0 };
  });

  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  matches.forEach((m, i) => { m.rank = i + 1; });
  return matches;
}

function generateMatchSummary(userResults: any, match: any): string {
  const { personaCode, m3, m4 } = userResults;
  const userCode = personaCode || '';
  const matchCode = match.code || '';
  const matchName = match.persona?.name || matchCode;

  // Dimension labels for readable output
  const dimLabels = ['Physical', 'Social', 'Lifestyle', 'Values'];
  const poleNames: Record<string, Record<string, string>> = {
    Physical: { A: 'Fitness', B: 'Maturity' },
    Social: { C: 'Leadership', D: 'Presence' },
    Lifestyle: { E: 'Adventure', F: 'Stability' },
    Values: { G: 'Traditional', H: 'Egalitarian' },
  };
  const poleLongNames: Record<string, Record<string, string>> = {
    Physical: { A: 'physical fitness and aesthetics', B: 'maturity and quiet confidence' },
    Social: { C: 'social leadership and initiative', D: 'warmth and interpersonal presence' },
    Lifestyle: { E: 'adventure and novelty-seeking', F: 'stability and domestic comfort' },
    Values: { G: 'traditional relationship roles', H: 'egalitarian partnership' },
  };

  // Find shared and divergent dimensions
  const shared: string[] = [];
  const sharedLong: string[] = [];
  const divergent: { dim: string; user: string; match: string; userLong: string; matchLong: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const uLetter = userCode[i];
    const mLetter = matchCode[i];
    const dim = dimLabels[i];
    if (uLetter === mLetter) {
      shared.push(poleNames[dim]?.[uLetter] || uLetter);
      sharedLong.push(poleLongNames[dim]?.[uLetter] || uLetter);
    } else {
      divergent.push({
        dim,
        user: poleNames[dim]?.[uLetter] || uLetter,
        match: poleNames[dim]?.[mLetter] || mLetter,
        userLong: poleLongNames[dim]?.[uLetter] || uLetter,
        matchLong: poleLongNames[dim]?.[mLetter] || mLetter,
      });
    }
  }

  const parts: string[] = [];

  // Tier-based opening paragraph
  const tierOpeners: Record<string, string> = {
    ideal: `${matchName} is one of your strongest natural pairings. The foundation here is solid across multiple dimensions — you share core values and behavioral patterns that make long-term compatibility likely without excessive compromise.`,
    kismet: `There's strong potential with ${matchName}. Your profiles align on the dimensions that matter most for sustained attraction and relationship stability, with enough complementary differences to keep things interesting.`,
    effort: `${matchName} is a promising match, but one that requires intentional effort. You align in some key areas, while other dimensions will need honest communication and willingness to meet each other halfway.`,
    longShot: `With ${matchName}, you're looking at real differences to bridge. This pairing can work, but it demands significant self-awareness from both sides and a willingness to appreciate fundamentally different approaches to life and love.`,
    atRisk: `${matchName} presents significant friction points. The areas where you diverge tend to surface under stress — in conflict, during life transitions, and around intimacy expectations. This pairing requires extraordinary communication.`,
    incompatible: `${matchName} represents a fundamental difference in approach. Your profiles diverge on the dimensions most predictive of relationship satisfaction. Not impossible, but the work required is substantial and ongoing.`,
  };
  parts.push(tierOpeners[match.tier] || '');

  // Shared dimensions narrative
  if (shared.length >= 3) {
    parts.push(`You share common ground on ${shared.length} of 4 dimensions — ${sharedLong.join(', ')} — which provides a strong baseline of mutual understanding.`);
  } else if (shared.length === 2) {
    parts.push(`You both value ${sharedLong[0]} and ${sharedLong[1]}, giving you a shared foundation to build on.`);
  } else if (shared.length === 1) {
    parts.push(`You connect on ${sharedLong[0]}, but the other three dimensions tell a story of complementary — or competing — priorities.`);
  }

  // Divergent dimensions narrative
  if (divergent.length > 0) {
    const divParts = divergent.map(d =>
      `on the ${d.dim.toLowerCase()} axis, your preference for ${d.userLong} meets their orientation toward ${d.matchLong}`
    );
    if (divergent.length === 1) {
      parts.push(`Where you differ: ${divParts[0]}. This is manageable with awareness but can become a recurring tension point if left unaddressed.`);
    } else if (divergent.length === 2) {
      parts.push(`Where you diverge: ${divParts[0]}, and ${divParts[1]}. These differences shape how you spend time together and what you prioritize day-to-day.`);
    } else {
      parts.push(`You differ on ${divergent.length} dimensions: ${divParts.join('; ')}. When multiple dimensions diverge, the relationship requires more negotiation and mutual flexibility.`);
    }
  }

  // Sub-score narrative: preference alignment
  if (match.preferenceScore !== undefined) {
    if (match.preferenceScore >= 75) {
      parts.push(`What you're looking for in a partner maps closely to who ${matchName} is — a ${match.preferenceScore}% preference alignment, which means your stated wants match their actual profile.`);
    } else if (match.preferenceScore <= 35) {
      parts.push(`There's a gap between what you say you want and who ${matchName} is (${match.preferenceScore}% preference alignment). This doesn't mean it can't work — it means you may need to examine whether your stated preferences reflect what actually makes you happy.`);
    }
  }

  // Intimacy dynamics (M3)
  if (m3) {
    const userWant = m3.wantScore ?? m3.want ?? 50;
    const userOffer = m3.offerScore ?? m3.offer ?? 50;
    const matchProfile = PERSONA_TYPICAL_PROFILES[matchCode];
    if (matchProfile?.m3) {
      const wantGap = Math.abs(userWant - matchProfile.m3.typicalOffer);
      const offerGap = Math.abs(userOffer - matchProfile.m3.typicalWant);
      if (wantGap < 15 && offerGap < 15) {
        parts.push('Your intimacy dynamics are well-matched — what you need emotionally and physically aligns with what this persona typically provides, and vice versa.');
      } else if (wantGap > 35 || offerGap > 35) {
        const direction = userWant > matchProfile.m3.typicalOffer
          ? 'You may want more intimacy and emotional closeness than this persona naturally provides'
          : 'This persona may seek more emotional intensity than feels comfortable to you';
        parts.push(`${direction}. This gap in intimacy expectations is one of the most common sources of relationship dissatisfaction when left unspoken.`);
      } else {
        parts.push('Your intimacy expectations are moderately aligned, with some room for calibration as you get to know each other.');
      }
    }
  }

  // Conflict dynamics (M4)
  if (m4) {
    const matchProfile = PERSONA_TYPICAL_PROFILES[matchCode];
    if (matchProfile?.m4) {
      const sameApproach = m4.approach === matchProfile.m4.typicalApproach;
      const sameDriver = m4.primaryDriver === matchProfile.m4.typicalDriver;

      if (!sameApproach) {
        parts.push('Your conflict styles complement each other — one tends to pursue resolution while the other withdraws to process. This can balance well when both partners understand the dynamic, but it can escalate if the pursuer feels stonewalled or the withdrawer feels cornered.');
      } else if (m4.approach === 'pursue') {
        parts.push('You both tend to pursue during conflict, which means arguments can intensify quickly. The upside: neither of you avoids hard conversations. The risk: escalation without cooldown periods.');
      } else {
        parts.push('You both tend to withdraw during conflict, which can lead to issues going unresolved for long stretches. The relationship may feel peaceful on the surface while resentment builds underneath.');
      }

      if (sameDriver) {
        const driverLabels: Record<string, string> = {
          abandonment: 'fear of abandonment',
          engulfment: 'fear of losing independence',
          inadequacy: 'fear of not being enough',
          injustice: 'sensitivity to perceived unfairness',
        };
        const label = driverLabels[m4.primaryDriver] || m4.primaryDriver;
        parts.push(`You share a core emotional driver (${label}), which means you understand each other's triggers deeply — but can also activate them more easily.`);
      }

      if (m4.repairSpeed && matchProfile.m4.typicalRepairSpeed) {
        if (m4.repairSpeed !== matchProfile.m4.typicalRepairSpeed) {
          parts.push('Your repair timelines differ — one of you is ready to reconnect faster than the other. Being explicit about needing space (or connection) after a fight helps bridge this gap.');
        }
      }
    }
  }

  return parts.filter(Boolean).join(' ');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gender, m1Responses, m2Responses, m3Responses, m4Responses, demographics } = body;

    // Scoring functions expect 'M' or 'W', not 'male'/'female'
    const genderArg = gender === 'M' ? 'M' : 'W';

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
    // Get M2 poles for code key display
    const m2Poles = gender === 'M' ? questionsModule.MEN_M2_POLES : questionsModule.WOMEN_W2_POLES;

    const report = {
      gender,
      persona: {
        code: personaCode,
        name: personaMetadata?.name || personaCode,
        traits: personaMetadata?.traits || '',
        datingBehavior: personaMetadata?.datingBehavior || [],
        inRelationships: personaMetadata?.inRelationships || [],
        mostAttractive: personaMetadata?.mostAttractive || [],
        leastAttractive: personaMetadata?.leastAttractive || [],
        struggles: personaMetadata?.struggles || [],
      },
      m2Poles,
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
        // Persona insight metadata
        datingBehavior: match.persona?.datingBehavior || [],
        inRelationships: match.persona?.inRelationships || [],
        howValued: match.persona?.howValued || [],
        disappointments: match.persona?.disappointments || [],
        struggles: match.persona?.struggles || [],
        mostAttractive: match.persona?.mostAttractive || [],
        leastAttractive: match.persona?.leastAttractive || [],
        // Sub-scores for dimension breakdown
        subScores: {
          tier: match.tierScore,
          preference: match.preferenceScore,
          dimension: match.dimensionScore,
          intimacy: match.m3Score,
          conflict: match.m4Score,
        },
      })),
    };

    // Attach individual compatibility profile (additive — no existing data modified)
    try {
      (report as any).individualCompatibility = buildIndividualCompatibilityProfile(m3Result, m4Result);
    } catch { /* compatibility scoring is optional */ }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Results calculation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Scoring failed' }, { status: 500 });
  }
}
