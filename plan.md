# Compatibility Scoring Implementation Plan

## Architecture

**One new file:** `src/lib/compatibility.ts` — pure functions, no side effects. Takes existing scored data as inputs, returns new compatibility insights as outputs.

**No existing scoring is modified.** M3 wantScore/offerScore stay untouched. Persona compatibility tables stay untouched. All new data is additive.

**Three files get small additive changes:**
- `src/app/api/results/route.ts` — 3 lines to import, call, and attach `individualCompatibilityProfile`
- `src/app/api/couples-report/route.ts` — 3 lines to import, call, and attach `enhancedCouplesCompatibility`
- `supabase/schema.sql` — comment-only documentation (data stored in existing `results` jsonb field)

---

## Phase 1: Attachment Inference from Existing M4 Data

**Function:** `inferAttachmentStyle(m4Data)`

Follows the spec exactly from INDIVIDUAL_COMPATIBILITY_SPEC.md Part 2:
- `abandonment > 55 && engulfment > 55` → disorganized
- `abandonment > 50 && approach === 'pursue'` → anxious
- `engulfment > 50 && approach === 'withdraw'` → avoidant
- `abandonment > 60 && approach === 'withdraw'` → anxious (suppressed subtype)
- `engulfment > 60 && approach === 'pursue'` → avoidant (performative subtype)
- `abandonment < 45 && engulfment < 45 && intensity < 60` → secure
- Default → secure with leaningToward

**Output type:**
```typescript
{
  style: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  confidence: number;           // 0-1
  subtype?: 'suppressed' | 'performative';
  leaningToward?: 'anxious' | 'avoidant';
  description: string;
}
```

**Input:** Uses `m4Data.conflictApproach.approach`, `m4Data.conflictApproach.intensity`, `m4Data.emotionalDrivers.scores.{abandonment,engulfment,inadequacy,injustice}`

---

## Phase 2: Individual M3 State Modeling

**Function:** `calculateIndividualM3States(m3Data, m4Data)`

Follows INDIVIDUAL_COMPATIBILITY_SPEC.md Part 1 exactly. Uses `calculateIndividualStateModifiers(m4Data)` to create personalized multipliers.

**Modifier logic (from spec):**
- Base: conflict want=1.3, conflict offer=0.6, repair want=0.9, repair offer=1.4
- Pursuers: conflictWantMod += 0.2 * intensity (up to 1.5x)
- Withdrawers: conflictOfferMod -= 0.15 * intensity (down to 0.45x)
- Abandonment primary: conflictWantMod += 0.15 * score
- Engulfment primary: conflictOfferMod -= 0.1 * score
- Inadequacy primary: both drop by 0.1 * score
- Capacity dampening: reduce swings by up to 30% based on capacity score
- Repair: fast speed → +0.1 offer, slow speed → -0.1 offer
- Clamp: conflict want [1.0, 1.6], conflict offer [0.4, 0.8], repair offer [1.2, 1.6]

**CRITICAL:** Base M3 scores are READ-ONLY inputs. The three states are:
- `normal` = base wantScore/offerScore unchanged
- `conflict` = base * personalized conflict modifiers, clamped 0-100
- `repair` = base * personalized repair modifiers, clamped 0-100

**Output includes insights:** gapExpansion, gapExpansionLevel, repairSustainable, repairStrain, vulnerableState

---

## Phase 3: Individual Compatibility Tiers

### 3A: Attachment Compatibility Tiers

**Function:** `getAttachmentCompatibilityTiers(inferredAttachment)`

Uses the exact `ATTACHMENT_COMPATIBILITY` table from spec Part 3:
- secure → ideal: [secure], kismet: [anxious, avoidant], effort: [disorganized]
- anxious → ideal: [secure], kismet: [anxious], effort: [avoidant], avoid: [avoidant], atRisk: [disorganized]
- avoidant → ideal: [secure], kismet: [avoidant], effort: [anxious], avoid: [anxious], atRisk: [disorganized]
- disorganized → ideal: [secure], effort: [secure], atRisk: [anxious, avoidant, disorganized]

Returns scored tiers with descriptions and notes.

### 3B: Driver Collision Risk Tiers

**Function:** `getDriverCompatibilityTiers(m4Data)`

Uses exact `DRIVER_COMPATIBILITY` table from spec Part 4:
- abandonment → ideal: [abandonment], kismet: [injustice], effort: [inadequacy], avoid: [engulfment]
- engulfment → ideal: [engulfment], kismet: [injustice], effort: [inadequacy], avoid: [abandonment]
- inadequacy → ideal: [inadequacy], kismet: [abandonment], effort: [injustice], avoid: []
- injustice → ideal: [injustice], kismet: [inadequacy], effort: [abandonment, engulfment], avoid: []

Includes `DRIVER_COLLISION_REASONS` for abandonment×engulfment pair.

### 3C: Horsemen Compatibility Insights

**Function:** `getHorsemenCompatibilityInsights(m4Data)`

Uses spec Part 5 logic exactly:
- Criticism elevated → avoid high-defensiveness partner, look for low-defensiveness
- Contempt elevated → avoid high-stonewalling partner, urgent warning about contempt
- Defensiveness elevated → avoid high-criticism partner, look for gentle communicator
- Stonewalling elevated → avoid high-contempt partner, look for patience with flooding

Computes `idealPartnerProfile` horsemen thresholds.

---

## Phase 4: Store individualCompatibilityProfile

**Function:** `buildIndividualCompatibilityProfile(m3Data, m4Data)`

