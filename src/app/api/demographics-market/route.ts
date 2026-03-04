import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const demoEngine = require('../../../../relate_demographics_engine.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, demographics, preferences } = body;

    if (!demographics || !demographics.zipCode) {
      return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 });
    }

    // Build user inputs for the demographics engine
    const userInputs = {
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
      // Preferences
      ageMin: preferences?.prefAgeMin || (demographics.age - 5),
      ageMax: preferences?.prefAgeMax || (demographics.age + 5),
      minIncome: preferences?.prefIncomeMin || 0,
      minHeight: preferences?.prefHeightMin || null,
      bodyTypes: preferences?.prefBodyTypes || ['No preference'],
      fitnessLevels: preferences?.prefFitnessLevels || ['No preference'],
      politicalViews: preferences?.prefPolitical || ['No preference'],
      partnerHasKids: preferences?.prefHasKids || 'No preference',
      partnerSmoking: preferences?.prefSmoking || 'No preference',
    };

    // Initialize data and run calculations
    await demoEngine.initializeData();
    const result = await demoEngine.processDemographics(userInputs);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Persist to Supabase if userId provided
    if (userId) {
      try {
        const supabase = createServerClient();
        const marketData = {
          location: result.location,
          relateScore: result.relateScore,
          matchPool: result.matchPool,
          matchProbability: result.matchProbability,
          matchCount: result.matchCount,
          calculatedAt: new Date().toISOString(),
        };

        // Store in user_progress.results alongside assessment results
        const { data: existing } = await supabase
          .from('user_progress')
          .select('results')
          .eq('user_id', userId)
          .single();

        const currentResults = existing?.results || {};
        const updatedResults = { ...currentResults, marketData };

        await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            results: updatedResults,
            updated_at: new Date().toISOString(),
          });
      } catch (dbErr) {
        console.error('Failed to persist market data:', dbErr);
        // Don't fail the request — return data anyway
      }
    }

    return NextResponse.json({
      success: true,
      location: result.location,
      relateScore: result.relateScore,
      matchPool: {
        ...result.matchPool,
        funnel: result.matchPool.funnel,
      },
      matchProbability: result.matchProbability,
      matchCount: result.matchCount,
    });
  } catch (error: any) {
    console.error('Demographics market error:', error);
    return NextResponse.json(
      { error: error.message || 'Calculation failed' },
      { status: 500 },
    );
  }
}
