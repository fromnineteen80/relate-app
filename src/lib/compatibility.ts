// Compatibility scoring system
// Pure functions — takes existing scored data as inputs, returns compatibility insights
// Does NOT modify any existing M3 scores or persona compatibility tables

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ───

export interface AttachmentResult {
  style: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  confidence: number;
  subtype?: 'suppressed' | 'performative';
  leaningToward?: 'anxious' | 'avoidant';
  description: string;
}

export interface M3StateScores {
  want: number;
  offer: number;
  gap: number;
  label: string;
}

export interface StateModifiers {
  conflict: { want: number; offer: number };
  repair: { want: number; offer: number };
}

export interface M3StatesResult {
  states: {
    normal: M3StateScores;
    conflict: M3StateScores;
    repair: M3StateScores;
  };
  modifiers: StateModifiers;
  insights: {
    gapExpansion: number;
    gapExpansionLevel: 'HIGH' | 'MODERATE' | 'LOW';
    repairSustainable: boolean;
    repairStrain: number;
    vulnerableState: 'conflict' | null;
  };
}

export interface AttachmentTierMatch {
  style: string;
  tier: string;
  score: number;
  note: string | null;
}

export interface AttachmentTiersResult {
  yourStyle: AttachmentResult;
  bestMatches: AttachmentTierMatch[];
  goodMatches: AttachmentTierMatch[];
  workableMatches: AttachmentTierMatch[];
  riskyMatches: AttachmentTierMatch[];
  avoidMatches: AttachmentTierMatch[];
  recommendation: string;
}

export interface DriverTierMatch {
  driver: string;
  tier: string;
  score: number;
  reason: string;
}

export interface DriverTiersResult {
  yourDriver: { primary: string; secondary: string; scores: any };
  bestMatches: DriverTierMatch[];
  goodMatches: DriverTierMatch[];
  workableMatches: DriverTierMatch[];
  avoidMatches: DriverTierMatch[];
  recommendation: string;
}

export interface HorsemenInsightsResult {
  yourProfile: Record<string, { score: number; level: string }>;
  risks: Array<{ horseman: string; score: number; partnerRisk: string }>;
  lookFor: Array<{ partnerTrait: string; reason: string; threshold?: number }>;
  avoid: Array<{ partnerTrait: string; reason: string; threshold?: number }>;
  idealPartnerProfile: Record<string, number>;
  urgent?: string;
}

export interface IndividualCompatibilityProfile {
  attachment: AttachmentResult;
  m3States: M3StatesResult;
  attachmentTiers: AttachmentTiersResult;
  driverTiers: DriverTiersResult;
  horsemenInsights: HorsemenInsightsResult;
  idealPartner: {
    attachment: string;
    drivers: string;
    maxHorsemen: Record<string, number>;
    minEmotionalCapacity: number;
  };
  calculatedAt: string;
}

// ─── Constants ───

// Gottman scores are raw 4-20. Normalize to 0-100 for threshold comparisons.
function normalizeGottmanScore(raw: number): number {
  return Math.round(((raw - 4) / 16) * 100);
}

const ATTACHMENT_COMPATIBILITY: Record<string, {
  ideal: string[];
  kismet?: string[];
  effort?: string[];
  atRisk?: string[];
  avoid?: string[];
  description: string;
}> = {
  secure: {
    ideal: ['secure'],
    kismet: ['anxious', 'avoidant'],
    effort: ['disorganized'],
    description: 'You can partner successfully with any attachment style, though secure-secure is easiest.',
  },
  anxious: {
    ideal: ['secure'],
    kismet: ['anxious'],
    effort: ['avoidant'],
    atRisk: ['disorganized'],
    avoid: ['avoidant'],
    description: 'You thrive with secure partners who provide consistent reassurance. Avoid avoidant partners unless both commit to significant work.',
  },
  avoidant: {
    ideal: ['secure'],
    kismet: ['avoidant'],
    effort: ['anxious'],
    atRisk: ['disorganized'],
    avoid: ['anxious'],
    description: 'You thrive with secure partners who respect your need for space. Anxious partners will trigger your withdrawal.',
  },
  disorganized: {
    ideal: ['secure'],
    effort: ['secure'],
    atRisk: ['anxious', 'avoidant', 'disorganized'],
    description: 'Secure partners are essential. Your patterns require a stable anchor. Therapy is strongly recommended before serious partnership.',
  },
};

const AVOID_REASONS: Record<string, string> = {
  'anxious_avoidant': 'Classic anxious-avoidant trap. Your pursuit triggers their withdrawal, which triggers your panic. Without intervention, this cycle destroys relationships.',
  'avoidant_anxious': 'Your withdrawal triggers their pursuit, which triggers your shutdown. Without intervention, this cycle destroys relationships.',
};

const DRIVER_COMPATIBILITY: Record<string, {
  ideal: string[];
  kismet: string[];
  effort: string[];
  avoid: string[];
  description: string;
}> = {
  abandonment: {
    ideal: ['abandonment'],
    kismet: ['injustice'],
    effort: ['inadequacy'],
    avoid: ['engulfment'],
    description: 'You need a partner who understands abandonment fear. Avoid partners with strong engulfment fears, as your pursuit will feel suffocating to them.',
  },
  engulfment: {
    ideal: ['engulfment'],
    kismet: ['injustice'],
    effort: ['inadequacy'],
    avoid: ['abandonment'],
    description: 'You need a partner who respects space needs. Avoid partners with strong abandonment fears, as your need for distance will feel like rejection.',
  },
  inadequacy: {
    ideal: ['inadequacy'],
    kismet: ['abandonment'],
    effort: ['injustice'],
    avoid: [],
    description: 'You need a partner who leads with appreciation, not criticism. Another inadequacy-driver understands your sensitivity.',
  },
  injustice: {
    ideal: ['injustice'],
    kismet: ['inadequacy'],
    effort: ['abandonment', 'engulfment'],
    avoid: [],
    description: 'You need a partner who values fairness. Another injustice-driver shares your orientation, though you must both resist scorekeeping.',
  },
};

