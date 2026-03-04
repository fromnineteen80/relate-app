# Individual Compatibility Insights — Technical Specification

## Overview

This spec extends the couples compatibility system to individuals. Users see their predicted state patterns and ideal match profiles BEFORE finding a partner. This helps with partner selection and creates benchmarks for eventual couples reports.

---

## Part 1: Individual State Modeling

### Personalized State Modifiers

Instead of universal modifiers, personalize based on M4 data:

```javascript
function calculateIndividualStateModifiers(m4Data) {
  const { conflictApproach, emotionalDrivers, emotionalCapacity } = m4Data;
  
  // Base modifiers
  let conflictWantMod = 1.3;
  let conflictOfferMod = 0.6;
  let repairWantMod = 0.9;
  let repairOfferMod = 1.4;
  
  // CONFLICT STATE ADJUSTMENTS
  
  // Pursuers spike Want more (seeking connection/reassurance)
  if (conflictApproach.approach === 'pursue') {
    const intensity = conflictApproach.intensity / 100;
    conflictWantMod += 0.2 * intensity; // Up to 1.5x at high intensity
  }
  
  // Withdrawers drop Offer more (pulling back)
  if (conflictApproach.approach === 'withdraw') {
    const intensity = conflictApproach.intensity / 100;
    conflictOfferMod -= 0.15 * intensity; // Down to 0.45x at high intensity
  }
  
  // Abandonment driver = higher Want spike
  if (emotionalDrivers.primary === 'abandonment') {
    conflictWantMod += 0.15 * (emotionalDrivers.scores.abandonment / 100);
  }
  
  // Engulfment driver = lower Offer floor
  if (emotionalDrivers.primary === 'engulfment') {
    conflictOfferMod -= 0.1 * (emotionalDrivers.scores.engulfment / 100);
  }
  
  // Inadequacy driver = both drop (shutdown)
  if (emotionalDrivers.primary === 'inadequacy') {
    conflictWantMod -= 0.1 * (emotionalDrivers.scores.inadequacy / 100);
    conflictOfferMod -= 0.1 * (emotionalDrivers.scores.inadequacy / 100);
  }
  
  // CAPACITY DAMPENING
  // Higher emotional capacity = smaller swings (more regulated)
  const capacityFactor = emotionalCapacity.score / 100;
  const dampening = 0.3 * capacityFactor; // Up to 30% reduction in swing
  
  // Dampen extremes toward baseline
  conflictWantMod = 1 + (conflictWantMod - 1) * (1 - dampening);
  conflictOfferMod = 1 - (1 - conflictOfferMod) * (1 - dampening);
  
  // REPAIR STATE ADJUSTMENTS
  
  // Fast repairers spike Offer more quickly
  if (m4Data.repairRecovery.speed.style === 'fast') {
    repairOfferMod += 0.1;
  }
  
  // Slow repairers take longer to increase Offer
  if (m4Data.repairRecovery.speed.style === 'slow') {
    repairOfferMod -= 0.1;
  }
  
  return {
    conflict: {
      want: Math.max(1.0, Math.min(1.6, conflictWantMod)),
      offer: Math.max(0.4, Math.min(0.8, conflictOfferMod))
    },
    repair: {
      want: repairWantMod,
      offer: Math.max(1.2, Math.min(1.6, repairOfferMod))
    }
  };
}
```

### Calculate Individual State Scores

