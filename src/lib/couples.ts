// Couples report generation engine
// Produces a 7-section compatibility report from two partners' results

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Section 1: Pairing Overview ──
function generatePairingOverview(user1: any, user2: any): any {
  const u1Code = user1.m2?.code || user1.personaCode || '????';
  const u2Code = user2.m2?.code || user2.personaCode || '????';
  const u1Name = user1.persona?.name || u1Code;
  const u2Name = user2.persona?.name || u2Code;

  // Calculate overall compatibility from dimension alignment
  const dims = ['physical', 'social', 'lifestyle', 'values'];
  let shared = 0;
  let totalStrength = 0;
  const dimensionComparisons: any[] = [];

  for (const dim of dims) {
    const u1Dim = user1.m1?.dimensions?.[dim] || user1.m2?.dimensions?.[dim];
    const u2Dim = user2.m1?.dimensions?.[dim] || user2.m2?.dimensions?.[dim];
    const u1Pole = u1Dim?.assignedPole || '-';
    const u2Pole = u2Dim?.assignedPole || '-';
    const aligned = u1Pole === u2Pole;
    if (aligned) shared++;
    totalStrength += (u1Dim?.strength || 50) + (u2Dim?.strength || 50);

    dimensionComparisons.push({
      dimension: dim,
      user1Pole: u1Pole,
      user2Pole: u2Pole,
      user1Strength: u1Dim?.strength || 50,
      user2Strength: u2Dim?.strength || 50,
      aligned,
    });
  }

  const alignmentPercent = Math.round((shared / dims.length) * 100);
  const avgStrength = Math.round(totalStrength / (dims.length * 2));

  // Overall compatibility score (simple weighted average)
  const m3Compat = calculateM3CouplesCompat(user1.m3, user2.m3);
  const m4Compat = calculateM4CouplesCompat(user1.m4, user2.m4);
  const overallScore = Math.round(alignmentPercent * 0.35 + m3Compat * 0.30 + m4Compat * 0.35);

  // Pairing archetype
  const archetype = determinePairingArchetype(alignmentPercent, m3Compat, m4Compat);

  return {
    user1: { code: u1Code, name: u1Name, gender: user1.gender },
    user2: { code: u2Code, name: u2Name, gender: user2.gender },
    overallScore,
    alignmentPercent,
    m3Compat,
    m4Compat,
    dimensionComparisons,
    archetype,
  };
}

function determinePairingArchetype(alignment: number, m3: number, m4: number): { name: string; description: string; emoji: string } {
  const avg = (alignment + m3 + m4) / 3;
  if (avg >= 75) return { name: 'Natural Partners', description: 'Strong instinctive alignment across values, connection style, and conflict approach. Your relationship has a high natural baseline.', emoji: '◆' };
  if (avg >= 60) return { name: 'Complementary Pair', description: 'Your differences create strength. Where one leads, the other supports. The key is recognizing and valuing what each brings.', emoji: '◇' };
  if (avg >= 45) return { name: 'Growth Partners', description: 'Your relationship will push both of you to grow. The areas of friction are also your greatest opportunities for development.', emoji: '○' };
  return { name: 'Challenge Pair', description: 'Significant differences require conscious effort and strong communication. Success depends on both partners\' commitment to understanding each other.', emoji: '△' };
}