const DRIVER_COLLISION_REASONS: Record<string, string> = {
  'abandonment_engulfment': 'Your fear of being left collides with their fear of being consumed. You pursue → they withdraw → you panic → they feel trapped. This is the most dangerous driver pairing.',
  'engulfment_abandonment': 'Your fear of being consumed collides with their fear of being left. You withdraw → they pursue → you feel trapped → they panic. This is the most dangerous driver pairing.',
};

const HORSEMEN_PARTNER_RISKS: Record<string, string> = {
  criticism: 'If your partner is defensive, your criticism will escalate conflicts rather than resolve them.',
  contempt: 'Contempt poisons any partner. This must be addressed regardless of who you are with.',
  defensiveness: 'If your partner leads with criticism, you will never hear each other.',
  stonewalling: 'If your partner expresses contempt, your shutdown will amplify their disgust.',
};

const ATTACHMENT_PAIRING_SCORES: Record<string, number> = {
  'secure_secure': 95,
  'secure_anxious': 70, 'anxious_secure': 70,
  'secure_avoidant': 65, 'avoidant_secure': 65,
  'secure_disorganized': 50, 'disorganized_secure': 50,
  'anxious_anxious': 55,
  'anxious_avoidant': 25, 'avoidant_anxious': 25,
  'anxious_disorganized': 30, 'disorganized_anxious': 30,
  'avoidant_avoidant': 45,
  'avoidant_disorganized': 35, 'disorganized_avoidant': 35,
  'disorganized_disorganized': 20,
};

// ─── Phase 1: Attachment Inference ───

export function inferAttachmentStyle(m4Data: any): AttachmentResult {
  const { conflictApproach, emotionalDrivers } = m4Data;
  const scores = emotionalDrivers.scores;
  const abandonment = scores.abandonment ?? 0;
  const engulfment = scores.engulfment ?? 0;
  const approach = conflictApproach.approach;
  const intensity = conflictApproach.intensity ?? 0;

  // Disorganized: High on both abandonment AND engulfment
  if (abandonment > 55 && engulfment > 55) {
    return {
      style: 'disorganized',
      confidence: Math.min(abandonment, engulfment) / 100,
      description: 'You experience contradictory impulses, wanting closeness but fearing it simultaneously. This creates unpredictable patterns in relationships.',
    };
  }

  // Anxious: High abandonment + pursue tendency
  if (abandonment > 50 && approach === 'pursue') {
    return {
      style: 'anxious',
      confidence: (abandonment / 100) * (intensity / 100),
      description: 'You seek closeness and reassurance, especially under stress. You may become hypervigilant to signs of disconnection.',
    };
  }

  // Avoidant: High engulfment + withdraw tendency
  if (engulfment > 50 && approach === 'withdraw') {
    return {
      style: 'avoidant',
      confidence: (engulfment / 100) * (intensity / 100),
      description: 'You value independence and may feel uncomfortable with too much closeness. You need space to regulate.',
    };
  }

  // Anxious without pursue (suppressed)
  if (abandonment > 60 && approach === 'withdraw') {
    return {
      style: 'anxious',
      confidence: 0.6,
      subtype: 'suppressed',
      description: 'You fear abandonment but have learned to withdraw rather than pursue. The anxiety is still there but expressed differently.',
    };
  }

  // Avoidant without withdraw (performative)
  if (engulfment > 60 && approach === 'pursue') {
    return {
      style: 'avoidant',
      confidence: 0.6,
      subtype: 'performative',
      description: 'You fear engulfment but have learned to pursue. You may pursue then pull back once closeness is achieved.',
    };
  }

  // Secure: Low on fear drivers, moderate approach
  if (abandonment < 45 && engulfment < 45 && intensity < 60) {
    return {
      style: 'secure',
      confidence: 1 - (Math.max(abandonment, engulfment) / 100),
      description: 'You are comfortable with both intimacy and independence. You can engage conflict without losing yourself or your partner.',
    };
  }

  // Default: leaning secure
  return {
    style: 'secure',
    confidence: 0.5,
    leaningToward: abandonment > engulfment ? 'anxious' : 'avoidant',
    description: 'You are generally secure but may lean toward ' +
      (abandonment > engulfment ? 'anxious' : 'avoidant') + ' patterns under significant stress.',
  };
}

// ─── Phase 2: Individual M3 State Modeling ───