```javascript
function calculateIndividualM3States(m3Data, m4Data) {
  const { wantScore, offerScore } = m3Data;
  const modifiers = calculateIndividualStateModifiers(m4Data);
  
  const states = {
    normal: {
      want: wantScore,
      offer: offerScore,
      gap: wantScore - offerScore,
      label: 'Baseline'
    },
    conflict: {
      want: Math.min(100, Math.round(wantScore * modifiers.conflict.want)),
      offer: Math.max(0, Math.round(offerScore * modifiers.conflict.offer)),
      gap: null, // calculated below
      label: 'Under Stress'
    },
    repair: {
      want: Math.round(wantScore * modifiers.repair.want),
      offer: Math.min(100, Math.round(offerScore * modifiers.repair.offer)),
      gap: null,
      label: 'Making Effort'
    }
  };
  
  states.conflict.gap = states.conflict.want - states.conflict.offer;
  states.repair.gap = states.repair.want - states.repair.offer;
  
  // Key insight: How much does their gap widen in conflict?
  const gapExpansion = states.conflict.gap - states.normal.gap;
  
  // Can they sustain repair? (Repair offer vs baseline capacity)
  const repairStrain = states.repair.offer / (offerScore * 1.2);
  const repairSustainable = repairStrain < 1.15;
  
  return {
    states,
    modifiers,
    insights: {
      gapExpansion,
      gapExpansionLevel: gapExpansion > 30 ? 'HIGH' : gapExpansion > 15 ? 'MODERATE' : 'LOW',
      repairSustainable,
      repairStrain: Math.round(repairStrain * 100),
      vulnerableState: states.conflict.gap > 40 ? 'conflict' : null
    }
  };
}
```

### Individual State Display

Show users:
- "Your baseline: You want 72, you offer 65 (gap: +7)"
- "Under stress: Your want rises to 94, your offer drops to 42 (gap: +52)"
- "In repair: Your want settles to 65, your offer rises to 85 (gap: -20)"
- "Your gap expands 45 points in conflict. This means you become significantly needier while giving less."
- "Your repair effort is sustainable — you can maintain elevated giving without burnout."

---

## Part 2: Infer Attachment Style from M4

We already have the data. Just need to classify:

```javascript
function inferAttachmentStyle(m4Data) {
  const { conflictApproach, emotionalDrivers } = m4Data;
  const { abandonment, engulfment, inadequacy, injustice } = emotionalDrivers.scores;
  
  // Disorganized: High on both abandonment AND engulfment (contradictory)
  if (abandonment > 55 && engulfment > 55) {
    return {
      style: 'disorganized',
      confidence: Math.min(abandonment, engulfment) / 100,
      description: 'You experience contradictory impulses — wanting closeness but fearing it simultaneously. This creates unpredictable patterns in relationships.'
    };
  }
  
  // Anxious: High abandonment + pursue tendency
  if (abandonment > 50 && conflictApproach.approach === 'pursue') {
    return {
      style: 'anxious',
      confidence: (abandonment / 100) * (conflictApproach.intensity / 100),
      description: 'You seek closeness and reassurance, especially under stress. You may become hypervigilant to signs of disconnection.'
    };
  }
  
  // Avoidant: High engulfment + withdraw tendency
  if (engulfment > 50 && conflictApproach.approach === 'withdraw') {
    return {
      style: 'avoidant',
      confidence: (engulfment / 100) * (conflictApproach.intensity / 100),
      description: 'You value independence and may feel uncomfortable with too much closeness. You need space to regulate.'
    };
  }
  
  // Anxious without pursue (suppressed)
  if (abandonment > 60 && conflictApproach.approach === 'withdraw') {
    return {
      style: 'anxious',
      confidence: 0.6,
      subtype: 'suppressed',
      description: 'You fear abandonment but have learned to withdraw rather than pursue. The anxiety is still there but expressed differently.'
    };
  }
  
  // Avoidant without withdraw (performative)
  if (engulfment > 60 && conflictApproach.approach === 'pursue') {
    return {
      style: 'avoidant',
      confidence: 0.6,
      subtype: 'performative',
      description: 'You fear engulfment but have learned to pursue. You may pursue then pull back once closeness is achieved.'
    };
  }
  
  // Secure: Low on fear drivers, moderate approach
  if (abandonment < 45 && engulfment < 45 && conflictApproach.intensity < 60) {
    return {
      style: 'secure',
      confidence: 1 - (Math.max(abandonment, engulfment) / 100),
      description: 'You are comfortable with both intimacy and independence. You can engage conflict without losing yourself or your partner.'
    };
  }
  
  // Default to leaning secure with notes
  return {
    style: 'secure',
    confidence: 0.5,
    leaningToward: abandonment > engulfment ? 'anxious' : 'avoidant',
    description: 'You are generally secure but may lean toward ' + 
      (abandonment > engulfment ? 'anxious' : 'avoidant') + ' patterns under significant stress.'
  };
}
```

