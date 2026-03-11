/**
 * ============================================================================
 * DESIRABILITY SCORING ATTACHMENT — IMPLEMENTATION SPEC
 * ============================================================================
 *
 * Scoring: Raw Score (0–100) + Market Score (0–100) → Final = 50/50 blend
 * Market Score = individual's percentile rank among same-gender singles in CBSA
 *
 * FINAL SCORE FORMULA:
 *   raw_score(trait) = curve_lookup(individual_trait_value)
 *   market_score(trait) = percentile_rank(individual_trait_value, CBSA_distribution)
 *   trait_score = (0.5 × raw_score) + (0.5 × market_score)
 *   final_composite = Σ (trait_score × trait_weight) / Σ trait_weights
 *
 * INTERPOLATION RULE (applies to ALL raw score ranges):
 *   Every range [low, high] is resolved to a single value via linear
 *   interpolation within the bracket. Position in bracket =
 *   (value - bracket_min) / (bracket_max - bracket_min).
 *   Score = range_low + position × (range_high - range_low).
 *   At bracket boundaries, use the low end of the range.
 *   This eliminates all ambiguity from ranges like "45–58".
 *
 * USER PROFILE FIELDS (from schema.sql):
 *   gender: 'M' | 'W'  (mapped to 'Man' | 'Woman' in engine)
 *   age: integer (18–100)
 *   ethnicity: string (enum: White, Hispanic/Latino, Black, Asian, Native American, Pacific Islander, Other)
 *   income: integer (annual dollars)
 *   education: string (enum: Less than High School, High School Graduate, Trade/Vocational, Associate Degree, Some College, Bachelor's Degree, Graduate Degree)
 *   height: string (format: 5'10") — MEN ONLY
 *   body_type: string (enum: Lean or Fit, Average, Overweight, Obese)
 *   fitness_level: string (enum: Never, 1 day a week, 2 to 3 days a week, 4 to 6 days a week, Every day)
 *   political: string (enum: Conservative, Moderate, Liberal, Apolitical)
 *   smoking: boolean
 *   has_kids: boolean
 *   want_kids: string (enum: Yes, No, Maybe)
 *   orientation: string — used for pool filtering only, not scored
 *   seeking: string — not scored in v1
 *
 * SCOPE LIMITATIONS (v1):
 *   - Heterosexual pairings only (Man seeking Woman, Woman seeking Man)
 *   - Height scored for men only (women do not report height)
 *   - Has kids is binary (no child count or child age data)
 *   - Drugs data exists but is intentionally excluded from desirability scoring
 *
 * ============================================================================
 */


// ============================================================================
// TRAIT WEIGHTS (sum to 100 for each gender)
// ============================================================================

const DESIRABILITY_WEIGHTS = {
  // Weights when scoring a MAN as target (women evaluating men)
  man: {
    age: 9,
    ethnicity: 11,
    income: 15,
    education: 9,
    height: 11,
    body: 10,
    politics: 9,
    smoking: 5,
    hasKids: 9,
    wantKids: 5,
    costOfLiving: 7
  },
  // Weights when scoring a WOMAN as target (men evaluating women)
  woman: {
    age: 17,
    ethnicity: 11,
    income: 5,
    education: 8,
    height: 0,       // not scored — women don't report height
    body: 20,
    politics: 9,
    smoking: 5,
    hasKids: 10,
    wantKids: 5,
    costOfLiving: 10
  }
};


// ============================================================================
// COST OF LIVING AMPLIFIER (the "residual" weight)
// ============================================================================
//
// costOfLiving is NOT a standalone score. It is an amplifier applied to the
// most gender-salient trait's market score. It uses RPP to steepen competition.
//
// For MEN as targets: amplifies the income trait's market score.
//   Higher RPP = money buys less = income competition is fiercer.
//   A $100K earner in San Jose (RPP ~130) faces stiffer competition than
//   the same earner in Birmingham (RPP ~86).
//
// For WOMEN as targets: amplifies the body trait's market score.
//   Higher RPP markets correlate with lower obesity rates, better fitness
//   infrastructure, and higher appearance competition.
//
// Implementation:
//   col_amplifier = rpp / 100  (1.0 = national average, >1 = expensive)
//
//   For men:   cost_of_living_score = income_market_score × col_amplifier
//   For women: cost_of_living_score = body_market_score × col_amplifier
//
//   Clamp result to [0, 100].
//   This score is then weighted at 7 (men) or 10 (women) in the final blend.

const COST_OF_LIVING_AMPLIFIER = {
  man: {
    sourceTraitMarketScore: 'income',  // uses income market_score as input
    formula: (incomeMarketScore, rpp) => Math.min(100, incomeMarketScore * (rpp / 100))
  },
  woman: {
    sourceTraitMarketScore: 'body',    // uses body market_score as input
    formula: (bodyMarketScore, rpp) => Math.min(100, bodyMarketScore * (rpp / 100))
  }
};


// ============================================================================
// TRAIT 1: AGE
// ============================================================================
// Curve Type: Peaked, asymmetric
// Men peak 34–42 (slow decline). Women peak 22–28 (steep post-30 decline).
//
// CBSA Fields: age_18_19_cbsa, age_20_24_cbsa, age_25_29_cbsa, age_30_34_cbsa,
//   age_35_39_cbsa, age_40_44_cbsa, age_45_49_cbsa, age_50_54_cbsa,
//   age_55_59_cbsa, age_60_64_cbsa
//
// Market Score: percentile rank of target's age bracket within the
//   opposite-gender single pool in CBSA.
//   Denominator = single_18_65_cbsa × gender_{opposite}_cbsa / 100
//   Sum all age brackets OLDER than target's bracket → that cumulative %
//   represents how many competitors the target is "younger than."
//   For men: being younger than most = advantage (women prefer 34–42).
//   For women: being younger than most = strong advantage.
//
// Key Modifier: If CBSA has high want_kids_yes_cbsa (>40%), amplify age
//   sensitivity by 1.15× on the raw score (reproductive timing pressure).
//   If want_kids_yes_cbsa <= 30%, dampen by 0.90×.