export function calculateIndividualStateModifiers(m4Data: any): StateModifiers {
  const { conflictApproach, emotionalDrivers, emotionalCapacity } = m4Data;

  let conflictWantMod = 1.3;
  let conflictOfferMod = 0.6;
  const repairWantMod = 0.9;
  let repairOfferMod = 1.4;

  // Pursuers spike Want more
  if (conflictApproach.approach === 'pursue') {
    const intensityFactor = (conflictApproach.intensity ?? 0) / 100;
    conflictWantMod += 0.2 * intensityFactor;
  }

  // Withdrawers drop Offer more
  if (conflictApproach.approach === 'withdraw') {
    const intensityFactor = (conflictApproach.intensity ?? 0) / 100;
    conflictOfferMod -= 0.15 * intensityFactor;
  }

  // Driver adjustments
  if (emotionalDrivers.primary === 'abandonment') {
    conflictWantMod += 0.15 * ((emotionalDrivers.scores.abandonment ?? 0) / 100);
  }
  if (emotionalDrivers.primary === 'engulfment') {
    conflictOfferMod -= 0.1 * ((emotionalDrivers.scores.engulfment ?? 0) / 100);
  }
  if (emotionalDrivers.primary === 'inadequacy') {
    conflictWantMod -= 0.1 * ((emotionalDrivers.scores.inadequacy ?? 0) / 100);
    conflictOfferMod -= 0.1 * ((emotionalDrivers.scores.inadequacy ?? 0) / 100);
  }

  // Capacity dampening
  const capacityFactor = (emotionalCapacity.score ?? 50) / 100;
  const dampening = 0.3 * capacityFactor;
  conflictWantMod = 1 + (conflictWantMod - 1) * (1 - dampening);
  conflictOfferMod = 1 - (1 - conflictOfferMod) * (1 - dampening);

  // Repair adjustments
  if (m4Data.repairRecovery?.speed?.style === 'fast' || m4Data.repairRecovery?.speed?.style === 'quick') {
    repairOfferMod += 0.1;
  }
  if (m4Data.repairRecovery?.speed?.style === 'slow') {
    repairOfferMod -= 0.1;
  }

  return {
    conflict: {
      want: Math.max(1.0, Math.min(1.6, conflictWantMod)),
      offer: Math.max(0.4, Math.min(0.8, conflictOfferMod)),
    },
    repair: {
      want: repairWantMod,
      offer: Math.max(1.2, Math.min(1.6, repairOfferMod)),
    },
  };
}

export function calculateIndividualM3States(m3Data: any, m4Data: any): M3StatesResult {
  const wantScore: number = m3Data.wantScore ?? 50;
  const offerScore: number = m3Data.offerScore ?? 50;
  const modifiers = calculateIndividualStateModifiers(m4Data);

  const states = {
    normal: {
      want: wantScore,
      offer: offerScore,
      gap: wantScore - offerScore,
      label: 'Baseline',
    },
    conflict: {
      want: Math.min(100, Math.round(wantScore * modifiers.conflict.want)),
      offer: Math.max(0, Math.round(offerScore * modifiers.conflict.offer)),
      gap: 0,
      label: 'Under Stress',
    },
    repair: {
      want: Math.round(wantScore * modifiers.repair.want),
      offer: Math.min(100, Math.round(offerScore * modifiers.repair.offer)),
      gap: 0,
      label: 'Making Effort',
    },
  };

  states.conflict.gap = states.conflict.want - states.conflict.offer;
  states.repair.gap = states.repair.want - states.repair.offer;

  const gapExpansion = states.conflict.gap - states.normal.gap;
  const repairStrain = offerScore > 0 ? states.repair.offer / (offerScore * 1.2) : 1;
  const repairSustainable = repairStrain < 1.15;

  return {
    states,
    modifiers,
    insights: {
      gapExpansion,
      gapExpansionLevel: gapExpansion > 30 ? 'HIGH' : gapExpansion > 15 ? 'MODERATE' : 'LOW',
      repairSustainable,
      repairStrain: Math.round(repairStrain * 100),
      vulnerableState: states.conflict.gap > 40 ? 'conflict' : null,
    },
  };
}

// ─── Phase 3A: Attachment Compatibility Tiers ───

export function getAttachmentCompatibilityTiers(inferredAttachment: AttachmentResult): AttachmentTiersResult {
  const tiers = ATTACHMENT_COMPATIBILITY[inferredAttachment.style];

  return {
    yourStyle: inferredAttachment,
    bestMatches: (tiers.ideal || []).map(style => ({
      style,
      tier: 'ideal',
      score: style === 'secure' ? 95 : 85,
      note: null,
    })),
    goodMatches: (tiers.kismet || []).map(style => ({
      style,
      tier: 'kismet',
      score: style === inferredAttachment.style ? 55 : 70,
      note: style === inferredAttachment.style ? 'You understand each other but may reinforce patterns' : null,
    })),
    workableMatches: (tiers.effort || []).map(style => ({
      style,
      tier: 'effort',
      score: 40,
      note: 'Requires significant conscious effort from both partners',
    })),
    riskyMatches: (tiers.atRisk || []).map(style => ({
      style,
      tier: 'atRisk',
      score: 25,
      note: 'High failure probability without professional support',
    })),
    avoidMatches: (tiers.avoid || []).map(style => ({
      style,
      tier: 'incompatible',
      score: 15,
      note: AVOID_REASONS[`${inferredAttachment.style}_${style}`] || null,
    })),
    recommendation: tiers.description,
  };
}

// ─── Phase 3B: Driver Compatibility Tiers ───

export function getDriverCompatibilityTiers(m4Data: any): DriverTiersResult {
  const primary = m4Data.emotionalDrivers.primary;
  const secondary = m4Data.emotionalDrivers.secondary;
  const tiers = DRIVER_COMPATIBILITY[primary];

  if (!tiers) {
    return {
      yourDriver: { primary, secondary, scores: m4Data.emotionalDrivers.scores },
      bestMatches: [],
      goodMatches: [],
      workableMatches: [],
      avoidMatches: [],
      recommendation: 'Unable to determine driver compatibility.',
    };
  }

  return {
    yourDriver: { primary, secondary, scores: m4Data.emotionalDrivers.scores },
    bestMatches: tiers.ideal.map(driver => ({
      driver,
      tier: 'ideal',
      score: 85,
      reason: `Both understand ${driver} fear firsthand`,
    })),
    goodMatches: tiers.kismet.map(driver => ({
      driver,
      tier: 'kismet',
      score: 70,
      reason: 'Different fears but no direct collision',
    })),
    workableMatches: tiers.effort.map(driver => ({
      driver,
      tier: 'effort',
      score: 50,
      reason: 'Requires awareness and explicit protocols',
    })),
    avoidMatches: tiers.avoid.map(driver => ({
      driver,
      tier: 'incompatible',
      score: 15,
      reason: DRIVER_COLLISION_REASONS[`${primary}_${driver}`] || 'High collision risk',
    })),
    recommendation: tiers.description,
  };
}