---

## Part 3: Attachment Compatibility Tiers for Individuals

Once we know their attachment, show ideal matches:

```javascript
const ATTACHMENT_COMPATIBILITY = {
  secure: {
    ideal: ['secure'],
    kismet: ['anxious', 'avoidant'],
    effort: ['disorganized'],
    description: 'You can partner successfully with any attachment style, though secure-secure is easiest.'
  },
  anxious: {
    ideal: ['secure'],
    kismet: ['anxious'],
    effort: ['avoidant'],      // Can work but hard
    incompatible: [],          // Nothing truly incompatible
    atRisk: ['disorganized'],
    avoid: ['avoidant'],       // High risk without work
    description: 'You thrive with secure partners who provide consistent reassurance. Avoid avoidant partners unless both commit to significant work.'
  },
  avoidant: {
    ideal: ['secure'],
    kismet: ['avoidant'],
    effort: ['anxious'],
    atRisk: ['disorganized'],
    avoid: ['anxious'],
    description: 'You thrive with secure partners who respect your need for space. Anxious partners will trigger your withdrawal.'
  },
  disorganized: {
    ideal: ['secure'],
    kismet: [],
    effort: ['secure'],
    atRisk: ['anxious', 'avoidant', 'disorganized'],
    description: 'Secure partners are essential. Your patterns require a stable anchor. Therapy is strongly recommended before serious partnership.'
  }
};

function getAttachmentCompatibilityTiers(inferredAttachment) {
  const tiers = ATTACHMENT_COMPATIBILITY[inferredAttachment.style];
  
  return {
    yourStyle: inferredAttachment,
    bestMatches: tiers.ideal.map(style => ({
      style,
      tier: 'ideal',
      score: style === 'secure' ? 95 : 85,
      note: null
    })),
    goodMatches: (tiers.kismet || []).map(style => ({
      style,
      tier: 'kismet',
      score: style === inferredAttachment.style ? 55 : 70,
      note: style === inferredAttachment.style ? 'You understand each other but may reinforce patterns' : null
    })),
    workableMatches: (tiers.effort || []).map(style => ({
      style,
      tier: 'effort',
      score: 40,
      note: 'Requires significant conscious effort from both partners'
    })),
    riskyMatches: (tiers.atRisk || []).map(style => ({
      style,
      tier: 'atRisk',
      score: 25,
      note: 'High failure probability without professional support'
    })),
    avoidMatches: (tiers.avoid || []).map(style => ({
      style,
      tier: 'incompatible',
      score: 15,
      note: AVOID_REASONS[`${inferredAttachment.style}_${style}`]
    })),
    recommendation: tiers.description
  };
}

const AVOID_REASONS = {
  'anxious_avoidant': 'Classic anxious-avoidant trap. Your pursuit triggers their withdrawal, which triggers your panic. Without intervention, this cycle destroys relationships.',
  'avoidant_anxious': 'Your withdrawal triggers their pursuit, which triggers your shutdown. Without intervention, this cycle destroys relationships.'
};
```

---

## Part 4: Emotional Driver Compatibility Tiers

