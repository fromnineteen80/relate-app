/**
 * Relate Demographics Engine
 * Version: 1.0
 * 
 * Handles all demographic data collection, CBSA lookup, Relate Score calculation,
 * and Match Pool funnel calculations.
 * 
 * Data Sources:
 * - CBSA Data: https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/cbsa-data.js
 * - ZIP Data: https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/zip-centroids.js
 */

// ============================================================================
// DATA SOURCE URLS
// ============================================================================

const DATA_URLS = {
  cbsa: 'https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/cbsa-data.js',
  zip: 'https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/zip-centroids.js'
};

// ============================================================================
// DEMOGRAPHIC QUESTIONS SCHEMA
// ============================================================================

const DEMOGRAPHIC_QUESTIONS = {
  // SECTION A: CORE DEMOGRAPHICS
  location: {
    zipCode: {
      id: 'D_ZIP',
      question: 'What is your ZIP code?',
      type: 'text',
      validation: /^\d{5}$/,
      required: true,
      section: 'location'
    },
    city: {
      id: 'D_CITY',
      question: 'What city do you live in?',
      type: 'text',
      required: false,
      section: 'location'
    },
    state: {
      id: 'D_STATE',
      question: 'What state do you live in?',
      type: 'dropdown',
      options: [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
      ],
      required: false,
      section: 'location'
    }
  },

  identity: {
    gender: {
      id: 'D_GENDER',
      question: 'What is your gender?',
      type: 'dropdown',
      options: ['Man', 'Woman'],
      required: true,
      section: 'identity',
      cbsaKey: 'gender'
    },
    age: {
      id: 'D_AGE',
      question: 'How old are you?',
      type: 'number',
      min: 18,
      max: 100,
      required: true,
      section: 'identity'
    },
    ethnicity: {
      id: 'D_ETHNICITY',
      question: 'What is your ethnicity?',
      type: 'dropdown',
      options: [
        'White',
        'Hispanic/Latino',
        'Black',
        'Asian',
        'Native American',
        'Pacific Islander',
        'Other/Mixed'
      ],
      required: true,
      section: 'identity',
      cbsaKeyMap: {
        'White': 'ethnicity_white_cbsa',
        'Hispanic/Latino': 'ethnicity_hispanic_cbsa',
        'Black': 'ethnicity_black_cbsa',
        'Asian': 'ethnicity_asian_cbsa',
        'Native American': 'ethnicity_native_cbsa',
        'Pacific Islander': 'ethnicity_pacific_cbsa',
        'Other/Mixed': 'ethnicity_other_cbsa'
      }
    },
    orientation: {
      id: 'D_ORIENTATION',
      question: 'What is your sexual orientation?',
      type: 'dropdown',
      options: ['Straight', 'Gay/Lesbian', 'Bisexual', 'Other'],
      required: true,
      section: 'identity',
      cbsaKeyMap: {
        'Straight': 'orientation_straight_cbsa',
        'Gay/Lesbian': 'orientation_gay_lesbian_cbsa',
        'Bisexual': 'orientation_bisexual_cbsa',
        'Other': 'orientation_other_cbsa'
      }
    }
  },

  // SECTION B: ABOUT YOU (Singles)
  aboutYou: {
    income: {
      id: 'D_INCOME',
      question: 'What is your annual income?',
      type: 'slider',
      min: 0,
      max: 1000000,
      step: 10000,
      format: 'currency',
      required: true,
      section: 'aboutYou'
    },
    education: {
      id: 'D_EDUCATION',
      question: 'What is your highest level of education?',
      type: 'dropdown',
      options: [
        'Less than High School',
        'High School Graduate',
        'Trade/Vocational',
        'Associate Degree',
        'Some College',
        'Bachelor\'s Degree',
        'Graduate Degree'
      ],
      required: true,
      section: 'aboutYou',
      cbsaKeyMap: {
        'Less than High School': 'education_less_hs_cbsa',
        'High School Graduate': 'education_hs_grad_cbsa',
        'Trade/Vocational': 'education_trade_cbsa',
        'Associate Degree': 'education_associate_cbsa',
        'Some College': 'education_some_college_cbsa',
        'Bachelor\'s Degree': 'education_bachelors_cbsa',
        'Graduate Degree': 'education_graduate_cbsa'
      }
    },
    height: {
      id: 'D_HEIGHT',
      question: 'How tall are you?',
      type: 'dropdown',
      options: [
        '4\'10"', '4\'11"',
        '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"',
        '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"'
      ],
      required: true,
      section: 'aboutYou',
      genderSpecific: 'Man', // Only shown to men for DMV calculation
      cbsaKeyMap: {
        '4\'10"': 'height_under_60_cbsa',
        '4\'11"': 'height_under_60_cbsa',
        '5\'0"': 'height_60_62_cbsa',
        '5\'1"': 'height_60_62_cbsa',
        '5\'2"': 'height_60_62_cbsa',
        '5\'3"': 'height_63_65_cbsa',
        '5\'4"': 'height_63_65_cbsa',
        '5\'5"': 'height_63_65_cbsa',
        '5\'6"': 'height_66_68_cbsa',
        '5\'7"': 'height_66_68_cbsa',
        '5\'8"': 'height_66_68_cbsa',
        '5\'9"': 'height_69_71_cbsa',
        '5\'10"': 'height_69_71_cbsa',
        '5\'11"': 'height_69_71_cbsa',
        '6\'0"': 'height_72plus_cbsa',
        '6\'1"': 'height_72plus_cbsa',
        '6\'2"': 'height_72plus_cbsa',
        '6\'3"': 'height_72plus_cbsa',
        '6\'4"': 'height_72plus_cbsa',
        '6\'5"': 'height_72plus_cbsa',
        '6\'6"': 'height_72plus_cbsa',
        '6\'7"': 'height_72plus_cbsa',
        '6\'8"': 'height_72plus_cbsa'
      }
    },
    bodyType: {
      id: 'D_BODY_TYPE',
      question: 'How would you characterize your body type?',
      type: 'dropdown',
      options: ['Lean or Fit', 'Average', 'Overweight', 'Obese'],
      required: true,
      section: 'aboutYou',
      cbsaKeyMap: {
        'Lean or Fit': 'bmi_elite_cbsa',
        'Average': 'bmi_normal_cbsa',
        'Overweight': 'bmi_overweight_cbsa',
        'Obese': 'bmi_obesity_cbsa'
      }
    },
    fitness: {
      id: 'D_FITNESS',
      question: 'How often do you work out each week?',
      type: 'dropdown',
      options: ['Never', '1 day a week', '2 to 3 days a week', '4 to 6 days a week', 'Every day'],
      required: true,
      section: 'aboutYou',
      cbsaKeyMap: {
        'Never': 'fitness_never_cbsa',
        '1 day a week': 'fitness_1_day_cbsa',
        '2 to 3 days a week': 'fitness_2_3_days_cbsa',
        '4 to 6 days a week': 'fitness_4_6_days_cbsa',
        'Every day': 'fitness_daily_cbsa'
      }
    },
    political: {
      id: 'D_POLITICAL',
      question: 'How would you describe your political views?',
      type: 'dropdown',
      options: ['Apolitical', 'Liberal', 'Moderate', 'Conservative'],
      required: true,
      section: 'aboutYou',
      cbsaKeyMap: {
        'Apolitical': 'political_apolitical_cbsa',
        'Liberal': 'political_liberal_cbsa',
        'Moderate': 'political_moderate_cbsa',
        'Conservative': 'political_conservative_cbsa'
      }
    },
    smoking: {
      id: 'D_SMOKING',
      question: 'Do you smoke?',
      type: 'dropdown',
      options: ['Yes', 'No'],
      required: true,
      section: 'aboutYou',
      cbsaKeyMap: {
        'Yes': 'smoking_yes_cbsa',
        'No': 'smoking_no_cbsa'
      }
    },
    hasKids: {
      id: 'D_HAS_KIDS',
      question: 'Do you have children?',
      type: 'dropdown',
      options: ['Yes', 'No'],
      required: true,
      section: 'aboutYou',
      cbsaKeyMap: {
        'Yes': 'have_kids_yes_cbsa',
        'No': 'have_kids_no_cbsa'
      }
    },
    wantKids: {
      id: 'D_WANT_KIDS',
      question: 'Do you want children (or more children)?',
      type: 'dropdown',
      options: ['Yes', 'No', 'Maybe'],
      required: true,
      section: 'aboutYou',
      cbsaKeyMap: {
        'Yes': 'want_kids_yes_cbsa',
        'No': 'want_kids_no_cbsa',
        'Maybe': 'want_kids_maybe_cbsa'
      }
    },
    relationshipStatus: {
      id: 'D_RELATIONSHIP_STATUS',
      question: 'What is your current relationship status?',
      type: 'dropdown',
      options: ['Single', 'Dating', 'Separated', 'Married'],
      required: true,
      section: 'aboutYou',
      cbsaKeyMap: {
        'Single': 'relationship_single_cbsa',
        'Dating': 'relationship_dating_cbsa',
        'Separated': 'relationship_separated_cbsa',
        'Married': 'relationship_married_cbsa'
      }
    }
  },

  // SECTION C: PARTNER PREFERENCES (Singles)
  partnerPrefs: {
    ageMin: {
      id: 'D_PREF_AGE_MIN',
      question: 'Minimum age you would consider in a partner?',
      type: 'number',
      min: 18,
      max: 100,
      required: true,
      section: 'partnerPrefs'
    },
    ageMax: {
      id: 'D_PREF_AGE_MAX',
      question: 'Maximum age you would consider in a partner?',
      type: 'number',
      min: 18,
      max: 100,
      required: true,
      section: 'partnerPrefs'
    },
    minIncome: {
      id: 'D_PREF_INCOME',
      question: 'What is the minimum income you would consider?',
      type: 'slider',
      min: 0,
      max: 1000000,
      step: 10000,
      format: 'currency',
      required: true,
      section: 'partnerPrefs'
    },
    minHeight: {
      id: 'D_PREF_HEIGHT',
      question: 'What is the minimum height you would consider?',
      type: 'dropdown',
      options: [
        'No preference',
        '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"',
        '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"'
      ],
      required: true,
      section: 'partnerPrefs',
      genderSpecific: 'Woman' // Only shown to women
    },
    bodyTypes: {
      id: 'D_PREF_BODY_TYPE',
      question: 'What body types would you consider?',
      type: 'multiSelect',
      options: ['No preference', 'Lean or Fit', 'Average', 'Overweight', 'Obese'],
      required: true,
      section: 'partnerPrefs'
    },
    fitnessLevels: {
      id: 'D_PREF_FITNESS',
      question: 'What fitness levels would you consider?',
      type: 'multiSelect',
      options: ['No preference', 'Never', '1 day a week', '2 to 3 days a week', '4 to 6 days a week', 'Every day'],
      required: true,
      section: 'partnerPrefs'
    },
    politicalViews: {
      id: 'D_PREF_POLITICAL',
      question: 'What political views would you consider?',
      type: 'multiSelect',
      options: ['No preference', 'Apolitical', 'Liberal', 'Moderate', 'Conservative'],
      required: true,
      section: 'partnerPrefs'
    },
    ethnicities: {
      id: 'D_PREF_ETHNICITIES',
      question: 'What ethnicities would you consider?',
      type: 'multiSelect',
      options: ['No preference', 'White', 'Hispanic/Latino', 'Black', 'Asian', 'Native American', 'Pacific Islander', 'Other/Mixed'],
      required: true,
      section: 'partnerPrefs'
    },
    educationLevels: {
      id: 'D_PREF_EDUCATION',
      question: 'What education levels would you consider?',
      type: 'multiSelect',
      options: ['No preference', 'Less than High School', 'High School Graduate', 'Trade/Vocational', 'Associate Degree', 'Some College', 'Bachelor\'s Degree', 'Graduate Degree'],
      required: true,
      section: 'partnerPrefs'
    },
    partnerHasKids: {
      id: 'D_PREF_HAS_KIDS',
      question: 'Would you date someone who has kids?',
      type: 'dropdown',
      options: ['No preference', 'No', 'Yes'],
      required: true,
      section: 'partnerPrefs'
    },
    partnerSmoking: {
      id: 'D_PREF_SMOKING',
      question: 'Would you date someone who smokes?',
      type: 'dropdown',
      options: ['No preference', 'No', 'Yes'],
      required: true,
      section: 'partnerPrefs'
    }
  },

  // SECTION D: RELOCATION
  relocation: {
    targetMetros: {
      id: 'D_TARGET_METROS',
      question: 'Select metro areas you would consider relocating to (up to 6)',
      type: 'autocompleteMulti',
      maxSelections: 6,
      required: false,
      section: 'relocation'
    }
  }
};

