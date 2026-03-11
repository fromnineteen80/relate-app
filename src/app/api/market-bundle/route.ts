import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const demoEngine = require('../../../../relate_demographics_engine.js');

/**
 * Combined market data endpoint — runs demographics-market, top-metros,
 * and worst-metros in a single request to eliminate waterfall round-trips.
 * Data initialization happens once and all three calculations share it.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, demographics, preferences, includeTopMetros, includeWorstMetros } = body;

    if (!demographics || !demographics.zipCode) {
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 });
    }

    // Build user profile (shared across all calculations)
    const userProfile = {
      zipCode: demographics.zipCode,
      gender: demographics.gender === 'M' ? 'Man' : 'Woman',
      age: demographics.age,
      ethnicity: demographics.ethnicity || 'White',
      orientation: demographics.orientation || 'Straight',
      income: demographics.income || 50000,
      education: demographics.education || "Bachelor's Degree",
      height: demographics.height || null,
      bodyType: demographics.bodyType || 'Average',
      fitness: demographics.fitness || '2 to 3 days a week',
      political: demographics.political || 'Moderate',
      smoking: demographics.smoking ? 'Yes' : 'No',
      hasKids: demographics.hasKids ? 'Yes' : 'No',
      wantKids: demographics.wantKids || 'Not sure',
      relationshipStatus: demographics.relationshipStatus || 'Single',
      // Preferences (used by processDemographics)
      ageMin: Number.isFinite(Number(preferences?.prefAgeMin)) ? Number(preferences.prefAgeMin) : (demographics.age - 5),
      ageMax: Number.isFinite(Number(preferences?.prefAgeMax)) ? Number(preferences.prefAgeMax) : (demographics.age + 5),
      minIncome: Number(preferences?.prefIncomeMin) || 0,
      minHeight: preferences?.prefHeightMin || null,
      bodyTypes: preferences?.prefBodyTypes?.length ? preferences.prefBodyTypes : ['No preference'],
      fitnessLevels: preferences?.prefFitnessLevels?.length ? preferences.prefFitnessLevels : ['No preference'],
      politicalViews: preferences?.prefPolitical?.length ? preferences.prefPolitical : ['No preference'],
      ethnicities: preferences?.prefEthnicities?.length ? preferences.prefEthnicities : ['No preference'],
      educationLevels: preferences?.prefEducation?.length ? preferences.prefEducation : ['No preference'],
      partnerHasKids: preferences?.prefHasKids || 'No preference',
      partnerWantKids: preferences?.prefWantKids || 'No preference',
      partnerSmoking: preferences?.prefSmoking || 'No preference',
    };

    // Preference object for top/worst metros
    const prefs = {
      ageMin: userProfile.ageMin,
      ageMax: userProfile.ageMax,
      minIncome: userProfile.minIncome,
      minHeight: userProfile.minHeight,
      bodyTypes: userProfile.bodyTypes,
      fitnessLevels: userProfile.fitnessLevels,
      politicalViews: userProfile.politicalViews,
      ethnicities: userProfile.ethnicities,
      educationLevels: userProfile.educationLevels,
      partnerHasKids: userProfile.partnerHasKids,
      partnerWantKids: userProfile.partnerWantKids,
      partnerSmoking: userProfile.partnerSmoking,
    };

    // Initialize data ONCE for all calculations
    await demoEngine.initializeData();

    // Run primary demographics calculation
    const result = await demoEngine.processDemographics(userProfile);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const homeScore = result.relateScore?.score ?? 0;

    // Run top-metros and worst-metros in parallel (if requested)
    const metroProfile = {
      gender: userProfile.gender,
      age: userProfile.age,
      ethnicity: userProfile.ethnicity,
      orientation: userProfile.orientation,
      income: userProfile.income,
      education: userProfile.education,
      height: userProfile.height,
      bodyType: userProfile.bodyType,
      fitness: userProfile.fitness,
      political: userProfile.political,
      smoking: userProfile.smoking,
      hasKids: userProfile.hasKids,
      wantKids: userProfile.wantKids,
      relationshipStatus: userProfile.relationshipStatus,
    };

    const [topMetrosResult, worstMetrosResult] = await Promise.all([
      includeTopMetros !== false
        ? demoEngine.findTopMetros(metroProfile, prefs, homeScore).catch(() => null)
        : null,
      includeWorstMetros !== false
        ? demoEngine.findWorstMetros(metroProfile, prefs).catch(() => null)
        : null,
    ]);

    // Resolve home metro rank if top metros succeeded
    let homeMetroRank = null;
    let homeCbsa = null;
    if (topMetrosResult && demographics.zipCode) {
      try {
        const homeLocation = await demoEngine.findCBSAFromZIP(demographics.zipCode);
        if (homeLocation) {
          homeCbsa = homeLocation.cbsa;
          const idx = topMetrosResult.allCompetitive.findIndex((m: any) => m.cbsa === homeLocation.cbsa);
          homeMetroRank = idx >= 0 ? idx + 1 : null;
        }
      } catch { /* non-critical */ }
    }

    // Persist to Supabase (non-blocking)
    if (userId) {
      const supabase = createServerClient();
      const marketData = {
        location: result.location,
        relateScore: result.relateScore,
        matchPool: result.matchPool,
        matchProbability: result.matchProbability,
        matchCount: result.matchCount,
        calculatedAt: new Date().toISOString(),
      };

      (async () => {
        try {
          const { data: existing } = await supabase
            .from('user_progress')
            .select('results')
            .eq('user_id', userId)
            .single();
          const currentResults = existing?.results || {};
          const updatedResults = { ...currentResults, marketData };
          await supabase.from('user_progress').upsert({
            user_id: userId,
            results: updatedResults,
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.error('Failed to persist market data:', dbErr);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      // Demographics market data
      location: result.location,
      relateScore: result.relateScore,
      matchPool: { ...result.matchPool, funnel: result.matchPool.funnel },
      matchProbability: result.matchProbability,
      matchCount: result.matchCount,
      stateComparison: result.stateComparison || null,
      nationalComparison: result.nationalComparison || null,
      // Top metros (if included)
      topMetros: topMetrosResult ? {
        metros: topMetrosResult.topMetros,
        totalCompetitive: topMetrosResult.totalCompetitive,
        homeMetroRank,
        homeCbsa,
        effectiveMinScore: topMetrosResult.effectiveMinScore,
      } : null,
      // Worst metros (if included)
      worstMetros: worstMetrosResult ? worstMetrosResult : null,
    });
  } catch (error: any) {
    console.error('Market bundle error:', error);
    return NextResponse.json(
      { error: error.message || 'Calculation failed' },
      { status: 500 },
    );
  }
}
