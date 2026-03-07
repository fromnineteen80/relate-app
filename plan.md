# Implementation Plan

## Issue 1: Fix Match Ranking Consistency

**Problem:** Tiers are predetermined from a compatibility table (persona code lookup), but the final compatibility score is computed from 5 weighted components. A "Kismet" match can outscore an "Ideal" match if preference/M3/M4 components favor it. Ties in score also produce arbitrary rank ordering.

**Fix:**
1. **Add tiebreaker to sort** — when scores are equal, break ties by: tier rank > preference score > dimension score. This ensures deterministic ordering.
2. **Re-derive tier labels from the computed score** instead of the static compatibility table. The score already incorporates the tier base (35% weight) plus 4 other signals. The displayed tier should reflect the *actual computed compatibility*, not just the persona-code lookup:
   - 75+ → Ideal
   - 60-74 → Kismet
   - 45-59 → Effort
   - 30-44 → Long Shot
   - 15-29 → At Risk
   - <15 → Incompatible

This aligns what users see (tier label) with what users see (score), eliminating the contradictions.

**Files:** `src/app/api/results/route.ts`

## Issue 2: Growth Plan → Persona Evolution

**Problem:** Exercises give points and levels but don't show where growth leads. No "before/after" persona projection, no match improvement visibility.

**Fix — add a Growth Projection system:**
1. **In `src/lib/growth.ts`**: Add a `projectGrowthImpact(userData, completedExercises)` function that:
   - Maps completed exercises by `targetArea` to the dimensions they'd shift
   - Calculates projected dimension shifts (e.g., completing attachment exercises nudges avoidant→secure)
   - Projects a "growth persona" — what the persona code *could* become if borderline dimensions flip
   - Estimates match ranking changes: "Your top 3 matches could shift from [X] to [Y]"

2. **In `src/app/growth/page.tsx`**: Add a "Growth Impact" card that shows:
   - Original persona name + code
   - Projected growth persona (if borderline dimensions would flip)
   - "Completing [X exercise category] could improve your [dimension] alignment, potentially shifting your top matches"
   - Visual before/after on borderline dimensions showing how close they are to flipping

3. **Key insight**: We're NOT re-running the assessment. We're showing users which dimensions are close to the threshold and how targeted exercises could tip them, resulting in a different persona code and different match rankings. This gives the gamification a *destination*.

**Files:** `src/lib/growth.ts`, `src/app/growth/page.tsx`

## Issue 3: Birthday/Birth Time Optional for Women

**Problem:** Birth data is currently required for women in demographics onboarding (validation blocks progress without it). Should be optional with clear astrology labeling.

**Fix:**
1. **`src/app/onboarding/demographics/page.tsx`**:
   - Remove birth fields from required validation for women
   - Add a clear label: "This is used for your Sun, Moon & Rising astrology profile. You can skip this now and add it later in Settings."
   - Add a "Skip" or checkbox opt-out

2. **`src/app/settings/profile/page.tsx`**: Add an "Astrology" section where women can enter/edit birth data at any time, with a toggle to enable/disable the feature

3. **Gate astrology features** on whether birth data exists (already partially done — astrology page has its own input form). Ensure the nav link "Sun, Moon & Rise" only shows when birth data has been entered OR as an invite to enter it.

**Files:** `src/app/onboarding/demographics/page.tsx`, `src/app/settings/profile/page.tsx`, `src/components/SiteHeader.tsx`
