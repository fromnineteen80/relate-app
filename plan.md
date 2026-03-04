# Market Coaching Improvements

## Problem
1. **Raw stage names as headers**: Bottleneck insights show raw funnel labels like `Has kids: No`, `Smoking: No`, `Body type: Athletic, Fit`, `Height ≥ 5'10"` as section titles. These are filter labels, not insight titles.
2. **Generic "What to do" text**: Actions are one-size-fits-all ("Evaluate whether this reflects a genuine dealbreaker or a nice-to-have") regardless of which filter is the bottleneck. They don't explain what the specific data means for the user's matching ability.

## Plan

All changes in `src/app/results/page.tsx`, `MarketCoaching` component only.

### 1. Add `humanizeBottleneck()` helper
Maps raw funnel stage names to meaningful titles, descriptions, and actions. Pattern-matches on the stage string and uses context (metro, demographics, drop %, lost count, pool size) to generate specific coaching.

| Raw Stage Pattern | Humanized Title | Description Style | Action Style |
|---|---|---|---|
| `Has kids: No` | "You Want a Partner Without Children" | What % of singles in their age bracket are parents, what this means for pool | Whether this is a core value or flexible; age-specific realities |
| `Wants kids: No/Yes` | "You Want a Partner Who Does/Doesn't Want Children" | Age-relevant context about how many share this preference | Life-stage framing, not just a number |
| `Smoking: No` | "You Require a Non-Smoker" | Local smoking rates and how much it costs them | Usually small filter — note if it's actually costly in their metro |
| `Height ≥ X` | "Your Minimum Height Preference" | What % of men/women meet the threshold | If eliminating >30%, explain the math |
| `Body type: X` | "You Prefer Specific Body Types" | How these compound with fitness + height | Note compounding filters |
| `Fitness: X` | "Your Fitness Level Preference" | What % of population exercises at that frequency | Compounding with body type |
| `Political: X` | "Your Political Compatibility Filter" | Local political demographics | How costly this is given their metro's lean |
| `Age X-Y` | "Your Preferred Age Range" | Pool implications of narrow vs wide | If narrow, suggest widening by 2-3 years |
| `Income ≥ $X` | "Your Minimum Income Requirement" | What percentile that income is locally | Income curve is steep — small changes have big impact |
| Fallback | Clean stage name (strip raw values) | Drop % language with pool context | Generic but still actionable |

### 2. Refactor bottleneck insights (lines 864-878)
Replace `drops[0].stageName` as title → call `humanizeBottleneck()` which returns `{ title, description, action }` with full context.

### 3. Flesh out weakest-component coaching (lines 808-838)
The income/education/age/children/ethnicity coaching already has specific entries but descriptions are thin. Add:
- More specific numbers (percentile position, what a realistic improvement path looks like)
- Gender-aware framing using `demographics.gender`
- Metro-specific context using `metro` name

### 4. Improve remaining insights (lines 882-896)
Selectivity, match probability, and geographic insights — expand from one-liners to explain what the numbers mean in practical dating terms.