// ── Section 2: Where You Align ──
function generateAlignmentSection(user1: any, user2: any): any {
  const parallels: any[] = [];
  const dims = ['physical', 'social', 'lifestyle', 'values'];

  for (const dim of dims) {
    const u1Dim = user1.m1?.dimensions?.[dim] || {};
    const u2Dim = user2.m1?.dimensions?.[dim] || {};
    const u1M2Dim = user1.m2?.dimensions?.[dim] || {};
    const u2M2Dim = user2.m2?.dimensions?.[dim] || {};

    // M1 alignment: what you want matches what they want
    if (u1Dim.assignedPole && u2Dim.assignedPole && u1Dim.assignedPole === u2Dim.assignedPole) {
      parallels.push({
        dimension: dim,
        type: 'shared_desire',
        pole: u1Dim.assignedPole,
        strength: Math.min(u1Dim.strength || 50, u2Dim.strength || 50),
        narrative: `You both prioritize the same direction in ${dim}. This creates natural understanding.`,
      });
    }

    // Cross alignment: what they want matches what you offer
    if (u1Dim.assignedPole && u2M2Dim.assignedPole && u1Dim.assignedPole === u2M2Dim.assignedPole) {
      parallels.push({
        dimension: dim,
        type: 'want_offer_match',
        pole: u1Dim.assignedPole,
        strength: Math.min(u1Dim.strength || 50, u2M2Dim.strength || 50),
        narrative: `What ${user1.persona?.name || 'Partner 1'} wants in ${dim}, ${user2.persona?.name || 'Partner 2'} naturally offers.`,
      });
    }
  }

  // M3 connection alignment
  const m3Alignment = {
    wantGap: Math.abs((user1.m3?.wantScore || 50) - (user2.m3?.offerScore || 50)),
    offerGap: Math.abs((user1.m3?.offerScore || 50) - (user2.m3?.wantScore || 50)),
    reciprocal: false,
    narrative: '',
  };
  m3Alignment.reciprocal = m3Alignment.wantGap < 15 && m3Alignment.offerGap < 15;
  m3Alignment.narrative = m3Alignment.reciprocal
    ? 'Your connection needs and offers are well-matched. What one wants, the other gives.'
    : 'There\'s a gap in your connection exchange. One of you may feel they give more than they receive.';

  return { parallels, m3Alignment, totalParallels: parallels.length };
}

// ── Section 3: Where You Clash ──
function generateClashSection(user1: any, user2: any): any {
  const clashes: any[] = [];
  const dims = ['physical', 'social', 'lifestyle', 'values'];

  for (const dim of dims) {
    const u1Dim = user1.m1?.dimensions?.[dim] || {};
    const u2Dim = user2.m1?.dimensions?.[dim] || {};

    if (u1Dim.assignedPole && u2Dim.assignedPole && u1Dim.assignedPole !== u2Dim.assignedPole) {
      const bothStrong = (u1Dim.strength || 0) > 60 && (u2Dim.strength || 0) > 60;
      clashes.push({
        dimension: dim,
        user1Pole: u1Dim.assignedPole,
        user2Pole: u2Dim.assignedPole,
        user1Strength: u1Dim.strength || 50,
        user2Strength: u2Dim.strength || 50,
        severity: bothStrong ? 'high' : 'moderate',
        narrative: bothStrong
          ? `Both of you feel strongly about opposite directions in ${dim}. This requires deliberate negotiation.`
          : `You differ in ${dim}, but at least one of you holds this lightly - making compromise easier.`,
      });
    }
  }

  // M3 tension: want/offer imbalance
  const wantGap = (user1.m3?.wantScore || 50) - (user2.m3?.offerScore || 50);
  const offerGap = (user1.m3?.offerScore || 50) - (user2.m3?.wantScore || 50);
  let connectionTension = null;
  if (Math.abs(wantGap) > 20 || Math.abs(offerGap) > 20) {
    connectionTension = {
      wantGap,
      offerGap,
      narrative: wantGap > 20
        ? `${user1.persona?.name || 'Partner 1'} wants more connection than ${user2.persona?.name || 'Partner 2'} typically offers. This gap needs conscious attention.`
        : `${user2.persona?.name || 'Partner 2'} wants more connection than ${user1.persona?.name || 'Partner 1'} typically offers. Building awareness here is key.`,
    };
  }

  return { clashes, connectionTension, totalClashes: clashes.length };
}