// ─── Phase 3C: Horsemen Compatibility Insights ───

export function getHorsemenCompatibilityInsights(m4Data: any): HorsemenInsightsResult {
  const gottman = m4Data.gottmanScreener;
  const horsemenData = gottman?.horsemen || {};

  const insights: HorsemenInsightsResult = {
    yourProfile: {},
    risks: [],
    lookFor: [],
    avoid: [],
    idealPartnerProfile: { criticism: 40, contempt: 30, defensiveness: 40, stonewalling: 40 },
  };

  // Build profile from raw scores (4-20 range), normalize to 0-100 for comparisons
  const normalized: Record<string, number> = {};
  for (const [horseman, data] of Object.entries(horsemenData) as [string, any][]) {
    const raw = data.score ?? data ?? 0;
    const norm = normalizeGottmanScore(raw);
    normalized[horseman] = norm;
    insights.yourProfile[horseman] = {
      score: norm,
      level: data.riskLevel || (norm > 56 ? 'high' : norm > 37 ? 'medium' : 'low'),
    };

    if (norm > 50) {
      insights.risks.push({
        horseman,
        score: norm,
        partnerRisk: HORSEMEN_PARTNER_RISKS[horseman] || '',
      });
    }
  }

  // Criticism elevated → partner defensiveness is dangerous
  if ((normalized.criticism ?? 0) > 50) {
    insights.avoid.push({
      partnerTrait: 'High Defensiveness',
      reason: 'Your criticism + their defensiveness creates an escalation loop. Neither issue gets resolved.',
      threshold: 50,
    });
    insights.lookFor.push({
      partnerTrait: 'Low Defensiveness',
      reason: 'Partners who can hear criticism without counter-attacking allow repair.',
      threshold: 30,
    });
  }

  // Contempt elevated → partner stonewalling is dangerous
  if ((normalized.contempt ?? 0) > 50) {
    insights.avoid.push({
      partnerTrait: 'High Stonewalling',
      reason: 'Your contempt + their shutdown creates a death spiral. Contempt is the strongest divorce predictor.',
      threshold: 50,
    });
    insights.lookFor.push({
      partnerTrait: 'High Emotional Capacity',
      reason: 'Partners who can stay engaged despite your contempt give you room to change. But you must work on this.',
      threshold: 70,
    });
    insights.urgent = 'Contempt is the single strongest predictor of relationship failure. Regardless of partner, addressing this is critical.';
  }

  // Defensiveness elevated → partner criticism is dangerous
  if ((normalized.defensiveness ?? 0) > 50) {
    insights.avoid.push({
      partnerTrait: 'High Criticism',
      reason: 'Their criticism + your defensiveness means issues never get addressed.',
      threshold: 50,
    });
    insights.lookFor.push({
      partnerTrait: 'Gentle Communicator',
      reason: 'Partners who raise issues without attacking character give you room to hear them.',
    });
  }

  // Stonewalling elevated → partner contempt is dangerous
  if ((normalized.stonewalling ?? 0) > 50) {
    insights.avoid.push({
      partnerTrait: 'High Contempt',
      reason: 'Their contempt + your shutdown creates total disconnection.',
      threshold: 50,
    });
    insights.lookFor.push({
      partnerTrait: 'Patience with Flooding',
      reason: 'Partners who can give you space when flooded without escalating allow you to return.',
    });
  }

  // Ideal partner horsemen thresholds
  insights.idealPartnerProfile = {
    criticism: Math.max(0, Math.round(40 - (normalized.defensiveness ?? 0) * 0.3)),
    contempt: Math.max(0, Math.round(30 - (normalized.stonewalling ?? 0) * 0.3)),
    defensiveness: Math.max(0, Math.round(40 - (normalized.criticism ?? 0) * 0.3)),
    stonewalling: Math.max(0, Math.round(40 - (normalized.contempt ?? 0) * 0.3)),
  };

  return insights;
}

// ─── Phase 4: Individual Compatibility Profile ───

export function buildIndividualCompatibilityProfile(m3Data: any, m4Data: any): IndividualCompatibilityProfile {
  const attachment = inferAttachmentStyle(m4Data);
  const m3States = calculateIndividualM3States(m3Data, m4Data);
  const attachmentTiers = getAttachmentCompatibilityTiers(attachment);
  const driverTiers = getDriverCompatibilityTiers(m4Data);
  const horsemenInsights = getHorsemenCompatibilityInsights(m4Data);

  return {
    attachment,
    m3States,
    attachmentTiers,
    driverTiers,
    horsemenInsights,
    idealPartner: {
      attachment: attachmentTiers.bestMatches[0]?.style || 'secure',
      drivers: driverTiers.bestMatches[0]?.driver || m4Data.emotionalDrivers.primary,
      maxHorsemen: horsemenInsights.idealPartnerProfile,
      minEmotionalCapacity: 60,
    },
    calculatedAt: new Date().toISOString(),
  };
}