Orchestrates phases 1-3 and returns:
```typescript
{
  attachment: { style, confidence, subtype?, leaningToward?, description },
  m3States: { states: { normal, conflict, repair }, modifiers, insights },
  attachmentTiers: { yourStyle, bestMatches, goodMatches, workableMatches, riskyMatches, avoidMatches, recommendation },
  driverTiers: { yourDriver, bestMatches, goodMatches, workableMatches, avoidMatches, recommendation },
  horsemenInsights: { yourProfile, risks, lookFor, avoid, idealPartnerProfile, urgent? },
  idealPartner: { attachment, drivers, maxHorsemen, minEmotionalCapacity: 60 },
  calculatedAt: ISO string
}
```

**Wiring into `/api/results`:** After existing report is built, add:
```typescript
import { buildIndividualCompatibilityProfile } from '@/lib/compatibility';
// ... after report object is assembled ...
report.individualCompatibility = buildIndividualCompatibilityProfile(m3Result, m4Result);
```

Stored in existing `user_progress.results` jsonb field — no schema changes.

---

## Phase 5: Couples Compatibility Scoring

**Function:** `calculateEnhancedCouplesCompatibility(user1Results, user2Results)`

### 5A: M3 State Dynamics (from COUPLES_COMPATIBILITY_SPEC Part 1)

**Function:** `calculateCouplesM3Dynamics(partnerA, partnerB)`

For each state (normal/conflict/repair), calculate:
- aSatisfaction = B's offer - A's want
- bSatisfaction = A's offer - B's want
- mutualSatisfaction = average
- asymmetry = abs difference
- sustainable = mutualSatisfaction > -10 && asymmetry < 30
- repairSustainability

Uses personalized state modifiers (from Phase 2), not universal ones.

### 5B: Nine Compatibility Dimensions (from COUPLES_COMPATIBILITY_SPEC Part 2)

Each dimension scored 0-100 in three states:

1. **Persona Compatibility** (15% normal) — existing M2 compatibility table lookup, unchanged
2. **Preference Alignment** (12%) — M1 vs partner's M2 dimension pole alignment
3. **Intimacy Dynamics** (12%) — M3 state scores from 5A above
4. **Conflict Choreography** (18%) — approach pairing, driver collision, repair compat, horsemen risk (from spec Part 3)
5. **Attachment Pairing** (15%) — inferred attachment compatibility (spec Part 4 scores)
6. **Emotional Capacity** (8%) — capacity gap scoring
7. **Values Alignment** (10%) — dimension 4 pole match
8. **Lifestyle Alignment** (5%) — dimension 3 pole match
9. **Demographics** (5%) — age gap, kids alignment, location

### 5C: State-Specific Weights (from COUPLES_COMPATIBILITY_SPEC Part 5)

**Normal:** Standard weights from Part 2 table

**Conflict:** Conflict Choreography=30%, Attachment=20%, Intimacy=15%, Capacity=12%, remaining redistributed, Demographics=0%

**Repair:** Conflict Choreography=35%, Intimacy=25%, Capacity=15%, Attachment=15%, remaining redistributed

### 5D: Ideal Profile Comparison (from INDIVIDUAL_COMPATIBILITY_SPEC Part 6)

Compare each partner against the other's `idealPartner` profile:
- Attachment match score
- Driver match score
- Horsemen threshold match score
- Overall mutual fit + asymmetry

### Output Structure

```typescript
{
  summary: {
    overallScore: number,
    tier: string,
    normalState: { score, tier },
    conflictState: { score, tier },
    repairState: { score, tier }
  },
  dimensions: Array<{ name, weight, scores: { normal, conflict, repair } }>,
  intimacyDynamics: { partnerA states, partnerB states, dynamics per state },
  conflictChoreography: { approachPairing, driverCollision, repairCompatibility, horsemenRisk },
  idealComparison: { partnerAGetsFromB, partnerBGetsFromA, mutualFit, asymmetry },
  stateComparison: { normal, conflict, repair, conflictDynamics },
  calculatedAt: string
}
```

**Wiring into `/api/couples-report`:** After existing report, add:
```typescript
import { calculateEnhancedCouplesCompatibility } from '@/lib/compatibility';
report.enhancedCompatibility = calculateEnhancedCouplesCompatibility(user1Results, user2Results);
```

---

## Implementation Order

1. Create `src/lib/compatibility.ts` with `inferAttachmentStyle()` — Phase 1
2. Add `calculateIndividualStateModifiers()` and `calculateIndividualM3States()` — Phase 2
3. Add `getAttachmentCompatibilityTiers()` — Phase 3A
4. Add `getDriverCompatibilityTiers()` — Phase 3B
5. Add `getHorsemenCompatibilityInsights()` — Phase 3C
6. Add `buildIndividualCompatibilityProfile()` — Phase 4
7. Wire into `/api/results/route.ts` (3 additive lines)
8. Add `calculateCouplesM3Dynamics()` — Phase 5A
9. Add 9-dimension scoring functions — Phase 5B
10. Add state-specific weighted scoring — Phase 5C
11. Add ideal profile comparison — Phase 5D
12. Add `calculateEnhancedCouplesCompatibility()` — Phase 5 orchestrator
13. Wire into `/api/couples-report/route.ts` (3 additive lines)
14. Build, verify, commit, push

## Files Changed

| File | Type | Lines |
|------|------|-------|
| `src/lib/compatibility.ts` | NEW | ~600-700 |
| `src/app/api/results/route.ts` | ADDITIVE | +3 lines |
| `src/app/api/couples-report/route.ts` | ADDITIVE | +3 lines |