// ── Section 4: Conflict Choreography ──
function generateConflictChoreography(user1: any, user2: any): any {
  const u1M4 = user1.m4 || {};
  const u2M4 = user2.m4 || {};

  const u1Approach = u1M4.conflictApproach?.approach || u1M4.summary?.approach || 'unknown';
  const u2Approach = u2M4.conflictApproach?.approach || u2M4.summary?.approach || 'unknown';

  const pursueWithdraw = u1Approach !== u2Approach && u1Approach !== 'unknown' && u2Approach !== 'unknown';
  const bothPursue = u1Approach === 'pursue' && u2Approach === 'pursue';
  const bothWithdraw = u1Approach === 'withdraw' && u2Approach === 'withdraw';

  let dynamicLabel = 'Mixed';
  let dynamicDescription = '';
  if (pursueWithdraw) {
    dynamicLabel = 'Pursue-Withdraw';
    dynamicDescription = 'One of you moves toward conflict while the other pulls away. The pursuer needs to give space; the withdrawer needs to signal they\'ll return.';
  } else if (bothPursue) {
    dynamicLabel = 'Dual Pursuit';
    dynamicDescription = 'Both of you move toward conflict. Arguments can escalate quickly. The advantage: nothing goes unaddressed. The risk: burnout from constant engagement.';
  } else if (bothWithdraw) {
    dynamicLabel = 'Dual Withdrawal';
    dynamicDescription = 'Both of you pull away during conflict. Issues may go unresolved. Building explicit check-in rituals prevents resentment from accumulating.';
  }

  // Emotional drivers
  const u1Driver = u1M4.emotionalDrivers?.primary || u1M4.summary?.primaryDriver || 'unknown';
  const u2Driver = u2M4.emotionalDrivers?.primary || u2M4.summary?.primaryDriver || 'unknown';
  const driverCollision = u1Driver === u2Driver && u1Driver !== 'unknown';

  const driverAnalysis = {
    user1Driver: u1Driver,
    user2Driver: u2Driver,
    collision: driverCollision,
    narrative: driverCollision
      ? `You share the same primary emotional driver (${u1Driver}). This means you deeply understand each other\'s triggers - but can also accidentally activate them.`
      : `Different primary drivers (${u1Driver} vs ${u2Driver}) mean your emotional triggers are distinct. Learning your partner\'s driver is key to de-escalation.`,
  };

  // Repair compatibility
  const u1Speed = u1M4.repairRecovery?.speed?.style || u1M4.summary?.repairSpeed || 'unknown';
  const u2Speed = u2M4.repairRecovery?.speed?.style || u2M4.summary?.repairSpeed || 'unknown';
  const u1Mode = u1M4.repairRecovery?.mode?.style || u1M4.summary?.repairMode || 'unknown';
  const u2Mode = u2M4.repairRecovery?.mode?.style || u2M4.summary?.repairMode || 'unknown';

  const speedMatch = u1Speed === u2Speed;
  const modeMatch = u1Mode === u2Mode;

  return {
    dynamic: { label: dynamicLabel, description: dynamicDescription },
    user1Approach: u1Approach,
    user2Approach: u2Approach,
    driverAnalysis,
    repair: {
      user1Speed: u1Speed,
      user2Speed: u2Speed,
      user1Mode: u1Mode,
      user2Mode: u2Mode,
      speedMatch,
      modeMatch,
      narrative: speedMatch && modeMatch
        ? 'Your repair styles are well-matched. You recover from conflict at similar paces and in similar ways.'
        : !speedMatch
          ? `One of you recovers quickly while the other needs more time. The fast repairer needs patience; the slow repairer needs to communicate that they\'re processing, not stonewalling.`
          : `You repair through different channels (${u1Mode} vs ${u2Mode}). Understanding your partner\'s preferred repair language prevents misread signals.`,
    },
  };
}