// ─── Phase 5: Couples Compatibility Scoring ───

// 5A: Couples M3 Dynamics using personalized state modifiers
export function calculateCouplesM3Dynamics(partnerA: any, partnerB: any) {
  const statesA = partnerA.individualCompatibility?.m3States?.states
    || calculateIndividualM3States(partnerA.m3, partnerA.m4).states;
  const statesB = partnerB.individualCompatibility?.m3States?.states
    || calculateIndividualM3States(partnerB.m3, partnerB.m4).states;

  const dynamics: Record<string, any> = {};

  for (const state of ['normal', 'conflict', 'repair'] as const) {
    const aSatisfaction = statesB[state].offer - statesA[state].want;
    const bSatisfaction = statesA[state].offer - statesB[state].want;
    const mutualSatisfaction = (aSatisfaction + bSatisfaction) / 2;
    const asymmetry = Math.abs(aSatisfaction - bSatisfaction);

    dynamics[state] = {
      aSatisfaction: Math.round(aSatisfaction),
      bSatisfaction: Math.round(bSatisfaction),
      mutualSatisfaction: Math.round(mutualSatisfaction),
      asymmetry: Math.round(asymmetry),
      sustainable: mutualSatisfaction > -10 && asymmetry < 30,
    };
  }

  // Repair sustainability
  const repairOfferA = statesA.repair.offer;
  const repairOfferB = statesB.repair.offer;
  const baseOfferA = statesA.normal.offer;
  const baseOfferB = statesB.normal.offer;
  const strainA = baseOfferA > 0 ? repairOfferA / (baseOfferA * 1.2) : 1;
  const strainB = baseOfferB > 0 ? repairOfferB / (baseOfferB * 1.2) : 1;

  dynamics.repairSustainability = {
    partnerA: { strain: Math.round(strainA * 100), sustainable: strainA < 1.15 },
    partnerB: { strain: Math.round(strainB * 100), sustainable: strainB < 1.15 },
    bothSustainable: strainA < 1.15 && strainB < 1.15,
  };

  return {
    partnerA: statesA,
    partnerB: statesB,
    dynamics,
  };
}

// 5B: Nine Compatibility Dimensions

function scorePersonaCompatibility(user1: any, user2: any): number {
  // Use existing persona compatibility table lookup — READ ONLY
  try {
    const personaModule = require('../../relate_persona_definitions.js');
    const u1Code = user1.personaCode || user1.m2?.code || user1.persona?.code;
    const u2Code = user2.personaCode || user2.m2?.code || user2.persona?.code;
    const u1Gender = user1.gender;

    const compatTable = u1Gender === 'M'
      ? personaModule.M2_COMPATIBILITY_TABLE
      : personaModule.W2_COMPATIBILITY_TABLE;

    if (!compatTable?.[u1Code]) return 50;

    const tierMap = compatTable[u1Code];
    const TIER_SCORES: Record<string, number> = {
      ideal: 95, kismet: 80, effort: 55, longShot: 35, atRisk: 20, incompatible: 5,
    };

    for (const [tier, codes] of Object.entries(tierMap) as [string, string[]][]) {
      if (codes.includes(u2Code)) return TIER_SCORES[tier] || 50;
    }
    return 30;
  } catch {
    return 50;
  }
}

function scorePreferenceAlignment(user1: any, user2: any): number {
  // M1 wants vs partner's M2 persona dimensions
  const dims = ['physical', 'social', 'lifestyle', 'values'];
  let matched = 0;
  let total = 0;

  for (const dim of dims) {
    const u1Want = user1.m1?.dimensions?.[dim]?.assignedPole;
    const u2Is = user2.m2?.dimensions?.[dim]?.assignedPole;
    if (u1Want && u2Is) {
      total++;
      if (u1Want === u2Is) matched++;
    }

    const u2Want = user2.m1?.dimensions?.[dim]?.assignedPole;
    const u1Is = user1.m2?.dimensions?.[dim]?.assignedPole;
    if (u2Want && u1Is) {
      total++;
      if (u2Want === u1Is) matched++;
    }
  }

  return total > 0 ? Math.round((matched / total) * 100) : 50;
}

function scoreIntimacyDynamics(m3Dynamics: any, state: string): number {
  const d = m3Dynamics.dynamics[state];
  if (!d) return 50;
  // Score based on mutual satisfaction and asymmetry
  const satScore = Math.max(0, Math.min(100, 50 + d.mutualSatisfaction));
  const asymPenalty = Math.min(30, d.asymmetry * 0.5);
  return Math.round(Math.max(0, satScore - asymPenalty));
}

