# RELATE Couples Compatibility System — Technical Specification

## Overview

This document specifies the complete couples compatibility scoring system. The goal is to maximize signal from all collected data to predict relationship success across three states: Normal (baseline), Conflict (depleted), and Repair (elevated effort).

---

## Part 1: M3 State Modeling

### The Three States

M3 measures Want (how much differentiated access you seek) and Offer (how much you give). These scores shift based on relationship state:

```javascript
const M3_STATE_MODIFIERS = {
  normal: {
    want: 1.0,    // Baseline
    offer: 1.0    // Baseline
  },
  conflict: {
    want: 1.3,    // Want increases 30% under stress (needier)
    offer: 0.6    // Offer decreases 40% (withdraw generosity)
  },
  repair: {
    want: 0.9,    // Want slightly decreases (giving space)
    offer: 1.4    // Offer increases 40% (making effort)
  }
};
```

### State Score Calculation

```javascript
function calculateM3StateScores(m3Data) {
  const { wantScore, offerScore } = m3Data;
  
  return {
    normal: {
      want: wantScore,
      offer: offerScore,
      gap: wantScore - offerScore
    },
    conflict: {
      want: Math.min(100, wantScore * 1.3),
      offer: Math.max(0, offerScore * 0.6),
      gap: (wantScore * 1.3) - (offerScore * 0.6)
    },
    repair: {
      want: wantScore * 0.9,
      offer: Math.min(100, offerScore * 1.4),
      gap: (wantScore * 0.9) - (offerScore * 1.4)
    }
  };
}
```

### Couples M3 Dynamics

For each state, compare Partner A Want vs Partner B Offer and vice versa:

```javascript
function calculateCouplesM3Dynamics(partnerA, partnerB) {
  const statesA = calculateM3StateScores(partnerA.m3);
  const statesB = calculateM3StateScores(partnerB.m3);
  
  const dynamics = {};
  
  for (const state of ['normal', 'conflict', 'repair']) {
    // Does A get what A wants from B?
    const aSatisfaction = statesB[state].offer - statesA[state].want;
    
    // Does B get what B wants from A?
    const bSatisfaction = statesA[state].offer - statesB[state].want;
    
    // Combined balance
    const mutualSatisfaction = (aSatisfaction + bSatisfaction) / 2;
    
    // Asymmetry (one giving more than receiving)
    const asymmetry = Math.abs(aSatisfaction - bSatisfaction);
    
    dynamics[state] = {
      aSatisfaction,
      bSatisfaction,
      mutualSatisfaction,
      asymmetry,
      sustainable: mutualSatisfaction > -10 && asymmetry < 30
    };
  }
  
  // Key insight: Is repair state sustainable long-term?
  dynamics.repairSustainability = calculateRepairSustainability(
    partnerA.m3, 
    partnerB.m3,
    dynamics.repair
  );
  
  return dynamics;
}
```

---

## Part 2: Complete Compatibility Dimensions

### All Data Points to Score

| Dimension | Weight | Source |
|-----------|--------|--------|
| Persona Compatibility | 15% | M2 codes + compatibility tables |
| Preference Alignment | 12% | M1 vs partner M2 |
| Intimacy Dynamics | 12% | M3 across 3 states |
| Conflict Choreography | 18% | M4 approach, drivers, repair, horsemen |
| Attachment Pairing | 15% | Skills or M4 inference |
| Emotional Capacity | 8% | M4 capacity scores |
| Values Alignment | 10% | M1/M2 dimension 4 |
| Lifestyle Alignment | 5% | M1/M2 dimension 3 |
| Demographics | 5% | Age, kids, politics, location |

---

## Part 3: Conflict Choreography (18% weight)

### Components

**Approach Pairing (25%)**: Pursue-withdraw risk
- pursue_pursue: 70 (can escalate but both engaged)
- withdraw_withdraw: 60 (issues go unaddressed)
- pursue_withdraw: 40 (classic EFT danger pattern)