// ── Section 5: Repair Compatibility ──
function generateRepairCompatibility(user1: any, user2: any): any {
  const u1M4 = user1.m4 || {};
  const u2M4 = user2.m4 || {};

  // Gottman horsemen comparison
  const u1Gottman = u1M4.gottmanScreener?.horsemen || {};
  const u2Gottman = u2M4.gottmanScreener?.horsemen || {};

  const horsemen = ['criticism', 'contempt', 'defensiveness', 'stonewalling'].map(h => {
    const u1Score = u1Gottman[h] || 0;
    const u2Score = u2Gottman[h] || 0;
    const combined = Math.round((u1Score + u2Score) / 2);
    const riskLevel = combined > 14 ? 'high' : combined > 10 ? 'moderate' : 'low';
    return { horseman: h, user1Score: u1Score, user2Score: u2Score, combined, riskLevel };
  });

  const highRiskHorsemen = horsemen.filter(h => h.riskLevel === 'high');
  const overallRisk = highRiskHorsemen.length >= 2 ? 'high' : highRiskHorsemen.length === 1 ? 'moderate' : 'low';

  // Capacity comparison
  const u1Capacity = u1M4.emotionalCapacity?.score || 50;
  const u2Capacity = u2M4.emotionalCapacity?.score || 50;
  const capacityGap = Math.abs(u1Capacity - u2Capacity);

  return {
    horsemen,
    highRiskHorsemen: highRiskHorsemen.map(h => h.horseman),
    overallRisk,
    capacity: {
      user1Score: u1Capacity,
      user1Level: u1M4.emotionalCapacity?.level || 'medium',
      user2Score: u2Capacity,
      user2Level: u2M4.emotionalCapacity?.level || 'medium',
      gap: capacityGap,
      narrative: capacityGap < 10
        ? 'Your emotional capacities are well-matched. You can handle similar levels of relational stress.'
        : `There\'s a meaningful gap in emotional capacity (${capacityGap} points). The higher-capacity partner may need to actively support the other during high-stress periods.`,
    },
  };
}

// ── Section 6: Daily Life Preview ──
function generateDailyLifePreview(user1: any, user2: any): any {
  const scenarios = [];

  // Connection style in daily life
  const u1Want = user1.m3?.wantScore || 50;
  const u2Want = user2.m3?.wantScore || 50;
  const u1Offer = user1.m3?.offerScore || 50;
  const u2Offer = user2.m3?.offerScore || 50;

  scenarios.push({
    area: 'Daily Connection',
    dynamic: u1Want > 60 && u2Offer < 40
      ? 'One partner craves more daily connection than the other naturally provides. Building rituals (morning check-in, evening debrief) helps bridge this gap.'
      : u1Offer > 60 && u2Want < 40
        ? 'One partner offers more closeness than the other needs. Respecting space while staying accessible is the balance to strike.'
        : 'Your daily connection needs are reasonably aligned. Maintain this with consistent small gestures.',
    user1Score: u1Want,
    user2Score: u2Offer,
  });

  // Values alignment in daily decisions
  const u1Values = user1.m1?.dimensions?.values || {};
  const u2Values = user2.m1?.dimensions?.values || {};
  scenarios.push({
    area: 'Decision Making',
    dynamic: u1Values.assignedPole === u2Values.assignedPole
      ? 'Shared values make big decisions easier. You\'ll naturally agree on priorities around finances, family, and life direction.'
      : 'Different value orientations mean big decisions require more discussion. Neither perspective is wrong - the key is finding integrative solutions.',
    user1Pole: u1Values.assignedPole || '-',
    user2Pole: u2Values.assignedPole || '-',
  });

  // Social life
  const u1Social = user1.m1?.dimensions?.social || {};
  const u2Social = user2.m1?.dimensions?.social || {};
  scenarios.push({
    area: 'Social Life',
    dynamic: u1Social.assignedPole === u2Social.assignedPole
      ? 'Similar social preferences mean less friction around how you spend weekends and who you spend time with.'
      : 'Different social needs mean negotiating friend groups, social events, and alone time. Building a shared social calendar with individual flexibility works well.',
    user1Pole: u1Social.assignedPole || '-',
    user2Pole: u2Social.assignedPole || '-',
  });

  // Stress response
  const u1Approach = user1.m4?.conflictApproach?.approach || user1.m4?.summary?.approach || 'unknown';
  const u2Approach = user2.m4?.conflictApproach?.approach || user2.m4?.summary?.approach || 'unknown';
  scenarios.push({
    area: 'Under Stress',
    dynamic: u1Approach === u2Approach
      ? `You both ${u1Approach === 'pursue' ? 'engage directly' : 'withdraw to process'} under stress. This symmetry means you instinctively understand each other - but may also amplify the pattern.`
      : 'Different stress responses create a natural counterbalance - but only if both partners understand the pattern. The pursuer gives space; the withdrawer comes back.',
    user1Approach: u1Approach,
    user2Approach: u2Approach,
  });

  return { scenarios };
}

