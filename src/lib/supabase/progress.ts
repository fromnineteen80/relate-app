'use client';

import { config } from '@/lib/config';
import { getSupabase } from '@/lib/supabase/client';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Save assessment module responses to Supabase (fire-and-forget).
 * Also writes to localStorage as the primary fast cache.
 */
export function saveModuleResponses(
  userId: string,
  moduleNumber: number,
  responses: Record<string, number | string>,
) {
  // Always save to localStorage first (fast, synchronous)
  localStorage.setItem(`relate_m${moduleNumber}_responses`, JSON.stringify(responses));

  // Background save to Supabase
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.from('user_progress').upsert({
    user_id: userId,
    [`m${moduleNumber}_responses`]: responses,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).then(({ error }) => {
    if (error) console.warn('Failed to save module responses to DB:', error.message);
  });
}

/**
 * Mark a module as completed and save scored data.
 */
export function saveModuleCompleted(
  userId: string,
  moduleNumber: number,
  scored: any,
) {
  localStorage.setItem(`relate_m${moduleNumber}_completed`, 'true');
  localStorage.setItem(`relate_m${moduleNumber}_scored`, JSON.stringify(scored));

  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.from('user_progress').upsert({
    user_id: userId,
    [`m${moduleNumber}_completed`]: true,
    [`m${moduleNumber}_scored`]: scored,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).then(({ error }) => {
    if (error) console.warn('Failed to save module completion to DB:', error.message);
  });
}

/**
 * Save final results to Supabase.
 */
export function saveResults(userId: string, results: any) {
  localStorage.setItem('relate_results', JSON.stringify(results));

  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.from('user_progress').upsert({
    user_id: userId,
    results,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).then(({ error }) => {
    if (error) console.warn('Failed to save results to DB:', error.message);
  });
}

/**
 * Load all progress from Supabase and hydrate localStorage.
 * Returns the progress data, or null if not found.
 * Call this on page load when localStorage is empty.
 */
export async function loadAndHydrateProgress(userId: string): Promise<any | null> {
  if (config.useMockAuth) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  // Hydrate localStorage from DB data
  for (let m = 1; m <= 4; m++) {
    const key = `m${m}` as 'm1' | 'm2' | 'm3' | 'm4';
    if (data[`${key}_responses`]) {
      localStorage.setItem(`relate_${key}_responses`, JSON.stringify(data[`${key}_responses`]));
    }
    if (data[`${key}_completed`]) {
      localStorage.setItem(`relate_${key}_completed`, 'true');
    }
    if (data[`${key}_scored`]) {
      localStorage.setItem(`relate_${key}_scored`, JSON.stringify(data[`${key}_scored`]));
    }
  }
  if (data.results) {
    localStorage.setItem('relate_results', JSON.stringify(data.results));
  }

  return data;
}

/**
 * Clear all assessment progress from both localStorage and Supabase.
 * Used by "Start Over" / "Retake Assessment" to ensure a true clean slate.
 */
export async function clearAllProgress(userId: string) {
  // Clear localStorage
  for (let m = 1; m <= 4; m++) {
    localStorage.removeItem(`relate_m${m}_responses`);
    localStorage.removeItem(`relate_m${m}_completed`);
    localStorage.removeItem(`relate_m${m}_scored`);
  }
  localStorage.removeItem('relate_results');

  // Clear Supabase
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from('user_progress').upsert({
    user_id: userId,
    m1_responses: null,
    m1_completed: false,
    m1_scored: null,
    m2_responses: null,
    m2_completed: false,
    m2_scored: null,
    m3_responses: null,
    m3_completed: false,
    m3_scored: null,
    m4_responses: null,
    m4_completed: false,
    m4_scored: null,
    results: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) console.warn('Failed to clear progress in DB:', error.message);
}

/**
 * Save profile data to the users table.
 */
export function saveProfileToDb(
  userId: string,
  email: string,
  profile: { firstName: string; lastName: string; zipCode: string; city: string; state: string; county: string },
) {
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.from('users').upsert({
    id: userId,
    email,
    first_name: profile.firstName,
    last_name: profile.lastName,
    zip_code: profile.zipCode,
    city: profile.city,
    state: profile.state,
    county: profile.county,
  }).then(({ error }) => {
    if (error) console.warn('Failed to save profile to DB:', error.message);
  });
}

/**
 * Load profile + demographics from the users table and hydrate localStorage.
 */
export async function loadProfileFromDb(userId: string): Promise<boolean> {
  if (config.useMockAuth) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return false;

  // Hydrate profile localStorage
  if (data.first_name || data.last_name) {
    const profile = {
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      zipCode: data.zip_code || '',
      city: data.city || '',
      state: data.state || '',
      county: data.county || '',
      photoUrl: null,
    };
    localStorage.setItem('relate_profile', JSON.stringify(profile));
    const name = `${profile.firstName} ${profile.lastName}`.trim();
    if (name) localStorage.setItem('relate_profile_name', name);
  }

  // Hydrate demographics localStorage (including preferences)
  if (data.gender) {
    const demographics: any = {
      gender: data.gender,
      age: data.age,
      zip_code: data.zip_code,
      city: data.city,
      state: data.state,
      county: data.county,
      ethnicity: data.ethnicity,
      orientation: data.orientation,
      income: data.income,
      education: data.education,
      height: data.height,
      body_type: data.body_type,
      fitness_level: data.fitness_level,
      political: data.political,
      smoking: data.smoking,
      has_kids: data.has_kids,
      want_kids: data.want_kids,
      relationship_status: data.relationship_status,
      pref_age_min: data.pref_age_min,
      pref_age_max: data.pref_age_max,
      pref_income_min: data.pref_income_min,
      pref_height_min: data.pref_height_min,
      pref_body_types: data.pref_body_types,
      pref_fitness_levels: data.pref_fitness_levels,
      pref_political: data.pref_political,
      pref_smoking: data.pref_smoking,
      pref_has_kids: data.pref_has_kids,
      pref_want_kids: data.pref_want_kids,
      seeking: data.seeking,
    };
    localStorage.setItem('relate_demographics', JSON.stringify(demographics));
    localStorage.setItem('relate_gender', data.gender);
  }

  return true;
}

/**
 * Save demographics form data to the users table (fire-and-forget).
 * Converts form-format fields to DB column names.
 */
export function saveDemographicsToDb(
  userId: string,
  email: string,
  form: any,
) {
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.from('users').upsert({
    id: userId,
    email,
    gender: form.gender === 'Man' ? 'M' : form.gender === 'Woman' ? 'W' : form.gender || null,
    age: form.age ? parseInt(form.age) : null,
    ethnicity: form.ethnicity || null,
    orientation: form.orientation || null,
    income: form.income ?? null,
    education: form.education || null,
    height: form.height || null,
    body_type: form.bodyType || null,
    fitness_level: form.fitness || null,
    political: form.political || null,
    smoking: form.smoking === 'Yes' ? true : form.smoking === 'No' ? false : null,
    has_kids: form.hasKids === 'Yes' ? true : form.hasKids === 'No' ? false : null,
    want_kids: form.wantKids || null,
    relationship_status: form.relationshipStatus || null,
    pref_age_min: form.prefAgeMin ? parseInt(form.prefAgeMin) : null,
    pref_age_max: form.prefAgeMax ? parseInt(form.prefAgeMax) : null,
    pref_income_min: form.prefIncome ?? null,
    pref_height_min: form.prefHeight || null,
    pref_body_types: form.prefBodyTypes?.length > 0 ? form.prefBodyTypes : null,
    pref_fitness_levels: form.prefFitnessLevels?.length > 0 ? form.prefFitnessLevels : null,
    pref_political: form.prefPolitical?.length > 0 ? form.prefPolitical : null,
    pref_smoking: form.prefSmoking || null,
    pref_has_kids: form.prefHasKids || null,
    pref_want_kids: form.prefWantKids || null,
    seeking: form.seeking || null,
  }).then(({ error }) => {
    if (error) console.warn('Failed to save demographics to DB:', error.message);
  });
}

/**
 * Load demographics from the users table and hydrate localStorage.
 * Used by demographics page when localStorage is empty on login.
 */
export async function loadDemographicsFromDb(userId: string): Promise<boolean> {
  // loadProfileFromDb already fetches from users table and hydrates both
  // profile and demographics localStorage keys
  return loadProfileFromDb(userId);
}
