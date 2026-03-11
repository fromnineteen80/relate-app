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
 * Save attachment style data to Supabase (fire-and-forget).
 */
export function saveAttachmentData(
  userId: string,
  attachmentResults: any,
  attachmentReport: any,
  attachmentGrowth: any,
) {
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.from('user_progress').upsert({
    user_id: userId,
    attachment_results: attachmentResults,
    attachment_report: attachmentReport,
    attachment_growth: attachmentGrowth,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).then(({ error }) => {
    if (error) console.warn('Failed to save attachment data to DB:', error.message);
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
  for (let m = 1; m <= 5; m++) {
    const key = `m${m}`;
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

  // Hydrate attachment style data if present
  if (data.attachment_results) {
    localStorage.setItem('relate_blueprint_results', JSON.stringify(data.attachment_results));
  }
  if (data.attachment_report) {
    localStorage.setItem('relate_blueprint_report', JSON.stringify(data.attachment_report));
  }
  if (data.attachment_growth) {
    localStorage.setItem('relate_blueprint_growth', JSON.stringify(data.attachment_growth));
  }

  // Hydrate growth data if present
  if (data.growth_data) {
    const gd = data.growth_data;
    if (gd.completedExercises) {
      localStorage.setItem('relate_growth_exercises_completed', JSON.stringify(gd.completedExercises));
    }
    if (gd.points != null) {
      localStorage.setItem('relate_individual_growth_points', String(gd.points));
    }
    if (gd.activeExercise) {
      localStorage.setItem('relate_growth_active_exercise', JSON.stringify(gd.activeExercise));
    }
  }

  return data;
}

/**
 * Clear all assessment progress from both localStorage and Supabase.
 * Used by "Start Over" / "Retake Assessment" to ensure a true clean slate.
 */
export async function clearAllProgress(userId: string) {
  // Clear localStorage
  for (let m = 1; m <= 5; m++) {
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
    m5_responses: null,
    m5_completed: false,
    m5_scored: null,
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
  profile: { firstName: string; lastName: string; zipCode: string; city: string; state: string; county: string; photoUrl?: string | null },
) {
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const row: any = {
    id: userId,
    email,
    first_name: profile.firstName,
    last_name: profile.lastName,
    zip_code: profile.zipCode,
    city: profile.city,
    state: profile.state,
    county: profile.county,
  };
  if (profile.photoUrl !== undefined) {
    row.photo_url = profile.photoUrl;
  }

  supabase.from('users').upsert(row).then(({ error }) => {
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
      photoUrl: data.photo_url || null,
    };
    localStorage.setItem('relate_profile', JSON.stringify(profile));
    if (data.photo_url) {
      localStorage.setItem('relate_profile_photo', data.photo_url);
    }
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
      pref_ethnicities: data.pref_ethnicities,
      pref_education_levels: data.pref_education_levels,
      seeking: data.seeking,
      birth_month: data.birth_month,
      birth_day: data.birth_day,
      birth_year: data.birth_year,
      birth_hour: data.birth_hour,
      birth_minute: data.birth_minute,
      birth_ampm: data.birth_ampm,
      birth_city: data.birth_city,
      birth_latitude: data.birth_latitude,
      birth_longitude: data.birth_longitude,
    };
    localStorage.setItem('relate_demographics', JSON.stringify(demographics));
    localStorage.setItem('relate_gender', data.gender);
    if (data.astrology_enabled != null) {
      localStorage.setItem('relate_astrology_enabled', String(data.astrology_enabled));
    }
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
    pref_ethnicities: form.prefEthnicities?.length > 0 ? form.prefEthnicities : null,
    pref_education_levels: form.prefEducation?.length > 0 ? form.prefEducation : null,
    pref_smoking: form.prefSmoking || null,
    pref_has_kids: form.prefHasKids || null,
    pref_want_kids: form.prefWantKids || null,
    seeking: form.seeking || null,
    birth_month: form.birthMonth ? parseInt(form.birthMonth) : null,
    birth_day: form.birthDay ? parseInt(form.birthDay) : null,
    birth_year: form.birthYear ? parseInt(form.birthYear) : null,
    birth_hour: form.birthHour ? parseInt(form.birthHour) : null,
    birth_minute: form.birthMinute ? parseInt(form.birthMinute) : null,
    birth_ampm: form.birthAmPm || null,
    birth_city: form.birthCity || null,
    birth_latitude: form.birthLatitude ? parseFloat(form.birthLatitude) : null,
    birth_longitude: form.birthLongitude ? parseFloat(form.birthLongitude) : null,
    astrology_enabled: form.astrologyEnabled ?? null,
  }).then(({ error }) => {
    if (error) console.warn('Failed to save demographics to DB:', error.message);
  });
}

/**
 * Save a single field to the users table (fire-and-forget).
 */
export function saveUserField(userId: string, field: string, value: any) {
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;
  supabase.from('users').update({ [field]: value }).eq('id', userId)
    .then(({ error }) => {
      if (error) console.warn(`Failed to save ${field} to DB:`, error.message);
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

// ── Couples & Growth Sync ──

/**
 * Save the couples report to the partnerships table (fire-and-forget).
 */
export function saveCouplesReportToDb(userId: string, report: any) {
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  // Find the active partnership for this user
  supabase.from('partnerships')
    .select('id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('status', 'active')
    .single()
    .then(({ data }) => {
      if (!data?.id) return;
      supabase.from('partnerships').update({
        couples_report: report,
        updated_at: new Date().toISOString(),
      }).eq('id', data.id).then(({ error }) => {
        if (error) console.warn('Failed to save couples report to DB:', error.message);
      });
    });
}

/**
 * Load the couples report from the partnerships table and hydrate localStorage.
 */
export async function loadCouplesDataFromDb(userId: string): Promise<boolean> {
  if (config.useMockAuth) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase.from('partnerships')
    .select('id, couples_report, invite_email, user1_id, user2_id, status')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('status', 'active')
    .single();

  if (error || !data) return false;

  // Hydrate partner email
  const partnerId = data.user1_id === userId ? data.user2_id : data.user1_id;
  if (data.invite_email) {
    localStorage.setItem('relate_partner_email', data.invite_email);
  }

  // Load partner profile (name, gender)
  if (partnerId) {
    const { data: partner } = await supabase.from('users')
      .select('first_name, gender, photo_url')
      .eq('id', partnerId)
      .single();
    if (partner) {
      if (partner.gender) localStorage.setItem('relate_partner_gender', partner.gender);
      if (partner.first_name) localStorage.setItem('relate_partner_first_name', partner.first_name);
      if (partner.photo_url) localStorage.setItem('relate_partner_photo', partner.photo_url);
      else localStorage.removeItem('relate_partner_photo');
    }

    // Load partner results
    const { data: partnerProgress } = await supabase.from('user_progress')
      .select('results')
      .eq('user_id', partnerId)
      .single();
    if (partnerProgress?.results) {
      localStorage.setItem('relate_partner_results', JSON.stringify(partnerProgress.results));
    }
  }

  // Hydrate couples report
  if (data.couples_report) {
    localStorage.setItem('relate_couples_report', JSON.stringify(data.couples_report));
  }

  return true;
}

/**
 * Save individual growth data to user_progress (fire-and-forget).
 */
export function saveGrowthDataToDb(userId: string, growthData: any) {
  if (config.useMockAuth) return;
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.from('user_progress').upsert({
    user_id: userId,
    growth_data: growthData,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).then(({ error }) => {
    if (error) console.warn('Failed to save growth data to DB:', error.message);
  });
}

/**
 * Comprehensive hydration: loads ALL user data from Supabase into localStorage.
 * Called on session restore to ensure cross-device sync.
 */
export async function fullHydrateFromDb(userId: string): Promise<void> {
  if (config.useMockAuth) return;

  // Load profile + demographics (includes photo, education, ethnicity, etc.)
  await loadProfileFromDb(userId);

  // Load assessment progress + results
  await loadAndHydrateProgress(userId);

  // Load couples data (partner info, couples report)
  await loadCouplesDataFromDb(userId);
}

/**
 * Subscribe to partner profile changes via Supabase Realtime.
 * Returns an unsubscribe function.
 */
export function subscribeToPartnerChanges(
  userId: string,
  onPartnerUpdate: (data: any) => void,
): () => void {
  if (config.useMockAuth) return () => {};
  const supabase = getSupabase();
  if (!supabase) return () => {};

  // First find the partner ID
  let channelRef: any = null;

  supabase.from('partnerships')
    .select('user1_id, user2_id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('status', 'active')
    .single()
    .then(({ data }) => {
      if (!data) return;
      const partnerId = data.user1_id === userId ? data.user2_id : data.user1_id;
      if (!partnerId) return;

      // Subscribe to partner's user row changes
      const channel = supabase.channel(`partner-${partnerId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${partnerId}`,
        }, (payload: any) => {
          // Update partner data in localStorage
          const p = payload.new;
          if (p.gender) localStorage.setItem('relate_partner_gender', p.gender);
          if (p.first_name) localStorage.setItem('relate_partner_first_name', p.first_name);
          if (p.photo_url) localStorage.setItem('relate_partner_photo', p.photo_url);
          else localStorage.removeItem('relate_partner_photo');
          onPartnerUpdate(p);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${partnerId}`,
        }, (payload: any) => {
          // Partner retook the test or updated results
          const p = payload.new;
          if (p.results) {
            localStorage.setItem('relate_partner_results', JSON.stringify(p.results));
            // Clear cached couples report so it regenerates with new data
            localStorage.removeItem('relate_couples_report');
            onPartnerUpdate({ resultsUpdated: true, results: p.results });
          }
        })
        .subscribe();

      channelRef = channel;
    });

  return () => {
    if (channelRef) {
      supabase.removeChannel(channelRef);
    }
  };
}