// ── Section 7: Ceiling & Floor ──
function generateCeilingFloor(user1: any, user2: any, overview: any): any {
  const overallScore = overview.overallScore || 50;

  // Ceiling: best-case scenario
  const ceilingFactors = [];
  if (overview.alignmentPercent >= 50) ceilingFactors.push('Strong value and preference alignment');
  if (overview.m3Compat >= 60) ceilingFactors.push('Well-matched connection styles');
  if (overview.m4Compat >= 60) ceilingFactors.push('Compatible conflict approaches');

  const u1Capacity = user1.m4?.emotionalCapacity?.level || 'medium';
  const u2Capacity = user2.m4?.emotionalCapacity?.level || 'medium';
  if (u1Capacity === 'high' && u2Capacity === 'high') ceilingFactors.push('Both partners have high emotional capacity');
  if (u1Capacity === 'high' || u2Capacity === 'high') ceilingFactors.push('At least one partner has high emotional capacity');

  // Floor: risk factors
  const floorFactors = [];
  const u1Gottman = user1.m4?.gottmanScreener?.horsemen || {};
  const u2Gottman = user2.m4?.gottmanScreener?.horsemen || {};
  for (const h of ['criticism', 'contempt', 'defensiveness', 'stonewalling']) {
    if ((u1Gottman[h] || 0) > 14 || (u2Gottman[h] || 0) > 14) {
      floorFactors.push(`High ${h} risk requires active management`);
    }
  }
  if (overview.alignmentPercent < 25) floorFactors.push('Significant value misalignment');
  if (overview.m3Compat < 40) floorFactors.push('Connection style mismatch');

  // Ceiling and floor scores
  const ceiling = Math.min(100, overallScore + 20 + ceilingFactors.length * 3);
  const floor = Math.max(0, overallScore - 15 - floorFactors.length * 5);

  // Growth potential
  const growthPotential = ceiling - overallScore;
  const riskExposure = overallScore - floor;

  return {
    ceiling: Math.round(ceiling),
    floor: Math.round(floor),
    current: overallScore,
    growthPotential: Math.round(growthPotential),
    riskExposure: Math.round(riskExposure),
    ceilingFactors: ceilingFactors.length > 0 ? ceilingFactors : ['Relationship potential exists in all pairings with mutual commitment'],
    floorFactors: floorFactors.length > 0 ? floorFactors : ['No significant risk factors identified'],
    narrative: growthPotential > riskExposure
      ? 'Your upside potential exceeds your downside risk. With intentional effort, this relationship can significantly outperform its baseline.'
      : 'Your risk exposure is notable. Focus on the floor factors first - shoring up vulnerabilities protects the relationship\'s foundation before building higher.',
  };
}

// ── Helpers ──
function calculateM3CouplesCompat(u1M3: any, u2M3: any): number {
  if (!u1M3 || !u2M3) return 50;
  const wantOfferGap = Math.abs((u1M3.wantScore || 50) - (u2M3.offerScore || 50));
  const offerWantGap = Math.abs((u1M3.offerScore || 50) - (u2M3.wantScore || 50));
  return Math.max(0, Math.round(100 - (wantOfferGap + offerWantGap) / 2));
}