function scoreConflictChoreography(user1: any, user2: any): {
  score: number;
  approachPairing: { pattern: string; score: number };
  driverCollision: { risk: string; score: number };
  repairCompat: { score: number };
  horsemenRisk: { score: number; loops: string[] };
} {
  const u1M4 = user1.m4 || {};
  const u2M4 = user2.m4 || {};

  // Approach pairing (25%)
  const u1Approach = u1M4.conflictApproach?.approach || 'unknown';
  const u2Approach = u2M4.conflictApproach?.approach || 'unknown';
  let approachScore = 50;
  let pattern = 'unknown';
  if (u1Approach === 'pursue' && u2Approach === 'pursue') {
    approachScore = 70; pattern = 'pursue_pursue';
  } else if (u1Approach === 'withdraw' && u2Approach === 'withdraw') {
    approachScore = 60; pattern = 'withdraw_withdraw';
  } else if (u1Approach !== u2Approach && u1Approach !== 'unknown' && u2Approach !== 'unknown') {
    approachScore = 40; pattern = 'pursue_withdraw';
  }

  // Driver collision (25%)
  const u1Driver = u1M4.emotionalDrivers?.primary || 'unknown';
  const u2Driver = u2M4.emotionalDrivers?.primary || 'unknown';
  let driverScore = 70;
  let driverRisk = 'LOW';
  if (u1Driver === 'abandonment' && u2Driver === 'engulfment' ||
      u1Driver === 'engulfment' && u2Driver === 'abandonment') {
    driverScore = 5; driverRisk = 'CRITICAL';
  } else if (u1Driver === u2Driver) {
    driverScore = 60; driverRisk = 'MODERATE';
  }

  // Repair compatibility (25%)
  const u1Speed = u1M4.repairRecovery?.speed?.style || 'unknown';
  const u2Speed = u2M4.repairRecovery?.speed?.style || 'unknown';
  const u1Mode = u1M4.repairRecovery?.mode?.style || 'unknown';
  const u2Mode = u2M4.repairRecovery?.mode?.style || 'unknown';
  let repairScore = 50;
  if (u1Speed === u2Speed && u1Speed !== 'unknown') repairScore += 25;
  else if (u1Speed !== u2Speed && u1Speed !== 'unknown' && u2Speed !== 'unknown') repairScore -= 15;
  if (u1Mode === u2Mode && u1Mode !== 'unknown') repairScore += 15;
  else if (u1Mode !== u2Mode && u1Mode !== 'unknown' && u2Mode !== 'unknown') repairScore -= 5;
  repairScore = Math.max(0, Math.min(100, repairScore));

  // Horsemen risk (25%)
  const u1Gottman = u1M4.gottmanScreener?.horsemen || {};
  const u2Gottman = u2M4.gottmanScreener?.horsemen || {};
  let horsemenScore = 80;
  const loops: string[] = [];

  const u1CritNorm = normalizeGottmanScore(u1Gottman.criticism?.score ?? 4);
  const u2DefNorm = normalizeGottmanScore(u2Gottman.defensiveness?.score ?? 4);
  const u2CritNorm = normalizeGottmanScore(u2Gottman.criticism?.score ?? 4);
  const u1DefNorm = normalizeGottmanScore(u1Gottman.defensiveness?.score ?? 4);
  const u1ContNorm = normalizeGottmanScore(u1Gottman.contempt?.score ?? 4);
  const u2StoneNorm = normalizeGottmanScore(u2Gottman.stonewalling?.score ?? 4);
  const u2ContNorm = normalizeGottmanScore(u2Gottman.contempt?.score ?? 4);
  const u1StoneNorm = normalizeGottmanScore(u1Gottman.stonewalling?.score ?? 4);

  // Criticism-Defensiveness loop
  if ((u1CritNorm > 50 && u2DefNorm > 50) || (u2CritNorm > 50 && u1DefNorm > 50)) {
    horsemenScore -= 25;
    loops.push('criticism-defensiveness');
  }
  // Contempt-Stonewalling loop (severe)
  if ((u1ContNorm > 50 && u2StoneNorm > 50) || (u2ContNorm > 50 && u1StoneNorm > 50)) {
    horsemenScore -= 35;
    loops.push('contempt-stonewalling');
  }

  // Average elevated horsemen penalty
  const allNorm = [u1CritNorm, u1ContNorm, u1DefNorm, u1StoneNorm, u2CritNorm, u2ContNorm, u2DefNorm, u2StoneNorm];
  const avgNorm = allNorm.reduce((a, b) => a + b, 0) / allNorm.length;
  if (avgNorm > 40) horsemenScore -= Math.round((avgNorm - 40) * 0.3);
  horsemenScore = Math.max(0, Math.min(100, horsemenScore));

  const totalScore = Math.round(approachScore * 0.25 + driverScore * 0.25 + repairScore * 0.25 + horsemenScore * 0.25);

  return {
    score: totalScore,
    approachPairing: { pattern, score: approachScore },
    driverCollision: { risk: driverRisk, score: driverScore },
    repairCompat: { score: repairScore },
    horsemenRisk: { score: horsemenScore, loops },
  };
}

function scoreAttachmentPairing(user1: any, user2: any): number {
  const a1 = user1.individualCompatibility?.attachment
    || inferAttachmentStyle(user1.m4);
  const a2 = user2.individualCompatibility?.attachment
    || inferAttachmentStyle(user2.m4);

  const key = `${a1.style}_${a2.style}`;
  return ATTACHMENT_PAIRING_SCORES[key] ?? 50;
}

function scoreEmotionalCapacity(user1: any, user2: any): number {
  const c1 = user1.m4?.emotionalCapacity?.score ?? 50;
  const c2 = user2.m4?.emotionalCapacity?.score ?? 50;
  const gap = Math.abs(c1 - c2);
  const avg = (c1 + c2) / 2;
  // Higher average is better, large gap is worse
  const avgScore = Math.min(100, avg * 1.2);
  const gapPenalty = Math.min(40, gap * 0.8);
  return Math.round(Math.max(0, avgScore - gapPenalty));
}

function scoreValuesAlignment(user1: any, user2: any): number {
  const u1Pole = user1.m1?.dimensions?.values?.assignedPole || user1.m2?.dimensions?.values?.assignedPole;
  const u2Pole = user2.m1?.dimensions?.values?.assignedPole || user2.m2?.dimensions?.values?.assignedPole;
  if (!u1Pole || !u2Pole) return 50;
  if (u1Pole === u2Pole) {
    const u1Str = user1.m1?.dimensions?.values?.strength ?? 50;
    const u2Str = user2.m1?.dimensions?.values?.strength ?? 50;
    return Math.min(100, 70 + Math.round((u1Str + u2Str) / 10));
  }
  return 30;
}

