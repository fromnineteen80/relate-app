/**
 * Gender context for astrology content generation.
 * All gendered language in templates reads from this object
 * so a single codepath supports both orientations.
 */

export type AstroGenderContext = {
  userGender: 'M' | 'W';
  partnerLabel: string;      // "Man" or "Woman"
  partnerLabelLower: string; // "man" or "woman"
  partnerPronoun: string;    // "he" or "she"
  partnerPossessive: string; // "his" or "her"
  partnerObject: string;     // "him" or "her"
  partnerPlural: string;     // "men" or "women"
  partnerReflexive: string;  // "himself" or "herself"
};

export function getAstroGenderContext(userGender: 'M' | 'W'): AstroGenderContext {
  const seekingMen = userGender === 'W';
  return {
    userGender,
    partnerLabel: seekingMen ? 'Man' : 'Woman',
    partnerLabelLower: seekingMen ? 'man' : 'woman',
    partnerPronoun: seekingMen ? 'he' : 'she',
    partnerPossessive: seekingMen ? 'his' : 'her',
    partnerObject: seekingMen ? 'him' : 'her',
    partnerPlural: seekingMen ? 'men' : 'women',
    partnerReflexive: seekingMen ? 'himself' : 'herself',
  };
}

/** Read the user's gender from localStorage and return the context. */
export function getAstroGenderContextFromStorage(): AstroGenderContext {
  if (typeof window === 'undefined') return getAstroGenderContext('W');
  const g = localStorage.getItem('relate_gender');
  return getAstroGenderContext(g === 'M' ? 'M' : 'W');
}