function calculateM4CouplesCompat(u1M4: any, u2M4: any): number {
  if (!u1M4 || !u2M4) return 50;
  let score = 50;

  const u1Approach = u1M4.conflictApproach?.approach || u1M4.summary?.approach;
  const u2Approach = u2M4.conflictApproach?.approach || u2M4.summary?.approach;
  if (u1Approach && u2Approach && u1Approach !== u2Approach) score += 10;

  const u1Speed = u1M4.repairRecovery?.speed?.style || u1M4.summary?.repairSpeed;
  const u2Speed = u2M4.repairRecovery?.speed?.style || u2M4.summary?.repairSpeed;
  if (u1Speed && u2Speed && u1Speed === u2Speed) score += 10;

  const u1Mode = u1M4.repairRecovery?.mode?.style || u1M4.summary?.repairMode;
  const u2Mode = u2M4.repairRecovery?.mode?.style || u2M4.summary?.repairMode;
  if (u1Mode && u2Mode && u1Mode === u2Mode) score += 5;

  const u1Cap = u1M4.emotionalCapacity?.score || 50;
  const u2Cap = u2M4.emotionalCapacity?.score || 50;
  if (Math.abs(u1Cap - u2Cap) < 15) score += 10;

  const u1Driver = u1M4.emotionalDrivers?.primary || u1M4.summary?.primaryDriver;
  const u2Driver = u2M4.emotionalDrivers?.primary || u2M4.summary?.primaryDriver;
  if (u1Driver && u2Driver && u1Driver === u2Driver) score -= 10;

  return Math.max(0, Math.min(100, score));
}

// ── Main Export ──
export function generateCouplesReport(user1Results: any, user2Results: any): any {
  const overview = generatePairingOverview(user1Results, user2Results);
  const alignment = generateAlignmentSection(user1Results, user2Results);
  const clashes = generateClashSection(user1Results, user2Results);
  const conflictChoreography = generateConflictChoreography(user1Results, user2Results);
  const repairCompatibility = generateRepairCompatibility(user1Results, user2Results);
  const dailyLife = generateDailyLifePreview(user1Results, user2Results);
  const ceilingFloor = generateCeilingFloor(user1Results, user2Results, overview);

  return {
    overview,
    alignment,
    clashes,
    conflictChoreography,
    repairCompatibility,
    dailyLife,
    ceilingFloor,
    generatedAt: new Date().toISOString(),
  };
}

// ── Growth Plan Utilities ──

export const CHALLENGE_LIBRARY = [
  // Connection challenges
  { id: 'c1', category: 'connection', title: 'Morning Check-In', description: 'Start each day by sharing one thing you\'re looking forward to and one thing you\'re nervous about.', points: 10, duration: '7 days' },
  { id: 'c2', category: 'connection', title: 'Screen-Free Dinner', description: 'Have dinner together with no phones or screens for three consecutive days.', points: 15, duration: '3 days' },
  { id: 'c3', category: 'connection', title: 'Appreciation Journal', description: 'Write three specific things you appreciate about your partner each day for a week.', points: 20, duration: '7 days' },
  { id: 'c4', category: 'connection', title: 'Active Listening Exercise', description: 'Take turns speaking for 5 minutes while the other only listens. No advice, just understanding.', points: 10, duration: '1 session' },
  // Conflict challenges
  { id: 'f1', category: 'conflict', title: 'Repair Ritual', description: 'When a conflict arises, practice a 20-minute cool-down before re-engaging. Signal to your partner that you\'re taking space, not abandoning.', points: 15, duration: '2 weeks' },
  { id: 'f2', category: 'conflict', title: 'Softened Startup', description: 'Replace one criticism with a request. Instead of "You never..." try "I would love it if..."', points: 10, duration: '1 week' },
  { id: 'f3', category: 'conflict', title: 'Driver Awareness', description: 'When you feel triggered, name your emotional driver out loud: "I think my [driver] is activated right now."', points: 20, duration: '2 weeks' },
  { id: 'f4', category: 'conflict', title: 'Gottman Antidote', description: 'Practice the antidote to your highest horseman score for one week.', points: 25, duration: '1 week' },
  // Growth challenges
  { id: 'g1', category: 'growth', title: 'Vulnerability Share', description: 'Share something with your partner that you\'ve been hesitant to bring up. Start small.', points: 15, duration: '1 session' },
  { id: 'g2', category: 'growth', title: 'Dream Mapping', description: 'Each partner shares their vision for the relationship in 5 years. Find the overlaps.', points: 20, duration: '1 session' },
  { id: 'g3', category: 'growth', title: 'Weekly State of the Union', description: 'Spend 30 minutes discussing what\'s working and what needs attention in your relationship.', points: 15, duration: 'weekly' },
  { id: 'g4', category: 'growth', title: 'Shared Experience', description: 'Try something new together that neither of you has done before.', points: 20, duration: '1 session' },
];