function scoreLifestyleAlignment(user1: any, user2: any): number {
  const u1Pole = user1.m1?.dimensions?.lifestyle?.assignedPole || user1.m2?.dimensions?.lifestyle?.assignedPole;
  const u2Pole = user2.m1?.dimensions?.lifestyle?.assignedPole || user2.m2?.dimensions?.lifestyle?.assignedPole;
  if (!u1Pole || !u2Pole) return 50;
  return u1Pole === u2Pole ? 80 : 35;
}

function scoreDemographics(user1: any, user2: any): number {
  let score = 60;
  const d1 = user1.demographics || {};
  const d2 = user2.demographics || {};

  // Age gap
  if (d1.age && d2.age) {
    const gap = Math.abs(d1.age - d2.age);
    if (gap <= 3) score += 20;
    else if (gap <= 7) score += 10;
    else if (gap <= 12) score -= 5;
    else score -= 15;
  }

  // Kids alignment
  if (d1.wantsKids && d2.wantsKids) {
    if (d1.wantsKids === d2.wantsKids) score += 15;
    else if (d1.wantsKids === 'maybe' || d2.wantsKids === 'maybe') score += 5;
    else score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

// 5C: State-specific weights
const DIMENSION_WEIGHTS = {
  normal: {
    persona: 0.15, preference: 0.12, intimacy: 0.12, conflict: 0.18,
    attachment: 0.15, capacity: 0.08, values: 0.10, lifestyle: 0.05, demographics: 0.05,
  },
  conflict: {
    persona: 0.05, preference: 0.03, intimacy: 0.15, conflict: 0.30,
    attachment: 0.20, capacity: 0.12, values: 0.08, lifestyle: 0.07, demographics: 0.00,
  },
  repair: {
    persona: 0.02, preference: 0.03, intimacy: 0.25, conflict: 0.35,
    attachment: 0.15, capacity: 0.15, values: 0.03, lifestyle: 0.02, demographics: 0.00,
  },
};

function getTier(score: number): string {
  if (score >= 80) return 'ideal';
  if (score >= 65) return 'kismet';
  if (score >= 45) return 'effort';
  if (score >= 25) return 'longShot';
  return 'atRisk';
}

// 5D: Ideal Profile Comparison
function scoreAttachmentMatch(idealStyle: string, actualStyle: string): number {
  return ATTACHMENT_PAIRING_SCORES[`${idealStyle}_${actualStyle}`]
    ?? ATTACHMENT_PAIRING_SCORES[`${actualStyle}_${idealStyle}`]
    ?? 50;
}

function scoreDriverMatch(idealDriver: string, actualDriver: string): number {
  if (!idealDriver || !actualDriver) return 50;
  const compat = DRIVER_COMPATIBILITY[idealDriver];
  if (!compat) return 50;
  if (compat.ideal.includes(actualDriver)) return 85;
  if (compat.kismet.includes(actualDriver)) return 70;
  if (compat.effort.includes(actualDriver)) return 50;
  if (compat.avoid.includes(actualDriver)) return 15;
  return 50;
}

function scoreHorsemenMatch(idealMax: Record<string, number>, actualProfile: any): number {
  const horsemenData = actualProfile?.gottmanScreener?.horsemen || {};
  let totalDiff = 0;
  let count = 0;

  for (const [horseman, maxVal] of Object.entries(idealMax)) {
    const raw = horsemenData[horseman]?.score ?? 4;
    const norm = normalizeGottmanScore(raw);
    const diff = Math.max(0, norm - maxVal);
    totalDiff += diff;
    count++;
  }

  if (count === 0) return 50;
  const avgDiff = totalDiff / count;
  return Math.round(Math.max(0, 100 - avgDiff * 2));
}

function compareIdealProfiles(user1: any, user2: any): any {
  const profile1 = user1.individualCompatibility;
  const profile2 = user2.individualCompatibility;

  if (!profile1 || !profile2) {
    return { partnerAGetsFromB: null, partnerBGetsFromA: null, mutualFit: 50, asymmetry: 0 };
  }

  const ideal1 = profile1.idealPartner;
  const ideal2 = profile2.idealPartner;

  // How well does B match A's ideal?
  const bMatchesA = {
    attachment: scoreAttachmentMatch(ideal1.attachment, profile2.attachment.style),
    driver: scoreDriverMatch(ideal1.drivers, profile2.driverTiers.yourDriver.primary),
    horsemen: scoreHorsemenMatch(ideal1.maxHorsemen, user2.m4),
    overall: 0,
  };
  bMatchesA.overall = Math.round(bMatchesA.attachment * 0.4 + bMatchesA.driver * 0.35 + bMatchesA.horsemen * 0.25);

  // How well does A match B's ideal?
  const aMatchesB = {
    attachment: scoreAttachmentMatch(ideal2.attachment, profile1.attachment.style),
    driver: scoreDriverMatch(ideal2.drivers, profile1.driverTiers.yourDriver.primary),
    horsemen: scoreHorsemenMatch(ideal2.maxHorsemen, user1.m4),
    overall: 0,
  };
  aMatchesB.overall = Math.round(aMatchesB.attachment * 0.4 + aMatchesB.driver * 0.35 + aMatchesB.horsemen * 0.25);

  return {
    partnerAGetsFromB: {
      ...bMatchesA,
      summary: `Partner B is ${bMatchesA.overall}% of Partner A's ideal profile`,
    },
    partnerBGetsFromA: {
      ...aMatchesB,
      summary: `Partner A is ${aMatchesB.overall}% of Partner B's ideal profile`,
    },
    mutualFit: Math.round((bMatchesA.overall + aMatchesB.overall) / 2),
    asymmetry: Math.abs(bMatchesA.overall - aMatchesB.overall),
  };
}

// ─── Phase 5 Orchestrator ───

export function calculateEnhancedCouplesCompatibility(user1Results: any, user2Results: any) {
  // Ensure individual profiles exist
  if (!user1Results.individualCompatibility) {
    user1Results.individualCompatibility = buildIndividualCompatibilityProfile(user1Results.m3, user1Results.m4);
  }
  if (!user2Results.individualCompatibility) {
    user2Results.individualCompatibility = buildIndividualCompatibilityProfile(user2Results.m3, user2Results.m4);
  }

  // 5A: M3 dynamics with personalized modifiers
  const intimacyDynamics = calculateCouplesM3Dynamics(user1Results, user2Results);

  // 5B: Score all 9 dimensions
  const personaScore = scorePersonaCompatibility(user1Results, user2Results);
  const preferenceScore = scorePreferenceAlignment(user1Results, user2Results);
  const conflictResult = scoreConflictChoreography(user1Results, user2Results);
  const attachmentScore = scoreAttachmentPairing(user1Results, user2Results);
  const capacityScore = scoreEmotionalCapacity(user1Results, user2Results);
  const valuesScore = scoreValuesAlignment(user1Results, user2Results);
  const lifestyleScore = scoreLifestyleAlignment(user1Results, user2Results);
  const demoScore = scoreDemographics(user1Results, user2Results);

  // 5C: State-specific scoring
  const stateScores: Record<string, { score: number; tier: string }> = {};

  for (const state of ['normal', 'conflict', 'repair'] as const) {
    const w = DIMENSION_WEIGHTS[state];
    const intimacyScore = scoreIntimacyDynamics(intimacyDynamics, state);

    const weighted =
      personaScore * w.persona +
      preferenceScore * w.preference +
      intimacyScore * w.intimacy +
      conflictResult.score * w.conflict +
      attachmentScore * w.attachment +
      capacityScore * w.capacity +
      valuesScore * w.values +
      lifestyleScore * w.lifestyle +
      demoScore * w.demographics;

    const score = Math.round(weighted);
    stateScores[state] = { score, tier: getTier(score) };
  }

  // Overall = weighted average of states (normal 50%, conflict 30%, repair 20%)
  const overallScore = Math.round(
    stateScores.normal.score * 0.50 +
    stateScores.conflict.score * 0.30 +
    stateScores.repair.score * 0.20
  );

  // 5D: Ideal profile comparison
  const idealComparison = compareIdealProfiles(user1Results, user2Results);

  return {
    summary: {
      overallScore,
      tier: getTier(overallScore),
      normalState: stateScores.normal,
      conflictState: stateScores.conflict,
      repairState: stateScores.repair,
    },
    dimensions: [
      { name: 'Persona Compatibility', weight: 0.15, scores: { normal: personaScore, conflict: personaScore, repair: personaScore } },
      { name: 'Preference Alignment', weight: 0.12, scores: { normal: preferenceScore, conflict: preferenceScore, repair: preferenceScore } },
      { name: 'Intimacy Dynamics', weight: 0.12, scores: { normal: scoreIntimacyDynamics(intimacyDynamics, 'normal'), conflict: scoreIntimacyDynamics(intimacyDynamics, 'conflict'), repair: scoreIntimacyDynamics(intimacyDynamics, 'repair') } },
      { name: 'Conflict Choreography', weight: 0.18, scores: { normal: conflictResult.score, conflict: conflictResult.score, repair: conflictResult.score } },
      { name: 'Attachment Pairing', weight: 0.15, scores: { normal: attachmentScore, conflict: attachmentScore, repair: attachmentScore } },
      { name: 'Emotional Capacity', weight: 0.08, scores: { normal: capacityScore, conflict: capacityScore, repair: capacityScore } },
      { name: 'Values Alignment', weight: 0.10, scores: { normal: valuesScore, conflict: valuesScore, repair: valuesScore } },
      { name: 'Lifestyle Alignment', weight: 0.05, scores: { normal: lifestyleScore, conflict: lifestyleScore, repair: lifestyleScore } },
      { name: 'Demographics', weight: 0.05, scores: { normal: demoScore, conflict: demoScore, repair: demoScore } },
    ],
    intimacyDynamics,
    conflictChoreography: {
      approachPairing: conflictResult.approachPairing,
      driverCollision: conflictResult.driverCollision,
      repairCompatibility: conflictResult.repairCompat,
      horsemenRisk: conflictResult.horsemenRisk,
    },
    idealComparison,
    stateComparison: {
      normal: intimacyDynamics.dynamics.normal,
      conflict: intimacyDynamics.dynamics.conflict,
      repair: intimacyDynamics.dynamics.repair,
      conflictDynamics: {
        gapExpansionA: user1Results.individualCompatibility.m3States.insights.gapExpansion,
        gapExpansionB: user2Results.individualCompatibility.m3States.insights.gapExpansion,
        combinedRisk: (user1Results.individualCompatibility.m3States.insights.gapExpansion +
          user2Results.individualCompatibility.m3States.insights.gapExpansion) > 50 ? 'HIGH' : 'MODERATE',
      },
    },
    calculatedAt: new Date().toISOString(),
  };
}