```javascript
const DRIVER_COMPATIBILITY = {
  abandonment: {
    ideal: ['abandonment'],     // Understand each other's fears
    kismet: ['injustice'],      // Different fears, manageable
    effort: ['inadequacy'],     // A's pursuit can feel like criticism to B
    avoid: ['engulfment'],      // DEADLY combination
    description: 'You need a partner who understands abandonment fear. Avoid partners with strong engulfment fears — your pursuit will feel suffocating to them.'
  },
  engulfment: {
    ideal: ['engulfment'],
    kismet: ['injustice'],
    effort: ['inadequacy'],
    avoid: ['abandonment'],
    description: 'You need a partner who respects space needs. Avoid partners with strong abandonment fears — your need for distance will feel like rejection.'
  },
  inadequacy: {
    ideal: ['inadequacy'],      // Both get it
    kismet: ['abandonment'],    // Can work with care
    effort: ['injustice'],      // Scorekeeping feels like criticism
    avoid: [],                  // No critical incompatibilities
    description: 'You need a partner who leads with appreciation, not criticism. Another inadequacy-driver understands your sensitivity.'
  },
  injustice: {
    ideal: ['injustice'],       // Both track fairness
    kismet: ['inadequacy'],     
    effort: ['abandonment', 'engulfment'],
    avoid: [],
    description: 'You need a partner who values fairness. Another injustice-driver shares your orientation, though you must both resist scorekeeping.'
  }
};

function getDriverCompatibilityTiers(m4Data) {
  const primary = m4Data.emotionalDrivers.primary;
  const secondary = m4Data.emotionalDrivers.secondary;
  const tiers = DRIVER_COMPATIBILITY[primary];
  
  return {
    yourDriver: {
      primary,
      secondary,
      scores: m4Data.emotionalDrivers.scores
    },
    bestMatches: tiers.ideal.map(driver => ({
      driver,
      tier: 'ideal',
      score: 85,
      reason: `Both understand ${driver} fear firsthand`
    })),
    goodMatches: tiers.kismet.map(driver => ({
      driver,
      tier: 'kismet',
      score: 70,
      reason: 'Different fears but no direct collision'
    })),
    workableMatches: tiers.effort.map(driver => ({
      driver,
      tier: 'effort',
      score: 50,
      reason: 'Requires awareness and explicit protocols'
    })),
    avoidMatches: tiers.avoid.map(driver => ({
      driver,
      tier: 'incompatible',
      score: 15,
      reason: DRIVER_COLLISION_REASONS[`${primary}_${driver}`]
    })),
    recommendation: tiers.description
  };
}

const DRIVER_COLLISION_REASONS = {
  'abandonment_engulfment': 'Your fear of being left collides with their fear of being consumed. You pursue → they withdraw → you panic → they feel trapped. This is the most dangerous driver pairing.',
  'engulfment_abandonment': 'Your fear of being consumed collides with their fear of being left. You withdraw → they pursue → you feel trapped → they panic. This is the most dangerous driver pairing.'
};
```

---

## Part 5: Horsemen Compatibility (Risk Avoidance)

For horsemen, "compatibility" means avoiding toxic loops, not finding complements:

```javascript
function getHorsemenCompatibilityInsights(m4Data) {
  const horsemen = m4Data.gottmanScreener;
  const insights = {
    yourProfile: {},
    risks: [],
    lookFor: [],
    avoid: []
  };
  
  // Catalog their horsemen
  for (const [horseman, data] of Object.entries(horsemen)) {
    if (horseman === 'overallRisk') continue;
    
    insights.yourProfile[horseman] = {
      score: data.score,
      level: data.level
    };
    
    // Generate partner guidance based on their elevated horsemen
    if (data.score > 50) {
      insights.risks.push({
        horseman,
        score: data.score,
        partnerRisk: HORSEMEN_PARTNER_RISKS[horseman]
      });
    }
  }
  
  // Criticism elevated → partner defensiveness is dangerous
  if (horsemen.criticism.score > 50) {
    insights.avoid.push({
      partnerTrait: 'High Defensiveness',
      reason: 'Your criticism + their defensiveness creates an escalation loop. Neither issue gets resolved.',
      threshold: 50
    });
    insights.lookFor.push({
      partnerTrait: 'Low Defensiveness',
      reason: 'Partners who can hear criticism without counter-attacking allow repair.',
      threshold: 30
    });
  }
  
  // Contempt elevated → partner stonewalling is dangerous
  if (horsemen.contempt.score > 50) {
    insights.avoid.push({
      partnerTrait: 'High Stonewalling',
      reason: 'Your contempt + their shutdown creates a death spiral. Contempt is the strongest divorce predictor.',
      threshold: 50
    });
    insights.lookFor.push({
      partnerTrait: 'High Emotional Capacity',
      reason: 'Partners who can stay engaged despite your contempt give you room to change. But you must work on this.',
      threshold: 70
    });
    insights.urgent = 'Contempt is the single strongest predictor of relationship failure. Regardless of partner, addressing this is critical.';
  }
  
  // Defensiveness elevated → partner criticism is dangerous
  if (horsemen.defensiveness.score > 50) {
    insights.avoid.push({
      partnerTrait: 'High Criticism',
      reason: 'Their criticism + your defensiveness means issues never get addressed.',
      threshold: 50
    });
    insights.lookFor.push({
      partnerTrait: 'Gentle Communicator',
      reason: 'Partners who raise issues without attacking character give you room to hear them.'
    });
  }
  
  // Stonewalling elevated → partner contempt is dangerous
  if (horsemen.stonewalling.score > 50) {
    insights.avoid.push({
      partnerTrait: 'High Contempt',
      reason: 'Their contempt + your shutdown creates total disconnection.',
      threshold: 50
    });
    insights.lookFor.push({
      partnerTrait: 'Patience with Flooding',
      reason: 'Partners who can give you space when flooded without escalating allow you to return.'
    });
  }
  
  // General recommendation
  insights.idealPartnerProfile = {
    criticism: Math.max(0, 40 - (horsemen.defensiveness.score * 0.3)),
    contempt: Math.max(0, 30 - (horsemen.stonewalling.score * 0.3)),
    defensiveness: Math.max(0, 40 - (horsemen.criticism.score * 0.3)),
    stonewalling: Math.max(0, 40 - (horsemen.contempt.score * 0.3))
  };
  
  return insights;
}

const HORSEMEN_PARTNER_RISKS = {
  criticism: 'If your partner is defensive, your criticism will escalate conflicts rather than resolve them.',
  contempt: 'Contempt poisons any partner. This must be addressed regardless of who you are with.',
  defensiveness: 'If your partner leads with criticism, you will never hear each other.',
  stonewalling: 'If your partner expresses contempt, your shutdown will amplify their disgust.'
};
```