export const GROWTH_LEVELS = [
  { level: 1, name: 'Getting Started', pointsRequired: 0 },
  { level: 2, name: 'Building Awareness', pointsRequired: 50 },
  { level: 3, name: 'Developing Habits', pointsRequired: 150 },
  { level: 4, name: 'Deepening Connection', pointsRequired: 300 },
  { level: 5, name: 'Relationship Masters', pointsRequired: 500 },
];

export function getGrowthLevel(points: number): { level: number; name: string; pointsToNext: number; progress: number } {
  let current = GROWTH_LEVELS[0];
  let next = GROWTH_LEVELS[1];

  for (let i = GROWTH_LEVELS.length - 1; i >= 0; i--) {
    if (points >= GROWTH_LEVELS[i].pointsRequired) {
      current = GROWTH_LEVELS[i];
      next = GROWTH_LEVELS[i + 1] || GROWTH_LEVELS[i];
      break;
    }
  }

  const pointsToNext = next.pointsRequired - points;
  const rangeSize = next.pointsRequired - current.pointsRequired;
  const progress = rangeSize > 0 ? Math.round(((points - current.pointsRequired) / rangeSize) * 100) : 100;

  return { level: current.level, name: current.name, pointsToNext: Math.max(0, pointsToNext), progress };
}

export function getRecommendedChallenges(report: any): typeof CHALLENGE_LIBRARY {
  const recommended: typeof CHALLENGE_LIBRARY = [];
  const clashes = report?.clashes;
  const repair = report?.repairCompatibility;
  const conflictChoreography = report?.conflictChoreography;

  // Prioritize based on report findings
  if (repair?.highRiskHorsemen?.length > 0) {
    recommended.push(CHALLENGE_LIBRARY.find(c => c.id === 'f4')!);
    recommended.push(CHALLENGE_LIBRARY.find(c => c.id === 'f2')!);
  }
  if (conflictChoreography?.driverAnalysis?.collision) {
    recommended.push(CHALLENGE_LIBRARY.find(c => c.id === 'f3')!);
  }
  if (clashes?.connectionTension) {
    recommended.push(CHALLENGE_LIBRARY.find(c => c.id === 'c1')!);
    recommended.push(CHALLENGE_LIBRARY.find(c => c.id === 'c4')!);
  }

  // Fill with general recommendations
  const ids = new Set(recommended.map(r => r?.id));
  for (const c of CHALLENGE_LIBRARY) {
    if (!ids.has(c.id) && recommended.length < 4) {
      recommended.push(c);
      ids.add(c.id);
    }
  }

  return recommended.filter(Boolean).slice(0, 4);
}

// ── Conversation Cards ──

export const CONVERSATION_DECKS = {
  connection: {
    name: 'Connection',
    description: 'Questions to deepen your understanding of each other',
    cards: [
      'What made you feel most loved this week?',
      'What\'s something I do that makes you feel safe?',
      'What\'s a memory of us that you think about often?',
      'When do you feel most connected to me?',
      'What\'s something you wish I understood better about you?',
      'What does a perfect evening together look like for you?',
      'How can I better support you when you\'re stressed?',
      'What\'s something you admire about how we handle disagreements?',
    ],
  },
  conflict: {
    name: 'Navigating Conflict',
    description: 'Questions for understanding your conflict patterns',
    cards: [
      'What does it feel like for you when we\'re in conflict?',
      'What do you need from me when you\'re upset?',
      'Is there something I do during arguments that particularly hurts?',
      'What would help you feel heard when we disagree?',
      'Can you describe what repair looks like for you after a fight?',
      'What\'s a conflict pattern we keep repeating? How might we break it?',
      'When do you feel most defensive, and what triggers it?',
      'What\'s one thing each of us could do differently next time we argue?',
    ],
  },
  future: {
    name: 'Building Together',
    description: 'Questions about your shared future',
    cards: [
      'What does our relationship look like in five years if everything goes well?',
      'What\'s a shared goal we haven\'t talked about yet?',
      'How do you envision us growing together?',
      'What\'s something new you\'d like us to experience together?',
      'How do you feel about our current balance of togetherness and independence?',
      'What traditions would you like us to create?',
      'What\'s a challenge you think we\'ll face, and how should we prepare?',
      'What does \"home\" mean to you in the context of our relationship?',
    ],
  },
  appreciation: {
    name: 'Appreciation',
    description: 'Prompts for expressing gratitude and admiration',
    cards: [
      'What\'s something I\'ve done recently that meant a lot to you?',
      'What quality of mine are you most grateful for?',
      'When have you been most proud of us as a couple?',
      'What\'s a small thing I do that you wish I knew you noticed?',
      'How has our relationship made you a better person?',
      'What\'s something about me that surprised you (in a good way)?',
      'What moment in our relationship would you relive?',
      'What do you think is our greatest strength as a couple?',
    ],
  },
};

