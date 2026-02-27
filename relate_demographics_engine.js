/**
 * Relate Demographics Engine
 * Version: 1.0
 * 
 * Handles all demographic data collection, CBSA lookup, Relate Score calculation,
 * and Match Pool funnel calculations.
 * 
 * Data Sources:
 * - CBSA Data: https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/cbsa-data.js
 * - ZIP Data: https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/zip-lat-lng.json
 */

// ============================================================================
// DATA SOURCE URLS
// ============================================================================

const DATA_URLS = {
  cbsa: 'https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/cbsa-data.js',
  zip: 'https://raw.githubusercontent.com/fromnineteen80/salaryarc/main/zip-lat-lng.json'
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

// Relate Score weights by gender
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
 * Load CBSA data from remote source
 */
async function loadCBSAData() {
  if (cbsaData) return cbsaData;
  
  try {
    const response = await fetch(DATA_URLS.cbsa);
    const text = await response.text();
    // The file is a JS file, so we need to extract the data
    // Assuming it exports an array or object
    const match = text.match(/(?:module\.exports\s*=\s*|export\s+default\s+|const\s+\w+\s*=\s*)(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      cbsaData = JSON.parse(match[1].replace(/'/g, '"'));
    } else {
      // Try eval as fallback (only in controlled environment)
      cbsaData = eval('(' + text.replace(/module\.exports\s*=\s*/, '').replace(/export\s+default\s+/, '') + ')');
    }
    return cbsaData;
  } catch (error) {
    console.error('Failed to load CBSA data:', error);
    throw error;
  }
}

/**
 * Load ZIP code data from remote source
 */
async function loadZIPData() {
  if (zipData) return zipData;
  
  try {
    const response = await fetch(DATA_URLS.zip);
    zipData = await response.json();
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
  
  for (const cbsa of cbsas) {
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
  return cbsas.find(c => c.cbsa === cbsaCode || c.cbsa === String(cbsaCode));
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
 * localScore = 50 + (nationalPercentile - 50) Ã— (50 / localWeight)
 */
function applyLocalAdjustment(nationalPercentile, localWeight) {
  if (!localWeight || localWeight === 0) return nationalPercentile;
  return 50 + (nationalPercentile - 50) * (50 / localWeight);
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
 * Calculate full Relate Score
 */
function calculateRelateScore(userProfile, cbsa) {
  const gender = userProfile.gender;
  const weights = RELATE_SCORE_WEIGHTS[gender === 'Man' ? 'male' : 'female'];
  
  // Income score (locally adjusted)
  const incomeNational = getIncomePercentileNational(userProfile.income, cbsa);
  const incomeLocal = applyLocalAdjustment(incomeNational, cbsa.income_cbsa);
  
  // Education score (locally adjusted)
  const eduNational = getEducationPercentile(userProfile.education, cbsa);
  const eduLocal = applyLocalAdjustment(eduNational, cbsa.bachelors_cbsa);
  
  // Age score
  const ageScore = getAgeScore(userProfile.age, gender);
  
  // Ethnicity score
  const ethnicityScore = getEthnicityScore(userProfile.ethnicity, cbsa);
  
  // Children score
  const childrenScore = getChildrenScore(userProfile.hasKids, userProfile.age, gender);
  
  // Base score (weighted sum)
  let baseScore = 
    (incomeLocal * weights.income) +
    (eduLocal * weights.education) +
    (ageScore * weights.age) +
    (ethnicityScore * weights.ethnicity) +
    (childrenScore * weights.children);
  
  // Marriage premium
  const marriagePremium = calculateMarriagePremium(
    userProfile.income,
    incomeLocal,
    userProfile.relationshipStatus,
    cbsa.rpp
  );
  
  // Final score
  const finalScore = Math.min(100, baseScore * marriagePremium);
  
  return {
    score: Math.round(finalScore * 10) / 10,
    components: {
      income: { national: incomeNational, local: incomeLocal, weight: weights.income },
      education: { national: eduNational, local: eduLocal, weight: weights.education },
      age: { score: ageScore, weight: weights.age },
      ethnicity: { score: ethnicityScore, weight: weights.ethnicity },
      children: { score: childrenScore, weight: weights.children }
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
  
  // Stage 4: Felon exclusion (stratified)
  const felonRate = getFelonRate(seeking, 'White', userProfile.education); // Simplified
  pool = pool * (1 - felonRate);
  funnel.push({ 
    stage: 'Non-felon', 
    count: Math.round(pool),
    filter: `${((1 - felonRate) * 100).toFixed(1)}%`
  });
  
  // Stage 5: Drug user exclusion (stratified)
  const drugRate = getDrugRate(seeking, 'White', userProfile.education); // Simplified
  pool = pool * (1 - drugRate);
  funnel.push({ 
    stage: 'Non-drug user', 
    count: Math.round(pool),
    filter: `${((1 - drugRate) * 100).toFixed(1)}%`
  });
  
  // Stage 6: Single filter
  const singlePct = (cbsa.relationship_single_cbsa || 30) / 100;
  const singleLocal = (cbsa.single_18_65_cbsa || 50) / 50;
  pool = pool * singlePct * singleLocal;
  const localSinglePool = pool;
  funnel.push({ 
    stage: 'LOCAL SINGLE POOL', 
    count: Math.round(pool),
    filter: `${(singlePct * singleLocal * 100).toFixed(1)}%`,
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
      stage: `Income â‰¥ ${formatCurrency(preferences.minIncome)}`, 
      count: Math.round(pool),
      filter: `${(incomePct * 100).toFixed(1)}%`
    });
  }
  
  const realisticPool = pool;
  funnel.push({ 
    stage: 'REALISTIC POOL', 
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
  
  const preferredPool = pool;
  funnel.push({ 
    stage: 'PREFERRED POOL', 
    count: Math.round(pool),
    isMilestone: true
  });
  
  // ========== TIER 3: IDEAL POOL ==========
  
  // Height filter (women seeking men only)
  if (userProfile.gender === 'Woman' && preferences.minHeight && preferences.minHeight !== 'No preference') {
    const heightPct = getHeightAbovePercentage(preferences.minHeight, cbsa);
    pool = pool * heightPct;
    funnel.push({ 
      stage: `Height â‰¥ ${preferences.minHeight}`, 
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
    stage: 'IDEAL POOL', 
    count: Math.round(pool),
    isMilestone: true
  });
  
  return {
    localSinglePool: Math.round(localSinglePool),
    realisticPool: Math.round(realisticPool),
    preferredPool: Math.round(preferredPool),
    idealPool: Math.round(idealPool),
    funnel
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
    partnerHasKids: userInputs.partnerHasKids,
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
      realisticPool: matchPool.realisticPool,
      preferredPool: matchPool.preferredPool,
      idealPool: matchPool.idealPool,
      funnel: matchPool.funnel
    },
    matchProbability: {
      rate: matchProbability,
      percentage: (matchProbability * 100).toFixed(1) + '%'
    },
    matchCount,
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
    const cbsa = cbsas.find(c => c.cbsa === code || c.cbsa === String(code));
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
  
  // Utilities
  heightToInches,
  formatCurrency
};