**Driver Collision (25%)**: Do their fears trigger each other?
- abandonment + engulfment: 95 risk (DEADLY)
- inadequacy + inadequacy: 70 risk
- injustice + injustice: 75 risk

**Repair Compatibility (25%)**: Speed and mode alignment
- Speed gap penalty
- Mode gap penalty (less severe)
- Worst case: fast verbal + slow physical

**Horsemen Risk (25%)**: Combined horsemen scores
- Individual scores averaged with synergy multiplier
- Criticism-Defensiveness loop detection
- Contempt-Stonewalling loop detection (severe)

---

## Part 4: Attachment Pairing Scores

```
secure + secure: 95
secure + anxious: 70
secure + avoidant: 65
secure + disorganized: 50
anxious + anxious: 55
anxious + avoidant: 25 (CRITICAL)
anxious + disorganized: 30
avoidant + avoidant: 45
avoidant + disorganized: 35
disorganized + disorganized: 20
```

### Infer Attachment from M4

If attachment not directly assessed:
- abandonment primary + pursue = anxious
- engulfment primary + withdraw = avoidant
- high abandonment + high engulfment = disorganized
- otherwise = secure

---

## Part 5: State-Specific Scoring

### Normal State (baseline)
Use standard weights from Part 2.

### Conflict State
Adjusted weights:
- Conflict Choreography: 30% (up from 18%)
- Attachment Pairing: 20% (up from 15%)
- Intimacy Dynamics: 15% (conflict subscores)
- Emotional Capacity: 12%
- Demographics: 0%

### Repair State
Adjusted weights:
- Conflict Choreography: 35% (repair subscores)
- Intimacy Dynamics: 25% (repair state + sustainability)
- Emotional Capacity: 15%
- Attachment: 15%

---

## Part 6: Output Structure

```javascript
{
  summary: {
    overallScore: 72,
    tier: "kismet",
    normalState: { score: 75, tier: "kismet" },
    conflictState: { score: 58, tier: "effort" },
    repairState: { score: 68, tier: "kismet" }
  },
  
  intimacyDynamics: {
    partnerA: {
      normal: { want: 78, offer: 65 },
      conflict: { want: 101, offer: 39 },
      repair: { want: 70, offer: 91 }
    },
    partnerB: {
      normal: { want: 55, offer: 72 },
      conflict: { want: 72, offer: 43 },
      repair: { want: 50, offer: 101 }
    },
    dynamics: {
      normal: { aSatisfaction: -6, bSatisfaction: 10, sustainable: true },
      conflict: { aSatisfaction: -58, bSatisfaction: -29, sustainable: false },
      repair: { aSatisfaction: 31, bSatisfaction: 41, sustainable: true }
    }
  },
  
  conflictChoreography: {
    approachPairing: { pattern: "pursue_withdraw", risk: "HIGH" },
    driverCollision: { aDriver: "abandonment", bDriver: "engulfment", risk: "CRITICAL" },
    repairCompatibility: { speedMatch: false, modeMatch: true },
    horsemenRisk: { loops: { criticismDefensiveness: true } }
  },
  
  risks: [...],
  work: [...],
  insights: [...]
}
```

---

## Part 7: Implementation Priority

1. M3 state modeling (normal/conflict/repair)
2. Conflict choreography calculations
3. Attachment pairing with inference
4. Preference alignment (M1/M2 cross-compare)
5. Remaining dimensions
6. Composite scoring with state weights
7. Report generation

---

## Data Requirements

Ensure user profile has:
- m3.wantScore, m3.offerScore
- m4.conflictApproach.approach, m4.conflictApproach.intensity
- m4.emotionalDrivers.primary, m4.emotionalDrivers.scores
- m4.repairRecovery.speed, m4.repairRecovery.mode
- m4.emotionalCapacity.level, m4.emotionalCapacity.score
- m4.gottmanScreener (all four horsemen)
- skills.attachment (optional, can infer)