// ============================================================================
// CALCULATION CONSTANTS
// ============================================================================

// Universal exclusions
const EXCLUSION_RATES = {
  over65: 0.23,
  homeless: 0.005,
  universal: 0.235  // Combined
};

// Felon rates by gender and ethnicity
const FELON_RATES = {
  men: { overall: 0.13, white: 0.08, poc: 0.22 },
  women: { overall: 0.03, white: 0.02, poc: 0.05 }
};

// Education multipliers for felon rates
const EDUCATION_FELON_MULTIPLIERS = {
  'Less than High School': 1.30,
  'High School Graduate': 1.30,
  'Trade/Vocational': 1.00,
  'Associate Degree': 0.65,
  'Some College': 0.65,
  'Bachelor\'s Degree': 0.20,
  'Graduate Degree': 0.10
};

// Drug use rates
const DRUG_USE_RATES = {
  men: { overall: 0.16, white: 0.16, poc: 0.14 },
  women: { overall: 0.12, white: 0.13, poc: 0.11 }
};

// Education multipliers for drug rates
const EDUCATION_DRUG_MULTIPLIERS = {
  'Less than High School': 1.25,
  'High School Graduate': 1.25,
  'Trade/Vocational': 1.10,
  'Associate Degree': 1.10,
  'Some College': 1.10,
  'Bachelor\'s Degree': 0.80,
  'Graduate Degree': 0.60
};

// Legacy Relate Score weights (kept for export compatibility)
const RELATE_SCORE_WEIGHTS = {
  male: {
    income: 0.35,
    education: 0.20,
    age: 0.25,
    ethnicity: 0.10,
    children: 0.10
  },
  female: {
    income: 0.15,
    education: 0.15,
    age: 0.40,
    ethnicity: 0.15,
    children: 0.15
  }
};

// ============================================================================
// DESIRABILITY SCORING (11-trait, raw+market 50/50 blend)
// ============================================================================

// Full trait weights from blueprint (sum to 100 per gender)
const DESIRABILITY_WEIGHTS = {
  man: { age: 9, ethnicity: 11, income: 15, education: 9, height: 11, body: 10, politics: 9, smoking: 5, hasKids: 9, wantKids: 5, costOfLiving: 7 },
  woman: { age: 17, ethnicity: 11, income: 5, education: 8, height: 0, body: 20, politics: 9, smoking: 5, hasKids: 10, wantKids: 5, costOfLiving: 10 }
};

// Age raw curves (from blueprint)
const DESIRABILITY_AGE_CURVES = {
  man: [
    { min: 18, max: 24, scoreLow: 55, scoreHigh: 65 },
    { min: 25, max: 30, scoreLow: 70, scoreHigh: 80 },
    { min: 31, max: 33, scoreLow: 80, scoreHigh: 90 },
    { min: 34, max: 42, scoreLow: 90, scoreHigh: 100 },
    { min: 43, max: 50, scoreLow: 75, scoreHigh: 85 },
    { min: 51, max: 60, scoreLow: 55, scoreHigh: 70 },
    { min: 61, max: 100, scoreLow: 30, scoreHigh: 50 }
  ],
  woman: [
    { min: 18, max: 21, scoreLow: 60, scoreHigh: 70 },
    { min: 22, max: 28, scoreLow: 90, scoreHigh: 100 },
    { min: 29, max: 32, scoreLow: 80, scoreHigh: 90 },
    { min: 33, max: 38, scoreLow: 65, scoreHigh: 78 },
    { min: 39, max: 45, scoreLow: 48, scoreHigh: 62 },
    { min: 46, max: 55, scoreLow: 28, scoreHigh: 45 },
    { min: 56, max: 100, scoreLow: 15, scoreHigh: 28 }
  ]
};

// Income raw curves (from blueprint)
const DESIRABILITY_INCOME_CURVES = {
  man: [
    { max: 35000,    scoreLow: 15, scoreHigh: 25 },
    { max: 50000,    scoreLow: 30, scoreHigh: 42 },
    { max: 75000,    scoreLow: 45, scoreHigh: 58 },
    { max: 100000,   scoreLow: 60, scoreHigh: 72 },
    { max: 150000,   scoreLow: 74, scoreHigh: 83 },
    { max: 200000,   scoreLow: 84, scoreHigh: 90 },
    { max: 300000,   scoreLow: 90, scoreHigh: 95 },
    { max: 500000,   scoreLow: 95, scoreHigh: 98 },
    { max: 750000,   scoreLow: 98, scoreHigh: 99 },
    { max: Infinity, scoreLow: 99, scoreHigh: 100 }
  ],
  woman: [
    { max: 35000,    scoreLow: 40, scoreHigh: 50 },
    { max: 75000,    scoreLow: 55, scoreHigh: 65 },
    { max: 150000,   scoreLow: 65, scoreHigh: 72 },
    { max: Infinity, scoreLow: 72, scoreHigh: 78 }
  ]
};

// Education raw scores (from blueprint)
const DESIRABILITY_EDUCATION_SCORES = {
  man: {
    'Less than High School': { scoreLow: 15, scoreHigh: 25 },
    'High School Graduate':  { scoreLow: 30, scoreHigh: 42 },
    'Trade/Vocational':      { scoreLow: 38, scoreHigh: 48 },
    'Associate Degree':      { scoreLow: 45, scoreHigh: 55 },
    'Some College':          { scoreLow: 50, scoreHigh: 60 },
    'Bachelor\'s Degree':    { scoreLow: 70, scoreHigh: 82 },
    'Graduate Degree':       { scoreLow: 85, scoreHigh: 100 }
  },
  woman: {
    'Less than High School': { scoreLow: 30, scoreHigh: 40 },
    'High School Graduate':  { scoreLow: 42, scoreHigh: 52 },
    'Trade/Vocational':      { scoreLow: 45, scoreHigh: 55 },
    'Associate Degree':      { scoreLow: 52, scoreHigh: 62 },
    'Some College':          { scoreLow: 60, scoreHigh: 70 },
    'Bachelor\'s Degree':    { scoreLow: 85, scoreHigh: 100 },
    'Graduate Degree':       { scoreLow: 72, scoreHigh: 82 }
  }
};

// Height raw scores (men only, from blueprint)
const DESIRABILITY_HEIGHT_SCORES = {
  'height_under_60':  { scoreLow: 10, scoreHigh: 20 },
  'height_60_62':     { scoreLow: 20, scoreHigh: 35 },
  'height_63_65':     { scoreLow: 40, scoreHigh: 55 },
  'height_66_68':     { scoreLow: 62, scoreHigh: 75 },
  'height_69_71':     { scoreLow: 83, scoreHigh: 93 },
  'height_72plus':    { scoreLow: 88, scoreHigh: 100 }
};

const HEIGHT_INCH_BRACKETS = [
  { maxInches: 59,       bracketKey: 'height_under_60',  cbsaKey: 'height_under_60_cbsa' },
  { maxInches: 62,       bracketKey: 'height_60_62',     cbsaKey: 'height_60_62_cbsa' },
  { maxInches: 65,       bracketKey: 'height_63_65',     cbsaKey: 'height_63_65_cbsa' },
  { maxInches: 68,       bracketKey: 'height_66_68',     cbsaKey: 'height_66_68_cbsa' },
  { maxInches: 71,       bracketKey: 'height_69_71',     cbsaKey: 'height_69_71_cbsa' },
  { maxInches: Infinity, bracketKey: 'height_72plus',    cbsaKey: 'height_72plus_cbsa' }
];

// BMI raw scores (from blueprint)
const DESIRABILITY_BMI_SCORES = {
  man:   { 'Lean or Fit': 95, 'Average': 87, 'Overweight': 80, 'Obese': 45 },
  woman: { 'Lean or Fit': 96, 'Average': 90, 'Overweight': 60, 'Obese': 30 }
};

const DESIRABILITY_FITNESS_MODIFIERS = {
  'Never': -5, '1 day a week': 0, '2 to 3 days a week': 3, '4 to 6 days a week': 7, 'Every day': 8
};

// BMI percentile order (worst to best)
const BMI_PERCENTILE_ORDER = [
  { bodyType: 'Obese',       key: 'bmi_obesity_cbsa' },
  { bodyType: 'Overweight',  key: 'bmi_overweight_cbsa' },
  { bodyType: 'Average',     key: 'bmi_normal_cbsa' },
  { bodyType: 'Lean or Fit', key: 'bmi_elite_cbsa' }
];

// Fitness percentile order (worst to best)
const FITNESS_PERCENTILE_ORDER = [
  { level: 'Never',               key: 'fitness_never_cbsa' },
  { level: '1 day a week',        key: 'fitness_1_day_cbsa' },
  { level: '2 to 3 days a week',  key: 'fitness_2_3_days_cbsa' },
  { level: '4 to 6 days a week',  key: 'fitness_4_6_days_cbsa' },
  { level: 'Every day',           key: 'fitness_daily_cbsa' }
];