const AGE_RAW_CURVES = {
  // Men as targets (women evaluating)
  man: [
    { min: 18, max: 24, scoreLow: 55, scoreHigh: 65 },
    { min: 25, max: 30, scoreLow: 70, scoreHigh: 80 },
    { min: 31, max: 33, scoreLow: 80, scoreHigh: 90 },  // ramp to peak
    { min: 34, max: 42, scoreLow: 90, scoreHigh: 100 },  // PEAK
    { min: 43, max: 50, scoreLow: 75, scoreHigh: 85 },
    { min: 51, max: 60, scoreLow: 55, scoreHigh: 70 },
    { min: 61, max: 100, scoreLow: 30, scoreHigh: 50 }
  ],
  // Women as targets (men evaluating)
  woman: [
    { min: 18, max: 21, scoreLow: 60, scoreHigh: 70 },
    { min: 22, max: 28, scoreLow: 90, scoreHigh: 100 },  // PEAK
    { min: 29, max: 32, scoreLow: 80, scoreHigh: 90 },
    { min: 33, max: 38, scoreLow: 65, scoreHigh: 78 },
    { min: 39, max: 45, scoreLow: 48, scoreHigh: 62 },
    { min: 46, max: 55, scoreLow: 28, scoreHigh: 45 },
    { min: 56, max: 100, scoreLow: 15, scoreHigh: 28 }
  ]
};

const AGE_MODIFIERS = {
  // want_kids amplification thresholds
  wantKidsHighThreshold: 40,   // want_kids_yes_cbsa > 40%
  wantKidsLowThreshold: 30,    // want_kids_yes_cbsa <= 30%
  wantKidsHighMultiplier: 1.15, // amplify raw score
  wantKidsLowMultiplier: 0.90,  // dampen raw score
  // Women-specific: high concentration of peak-age women compresses scores
  // If age_25_45_cbsa (sum of age_25_29 + age_30_34 + age_35_39 + age_40_44)
  // exceeds 40% of single female pool, compress women's raw scores toward 65.
  womanCompressionThreshold: 40, // % of single women in 25–44 range
  womanCompressionTarget: 65,    // score compresses toward this value
  womanCompressionStrength: 0.25 // blend 25% toward compression target
};

// Age market score brackets (maps to CBSA age fields for percentile calc)
const AGE_MARKET_BRACKETS = [
  { min: 18, max: 19, key: 'age_18_19_cbsa' },
  { min: 20, max: 24, key: 'age_20_24_cbsa' },
  { min: 25, max: 29, key: 'age_25_29_cbsa' },
  { min: 30, max: 34, key: 'age_30_34_cbsa' },
  { min: 35, max: 39, key: 'age_35_39_cbsa' },
  { min: 40, max: 44, key: 'age_40_44_cbsa' },
  { min: 45, max: 49, key: 'age_45_49_cbsa' },
  { min: 50, max: 54, key: 'age_50_54_cbsa' },
  { min: 55, max: 59, key: 'age_55_59_cbsa' },
  { min: 60, max: 64, key: 'age_60_64_cbsa' }
];


// ============================================================================
// TRAIT 2: ETHNICITY
// ============================================================================
// Curve Type: Compatibility matrix — NOT a linear ranking.
// Homophilous base with cross-group hierarchy layered on top.
//
// CBSA Fields: ethnicity_white_cbsa, ethnicity_hispanic_cbsa,
//   ethnicity_black_cbsa, ethnicity_asian_cbsa, ethnicity_native_cbsa,
//   ethnicity_pacific_cbsa, ethnicity_other_cbsa
//
// Raw Score: Cross-group preference matrix. Each cell = base appeal score
//   of target ethnicity TO the evaluating group. Own-race cells are elevated.
//   Score = weighted average across all opposite-gender ethnic groups in CBSA,
//   using CBSA ethnic distribution as weights.
//
// Market Score: proportion of opposite-gender singles in CBSA who share
//   target's ethnicity (own-race preference pool) + cross-group appeal bonus.
//   market_score = (own_race_pct × own_race_weight) + (cross_appeal × cross_weight)
//
// Scoring Note: Weight this at LOWER confidence than other traits.
//   Flag scores as "compatibility index" not "desirability rank."
//
// Research basis: OKCupid (2009-2014), HurryDate (Fisman et al. 2008),
//   Facebook AYI (Are You Interested, 2013), Bruch & Newman 2018.