---

## Part 6: How Individual Insights Feed Couples Reports

### Pre-Computed Benchmarks

When user completes assessment, store:

```javascript
const individualCompatibilityProfile = {
  userId: 'xxx',
  
  // State predictions
  m3States: calculateIndividualM3States(m3Data, m4Data),
  
  // Attachment
  attachment: inferAttachmentStyle(m4Data),
  attachmentTiers: getAttachmentCompatibilityTiers(attachment),
  
  // Drivers
  driverProfile: m4Data.emotionalDrivers,
  driverTiers: getDriverCompatibilityTiers(m4Data),
  
  // Horsemen
  horsemenProfile: m4Data.gottmanScreener,
  horsemenInsights: getHorsemenCompatibilityInsights(m4Data),
  
  // Ideal partner profile (computed)
  idealPartner: {
    attachment: attachmentTiers.bestMatches[0].style,
    drivers: driverTiers.bestMatches[0].driver,
    maxHorsemen: horsemenInsights.idealPartnerProfile,
    minEmotionalCapacity: 60
  }
};
```

### Couples Report Enhancement

When generating couples report, compare each partner against the other's ideal:

```javascript
function enhanceCouplesReport(partnerA, partnerB, baseCompatibility) {
  const aProfile = partnerA.individualCompatibilityProfile;
  const bProfile = partnerB.individualCompatibilityProfile;
  
  // How well does B match A's ideal?
  const bMatchesAIdeal = {
    attachment: scoreAttachmentMatch(aProfile.idealPartner.attachment, bProfile.attachment.style),
    driver: scoreDriverMatch(aProfile.idealPartner.drivers, bProfile.driverProfile.primary),
    horsemen: scoreHorsemenMatch(aProfile.idealPartner.maxHorsemen, bProfile.horsemenProfile),
    overall: null // calculated
  };
  
  // How well does A match B's ideal?
  const aMatchesBIdeal = {
    attachment: scoreAttachmentMatch(bProfile.idealPartner.attachment, aProfile.attachment.style),
    driver: scoreDriverMatch(bProfile.idealPartner.drivers, aProfile.driverProfile.primary),
    horsemen: scoreHorsemenMatch(bProfile.idealPartner.maxHorsemen, aProfile.horsemenProfile),
    overall: null
  };
  
  return {
    ...baseCompatibility,
    
    // New section: Ideal Partner Comparison
    idealComparison: {
      partnerAGetsFromB: {
        ...bMatchesAIdeal,
        summary: `Partner B is ${bMatchesAIdeal.overall}% of Partner A's ideal profile`
      },
      partnerBGetsFromA: {
        ...aMatchesBIdeal,
        summary: `Partner A is ${aMatchesBIdeal.overall}% of Partner B's ideal profile`
      },
      mutualFit: (bMatchesAIdeal.overall + aMatchesBIdeal.overall) / 2,
      asymmetry: Math.abs(bMatchesAIdeal.overall - aMatchesBIdeal.overall)
    },
    
    // Enhanced state comparison using personalized modifiers
    stateComparison: {
      normal: compareM3States(aProfile.m3States.states.normal, bProfile.m3States.states.normal),
      conflict: compareM3States(aProfile.m3States.states.conflict, bProfile.m3States.states.conflict),
      repair: compareM3States(aProfile.m3States.states.repair, bProfile.m3States.states.repair),
      
      // Key insight: Do their conflict gaps compound or balance?
      conflictDynamics: analyzeConflictGapInteraction(aProfile.m3States, bProfile.m3States)
    }
  };
}
```

---

## Part 7: Display for Individual Results

### New Section: "Your Relationship Patterns Under Stress"

```
YOUR INTIMACY UNDER STRESS