// Politics alignment weights (from blueprint)
const POLITICS_ALIGNMENT = {
  'Conservative': { 'political_conservative_cbsa': 1.0, 'political_moderate_cbsa': 0.55, 'political_liberal_cbsa': 0.05, 'political_apolitical_cbsa': 0.30 },
  'Liberal':      { 'political_conservative_cbsa': 0.05, 'political_moderate_cbsa': 0.55, 'political_liberal_cbsa': 1.0, 'political_apolitical_cbsa': 0.30 },
  'Moderate':     { 'political_conservative_cbsa': 0.60, 'political_moderate_cbsa': 1.0, 'political_liberal_cbsa': 0.60, 'political_apolitical_cbsa': 0.50 },
  'Apolitical':   { 'political_conservative_cbsa': 0.40, 'political_moderate_cbsa': 0.50, 'political_liberal_cbsa': 0.40, 'political_apolitical_cbsa': 0.70 }
};

// Smoking raw scores (from blueprint)
const DESIRABILITY_SMOKING_SCORES = {
  man:   { nonSmoker: 92, smokerVsNonSmokerPool: 35, smokerVsSmokerPool: 75 },
  woman: { nonSmoker: 92, smokerVsNonSmokerPool: 30, smokerVsSmokerPool: 68 }
};

// Has kids raw scores (from blueprint)
const DESIRABILITY_KIDS_SCORES = {
  man:   { noKids: 92, hasKids: 52 },
  woman: { noKids: 92, hasKids: 39 }
};

// Ethnicity preference matrix (from blueprint)
const ETHNICITY_PREFERENCE_MATRIX = {
  womenEvaluating: {
    'White':          { 'White': 88, 'Hispanic/Latino': 58, 'Black': 48, 'Asian': 42, 'Native American': 40, 'Pacific Islander': 45, 'Other': 50 },
    'Hispanic/Latino':{ 'White': 72, 'Hispanic/Latino': 80, 'Black': 52, 'Asian': 44, 'Native American': 45, 'Pacific Islander': 48, 'Other': 50 },
    'Black':          { 'White': 60, 'Hispanic/Latino': 48, 'Black': 82, 'Asian': 38, 'Native American': 40, 'Pacific Islander': 42, 'Other': 45 },
    'Asian':          { 'White': 74, 'Hispanic/Latino': 50, 'Black': 40, 'Asian': 78, 'Native American': 38, 'Pacific Islander': 52, 'Other': 48 },
    'Native American':{ 'White': 68, 'Hispanic/Latino': 55, 'Black': 48, 'Asian': 42, 'Native American': 75, 'Pacific Islander': 45, 'Other': 50 },
    'Pacific Islander':{ 'White': 65, 'Hispanic/Latino': 55, 'Black': 48, 'Asian': 58, 'Native American': 45, 'Pacific Islander': 78, 'Other': 50 },
    'Other':          { 'White': 70, 'Hispanic/Latino': 55, 'Black': 50, 'Asian': 48, 'Native American': 45, 'Pacific Islander': 48, 'Other': 65 }
  },
  menEvaluating: {
    'White':          { 'White': 85, 'Hispanic/Latino': 68, 'Black': 42, 'Asian': 72, 'Native American': 42, 'Pacific Islander': 50, 'Other': 52 },
    'Hispanic/Latino':{ 'White': 70, 'Hispanic/Latino': 82, 'Black': 45, 'Asian': 60, 'Native American': 45, 'Pacific Islander': 52, 'Other': 50 },
    'Black':          { 'White': 58, 'Hispanic/Latino': 52, 'Black': 80, 'Asian': 48, 'Native American': 42, 'Pacific Islander': 45, 'Other': 48 },
    'Asian':          { 'White': 62, 'Hispanic/Latino': 50, 'Black': 38, 'Asian': 82, 'Native American': 38, 'Pacific Islander': 55, 'Other': 45 },
    'Native American':{ 'White': 65, 'Hispanic/Latino': 55, 'Black': 42, 'Asian': 48, 'Native American': 78, 'Pacific Islander': 45, 'Other': 48 },
    'Pacific Islander':{ 'White': 62, 'Hispanic/Latino': 55, 'Black': 42, 'Asian': 60, 'Native American': 42, 'Pacific Islander': 80, 'Other': 48 },
    'Other':          { 'White': 68, 'Hispanic/Latino': 55, 'Black': 45, 'Asian': 55, 'Native American': 42, 'Pacific Islander': 48, 'Other': 62 }
  }
};

const ETHNICITY_CBSA_KEYS = {
  'White': 'ethnicity_white_cbsa',
  'Hispanic/Latino': 'ethnicity_hispanic_cbsa',
  'Black': 'ethnicity_black_cbsa',
  'Asian': 'ethnicity_asian_cbsa',
  'Native American': 'ethnicity_native_cbsa',
  'Pacific Islander': 'ethnicity_pacific_cbsa',
  'Other': 'ethnicity_other_cbsa',
  'Other/Mixed': 'ethnicity_other_cbsa'
};

// Sigmoid configuration for match probability
const SIGMOID_CONFIG = {
  floor: 0.005,      // 0.5% minimum
  ceiling: 0.30,     // 30% maximum
  midpoint: 65,      // Score where probability = ~15%
  steepness: 0.08    // How sharply probability changes
};

// Income brackets and their CBSA keys
const INCOME_BRACKETS = [
  { max: 35000, key: 'income_under_35k_cbsa' },
  { max: 50000, key: 'income_35k_50k_cbsa' },
  { max: 75000, key: 'income_50k_75k_cbsa' },
  { max: 100000, key: 'income_75k_100k_cbsa' },
  { max: 150000, key: 'income_100k_150k_cbsa' },
  { max: 200000, key: 'income_150k_200k_cbsa' },
  { max: 300000, key: 'income_200k_300k_cbsa' },
  { max: 500000, key: 'income_300k_500k_cbsa' },
  { max: 750000, key: 'income_500k_750k_cbsa' },
  { max: Infinity, key: 'income_750k_plus_cbsa' }
];

// Age brackets and their CBSA keys
const AGE_BRACKETS = [
  { min: 18, max: 19, key: 'age_18_19_cbsa' },
  { min: 20, max: 24, key: 'age_20_24_cbsa' },
  { min: 25, max: 29, key: 'age_25_29_cbsa' },
  { min: 30, max: 34, key: 'age_30_34_cbsa' },
  { min: 35, max: 39, key: 'age_35_39_cbsa' },
  { min: 40, max: 44, key: 'age_40_44_cbsa' },
  { min: 45, max: 49, key: 'age_45_49_cbsa' },
  { min: 50, max: 54, key: 'age_50_54_cbsa' },
  { min: 55, max: 59, key: 'age_55_59_cbsa' },
  { min: 60, max: 64, key: 'age_60_64_cbsa' },
  { min: 65, max: 69, key: 'age_65_69_cbsa' },
  { min: 70, max: 74, key: 'age_70_74_cbsa' },
  { min: 75, max: 79, key: 'age_75_79_cbsa' },
  { min: 80, max: 84, key: 'age_80_84_cbsa' },
  { min: 85, max: 120, key: 'age_85_120_cbsa' }
];

// Height brackets (inches) and their CBSA keys
const HEIGHT_BRACKETS = [
  { max: 59, key: 'height_under_60_cbsa' },   // Under 5'0"
  { max: 62, key: 'height_60_62_cbsa' },      // 5'0" - 5'2"
  { max: 65, key: 'height_63_65_cbsa' },      // 5'3" - 5'5"
  { max: 68, key: 'height_66_68_cbsa' },      // 5'6" - 5'8"
  { max: 71, key: 'height_69_71_cbsa' },      // 5'9" - 5'11"
  { max: Infinity, key: 'height_72plus_cbsa' } // 6'0"+
];