// ── Date Generator ──

export const DATE_IDEAS = [
  // Active / Adventure
  { id: 'd1', category: 'adventure', title: 'Sunrise Hike', description: 'Wake up early and hike to a viewpoint for sunrise. Bring coffee.', forTypes: ['physical_A'] },
  { id: 'd2', category: 'adventure', title: 'Cooking Challenge', description: 'Each partner picks a mystery ingredient. You have 45 minutes to make dinner.', forTypes: ['lifestyle_A'] },
  { id: 'd3', category: 'adventure', title: 'City Exploration', description: 'Pick a neighborhood neither of you has explored. No phones for navigation - just wander.', forTypes: ['social_A'] },
  { id: 'd4', category: 'adventure', title: 'Volunteer Together', description: 'Find a cause you both care about and spend a morning volunteering.', forTypes: ['values_A'] },
  // Intimate / Quiet
  { id: 'd5', category: 'intimate', title: 'Question Night', description: 'Draw from the RELATE conversation cards over dinner. No phones, no TV.', forTypes: ['social_B'] },
  { id: 'd6', category: 'intimate', title: 'Shared Reading', description: 'Read the same book chapter, then discuss it over wine.', forTypes: ['lifestyle_B'] },
  { id: 'd7', category: 'intimate', title: 'Memory Lane', description: 'Go through old photos together. Share the stories behind your favorites.', forTypes: ['values_B'] },
  { id: 'd8', category: 'intimate', title: 'Spa Evening', description: 'Create a home spa experience. Take turns giving massages.', forTypes: ['physical_B'] },
  // Social
  { id: 'd9', category: 'social', title: 'Double Date', description: 'Plan an evening with another couple. Focus on shared laughter.', forTypes: ['social_A'] },
  { id: 'd10', category: 'social', title: 'Game Night', description: 'Host a board game night. Cooperative games build teamwork.', forTypes: ['social_A', 'lifestyle_A'] },
  // Growth-oriented
  { id: 'd11', category: 'growth', title: 'Workshop Together', description: 'Take a class in something neither of you knows - pottery, dance, cooking.', forTypes: ['lifestyle_A', 'values_A'] },
  { id: 'd12', category: 'growth', title: 'Future Mapping Date', description: 'Go to a cafe with a notebook and map your next year together. Dreams, goals, adventures.', forTypes: ['values_A', 'values_B'] },
];

export function getPersonalizedDates(user1Results: any, user2Results: any): typeof DATE_IDEAS {
  const dims = ['physical', 'social', 'lifestyle', 'values'];
  const poles = new Set<string>();

  for (const dim of dims) {
    const u1Pole = user1Results?.m1?.dimensions?.[dim]?.assignedPole;
    const u2Pole = user2Results?.m1?.dimensions?.[dim]?.assignedPole;
    if (u1Pole) poles.add(`${dim}_${u1Pole}`);
    if (u2Pole) poles.add(`${dim}_${u2Pole}`);
  }

  // Score each date by how many matching types it covers
  const scored = DATE_IDEAS.map(date => {
    const matches = date.forTypes.filter(t => poles.has(t)).length;
    return { ...date, relevance: matches };
  });

  scored.sort((a, b) => b.relevance - a.relevance);
  return scored.slice(0, 6);
}
