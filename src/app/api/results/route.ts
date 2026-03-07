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

    return {
      code, persona, tier, tierScore, preferenceScore, dimensionScore, m3Score, m4Score, compatibilityScore, rank: 0,
      subScores: {
        tier: tierScore,
        preference: preferenceScore,
        dimension: dimensionScore,
        intimacy: m3Score,
        conflict: m4Score,
      },
    };
  });

  // Sort by compatibility score, break ties by tier rank then preference then dimension
  const TIER_RANK: Record<string, number> = { ideal: 6, kismet: 5, effort: 4, longShot: 3, atRisk: 2, incompatible: 1 };
  matches.sort((a, b) => {
    if (b.compatibilityScore !== a.compatibilityScore) return b.compatibilityScore - a.compatibilityScore;
    const tierDiff = (TIER_RANK[b.tier] || 0) - (TIER_RANK[a.tier] || 0);
    if (tierDiff !== 0) return tierDiff;
    if (b.preferenceScore !== a.preferenceScore) return b.preferenceScore - a.preferenceScore;
    return b.dimensionScore - a.dimensionScore;
  });
  matches.forEach((m, i) => { m.rank = i + 1; });
  return matches;
}

function generateMatchSummary(userResults: any, match: any): string {
  const { personaCode, m3, m4 } = userResults;
  const userCode = personaCode || '';
  const matchCode = match.code || '';
  const matchName = match.persona?.name || matchCode;

  // Dimension labels
  const dimLabels = ['Physical', 'Social', 'Lifestyle', 'Values'];
  const poleLongNames: Record<string, Record<string, string>> = {
    Physical: { A: 'physical fitness', B: 'maturity and presence' },
    Social: { C: 'social leadership', D: 'warmth and charm' },
    Lifestyle: { E: 'adventure', F: 'stability' },
    Values: { G: 'traditional roles', H: 'egalitarian partnership' },
  };

  const shared: string[] = [];
  const divergent: { userLong: string; matchLong: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const uLetter = userCode[i];
    const mLetter = matchCode[i];
    const dim = dimLabels[i];
    if (uLetter === mLetter) {
      shared.push(poleLongNames[dim]?.[uLetter] || uLetter);
    } else {
      divergent.push({
        userLong: poleLongNames[dim]?.[uLetter] || uLetter,
        matchLong: poleLongNames[dim]?.[mLetter] || mLetter,
      });
    }
  }

  const sentences: string[] = [];

  // Sentence 1: Overall compatibility framing with match name
  const tierFrames: Record<string, string> = {
    ideal: `${matchName} is one of your strongest natural pairings, with profiles that align on the dimensions that matter most for long-term compatibility.`,
    kismet: `${matchName} has strong potential with you, aligning where it counts while offering enough difference to sustain genuine interest over time.`,
    effort: `${matchName} is a promising match that will ask for intentional effort. You connect in key areas but diverge in others that shape how you spend your daily life together.`,
    longShot: `${matchName} presents real differences to navigate. This pairing can absolutely work, but it asks both of you to stretch beyond your natural defaults and meet in the middle.`,
    atRisk: `${matchName} is a challenging match where your core differences tend to surface under stress, making honest and consistent communication especially critical to sustaining this relationship.`,
    incompatible: `${matchName} sits on the far end of your compatibility spectrum, with fundamental differences in how you each approach relationships and what you prioritize in a partner.`,
  };
  sentences.push(tierFrames[match.tier] || `${matchName} is a potential match worth understanding more deeply.`);

  // Sentence 2: What you share and where you differ (the dimensional story)
  if (shared.length >= 3) {
    const topDiv = divergent[0];
    sentences.push(`You share ground on ${shared.slice(0, 2).join(' and ')}, which creates a natural baseline of understanding${topDiv ? `, though your preference for ${topDiv.userLong} meets their orientation toward ${topDiv.matchLong} in a way that will need attention` : ''}.`);
  } else if (shared.length > 0 && divergent.length > 0) {
    sentences.push(`You connect through a shared value of ${shared[0]}, but diverge where your preference for ${divergent[0].userLong} meets their orientation toward ${divergent[0].matchLong}${divergent.length > 1 ? `, and your ${divergent[1].userLong} contrasts with their ${divergent[1].matchLong}` : ''}.`);
  } else if (divergent.length >= 3) {
    sentences.push(`You differ across most dimensions. Your preference for ${divergent[0].userLong} meets their orientation toward ${divergent[0].matchLong}, and your ${divergent[1].userLong} contrasts with their ${divergent[1].matchLong}, which shapes how you approach daily life together.`);
  }

  // Sentence 3: Intimacy dynamic
  const matchProfile = PERSONA_TYPICAL_PROFILES[matchCode];
  if (m3 && matchProfile?.m3) {
    const userWant = m3.wantScore ?? m3.want ?? 50;
    const userOffer = m3.offerScore ?? m3.offer ?? 50;
    const wantGap = Math.abs(userWant - matchProfile.m3.typicalOffer);
    const offerGap = Math.abs(userOffer - matchProfile.m3.typicalWant);
    if (wantGap < 15 && offerGap < 15) {
      sentences.push('Your intimacy expectations align well. What you need emotionally maps closely to what this persona naturally provides, and what you offer matches what they tend to seek.');
    } else if (wantGap > 35 || offerGap > 35) {
      const direction = userWant > matchProfile.m3.typicalOffer
        ? 'you may want more closeness than this persona naturally offers'
        : 'this persona may seek more emotional intensity than you naturally provide';
      sentences.push(`In intimacy, ${direction}. This is a gap worth naming early to avoid the slow resentment that builds when needs go unspoken.`);
    } else {
      sentences.push('Your intimacy styles are moderately aligned, with enough overlap to feel natural and enough difference to require occasional recalibration as you learn each other.');
    }
  }

  // Sentence 4: Conflict dynamic
  if (m4 && matchProfile?.m4) {
    const sameApproach = m4.approach === matchProfile.m4.typicalApproach;
    if (!sameApproach) {
      sentences.push('In conflict, your styles complement each other. One of you tends to pursue resolution while the other withdraws to process, which balances well with awareness but can spiral without it.');
    } else if (m4.approach === 'pursue') {
      sentences.push('You both pursue during conflict, which means hard conversations happen readily but can escalate fast without intentional cooldown periods built into how you argue.');
    } else {
      sentences.push('You both tend to withdraw during conflict, meaning issues may go unresolved longer than is healthy. Naming problems early and explicitly will matter in this pairing.');
    }
  }

  // Sentence 5: Preference alignment or repair note
  if (match.preferenceScore !== undefined && match.preferenceScore >= 75) {
    sentences.push(`At ${match.preferenceScore}% preference alignment, what you say you want in a partner maps closely to who this persona actually is.`);
  } else if (match.preferenceScore !== undefined && match.preferenceScore <= 35) {
    sentences.push(`Your stated preferences and this persona's profile only overlap ${match.preferenceScore}%, which is worth examining. What you think you want may not fully reflect what actually makes you happy in practice.`);
  } else if (m4 && matchProfile?.m4) {
    if (m4.repairSpeed && m4.repairSpeed !== matchProfile.m4.typicalRepairSpeed) {
      sentences.push('Your repair timelines differ after conflict. One of you is ready to reconnect faster, so being explicit about whether you need space or closeness after a fight will matter.');
    }
  }

  // Strip em/en dashes used as punctuation (— or –) and replace with commas or periods
  return sentences.filter(Boolean).join(' ')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,\s*,/g, ',');
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
    const matchM2Poles = gender === 'M' ? questionsModule.WOMEN_W2_POLES : questionsModule.MEN_M2_POLES;

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
      matchM2Poles,
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