Normal State:
  Want: 72  |████████████████████░░░░░░░|
  Offer: 65 |█████████████████░░░░░░░░░░|
  Gap: +7 (slight net taker)

Conflict State:
  Want: 94  |█████████████████████████░░| ↑ +22
  Offer: 42 |███████████░░░░░░░░░░░░░░░░| ↓ -23  
  Gap: +52 (significant imbalance)
  
  "Under stress, you become significantly needier while withdrawing 
   generosity. Your gap expands 45 points. Partners may feel overwhelmed 
   by increased demands while receiving less from you."

Repair State:
  Want: 65  |█████████████████░░░░░░░░░░| ↓ -7
  Offer: 85 |███████████████████████░░░░| ↑ +20
  Gap: -20 (net giver)
  
  "In repair, you dial back needs and increase giving. This pattern 
   is sustainable for you — you can maintain elevated effort without 
   burning out."
```

### New Section: "Your Ideal Partner Profile"

```
YOUR IDEAL PARTNER PROFILE

Based on your patterns, here's what to look for:

ATTACHMENT STYLE
  Best: Secure (95 compatibility)
  Good: Anxious (55 — you understand each other)
  Avoid: Avoidant (25 — pursuit-withdrawal trap)
  
  "Your anxious attachment needs a partner who provides consistent 
   reassurance without feeling smothered. Secure partners do this 
   naturally. Avoidant partners will trigger your worst fears."

EMOTIONAL DRIVER
  Best: Abandonment (85 — mutual understanding)
  Good: Injustice (70 — different fears, no collision)
  Avoid: Engulfment (15 — critical risk)
  
  "Your abandonment fear pairs disastrously with engulfment fear. 
   You pursue → they withdraw → you panic → they feel trapped."

CONFLICT BEHAVIOR
  Look for: Low defensiveness (<40)
  Avoid: High defensiveness (>60) combined with your criticism
  
  "Your elevated criticism (62) will loop with a defensive partner. 
   Look for partners who can hear feedback without counter-attacking."
```

---

## Summary

| Feature | Individual Benefit | Couples Report Benefit |
|---------|-------------------|----------------------|
| M3 State Modeling | See your own conflict/repair patterns | Compare personalized patterns, not universal |
| Attachment Inference | Know your style + what to look for | See actual pairing vs each person's ideal |
| Driver Compatibility | Know which fears to avoid | Detect specific collision being experienced |
| Horsemen Insights | Know your risks + partner requirements | Identify active loops in THIS relationship |
| Ideal Partner Profile | Screening tool before commitment | Benchmark to compare actual partner against |

### Implementation Priority

1. Attachment inference (uses existing M4 data)
2. Individual M3 state modeling (uses M3 + M4)
3. Driver compatibility tiers (uses M4)
4. Horsemen compatibility insights (uses M4)
5. Ideal partner profile computation (combines all)
6. Couples report enhancement (uses stored individual profiles)
