/**
 * Shared helper to build the demographics-market API request body
 * from localStorage demographics. This ensures consistent field mapping
 * and preference construction across all call sites (results page,
 * account page, recalculate, etc.).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getProfile } from '@/lib/onboarding';

function readDemo(): Record<string, any> | null {
  try {
    const str = localStorage.getItem('relate_demographics');
    if (!str) return null;
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function getField(demo: Record<string, any>, ...keys: string[]): any {
  for (const k of keys) {
    if (demo[k] !== undefined && demo[k] !== null) return demo[k];
  }
  return undefined;
}

/** Resolve an array preference: return the array if it has entries, else ['No preference']. */
function arrayPref(demo: Record<string, any>, ...keys: string[]): string[] {
  const val = getField(demo, ...keys);
  if (Array.isArray(val) && val.length > 0) return val;
  return ['No preference'];
}

/** Resolve a string preference: return the value if set, else 'No preference'. */
function stringPref(demo: Record<string, any>, ...keys: string[]): string {
  const val = getField(demo, ...keys);
  if (val && typeof val === 'string' && val !== '') return val;
  return 'No preference';
}

export function buildMarketRequestBody(userId: string): { body: any; demoStr: string } | null {
  const demoStr = localStorage.getItem('relate_demographics');
  if (!demoStr) return null;

  let demo: Record<string, any>;
  try { demo = JSON.parse(demoStr); } catch { return null; }

  const gender = localStorage.getItem('relate_gender') || demo.gender;
  const profile = getProfile();
  const zipCode = getField(demo, 'zipCode', 'zip_code') || profile?.zipCode;
  if (!zipCode) return null;

  const age = demo.age ? Number(demo.age) : undefined;

  return {
    demoStr,
    body: {
      userId,
      demographics: {
        gender,
        age,
        zipCode,
        ethnicity: getField(demo, 'ethnicity') || 'White',
        orientation: getField(demo, 'orientation') || 'Straight',
        income: getField(demo, 'income') ?? 50000,
        education: getField(demo, 'education') || "Bachelor's Degree",
        height: getField(demo, 'height') || null,
        bodyType: getField(demo, 'bodyType', 'body_type') || 'Average',
        fitness: getField(demo, 'fitness', 'fitness_level') || '2 to 3 days a week',
        political: getField(demo, 'political') || 'Moderate',
        smoking: getField(demo, 'smoking') ?? false,
        hasKids: getField(demo, 'hasKids', 'has_kids') ?? false,
        wantKids: getField(demo, 'wantKids', 'want_kids') || 'Not sure',
        relationshipStatus: getField(demo, 'relationshipStatus', 'relationship_status') || 'Single',
      },
      preferences: {
        prefAgeMin: getField(demo, 'pref_age_min', 'prefAgeMin') || ((age || 30) - 5),
        prefAgeMax: getField(demo, 'pref_age_max', 'prefAgeMax') || ((age || 30) + 5),
        prefIncomeMin: getField(demo, 'pref_income_min', 'prefIncome') ?? 0,
        prefHeightMin: getField(demo, 'pref_height_min', 'prefHeight') || null,
        prefBodyTypes: arrayPref(demo, 'pref_body_types', 'prefBodyTypes'),
        prefFitnessLevels: arrayPref(demo, 'pref_fitness_levels', 'prefFitnessLevels'),
        prefPolitical: arrayPref(demo, 'pref_political', 'prefPolitical'),
        prefEthnicities: arrayPref(demo, 'pref_ethnicities', 'prefEthnicities'),
        prefEducation: arrayPref(demo, 'pref_education_levels', 'prefEducation'),
        prefHasKids: stringPref(demo, 'pref_has_kids', 'prefHasKids'),
        prefWantKids: stringPref(demo, 'pref_want_kids', 'prefWantKids'),
        prefSmoking: stringPref(demo, 'pref_smoking', 'prefSmoking'),
      },
    },
  };
}
