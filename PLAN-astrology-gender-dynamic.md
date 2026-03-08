# Plan: Gender-Dynamic Astrology Module

## Goal
Make the astrology section work for both men and women without duplicating code. Men opt in via a toggle on their account page; women continue to see it as they do now.

## Architecture: Single Codepath with Gender Context

Instead of parallel code, we pass a `gender context` object through the system. Every template string and UI label reads from this object.

```ts
type AstroGenderContext = {
  userGender: 'M' | 'W';
  partnerLabel: string;     // "Man" or "Woman"
  partnerPronoun: string;   // "he" or "she"
  partnerPossessive: string; // "his" or "her"
  partnerObject: string;    // "him" or "her"
};

function getAstroGenderContext(userGender: 'M' | 'W'): AstroGenderContext {
  const seekingMen = userGender === 'W';
  return {
    userGender,
    partnerLabel: seekingMen ? 'Man' : 'Woman',
    partnerPronoun: seekingMen ? 'he' : 'she',
    partnerPossessive: seekingMen ? 'his' : 'her',
    partnerObject: seekingMen ? 'him' : 'her',
  };
}
```

## Changes by File

### 1. New: `src/lib/astrology/gender-context.ts`
- Export `AstroGenderContext` type and `getAstroGenderContext()` helper
- Single source of truth for all gendered language

### 2. `src/lib/astrology/compatibility.ts` (~80 template strings)
- Add `ctx: AstroGenderContext` parameter to all generator functions
- Replace hard-coded "man", "he", "his", "him" with `ctx.partnerLabel`, `ctx.partnerPronoun`, etc.
- Replace `herChart`/`herSun`/`herMoon` variable names → `userChart`/`userSun`/`userMoon`
- `MODALITY_DYNAMIC` strings: replace "He"/"he" with `ctx.partnerPronoun` (make it a function that takes ctx)
- `SIGN_ELEMENT_BEHAVIOR`: replace "himself"/"his" with ctx-aware versions (make it a function)
- `buildDatingRead`, `buildStrengthRead`, `buildChallengeRead`, `buildTipRead`: parameterize
- `buildBehavioralAlignment`, `buildBehavioralTension`, `buildDemoSignNote`: parameterize

### 3. `src/lib/astrology/persona-alignment.ts` (~100 template strings)
- Add `ctx: AstroGenderContext` parameter to `analyzePersonaAlignment()`
- The persona alignment reads ("Your X Sun...") are about THE USER, so most are already gender-neutral
- Only needs changes where it references the partner or uses gendered framing

### 4. `src/app/results/astrology/page.tsx` (main astrology page)
- Remove women-only gate — replace with: show if `isWoman || hasAstrologyEnabled`
- Compute `AstroGenderContext` from user's gender
- Pass ctx through to all generator functions
- Update UI copy: "that type of man" → `that type of ${ctx.partnerLabel.toLowerCase()}`

### 5. `src/app/results/astrology/cheatsheet/page.tsx`
- `{sign.name} Man` → `{sign.name} ${ctx.partnerLabel}`
- "how that type of man connects" → dynamic
- Pass ctx to `generateCompatibilityRead` and `generatePersonaSignRead`

### 6. `src/components/SubNav.tsx`
- Change `isWoman && hasResults` → `hasAstrology && hasResults`
- `hasAstrology` = isWoman OR (isMan AND astrology toggle enabled)

### 7. `src/components/SiteHeader.tsx`
- Same gate change as SubNav

### 8. `src/app/account/page.tsx` (Account Page)
- Add astrology toggle card for men under the "What You're Looking For" / profile section
- When toggled on, show birth date, birth time, birth location fields (same as women's onboarding)
- Save toggle state to localStorage (`relate_astrology_enabled`) and/or demographics
- Save birth data to localStorage same as women's flow

### 9. `src/app/onboarding/demographics/page.tsx`
- No change needed — men who want astrology enable it later from account page
- Women's flow stays exactly as-is

### 10. `src/app/settings/profile/page.tsx`
- Remove `if (!isWoman) return null` gate on astrology card
- Show for anyone with astrology enabled

## Implementation Order

1. **Create gender-context.ts** — the shared type and helper
2. **Parameterize compatibility.ts** — biggest file, most string changes
3. **Parameterize persona-alignment.ts** — similar but smaller
4. **Update astrology page.tsx** — pass ctx, remove women-only gate
5. **Update cheatsheet/page.tsx** — pass ctx, dynamic labels
6. **Add account page toggle + birth fields for men**
7. **Update nav gates** (SubNav, SiteHeader, settings/profile)
8. **Test both paths** — verify women's reads unchanged, men's reads use correct pronouns

## What Does NOT Change
- `signs.ts` — already gender-neutral
- `engine.ts` — pure calculation, already gender-neutral
- Women's existing experience — zero regressions
- Assessment system — unrelated
- Couples system — unrelated

## Risk Mitigation
- All template changes are mechanical (find "man" → `ctx.partnerLabel`, etc.)
- We can verify women's output is identical by checking that `getAstroGenderContext('W')` produces the same strings as the current hard-coded ones
- Men's toggle is opt-in, so no existing male user sees anything unexpected
