import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const demoEngine = require('../../../../relate_demographics_engine.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { demographics, preferences } = body;

    if (!demographics) {
      return NextResponse.json({ error: 'Demographics are required' }, { status: 400 });
    }

    const userProfile = {
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
    };

    const prefs = {
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

    await demoEngine.initializeData();
    const worstMetros = await demoEngine.findWorstMetros(userProfile, prefs);

    return NextResponse.json({ success: true, worstMetros });
  } catch (error: any) {
    console.error('Worst metros error:', error);
    return NextResponse.json(
      { error: error.message || 'Calculation failed' },
      { status: 500 },
    );
  }
}