// Age score curves by gender
const AGE_SCORE_CURVES = {
  male: [
    { min: 18, max: 24, score: 60 },
    { min: 25, max: 29, score: 75 },
    { min: 30, max: 34, score: 85 },
    { min: 35, max: 44, score: 85 },
    { min: 45, max: 54, score: 70 },
    { min: 55, max: 64, score: 55 },
    { min: 65, max: 100, score: 40 }
  ],
  female: [
    { min: 18, max: 22, score: 85 },
    { min: 23, max: 27, score: 95 },
    { min: 28, max: 32, score: 85 },
    { min: 33, max: 37, score: 70 },
    { min: 38, max: 44, score: 55 },
    { min: 45, max: 54, score: 40 },
    { min: 55, max: 100, score: 30 }
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Haversine distance between two lat/lng points in miles
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert height string to inches
 */
function heightToInches(heightStr) {
  const match = heightStr.match(/(\d+)'(\d+)"/);
  if (match) {
    return parseInt(match[1]) * 12 + parseInt(match[2]);
  }
  return null;
}

/**
 * Format number as currency
 */
function formatCurrency(value) {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
  return '$' + value;
}

// ============================================================================
// DATA LOADING
// ============================================================================

let cbsaData = null;
let zipData = null;

/**
 * Evaluate a JS data file and return the named variable.
 * Handles files like: const SOME_VAR = { ... }; export { SOME_VAR }; module.exports = ...
 */
function evalJSDataFile(text, varName) {
  // Strip ES module exports (export { ... }) which are syntax errors in Function()
  const clean = text.replace(/export\s+\{[^}]*\}\s*;?/g, '');
  // Provide a fake `module` so CommonJS exports don't error
  const fn = new Function('module', clean + '\nreturn ' + varName + ';');
  return fn({ exports: {} });
}

/**
 * Load CBSA data from remote source — returns an object keyed by metro label
 */
async function loadCBSAData() {
  if (cbsaData) return cbsaData;

  try {
    const response = await fetch(DATA_URLS.cbsa);
    const text = await response.text();
    cbsaData = evalJSDataFile(text, 'CBSA_DATA');
    return cbsaData;
  } catch (error) {
    console.error('Failed to load CBSA data:', error);
    throw error;
  }
}

/**
 * Load ZIP code data from remote source — returns an object keyed by ZIP code
 */
async function loadZIPData() {
  if (zipData) return zipData;

  try {
    const response = await fetch(DATA_URLS.zip);
    const text = await response.text();
    zipData = evalJSDataFile(text, 'ZIP_CENTROIDS');
    return zipData;
  } catch (error) {
    console.error('Failed to load ZIP data:', error);
    throw error;
  }
}

/**
 * Initialize all data (call this first)
 */
async function initializeData() {
  await Promise.all([loadCBSAData(), loadZIPData()]);
  return { cbsaData, zipData };
}

// ============================================================================
// CBSA LOOKUP
// ============================================================================

/**
 * Find CBSA from ZIP code using haversine distance
 */
async function findCBSAFromZIP(zipCode) {
  const zips = await loadZIPData();
  const cbsas = await loadCBSAData();
  
  const zipInfo = zips[zipCode];
  if (!zipInfo) {
    return { error: 'ZIP code not found', zipCode };
  }
  
  const { lat, lng } = zipInfo;
  
  // Find closest CBSA by distance
  let closestCBSA = null;
  let minDistance = Infinity;
  
  for (const cbsa of Object.values(cbsas)) {
    if (cbsa.lat && cbsa.lng) {
      const distance = haversineDistance(lat, lng, cbsa.lat, cbsa.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCBSA = cbsa;
      }
    }
  }
  
  if (!closestCBSA) {
    return { error: 'No CBSA found near ZIP code', zipCode };
  }
  
  return {
    cbsa: closestCBSA.cbsa,
    cbsaName: closestCBSA.cbsa_name || closestCBSA.cbsa_label,
    cbsaLabel: closestCBSA.cbsa_label,
    population: closestCBSA.cbsa_population,
    distance: minDistance,
    cbsaData: closestCBSA
  };
}

/**
 * Get CBSA data by CBSA code
 */
async function getCBSAByCode(cbsaCode) {
  const cbsas = await loadCBSAData();
  return Object.values(cbsas).find(c => c.cbsa === cbsaCode || c.cbsa === String(cbsaCode));
}

/**
 * Build a population-weighted aggregate CBSA from a set of CBSAs.
 * Numeric fields are averaged weighted by cbsa_population.
 * The result is a synthetic CBSA object that can be passed to calculateMatchPool.
 */
function buildWeightedAggregate(cbsaList, label) {
  const totalPop = cbsaList.reduce((s, c) => s + (c.cbsa_population || 0), 0);
  if (totalPop === 0) return null;

  const agg = { cbsa_population: totalPop, cbsa_label: label, cbsa_name: label };

  // Collect all numeric keys from the first entry
  const numericKeys = Object.keys(cbsaList[0]).filter(k => {
    if (['lat', 'lng', 'cbsa', 'cbsa_population', 'rpp'].includes(k)) return false;
    return typeof cbsaList[0][k] === 'number';
  });

  for (const key of numericKeys) {
    let weightedSum = 0;
    for (const c of cbsaList) {
      const pop = c.cbsa_population || 0;
      weightedSum += (c[key] || 0) * pop;
    }
    agg[key] = weightedSum / totalPop;
  }

  return agg;
}

/**
 * Extract state abbreviation from cbsa_label (e.g., "Birmingham, AL" → "AL").
 * For multi-state CBSAs (e.g., "Memphis, TN-MS-AR"), returns the first state.
 */
function extractState(cbsaLabel) {
  if (!cbsaLabel) return null;
  const parts = cbsaLabel.split(', ');
  if (parts.length < 2) return null;
  const stateStr = parts[parts.length - 1];
  // Take first state if hyphenated (multi-state metro)
  return stateStr.split('-')[0].trim();
}

/**
 * Get a population-weighted state-level aggregate CBSA.
 */
async function getStateAggregate(stateAbbr) {
  const cbsas = await loadCBSAData();
  const stateCBSAs = Object.values(cbsas).filter(c =>
    extractState(c.cbsa_label) === stateAbbr
  );
  if (stateCBSAs.length === 0) return null;
  return buildWeightedAggregate(stateCBSAs, stateAbbr);
}

/**
 * Get a population-weighted national aggregate CBSA.
 */
async function getNationalAggregate() {
  const cbsas = await loadCBSAData();
  const allCBSAs = Object.values(cbsas).filter(c => c.cbsa_population > 0);
  if (allCBSAs.length === 0) return null;
  return buildWeightedAggregate(allCBSAs, 'National');
}

// ============================================================================
// RELATE SCORE CALCULATION
// ============================================================================

/**
 * Get income percentile (national)
 */
function getIncomePercentileNational(income, cbsa) {
  let cumulative = 0;
  for (const bracket of INCOME_BRACKETS) {
    const bracketPct = cbsa[bracket.key] || 0;
    if (income <= bracket.max) {
      // Interpolate within bracket
      const prevMax = INCOME_BRACKETS[INCOME_BRACKETS.indexOf(bracket) - 1]?.max || 0;
      const bracketRange = bracket.max - prevMax;
      const positionInBracket = (income - prevMax) / bracketRange;
      return cumulative + (bracketPct * positionInBracket);
    }
    cumulative += bracketPct;
  }
  return 100;
}

/**
 * Apply local adjustment to national percentile
 * localScore = 50 + (nationalPercentile - 50) x (50 / localWeight)
 * localWeight should be a relative index (typically 30-150 range).
 * Guard: if localWeight looks like a raw dollar amount (>1000), skip adjustment.
 * Final result is clamped to [0, 100].
 */
function applyLocalAdjustment(nationalPercentile, localWeight) {
  if (!localWeight || localWeight === 0) return nationalPercentile;
  // If localWeight looks like a raw dollar amount instead of an index, skip
  if (localWeight > 1000) return nationalPercentile;
  const adjusted = 50 + (nationalPercentile - 50) * (50 / localWeight);
  return Math.max(0, Math.min(100, adjusted));
}

/**
 * Get education percentile
 */
function getEducationPercentile(education, cbsa) {
  const educationOrder = [
    'Less than High School',
    'High School Graduate',
    'Trade/Vocational',
    'Associate Degree',
    'Some College',
    'Bachelor\'s Degree',
    'Graduate Degree'
  ];
  
  const keys = [
    'education_less_hs_cbsa',
    'education_hs_grad_cbsa',
    'education_trade_cbsa',
    'education_associate_cbsa',
    'education_some_college_cbsa',
    'education_bachelors_cbsa',
    'education_graduate_cbsa'
  ];
  
  const idx = educationOrder.indexOf(education);
  let cumulative = 0;
  for (let i = 0; i <= idx; i++) {
    cumulative += cbsa[keys[i]] || 0;
  }
  return cumulative;
}

/**
 * Get age score from gender-specific curve
 */
function getAgeScore(age, gender) {
  const curve = AGE_SCORE_CURVES[gender === 'Man' ? 'male' : 'female'];
  for (const bracket of curve) {
    if (age >= bracket.min && age <= bracket.max) {
      return bracket.score;
    }
  }
  return 50; // Default
}

/**
 * Get ethnicity score (local representation)
 */
function getEthnicityScore(ethnicity, cbsa) {
  const keyMap = DEMOGRAPHIC_QUESTIONS.identity.ethnicity.cbsaKeyMap;
  const key = keyMap[ethnicity];
  return cbsa[key] || 50;
}

/**
 * Get children score
 */
function getChildrenScore(hasKids, age, gender) {
  const hasKidsValue = hasKids === 'Yes';
  
  if (!hasKidsValue) return 70; // No kids is neutral/positive
  
  // Kids have different impact by gender and age
  if (gender === 'Man') {
    // Men: kids are neutral to slight negative
    return age < 35 ? 45 : 55;
  } else {
    // Women: kids are more negative, especially when younger
    if (age < 25) return 30;
    if (age < 30) return 40;
    if (age < 35) return 50;
    return 55;
  }
}

/**
 * Calculate marriage premium for high-income singles
 */
function calculateMarriagePremium(income, incomePercentile, status, rpp) {
  if (status !== 'Single') return 1.0;
  if (incomePercentile < 70) return 1.0;
  
  // High income singles get a premium
  // Adjusted for cost of living (rpp)
  const colAdjustment = rpp ? (100 / rpp) : 1;
  const premiumBase = Math.min(0.15, (incomePercentile - 70) / 200);
  return 1 + (premiumBase * colAdjustment);
}

/**
 * Interpolate age within a min/max bracket curve (with scoreLow/scoreHigh).
 */
function interpolateAgeCurve(age, curve) {
  for (const b of curve) {
    if (age >= b.min && age <= b.max) {
      if (b.max === b.min) return b.scoreLow;
      const pos = (age - b.min) / (b.max - b.min);
      return b.scoreLow + pos * (b.scoreHigh - b.scoreLow);
    }
  }
  return curve[curve.length - 1].scoreLow;
}

/**
 * Interpolate income within bracket curve.
 */
function interpolateIncomeCurve(income, curve) {
  for (let i = 0; i < curve.length; i++) {
    if (income <= curve[i].max || i === curve.length - 1) {
      const prevMax = i > 0 ? curve[i - 1].max : 0;
      if (curve[i].max === Infinity || curve[i].max === prevMax) return curve[i].scoreLow;
      const pos = Math.max(0, Math.min(1, (income - prevMax) / (curve[i].max - prevMax)));
      return curve[i].scoreLow + pos * (curve[i].scoreHigh - curve[i].scoreLow);
    }
  }
  return 50;
}

/**
 * Calculate cumulative percentile rank within a CBSA distribution.
 * bracketOrder: array of { key } ordered worst-to-best.
 * targetKey: the CBSA field key for the target's bracket.
 */
function calcPercentileRank(targetKey, bracketOrder, cbsa) {
  let cumulative = 0;
  for (const bracket of bracketOrder) {
    if (bracket.key === targetKey) {
      cumulative += (cbsa[bracket.key] || 0) / 2;
      break;
    }
    cumulative += cbsa[bracket.key] || 0;
  }
  return Math.min(100, cumulative);
}

/**
 * Calculate full Relate Score using the 11-trait desirability system.
 * Returns the same shape as the old 5-trait version for frontend compatibility:
 *   { score, components: { income, education, age, ethnicity, children }, marriagePremium, weights }
 */
function calculateRelateScore(userProfile, cbsa) {
  const gender = userProfile.gender;
  const genderKey = gender === 'Man' ? 'man' : 'woman';
  const weights = DESIRABILITY_WEIGHTS[genderKey];
  const cl = (v) => Math.max(0, Math.min(100, v));

  // ── TRAIT 1: AGE ──
  let ageRaw = interpolateAgeCurve(userProfile.age, DESIRABILITY_AGE_CURVES[genderKey]);
  const wantKidsYesCbsa = cbsa.want_kids_yes_cbsa || 0;
  if (wantKidsYesCbsa > 40) ageRaw *= 1.15;
  else if (wantKidsYesCbsa <= 30) ageRaw *= 0.90;
  if (genderKey === 'woman') {
    const peakAgePct = (cbsa.age_25_29_cbsa || 0) + (cbsa.age_30_34_cbsa || 0) +
                       (cbsa.age_35_39_cbsa || 0) + (cbsa.age_40_44_cbsa || 0);
    if (peakAgePct > 40) ageRaw = ageRaw * 0.75 + 65 * 0.25;
  }
  ageRaw = cl(ageRaw);
  // Age market: sum brackets OLDER than user → how many the user is younger than
  const ageMarketOrder = [
    { min: 60, max: 64, key: 'age_60_64_cbsa' },
    { min: 55, max: 59, key: 'age_55_59_cbsa' },
    { min: 50, max: 54, key: 'age_50_54_cbsa' },
    { min: 45, max: 49, key: 'age_45_49_cbsa' },
    { min: 40, max: 44, key: 'age_40_44_cbsa' },
    { min: 35, max: 39, key: 'age_35_39_cbsa' },
    { min: 30, max: 34, key: 'age_30_34_cbsa' },
    { min: 25, max: 29, key: 'age_25_29_cbsa' },
    { min: 20, max: 24, key: 'age_20_24_cbsa' },
    { min: 18, max: 19, key: 'age_18_19_cbsa' }
  ];
  let ageMarket = 0;
  let foundAge = false;
  for (const ab of ageMarketOrder) {
    if (userProfile.age >= ab.min && userProfile.age <= ab.max) {
      ageMarket += (cbsa[ab.key] || 0) / 2;
      foundAge = true;
      break;
    }
    ageMarket += cbsa[ab.key] || 0;
  }
  if (!foundAge) ageMarket = 50;
  ageMarket = cl(ageMarket);
  let ageBlended = 0.5 * ageRaw + 0.5 * ageMarket;

  // ── TRAIT 2: ETHNICITY ──
  const evalMatrix = genderKey === 'man'
    ? ETHNICITY_PREFERENCE_MATRIX.womenEvaluating
    : ETHNICITY_PREFERENCE_MATRIX.menEvaluating;
  const targetEth = userProfile.ethnicity === 'Other/Mixed' ? 'Other' : userProfile.ethnicity;
  let ethRaw = 0, totalEthPct = 0;
  for (const [evalGroup, prefs] of Object.entries(evalMatrix)) {
    const pct = cbsa[ETHNICITY_CBSA_KEYS[evalGroup]] || 0;
    ethRaw += pct * (prefs[targetEth] || 50);
    totalEthPct += pct;
  }
  ethRaw = totalEthPct > 0 ? ethRaw / totalEthPct : 50;
  const ownRacePct = cbsa[ETHNICITY_CBSA_KEYS[userProfile.ethnicity]] || 0;
  const ethMarket = cl(ownRacePct);
  let ethBlended = 0.5 * ethRaw + 0.5 * ethMarket;

  // ── TRAIT 3: INCOME ──
  const rpp = cbsa.rpp || 100;
  const adjustedIncome = userProfile.income * (100 / rpp);
  let incRaw = interpolateIncomeCurve(adjustedIncome, DESIRABILITY_INCOME_CURVES[genderKey]);
  if (userProfile.income >= 500000 && incRaw < 95) incRaw = 95;
  else if (userProfile.income >= 200000 && incRaw < 85) incRaw = 85;
  else if (userProfile.income >= 100000 && incRaw < 60) incRaw = 60;
  incRaw = cl(incRaw);
  let incMarket = getIncomePercentileNational(userProfile.income, cbsa);
  if (userProfile.income >= 500000 && incMarket < 95) incMarket = 95;
  else if (userProfile.income >= 200000 && incMarket < 85) incMarket = 85;
  else if (userProfile.income >= 100000 && incMarket < 60) incMarket = 60;
  incMarket = cl(applyLocalAdjustment(incMarket, cbsa.income_cbsa));
  if (genderKey === 'woman') incMarket = cl(incMarket * 0.4 + 30);
  let incBlended = 0.5 * incRaw + 0.5 * incMarket;

  // ── TRAIT 4: EDUCATION ──
  const eduScores = DESIRABILITY_EDUCATION_SCORES[genderKey];
  const eduEntry = eduScores[userProfile.education] || { scoreLow: 50, scoreHigh: 60 };
  let eduRaw = (eduEntry.scoreLow + eduEntry.scoreHigh) / 2;
  if (genderKey === 'woman' && userProfile.education === 'Graduate Degree') {
    const highEduPct = (cbsa.education_bachelors_cbsa || 0) + (cbsa.education_graduate_cbsa || 0);
    if (highEduPct > 40) {
      const baMid = (eduScores['Bachelor\'s Degree'].scoreLow + eduScores['Bachelor\'s Degree'].scoreHigh) / 2;
      eduRaw = eduRaw * 0.70 + baMid * 0.30;
    }
  }
  eduRaw = cl(eduRaw);
  const eduBrackets = [
    { key: 'education_less_hs_cbsa' }, { key: 'education_hs_grad_cbsa' },
    { key: 'education_trade_cbsa' }, { key: 'education_associate_cbsa' },
    { key: 'education_some_college_cbsa' }, { key: 'education_bachelors_cbsa' },
    { key: 'education_graduate_cbsa' }
  ];
  const eduLevels = ['Less than High School','High School Graduate','Trade/Vocational',
    'Associate Degree','Some College','Bachelor\'s Degree','Graduate Degree'];
  const eduIdx = eduLevels.indexOf(userProfile.education);
  const eduTargetKey = eduIdx >= 0 ? eduBrackets[eduIdx].key : null;
  const eduMarket = eduTargetKey ? cl(calcPercentileRank(eduTargetKey, eduBrackets, cbsa)) : 50;
  let eduBlended = 0.5 * eduRaw + 0.5 * eduMarket;

  // ── TRAIT 5: HEIGHT (men only, weight=0 for women) ──
  let heightBlended = 50, heightRaw = 50, heightMarket = 50;
  if (genderKey === 'man' && userProfile.height) {
    const inches = heightToInches(userProfile.height);
    if (inches) {
      const hb = HEIGHT_INCH_BRACKETS.find(b => inches <= b.maxInches);
      if (hb) {
        const hs = DESIRABILITY_HEIGHT_SCORES[hb.bracketKey];
        const hbIdx = HEIGHT_INCH_BRACKETS.indexOf(hb);
        const prevMax = hbIdx > 0 ? HEIGHT_INCH_BRACKETS[hbIdx - 1].maxInches : 56;
        const bMin = prevMax + 1;
        const bMax = hb.maxInches === Infinity ? 80 : hb.maxInches;
        const pos = bMax > bMin ? Math.max(0, Math.min(1, (inches - bMin) / (bMax - bMin))) : 0.5;
        heightRaw = cl(hs.scoreLow + pos * (hs.scoreHigh - hs.scoreLow));
        const hPerc = HEIGHT_INCH_BRACKETS.map(b => ({ key: b.cbsaKey }));
        heightMarket = cl(calcPercentileRank(hb.cbsaKey, hPerc, cbsa));
      }
      heightBlended = 0.5 * heightRaw + 0.5 * heightMarket;
    }
  }

  // ── TRAIT 6+7: BODY (BMI + fitness) ──
  const bmiRaw = DESIRABILITY_BMI_SCORES[genderKey][userProfile.bodyType] || 50;
  let fitMod = DESIRABILITY_FITNESS_MODIFIERS[userProfile.fitness] || 0;
  const actCbsa = cbsa.activity_cbsa || 70;
  if (actCbsa > 75) fitMod *= 0.7;
  else if (actCbsa < 65) fitMod *= 1.3;
  const bodyRaw = cl(bmiRaw + fitMod);
  const bmiCbsaKey = ({ 'Lean or Fit':'bmi_elite_cbsa','Average':'bmi_normal_cbsa',
    'Overweight':'bmi_overweight_cbsa','Obese':'bmi_obesity_cbsa' })[userProfile.bodyType];
  const bmiMarket = bmiCbsaKey ? calcPercentileRank(bmiCbsaKey, BMI_PERCENTILE_ORDER, cbsa) : 50;
  const fitKey = ({ 'Never':'fitness_never_cbsa','1 day a week':'fitness_1_day_cbsa',
    '2 to 3 days a week':'fitness_2_3_days_cbsa','4 to 6 days a week':'fitness_4_6_days_cbsa',
    'Every day':'fitness_daily_cbsa' })[userProfile.fitness];
  const fitMarket = fitKey ? calcPercentileRank(fitKey, FITNESS_PERCENTILE_ORDER, cbsa) : 50;
  const bodyMarket = cl(bmiMarket + (fitMarket - 50) * 0.3);
  let bodyBlended = 0.5 * bodyRaw + 0.5 * bodyMarket;

  // ── TRAIT 8: POLITICS (IS the market signal, no raw/market split) ──
  const polWeights = POLITICS_ALIGNMENT[userProfile.political] || POLITICS_ALIGNMENT['Moderate'];
  let polScore = 0;
  for (const [field, w] of Object.entries(polWeights)) polScore += (cbsa[field] || 0) * w;
  polScore = cl(polScore);
  let polWeightMult = 1.0;
  if (Math.abs((cbsa.political_conservative_cbsa||0) - (cbsa.political_liberal_cbsa||0)) > 20) polWeightMult = 1.5;
  else if ((cbsa.political_moderate_cbsa||0) > 50) polWeightMult = 0.7;

  // ── TRAIT 9: SMOKING ──
  const smokScores = DESIRABILITY_SMOKING_SCORES[genderKey];
  const isSmoker = userProfile.smoking === 'Yes';
  let smokRaw, smokMarket;
  if (!isSmoker) {
    smokRaw = smokScores.nonSmoker;
    smokMarket = cl(cbsa.smoking_no_cbsa || 80);
  } else {
    const sPct = (cbsa.smoking_yes_cbsa || 20) / 100;
    const nPct = (cbsa.smoking_no_cbsa || 80) / 100;
    smokRaw = nPct * smokScores.smokerVsNonSmokerPool + sPct * smokScores.smokerVsSmokerPool;
    const tot = (cbsa.smoking_yes_cbsa||0) + (cbsa.smoking_no_cbsa||0);
    smokMarket = tot > 0 ? cl(100 * (cbsa.smoking_yes_cbsa||0) / tot) : 20;
  }
  let smokBlended = 0.5 * cl(smokRaw) + 0.5 * smokMarket;

  // ── TRAIT 10: HAS KIDS ──
  const kidScores = DESIRABILITY_KIDS_SCORES[genderKey];
  const hasKidsVal = userProfile.hasKids === 'Yes';
  let kidRaw, kidMarket;
  if (!hasKidsVal) {
    kidRaw = kidScores.noKids;
    kidMarket = cl(50 + (cbsa.have_kids_no_cbsa || 61) / 2);
  } else {
    kidRaw = kidScores.hasKids;
    if (wantKidsYesCbsa > 40) kidRaw -= 8;
    else if (wantKidsYesCbsa <= 25) kidRaw += 5;
    kidRaw = cl(kidRaw);
    const hkYes = cbsa.have_kids_yes_cbsa || 39;
    kidMarket = Math.min(70, hkYes * (1 + hkYes / 200));
  }
  let kidBlended = 0.5 * cl(kidRaw) + 0.5 * cl(kidMarket);

  // ── TRAIT 11: WANT KIDS (compatibility) ──
  let wkScore;
  if (userProfile.wantKids === 'Yes') {
    wkScore = cl(Math.min(100, ((cbsa.want_kids_yes_cbsa||0) + 0.5*(cbsa.want_kids_maybe_cbsa||0)) * 1.2));
  } else if (userProfile.wantKids === 'No') {
    wkScore = cl(Math.min(100, ((cbsa.want_kids_no_cbsa||0) + 0.5*(cbsa.want_kids_maybe_cbsa||0)) * 1.2));
  } else {
    wkScore = 60;
  }

  // ── COST OF LIVING ──
  const colAmp = rpp / 100;
  const colScore = genderKey === 'man'
    ? cl(incMarket * colAmp)   // men: amplifies income market
    : cl(bodyMarket * colAmp); // women: amplifies body market

  // ── INTERACTION: Provider premium (man + wants kids + market wantKids > 38%) ──
  if (genderKey === 'man' && userProfile.wantKids === 'Yes' && wantKidsYesCbsa > 38) {
    incBlended = cl(incBlended * 1.12);
    ageBlended = cl(ageBlended * 1.08);
  }

  // ── FINAL COMPOSITE ──
  const adjPolWeight = weights.politics * polWeightMult;
  const totalW = weights.age + weights.ethnicity + weights.income + weights.education +
    weights.height + weights.body + adjPolWeight + weights.smoking +
    weights.hasKids + weights.wantKids + weights.costOfLiving;

  const wSum =
    ageBlended * weights.age +
    ethBlended * weights.ethnicity +
    incBlended * weights.income +
    eduBlended * weights.education +
    heightBlended * weights.height +
    bodyBlended * weights.body +
    polScore * adjPolWeight +
    smokBlended * weights.smoking +
    kidBlended * weights.hasKids +
    wkScore * weights.wantKids +
    colScore * weights.costOfLiving;

  let finalScore = cl(wSum / totalW);
  finalScore = Math.max(5, Math.min(99, finalScore));

  // Marriage premium
  const marriagePremium = calculateMarriagePremium(
    userProfile.income, incMarket, userProfile.relationshipStatus, rpp
  );
  finalScore = Math.min(99, finalScore * marriagePremium);

  // ── RETURN (same shape for frontend compatibility) ──
  return {
    score: Math.round(finalScore * 10) / 10,
    components: {
      income: { national: cl(incRaw), local: cl(incBlended), weight: weights.income / 100 },
      education: { national: cl(eduRaw), local: cl(eduBlended), weight: weights.education / 100 },
      age: { score: cl(ageBlended), weight: weights.age / 100 },
      ethnicity: { score: cl(ethBlended), weight: weights.ethnicity / 100 },
      children: { score: cl(kidBlended), weight: weights.hasKids / 100 }
    },
    marriagePremium,
    weights
  };
}

// ============================================================================
// MATCH POOL CALCULATION
// ============================================================================

/**
 * Get felon rate based on target gender, ethnicity, and education
 */
function getFelonRate(targetGender, ethnicity, education) {
  const genderRates = FELON_RATES[targetGender === 'Man' ? 'men' : 'women'];
  const isWhite = ethnicity === 'White';
  const baseRate = isWhite ? genderRates.white : genderRates.poc;
  const eduMultiplier = EDUCATION_FELON_MULTIPLIERS[education] || 1.0;
  return baseRate * eduMultiplier;
}

/**
 * Get drug use rate based on target gender, ethnicity, and education
 */
function getDrugRate(targetGender, ethnicity, education) {
  const genderRates = DRUG_USE_RATES[targetGender === 'Man' ? 'men' : 'women'];
  const isWhite = ethnicity === 'White';
  const baseRate = isWhite ? genderRates.white : genderRates.poc;
  const eduMultiplier = EDUCATION_DRUG_MULTIPLIERS[education] || 1.0;
  return baseRate * eduMultiplier;
}

/**
 * Calculate match probability from Relate Score using sigmoid
 */
function getMatchProbability(relateScore) {
  const { floor, ceiling, midpoint, steepness } = SIGMOID_CONFIG;
  const sigmoid = 1 / (1 + Math.exp(-steepness * (relateScore - midpoint)));
  return floor + (ceiling - floor) * sigmoid;
}

/**
 * Sum CBSA percentages for age range
 */
function getAgeRangePercentage(minAge, maxAge, cbsa) {
  let total = 0;
  for (const bracket of AGE_BRACKETS) {
    if (bracket.max >= minAge && bracket.min <= maxAge) {
      total += cbsa[bracket.key] || 0;
    }
  }
  return total / 100; // Convert to decimal
}

/**
 * Sum CBSA percentages for income at or above threshold
 */
function getIncomeAbovePercentage(minIncome, cbsa) {
  let total = 0;
  let counting = false;
  for (const bracket of INCOME_BRACKETS) {
    if (minIncome <= bracket.max) {
      counting = true;
    }
    if (counting) {
      total += cbsa[bracket.key] || 0;
    }
  }
  return total / 100; // Convert to decimal
}

/**
 * Get height filter percentage for women seeking men
 */
function getHeightAbovePercentage(minHeightStr, cbsa) {
  if (!minHeightStr || minHeightStr === 'No preference') return 1.0;
  
  const minInches = heightToInches(minHeightStr);
  if (!minInches) return 1.0;
  
  let total = 0;
  for (const bracket of HEIGHT_BRACKETS) {
    if (bracket.max >= minInches) {
      total += cbsa[bracket.key] || 0;
    }
  }
  return total / 100;
}

/**
 * Calculate full Match Pool funnel
 */
function calculateMatchPool(userProfile, preferences, cbsa) {
  const targetGender = userProfile.gender === 'Man' ? 'Woman' : 'Man';
  const seeking = userProfile.orientation === 'Gay/Lesbian' ? userProfile.gender : targetGender;
  
  // Start with total population
  let pool = cbsa.cbsa_population || 0;
  const funnel = [];
  
  funnel.push({ stage: 'Total Population', count: pool, percentage: 100 });
  
  // Stage 1: Universal exclusions (65+ and homeless)
  pool = pool * (1 - EXCLUSION_RATES.universal);
  funnel.push({ 
    stage: 'Adults 18-64 (excl. 65+ and homeless)', 
    count: Math.round(pool), 
    percentage: (1 - EXCLUSION_RATES.universal) * 100 
  });
  
  // Stage 2: Gender filter
  const genderKey = seeking === 'Woman' ? 'gender_woman_cbsa' : 'gender_man_cbsa';
  const localGenderKey = seeking === 'Woman' ? 'female_cbsa' : 'male_cbsa';
  const genderPct = (cbsa[genderKey] || 50) / 100;
  const genderLocal = (cbsa[localGenderKey] || 50) / 50;
  pool = pool * genderPct * genderLocal;
  funnel.push({ 
    stage: `${seeking === 'Woman' ? 'Women' : 'Men'} 18-64`, 
    count: Math.round(pool),
    filter: `${(genderPct * genderLocal * 100).toFixed(1)}%`
  });
  
  // Stage 3: Orientation filter
  const orientationKey = DEMOGRAPHIC_QUESTIONS.identity.orientation.cbsaKeyMap[userProfile.orientation];
  const orientationPct = (cbsa[orientationKey] || 95) / 100;
  pool = pool * orientationPct;
  funnel.push({ 
    stage: `${userProfile.orientation} ${seeking === 'Woman' ? 'Women' : 'Men'}`, 
    count: Math.round(pool),
    filter: `${(orientationPct * 100).toFixed(1)}%`
  });
  
  // Stage 4: Felon exclusion (weighted by CBSA ethnicity distribution)
  const whitePct = (cbsa.ethnicity_white_cbsa || 60) / 100;
  const pocPct = 1 - whitePct;
  const felonRate = (whitePct * getFelonRate(seeking, 'White', userProfile.education))
    + (pocPct * getFelonRate(seeking, 'POC', userProfile.education));
  pool = pool * (1 - felonRate);
  funnel.push({
    stage: 'No criminal record',
    count: Math.round(pool),
    filter: `${((1 - felonRate) * 100).toFixed(1)}%`
  });

  // Stage 5: Drug user exclusion (weighted by CBSA ethnicity distribution)
  const drugRate = (whitePct * getDrugRate(seeking, 'White', userProfile.education))
    + (pocPct * getDrugRate(seeking, 'POC', userProfile.education));
  pool = pool * (1 - drugRate);
  funnel.push({
    stage: 'No substance issues',
    count: Math.round(pool),
    filter: `${((1 - drugRate) * 100).toFixed(1)}%`
  });
  
  // Stage 6: Single filter
  const singlePct = (cbsa.relationship_single_cbsa || 30) / 100;
  const singleLocal = (cbsa.single_18_65_cbsa || 50) / 50;
  pool = pool * singlePct * singleLocal;
  const localSinglePool = pool;
  funnel.push({ 
    stage: 'LOCAL SINGLES', 
    count: Math.round(pool),
    filter: `${(singlePct * singleLocal * 100).toFixed(1)}%`,
    isMilestone: true
  });
  
  // ========== IDENTITY POOL: ETHNICITY FILTER ==========

  // Ethnicity preference filter
  if (preferences.ethnicities && !preferences.ethnicities.includes('No preference')) {
    let ethnicityPrefPct = 0;
    for (const eth of preferences.ethnicities) {
      const key = DEMOGRAPHIC_QUESTIONS.identity.ethnicity.cbsaKeyMap[eth];
      ethnicityPrefPct += (cbsa[key] || 0) / 100;
    }
    pool = pool * ethnicityPrefPct;
    funnel.push({
      stage: `Ethnicity: ${preferences.ethnicities.join(', ')}`,
      count: Math.round(pool),
      filter: `${(ethnicityPrefPct * 100).toFixed(1)}%`
    });
  }

  const identityPool = pool;
  funnel.push({
    stage: 'IDENTITY POOL',
    count: Math.round(pool),
    isMilestone: true
  });

  // ========== TIER 1: REALISTIC POOL ==========
  
  // Age range filter
  if (preferences.ageMin && preferences.ageMax) {
    const agePct = getAgeRangePercentage(preferences.ageMin, preferences.ageMax, cbsa);
    pool = pool * agePct;
    funnel.push({ 
      stage: `Age ${preferences.ageMin}-${preferences.ageMax}`, 
      count: Math.round(pool),
      filter: `${(agePct * 100).toFixed(1)}%`
    });
  }
  
  // Minimum income filter
  if (preferences.minIncome > 0) {
    const incomePct = getIncomeAbovePercentage(preferences.minIncome, cbsa);
    pool = pool * incomePct;
    funnel.push({ 
      stage: `Income \u2265 ${formatCurrency(preferences.minIncome)}`, 
      count: Math.round(pool),
      filter: `${(incomePct * 100).toFixed(1)}%`
    });
  }
  
  const realisticPool = pool;
  funnel.push({ 
    stage: 'MEET YOUR BASICS', 
    count: Math.round(pool),
    isMilestone: true
  });
  
  // ========== TIER 2: PREFERRED POOL ==========
  
  // Political filter
  if (preferences.politicalViews && !preferences.politicalViews.includes('No preference')) {
    let politicalPct = 0;
    for (const view of preferences.politicalViews) {
      const key = DEMOGRAPHIC_QUESTIONS.aboutYou.political.cbsaKeyMap[view];
      politicalPct += (cbsa[key] || 0) / 100;
    }
    pool = pool * politicalPct;
    funnel.push({ 
      stage: `Political: ${preferences.politicalViews.join(', ')}`, 
      count: Math.round(pool),
      filter: `${(politicalPct * 100).toFixed(1)}%`
    });
  }
  
  // Has kids filter
  if (preferences.partnerHasKids && preferences.partnerHasKids !== 'No preference') {
    const kidsKey = preferences.partnerHasKids === 'No' ? 'have_kids_no_cbsa' : 'have_kids_yes_cbsa';
    const kidsPct = (cbsa[kidsKey] || 50) / 100;
    pool = pool * kidsPct;
    funnel.push({
      stage: `Has kids: ${preferences.partnerHasKids}`,
      count: Math.round(pool),
      filter: `${(kidsPct * 100).toFixed(1)}%`
    });
  }

  // Wants kids filter
  if (preferences.partnerWantKids && preferences.partnerWantKids !== 'No preference') {
    const wantKey = preferences.partnerWantKids === 'Yes' ? 'want_kids_yes_cbsa'
      : preferences.partnerWantKids === 'No' ? 'want_kids_no_cbsa'
      : null;
    if (wantKey) {
      const wantPct = (cbsa[wantKey] || 50) / 100;
      pool = pool * wantPct;
      funnel.push({
        stage: `Wants kids: ${preferences.partnerWantKids}`,
        count: Math.round(pool),
        filter: `${(wantPct * 100).toFixed(1)}%`
      });
    }
  }

  // Smoking filter
  if (preferences.partnerSmoking && preferences.partnerSmoking !== 'No preference') {
    const smokingKey = preferences.partnerSmoking === 'No' ? 'smoking_no_cbsa' : 'smoking_yes_cbsa';
    const smokingPct = (cbsa[smokingKey] || 80) / 100;
    pool = pool * smokingPct;
    funnel.push({ 
      stage: `Smoking: ${preferences.partnerSmoking}`, 
      count: Math.round(pool),
      filter: `${(smokingPct * 100).toFixed(1)}%`
    });
  }

  // Education level filter
  if (preferences.educationLevels && !preferences.educationLevels.includes('No preference')) {
    let educationPct = 0;
    for (const level of preferences.educationLevels) {
      const key = DEMOGRAPHIC_QUESTIONS.aboutYou.education.cbsaKeyMap[level];
      educationPct += (cbsa[key] || 0) / 100;
    }
    pool = pool * educationPct;
    funnel.push({
      stage: `Education: ${preferences.educationLevels.join(', ')}`,
      count: Math.round(pool),
      filter: `${(educationPct * 100).toFixed(1)}%`
    });
  }

  const preferredPool = pool;
  funnel.push({ 
    stage: 'MATCH YOUR LIFESTYLE', 
    count: Math.round(pool),
    isMilestone: true
  });
  
  // ========== TIER 3: IDEAL POOL ==========
  
  // Height filter (women seeking men only)
  if (userProfile.gender === 'Woman' && preferences.minHeight && preferences.minHeight !== 'No preference') {
    const heightPct = getHeightAbovePercentage(preferences.minHeight, cbsa);
    pool = pool * heightPct;
    funnel.push({ 
      stage: `Height \u2265 ${preferences.minHeight}`, 
      count: Math.round(pool),
      filter: `${(heightPct * 100).toFixed(1)}%`
    });
  }
  
  // Body type filter
  if (preferences.bodyTypes && !preferences.bodyTypes.includes('No preference')) {
    let bodyPct = 0;
    for (const bodyType of preferences.bodyTypes) {
      const key = DEMOGRAPHIC_QUESTIONS.aboutYou.bodyType.cbsaKeyMap[bodyType];
      bodyPct += (cbsa[key] || 0) / 100;
    }
    pool = pool * bodyPct;
    funnel.push({ 
      stage: `Body type: ${preferences.bodyTypes.join(', ')}`, 
      count: Math.round(pool),
      filter: `${(bodyPct * 100).toFixed(1)}%`
    });
  }
  
  // Fitness filter
  if (preferences.fitnessLevels && !preferences.fitnessLevels.includes('No preference')) {
    let fitnessPct = 0;
    for (const level of preferences.fitnessLevels) {
      const key = DEMOGRAPHIC_QUESTIONS.aboutYou.fitness.cbsaKeyMap[level];
      fitnessPct += (cbsa[key] || 0) / 100;
    }
    pool = pool * fitnessPct;
    funnel.push({ 
      stage: `Fitness: ${preferences.fitnessLevels.join(', ')}`, 
      count: Math.round(pool),
      filter: `${(fitnessPct * 100).toFixed(1)}%`
    });
  }
  
  const idealPool = pool;
  funnel.push({
    stage: 'YOUR IDEAL MATCH POOL',
    count: Math.round(pool),
    isMilestone: true
  });

  // Context denominators for percentage display
  // 1. All target gender in area
  const totalPop = cbsa.cbsa_population || 0;
  const allGender = totalPop * (1 - EXCLUSION_RATES.universal) * genderPct * genderLocal;

  // 2. Target orientation + gender, no felons, dating age, not homeless
  const agePct = (preferences.ageMin && preferences.ageMax)
    ? getAgeRangePercentage(preferences.ageMin, preferences.ageMax, cbsa)
    : 1.0;
  const eligiblePool = allGender * orientationPct * (1 - felonRate) * agePct;

  // 3. Same as #2 but narrowed to user's ethnicity distribution
  const ethnicityKey = DEMOGRAPHIC_QUESTIONS.identity.ethnicity.cbsaKeyMap[userProfile.ethnicity];
  const ethnicityPct = ethnicityKey ? (cbsa[ethnicityKey] || 10) / 100 : 1.0;
  const eligibleEthnicityPool = eligiblePool * ethnicityPct;

  return {
    localSinglePool: Math.round(localSinglePool),
    identityPool: Math.round(identityPool),
    realisticPool: Math.round(realisticPool),
    preferredPool: Math.round(preferredPool),
    idealPool: Math.round(idealPool),
    funnel,
    contextPools: {
      allGender: Math.round(allGender),
      eligiblePool: Math.round(eligiblePool),
      eligibleEthnicityPool: Math.round(eligibleEthnicityPool),
      userEthnicity: userProfile.ethnicity,
      targetGenderLabel: seeking === 'Woman' ? 'women' : 'men',
      orientationLabel: userProfile.orientation.toLowerCase(),
    }
  };
}

// ============================================================================
// COMPLETE DEMOGRAPHIC CALCULATION
// ============================================================================

/**
 * Process all demographic inputs and return full calculation results
 */
async function processDemographics(userInputs) {
  // Find CBSA from ZIP
  const cbsaResult = await findCBSAFromZIP(userInputs.zipCode);
  if (cbsaResult.error) {
    return { error: cbsaResult.error };
  }
  
  const cbsa = cbsaResult.cbsaData;
  
  // Build user profile
  const userProfile = {
    gender: userInputs.gender,
    age: userInputs.age,
    ethnicity: userInputs.ethnicity,
    orientation: userInputs.orientation,
    income: userInputs.income,
    education: userInputs.education,
    height: userInputs.height,
    bodyType: userInputs.bodyType,
    fitness: userInputs.fitness,
    political: userInputs.political,
    smoking: userInputs.smoking,
    hasKids: userInputs.hasKids,
    wantKids: userInputs.wantKids,
    relationshipStatus: userInputs.relationshipStatus
  };
  
  // Build preferences
  const preferences = {
    ageMin: userInputs.ageMin,
    ageMax: userInputs.ageMax,
    minIncome: userInputs.minIncome,
    minHeight: userInputs.minHeight,
    bodyTypes: userInputs.bodyTypes,
    fitnessLevels: userInputs.fitnessLevels,
    politicalViews: userInputs.politicalViews,
    ethnicities: userInputs.ethnicities,
    educationLevels: userInputs.educationLevels,
    partnerHasKids: userInputs.partnerHasKids,
    partnerWantKids: userInputs.partnerWantKids,
    partnerSmoking: userInputs.partnerSmoking
  };
  
  // Calculate Relate Score
  const relateScore = calculateRelateScore(userProfile, cbsa);

  // Calculate Match Pool
  const matchPool = calculateMatchPool(userProfile, preferences, cbsa);

  // Calculate match probability
  const matchProbability = getMatchProbability(relateScore.score);

  // Calculate final match count
  const matchCount = Math.round(matchPool.idealPool * matchProbability);

  // Calculate state and national comparisons
  const stateAbbr = extractState(cbsaResult.cbsaLabel);
  let stateComparison = null;
  let nationalComparison = null;

  try {
    const [stateAgg, nationalAgg] = await Promise.all([
      stateAbbr ? getStateAggregate(stateAbbr) : Promise.resolve(null),
      getNationalAggregate(),
    ]);

    if (stateAgg) {
      const statePool = calculateMatchPool(userProfile, preferences, stateAgg);
      const stateScore = calculateRelateScore(userProfile, stateAgg);
      const stateProb = getMatchProbability(stateScore.score);
      stateComparison = {
        label: stateAbbr,
        population: stateAgg.cbsa_population,
        idealPool: statePool.idealPool,
        matchCount: Math.round(statePool.idealPool * stateProb),
        relateScore: stateScore.score,
        matchProbability: stateProb,
        funnel: statePool.funnel,
        contextPools: statePool.contextPools,
      };
    }

    if (nationalAgg) {
      const natPool = calculateMatchPool(userProfile, preferences, nationalAgg);
      const natScore = calculateRelateScore(userProfile, nationalAgg);
      const natProb = getMatchProbability(natScore.score);
      nationalComparison = {
        label: 'National',
        population: nationalAgg.cbsa_population,
        idealPool: natPool.idealPool,
        matchCount: Math.round(natPool.idealPool * natProb),
        relateScore: natScore.score,
        matchProbability: natProb,
        funnel: natPool.funnel,
        contextPools: natPool.contextPools,
      };
    }
  } catch (e) {
    // Non-critical — metro data is still valid
    console.error('Failed to compute state/national comparisons:', e);
  }

  return {
    location: {
      cbsa: cbsaResult.cbsa,
      cbsaName: cbsaResult.cbsaName,
      cbsaLabel: cbsaResult.cbsaLabel,
      population: cbsaResult.population,
      distanceFromZip: cbsaResult.distance
    },
    userProfile,
    preferences,
    relateScore: {
      score: relateScore.score,
      components: relateScore.components,
      marriagePremium: relateScore.marriagePremium
    },
    matchPool: {
      localSinglePool: matchPool.localSinglePool,
      identityPool: matchPool.identityPool,
      realisticPool: matchPool.realisticPool,
      preferredPool: matchPool.preferredPool,
      idealPool: matchPool.idealPool,
      funnel: matchPool.funnel,
      contextPools: matchPool.contextPools,
    },
    matchProbability: {
      rate: matchProbability,
      percentage: (matchProbability * 100).toFixed(1) + '%'
    },
    matchCount,
    stateComparison,
    nationalComparison,
    // Ready for persona/modifier integration
    demographicsForAssessment: {
      gender: userProfile.gender,
      age: userProfile.age,
      relationshipStatus: userProfile.relationshipStatus,
      wantKids: userProfile.wantKids,
      // These feed into modifier calculations
      fitness: userProfile.fitness,
      smoking: userProfile.smoking,
      bodyType: userProfile.bodyType,
      income: userProfile.income,
      education: userProfile.education,
      height: userProfile.height,
      political: userProfile.political,
      hasKids: userProfile.hasKids,
      // CBSA keys for modifier effects
      cbsaData: cbsa
    }
  };
}

// ============================================================================
// METRO COMPARISON
// ============================================================================

/**
 * Compare user profile against multiple metros
 */
async function compareMetros(userProfile, preferences, cbsaCodes) {
  const cbsas = await loadCBSAData();
  const results = [];
  
  for (const code of cbsaCodes) {
    const cbsa = Object.values(cbsas).find(c => c.cbsa === code || c.cbsa === String(code));
    if (!cbsa) continue;
    
    const relateScore = calculateRelateScore(userProfile, cbsa);
    const matchPool = calculateMatchPool(userProfile, preferences, cbsa);
    const matchProbability = getMatchProbability(relateScore.score);
    const matchCount = Math.round(matchPool.idealPool * matchProbability);
    
    results.push({
      cbsa: cbsa.cbsa,
      cbsaName: cbsa.cbsa_name || cbsa.cbsa_label,
      cbsaLabel: cbsa.cbsa_label,
      population: cbsa.cbsa_population,
      relateScore: relateScore.score,
      idealPool: matchPool.idealPool,
      matchProbability: matchProbability,
      matchCount,
      rpp: cbsa.rpp // Cost of living
    });
  }
  
  // Sort by match count descending
  results.sort((a, b) => b.matchCount - a.matchCount);
  
  return results;
}

// ============================================================================
// QUESTION HELPERS
// ============================================================================

/**
 * Get questions for a specific section
 */
function getQuestionsForSection(section, userGender = null) {
  const questions = [];
  
  for (const [category, categoryQuestions] of Object.entries(DEMOGRAPHIC_QUESTIONS)) {
    for (const [key, question] of Object.entries(categoryQuestions)) {
      if (question.section === section) {
        // Check gender-specific questions
        if (question.genderSpecific && question.genderSpecific !== userGender) {
          continue;
        }
        questions.push({ key, ...question });
      }
    }
  }
  
  return questions;
}

/**
 * Get all questions in order
 */
function getAllQuestions(userGender = null, relationshipStatus = 'Single') {
  const sections = ['location', 'identity', 'aboutYou'];
  
  // Only show partner preferences for singles
  if (relationshipStatus === 'Single' || relationshipStatus === 'Separated') {
    sections.push('partnerPrefs', 'relocation');
  }
  
  const allQuestions = [];
  for (const section of sections) {
    allQuestions.push(...getQuestionsForSection(section, userGender));
  }
  
  return allQuestions;
}

/**
 * Validate a single answer
 */
function validateAnswer(questionKey, answer) {
  const question = findQuestionByKey(questionKey);
  if (!question) return { valid: false, error: 'Question not found' };
  
  if (question.required && (answer === null || answer === undefined || answer === '')) {
    return { valid: false, error: 'This question is required' };
  }
  
  if (question.validation && !question.validation.test(String(answer))) {
    return { valid: false, error: 'Invalid format' };
  }
  
  if (question.type === 'number') {
    const num = Number(answer);
    if (question.min !== undefined && num < question.min) {
      return { valid: false, error: `Minimum value is ${question.min}` };
    }
    if (question.max !== undefined && num > question.max) {
      return { valid: false, error: `Maximum value is ${question.max}` };
    }
  }
  
  if (question.type === 'dropdown' && question.options) {
    if (!question.options.includes(answer)) {
      return { valid: false, error: 'Invalid option' };
    }
  }
  
  return { valid: true };
}

/**
 * Find question by key
 */
function findQuestionByKey(key) {
  for (const category of Object.values(DEMOGRAPHIC_QUESTIONS)) {
    for (const [qKey, question] of Object.entries(category)) {
      if (qKey === key || question.id === key) {
        return question;
      }
    }
  }
  return null;
}

/**
 * Find top 20 metro areas for this user, ranked by:
 * 1. Largest ideal match pool
 * 2. Highest match likelihood (tie-breaker)
 * 3. Income + education percentile (tie-breaker)
 */
async function findTopMetros(userProfile, preferences, homeScore) {
  const cbsas = await loadCBSAData();
  const allCBSAs = Object.values(cbsas).filter(c => c.cbsa_population > 0);
  const all = [];

  for (const cbsa of allCBSAs) {
    const relateScore = calculateRelateScore(userProfile, cbsa);

    const matchPool = calculateMatchPool(userProfile, preferences, cbsa);
    const matchProbability = getMatchProbability(relateScore.score);
    const matchCount = Math.round(matchPool.idealPool * matchProbability);

    // Income + education composite for tie-breaking
    const incomeLocal = relateScore.components.income.local;
    const eduLocal = relateScore.components.education.local;
    const incomeEduRank = (incomeLocal + eduLocal) / 2;

    all.push({
      cbsa: cbsa.cbsa,
      cbsaName: cbsa.cbsa_name || cbsa.cbsa_label,
      cbsaLabel: cbsa.cbsa_label,
      population: cbsa.cbsa_population,
      relateScore: relateScore.score,
      components: relateScore.components,
      idealPool: matchPool.idealPool,
      localSinglePool: matchPool.localSinglePool,
      matchProbability,
      matchCount,
      incomeEduRank,
      rpp: cbsa.rpp,
    });
  }

  // Sort: 1) idealPool desc, 2) matchProbability desc, 3) incomeEduRank desc
  all.sort((a, b) => {
    if (b.idealPool !== a.idealPool) return b.idealPool - a.idealPool;
    if (b.matchProbability !== a.matchProbability) return b.matchProbability - a.matchProbability;
    return b.incomeEduRank - a.incomeEduRank;
  });

  // Adaptive minScore: start at 75, lower by 5 until we get 20 metros
  // with idealPool > 0 (visible on the scatter plot)
  const TARGET = 20;
  let minScore = 75;
  let filtered;
  while (minScore > 0) {
    filtered = all.filter(m => m.relateScore >= minScore && m.idealPool > 0);
    if (filtered.length >= TARGET) break;
    minScore -= 5;
  }
  // If still under 20, take whatever we have (sorted by idealPool desc)
  if (!filtered || filtered.length < TARGET) {
    filtered = all.filter(m => m.idealPool > 0);
    minScore = 0;
  }

  const topMetros = filtered.slice(0, TARGET);
  // effectiveMinScore: the lowest relateScore actually present in the top 20
  const effectiveMinScore = topMetros.length > 0
    ? Math.floor(Math.min(...topMetros.map(m => m.relateScore)))
    : minScore;

  // allCompetitive uses the same adaptive threshold for consistent ranking
  const allCompetitive = filtered;

  return { topMetros, totalCompetitive: allCompetitive.length, allCompetitive, effectiveMinScore };
}

/**
 * Find the 10 worst large metro areas for this user.
 * Only considers metros with population > 750,000.
 * Sorted ascending by idealPool (worst first = #1).
 */
async function findWorstMetros(userProfile, preferences) {
  const cbsas = await loadCBSAData();
  const largeCBSAs = Object.values(cbsas).filter(c => c.cbsa_population >= 750000);
  const results = [];

  for (const cbsa of largeCBSAs) {
    const relateScore = calculateRelateScore(userProfile, cbsa);
    const matchPool = calculateMatchPool(userProfile, preferences, cbsa);
    const matchProbability = getMatchProbability(relateScore.score);
    const matchCount = Math.round(matchPool.idealPool * matchProbability);

    const incomeLocal = relateScore.components.income.local;
    const eduLocal = relateScore.components.education.local;
    const incomeEduRank = (incomeLocal + eduLocal) / 2;

    results.push({
      cbsa: cbsa.cbsa,
      cbsaName: cbsa.cbsa_name || cbsa.cbsa_label,
      cbsaLabel: cbsa.cbsa_label,
      population: cbsa.cbsa_population,
      relateScore: relateScore.score,
      components: relateScore.components,
      idealPool: matchPool.idealPool,
      localSinglePool: matchPool.localSinglePool,
      matchProbability,
      matchCount,
      incomeEduRank,
      rpp: cbsa.rpp,
    });
  }

  // Sort ascending: worst idealPool first, then lowest matchProbability, then lowest incomeEduRank
  results.sort((a, b) => {
    if (a.idealPool !== b.idealPool) return a.idealPool - b.idealPool;
    if (a.matchProbability !== b.matchProbability) return a.matchProbability - b.matchProbability;
    return a.incomeEduRank - b.incomeEduRank;
  });

  return results.slice(0, 10);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Data URLs
  DATA_URLS,
  
  // Questions
  DEMOGRAPHIC_QUESTIONS,
  getQuestionsForSection,
  getAllQuestions,
  validateAnswer,
  findQuestionByKey,
  
  // Constants
  EXCLUSION_RATES,
  FELON_RATES,
  DRUG_USE_RATES,
  EDUCATION_FELON_MULTIPLIERS,
  EDUCATION_DRUG_MULTIPLIERS,
  RELATE_SCORE_WEIGHTS,
  SIGMOID_CONFIG,
  INCOME_BRACKETS,
  AGE_BRACKETS,
  HEIGHT_BRACKETS,
  AGE_SCORE_CURVES,
  
  // Data loading
  initializeData,
  loadCBSAData,
  loadZIPData,
  
  // CBSA lookup
  findCBSAFromZIP,
  getCBSAByCode,
  haversineDistance,
  getStateAggregate,
  getNationalAggregate,
  buildWeightedAggregate,
  extractState,
  
  // Calculations
  calculateRelateScore,
  calculateMatchPool,
  getMatchProbability,
  getIncomePercentileNational,
  applyLocalAdjustment,
  getEducationPercentile,
  getAgeScore,
  getEthnicityScore,
  getChildrenScore,
  getFelonRate,
  getDrugRate,
  getAgeRangePercentage,
  getIncomeAbovePercentage,
  getHeightAbovePercentage,
  
  // Main processing
  processDemographics,
  compareMetros,
  findTopMetros,
  findWorstMetros,
  
  // Utilities
  heightToInches,
  formatCurrency
};