const ETHNICITY_PREFERENCE_MATRIX = {
  // Rows = evaluator ethnicity, Columns = target ethnicity
  // Values = base appeal score (0–100) of target TO that evaluator group
  // These represent REVEALED preference from behavioral data, not stated preference.

  // Women evaluating MEN (men as targets)
  womenEvaluating: {
    'White':          { 'White': 88, 'Hispanic/Latino': 58, 'Black': 48, 'Asian': 42, 'Native American': 40, 'Pacific Islander': 45, 'Other': 50 },
    'Hispanic/Latino':{ 'White': 72, 'Hispanic/Latino': 80, 'Black': 52, 'Asian': 44, 'Native American': 45, 'Pacific Islander': 48, 'Other': 50 },
    'Black':          { 'White': 60, 'Hispanic/Latino': 48, 'Black': 82, 'Asian': 38, 'Native American': 40, 'Pacific Islander': 42, 'Other': 45 },
    'Asian':          { 'White': 74, 'Hispanic/Latino': 50, 'Black': 40, 'Asian': 78, 'Native American': 38, 'Pacific Islander': 52, 'Other': 48 },
    'Native American':{ 'White': 68, 'Hispanic/Latino': 55, 'Black': 48, 'Asian': 42, 'Native American': 75, 'Pacific Islander': 45, 'Other': 50 },
    'Pacific Islander':{ 'White': 65, 'Hispanic/Latino': 55, 'Black': 48, 'Asian': 58, 'Native American': 45, 'Pacific Islander': 78, 'Other': 50 },
    'Other':          { 'White': 70, 'Hispanic/Latino': 55, 'Black': 50, 'Asian': 48, 'Native American': 45, 'Pacific Islander': 48, 'Other': 65 }
  },

  // Men evaluating WOMEN (women as targets)
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

// Ethnicity CBSA field mapping
const ETHNICITY_CBSA_KEYS = {
  'White': 'ethnicity_white_cbsa',
  'Hispanic/Latino': 'ethnicity_hispanic_cbsa',
  'Black': 'ethnicity_black_cbsa',
  'Asian': 'ethnicity_asian_cbsa',
  'Native American': 'ethnicity_native_cbsa',
  'Pacific Islander': 'ethnicity_pacific_cbsa',
  'Other': 'ethnicity_other_cbsa'
};

/**
 * Ethnicity raw score calculation:
 *
 * 1. Get the CBSA ethnic distribution of opposite-gender singles.
 * 2. For each evaluator ethnic group, look up their preference score
 *    for the target's ethnicity from the matrix.
 * 3. Weight each preference score by that group's share of the
 *    opposite-gender single pool.
 * 4. Sum = weighted average appeal across all evaluator groups.
 *
 * Example: A Black man in Birmingham where single women are
 *   40% White, 35% Black, 15% Hispanic, 10% Asian:
 *   raw = (0.40 × 48) + (0.35 × 82) + (0.15 × 52) + (0.10 × 40) = 59.7
 *
 * Same Black man in Atlanta where single women are
 *   30% White, 50% Black, 10% Hispanic, 10% Asian:
 *   raw = (0.30 × 48) + (0.50 × 82) + (0.10 × 52) + (0.10 × 40) = 69.6
 */


// ============================================================================
// TRAIT 3: INCOME
// ============================================================================
// Men: Monotonic increasing, log-scale compression above $150K.
// Women: Weak positive, plateaus at median.
//
// CBSA Fields: income_under_35k_cbsa, income_35k_50k_cbsa, income_50k_75k_cbsa,
//   income_75k_100k_cbsa, income_100k_150k_cbsa, income_150k_200k_cbsa,
//   income_200k_300k_cbsa, income_300k_500k_cbsa, income_500k_750k_cbsa,
//   income_750k_plus_cbsa
//   Baseline index: income_cbsa (0–100 percentile scale)
//
// Market Score: cumulative percentile of target's income bracket within
//   the CBSA same-gender single income distribution.
//   Use existing getIncomePercentileNational() logic with bracket interpolation.
//
// RPP Adjustment: Before raw score lookup, adjust income for purchasing power.
//   adjusted_income = income × (100 / rpp)
//   Score the adjusted figure, not nominal.
//   Example: $100K at RPP 115 → $86,957 effective → score that value.

const INCOME_RAW_CURVES = {
  // Men as targets (women evaluating) — monotonic increasing
  man: [
    { max: 35000,   key: 'income_under_35k_cbsa',  scoreLow: 15, scoreHigh: 25 },
    { max: 50000,   key: 'income_35k_50k_cbsa',    scoreLow: 30, scoreHigh: 42 },
    { max: 75000,   key: 'income_50k_75k_cbsa',    scoreLow: 45, scoreHigh: 58 },
    { max: 100000,  key: 'income_75k_100k_cbsa',   scoreLow: 60, scoreHigh: 72 },
    { max: 150000,  key: 'income_100k_150k_cbsa',  scoreLow: 74, scoreHigh: 83 },
    { max: 200000,  key: 'income_150k_200k_cbsa',  scoreLow: 84, scoreHigh: 90 },
    { max: 300000,  key: 'income_200k_300k_cbsa',  scoreLow: 90, scoreHigh: 95 },
    { max: 500000,  key: 'income_300k_500k_cbsa',  scoreLow: 95, scoreHigh: 98 },
    { max: 750000,  key: 'income_500k_750k_cbsa',  scoreLow: 98, scoreHigh: 99 },
    { max: Infinity, key: 'income_750k_plus_cbsa',  scoreLow: 99, scoreHigh: 100 }
  ],
  // Women as targets (men evaluating) — weak positive, plateaus
  woman: [
    { max: 35000,   key: 'income_under_35k_cbsa',  scoreLow: 40, scoreHigh: 50 },
    { max: 75000,   keys: ['income_35k_50k_cbsa', 'income_50k_75k_cbsa'],
                                                    scoreLow: 55, scoreHigh: 65 },
    { max: 150000,  keys: ['income_75k_100k_cbsa', 'income_100k_150k_cbsa'],
                                                    scoreLow: 65, scoreHigh: 72 },
    { max: Infinity, keys: ['income_150k_200k_cbsa', 'income_200k_300k_cbsa',
                            'income_300k_500k_cbsa', 'income_500k_750k_cbsa',
                            'income_750k_plus_cbsa'],
                                                    scoreLow: 72, scoreHigh: 78 }
  ]
};

// For women's market score: weight at 0.4× relative to men's market signal.
// Implementation: market_score_woman_income = raw_market_percentile × 0.4
const INCOME_MARKET_WEIGHT_WOMAN = 0.4;


// ============================================================================
// TRAIT 4: EDUCATION
// ============================================================================
// Men: Monotonic increasing. More education always adds desirability.
// Women: Peaked at bachelor's. Graduate degree carries slight penalty vs BA.
//   (Bruch/Newman 2018)
//
// CBSA Fields: education_less_hs_cbsa, education_hs_grad_cbsa,
//   education_trade_cbsa, education_associate_cbsa, education_some_college_cbsa,
//   education_bachelors_cbsa, education_graduate_cbsa
//   Baseline: bachelors_cbsa (% with BA or higher in market)
//
// Market Score: percentile rank of target's education tier within the
//   CBSA same-gender education distribution. Cumulative sum of all brackets
//   up to and including target's tier.

const EDUCATION_RAW_SCORES = {
  // Men as targets — monotonic increasing
  man: {
    'Less than High School': { scoreLow: 15, scoreHigh: 25 },
    'High School Graduate':  { scoreLow: 30, scoreHigh: 42 },
    'Trade/Vocational':      { scoreLow: 38, scoreHigh: 48 },
    'Associate Degree':      { scoreLow: 45, scoreHigh: 55 },
    'Some College':          { scoreLow: 50, scoreHigh: 60 },
    'Bachelor\'s Degree':    { scoreLow: 70, scoreHigh: 82 },
    'Graduate Degree':       { scoreLow: 85, scoreHigh: 100 }
  },
  // Women as targets — peaked at bachelor's, graduate penalty
  woman: {
    'Less than High School': { scoreLow: 30, scoreHigh: 40 },
    'High School Graduate':  { scoreLow: 42, scoreHigh: 52 },
    'Trade/Vocational':      { scoreLow: 45, scoreHigh: 55 },
    'Associate Degree':      { scoreLow: 52, scoreHigh: 62 },
    'Some College':          { scoreLow: 60, scoreHigh: 70 },
    'Bachelor\'s Degree':    { scoreLow: 85, scoreHigh: 100 },  // PEAK
    'Graduate Degree':       { scoreLow: 72, scoreHigh: 82 }    // discount vs BA
  }
};

// Education CBSA field order (for cumulative percentile calculation)
const EDUCATION_BRACKETS = [
  { level: 'Less than High School', key: 'education_less_hs_cbsa' },
  { level: 'High School Graduate',  key: 'education_hs_grad_cbsa' },
  { level: 'Trade/Vocational',      key: 'education_trade_cbsa' },
  { level: 'Associate Degree',      key: 'education_associate_cbsa' },
  { level: 'Some College',          key: 'education_some_college_cbsa' },
  { level: 'Bachelor\'s Degree',    key: 'education_bachelors_cbsa' },
  { level: 'Graduate Degree',       key: 'education_graduate_cbsa' }
];

const EDUCATION_MODIFIERS = {
  // Graduate degree penalty for women compresses in high-education markets.
  // If bachelors_cbsa + education_graduate_cbsa combined > 40% of local pool,
  // the graduate penalty shrinks: blend 30% toward the bachelor's score.
  graduatePenaltyCompressionThreshold: 40,  // combined BA + grad %
  graduatePenaltyCompressionBlend: 0.30     // 30% blend toward BA score
};


// ============================================================================
// TRAIT 5: HEIGHT (MEN ONLY)
// ============================================================================
// Floor-effect curve. Steep penalty below average; plateau above 5'11".
// No meaningful additional premium above 6'2".
// Women do NOT report height — this trait weight is 0 for women.
//
// CBSA Fields: height_under_60_cbsa, height_60_62_cbsa, height_63_65_cbsa,
//   height_66_68_cbsa, height_69_71_cbsa, height_72plus_cbsa
//
// Market Score: percentile rank of target's height bracket within the
//   CBSA male height distribution.
//
// Note: Height distributions vary little by CBSA in our data. The raw score
//   curve carries most weight here. Market signal is secondary.

const HEIGHT_RAW_SCORES_MAN = {
  'height_under_60':  { scoreLow: 10, scoreHigh: 20 },  // under 5'0"
  'height_60_62':     { scoreLow: 20, scoreHigh: 35 },  // 5'0"–5'2"
  'height_63_65':     { scoreLow: 40, scoreHigh: 55 },  // 5'3"–5'5"
  'height_66_68':     { scoreLow: 62, scoreHigh: 75 },  // 5'6"–5'8"
  'height_69_71':     { scoreLow: 83, scoreHigh: 93 },  // 5'9"–5'11"
  'height_72plus':    { scoreLow: 88, scoreHigh: 100 }   // 6'0"+ (plateau)
};

// Height bracket lookup (inches → bracket key)
const HEIGHT_INCH_BRACKETS = [
  { maxInches: 59,       bracketKey: 'height_under_60',  cbsaKey: 'height_under_60_cbsa' },
  { maxInches: 62,       bracketKey: 'height_60_62',     cbsaKey: 'height_60_62_cbsa' },
  { maxInches: 65,       bracketKey: 'height_63_65',     cbsaKey: 'height_63_65_cbsa' },
  { maxInches: 68,       bracketKey: 'height_66_68',     cbsaKey: 'height_66_68_cbsa' },
  { maxInches: 71,       bracketKey: 'height_69_71',     cbsaKey: 'height_69_71_cbsa' },
  { maxInches: Infinity, bracketKey: 'height_72plus',    cbsaKey: 'height_72plus_cbsa' }
];

/**
 * Height interpolation within bracket:
 *   Each bracket spans 3 inches (e.g., 63–65).
 *   Position = (inches - bracket_min) / (bracket_max - bracket_min)
 *   Score = scoreLow + position × (scoreHigh - scoreLow)
 *
 *   Example: 5'7" = 67 inches, bracket 66–68
 *   Position = (67 - 66) / (68 - 66) = 0.5
 *   Score = 62 + 0.5 × (75 - 62) = 68.5
 */


// ============================================================================
// TRAIT 6: BMI / BODY TYPE + TRAIT 7: FITNESS (scored as one unit: "body")
// ============================================================================
// BMI and fitness are NOT scored independently. They combine into a single
// "body" score:  body_score = bmi_raw_score + fitness_modifier
//
// BMI Curve:
//   Men: Peaked at slightly above normal ("Overweight" = 25–29.9 BMI preferred)
//   Women: Steeply declining above normal. Strongest market signal after age.
//
// Fitness Modifier: Applied on top of BMI raw score.
//   Never: -5 / 1 day: +0 / 2-3 days: +3 / 4-6 days: +7 / Every day: +8
//
// CBSA Fields (BMI): bmi_elite_cbsa, bmi_normal_cbsa, bmi_overweight_cbsa,
//   bmi_obesity_cbsa, obesity_cbsa
// CBSA Fields (Fitness): fitness_never_cbsa, fitness_1_day_cbsa,
//   fitness_2_3_days_cbsa, fitness_4_6_days_cbsa, fitness_daily_cbsa,
//   activity_cbsa
//
// User profile mapping:
//   body_type → BMI bracket:
//     'Lean or Fit' → bmi_elite
//     'Average'     → bmi_normal
//     'Overweight'  → bmi_overweight
//     'Obese'       → bmi_obesity
//
// Market Score: Calculate combined body percentile.
//   1. Find target's BMI category percentile in CBSA BMI distribution.
//   2. Adjust by fitness percentile in CBSA fitness distribution.
//   3. Combined market score = BMI percentile + (fitness_rank_bonus × 0.3)
//      where fitness_rank_bonus = target's fitness percentile - 50.
//      Clamp to [0, 100].
//
// obesity_cbsa is the PRIMARY market compression lever for body scores.
// In high-obesity CBSAs, normal-BMI individuals score dramatically higher
// on market score because they're in a smaller top-tier pool.

const BMI_RAW_SCORES = {
  // Men as targets — fit and slightly-above-normal both score at peak
  man: {
    'Lean or Fit': 95,   // bmi_elite: peak tier — fitness is never penalized
    'Average':     87,   // bmi_normal: strong
    'Overweight':  80,   // bmi_overweight: moderate — behavioral data shows tolerance, not preference
    'Obese':       45    // bmi_obesity: steep drop
  },
  // Women as targets — fit and normal both score at peak
  woman: {
    'Lean or Fit': 96,   // bmi_elite: peak tier — fitness is never penalized
    'Average':     90,   // bmi_normal: strong
    'Overweight':  60,   // bmi_overweight: significant drop
    'Obese':       30    // bmi_obesity: near-floor
  }
};

const FITNESS_MODIFIERS = {
  'Never':               -5,
  '1 day a week':         0,
  '2 to 3 days a week':  +3,
  '4 to 6 days a week':  +7,
  'Every day':           +8   // slight plateau — perceived time-cost at extreme
};

// BMI CBSA field mapping
const BMI_CBSA_KEYS = {
  'Lean or Fit': 'bmi_elite_cbsa',
  'Average':     'bmi_normal_cbsa',
  'Overweight':  'bmi_overweight_cbsa',
  'Obese':       'bmi_obesity_cbsa'
};

// Fitness CBSA field mapping (ordered for cumulative percentile)
const FITNESS_CBSA_BRACKETS = [
  { level: 'Never',               key: 'fitness_never_cbsa' },
  { level: '1 day a week',        key: 'fitness_1_day_cbsa' },
  { level: '2 to 3 days a week',  key: 'fitness_2_3_days_cbsa' },
  { level: '4 to 6 days a week',  key: 'fitness_4_6_days_cbsa' },
  { level: 'Every day',           key: 'fitness_daily_cbsa' }
];

// BMI category order (for cumulative percentile: lower categories = less desirable)
// Fit is ALWAYS top tier — fitness is never penalized.
// For men: obese(worst) → overweight → normal → elite(best)
const BMI_PERCENTILE_ORDER_MAN = [
  { bodyType: 'Obese',       key: 'bmi_obesity_cbsa' },
  { bodyType: 'Overweight',  key: 'bmi_overweight_cbsa' },
  { bodyType: 'Average',     key: 'bmi_normal_cbsa' },
  { bodyType: 'Lean or Fit', key: 'bmi_elite_cbsa' }
];

// For women: obese(worst) → overweight → normal → elite(best)
const BMI_PERCENTILE_ORDER_WOMAN = [
  { bodyType: 'Obese',       key: 'bmi_obesity_cbsa' },
  { bodyType: 'Overweight',  key: 'bmi_overweight_cbsa' },
  { bodyType: 'Average',     key: 'bmi_normal_cbsa' },
  { bodyType: 'Lean or Fit', key: 'bmi_elite_cbsa' }
];

/**
 * Body score calculation:
 *   1. bmi_raw = BMI_RAW_SCORES[gender][body_type]
 *   2. fitness_mod = FITNESS_MODIFIERS[fitness_level]
 *   3. body_raw = clamp(bmi_raw + fitness_mod, 0, 100)
 *   4. bmi_market = cumulative percentile of body_type in CBSA using
 *      BMI_PERCENTILE_ORDER (gender-specific ordering)
 *   5. fitness_market = cumulative percentile of fitness_level in CBSA
 *   6. body_market = clamp(bmi_market + (fitness_market - 50) × 0.3, 0, 100)
 *   7. body_score = (0.5 × body_raw) + (0.5 × body_market)
 *
 * High-obesity CBSA amplification:
 *   If obesity_cbsa > 35, the market score naturally elevates for
 *   non-obese individuals because the cumulative % below them is large.
 *   No additional modifier needed — the percentile math handles it.
 *
 * activity_cbsa interaction:
 *   In high-activity markets (activity_cbsa > 75), fitness differentiation
 *   is weaker (everyone is active). Reduce fitness_mod effect by 0.7×.
 *   In low-activity markets (activity_cbsa < 65), fitness differentiation
 *   is stronger. Amplify fitness_mod effect by 1.3×.
 */

const BODY_ACTIVITY_MODIFIERS = {
  highActivityThreshold: 75,
  highActivityFitnessScale: 0.7,   // dampen fitness modifier
  lowActivityThreshold: 65,
  lowActivityFitnessScale: 1.3     // amplify fitness modifier
};


// ============================================================================
// TRAIT 8: POLITICS
// ============================================================================
// Compatibility index — NOT a ranking of political positions.
// Score = alignment between target's politics and CBSA political distribution.
//
// CBSA Fields: political_conservative_cbsa, political_moderate_cbsa,
//   political_liberal_cbsa, political_apolitical_cbsa
//
// This variable is ALMOST ENTIRELY a market signal.

const POLITICS_COMPATIBILITY = {
  // Alignment rules:
  // Conservative aligns with: Conservative (full), Moderate (partial)
  // Liberal aligns with: Liberal (full), Moderate (partial)
  // Moderate aligns with: all (partial)
  // Apolitical aligns with: all (weak)

  alignmentWeights: {
    'Conservative': {
      'political_conservative_cbsa': 1.0,   // full alignment
      'political_moderate_cbsa':     0.55,   // partial — moderates tolerate conservatives
      'political_liberal_cbsa':      0.05,   // near-zero cross-alignment
      'political_apolitical_cbsa':   0.30    // apoliticals are partially compatible
    },
    'Liberal': {
      'political_conservative_cbsa': 0.05,   // near-zero
      'political_moderate_cbsa':     0.55,   // partial
      'political_liberal_cbsa':      1.0,    // full alignment
      'political_apolitical_cbsa':   0.30
    },
    'Moderate': {
      'political_conservative_cbsa': 0.60,
      'political_moderate_cbsa':     1.0,
      'political_liberal_cbsa':      0.60,
      'political_apolitical_cbsa':   0.50
    },
    'Apolitical': {
      'political_conservative_cbsa': 0.40,
      'political_moderate_cbsa':     0.50,
      'political_liberal_cbsa':      0.40,
      'political_apolitical_cbsa':   0.70
    }
  }
};

/**
 * Politics raw score calculation:
 *   1. Get target's political identity.
 *   2. For each CBSA political field, multiply the field's % by the
 *      alignment weight for that combination.
 *   3. Sum all weighted percentages.
 *   4. raw_score = sum (already on 0–100 scale since CBSA fields sum to ~100)
 *
 * Example: Conservative man in market where
 *   conservative=35%, moderate=50%, liberal=25%, apolitical=10%
 *   (Note: these don't sum to 100 — they represent self-identification overlap)
 *   raw = (35×1.0) + (50×0.55) + (25×0.05) + (10×0.30) = 35 + 27.5 + 1.25 + 3 = 66.75
 *
 * Market score = raw_score (politics IS the market signal; no separate calc needed).
 * For this trait: trait_score = raw_score (not blended 50/50).
 *
 * Homogeneity amplifier:
 *   If |political_conservative_cbsa - political_liberal_cbsa| > 20,
 *   market is polarized → weight political score at 1.5× in final blend.
 *   If political_moderate_cbsa > 50, market is centrist → weight at 0.7×.
 */

const POLITICS_MODIFIERS = {
  polarizationThreshold: 20,       // |conservative - liberal| > 20
  polarizationMultiplier: 1.5,     // amplify trait weight
  centristThreshold: 50,           // moderate_cbsa > 50%
  centristMultiplier: 0.7          // dampen trait weight
};


// ============================================================================
// TRAIT 9: SMOKING
// ============================================================================
// Binary threshold with homophilous subgroup.
// Near-dealbreaker for non-smokers evaluating smokers.
//
// CBSA Fields: smoking_yes_cbsa, smoking_no_cbsa
//
// Market Score: smoking_yes_cbsa defines the size of the smoker-compatible
//   pool. High smoking prevalence = lower relative penalty for smokers.

const SMOKING_RAW_SCORES = {
  // Men as targets
  man: {
    nonSmoker: 92,    // midpoint of 85–100 range; baseline
    smokerVsNonSmokerPool: 35,   // midpoint of 28–42
    smokerVsSmokerPool: 75       // midpoint of 68–82
  },
  // Women as targets (slightly steeper penalty)
  woman: {
    nonSmoker: 92,
    smokerVsNonSmokerPool: 30,   // midpoint of 22–38
    smokerVsSmokerPool: 68       // midpoint of 62–75
  }
};

/**
 * Smoking score calculation:
 *   1. If target is non-smoker: raw_score = nonSmoker value. Done.
 *   2. If target is smoker:
 *      a. smoker_pool_pct = smoking_yes_cbsa / 100
 *      b. nonsmoker_pool_pct = smoking_no_cbsa / 100
 *      c. weighted_raw = (nonsmoker_pool_pct × smokerVsNonSmokerPool)
 *                      + (smoker_pool_pct × smokerVsSmokerPool)
 *      This produces a single score that accounts for what % of the
 *      searcher pool will penalize the smoker vs. tolerate them.
 *
 * Market score for smokers:
 *   market_score = 100 × (smoking_yes_cbsa / (smoking_yes_cbsa + smoking_no_cbsa))
 *   In high-smoking markets, this is higher; in low-smoking markets, lower.
 *   For non-smokers, market_score = 100 × (smoking_no_cbsa / 100) → always high.
 *
 * Eligibility filter behavior:
 *   When a SEARCHER is a confirmed non-smoker (pref_smoking = 'No'),
 *   smoker targets receive a FLOOR score of 30 regardless of other traits.
 *   This is applied in the match pool funnel, not in desirability scoring.
 *   In desirability scoring we score the target in aggregate.
 */


// ============================================================================
// TRAIT 10: HAS KIDS (binary)
// ============================================================================
// Step-function. Binary: has kids vs. no kids.
// (Child count and child age data not available in v1.)
//
// CBSA Fields: have_kids_yes_cbsa, have_kids_no_cbsa
// Supporting: want_kids_yes_cbsa (interaction modifier)

const HAS_KIDS_RAW_SCORES = {
  // Men as targets
  man: {
    noKids: 92,       // midpoint of 85–100
    hasKids: 52       // midpoint of binary has-kids penalty (collapsed from count-based)
  },
  // Women as targets (steeper penalty)
  woman: {
    noKids: 92,
    hasKids: 39       // steeper floor than men (collapsed from count-based)
  }
};

/**
 * Has Kids market score:
 *   market_score = percentile position based on CBSA single-parent prevalence.
 *
 *   If target has NO kids:
 *     market_score = 50 + (have_kids_no_cbsa / 2)
 *     In a market where 61% have no kids, no-kids market score = 80.5
 *     (Being childless is common = moderate advantage)
 *
 *   If target HAS kids:
 *     market_score = have_kids_yes_cbsa
 *     In a market where 39% have kids, market score = 39.
 *     Higher prevalence → higher market score (normalization effect).
 *     Formula: market_score = have_kids_yes_cbsa × (1 + (have_kids_yes_cbsa / 200))
 *     This gives a slight boost in high-prevalence markets.
 *     Capped at 70.
 *
 * want_kids interaction:
 *   If want_kids_yes_cbsa > 40 AND target has kids:
 *     Apply -8 penalty to raw score (existing kids conflicts with
 *     desire to start fresh).
 *   If want_kids_yes_cbsa <= 25 AND target has kids:
 *     Apply +5 bonus to raw score (less pressure to be childless).
 */

const HAS_KIDS_MODIFIERS = {
  wantKidsHighThreshold: 40,
  wantKidsHighPenalty: -8,       // applied to raw score when target has kids
  wantKidsLowThreshold: 25,
  wantKidsLowBonus: 5,          // applied to raw score when target has kids
  marketScoreCap: 70             // max market score for has-kids targets
};


// ============================================================================
// TRAIT 11: WANTS KIDS (compatibility modifier)
// ============================================================================
// NOT a standalone desirability score. Functions as a modifier on overall
// composite score based on alignment between target and market.
//
// CBSA Fields: want_kids_yes_cbsa, want_kids_no_cbsa, want_kids_maybe_cbsa
//
// Implementation: Applied as a post-composite modifier, not as a scored trait.
// The weight of 5 (in DESIRABILITY_WEIGHTS) is allocated to this modifier.
//
// want_kids_maybe_cbsa is treated as 50% compatible with BOTH yes and no.

const WANT_KIDS_COMPATIBILITY = {
  // Target wants kids + market wants kids = aligned → bonus
  // Target wants kids + market doesn't = misaligned → penalty
  // Target doesn't + market does = misaligned → penalty
  // Target doesn't + market doesn't = aligned → bonus
  // Target maybe = neutral (small bonus to both)

  scoring: {
    // Score is derived from how well target's want-kids status aligns
    // with the CBSA single pool's want-kids distribution.

    'Yes': (cbsa) => {
      // Aligned pool = want_kids_yes + (0.5 × want_kids_maybe)
      const alignedPct = (cbsa.want_kids_yes_cbsa || 0) +
                         0.5 * (cbsa.want_kids_maybe_cbsa || 0);
      return Math.min(100, alignedPct * 1.2); // slight amplification
    },
    'No': (cbsa) => {
      const alignedPct = (cbsa.want_kids_no_cbsa || 0) +
                         0.5 * (cbsa.want_kids_maybe_cbsa || 0);
      return Math.min(100, alignedPct * 1.2);
    },
    'Maybe': (cbsa) => {
      // Maybe is partially compatible with everyone
      // Score = moderate baseline that doesn't penalize or reward strongly
      return 60; // flat — maybe is neutral
    }
  },

  // Interaction effects (applied to OTHER trait scores, not want_kids itself):
  interactions: {
    // In high want_kids_yes markets, a man who wants kids AND earns above
    // median gets a compounding premium on his income and age scores.
    // This is the "provider premium" — family-oriented women weight
    // income and age more heavily.
    providerPremium: {
      wantKidsThreshold: 38,      // want_kids_yes_cbsa > 38%
      incomeAmplifier: 1.12,      // multiply man's income trait_score by 1.12
      ageAmplifier: 1.08,         // multiply man's age trait_score by 1.08
      appliesTo: 'man',           // only when scoring men as targets
      requiresTargetWantsKids: true // target must also want kids
    }
  }
};


// ============================================================================
// PERCENTILE CALCULATION (shared utility)
// ============================================================================

/**
 * Calculate cumulative percentile rank within a CBSA bracket distribution.
 *
 * @param {string} targetBracketKey - The CBSA key for the target's bracket
 * @param {Array} bracketOrder - Ordered array of {key} objects from worst to best
 * @param {Object} cbsa - CBSA data object
 * @returns {number} Percentile rank (0–100)
 *
 * Logic: Sum all bracket %s for brackets BELOW the target's bracket.
 * Add half of the target's own bracket (midpoint assumption).
 * Result = cumulative % = percentile rank.
 */
function calculatePercentileRank(targetBracketKey, bracketOrder, cbsa) {
  let cumulative = 0;
  for (const bracket of bracketOrder) {
    if (bracket.key === targetBracketKey) {
      // Add half of own bracket (midpoint)
      cumulative += (cbsa[bracket.key] || 0) / 2;
      break;
    }
    cumulative += cbsa[bracket.key] || 0;
  }
  return Math.min(100, cumulative);
}


// ============================================================================
// RAW SCORE INTERPOLATION (shared utility)
// ============================================================================

/**
 * Interpolate a raw score within a bracket range.
 *
 * @param {number} value - The individual's actual value (e.g., age 37, income 85000)
 * @param {number} bracketMin - Lower bound of the bracket
 * @param {number} bracketMax - Upper bound of the bracket
 * @param {number} scoreLow - Score at the bracket minimum
 * @param {number} scoreHigh - Score at the bracket maximum
 * @returns {number} Interpolated score
 */
function interpolateRawScore(value, bracketMin, bracketMax, scoreLow, scoreHigh) {
  if (bracketMax === bracketMin) return scoreLow;
  if (bracketMax === Infinity) return scoreLow; // can't interpolate infinity brackets
  const position = Math.max(0, Math.min(1, (value - bracketMin) / (bracketMax - bracketMin)));
  return scoreLow + position * (scoreHigh - scoreLow);
}


// ============================================================================
// MASTER SCORING FUNCTION (pseudocode reference)
// ============================================================================

/**
 * calculateDesirabilityScore(userProfile, cbsa)
 *
 * Input: userProfile = { gender, age, ethnicity, income, education, height,
 *          body_type, fitness_level, political, smoking, has_kids, want_kids }
 *        cbsa = full CBSA data object with all _cbsa fields
 *
 * Output: {
 *   finalScore: number (0–100),
 *   traitScores: { [trait]: { raw, market, blended, weight } },
 *   modifiers: { wantKids, providerPremium, politicsWeight, activityScale },
 *   metadata: { cbsaLabel, rpp, obesity_cbsa, activity_cbsa }
 * }
 *
 * Steps:
 *
 * 1. DETERMINE GENDER CONTEXT
 *    targetGender = userProfile.gender ('Man' or 'Woman')
 *    weights = DESIRABILITY_WEIGHTS[targetGender === 'Man' ? 'man' : 'woman']
 *
 * 2. RPP-ADJUST INCOME
 *    adjustedIncome = userProfile.income × (100 / (cbsa.rpp || 100))
 *
 * 3. CALCULATE EACH TRAIT:
 *
 *    For each trait in [age, ethnicity, income, education, height, body,
 *    politics, smoking, hasKids, wantKids]:
 *
 *    a. raw_score = lookup from trait's raw curve/table using user's value
 *       Apply interpolation within bracket ranges.
 *       Apply trait-specific modifiers (want_kids amplification on age, etc.)
 *       Clamp to [0, 100].
 *
 *    b. market_score = percentile rank in CBSA distribution
 *       Use calculatePercentileRank() with appropriate bracket order.
 *       Apply trait-specific market adjustments.
 *       Clamp to [0, 100].
 *
 *    c. trait_score = (0.5 × raw_score) + (0.5 × market_score)
 *       Exception: politics trait_score = raw_score (it IS the market signal)
 *       Exception: wantKids uses its own compatibility function
 *
 * 4. APPLY INTERACTION EFFECTS:
 *    - Provider premium: if target is man + wants kids + market want_kids > 38%,
 *      amplify income and age trait scores.
 *    - Politics weight modulation: polarized markets → 1.5×, centrist → 0.7×
 *    - Activity scaling: high-activity CBSA dampens fitness modifier,
 *      low-activity amplifies it.
 *    - Education graduate penalty compression in high-education markets.
 *    - Age compression for women in high peak-age-concentration markets.
 *
 * 5. CALCULATE COST OF LIVING SCORE:
 *    For men: col_score = income_market_score × (rpp / 100)
 *    For women: col_score = body_market_score × (rpp / 100)
 *    This uses the costOfLiving weight slot.
 *
 * 6. COMPUTE FINAL COMPOSITE:
 *    Adjust politics weight by polarization/centrist multiplier.
 *    final = Σ(trait_score × adjusted_weight) / Σ(adjusted_weights)
 *    Clamp to [0, 100].
 *
 * 7. RETURN full breakdown for transparency.
 */


// ============================================================================
// EDGE CASES & GUARDRAILS
// ============================================================================

const GUARDRAILS = {
  // Minimum score floor — no individual should score absolute zero
  globalFloor: 5,

  // Maximum score ceiling — reserve 100 for theoretical perfect
  globalCeiling: 99,

  // Missing data handling: if a user profile field is null/undefined,
  // assign the trait a neutral score of 50 and reduce its weight by 50%.
  missingDataScore: 50,
  missingDataWeightMultiplier: 0.5,

  // Income safety floors (from existing engine — preserve these)
  incomeSafetyFloors: {
    500000: 95,   // $500K+ should never show below 95th percentile
    200000: 85,
    100000: 60
  },

  // Smoker eligibility floor when matched against non-smoker pool
  smokerFloorVsNonSmokers: 30,

  // Has-kids market score cap
  hasKidsMarketCap: 70
};


// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DESIRABILITY_WEIGHTS,
    COST_OF_LIVING_AMPLIFIER,
    AGE_RAW_CURVES,
    AGE_MODIFIERS,
    AGE_MARKET_BRACKETS,
    ETHNICITY_PREFERENCE_MATRIX,
    ETHNICITY_CBSA_KEYS,
    INCOME_RAW_CURVES,
    INCOME_MARKET_WEIGHT_WOMAN,
    EDUCATION_RAW_SCORES,
    EDUCATION_BRACKETS,
    EDUCATION_MODIFIERS,
    HEIGHT_RAW_SCORES_MAN,
    HEIGHT_INCH_BRACKETS,
    BMI_RAW_SCORES,
    FITNESS_MODIFIERS,
    BMI_CBSA_KEYS,
    FITNESS_CBSA_BRACKETS,
    BMI_PERCENTILE_ORDER_MAN,
    BMI_PERCENTILE_ORDER_WOMAN,
    BODY_ACTIVITY_MODIFIERS,
    POLITICS_COMPATIBILITY,
    POLITICS_MODIFIERS,
    SMOKING_RAW_SCORES,
    HAS_KIDS_RAW_SCORES,
    HAS_KIDS_MODIFIERS,
    WANT_KIDS_COMPATIBILITY,
    GUARDRAILS,
    calculatePercentileRank,
    interpolateRawScore
  };
}
