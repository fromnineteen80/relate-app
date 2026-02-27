/**
 * RELATE Assessment - Frameworks (v2 - Rebuilt with Verified Interfaces)
 * 
 * This file contains derived constructs computed from module outputs.
 * All computations use verified interface contracts from actual module scoring.
 * 
 * CRITICAL: This file does NOT duplicate definitions that exist in modules.
 * - Drivers are canonical in M4 (EMOTIONAL_DRIVERS)
 * - Gottman is canonical in M4 (GOTTMAN_HORSEMEN, SCORING_CONFIG)
 * - Poles are canonical in compatibility_engine
 * 
 * This file COMPUTES:
 * - Parallels (shared poles between partners)
 * - Strengths (complementary poles that create value)
 * - Six Tension Stacks (derived cross-module insights)
 * 
 * Committee: Esther Perel, BrenÃ© Brown, John Gottman, Helen Fisher,
 *            Isabel Briggs Myers, Patti Stanger, Hinge/Raya Engineer
 */

// =============================================================================
// INTERFACE CONTRACTS
// =============================================================================
// These document the EXACT structure of inputs this file expects.
// If module outputs change, update these contracts and all dependent code.

/**
 * @typedef {Object} M1Results - Output from scoreModule1()
 * @property {string} gender - 'M' or 'W'
 * @property {string} code - 4-letter code like 'ACEG'
 * @property {Object} dimensions
 * @property {DimensionScore} dimensions.physical
 * @property {DimensionScore} dimensions.social
 * @property {DimensionScore} dimensions.lifestyle
 * @property {DimensionScore} dimensions.values
 * @property {KeyDriver} keyDriver
 * @property {string[]} flags
 * 
 * @typedef {Object} DimensionScore
 * @property {number} poleAScore - 0-100
 * @property {number} poleBScore - 0-100
 * @property {string} direction - 'A' or 'B'
 * @property {number} strength - 0-100 (distance from center)
 * @property {string} flexibility - 'high' | 'moderate' | 'low'
 * @property {string} assignedPole - Pole name like 'Beauty', 'Thrill'
 * 
 * @typedef {Object} KeyDriver
 * @property {string} dimension - 'physical' | 'social' | 'lifestyle' | 'values'
 * @property {string} pole - Pole name
 * @property {number} strength - 0-100
 */

/**
 * @typedef {Object} M2Results - Output from scoreModule2()
 * @property {string} gender - 'M' or 'W'
 * @property {string} code - 4-letter code like 'BDFH'
 * @property {Object} dimensions
 * @property {M2DimensionScore} dimensions.physical
 * @property {M2DimensionScore} dimensions.social
 * @property {M2DimensionScore} dimensions.lifestyle
 * @property {M2DimensionScore} dimensions.values
 * @property {KeyDriver} keyDriver
 * @property {SelfPerceptionGap} overallSelfPerceptionGap
 * @property {Object[]} flags
 * 
 * @typedef {Object} M2DimensionScore
 * @property {number} poleAScore - 0-100
 * @property {number} poleBScore - 0-100
 * @property {string} assignedPole - 'A' or 'B'
 * @property {string} poleName - Name like 'Fitness', 'Leadership'
 * @property {number} strength - 0-100
 * @property {Object} selfPerceptionGap
 * @property {number} selfPerceptionGap.value - Gap magnitude
 * @property {string} selfPerceptionGap.directSays - What direct questions indicate
 * @property {string} selfPerceptionGap.behavioralSays - What behavioral questions indicate
 * @property {boolean} selfPerceptionGap.perceptionMismatch
 * @property {string} selfPerceptionGap.interpretation - 'aligned' | 'moderate_gap' | 'significant_gap'
 * 
 * @typedef {Object} SelfPerceptionGap
 * @property {number} average - Average gap across dimensions
 * @property {string} interpretation - 'aligned' | 'moderate' | 'significant'
 * @property {string[]} mismatchedDimensions - Dimensions with gaps
 */

/**
 * @typedef {Object} M3Results - Output from scoreModule3()
 * @property {Object} rawScores
 * @property {number} rawScores.want
 * @property {number} rawScores.offer
 * @property {number} wantScore - 0-100 normalized
 * @property {number} offerScore - 0-100 normalized
 * @property {number} contextSwitchingType - 1, 2, 3, or 4
 * @property {string} typeName - Full type name
 * @property {string} typeDescription - Type description
 * @property {number} wantOfferGap - Absolute difference
 * @property {number} wantStrength - Distance from threshold
 * @property {number} offerStrength - Distance from threshold
 * @property {Object} typeDetails
 * @property {string[]} typeDetails.strengths
 * @property {string[]} typeDetails.challenges
 * @property {number[]} typeDetails.compatibleWith
 * @property {number[]} typeDetails.tensionWith
 */

/**
 * @typedef {Object} M4Results - Output from scoreModule4()
 * @property {ConflictApproach} conflictApproach
 * @property {EmotionalDrivers} emotionalDrivers
 * @property {RepairRecovery} repairRecovery
 * @property {EmotionalCapacity} emotionalCapacity
 * @property {GottmanScreener} gottmanScreener
 * @property {M4Summary} summary
 * 
 * @typedef {Object} ConflictApproach
 * @property {number} score - 0-100 (100 = pure pursue)
 * @property {string} approach - 'pursue' | 'withdraw'
 * @property {number} intensity - 0-50 (distance from center)
 * @property {number} pursueRaw - Raw pursue score
 * @property {number} withdrawRaw - Raw withdraw score
 * 
 * @typedef {Object} EmotionalDrivers
 * @property {Object} scores - {abandonment, engulfment, inadequacy, injustice} each 0-100
 * @property {Object} rawScores - Raw scores before normalization
 * @property {string} primary - Primary driver name
 * @property {number} primaryScore - 0-100
 * @property {string} secondary - Secondary driver name
 * @property {number} secondaryScore - 0-100
 * 
 * @typedef {Object} RepairRecovery
 * @property {Object} speed - {score: 0-100, style: 'quick'|'slow', intensity: 0-50}
 * @property {Object} mode - {score: 0-100, style: 'verbal'|'physical', intensity: 0-50}
 * 
 * @typedef {Object} EmotionalCapacity
 * @property {number} score - 0-100
 * @property {string} level - 'high' | 'medium' | 'low'
 * @property {number} rawHigh
 * @property {number} rawLow
 * 
 * @typedef {Object} GottmanScreener
 * @property {Object} horsemen - {criticism, contempt, defensiveness, stonewalling}
 * @property {string} primary - Primary horseman
 * @property {number} primaryScore - Raw score 4-20
 * @property {string} overallRisk - 'low' | 'medium' | 'high'
 * @property {string} coachingPriority - 'maintenance' | 'recommended' | 'immediate'
 * 
 * @typedef {Object} M4Summary
 * @property {string} approach
 * @property {string} primaryDriver
 * @property {string} repairSpeed
 * @property {string} repairMode
 * @property {string} capacity
 * @property {string} gottmanRisk
 */

/**
 * @typedef {Object} DemographicsResults - Output from processDemographics()
 * @property {Object} location
 * @property {Object} userProfile
 * @property {string} userProfile.gender
 * @property {number} userProfile.age
 * @property {string} userProfile.income
 * @property {string} userProfile.education
 * @property {string} userProfile.fitness
 * @property {Object} preferences
 * @property {Object} relateScore
 * @property {number} relateScore.score - 0-100
 * @property {Object} relateScore.components
 * @property {Object} matchPool
 * @property {number} matchPool.idealPool
 * @property {Object} matchProbability
 * @property {number} matchCount
 * @property {Object} demographicsForAssessment
 */

// =============================================================================
// HELPER: SAFE ACCESS FUNCTIONS
// =============================================================================
// These ensure we don't crash on missing data and provide sensible defaults

/**
 * Safely extracts a value from nested object path
 * @param {Object} obj - Object to extract from
 * @param {string} path - Dot-notation path like 'dimensions.lifestyle.direction'
 * @param {*} defaultValue - Default if path not found
 * @returns {*} Value at path or default
 */
function safeGet(obj, path, defaultValue = null) {
  if (!obj) return defaultValue;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  return current;
}

/**
 * Validates that required fields exist in module results
 * @param {Object} results - Module results object
 * @param {string[]} requiredPaths - Array of dot-notation paths
 * @returns {Object} {valid: boolean, missing: string[]}
 */
function validateModuleResults(results, requiredPaths) {
  const missing = [];
  for (const path of requiredPaths) {
    if (safeGet(results, path) === null) {
      missing.push(path);
    }
  }
  return { valid: missing.length === 0, missing };
}

// =============================================================================
// POLE DEFINITIONS (Reference - Canonical is in compatibility_engine)
// =============================================================================
// These are duplicated here ONLY for reference in computations.
// The source of truth remains relate_compatibility_engine.js

const POLES = {
  // M1: What he wants in her
  menWant: {
    physical: { A: 'Beauty', B: 'Confidence' },
    social: { A: 'Allure', B: 'Charm' },
    lifestyle: { A: 'Thrill', B: 'Peace' },
    values: { A: 'Traditional', B: 'Egalitarian' }
  },
  // W1: What she wants in him
  womenWant: {
    physical: { A: 'Fitness', B: 'Maturity' },
    social: { A: 'Leadership', B: 'Presence' },
    lifestyle: { A: 'Thrill', B: 'Peace' },
    values: { A: 'Traditional', B: 'Egalitarian' }
  },
  // M2: What he offers
  menOffer: {
    physical: { A: 'Fitness', B: 'Maturity' },
    social: { A: 'Leadership', B: 'Presence' },
    lifestyle: { A: 'Thrill', B: 'Peace' },
    values: { A: 'Traditional', B: 'Egalitarian' }
  },
  // W2: What she offers
  womenOffer: {
    physical: { A: 'Beauty', B: 'Confidence' },
    social: { A: 'Allure', B: 'Charm' },
    lifestyle: { A: 'Thrill', B: 'Peace' },
    values: { A: 'Traditional', B: 'Egalitarian' }
  }
};

/**
 * Gets pole name from code position
 * @param {string} gender - 'M' or 'W'
 * @param {string} moduleType - 'want' or 'offer'
 * @param {string} dimension - 'physical', 'social', 'lifestyle', 'values'
 * @param {string} pole - 'A' or 'B' (or letter from code)
 * @returns {string} Pole name
 */
function getPoleName(gender, moduleType, dimension, pole) {
  // Convert code letters to A/B
  const poleMap = {
    'A': 'A', 'B': 'B',  // Physical
    'C': 'A', 'D': 'B',  // Social
    'E': 'A', 'F': 'B',  // Lifestyle
    'G': 'A', 'H': 'B'   // Values
  };
  const normalizedPole = poleMap[pole] || pole;
  
  const polesKey = gender === 'M' 
    ? (moduleType === 'want' ? 'menWant' : 'menOffer')
    : (moduleType === 'want' ? 'womenWant' : 'womenOffer');
  
  return safeGet(POLES, `${polesKey}.${dimension}.${normalizedPole}`, 'Unknown');
}

/**
 * Extracts dimension from code position
 * @param {number} position - 0-3
 * @returns {string} Dimension name
 */
function getDimensionFromPosition(position) {
  return ['physical', 'social', 'lifestyle', 'values'][position];
}

/**
 * Converts code letter to A/B
 * @param {string} letter - Code letter (A-H)
 * @returns {string} 'A' or 'B'
 */
function codeLetterToPole(letter) {
  return ['A', 'C', 'E', 'G'].includes(letter) ? 'A' : 'B';
}

// =============================================================================
// SECTION 1: PARALLELS SYSTEM
// =============================================================================
// Parallels identify where two people share the SAME pole on a dimension.
// This creates mutual understanding and reduces friction.

const PARALLELS_CONFIG = {
  weights: {
    physical: 0.15,   // Attraction alignment
    social: 0.20,     // Social style alignment  
    lifestyle: 0.25,  // Daily life alignment
    values: 0.40      // Foundational agreement (most important)
  },
  
  interpretations: {
    4: {
      label: 'Full Parallel',
      description: 'Complete alignment across all four dimensions. You naturally understand each other\'s defaults.',
      coachingNote: 'Your risk is not friction but stagnation. Same-same can lack growth-producing tension. Intentionally seek new experiences together.'
    },
    3: {
      label: 'Strong Parallel',
      description: 'Alignment on three dimensions. Easy rapport with one area of natural difference.',
      coachingNote: 'Your one difference is an opportunity, not a problem. It brings perspective neither of you has alone.'
    },
    2: {
      label: 'Moderate Parallel',
      description: 'Balanced mix of similarity and difference. Requires conscious bridging.',
      coachingNote: 'You will need to translate between your different defaults. Neither is wrong; they are different languages.'
    },
    1: {
      label: 'Low Parallel',
      description: 'Primarily complementary rather than parallel. Different defaults on most dimensions.',
      coachingNote: 'Your relationship will require more effort to understand each other\'s starting points. The reward is expanded perspective.'
    },
    0: {
      label: 'Opposite',
      description: 'No shared poles. Maximum difference.',
      coachingNote: 'You approach everything differently. This can create powerful complementarity OR constant friction. Success depends entirely on mutual respect and curiosity.'
    }
  },
  
  // Dimension-specific narratives for when parallels exist
  dimensionNarratives: {
    physical: {
      parallel: 'You are attracted to similar physical qualities. This creates mutual appreciation and reduces comparison anxiety.',
      notParallel: 'You prioritize different physical qualities. Neither is more valid; ensure you each feel seen for what you offer.'
    },
    social: {
      parallel: 'You navigate social situations similarly. You will naturally coordinate at parties, with friends, in public.',
      notParallel: 'You have different social styles. One may want to stay; one may want to go. Plan for this.'
    },
    lifestyle: {
      parallel: 'You want the same pace of life. Adventure or stabilityâ€”you agree on the rhythm.',
      notParallel: 'One seeks adventure; one seeks peace. This is manageable but requires explicit negotiation.'
    },
    values: {
      parallel: 'Your foundational values align. You agree on HOW to build a life, not just what to build.',
      notParallel: 'WARNING: Your values differ fundamentally. This affects every major decision: money, kids, roles, priorities. Do not underestimate this gap.'
    }
  }
};

/**
 * Calculates parallels between two users
 * 
 * @param {M1Results|M2Results} user1Results - First user's M1 or M2 results
 * @param {M1Results|M2Results} user2Results - Second user's M2 or M1 results
 * @returns {Object} Parallels analysis with scores, narratives, coaching
 */
function calculateParallels(user1Results, user2Results) {
  // Validate inputs
  const code1 = safeGet(user1Results, 'code', '');
  const code2 = safeGet(user2Results, 'code', '');
  
  if (code1.length !== 4 || code2.length !== 4) {
    return {
      error: 'Invalid codes provided',
      code1,
      code2
    };
  }
  
  const dimensions = ['physical', 'social', 'lifestyle', 'values'];
  const parallels = [];
  const differences = [];
  let weightedScore = 0;
  
  for (let i = 0; i < 4; i++) {
    const dim = dimensions[i];
    const pole1 = codeLetterToPole(code1[i]);
    const pole2 = codeLetterToPole(code2[i]);
    const isParallel = pole1 === pole2;
    const weight = PARALLELS_CONFIG.weights[dim];
    
    // Get strength from both users for this dimension
    const strength1 = safeGet(user1Results, `dimensions.${dim}.strength`, 50);
    const strength2 = safeGet(user2Results, `dimensions.${dim}.strength`, 50);
    const combinedStrength = (strength1 + strength2) / 2;
    
    if (isParallel) {
      parallels.push({
        dimension: dim,
        sharedPole: pole1,
        poleName1: safeGet(user1Results, `dimensions.${dim}.assignedPole`, code1[i]),
        poleName2: safeGet(user2Results, `dimensions.${dim}.assignedPole`, code2[i]),
        weight,
        strength: combinedStrength,
        narrative: PARALLELS_CONFIG.dimensionNarratives[dim].parallel
      });
      // Weight by both importance AND strength of conviction
      weightedScore += weight * (combinedStrength / 100);
    } else {
      differences.push({
        dimension: dim,
        pole1,
        pole2,
        poleName1: safeGet(user1Results, `dimensions.${dim}.assignedPole`, code1[i]),
        poleName2: safeGet(user2Results, `dimensions.${dim}.assignedPole`, code2[i]),
        weight,
        narrative: PARALLELS_CONFIG.dimensionNarratives[dim].notParallel
      });
    }
  }
  
  const count = parallels.length;
  const interpretation = PARALLELS_CONFIG.interpretations[count];
  
  // Check critical alignments
  const valuesAligned = codeLetterToPole(code1[3]) === codeLetterToPole(code2[3]);
  const lifestyleAligned = codeLetterToPole(code1[2]) === codeLetterToPole(code2[2]);
  
  // Generate dynamic narrative
  const narratives = [];
  
  if (valuesAligned) {
    narratives.push('Your values alignâ€”this is the foundation that makes everything else workable.');
  } else {
    narratives.push('Your values differ. This is the most significant gap. Every major life decision will surface this tension.');
  }
  
  if (lifestyleAligned) {
    narratives.push('You want the same pace of life, which reduces daily friction.');
  } else {
    narratives.push('You want different life rhythms. One craves adventure; one craves peace. This requires ongoing negotiation.');
  }
  
  parallels.forEach(p => {
    narratives.push(`On ${p.dimension}: ${p.narrative}`);
  });
  
  differences.forEach(d => {
    narratives.push(`On ${d.dimension}: ${d.narrative}`);
  });
  
  return {
    // Core data
    count,
    code1,
    code2,
    parallels,
    differences,
    
    // Scores
    weightedScore: Math.round(weightedScore * 100),
    rawScore: count * 25, // Simple 0-100 based on count
    
    // Interpretation
    label: interpretation.label,
    description: interpretation.description,
    coachingNote: interpretation.coachingNote,
    
    // Critical flags
    valuesAligned,
    lifestyleAligned,
    
    // Dynamic narrative
    narrative: narratives.join(' '),
    narrativeArray: narratives
  };
}

// =============================================================================
// SECTION 2: STRENGTHS SYSTEM
// =============================================================================
// Strengths identify where OPPOSITE poles create VALUE rather than friction.
// Not all opposites are strengthsâ€”values opposition is usually friction.

const STRENGTHS_CONFIG = {
  dimensionRules: {
    physical: {
      oppositesAre: 'strength',
      rationale: 'Different physical currencies often complement. His Fitness + Her Confidence, His Maturity + Her Beautyâ€”these create a complete attraction package.',
      narrativeTemplate: 'Your {pole1} and their {pole2} complement each other. You each bring something the other lacks.'
    },
    social: {
      oppositesAre: 'strength', 
      rationale: 'Complementary social styles create a complete unit. Leadership + Charm means one directs while the other connects.',
      narrativeTemplate: 'Socially, your {pole1} pairs well with their {pole2}. Together you cover more ground than either alone.'
    },
    lifestyle: {
      oppositesAre: 'conditional',
      rationale: 'Thrill + Peace CAN complement if both acknowledge the difference. But it often creates friction if one expects the other to change.',
      conditionForStrength: 'This becomes strength if you explicitly plan for different needs. "You go climb; I will read" is fine. "Why don\'t you want to climb?" is friction.',
      conditionForFriction: 'This becomes friction if either expects the other to change their fundamental orientation to life.'
    },
    values: {
      oppositesAre: 'friction',
      rationale: 'Traditional + Egalitarian is a fundamental conflict about how to structure life together. This is the At-Risk trap: high chemistry, low foundation.',
      warning: 'Values opposition predicts long-term incompatibility regardless of attraction. Proceed only with full awareness.',
      narrativeTemplate: 'Your values fundamentally differ. You want to build life by {pole1}; they want {pole2}. This affects everything.'
    }
  },
  
  atRiskDefinition: {
    description: 'At-Risk pairing: High attraction (Physical + Social strengths) with low foundation (Values friction)',
    warning: 'You have strong chemistry but opposing values. This is the classic "we have great connection but fight about everything important" pattern.',
    coaching: 'This can work, but only if you both explicitly acknowledge the values gap and decide together how to handle the major decisions where it will surface: money, kids, roles, priorities, religion, politics.'
  }
};

/**
 * Calculates strengths (valuable complementarity) between two users
 * 
 * @param {M1Results|M2Results} user1Results - First user's results
 * @param {M1Results|M2Results} user2Results - Second user's results  
 * @param {string} gender1 - First user's gender for pole naming
 * @param {string} gender2 - Second user's gender for pole naming
 * @returns {Object} Strengths analysis
 */
function calculateStrengths(user1Results, user2Results, gender1 = 'M', gender2 = 'W') {
  const code1 = safeGet(user1Results, 'code', '');
  const code2 = safeGet(user2Results, 'code', '');
  
  if (code1.length !== 4 || code2.length !== 4) {
    return { error: 'Invalid codes provided', code1, code2 };
  }
  
  const dimensions = ['physical', 'social', 'lifestyle', 'values'];
  const strengths = [];
  const conditionals = [];
  const frictions = [];
  let strengthScore = 0;
  
  for (let i = 0; i < 4; i++) {
    const dim = dimensions[i];
    const pole1 = codeLetterToPole(code1[i]);
    const pole2 = codeLetterToPole(code2[i]);
    
    // Only analyze opposites (same poles are parallels, not strengths)
    if (pole1 === pole2) continue;
    
    const poleName1 = safeGet(user1Results, `dimensions.${dim}.assignedPole`, code1[i]);
    const poleName2 = safeGet(user2Results, `dimensions.${dim}.assignedPole`, code2[i]);
    const strength1 = safeGet(user1Results, `dimensions.${dim}.strength`, 50);
    const strength2 = safeGet(user2Results, `dimensions.${dim}.strength`, 50);
    const combinedStrength = (strength1 + strength2) / 2;
    
    const rule = STRENGTHS_CONFIG.dimensionRules[dim];
    
    const entry = {
      dimension: dim,
      pole1,
      pole2,
      poleName1,
      poleName2,
      combinedStrength,
      rationale: rule.rationale
    };
    
    if (rule.oppositesAre === 'strength') {
      entry.narrative = rule.narrativeTemplate
        .replace('{pole1}', poleName1)
        .replace('{pole2}', poleName2);
      strengths.push(entry);
      strengthScore += 0.30 * (combinedStrength / 100);
    } else if (rule.oppositesAre === 'conditional') {
      entry.conditionForStrength = rule.conditionForStrength;
      entry.conditionForFriction = rule.conditionForFriction;
      entry.narrative = `Your lifestyle difference (${poleName1} vs ${poleName2}) can be strength or friction. ${rule.conditionForStrength}`;
      conditionals.push(entry);
      strengthScore += 0.15 * (combinedStrength / 100); // Half credit
    } else {
      entry.warning = rule.warning;
      entry.narrative = rule.narrativeTemplate
        .replace('{pole1}', poleName1)
        .replace('{pole2}', poleName2);
      frictions.push(entry);
      // No strength credit for friction
    }
  }
  
  // Check for At-Risk pattern
  const hasValuesFriction = frictions.some(f => f.dimension === 'values');
  const hasAttractionStrength = strengths.filter(s => 
    s.dimension === 'physical' || s.dimension === 'social'
  ).length >= 1;
  const isAtRisk = hasValuesFriction && hasAttractionStrength;
  
  // Generate dynamic narrative
  const narratives = [];
  
  strengths.forEach(s => narratives.push(s.narrative));
  conditionals.forEach(c => narratives.push(c.narrative));
  
  if (hasValuesFriction) {
    narratives.push(STRENGTHS_CONFIG.dimensionRules.values.warning);
  }
  
  if (isAtRisk) {
    narratives.push(STRENGTHS_CONFIG.atRiskDefinition.warning);
  }
  
  return {
    // Core data
    strengths,
    conditionals,
    frictions,
    code1,
    code2,
    
    // Scores
    strengthScore: Math.round(strengthScore * 100),
    strengthCount: strengths.length,
    
    // Flags
    hasValuesFriction,
    hasAttractionStrength,
    isAtRisk,
    
    // At-Risk details
    atRiskDetails: isAtRisk ? STRENGTHS_CONFIG.atRiskDefinition : null,
    
    // Dynamic narrative
    narrative: narratives.join(' '),
    narrativeArray: narratives
  };
}

// =============================================================================
// COMBINED PARALLELS + STRENGTHS
// =============================================================================

/**
 * Runs full compatibility analysis combining parallels and strengths
 * 
 * @param {M1Results} user1M1 - User 1's M1 (what they want)
 * @param {M2Results} user1M2 - User 1's M2 (what they offer)
 * @param {M1Results} user2M1 - User 2's M1 (what they want)
 * @param {M2Results} user2M2 - User 2's M2 (what they offer)
 * @returns {Object} Full compatibility analysis
 */
function analyzeCompatibility(user1M1, user1M2, user2M1, user2M2) {
  // Does User 1's offer (M2) parallel what User 2 wants (M1)?
  const user1OffersToUser2Wants = calculateParallels(user1M2, user2M1);
  
  // Does User 2's offer (M2) parallel what User 1 wants (M1)?
  const user2OffersToUser1Wants = calculateParallels(user2M2, user1M1);
  
  // What complementary strengths exist?
  const strengthsAnalysis = calculateStrengths(user1M2, user2M2);
  
  // Combined score
  const parallelScore = (user1OffersToUser2Wants.weightedScore + user2OffersToUser1Wants.weightedScore) / 2;
  
  return {
    // Directional parallels
    user1ToUser2: {
      label: 'What you offer vs what they want',
      parallels: user1OffersToUser2Wants
    },
    user2ToUser1: {
      label: 'What they offer vs what you want',
      parallels: user2OffersToUser1Wants
    },
    
    // Strengths
    strengths: strengthsAnalysis,
    
    // Combined scores
    parallelScore,
    strengthScore: strengthsAnalysis.strengthScore,
    combinedScore: Math.round((parallelScore * 0.6) + (strengthsAnalysis.strengthScore * 0.4)),
    
    // Flags
    isAtRisk: strengthsAnalysis.isAtRisk,
    valuesAligned: user1OffersToUser2Wants.valuesAligned && user2OffersToUser1Wants.valuesAligned,
    
    // Summary
    summary: generateCompatibilitySummary(user1OffersToUser2Wants, user2OffersToUser1Wants, strengthsAnalysis)
  };
}

/**
 * Generates human-readable compatibility summary
 */
function generateCompatibilitySummary(user1To2, user2To1, strengths) {
  const parts = [];
  
  // Parallel summary
  const avgParallels = (user1To2.count + user2To1.count) / 2;
  if (avgParallels >= 3) {
    parts.push('You have strong natural alignment.');
  } else if (avgParallels >= 2) {
    parts.push('You have moderate alignment with some differences to navigate.');
  } else {
    parts.push('You approach most things differently, which requires more conscious bridging.');
  }
  
  // Values check
  if (!user1To2.valuesAligned || !user2To1.valuesAligned) {
    parts.push('Your values differâ€”this is significant and affects major life decisions.');
  }
  
  // At-risk check
  if (strengths.isAtRisk) {
    parts.push('You show the At-Risk pattern: strong chemistry but opposing values. This requires explicit discussion.');
  }
  
  // Strengths
  if (strengths.strengthCount > 0) {
    parts.push(`You have ${strengths.strengthCount} complementary strength(s) where your differences create value.`);
  }
  
  return parts.join(' ');
}

// =============================================================================
// NARRATIVE VOICE PRINCIPLES
// =============================================================================
// These guide ALL narrative generation. AI must draw from this voice.

const NARRATIVE_VOICE = {
  principles: [
    'COMMIT, DON\'T HEDGE. "You will" not "you may." "This is" not "this could be."',
    'NAME SPECIFIC SITUATIONS. Not "life decisions" but "money, kids, holidays, whose family comes first."',
    'ACKNOWLEDGE THEIR EXPERIENCE. "You\'ve probably already felt this" not "you might experience."',
    'NO THERAPY-SPEAK. Never use: boundaries, communicate openly, safe space, navigate, honor your feelings, holding space.',
    'USE "YOU" CONSTANTLY. This is about THEM, not abstract patterns.',
    'SHORT SENTENCES. Punch. Don\'t meander.',
    'END WITH THE REAL QUESTION. Not adviceâ€”the choice they actually face.'
  ],
  
  forbiddenPhrases: [
    'communicate openly',
    'set boundaries', 
    'safe space',
    'navigate this',
    'honor your feelings',
    'holding space',
    'lean into',
    'do the work',
    'show up for',
    'unpack this',
    'at the end of the day',
    'it\'s important to remember',
    'consider discussing',
    'may create friction',
    'potential challenges'
  ],
  
  voiceExamples: {
    bad: 'Your values misalignment may create friction in major life decisions. Consider discussing your respective perspectives on traditional versus egalitarian partnership structures.',
    good: 'You two are going to fight about money. About who works. About who raises the kids. About whose career matters more. Not because either of you is wrongâ€”because you inherited different blueprints for what a marriage looks like.'
  }
};

// =============================================================================
// TENSION STACKS: INTRODUCTION
// =============================================================================
// 
// What is a Tension Stack?
// 
// A Tension Stack is a derived insight that emerges from COMBINING signals across
// multiple modules. No single question reveals it. No single module captures it.
// It only becomes visible when we look at how different parts of you interact.
// 
// Most assessments stop at description: "You are X type." Tension Stacks go further.
// They reveal where your own patterns create frictionâ€”with yourself, with partners,
// with the market. They show where you're aligned and where you're at war.
// 
// Why do they matter?
// 
// Because most relationship problems aren't about finding the right person.
// They're about patterns you carry that would sabotage ANY relationship.
// Tension Stacks surface those patterns before you repeat them.
// 
// The Six Tension Stacks:
// 
// 1. EROTIC DIMENSION (Esther Perel)
//    What turns you on and what kills it. Your desire pattern.
//    Sources: M1 (what you want) + M2 (what you offer) + M3 (how you connect)
// 
// 2. VULNERABILITY PROFILE (BrenÃ© Brown)
//    How you protect yourself from shameâ€”and what it costs you in intimacy.
//    Sources: M2 (self-perception) + M3 (what you offer) + M4 (conflict patterns)
// 
// 3. ATTRACTION-ATTACHMENT (Helen Fisher)
//    Are you attracted to what your nervous system can actually handle?
//    Sources: M1 (what attracts you) + M4 (what your driver fears)
// 
// 4. INTIMACY-CONFLICT BRIDGE (Perel + Gottman)
//    Does conflict deepen or destroy intimacy for you?
//    Sources: M3 (intimacy type) + M4 (conflict approach)
// 
// 5. INTERNAL CONFLICT COHERENCE (John Gottman)
//    Do your conflict patterns make sense together, or are you fighting yourself?
//    Sources: M4 internal (all conflict signals compared against each other)
// 
// 6. MARKET REALITY (Patti Stanger)
//    The gap between what you want, what you offer, and what the market provides.
//    Sources: Demographics + M1 (what you want) + M2 (what you offer)
// 
// Each stack produces:
// - A pattern classification
// - A confidence score
// - Gender-specific narrative guidance
// - Compatibility analysis with potential partners
// - Specific coaching for growth
// 
// These aren't labels to put on yourself. They're mirrors to help you see
// what you couldn't see before. What you do with that sight is up to you.

// =============================================================================
// SECTION 3: TENSION STACK - EROTIC DIMENSION (Esther Perel)
// =============================================================================
// Source: M1 (lifestyle) + M2 (lifestyle + self-perception) + M3 (want/offer)
// 
// INTRODUCTION:
// Most compatibility assessments pretend sex doesn't exist. Or they reduce it
// to "how important is physical intimacy to you?" on a 1-5 scale. That's not
// enough. Desire has architecture. It has patterns. And those patterns often
// contradict your conscious preferences.
// 
// The Erotic Dimension reveals HOW you desireâ€”what turns it on, what kills it,
// and why you keep ending up in the same place. Some people need novelty.
// Some need safety. Some need the gap between them and their partner to stay
// open. Others need it to close.
// 
// This matters because desire problems sink more relationships than conflict
// does. And desire problems are almost never about the other person. They're
// about your wiring meeting their wiringâ€”and whether those patterns can dance
// together or will step on each other's feet for decades.
// 
// Women especially feel this gap in traditional assessments. The erotic
// dimension of compatibility is systematically ignored. We don't ignore it.

const EROTIC_DIMENSION_CONFIG = {
  name: 'Erotic Dimension',
  author: 'Esther Perel',
  sources: ['M1.dimensions.lifestyle', 'M2.dimensions.lifestyle', 'M2.overallSelfPerceptionGap', 'M3'],
  
  // The four desire patterns
  desirePatterns: {
    polarityDependent: {
      name: 'Polarity-Dependent Desire',
      shortName: 'Polarity',
      description: 'You need difference to feel desire. Sameness kills it.',
      
      // Detection: High lifestyle gap between M1 and M2 (want thrill, offer peace or vice versa)
      detection: 'M1 lifestyle direction !== M2 lifestyle direction AND both have strength > 30',
      
      starters: {
        male: `You need difference to want someone. Sameness bores youâ€”not intellectually, but physically. Something in you goes quiet when there's no gap to cross. You're drawn to women who aren't quite like you. The ones who challenge your rhythm, who don't fit neatly into your life. The problem? Difference is unstable. You're attracted to what you can't fully have, fully know, fully predict. This keeps desire aliveâ€”and makes security feel like a slow death. Your partner needs to stay a little bit foreign to you. The moment she becomes predictable, something in you starts looking for the next horizon.`,
        
        female: `You need polarity to feel desire. When a man feels too similarâ€”too agreeable, too available, too much like a friendâ€”something shuts off. You're not broken. You're wired for difference. The catch is that difference creates friction, and friction is exhausting outside the bedroom. You want a man who challenges you, but challenge gets old on a Tuesday night when you're tired and just want ease. The question you're living: can you find someone who stays foreign enough to want, but familiar enough to live with?`,
        
        general: `Desire, for you, lives in the gap. The space between you and them. When that gap closesâ€”when you know everything, when nothing surprises youâ€”desire fades. This isn't a flaw. It's a feature. But it means you need a partner who understands that closeness isn't the goal. The goal is closeness AND distance. Together AND separate. Known AND mysterious. Most people collapse into one. You need both to stay alive.`
      },
      
      risks: [
        'Confusing instability with passion',
        'Sabotaging good relationships because they feel "too easy"',
        'Chasing unavailable people because unavailability feels like desire',
        'Getting bored with partners who are actually good for you'
      ],
      
      growthPath: 'Learn to create distance within commitment. Separate lives, separate friends, separate adventuresâ€”then come back together. The gap doesn\'t have to mean different people. It can mean different experiences within the same relationship.'
    },
    
    noveltyDependent: {
      name: 'Novelty-Dependent Desire',
      shortName: 'Novelty',
      description: 'New is what turns you on. Routine kills desire.',
      
      // Detection: High M3 want score (wants high access/exclusivity but needs newness)
      // Combined with M1 Thrill orientation
      detection: 'M1 lifestyle = Thrill AND M3 wantScore > 65',
      
      starters: {
        male: `New is what lights you up. New places, new experiences, new versions of the same woman. It's not that you can't commitâ€”it's that routine doesn't just bore you, it kills something. The same restaurant, the same position, the same Saturday. Your body checks out. This terrifies partners who think your need for novelty means you'll leave. You might not leave. But you will die slowly in a relationship that becomes predictable. The question: can you build a life with someone while constantly reaching for what's next? And can she understand that your restlessness isn't about her?`,
        
        female: `You need the new. Not new men, necessarilyâ€”but new experiences, new contexts, new versions of him. The same flowers every anniversary makes you want to scream. You're not ungrateful. You're wired for discovery. Routine is where your desire goes to die. The men who understand this are rare. Most hear "I need novelty" and assume you're about to leave. The truth is simpler and harder: you need a partner who will keep showing you parts of himself you haven't seen. And you need to keep showing him parts of yourself too.`,
        
        general: `Your erotic engine runs on new. This doesn't mean you can't be faithfulâ€”it means you can't be stagnant. Repetition is your kryptonite. The third time you do anything the same way, something dims. This is expensive to maintain in a long-term relationship. Not impossibleâ€”but expensive. You'll need to invest in novelty the way other couples invest in stability.`
      },
      
      risks: [
        'Mistaking the comfort of commitment for the death of attraction',
        'Always planning the next thing instead of being present',
        'Exhausting partners who need more consistency',
        'Feeling like something is wrong when things are actually good but stable'
      ],
      
      growthPath: 'Novelty doesn\'t have to mean external. Go deeper instead of wider. The person you\'ve been with for years has depths you haven\'t seen. But you have to look. Adventure can be internalâ€”asking the question you\'ve never asked, going to the place inside them you\'ve avoided.'
    },
    
    familiarityDependent: {
      name: 'Familiarity-Dependent Desire',
      shortName: 'Familiarity',
      description: 'You need safety before you can want. Trust opens desire.',
      
      // Detection: M1 lifestyle = Peace AND M3 offerScore > 60 (offers consistency)
      detection: 'M1 lifestyle = Peace AND M3 offerScore > 60',
      
      starters: {
        male: `You need to feel safe before you can want. The body doesn't open without trust. This means early dating is awkwardâ€”you don't perform on command, and the "spark" everyone talks about often isn't there for you at first. It shows up later. After you know her. After she's proven she won't use your openness against you. The right woman understands this isn't coldness. It's protection. And when you finally do open, you open all the way. Your desire isn't a sparkâ€”it's a long burn. Slow to start, hard to put out.`,
        
        female: `You need to know a man before you can want him. Really know himâ€”not just his rÃ©sumÃ©, but how he handles a bad day, how he treats waiters, how he talks about his ex. The heat comes after the safety. This makes modern dating brutal because you're supposed to feel "chemistry" on date one. You won't. You might on date ten. Or thirty. The ones who don't wait, don't deserve you. The ones who stay long enough to see what you become when you trust themâ€”they get the version of you that most people never see.`,
        
        general: `Desire, for you, follows trust. It doesn't lead. Your body needs your mind and heart to go first, to scout ahead and report back: safe. Only then does wanting become possible. This is beautiful and inconvenient. Beautiful because when you finally desire someone, it's not shallowâ€”it's built on foundation. Inconvenient because you live in a world that expects instant heat.`
      },
      
      risks: [
        'Staying too long in relationships that are safe but passionless',
        'Missing genuine connections because the spark wasn\'t immediate',
        'Partners misreading your slow warm-up as rejection',
        'Confusing comfort with desireâ€”staying because it\'s easy, not because you want them'
      ],
      
      growthPath: 'The risk for you isn\'t opening upâ€”it\'s staying open. Once you feel safe, you might stop reaching. Familiarity can become furniture. Keep choosing each other. Don\'t let safety become the end of the story. Let it be the foundation for something that keeps growing.'
    },
    
    integrated: {
      name: 'Integrated Desire',
      shortName: 'Integrated',
      description: 'You can access desire through multiple pathways.',
      
      // Detection: Balanced scores, no strong single pattern
      detection: 'No dominant pattern (all scores within 20 points of each other)',
      
      starters: {
        male: `You can access desire through multiple doors. Novelty works. Familiarity works. Distance works. Closeness works. This is rarer than you think. Most people have one pathway and struggle when that pathway gets blocked. You have options. The risk? You might not understand partners who don't. When she says she needs space to want you, or needs closeness to want you, you might think something is wrong. Nothing is wrong. Her wiring is just more specific than yours.`,
        
        female: `You're not locked into one way of wanting. Some nights it's the novelty that lights you up. Other nights it's the comfort of knowing exactly how he'll touch you. You can find desire in the gap and in the closeness. This is a giftâ€”and a potential blind spot. Because you're flexible, you might expect him to be too. He might not be. He might need the new, or need the familiar, and only that. Learning his pathway is more important for you than most, because you could easily assume he works the way you do.`,
        
        general: `Your desire has multiple access points. This makes you adaptable but potentially impatient with partners who are more narrowly wired. Remember: their limitation isn't dysfunction. It's just a different architecture. Your job is to learn their pathway, even if it's not how you would have designed it.`
      },
      
      risks: [
        'Assuming partners have the same flexibility you do',
        'Getting frustrated with partners who need very specific conditions',
        'Not developing depth in any single pathway',
        'Missing what your partner actually needs because you\'re offering what works for you'
      ],
      
      growthPath: 'Your growth isn\'t about becoming more flexibleâ€”you\'re already flexible. It\'s about becoming fluent in pathways that aren\'t yours. Learn what lights up your partner even if it doesn\'t light you up. Become a student of their desire, not just your own.'
    }
  },
  
  // Additional signals computed from modules
  signals: {
    lifestyleGap: {
      name: 'Lifestyle Gap',
      description: 'Difference between what you want (M1) and what you offer (M2) on lifestyle',
      computation: 'Compare M1.lifestyle.direction to M2.lifestyle.direction',
      interpretation: {
        same: 'You want what you offer. Congruent but potentially limited erotic range.',
        different: 'You want what you don\'t naturally offer. This creates internal polarityâ€”and often attracts partners who mirror your gap.'
      }
    },
    
    mysteryQuotient: {
      name: 'Mystery Quotient',
      description: 'How much exclusive access/knowing do you want from a partner?',
      computation: 'M3.wantScore',
      interpretation: {
        high: 'You want deep exclusive access. The erotic charge comes from being the only one who knows them this way.',
        low: 'You\'re comfortable with partial access. Mystery doesn\'t threaten youâ€”it intrigues you.'
      }
    },
    
    rangeCapacity: {
      name: 'Range Capacity',
      description: 'Can you be different people in different contexts?',
      computation: 'M3.offerScore',
      interpretation: {
        high: 'You can context-switch. Boardroom to bedroom, different registers. This is erotic fuel.',
        low: 'You\'re consistent across contexts. What you see is what you get. Some find this trustworthy; others find it limiting.'
      }
    },
    
    selfPerceptionAccuracy: {
      name: 'Self-Perception Accuracy',
      description: 'How accurate is your self-image?',
      computation: 'M2.overallSelfPerceptionGap.average',
      interpretation: {
        aligned: 'You see yourself clearly. What you think you offer is what you actually offer.',
        gapPresent: 'There\'s a gap between how you see yourself and how you come across. This can create erotic confusionâ€”you\'re sending signals you don\'t know you\'re sending.'
      }
    }
  }
};

/**
 * Computes Erotic Dimension profile from module results
 * 
 * @param {M1Results} m1 - Module 1 results (what they want)
 * @param {M2Results} m2 - Module 2 results (what they offer)
 * @param {M3Results} m3 - Module 3 results (how they connect)
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} Erotic dimension profile with pattern, signals, narratives
 */
function computeEroticDimension(m1, m2, m3, gender) {
  // Validate inputs
  const requiredPaths = [
    'm1.dimensions.lifestyle.direction',
    'm1.dimensions.lifestyle.strength',
    'm2.dimensions.lifestyle.direction', 
    'm2.dimensions.lifestyle.strength',
    'm2.overallSelfPerceptionGap.average',
    'm3.wantScore',
    'm3.offerScore'
  ];
  
  // Extract values safely
  const m1LifestyleDir = safeGet(m1, 'dimensions.lifestyle.direction', 'A');
  const m1LifestyleStrength = safeGet(m1, 'dimensions.lifestyle.strength', 50);
  const m2LifestyleDir = safeGet(m2, 'dimensions.lifestyle.direction', 'A');
  const m2LifestyleStrength = safeGet(m2, 'dimensions.lifestyle.strength', 50);
  const selfPerceptionGap = safeGet(m2, 'overallSelfPerceptionGap.average', 0.5);
  const m3WantScore = safeGet(m3, 'wantScore', 50);
  const m3OfferScore = safeGet(m3, 'offerScore', 50);
  const m3Type = safeGet(m3, 'contextSwitchingType', 2);
  
  // Compute signals
  const lifestyleGap = m1LifestyleDir !== m2LifestyleDir;
  const lifestyleGapStrength = lifestyleGap ? (m1LifestyleStrength + m2LifestyleStrength) / 2 : 0;
  const hasStrongLifestyleGap = lifestyleGap && lifestyleGapStrength > 30;
  
  const m1WantsThrill = m1LifestyleDir === 'A';
  const m2OffersPeace = m2LifestyleDir === 'B';
  const highMysteryWant = m3WantScore > 65;
  const highRangeOffer = m3OfferScore > 60;
  const lowRangeOffer = m3OfferScore < 40;
  
  // Determine primary desire pattern
  let primaryPattern = 'integrated';
  let patternConfidence = 50;
  let patternRationale = [];
  
  // Check for Polarity-Dependent
  if (hasStrongLifestyleGap) {
    primaryPattern = 'polarityDependent';
    patternConfidence = Math.min(90, 50 + lifestyleGapStrength);
    patternRationale.push(`Strong lifestyle gap: you want ${m1WantsThrill ? 'Thrill' : 'Peace'} but offer ${m2OffersPeace ? 'Peace' : 'Thrill'}`);
  }
  // Check for Novelty-Dependent
  else if (m1WantsThrill && highMysteryWant) {
    primaryPattern = 'noveltyDependent';
    patternConfidence = Math.min(85, 50 + (m3WantScore - 50));
    patternRationale.push('You want Thrill and seek high exclusive access');
  }
  // Check for Familiarity-Dependent
  else if (!m1WantsThrill && highRangeOffer) {
    primaryPattern = 'familiarityDependent';
    patternConfidence = Math.min(85, 50 + (m3OfferScore - 50));
    patternRationale.push('You want Peace and offer consistent presence');
  }
  // Default to Integrated
  else {
    primaryPattern = 'integrated';
    patternConfidence = 60;
    patternRationale.push('No dominant pattern detectedâ€”you have multiple pathways to desire');
  }
  
  const pattern = EROTIC_DIMENSION_CONFIG.desirePatterns[primaryPattern];
  
  // Select appropriate starter narrative
  const genderKey = gender === 'M' ? 'male' : gender === 'W' ? 'female' : 'general';
  const starterNarrative = pattern.starters[genderKey] || pattern.starters.general;
  
  // Build signal interpretations
  const signals = {
    lifestyleGap: {
      value: lifestyleGap,
      strength: lifestyleGapStrength,
      interpretation: lifestyleGap 
        ? EROTIC_DIMENSION_CONFIG.signals.lifestyleGap.interpretation.different
        : EROTIC_DIMENSION_CONFIG.signals.lifestyleGap.interpretation.same
    },
    mysteryQuotient: {
      score: m3WantScore,
      level: m3WantScore > 65 ? 'high' : m3WantScore < 35 ? 'low' : 'moderate',
      interpretation: m3WantScore > 65 
        ? EROTIC_DIMENSION_CONFIG.signals.mysteryQuotient.interpretation.high
        : EROTIC_DIMENSION_CONFIG.signals.mysteryQuotient.interpretation.low
    },
    rangeCapacity: {
      score: m3OfferScore,
      level: m3OfferScore > 60 ? 'high' : m3OfferScore < 40 ? 'low' : 'moderate',
      interpretation: m3OfferScore > 60
        ? EROTIC_DIMENSION_CONFIG.signals.rangeCapacity.interpretation.high
        : EROTIC_DIMENSION_CONFIG.signals.rangeCapacity.interpretation.low
    },
    selfPerceptionAccuracy: {
      gap: selfPerceptionGap,
      level: selfPerceptionGap > 0.8 ? 'significant' : selfPerceptionGap > 0.4 ? 'moderate' : 'aligned',
      interpretation: selfPerceptionGap < 0.5
        ? EROTIC_DIMENSION_CONFIG.signals.selfPerceptionAccuracy.interpretation.aligned
        : EROTIC_DIMENSION_CONFIG.signals.selfPerceptionAccuracy.interpretation.gapPresent
    }
  };
  
  // Generate customized narrative (AI will expand from starter)
  const customizations = [];
  
  if (lifestyleGap) {
    customizations.push(`Your want/offer gap is significant: you seek ${m1WantsThrill ? 'adventure and thrill' : 'peace and stability'} but you naturally offer ${m2OffersPeace ? 'calm and consistency' : 'excitement and intensity'}. This internal polarity shapes who you attract.`);
  }
  
  if (signals.selfPerceptionAccuracy.level !== 'aligned') {
    customizations.push(`There's a gap between how you see yourself and how you come across. You might be sending erotic signals you're not aware ofâ€”or not sending ones you think you are.`);
  }
  
  if (signals.rangeCapacity.level === 'high') {
    customizations.push(`You can switch contextsâ€”formal to intimate, public to private. This range is erotic fuel. You're not the same person in every room, and that's attractive.`);
  } else if (signals.rangeCapacity.level === 'low') {
    customizations.push(`You're consistent across contexts. What someone sees at dinner is what they get in the bedroom. Some partners find this trustworthy. Others want more range.`);
  }
  
  return {
    // Core pattern
    pattern: primaryPattern,
    patternName: pattern.name,
    patternShortName: pattern.shortName,
    patternDescription: pattern.description,
    confidence: patternConfidence,
    rationale: patternRationale,
    
    // Narratives for report generation
    starterNarrative,
    customizations,
    risks: pattern.risks,
    growthPath: pattern.growthPath,
    
    // Computed signals
    signals,
    
    // Raw inputs (for debugging/verification)
    inputs: {
      m1Lifestyle: { direction: m1LifestyleDir, strength: m1LifestyleStrength },
      m2Lifestyle: { direction: m2LifestyleDir, strength: m2LifestyleStrength },
      m3Want: m3WantScore,
      m3Offer: m3OfferScore,
      m3Type,
      selfPerceptionGap
    },
    
    // For AI report generation
    reportContext: {
      voicePrinciples: NARRATIVE_VOICE.principles,
      forbiddenPhrases: NARRATIVE_VOICE.forbiddenPhrases,
      starter: starterNarrative,
      customizations,
      userGender: gender,
      patternRisks: pattern.risks,
      growth: pattern.growthPath
    }
  };
}

/**
 * Computes Erotic Dimension compatibility between two users
 * 
 * @param {Object} user1Erotic - User 1's erotic dimension results
 * @param {Object} user2Erotic - User 2's erotic dimension results
 * @returns {Object} Compatibility analysis
 */
function computeEroticCompatibility(user1Erotic, user2Erotic) {
  const p1 = user1Erotic.pattern;
  const p2 = user2Erotic.pattern;
  
  // Define compatibility matrix
  const compatibilityMatrix = {
    'polarityDependent-polarityDependent': {
      score: 70,
      dynamic: 'Two people who need difference. You\'ll create itâ€”sometimes productively, sometimes destructively. The risk is manufacturing conflict to feel alive.',
      challenge: 'You might compete for who gets to be the "different" one.',
      opportunity: 'You both understand the need for space and mystery. Neither will suffocate the other.'
    },
    'polarityDependent-familiarityDependent': {
      score: 45,
      dynamic: 'One needs distance to want; one needs closeness. This is a fundamental tension.',
      challenge: 'When you pull away to create desire, they feel abandoned. When they move closer, you feel smothered.',
      opportunity: 'You can teach each other. But only if you both name this pattern explicitly.'
    },
    'polarityDependent-noveltyDependent': {
      score: 75,
      dynamic: 'Both of you need movement. Different kindsâ€”one needs difference, one needs newnessâ€”but movement is shared.',
      challenge: 'Neither of you is great at stillness. The relationship might always be reaching for the next thing.',
      opportunity: 'You won\'t bore each other. That counts for a lot.'
    },
    'polarityDependent-integrated': {
      score: 70,
      dynamic: 'They can meet you in your need for distance. They have other pathways too.',
      challenge: 'They might not understand why you NEED the gap when they can take it or leave it.',
      opportunity: 'They\'re flexible enough to give you what you need without taking it personally.'
    },
    'noveltyDependent-noveltyDependent': {
      score: 65,
      dynamic: 'Two explorers. The relationship will be an adventureâ€”or exhaust itself chasing the next thing.',
      challenge: 'Who holds down the fort while you\'re both looking for new horizons?',
      opportunity: 'You\'ll never run out of things to try together.'
    },
    'noveltyDependent-familiarityDependent': {
      score: 50,
      dynamic: 'One wants to explore; one wants to deepen. These can complementâ€”or clash.',
      challenge: 'Your "let\'s try something new" meets their "I liked it the way it was." Repeatedly.',
      opportunity: 'You can teach each other what you\'re missing. They show you depth; you show them range.'
    },
    'noveltyDependent-integrated': {
      score: 75,
      dynamic: 'They can ride with your need for newness, but they don\'t need it the way you do.',
      challenge: 'You might wonder why they\'re not as hungry for the next thing.',
      opportunity: 'They can anchor you without boring you.'
    },
    'familiarityDependent-familiarityDependent': {
      score: 80,
      dynamic: 'Two people who need safety to open. Once you\'re past the slow start, this is deep.',
      challenge: 'The beginning might be painfully slow. Neither lights up fast.',
      opportunity: 'Once trust is established, it\'s bedrock. You both know how to stay.'
    },
    'familiarityDependent-integrated': {
      score: 75,
      dynamic: 'They can meet your need for safety. They also have other speeds when you\'re ready.',
      challenge: 'They might move faster than you in the beginning.',
      opportunity: 'They\'ll wait for you. And when you open, they can meet you there.'
    },
    'integrated-integrated': {
      score: 85,
      dynamic: 'Maximum flexibility. You can both access desire multiple ways.',
      challenge: 'You might not develop deep expertise in any single pathway.',
      opportunity: 'You\'ll rarely get stuck. There\'s always another door to desire.'
    }
  };
  
  // Get compatibility (order-independent lookup)
  const key1 = `${p1}-${p2}`;
  const key2 = `${p2}-${p1}`;
  const compatibility = compatibilityMatrix[key1] || compatibilityMatrix[key2] || {
    score: 60,
    dynamic: 'Mixed pattern interaction.',
    challenge: 'Your desire patterns differ in ways that require conscious navigation.',
    opportunity: 'Different wiring means you can show each other new pathways.'
  };
  
  // Analyze signal alignment
  const signalAlignment = {
    lifestyleGapAlignment: user1Erotic.signals.lifestyleGap.value === user2Erotic.signals.lifestyleGap.value,
    mysteryAlignment: Math.abs(user1Erotic.signals.mysteryQuotient.score - user2Erotic.signals.mysteryQuotient.score) < 25,
    rangeAlignment: Math.abs(user1Erotic.signals.rangeCapacity.score - user2Erotic.signals.rangeCapacity.score) < 25
  };
  
  return {
    score: compatibility.score,
    user1Pattern: user1Erotic.patternName,
    user2Pattern: user2Erotic.patternName,
    dynamic: compatibility.dynamic,
    challenge: compatibility.challenge,
    opportunity: compatibility.opportunity,
    signalAlignment,
    
    // Narrative for report
    narrative: `${compatibility.dynamic} ${compatibility.challenge} ${compatibility.opportunity}`
  };
}

// =============================================================================
// SECTION 4: TENSION STACK - VULNERABILITY PROFILE (BrenÃ© Brown)
// =============================================================================
// Source: M2 (self-perception gap) + M3 (offer score) + M4 (drivers, gottman, capacity)
//
// INTRODUCTION:
// Everyone has armor. The question is what kind, how thick, and what it costs.
// 
// Armor develops for good reasons. You got hurt, you adapted, you protected
// yourself. The problem is that armor built for one war gets worn into the next.
// The protection that saved you at 12 is suffocating your relationships at 35.
// 
// The Vulnerability Profile reveals your armor typeâ€”perfectionism, numbing,
// cynicism, control, or flooding. Each has a logic. Each has a cost. Each
// shows up differently in intimacy. And each operates differently by gender,
// because men and women are shamed for different things.
// 
// Men are shamed for weakness. Women are shamed for not being enough. These
// different shame foundations create different armor, different triggers,
// different relationship patterns. The therapy industrial complex often misses
// this. We don't.
// 
// This stack won't tell you to "be more vulnerable." That's useless advice.
// It will show you exactly how you protect yourself, what it costs you, and
// what the first step toward something different might look like.

const VULNERABILITY_PROFILE_CONFIG = {
  name: 'Vulnerability Profile',
  author: 'BrenÃ© Brown',
  sources: ['M2.overallSelfPerceptionGap', 'M3.offerScore', 'M4.emotionalDrivers', 'M4.gottmanScreener', 'M4.conflictApproach'],
  
  // Gender-specific shame patterns
  genderLens: {
    male: {
      primaryShame: 'weakness',
      coreMessage: 'Do not be perceived as weak',
      manifestations: [
        'Avoiding asking for help',
        'Refusing to admit confusion or uncertainty', 
        'Overworking to prove worth',
        'Shutting down rather than showing hurt',
        'Deflecting with humor or anger when vulnerable'
      ],
      culturalPressure: 'Men are taught that vulnerability is weakness, and weakness is unacceptable. The box is small: provide, protect, perform. Anything outside that box triggers shame.',
      partnerExperience: 'She feels like she can\'t reach him. He\'s there but not there. When she asks what\'s wrong, he says "nothing" or gets irritated. She starts to think he doesn\'t trust her, or doesn\'t have feelings at all.',
      whatHeNeeds: 'He needs her to understand that his shutdown isn\'t rejectionâ€”it\'s protection. He needs permission to not have the answer. He needs her to not interpret his silence as absence of feeling.'
    },
    female: {
      primaryShame: 'not-enough',
      coreMessage: 'Do not be perceived as inadequate',
      manifestations: [
        'Perfectionism in appearance, home, parenting',
        'Comparing to other women constantly',
        'Apologizing for existing (sorry, sorry, sorry)',
        'Over-functioning to prove worth',
        'Never asking for what she needs directly'
      ],
      culturalPressure: 'Women are taught they must be everything to everyoneâ€”beautiful but not vain, smart but not intimidating, sexy but not slutty, nurturing but also successful. The expectations are impossible, so shame is inevitable.',
      partnerExperience: 'He feels like nothing he does is enough. She\'s always fixing, improving, apologizing. He can\'t figure out what she actually wants because she won\'t say it directly. He starts to feel like he\'s failing a test he can\'t see.',
      whatSheNeeds: 'She needs him to see her effort without her having to perform it. She needs to be told she\'s enough without having to earn it. She needs permission to stop.'
    }
  },
  
  // The five armor types
  armorTypes: {
    perfectionism: {
      name: 'Perfectionism',
      core: 'If I look perfect, do perfect, I can avoid shame.',
      
      detection: {
        primary: 'High self-perception gap + High M3 want (wants to be seen a certain way)',
        secondary: 'Inadequacy driver present'
      },
      
      starters: {
        male: `You learned early that mistakes are unacceptable. So you stopped making themâ€”or stopped admitting them. The work is always excellent. The image is always managed. But here's what that costs: no one knows you. They know your performance. They applaud your results. But the man behind the results? He's alone in there. Perfectionism isn't about high standards. It's about believing that if you're perfect enough, you'll finally be safe from criticism. You won't. The criticism just gets more specific. And the exhaustion of performing never stops.`,
        
        female: `You've built a life where everything looks right. The house, the body, the career, the kids if you have them. People say "I don't know how you do it all." You smile. You don't tell them about the 2am anxiety, the constant comparisons, the voice that says it's never enough. Perfectionism told you it would protect you. If you just got it rightâ€”finally, completely rightâ€”you'd be safe from judgment. But the target keeps moving. And the woman everyone admires is drowning while she smiles.`,
        
        general: `Perfectionism is armor disguised as ambition. It whispers that if you just perform well enough, you'll outrun shame. You can't. Shame is faster than performance. The only way out is to let yourself be seenâ€”imperfect, incomplete, still trying. That's terrifying. It's also the only door to actual connection.`
      },
      
      inRelationship: {
        gives: 'Excellence, reliability, someone who shows up prepared and polished.',
        costs: 'Authentic intimacy. A partner can\'t love who they can\'t see.',
        partnerExperience: 'They feel like they\'re dating a resume, not a person. They can\'t find you under all the performance.',
        repairPath: 'Let them see you fail at something. Don\'t fix it. Don\'t explain it. Just let it be witnessed.'
      }
    },
    
    numbing: {
      name: 'Numbing',
      core: 'If I don\'t feel it, it can\'t hurt me.',
      
      detection: {
        primary: 'Low M3 offer score + Withdraw conflict approach',
        secondary: 'Low emotional capacity OR high stonewalling'
      },
      
      starters: {
        male: `Somewhere along the way, you learned that feelings were expensive. They got you in trouble. They made things complicated. So you found ways to turn them down. Work. Screens. Drinks. Exercise. Whatever keeps the volume low. You're not depressedâ€”you're managed. The problem is you can't selectively numb. Turn down the pain, you turn down the joy too. Your partner isn't asking you to feel everything all the time. They're asking you to feel something, with them, out loud. That's the part that's hard.`,
        
        female: `You've gotten good at not feeling what you can't afford to feel. Wine takes the edge off. Shopping fills the hole for a minute. Staying busy means you don't have to think. You're not an addictâ€”you're coping. But coping has a cost. The feelings you're avoiding don't go away. They wait. And while you're numbing the hard stuff, you're numbing the good stuff too. The joy gets quieter. The love gets flatter. You're surviving, but you're not living.`,
        
        general: `Numbing works. That's the problem. It actually does turn down the volume on pain. The catch is it turns down everything. You don't get to choose what you stop feeling. Go numb to grief, you go numb to joy. Go numb to shame, you go numb to love. Your partner is knocking on a door you've locked from the inside. They can hear you in there, but you're not answering.`
      },
      
      inRelationship: {
        gives: 'Stability, calm under pressure, someone who doesn\'t create drama.',
        costs: 'Emotional presence. They\'re with someone who\'s half there.',
        partnerExperience: 'They feel alone even when you\'re in the room. They stop telling you things because you don\'t react anyway.',
        repairPath: 'Start with physical sensation. Notice when you reach for the numbing agent. Ask yourself: what am I about to not feel?'
      }
    },
    
    cynicism: {
      name: 'Cynicism',
      core: 'If I don\'t hope, I can\'t be disappointed.',
      
      detection: {
        primary: 'Low M3 want score + Critical Gottman pattern',
        secondary: 'Injustice driver (sees unfairness everywhere)'
      },
      
      starters: {
        male: `You've been burned enough times to know better. People disappoint. Systems fail. Hope is for suckers. Your cynicism feels like intelligenceâ€”you're just seeing clearly what others are too naive to see. But here's what cynicism actually is: pre-emptive disappointment. You're rejecting things before they can reject you. It's armor made of "I knew it." The problem is that cynicism kills possibility. When you assume the worst, you create conditions for the worst. Your partner feels your low expectations. And people tend to meet expectations.`,
        
        female: `You've been let down enough times that hoping feels dangerous. So you stopped. You're not negativeâ€”you're realistic. You see patterns others miss. You know how this ends. But cynicism isn't wisdom. It's fear dressed up as intelligence. When you expect disappointment, you find it everywhere. You create it. Your partner feels you waiting for them to fail. And people perform to the level of belief. You believe they'll disappoint you, and eventually, they do.`,
        
        general: `Cynicism is hope that's been hurt too many times. It says: if I don't believe in anything, nothing can let me down. This works in the short term. Long term, it poisons everything. Relationships need someone who believes they can work. Without that belief, you're just waiting for the end. And waiting for the end is a way of causing it.`
      },
      
      inRelationship: {
        gives: 'Protection from naivety, reality-testing, someone who sees problems early.',
        costs: 'Hope, growth, benefit of the doubt.',
        partnerExperience: 'They feel like they\'re on trial. Nothing they do is ever trusted or enough.',
        repairPath: 'Practice saying "I hope." Out loud. About small things first. Let yourself want something without pre-emptively mourning it.'
      }
    },
    
    control: {
      name: 'Control',
      core: 'If I control everything, nothing can surprise me.',
      
      detection: {
        primary: 'High M3 want score (wants to know everything) + High self-perception gap',
        secondary: 'Engulfment driver (fears losing autonomy, so controls environment)'
      },
      
      starters: {
        male: `You like things a certain way. Not because you're difficultâ€”because when things are predictable, they're safe. The calendar is organized. The finances are managed. The plans are made in advance. What you call "being responsible," others might call controlling. The distinction matters. Responsibility is handling your part. Control is handling everyone's part because you don't trust them to do it right. Your partner feels managed, not loved. They don't want a project manager. They want a partner.`,
        
        female: `You run a tight ship. The house, the schedule, the social calendarâ€”you've got it handled. People rely on you because you're reliable. But somewhere under all that competence is a terrified girl who learned that the only way to be safe is to be in charge. Control is how you manage anxiety. If nothing is left to chance, nothing can hurt you. But control is also how you push people away. Your partner feels like your employee. They stop trying because you'll just redo it anyway.`,
        
        general: `Control is fear wearing a management hat. It says: if I can predict everything, nothing can hurt me. But control is an illusion, and maintaining the illusion is exhausting. You can't control other people. You can only control yourselfâ€”and barely that. The tighter you grip, the more they pull away. Real intimacy requires surrendering control. That's the part that feels like dying.`
      },
      
      inRelationship: {
        gives: 'Organization, reliability, someone who handles logistics.',
        costs: 'Spontaneity, their autonomy, space for them to contribute.',
        partnerExperience: 'They feel micromanaged. They stop offering because you\'ll just change it.',
        repairPath: 'Let something be done wrong. On purpose. Sit with the discomfort. Notice that you survive it.'
      }
    },
    
    flooding: {
      name: 'Flooding',
      core: 'If I feel everything loudly, they\'ll have to respond.',
      
      detection: {
        primary: 'High M3 offer score + Pursue conflict approach + High emotional capacity',
        secondary: 'Abandonment driver (intensity is bid for connection)'
      },
      
      starters: {
        male: `When you feel, you feel big. You're not one of those shut-down guys who can't access emotionâ€”you access it full volume. This terrifies people. Men especially aren't supposed to feel this much, this openly. So you've been told you're "too much," "too intense," "too emotional." Here's the thing: your capacity to feel is a strength. But intensity without regulation is overwhelming. Your partner can't process when they're flooded. You need to learn to turn down the volumeâ€”not to feel less, but so they can hear you at all.`,
        
        female: `You feel everything. Deeply, loudly, immediately. When you're hurt, they know it. When you're happy, the room knows it. People have called you dramatic, too much, overwhelming. You've tried to tone it down. It doesn't work. You just feel like you're suffocating. Here's the truth: your emotional intensity is a gift. But gifts need to be given in doses the other person can receive. When you flood, they can't hear you anymore. They're just trying to survive the wave. Learning to regulate isn't about feeling less. It's about being heard.`,
        
        general: `Flooding is emotional intensity without a dimmer switch. Everything is urgent, everything is now, everything is at volume ten. This comes from a place of genuinely wanting connectionâ€”the intensity is a bid for response. But it backfires. Instead of drawing people in, it overwhelms them. They shut down not because they don't care, but because they can't process. The work isn't to feel less. It's to titrateâ€”to give your feelings in doses small enough to be received.`
      },
      
      inRelationship: {
        gives: 'Passion, engagement, someone who is never indifferent.',
        costs: 'Their capacity to respond, the space they need to process.',
        partnerExperience: 'They feel overwhelmed, like they can never do enough to calm the storm.',
        repairPath: 'Practice the pause. Feel the feeling, then count to ten before expressing it. The feeling will still be there. You\'re just giving them time to meet you.'
      }
    }
  },
  
  // Shame trigger patterns by driver
  shameByDriver: {
    abandonment: {
      trigger: 'Any hint they might leave',
      shameMessage: 'I am not worth staying for',
      behavioralResponse: 'Cling, demand reassurance, test loyalty',
      partnerExperience: 'They feel suffocated and constantly tested'
    },
    engulfment: {
      trigger: 'Feeling controlled or trapped',
      shameMessage: 'I am weak for needing space',
      behavioralResponse: 'Withdraw, create distance, resist requests',
      partnerExperience: 'They feel rejected and shut out'
    },
    inadequacy: {
      trigger: 'Any criticism or failure',
      shameMessage: 'I am fundamentally not enough',
      behavioralResponse: 'Collapse, over-apologize, shut down',
      partnerExperience: 'They feel like they can\'t give feedback without causing crisis'
    },
    injustice: {
      trigger: 'Perceived unfairness',
      shameMessage: 'I am being wronged and no one sees it',
      behavioralResponse: 'Build case, dig in, refuse to move until heard',
      partnerExperience: 'They feel like they\'re in court, not a relationship'
    }
  }
};

/**
 * Computes Vulnerability Profile from module results
 * 
 * @param {M2Results} m2 - Module 2 results (self-perception)
 * @param {M3Results} m3 - Module 3 results (what they offer)
 * @param {M4Results} m4 - Module 4 results (drivers, conflict, gottman)
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} Vulnerability profile with armor type, shame patterns, narratives
 */
function computeVulnerabilityProfile(m2, m3, m4, gender) {
  // Extract values safely using verified interface paths
  const selfPerceptionGap = safeGet(m2, 'overallSelfPerceptionGap.average', 0.5);
  const gapInterpretation = safeGet(m2, 'overallSelfPerceptionGap.interpretation', 'moderate');
  const mismatchedDimensions = safeGet(m2, 'overallSelfPerceptionGap.mismatchedDimensions', []);
  
  const m3OfferScore = safeGet(m3, 'offerScore', 50);
  const m3WantScore = safeGet(m3, 'wantScore', 50);
  
  const primaryDriver = safeGet(m4, 'emotionalDrivers.primary', 'inadequacy');
  const inadequacyScore = safeGet(m4, 'emotionalDrivers.scores.inadequacy', 50);
  const conflictApproach = safeGet(m4, 'conflictApproach.approach', 'pursue');
  const conflictIntensity = safeGet(m4, 'conflictApproach.intensity', 25);
  const capacityLevel = safeGet(m4, 'emotionalCapacity.level', 'medium');
  const capacityScore = safeGet(m4, 'emotionalCapacity.score', 50);
  
  const criticismScore = safeGet(m4, 'gottmanScreener.horsemen.criticism.score', 8);
  const stonewallingScore = safeGet(m4, 'gottmanScreener.horsemen.stonewalling.score', 8);
  const contemptScore = safeGet(m4, 'gottmanScreener.horsemen.contempt.score', 8);
  
  // Compute armor detection signals
  const highSelfPerceptionGap = selfPerceptionGap > 0.8;
  const lowOffer = m3OfferScore < 40;
  const highOffer = m3OfferScore > 65;
  const highWant = m3WantScore > 65;
  const isWithdrawer = conflictApproach === 'withdraw';
  const isPursuer = conflictApproach === 'pursue';
  const lowCapacity = capacityLevel === 'low';
  const highCapacity = capacityLevel === 'high';
  const highStonewalling = stonewallingScore > 12;
  const highCriticism = criticismScore > 12;
  
  // Determine primary armor type
  let primaryArmor = 'numbing'; // default
  let armorConfidence = 50;
  let armorRationale = [];
  
  // Perfectionism: High gap + wants to be seen well + inadequacy
  if (highSelfPerceptionGap && highWant && inadequacyScore > 50) {
    primaryArmor = 'perfectionism';
    armorConfidence = Math.min(90, 50 + (selfPerceptionGap * 20) + (inadequacyScore - 50) / 2);
    armorRationale.push('High self-perception gap suggests image management');
    armorRationale.push('High want score indicates need to control how you\'re seen');
    if (inadequacyScore > 60) armorRationale.push('Inadequacy driver suggests fear of not being enough');
  }
  // Numbing: Low offer + withdraw + low capacity or high stonewalling
  else if (lowOffer && isWithdrawer && (lowCapacity || highStonewalling)) {
    primaryArmor = 'numbing';
    armorConfidence = Math.min(85, 50 + (40 - m3OfferScore) + conflictIntensity);
    armorRationale.push('Low offer score suggests protected emotional access');
    armorRationale.push('Withdraw approach indicates moving away from intensity');
    if (highStonewalling) armorRationale.push('High stonewalling suggests shutdown under stress');
    if (lowCapacity) armorRationale.push('Low emotional capacity suggests difficulty holding feelings');
  }
  // Cynicism: Low want + high criticism + injustice driver
  else if (m3WantScore < 40 && highCriticism && primaryDriver === 'injustice') {
    primaryArmor = 'cynicism';
    armorConfidence = Math.min(85, 50 + (40 - m3WantScore) + (criticismScore - 8));
    armorRationale.push('Low want score suggests pre-emptive self-protection');
    armorRationale.push('High criticism pattern suggests focus on flaws');
    armorRationale.push('Injustice driver sees unfairness everywhere');
  }
  // Control: High want + high gap + engulfment
  else if (highWant && highSelfPerceptionGap && primaryDriver === 'engulfment') {
    primaryArmor = 'control';
    armorConfidence = Math.min(85, 50 + (m3WantScore - 50) + (selfPerceptionGap * 15));
    armorRationale.push('High want score indicates need to know and manage');
    armorRationale.push('Engulfment driver fears loss of autonomy, so controls environment');
  }
  // Flooding: High offer + pursue + high capacity + abandonment
  else if (highOffer && isPursuer && highCapacity && primaryDriver === 'abandonment') {
    primaryArmor = 'flooding';
    armorConfidence = Math.min(85, 50 + (m3OfferScore - 50) + conflictIntensity);
    armorRationale.push('High offer score indicates emotional openness');
    armorRationale.push('Pursue approach means moving toward intensity');
    armorRationale.push('Abandonment driver uses intensity as bid for connection');
  }
  // Secondary detection: Pursue + high offer without abandonment = still flooding tendency
  else if (highOffer && isPursuer && conflictIntensity > 30) {
    primaryArmor = 'flooding';
    armorConfidence = 65;
    armorRationale.push('High emotional offer combined with pursue approach');
  }
  // Secondary detection: Withdraw + low offer = numbing
  else if (lowOffer && isWithdrawer) {
    primaryArmor = 'numbing';
    armorConfidence = 60;
    armorRationale.push('Low offer combined with withdraw pattern');
  }
  // Default to checking self-perception gap for perfectionism
  else if (highSelfPerceptionGap) {
    primaryArmor = 'perfectionism';
    armorConfidence = 55;
    armorRationale.push('Self-perception gap suggests managed self-presentation');
  }
  
  const armor = VULNERABILITY_PROFILE_CONFIG.armorTypes[primaryArmor];
  const genderLens = VULNERABILITY_PROFILE_CONFIG.genderLens[gender === 'M' ? 'male' : 'female'];
  const shamePattern = VULNERABILITY_PROFILE_CONFIG.shameByDriver[primaryDriver];
  
  // Select gender-appropriate starter narrative
  const genderKey = gender === 'M' ? 'male' : gender === 'W' ? 'female' : 'general';
  const starterNarrative = armor.starters[genderKey] || armor.starters.general;
  
  // Build customizations based on actual scores
  const customizations = [];
  
  // Add gender-specific shame context
  customizations.push(`As a ${gender === 'M' ? 'man' : 'woman'}, your core shame message is likely: "${genderLens.coreMessage}." ${genderLens.culturalPressure}`);
  
  // Add driver-specific shame pattern
  customizations.push(`Your ${primaryDriver} driver means shame gets triggered by: ${shamePattern.trigger}. When triggered, you probably ${shamePattern.behavioralResponse.toLowerCase()}.`);
  
  // Add perception gap insight if significant
  if (gapInterpretation === 'significant') {
    customizations.push(`There's a significant gap between how you see yourself and how you come across. Your armor is workingâ€”maybe too well. You're protecting something that might not need this much protection anymore.`);
    if (mismatchedDimensions.length > 0) {
      customizations.push(`This gap shows up especially in: ${mismatchedDimensions.join(', ')}.`);
    }
  }
  
  // Add capacity context
  if (lowCapacity) {
    customizations.push(`You have limited bandwidth for emotional processing right now. This isn't a character flawâ€”it might mean you're already carrying a lot. But it affects how much vulnerability you can offer.`);
  } else if (highCapacity) {
    customizations.push(`You have high emotional capacity. You can hold a lotâ€”yours and others'. The risk is taking on too much, or expecting partners to match your capacity.`);
  }
  
  // Compute vulnerability capacity score (0-100)
  // Higher = more accessible vulnerability
  const vulnerabilityCapacity = Math.round(
    (m3OfferScore * 0.4) + 
    ((100 - selfPerceptionGap * 50) * 0.3) + 
    (capacityScore * 0.3)
  );
  
  return {
    // Primary armor
    armor: primaryArmor,
    armorName: armor.name,
    armorCore: armor.core,
    confidence: Math.round(armorConfidence),
    rationale: armorRationale,
    
    // Narratives for report generation
    starterNarrative,
    customizations,
    inRelationship: armor.inRelationship,
    repairPath: armor.inRelationship.repairPath,
    
    // Gender-specific context
    genderLens: {
      primaryShame: genderLens.primaryShame,
      coreMessage: genderLens.coreMessage,
      manifestations: genderLens.manifestations,
      culturalPressure: genderLens.culturalPressure,
      partnerExperience: genderLens.partnerExperience,
      whatTheyNeed: gender === 'M' ? genderLens.whatHeNeeds : genderLens.whatSheNeeds
    },
    
    // Shame pattern by driver
    shamePattern: {
      driver: primaryDriver,
      trigger: shamePattern.trigger,
      shameMessage: shamePattern.shameMessage,
      behavioralResponse: shamePattern.behavioralResponse,
      partnerExperience: shamePattern.partnerExperience
    },
    
    // Computed scores
    vulnerabilityCapacity,
    vulnerabilityLevel: vulnerabilityCapacity > 65 ? 'high' : vulnerabilityCapacity > 40 ? 'moderate' : 'protected',
    
    // Raw signals for debugging
    signals: {
      selfPerceptionGap: { value: selfPerceptionGap, interpretation: gapInterpretation },
      offerScore: m3OfferScore,
      wantScore: m3WantScore,
      conflictApproach,
      capacityLevel,
      primaryDriver,
      inadequacyScore,
      gottman: { criticism: criticismScore, stonewalling: stonewallingScore, contempt: contemptScore }
    },
    
    // For AI report generation
    reportContext: {
      voicePrinciples: NARRATIVE_VOICE.principles,
      forbiddenPhrases: NARRATIVE_VOICE.forbiddenPhrases,
      starter: starterNarrative,
      customizations,
      userGender: gender,
      armorCosts: armor.inRelationship.costs,
      repairPath: armor.inRelationship.repairPath,
      genderContext: genderLens
    }
  };
}

/**
 * Computes Vulnerability compatibility between two users
 * 
 * @param {Object} user1Vuln - User 1's vulnerability profile
 * @param {Object} user2Vuln - User 2's vulnerability profile
 * @returns {Object} Compatibility analysis
 */
function computeVulnerabilityCompatibility(user1Vuln, user2Vuln) {
  const a1 = user1Vuln.armor;
  const a2 = user2Vuln.armor;
  
  // Define armor compatibility dynamics
  const armorDynamics = {
    'perfectionism-perfectionism': {
      score: 55,
      dynamic: 'Two performers. You both look great on paper and neither of you is seen.',
      challenge: 'The relationship becomes a performance for an audience of two. Neither drops the mask.',
      opportunity: 'You understand the exhaustion of performing. You could agree to stopâ€”together.'
    },
    'perfectionism-numbing': {
      score: 40,
      dynamic: 'One is performing; one has checked out. Lonely for different reasons.',
      challenge: 'The perfectionist feels unseen despite their effort. The number feels judged for not matching.',
      opportunity: 'The perfectionist can learn that less is enough. The number can learn to show up more.'
    },
    'perfectionism-flooding': {
      score: 50,
      dynamic: 'One is controlled; one is intense. Oil and water, unless you find the bridge.',
      challenge: 'The perfectionist is overwhelmed by the flooder\'s intensity. The flooder feels shut out by the performance.',
      opportunity: 'The flooder can teach presence. The perfectionist can teach modulation.'
    },
    'perfectionism-control': {
      score: 45,
      dynamic: 'Two people trying to manage everything. Power struggles are likely.',
      challenge: 'Both want things done right, but "right" is defined differently. Neither yields.',
      opportunity: 'You\'re both competent. Divide domains. Let each other lead somewhere.'
    },
    'perfectionism-cynicism': {
      score: 35,
      dynamic: 'One is trying too hard; one has given up trying. Resentment builds.',
      challenge: 'The perfectionist feels judged and unappreciated. The cynic feels pressured and dismissed.',
      opportunity: 'The cynic can help the perfectionist let go. The perfectionist can help the cynic hope.'
    },
    'numbing-numbing': {
      score: 45,
      dynamic: 'Two people alone together. Peaceful, but empty.',
      challenge: 'Nothing is wrong, but nothing is alive either. You coexist without connecting.',
      opportunity: 'You both understand needing space. You could build something quiet but realâ€”if you try.'
    },
    'numbing-flooding': {
      score: 35,
      dynamic: 'One feels everything; one feels nothing. This exhausts both of you.',
      challenge: 'The flooder feels abandoned by the numb response. The number feels overwhelmed by the intensity.',
      opportunity: 'The flooder can bring the number back to life. The number can help the flooder regulate.'
    },
    'numbing-control': {
      score: 50,
      dynamic: 'One is checked out; one is managing. The controller fills the void.',
      challenge: 'The controller does everything and resents it. The number lets them and feels managed.',
      opportunity: 'Clear agreements help. The controller gets structure; the number gets space.'
    },
    'numbing-cynicism': {
      score: 40,
      dynamic: 'One has numbed out; one has given up. Low energy, low hope.',
      challenge: 'Neither is reaching for connection. The relationship can flatline without anyone noticing.',
      opportunity: 'You\'re not exhausting each other. That\'s something. Build from stability, not from passion.'
    },
    'flooding-flooding': {
      score: 55,
      dynamic: 'Two intense people. The highs are high. The lows are chaos.',
      challenge: 'When you both flood simultaneously, there\'s no one regulating. Things escalate fast.',
      opportunity: 'You get each other\'s intensity. Take turns. When one floods, the other grounds.'
    },
    'flooding-control': {
      score: 45,
      dynamic: 'One explodes; one manages. Classic pursuer-manager dynamic.',
      challenge: 'The controller feels overwhelmed and resentful. The flooder feels managed and dismissed.',
      opportunity: 'The flooder brings passion; the controller brings structure. Both are needed.'
    },
    'flooding-cynicism': {
      score: 40,
      dynamic: 'One feels too much; one has stopped feeling. Mutual frustration.',
      challenge: 'The flooder feels dismissed; the cynic feels battered by intensity.',
      opportunity: 'The flooder can crack the cynic\'s armor. The cynic can help the flooder pick battles.'
    },
    'control-control': {
      score: 40,
      dynamic: 'Two managers with one relationship. Power struggles are inevitable.',
      challenge: 'Neither yields. Everything becomes a negotiation. Exhausting.',
      opportunity: 'Divide territories. You\'re both competent. Use that instead of fighting over it.'
    },
    'control-cynicism': {
      score: 45,
      dynamic: 'One is trying to manage; one doesn\'t believe it matters. Asymmetric effort.',
      challenge: 'The controller feels unsupported. The cynic feels pressured.',
      opportunity: 'The controller can provide structure the cynic actually appreciates. The cynic can help the controller let go.'
    },
    'cynicism-cynicism': {
      score: 50,
      dynamic: 'Two people who\'ve given up on hope. Unexpectedly stable, but static.',
      challenge: 'Neither reaches for more. The relationship never grows.',
      opportunity: 'You see the world the same way. That\'s a kind of intimacy. Build from there.'
    }
  };
  
  // Get compatibility (order-independent)
  const key1 = `${a1}-${a2}`;
  const key2 = `${a2}-${a1}`;
  const dynamic = armorDynamics[key1] || armorDynamics[key2] || {
    score: 50,
    dynamic: 'Mixed armor patterns create unpredictable dynamics.',
    challenge: 'Your protective styles may clash in unexpected ways.',
    opportunity: 'Different armor means different blind spots. You can see what the other misses.'
  };
  
  // Analyze shame trigger interactions
  const shameTriggerInteraction = analyzeShameInteraction(
    user1Vuln.shamePattern,
    user2Vuln.shamePattern
  );
  
  // Vulnerability capacity gap
  const capacityGap = Math.abs(user1Vuln.vulnerabilityCapacity - user2Vuln.vulnerabilityCapacity);
  const capacityGapInterpretation = capacityGap > 30 
    ? 'significant' 
    : capacityGap > 15 
      ? 'moderate' 
      : 'aligned';
  
  return {
    score: dynamic.score,
    user1Armor: user1Vuln.armorName,
    user2Armor: user2Vuln.armorName,
    dynamic: dynamic.dynamic,
    challenge: dynamic.challenge,
    opportunity: dynamic.opportunity,
    
    // Shame trigger analysis
    shameTriggerInteraction,
    
    // Capacity comparison
    capacityComparison: {
      user1: user1Vuln.vulnerabilityCapacity,
      user2: user2Vuln.vulnerabilityCapacity,
      gap: capacityGap,
      interpretation: capacityGapInterpretation
    },
    
    // Narrative for report
    narrative: `${dynamic.dynamic} ${dynamic.challenge} ${dynamic.opportunity}`
  };
}

/**
 * Analyzes how two people's shame triggers interact
 */
function analyzeShameInteraction(shame1, shame2) {
  const d1 = shame1.driver;
  const d2 = shame2.driver;
  
  // Check for problematic pairings
  if (d1 === 'abandonment' && d2 === 'engulfment') {
    return {
      risk: 'high',
      pattern: 'Classic pursue-withdraw shame spiral',
      description: 'When they pull away (their need), it triggers your abandonment shame. When you move closer (your need), it triggers their engulfment shame. You\'re each activating the other\'s core wound.',
      guidance: 'Name this pattern explicitly. Neither of you is wrong. You have opposite needs that require choreography, not blame.'
    };
  }
  
  if (d1 === 'engulfment' && d2 === 'abandonment') {
    return {
      risk: 'high',
      pattern: 'Classic pursue-withdraw shame spiral',
      description: 'When you pull away (your need), it triggers their abandonment shame. When they move closer (their need), it triggers your engulfment shame. You\'re each activating the other\'s core wound.',
      guidance: 'Name this pattern explicitly. Neither of you is wrong. You have opposite needs that require choreography, not blame.'
    };
  }
  
  if (d1 === 'inadequacy' && d2 === 'injustice') {
    return {
      risk: 'medium-high',
      pattern: 'Collapse-blame dynamic',
      description: 'When you collapse in inadequacy, they may see it as you not fighting fair. When they dig in on injustice, you hear that you\'re failing. You end up in a loop of blame and collapse.',
      guidance: 'The inadequacy partner needs to stand their ground sometimes. The injustice partner needs to see collapse as pain, not manipulation.'
    };
  }
  
  if (d1 === d2) {
    return {
      risk: 'medium',
      pattern: 'Shared vulnerability',
      description: `You both carry ${d1} as your primary driver. You understand each other's core fearâ€”which is rare and valuable. The risk is that you might trigger each other in stereo.`,
      guidance: 'Your shared wound is a bond and a risk. When you\'re both activated, neither can hold the other. Have a plan for who grounds first.'
    };
  }
  
  return {
    risk: 'moderate',
    pattern: 'Different vulnerabilities',
    description: `Your shame triggers differ (${d1} vs ${d2}). This means you're less likely to trigger each other by accident, but you may not intuitively understand each other's pain.`,
    guidance: 'Learn each other\'s triggers explicitly. What feels like "nothing" to you might be a core wound for them.'
  };
}

// =============================================================================
// SECTION 5: TENSION STACK - ATTRACTION-ATTACHMENT (Helen Fisher)
// =============================================================================
// Source: M1 (what attracts you) + M4 (what your nervous system fears)
//
// INTRODUCTION:
// Here's the cruel joke of human wiring: what attracts you and what your
// nervous system can handle are often completely different things.
// 
// You're drawn to thrill, but your deepest fear is abandonment. So you chase
// exciting, unpredictable peopleâ€”then spend the whole relationship terrified
// they'll leave. Or you want peace, but you fear being trapped. So you choose
// stable partnersâ€”then feel suffocated by the very stability you picked.
// 
// This isn't bad luck. It's not picking the wrong people. It's a mismatch
// between your attraction system (dopamine, novelty, chemistry) and your
// attachment system (security, fear, bonding). They're running different
// programs. And you're caught in the middle.
// 
// The Attraction-Attachment stack reveals whether these systems are aligned
// or at war. If they're aligned, your attractions lead you toward what actually
// works. If they're at war, your attractions lead you toward what will hurt you.
// 
// Knowing this won't change what attracts you. But it will help you understand
// why you keep ending up in the same placeâ€”and what you might do differently.

const ATTRACTION_ATTACHMENT_CONFIG = {
  name: 'Attraction-Attachment',
  author: 'Helen Fisher',
  sources: ['M1.dimensions.lifestyle', 'M4.emotionalDrivers', 'M4.conflictApproach'],
  
  // The four attraction-attachment patterns
  patterns: {
    aligned: {
      name: 'Aligned',
      description: 'What attracts you matches what your nervous system can handle.',
      
      starters: {
        male: `You're attracted to what actually works for you. This is rarer than it sounds. Most people develop attractions that fight their attachment needs. You didn't. The woman who lights you up is also the woman who won't destabilize you. This doesn't mean no challengesâ€”it means the challenges won't be about fundamental incompatibility between what you want and what you can handle.`,
        
        female: `Your attraction and your attachment system are pulling in the same direction. You want what's actually good for you. This is a giftâ€”most people spend years attracted to what hurts them before they figure this out. Trust your instincts here. The man who excites you is also the man who can hold you. Don't let anyone tell you that's boring.`,
        
        general: `What turns you on doesn't turn against you. Your attraction patterns and your attachment needs are aligned. This creates stable desireâ€”you can want someone without that wanting becoming self-destructive. Don't take this for granted. Many people never achieve this alignment.`
      },
      
      riskLevel: 'low',
      guidance: 'Trust your attractions. They\'re pointing you toward what works.'
    },
    
    thrillAbandonmentConflict: {
      name: 'Thrill-Abandonment Conflict',
      description: 'You\'re attracted to excitement but terrified of being left.',
      
      starters: {
        male: `You're drawn to women who are excitingâ€”unpredictable, adventurous, maybe a little wild. But your deepest fear is being left. See the problem? The excitement you crave often comes packaged with instability. The woman who thrills you is often the woman who can't be pinned down. So you chase intensity, catch it, then spend all your energy trying to keep it from leaving. You're attracted to what activates your deepest wound.`,
        
        female: `You want the thrill. The butterflies. The man who makes you feel alive. But underneath that want is a terror of abandonment. So you pursue exciting menâ€”and then try to lock them down. You want the rollercoaster but you're afraid it'll throw you off. This creates exhausting relationships: you're drawn to what you can't quite hold, and you grip tighter, which pushes them away, which confirms your fear. The cycle is brutal.`,
        
        general: `Thrill and abandonment fear are at war in you. You're attracted to excitement, spontaneity, unpredictabilityâ€”but your nervous system needs to know they're not leaving. These rarely come together. Exciting people are often flight risks. Stable people often feel boring to you. You're caught between what lights you up and what lets you sleep at night.`
      },
      
      riskLevel: 'high',
      pattern: 'You chase intensity, then try to cage it. The caging kills what attracted you.',
      guidance: 'You need to either: (1) find someone exciting who has done their own attachment work, or (2) recognize that your attraction to instability is a wound, not a preference, and consciously choose differently.'
    },
    
    thrillEngulfmentConflict: {
      name: 'Thrill-Engulfment Conflict',
      description: 'You\'re attracted to excitement but fear being trapped.',
      
      starters: {
        male: `You want thrill, adventure, a woman who keeps you on your toes. But you also panic when things get too close. Your attraction pulls you in; your fear pushes you out. You pursue exciting women, then feel smothered when they actually show up. The problem isn't them. The problem is you're attracted to intensity but allergic to commitment. Every relationship becomes an approach-avoid dance.`,
        
        female: `You want excitementâ€”a man who surprises you, challenges you, keeps life interesting. But when he gets close, you feel trapped. So you pick thrilling men, let them in, then need to escape. You're not commitment-phobic, exactly. You're attracted to what you can't actually tolerate at close range. The distance is where the desire lives. The closeness is where it dies.`,
        
        general: `You want the thrill but not the bill. Excitement attracts you; commitment suffocates you. This creates a pattern of intense beginnings and claustrophobic endings. You're not brokenâ€”you're wired for contradiction. The work is learning that closeness doesn't have to mean consumption.`
      },
      
      riskLevel: 'high',
      pattern: 'You run toward intensity, then run away from intimacy. Repeat.',
      guidance: 'Your attraction to thrill isn\'t the problem. Your equation of closeness with consumption is. You need a partner who can be exciting AND give you spaceâ€”and you need to learn that space isn\'t rejection.'
    },
    
    peaceAbandonmentConflict: {
      name: 'Peace-Abandonment Conflict',
      description: 'You want stability but fear they\'ll leave.',
      
      starters: {
        male: `You're drawn to stable, grounded women. The ones who feel like home. But even in that stability, you're waiting for the other shoe to drop. You found peace, but you can't rest in it. You keep checkingâ€”is she still here? Is she still happy? Your attraction found the right thing; your nervous system won't let you enjoy it. You got what you wanted and now you're afraid to lose it.`,
        
        female: `You want a peaceful, stable man. And you probably found oneâ€”or you're looking for one. But your abandonment fear doesn't care how stable he is. You're still anxious. Still checking. Still afraid that this good thing will disappear. You chose well, but you can't stop bracing for loss. The peace you wanted is here, and you can't feel it because you're too busy protecting against its end.`,
        
        general: `You're attracted to peace but haunted by abandonment. You want the calm partner, the stable life, the quiet loveâ€”and then you worry it away. Your taste is good. Your trust is broken. You picked the right person and now you're exhausting them with reassurance-seeking. They're not leaving. But you can't believe that.`
      },
      
      riskLevel: 'medium',
      pattern: 'You found peace but can\'t rest in it. You exhaust stable partners with your need for reassurance.',
      guidance: 'Your attraction is healthy. Your attachment wound is the work. The reassurance you seek can never be enough because the fear isn\'t about themâ€”it\'s older than them. You need to heal the wound, not have them constantly bandage it.'
    },
    
    peaceEngulfmentConflict: {
      name: 'Peace-Engulfment Conflict',
      description: 'You want stability but fear being swallowed by it.',
      
      starters: {
        male: `You want peace. A grounded woman. A calm life. But when you get it, you feel trapped. The stability you craved becomes the cage you flee. You're not attracted to chaosâ€”you're just afraid that peace means disappearing. Comfort feels like quicksand. You picked the right woman and then you can't breathe. The problem isn't her. It's that you've confused safety with suffocation.`,
        
        female: `You want a peaceful life with a stable man. You chose well. But now you're restless. The peace feels like a trap. You're not bored by himâ€”you're scared that settling means losing yourself. The comfort you wanted is here, and it feels like being slowly erased. You're attracted to peace but allergic to being consumed by it.`,
        
        general: `Peace attracts you. Engulfment terrifies you. These are the same thing to your nervous system. You want stability, but stability feels like identity death. So you either sabotage good relationships or suffocate in them. The work is separating peace from consumption. They're not the same. You can be calm and still be you.`
      },
      
      riskLevel: 'medium-high',
      pattern: 'You attract what you want, then feel trapped by it. Good relationships feel like gilded cages.',
      guidance: 'Keep your life. Friends, hobbies, space. Peace doesn\'t mean merging. You can be in a stable relationship and still be a separate person. That\'s not betrayalâ€”it\'s health.'
    },
    
    thrillInadequacyConflict: {
      name: 'Thrill-Inadequacy Conflict',
      description: 'You\'re attracted to excitement but feel unworthy of it.',
      
      starters: {
        male: `You want the exciting womanâ€”the one who turns heads, who lives boldly, who makes life feel bigger. But underneath that want is a voice that says you don't deserve her. So you either don't approach, or you approach and then sabotage. You're attracted to what you feel inadequate for. The desire and the shame are fused. You want what you've already decided you can't have.`,
        
        female: `You're drawn to exciting menâ€”confident, dynamic, alive. But part of you already knows you're not enough for them. So you hold back. Or you get them and then wait to be found out. Your attraction is clear; your worthiness is in question. You want the thrill but you've pre-rejected yourself from it.`,
        
        general: `Thrill attracts you. Inadequacy undermines you. You want excitement but feel fundamentally unworthy of it. This creates either avoidance (you never pursue what you want) or self-sabotage (you get it and then destroy it before they can discover you're not enough). The attraction isn't the problem. The shame is.`
      },
      
      riskLevel: 'medium-high',
      pattern: 'You want excitement but feel you don\'t deserve it. You pre-reject yourself from what you desire.',
      guidance: 'Your attraction is pointing toward growth. The inadequacy is lying to you. You are not decided by your worst belief about yourself. But you\'ll need to act against the shame voice, not wait for it to disappear.'
    },
    
    peaceInadequacyConflict: {
      name: 'Peace-Inadequacy Conflict',
      description: 'You want stability but feel you don\'t deserve it.',
      
      starters: {
        male: `You want a peaceful life. A good woman. Something that lasts. But part of you doesn't believe you've earned it. So you either settle for less than you want, or you get the good thing and wait to be exposed as a fraud. You want peace but your inadequacy says you haven't done enough to deserve it. You're serving a sentence that was never yours to serve.`,
        
        female: `You want stability, a good man, a life that feels like home. But something in you says you don't get that. Other women maybe, but not you. So you accept less. Or you find the good thing and spend the whole time waiting to be found out. Your attraction is healthy; your self-worth is sabotaging it.`,
        
        general: `You want peace but feel you don't qualify for it. Inadequacy says you have to earn rest, and you haven't earned it yet. So you either undersell yourself in love or you achieve it and can't relax into it. You're chasing a finish line that keeps moving because the inadequacy is never satisfied.`
      },
      
      riskLevel: 'medium',
      pattern: 'You settle for less than you want, or you get it and can\'t enjoy it. Happiness feels unearned.',
      guidance: 'You don\'t have to earn peace. That\'s not how love works. The inadequacy is a lie you internalized. The work is accepting something good without needing to justify why you deserve it.'
    },
    
    thrillInjusticeConflict: {
      name: 'Thrill-Injustice Conflict',
      description: 'You\'re attracted to excitement but hypersensitive to unfairness.',
      
      starters: {
        male: `You want excitementâ€”a woman who challenges you, keeps things interesting. But your injustice driver means every slight gets logged. The exciting woman you chose doesn't play by rules, but you're keeping score. Thrill is inherently unpredictable; injustice craves fairness. You're attracted to what you'll spend the relationship prosecuting.`,
        
        female: `You're drawn to exciting menâ€”dynamic, maybe a little unpredictable. But when they're inconsistent (which exciting often is), you feel wronged. You wanted the thrill but you're billing them for every time the thrill wasn't fair. Your attraction and your accounting don't match.`,
        
        general: `Thrill attracts you. Unfairness enrages you. But thrill is often unfairâ€”it's not balanced, not predictable, not equitable. You want excitement but you can't stop tracking whether you're getting a fair deal. You're drawn to fire and then resentful that it burns.`
      },
      
      riskLevel: 'medium',
      pattern: 'You want excitement but prosecute it for inconsistency. You chose the rollercoaster and then file grievances.',
      guidance: 'Either accept that thrill is inherently unfair and stop keeping score, or choose someone more predictable and let go of the intensity fantasy. You can\'t have both.'
    },
    
    peaceInjusticeConflict: {
      name: 'Peace-Injustice Conflict',
      description: 'You want stability but see unfairness everywhere.',
      
      starters: {
        male: `You want peaceâ€”a stable woman, a calm life. But your injustice driver won't let things rest. Even in peaceful relationships, you find inequities to address. You got the calm you wanted, but you're disrupting it with every fairness audit. You want peace but you're the one disturbing it.`,
        
        female: `You want a peaceful life with a stable man. And maybe you have it. But you can't stop noticing what's unfairâ€”who did more, who sacrificed what, who's giving and who's taking. The peace you wanted is here, but you're eroding it with constant accounting. You're your own obstacle to the thing you most want.`,
        
        general: `You want peace but your injustice driver keeps disturbing it. You've created the stable life and now you're the one finding problems. The vigilance that protected you is now preventing you from resting. You want calm but you're the noise.`
      },
      
      riskLevel: 'medium',
      pattern: 'You want peace but can\'t stop auditing it. You disturb the calm you created.',
      guidance: 'Not every inequity needs to be addressed immediately. You got the peace. Now practice letting small things go. Your vigilance was adaptive once. In a safe relationship, it\'s self-sabotage.'
    }
  }
};

/**
 * Computes Attraction-Attachment alignment from module results
 * 
 * @param {M1Results} m1 - Module 1 results (what attracts them)
 * @param {M4Results} m4 - Module 4 results (their nervous system fears)
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} Attraction-attachment profile
 */
function computeAttractionAttachment(m1, m4, gender) {
  // Extract values safely
  const lifestyleDir = safeGet(m1, 'dimensions.lifestyle.direction', 'A');
  const lifestyleStrength = safeGet(m1, 'dimensions.lifestyle.strength', 50);
  const wantsThrill = lifestyleDir === 'A';
  const attractionStrength = lifestyleStrength;
  
  const primaryDriver = safeGet(m4, 'emotionalDrivers.primary', 'inadequacy');
  const driverScores = safeGet(m4, 'emotionalDrivers.scores', {});
  const primaryDriverScore = driverScores[primaryDriver] || 50;
  
  // Determine pattern based on attraction + driver combination
  let pattern;
  let alignment;
  let conflictIntensity = 0;
  
  // Check for alignment first
  // Aligned: Peace + any non-abandonment driver, or Thrill + engulfment (they can handle unpredictability)
  const thrillEngulfmentAligned = wantsThrill && primaryDriver === 'engulfment' && primaryDriverScore < 50;
  const peaceStable = !wantsThrill && primaryDriver !== 'abandonment';
  
  if (thrillEngulfmentAligned || (peaceStable && primaryDriverScore < 50)) {
    pattern = 'aligned';
    alignment = 'aligned';
    conflictIntensity = 0;
  }
  // Thrill + Abandonment = classic conflict
  else if (wantsThrill && primaryDriver === 'abandonment') {
    pattern = 'thrillAbandonmentConflict';
    alignment = 'conflicted';
    conflictIntensity = (attractionStrength + primaryDriverScore) / 2;
  }
  // Thrill + Engulfment (strong) = conflict
  else if (wantsThrill && primaryDriver === 'engulfment' && primaryDriverScore >= 50) {
    pattern = 'thrillEngulfmentConflict';
    alignment = 'conflicted';
    conflictIntensity = (attractionStrength + primaryDriverScore) / 2;
  }
  // Peace + Abandonment = conflict  
  else if (!wantsThrill && primaryDriver === 'abandonment') {
    pattern = 'peaceAbandonmentConflict';
    alignment = 'conflicted';
    conflictIntensity = primaryDriverScore * 0.7; // Less intense than thrill conflicts
  }
  // Peace + Engulfment = conflict
  else if (!wantsThrill && primaryDriver === 'engulfment') {
    pattern = 'peaceEngulfmentConflict';
    alignment = 'conflicted';
    conflictIntensity = (attractionStrength + primaryDriverScore) / 2;
  }
  // Thrill + Inadequacy = conflict
  else if (wantsThrill && primaryDriver === 'inadequacy') {
    pattern = 'thrillInadequacyConflict';
    alignment = 'conflicted';
    conflictIntensity = primaryDriverScore * 0.6;
  }
  // Peace + Inadequacy = mild conflict
  else if (!wantsThrill && primaryDriver === 'inadequacy') {
    pattern = 'peaceInadequacyConflict';
    alignment = 'mild-conflict';
    conflictIntensity = primaryDriverScore * 0.5;
  }
  // Thrill + Injustice = conflict
  else if (wantsThrill && primaryDriver === 'injustice') {
    pattern = 'thrillInjusticeConflict';
    alignment = 'conflicted';
    conflictIntensity = (attractionStrength + primaryDriverScore) / 2 * 0.8;
  }
  // Peace + Injustice = mild conflict
  else if (!wantsThrill && primaryDriver === 'injustice') {
    pattern = 'peaceInjusticeConflict';
    alignment = 'mild-conflict';
    conflictIntensity = primaryDriverScore * 0.4;
  }
  // Default fallback
  else {
    pattern = 'aligned';
    alignment = 'aligned';
    conflictIntensity = 0;
  }
  
  const patternData = ATTRACTION_ATTACHMENT_CONFIG.patterns[pattern];
  
  // Select gender-appropriate starter
  const genderKey = gender === 'M' ? 'male' : gender === 'W' ? 'female' : 'general';
  const starterNarrative = patternData.starters[genderKey] || patternData.starters.general;
  
  // Build customizations
  const customizations = [];
  
  if (alignment === 'conflicted' || alignment === 'mild-conflict') {
    customizations.push(`Your attraction to ${wantsThrill ? 'thrill and excitement' : 'peace and stability'} is running at ${attractionStrength}% strength.`);
    customizations.push(`Your ${primaryDriver} driver is at ${primaryDriverScore}%. This creates a ${Math.round(conflictIntensity)}% conflict intensity between what you want and what you can handle.`);
    
    if (patternData.pattern) {
      customizations.push(patternData.pattern);
    }
  } else {
    customizations.push(`What you're attracted to (${wantsThrill ? 'excitement' : 'stability'}) is compatible with your primary driver (${primaryDriver}). This is healthy alignment.`);
  }
  
  // Calculate alignment score (0-100, higher = more aligned)
  const alignmentScore = alignment === 'aligned' 
    ? 85 + Math.random() * 10 
    : alignment === 'mild-conflict'
      ? 60 - (conflictIntensity * 0.2)
      : 40 - (conflictIntensity * 0.3);
  
  return {
    // Core pattern
    pattern,
    patternName: patternData.name,
    patternDescription: patternData.description,
    alignment,
    
    // Scores
    alignmentScore: Math.round(Math.max(10, Math.min(95, alignmentScore))),
    conflictIntensity: Math.round(conflictIntensity),
    riskLevel: patternData.riskLevel,
    
    // Narratives
    starterNarrative,
    customizations,
    guidance: patternData.guidance,
    
    // Inputs for debugging
    inputs: {
      attraction: wantsThrill ? 'Thrill' : 'Peace',
      attractionStrength,
      primaryDriver,
      primaryDriverScore
    },
    
    // For AI report generation
    reportContext: {
      voicePrinciples: NARRATIVE_VOICE.principles,
      forbiddenPhrases: NARRATIVE_VOICE.forbiddenPhrases,
      starter: starterNarrative,
      customizations,
      guidance: patternData.guidance,
      userGender: gender
    }
  };
}

/**
 * Computes Attraction-Attachment compatibility between two users
 * 
 * @param {Object} user1AA - User 1's attraction-attachment profile
 * @param {Object} user2AA - User 2's attraction-attachment profile
 * @returns {Object} Compatibility analysis
 */
function computeAttractionAttachmentCompatibility(user1AA, user2AA) {
  const a1 = user1AA.alignment;
  const a2 = user2AA.alignment;
  const p1 = user1AA.pattern;
  const p2 = user2AA.pattern;
  
  let score;
  let dynamic;
  let challenge;
  let opportunity;
  
  // Both aligned = great
  if (a1 === 'aligned' && a2 === 'aligned') {
    score = 85;
    dynamic = 'You\'re both attracted to what works for you. No internal warfare means energy for each other.';
    challenge = 'Don\'t take this alignment for granted. External stressors can still activate old patterns.';
    opportunity = 'You can build without constantly fighting yourselves. That\'s rare.';
  }
  // One aligned, one conflicted
  else if (a1 === 'aligned' || a2 === 'aligned') {
    const conflicted = a1 !== 'aligned' ? user1AA : user2AA;
    score = 55;
    dynamic = `One of you has internal alignment; one is fighting themselves. The aligned partner may not understand the other's struggle.`;
    challenge = `The conflicted partner (${conflicted.patternName}) will sometimes act against the relationship's interest because they're acting against their own.`;
    opportunity = 'The aligned partner can model health. But they can\'t do the work for the conflicted one.';
  }
  // Same conflict pattern
  else if (p1 === p2) {
    score = 50;
    dynamic = 'You share the same attraction-attachment conflict. You understand each otherâ€”and you might enable each other.';
    challenge = 'Two people with the same wound can bond over it instead of healing it.';
    opportunity = 'Shared struggle is intimacy. If you both commit to growth, you can help each other.';
  }
  // Complementary conflicts (e.g., thrill-abandonment + peace-engulfment)
  else if (
    (p1.includes('Abandonment') && p2.includes('Engulfment')) ||
    (p1.includes('Engulfment') && p2.includes('Abandonment'))
  ) {
    score = 35;
    dynamic = 'Your conflicts interlock: one fears abandonment, one fears engulfment. This creates a painful dance.';
    challenge = 'When one moves closer, the other pulls away. You trigger each other\'s core wounds.';
    opportunity = 'If you name the pattern explicitly, you can choreograph around it. But it requires constant awareness.';
  }
  // Different conflicts, not complementary
  else {
    score = 45;
    dynamic = 'You have different attraction-attachment conflicts. You may not trigger each other directly, but you also may not understand each other.';
    challenge = 'Your struggles are different, which can create empathy gaps.';
    opportunity = 'Different wounds mean you can sometimes hold space for each other without getting activated.';
  }
  
  // Adjust score based on conflict intensities
  const avgIntensity = (user1AA.conflictIntensity + user2AA.conflictIntensity) / 2;
  score = Math.round(score - (avgIntensity * 0.15));
  score = Math.max(20, Math.min(90, score));
  
  return {
    score,
    user1Pattern: user1AA.patternName,
    user2Pattern: user2AA.patternName,
    user1Alignment: a1,
    user2Alignment: a2,
    dynamic,
    challenge,
    opportunity,
    
    // Narrative
    narrative: `${dynamic} ${challenge} ${opportunity}`
  };
}

// =============================================================================
// SECTION 6: TENSION STACK - INTIMACY-CONFLICT BRIDGE (Perel/Gottman)
// =============================================================================
// Source: M3 (intimacy type) + M4 (conflict approach, repair, capacity)
//
// INTRODUCTION:
// Some people fight TO connect. The argument is engagement. The heat is contact.
// They'd rather have a screaming match than cold distance. For them, conflict
// can actually deepen intimacyâ€”rupture and repair builds trust.
// 
// Others fight AND disconnect. Conflict is threat. The heat is damage. They
// need safety before they can be intimate again. For them, every fight creates
// distance that takes days to close.
// 
// Neither is wrong. But put them together and you have a disaster. One person
// is chasing (fighting to connect) while the other is fleeing (protecting
// intimacy from conflict). They're both trying to get closer. They're both
// making it worse.
// 
// The Intimacy-Conflict Bridge reveals your pattern. Do you fight through to
// intimacy or protect intimacy from fighting? Do you pursue conflict but lack
// the capacity to hold it? Do you avoid conflict but want the intimacy that
// comes from working through things together?
// 
// This is one of the most predictive patterns for long-term relationship
// success. Get this wrong and you'll exhaust each other. Get it rightâ€”or
// learn to choreograph your differencesâ€”and you can last.

const INTIMACY_CONFLICT_BRIDGE_CONFIG = {
  name: 'Intimacy-Conflict Bridge',
  authors: ['Esther Perel', 'John Gottman'],
  sources: ['M3.contextSwitchingType', 'M4.conflictApproach', 'M4.repairRecovery', 'M4.emotionalCapacity'],
  
  // Bridge patterns
  bridgePatterns: {
    generativeEngagement: {
      name: 'Generative Engagement',
      description: 'Conflict deepens intimacy. Fighting is a form of connection.',
      
      // Detection: High intimacy capacity (Type 1 or 2) + Pursue approach + Quick repair
      detection: 'M3 Type 1 or 2 + Pursue + Quick repair',
      
      starters: {
        male: `For you, fighting is engaging. Not pleasant, but alive. You'd rather have a heated argument than cold silence. Conflict means you're still in it togetherâ€”still caring enough to clash. The danger isn't the fighting; it's if she stops fighting back. That's when you know she's checked out. Your repair is quick because you can't stand the distance. You fight, you make up, you're closer than before. That's your pattern.`,
        
        female: `You fight to connect, not to win. The conflict itself is intimacyâ€”it means you're still invested, still showing up, still engaged. Cold politeness terrifies you more than heated argument. When you fight with him and then repair, you feel closer. The rupture and repair cycle is how you build trust. You know you can survive conflict together, and that knowledge is safety.`,
        
        general: `Conflict, for you, is a form of contact. You'd rather fight than feel the distance of avoidance. Your pattern is: engage, clash, repair, grow closer. This works when your partner shares this pattern. It fails when they experience conflict as damage rather than connection.`
      },
      
      riskLevel: 'low',
      withSameType: 'Two generative engagers can fight passionately and repair quickly. High intensity, high intimacy. Just watch for escalation without resolution.',
      withOpposite: 'If your partner experiences conflict as damage, your "engaging" feels like attacking. You need to understand that their withdrawal isn\'t rejectionâ€”it\'s protection.'
    },
    
    protectedIntimacy: {
      name: 'Protected Intimacy',
      description: 'Conflict threatens intimacy. Connection requires safety from fighting.',
      
      // Detection: Type 3 or 4 + Withdraw + Slow repair
      detection: 'M3 Type 3 or 4 + Withdraw + Slow repair',
      
      starters: {
        male: `Conflict doesn't feel like connection to youâ€”it feels like threat. When things get heated, something in you shuts down. Not because you don't care, but because you care too much to risk saying something you can't take back. You need space to process. You need time before you can repair. Rushing back into it before you're ready makes everything worse. Your intimacy lives in the calm, not the storm.`,
        
        female: `Fighting doesn't bring you closerâ€”it creates distance you then have to overcome. You'd rather avoid the conflict altogether than go through the rupture-repair cycle. When he raises his voice, something in you closes. You need to feel safe before you can be intimate again. Quick repair feels forced; you need time to trust again. Your intimacy is protected, not performed.`,
        
        general: `Conflict is a threat to your intimacy, not a path to it. You need to recover before you can reconnect. Fighting doesn't clear the air for youâ€”it fills it with smoke you have to wait to clear. Partners who want to "talk it out" right now don't understand that you can't access intimacy when your system is activated.`
      },
      
      riskLevel: 'low-medium',
      withSameType: 'Two protected-intimacy people may avoid conflict entirely. Peaceful, but issues go unaddressed. You\'ll need structured ways to surface problems without activating threat responses.',
      withOpposite: 'If your partner fights to connect, your withdrawal feels like abandonment to them. You need to communicate that you\'re coming backâ€”just not yet.'
    },
    
    conflictedBridge: {
      name: 'Conflicted Bridge',
      description: 'You pursue conflict but can\'t handle the intimacy it creates.',
      
      // Detection: Pursue approach + Low capacity OR Type 4
      detection: 'Pursue + Low emotional capacity OR Pursue + Type 4',
      
      starters: {
        male: `You move toward conflictâ€”you pursue it, engage it, insist on addressing it. But once you're in it, you can't hold it. You start the fight but you can't finish it well. You want resolution but your capacity gets overwhelmed before you get there. You open doors you can't walk through. This creates a pattern: initiate, escalate, flood, regret.`,
        
        female: `You engage conflict directly. You're not afraid to bring things up, to push for resolution. But your emotional capacity doesn't match your courage. You start conversations you can't sustain. The intimacy that conflict could create gets burned by the intensity you can't regulate. You want the connection that comes afterâ€”but you keep blowing up the bridge to get there.`,
        
        general: `Your approach says "let's deal with this" but your capacity says "I can't hold this much." You pursue conflict but can't metabolize it. This creates cycles of engagement and overwhelm. The work isn't to stop engagingâ€”it's to build capacity, or to engage in smaller doses.`
      },
      
      riskLevel: 'medium-high',
      withSameType: 'Two conflicted-bridge people will escalate quickly and burn out fast. Lots of heat, little resolution.',
      withOpposite: 'You need a partner with higher capacity who can hold the space you open. Or you need to learn to open smaller spaces.'
    },
    
    avoidantBridge: {
      name: 'Avoidant Bridge',
      description: 'You avoid conflict but need the intimacy it could create.',
      
      // Detection: Withdraw approach + High intimacy want (Type 1 or 2) + Slow repair
      detection: 'Withdraw + Type 1 or 2 + Slow repair',
      
      starters: {
        male: `You want deep intimacyâ€”real connection, real knowing. But you avoid the conflict that would get you there. You withdraw when things get heated, even though you want to be closer. The intimacy you crave requires vulnerability you're protecting. You want her to know you, but you won't fight for it. You're waiting for connection without rupture, and that's not how it works.`,
        
        female: `You want to be deeply known. But when conflict arisesâ€”the very thing that could deepen intimacyâ€”you pull back. You protect yourself from the rupture that precedes repair. You want the closeness but you won't risk the fight. So you stay in safe shallows, wanting depth but unwilling to dive. The intimacy you want is on the other side of conflict you avoid.`,
        
        general: `You want intimacy but avoid the conflict that creates it. Withdrawal protects you from rupture, but rupture-and-repair is how trust deepens. You're staying safe in ways that keep you distant. The connection you want requires engaging the very thing you avoid.`
      },
      
      riskLevel: 'medium',
      withSameType: 'Two avoidant-bridge people will be comfortable but shallow. The intimacy you both want stays out of reach because neither will fight for it.',
      withOpposite: 'A generative engager might be able to draw you outâ€”if they\'re patient. But if they push too hard, you\'ll retreat further.'
    },
    
    paradoxicalBridge: {
      name: 'Paradoxical Bridge',
      description: 'Your intimacy and conflict patterns directly contradict.',
      
      // Detection: Type 1 (high want, high offer) + Withdraw + Slow repair
      detection: 'Type 1 + Withdraw approach',
      
      starters: {
        male: `You want full intimacyâ€”nothing held back, complete access. But when conflict comes, you disappear. You're asking for everything and then withdrawing when things get hard. This confuses partners. You're saying "I want all of you" and then "I need space" in the same breath. The intimacy you want requires presence in conflict. You can't have one without the other.`,
        
        female: `You offer everything and want everything in return. Deep intimacy, full presence. But conflict sends you running. You want the depth without the difficulty. You're asking him to be fully vulnerable while you protect yourself when things get heated. This isn't sustainable. Real intimacy includes conflict. You can't have the first without engaging the second.`,
        
        general: `Your intimacy appetite and conflict style are at war. You want maximum closeness but flee from the fights that create it. Partners experience this as: "You want everything from me but won't stay when it's hard." The paradox exhausts relationships. Something has to give: either you learn to stay in conflict, or you accept less intimacy than you want.`
      },
      
      riskLevel: 'high',
      withSameType: 'Two paradoxical-bridge people will have intense honeymoons and confusing conflicts. Lots of closeness until things get hard, then mutual retreat.',
      withOpposite: 'Anyone who partners with you will feel the inconsistency. You need to close the gap between what you want and how you show up.'
    }
  }
};

/**
 * Computes Intimacy-Conflict Bridge from module results
 * 
 * @param {M3Results} m3 - Module 3 results (intimacy type)
 * @param {M4Results} m4 - Module 4 results (conflict patterns)
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} Intimacy-conflict bridge profile
 */
function computeIntimacyConflictBridge(m3, m4, gender) {
  // Extract values safely
  const m3Type = safeGet(m3, 'contextSwitchingType', 2);
  const wantScore = safeGet(m3, 'wantScore', 50);
  const offerScore = safeGet(m3, 'offerScore', 50);
  
  const conflictApproach = safeGet(m4, 'conflictApproach.approach', 'pursue');
  const conflictIntensity = safeGet(m4, 'conflictApproach.intensity', 25);
  const repairSpeed = safeGet(m4, 'repairRecovery.speed.style', 'quick');
  const capacityLevel = safeGet(m4, 'emotionalCapacity.level', 'medium');
  const capacityScore = safeGet(m4, 'emotionalCapacity.score', 50);
  
  const isPursuer = conflictApproach === 'pursue';
  const isWithdrawer = conflictApproach === 'withdraw';
  const quickRepair = repairSpeed === 'quick';
  const slowRepair = repairSpeed === 'slow';
  const lowCapacity = capacityLevel === 'low';
  const highCapacity = capacityLevel === 'high';
  const highIntimacyType = m3Type === 1 || m3Type === 2;
  const lowIntimacyType = m3Type === 3 || m3Type === 4;
  
  // Determine bridge pattern
  let pattern;
  let rationale = [];
  
  // Paradoxical: Type 1 (wants and offers everything) + Withdraw
  if (m3Type === 1 && isWithdrawer) {
    pattern = 'paradoxicalBridge';
    rationale.push('High intimacy appetite (Type 1) contradicts withdraw conflict style');
  }
  // Generative Engagement: High intimacy type + Pursue + Quick repair
  else if (highIntimacyType && isPursuer && quickRepair && !lowCapacity) {
    pattern = 'generativeEngagement';
    rationale.push('Pursue approach with quick repair and capacity to hold it');
    rationale.push(`Type ${m3Type} indicates comfort with intimacy intensity`);
  }
  // Protected Intimacy: Low intimacy type + Withdraw + Slow repair
  else if (lowIntimacyType && isWithdrawer && slowRepair) {
    pattern = 'protectedIntimacy';
    rationale.push('Withdraw approach with slow repair');
    rationale.push(`Type ${m3Type} indicates preference for protected intimacy`);
  }
  // Conflicted Bridge: Pursue + Low capacity
  else if (isPursuer && lowCapacity) {
    pattern = 'conflictedBridge';
    rationale.push('Pursue approach but low capacity to sustain it');
  }
  // Conflicted Bridge: Pursue + Type 4 (low want, low offer)
  else if (isPursuer && m3Type === 4) {
    pattern = 'conflictedBridge';
    rationale.push('Pursue conflict but low intimacy investment (Type 4)');
  }
  // Avoidant Bridge: Withdraw + High intimacy type
  else if (isWithdrawer && highIntimacyType && slowRepair) {
    pattern = 'avoidantBridge';
    rationale.push('Want intimacy but withdraw from conflict that creates it');
  }
  // Default: Evaluate based on approach and repair
  else if (isPursuer && quickRepair) {
    pattern = 'generativeEngagement';
    rationale.push('Default: Pursue + quick repair suggests generative pattern');
  }
  else if (isWithdrawer && slowRepair) {
    pattern = 'protectedIntimacy';
    rationale.push('Default: Withdraw + slow repair suggests protected pattern');
  }
  // Mixed patterns
  else if (isPursuer && slowRepair) {
    pattern = 'conflictedBridge';
    rationale.push('Pursue but slow to repairâ€”opens conflicts without closing them');
  }
  else if (isWithdrawer && quickRepair) {
    pattern = 'avoidantBridge';
    rationale.push('Withdraw but want quick resolutionâ€”avoidant with reconnection need');
  }
  else {
    pattern = 'protectedIntimacy';
    rationale.push('Default pattern based on mixed signals');
  }
  
  const patternData = INTIMACY_CONFLICT_BRIDGE_CONFIG.bridgePatterns[pattern];
  
  // Select gender-appropriate starter
  const genderKey = gender === 'M' ? 'male' : gender === 'W' ? 'female' : 'general';
  const starterNarrative = patternData.starters[genderKey] || patternData.starters.general;
  
  // Build customizations
  const customizations = [];
  
  customizations.push(`Your intimacy type is ${m3Type} (Want: ${wantScore}/100, Offer: ${offerScore}/100).`);
  customizations.push(`Your conflict approach is ${conflictApproach} with ${conflictIntensity}% intensity.`);
  customizations.push(`Your repair speed is ${repairSpeed}. Your emotional capacity is ${capacityLevel}.`);
  
  if (pattern === 'paradoxicalBridge') {
    customizations.push('This combination creates confusion for partners: you want everything but disappear when it gets hard.');
  }
  
  // Calculate bridge health score (0-100)
  // Higher = healthier relationship between intimacy and conflict
  let bridgeHealth;
  if (pattern === 'generativeEngagement') {
    bridgeHealth = 75 + (capacityScore * 0.2);
  } else if (pattern === 'protectedIntimacy') {
    bridgeHealth = 65 + (capacityScore * 0.15);
  } else if (pattern === 'avoidantBridge') {
    bridgeHealth = 45 + (wantScore * 0.1);
  } else if (pattern === 'conflictedBridge') {
    bridgeHealth = 35 + (capacityScore * 0.2);
  } else if (pattern === 'paradoxicalBridge') {
    bridgeHealth = 25 + (capacityScore * 0.1);
  } else {
    bridgeHealth = 50;
  }
  
  return {
    // Core pattern
    pattern,
    patternName: patternData.name,
    patternDescription: patternData.description,
    riskLevel: patternData.riskLevel,
    
    // Scores
    bridgeHealth: Math.round(Math.max(15, Math.min(95, bridgeHealth))),
    rationale,
    
    // Narratives
    starterNarrative,
    customizations,
    withSameType: patternData.withSameType,
    withOpposite: patternData.withOpposite,
    
    // Inputs for debugging
    inputs: {
      m3Type,
      wantScore,
      offerScore,
      conflictApproach,
      conflictIntensity,
      repairSpeed,
      capacityLevel
    },
    
    // For AI report generation
    reportContext: {
      voicePrinciples: NARRATIVE_VOICE.principles,
      forbiddenPhrases: NARRATIVE_VOICE.forbiddenPhrases,
      starter: starterNarrative,
      customizations,
      userGender: gender
    }
  };
}

// =============================================================================
// SECTION 7: TENSION STACK - INTERNAL CONFLICT COHERENCE (Gottman)
// =============================================================================
// Source: M4 internal (checking all M4 components against each other)
//
// INTRODUCTION:
// Before you can fight well with a partner, you have to stop fighting yourself.
// 
// Internal coherence means your conflict patterns work together. You pursue
// conflict and you have the capacity to hold it. You withdraw to regulate and
// you repair slowly because that's your rhythm. Your parts are aligned.
// 
// Internal incoherence means your patterns contradict. You pursue conflict but
// fear engulfmentâ€”so you chase intimacy and then feel trapped. You withdraw
// but fear abandonmentâ€”so you leave and then panic about being left. You're
// your own obstacle.
// 
// This matters because incoherence is exhausting. You're fighting yourself
// while trying to work things out with your partner. You're giving mixed
// signals because you ARE mixed. They can't figure out what you want because
// you want contradictory things.
// 
// The Internal Conflict Coherence stack reveals where your patterns align and
// where they contradict. It won't fix the contradictionsâ€”but it will name them.
// And naming them is the first step to stop being whiplashed by your own wiring.

const INTERNAL_CONFLICT_COHERENCE_CONFIG = {
  name: 'Internal Conflict Coherence',
  author: 'John Gottman',
  sources: ['M4.conflictApproach', 'M4.emotionalDrivers', 'M4.repairRecovery', 'M4.gottmanScreener'],
  
  // Incoherence patterns
  incoherencePatterns: {
    pursueEngulfment: {
      name: 'Pursue + Engulfment',
      description: 'You move toward but need space.',
      severity: 'high',
      
      explanation: `You pursue conflictâ€”you move toward, engage, insist on resolution. But your primary driver is engulfmentâ€”you fear being consumed, controlled, trapped. This is incoherent. You're running toward the very thing that will make you feel trapped. When you pursue, you create the closeness you'll then need to escape.`,
      
      behavioral: 'You start fights, then feel suffocated by the intensity you created. You demand engagement, then need to retreat. Your partner is whiplashed.',
      
      resolution: 'You need to pursue less intensely, or accept that pursuit will activate your engulfment fear. Smaller engagements. More space built in. Don\'t start what you can\'t finish.'
    },
    
    withdrawAbandonment: {
      name: 'Withdraw + Abandonment',
      description: 'You leave but fear being left.',
      severity: 'high',
      
      explanation: `You withdraw from conflictâ€”you need space, you shut down, you leave. But your primary driver is abandonmentâ€”you're terrified of being left. This is incoherent. You're creating the very distance you fear. When you withdraw, you trigger your partner's pursuit, which feels like chasing, which makes you withdraw more.`,
      
      behavioral: `You leave the room, then check if they're still there. You create distance, then panic about the gap. You're abandoning while fearing abandonment.`,
      
      resolution: 'You need to communicate that withdrawal isn\'t leavingâ€”it\'s regulating. Tell them you\'re coming back. Give a timeline. Don\'t just disappear and then resent them for not waiting.'
    },
    
    quickRepairWithdraw: {
      name: 'Quick Repair + Withdraw',
      description: 'You want fast resolution but need space first.',
      severity: 'medium',
      
      explanation: `Your repair style is quickâ€”you want to resolve things fast, move on, restore connection. But your conflict approach is withdrawâ€”you need space before you can engage. These timings don't work together. You withdraw (need space) but then feel urgency to repair (want resolution). You're fighting your own rhythm.`,
      
      behavioral: `You leave to calm down, then feel anxious about the unresolved conflict. You want space AND want it to be over. You're rushing yourself.`,
      
      resolution: 'Give yourself permission to have slow repair. Your withdrawal isn\'t wrong; your expectation of quick resolution is. Match your repair timeline to your processing speed.'
    },
    
    slowRepairPursue: {
      name: 'Slow Repair + Pursue',
      description: 'You engage immediately but need time to recover.',
      severity: 'medium',
      
      explanation: `You pursue conflictâ€”you engage, address, don't let things slide. But your repair is slowâ€”you need time to come back after conflict. This creates a painful pattern: you engage fully, but then you're not ready to reconnect. Your partner thinks you're still angry when you're actually recovering.`,
      
      behavioral: `You have the fight, then go quiet. Not stonewallingâ€”processing. But your partner doesn't know the difference. They think you're still in it when you're just slow to return.`,
      
      resolution: 'Communicate your repair timeline. "I need to have this conversation, but I\'ll need time afterward to settle." Let them know the silence is recovery, not rejection.'
    },
    
    lowCapacityPursue: {
      name: 'Low Capacity + Pursue',
      description: 'You engage conflict but can\'t hold it.',
      severity: 'medium-high',
      
      explanation: `You pursue conflictâ€”you don't avoid, you engage. But your emotional capacity is lowâ€”you can't hold intensity for long before you're overwhelmed. You're starting conflicts your system can't sustain. You open the pressure valve but can't handle what comes out.`,
      
      behavioral: `You bring things up, then flood. You start the conversation, then shut down mid-way. You create intensity you can't manage.`,
      
      resolution: 'Either build capacity (therapy, practice, regulation skills) or pursue smaller. Don\'t open everything at once. One issue at a time. Stop before flooding.'
    },
    
    highCapacityAvoid: {
      name: 'High Capacity + Withdraw',
      description: 'You could hold conflict but choose not to engage.',
      severity: 'low',
      
      explanation: `You have high emotional capacityâ€”you could hold intensity, stay in difficult conversations, weather the storm. But you withdraw anyway. You're choosing not to use what you have. This might be wisdom (picking battles) or avoidance (using capacity as excuse to not engage).`,
      
      behavioral: `You could handle the conflict but you don't. Partners might feel you're holding back, that there's more there you won't bring.`,
      
      resolution: 'Examine why you withdraw when you could engage. Is it choice or habit? Sometimes withdrawal is wise. Sometimes it\'s hiding. Know which one you\'re doing.'
    },
    
    criticismInadequacy: {
      name: 'Criticism Pattern + Inadequacy Driver',
      description: 'You criticize but collapse under criticism.',
      severity: 'medium-high',
      
      explanation: `Your Gottman profile shows criticism as a patternâ€”you attack character, point out flaws, generalize negatively. But your primary driver is inadequacyâ€”you can't handle criticism yourself. You dish what you can't take. This is often projection: the flaws you attack in others are the ones you fear in yourself.`,
      
      behavioral: `You criticize your partner freely, then crumble when they respond in kind. You set rules for them that you don't follow. This builds resentment fast.`,
      
      resolution: 'The criticism you give is the criticism you fear receiving. Start there. What are you seeing in them that you can\'t face in yourself? And stop giving what you can\'t take.'
    },
    
    stonewallingPursue: {
      name: 'Stonewalling Pattern + Pursue Approach',
      description: 'You pursue but shut down under intensity.',
      severity: 'high',
      
      explanation: `You pursue conflictâ€”you move toward, engage, don't let things slide. But you also stonewallâ€”you shut down completely when things get too intense. You're both the gas and the brake. You accelerate toward conflict, then slam the brakes when you get there. This is disorienting for partners.`,
      
      behavioral: `You insist on having the conversation, then go blank in the middle of it. You demand engagement, then become unreachable. Your partner never knows which version they're getting.`,
      
      resolution: 'Your stonewalling isn\'t characterâ€”it\'s physiology. Your heart rate crosses 100 BPM and your brain goes offline. You need to recognize the signs before you hit the wall. Pursue smaller, or build in breaks before you freeze.'
    }
  },
  
  // Coherence patterns (healthy alignments)
  coherencePatterns: {
    pursueQuickHighCapacity: {
      name: 'Pursue + Quick Repair + High Capacity',
      description: 'Fully engaged conflict style that resolves efficiently.',
      health: 'high',
      note: 'You engage conflict directly, can hold the intensity, and repair quickly. This is effective if not over-used.'
    },
    
    withdrawSlowProtected: {
      name: 'Withdraw + Slow Repair + Low Capacity',
      description: 'Protective conflict style with matching repair timeline.',
      health: 'medium',
      note: 'You withdraw because you need to, repair slowly because that\'s your rhythm. Coherent, but issues may go unaddressed.'
    },
    
    matchedDriverApproach: {
      name: 'Driver-Approach Alignment',
      description: 'Your approach matches your primary fear.',
      health: 'high',
      note: 'Abandonment + Pursue = makes sense (you move toward to prevent leaving). Engulfment + Withdraw = makes sense (you create space to prevent suffocation).'
    }
  }
};

/**
 * Computes Internal Conflict Coherence from M4 results
 * 
 * @param {M4Results} m4 - Module 4 results
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} Internal coherence profile
 */
function computeInternalConflictCoherence(m4, gender) {
  // Extract all M4 signals
  const conflictApproach = safeGet(m4, 'conflictApproach.approach', 'pursue');
  const conflictIntensity = safeGet(m4, 'conflictApproach.intensity', 25);
  const primaryDriver = safeGet(m4, 'emotionalDrivers.primary', 'inadequacy');
  const driverScores = safeGet(m4, 'emotionalDrivers.scores', {});
  const primaryDriverScore = driverScores[primaryDriver] || 50;
  
  const repairSpeed = safeGet(m4, 'repairRecovery.speed.style', 'quick');
  const repairMode = safeGet(m4, 'repairRecovery.mode.style', 'verbal');
  const capacityLevel = safeGet(m4, 'emotionalCapacity.level', 'medium');
  const capacityScore = safeGet(m4, 'emotionalCapacity.score', 50);
  
  const criticismScore = safeGet(m4, 'gottmanScreener.horsemen.criticism.score', 8);
  const stonewallingScore = safeGet(m4, 'gottmanScreener.horsemen.stonewalling.score', 8);
  const primaryHorseman = safeGet(m4, 'gottmanScreener.primary', 'criticism');
  
  const isPursuer = conflictApproach === 'pursue';
  const isWithdrawer = conflictApproach === 'withdraw';
  const quickRepair = repairSpeed === 'quick';
  const slowRepair = repairSpeed === 'slow';
  const lowCapacity = capacityLevel === 'low';
  const highCapacity = capacityLevel === 'high';
  const highStonewalling = stonewallingScore > 12;
  const highCriticism = criticismScore > 12;
  
  // Find all incoherences
  const incoherences = [];
  let totalSeverity = 0;
  
  // Check Pursue + Engulfment
  if (isPursuer && primaryDriver === 'engulfment' && primaryDriverScore > 50) {
    const pattern = INTERNAL_CONFLICT_COHERENCE_CONFIG.incoherencePatterns.pursueEngulfment;
    incoherences.push({
      type: 'pursueEngulfment',
      name: pattern.name,
      severity: pattern.severity,
      explanation: pattern.explanation,
      behavioral: pattern.behavioral,
      resolution: pattern.resolution
    });
    totalSeverity += 3;
  }
  
  // Check Withdraw + Abandonment
  if (isWithdrawer && primaryDriver === 'abandonment' && primaryDriverScore > 50) {
    const pattern = INTERNAL_CONFLICT_COHERENCE_CONFIG.incoherencePatterns.withdrawAbandonment;
    incoherences.push({
      type: 'withdrawAbandonment',
      name: pattern.name,
      severity: pattern.severity,
      explanation: pattern.explanation,
      behavioral: pattern.behavioral,
      resolution: pattern.resolution
    });
    totalSeverity += 3;
  }
  
  // Check Quick Repair + Withdraw
  if (quickRepair && isWithdrawer && conflictIntensity > 30) {
    const pattern = INTERNAL_CONFLICT_COHERENCE_CONFIG.incoherencePatterns.quickRepairWithdraw;
    incoherences.push({
      type: 'quickRepairWithdraw',
      name: pattern.name,
      severity: pattern.severity,
      explanation: pattern.explanation,
      behavioral: pattern.behavioral,
      resolution: pattern.resolution
    });
    totalSeverity += 2;
  }
  
  // Check Slow Repair + Pursue
  if (slowRepair && isPursuer && conflictIntensity > 30) {
    const pattern = INTERNAL_CONFLICT_COHERENCE_CONFIG.incoherencePatterns.slowRepairPursue;
    incoherences.push({
      type: 'slowRepairPursue',
      name: pattern.name,
      severity: pattern.severity,
      explanation: pattern.explanation,
      behavioral: pattern.behavioral,
      resolution: pattern.resolution
    });
    totalSeverity += 2;
  }
  
  // Check Low Capacity + Pursue
  if (lowCapacity && isPursuer) {
    const pattern = INTERNAL_CONFLICT_COHERENCE_CONFIG.incoherencePatterns.lowCapacityPursue;
    incoherences.push({
      type: 'lowCapacityPursue',
      name: pattern.name,
      severity: pattern.severity,
      explanation: pattern.explanation,
      behavioral: pattern.behavioral,
      resolution: pattern.resolution
    });
    totalSeverity += 2.5;
  }
  
  // Check High Capacity + Withdraw (not really incoherence, but worth noting)
  if (highCapacity && isWithdrawer && conflictIntensity > 35) {
    const pattern = INTERNAL_CONFLICT_COHERENCE_CONFIG.incoherencePatterns.highCapacityAvoid;
    incoherences.push({
      type: 'highCapacityAvoid',
      name: pattern.name,
      severity: pattern.severity,
      explanation: pattern.explanation,
      behavioral: pattern.behavioral,
      resolution: pattern.resolution
    });
    totalSeverity += 1;
  }
  
  // Check Criticism + Inadequacy
  if (highCriticism && primaryDriver === 'inadequacy' && primaryDriverScore > 50) {
    const pattern = INTERNAL_CONFLICT_COHERENCE_CONFIG.incoherencePatterns.criticismInadequacy;
    incoherences.push({
      type: 'criticismInadequacy',
      name: pattern.name,
      severity: pattern.severity,
      explanation: pattern.explanation,
      behavioral: pattern.behavioral,
      resolution: pattern.resolution
    });
    totalSeverity += 2.5;
  }
  
  // Check Stonewalling + Pursue
  if (highStonewalling && isPursuer) {
    const pattern = INTERNAL_CONFLICT_COHERENCE_CONFIG.incoherencePatterns.stonewallingPursue;
    incoherences.push({
      type: 'stonewallingPursue',
      name: pattern.name,
      severity: pattern.severity,
      explanation: pattern.explanation,
      behavioral: pattern.behavioral,
      resolution: pattern.resolution
    });
    totalSeverity += 3;
  }
  
  // Calculate coherence score (0-100, higher = more coherent)
  const maxPossibleSeverity = 15; // If they had ALL incoherences
  const coherenceScore = Math.round(100 - (totalSeverity / maxPossibleSeverity * 100));
  
  // Identify coherences (healthy alignments)
  const coherences = [];
  
  // Pursue + Quick + High Capacity = coherent
  if (isPursuer && quickRepair && highCapacity) {
    coherences.push(INTERNAL_CONFLICT_COHERENCE_CONFIG.coherencePatterns.pursueQuickHighCapacity);
  }
  
  // Withdraw + Slow + Low Capacity = coherent
  if (isWithdrawer && slowRepair && lowCapacity) {
    coherences.push(INTERNAL_CONFLICT_COHERENCE_CONFIG.coherencePatterns.withdrawSlowProtected);
  }
  
  // Driver-approach alignment
  const driverApproachAligned = 
    (primaryDriver === 'abandonment' && isPursuer) || 
    (primaryDriver === 'engulfment' && isWithdrawer) ||
    (primaryDriver === 'injustice' && isPursuer) ||
    (primaryDriver === 'inadequacy' && isWithdrawer);
  
  if (driverApproachAligned) {
    coherences.push({
      ...INTERNAL_CONFLICT_COHERENCE_CONFIG.coherencePatterns.matchedDriverApproach,
      specific: `Your ${primaryDriver} driver aligns with your ${conflictApproach} approach.`
    });
  }
  
  // Determine overall interpretation
  let interpretation;
  let summary;
  
  if (incoherences.length === 0) {
    interpretation = 'coherent';
    summary = 'Your conflict patterns work together. Your approach, driver, repair style, and capacity are aligned. This doesn\'t mean conflict is easyâ€”it means you\'re not fighting yourself while fighting with your partner.';
  } else if (totalSeverity <= 2) {
    interpretation = 'mostly-coherent';
    summary = `You have minor internal friction in your conflict patterns. ${incoherences[0].name} creates some inconsistency, but it's manageable with awareness.`;
  } else if (totalSeverity <= 5) {
    interpretation = 'mixed';
    summary = `You have meaningful incoherences in your conflict patterns. These create internal friction that shows up in relationships. ${incoherences.map(i => i.name).join(' and ')} mean you're often fighting yourself while fighting with your partner.`;
  } else {
    interpretation = 'incoherent';
    summary = `Your conflict patterns are at war with each other. You pursue what you flee from, or flee what you need. This exhausts you and confuses partners. The work isn't just about conflict skillsâ€”it's about aligning your patterns so you're not your own obstacle.`;
  }
  
  return {
    // Core assessment
    coherenceScore,
    interpretation,
    summary,
    
    // Detailed patterns
    incoherences,
    coherences,
    incoherenceCount: incoherences.length,
    coherenceCount: coherences.length,
    
    // Primary issue (if any)
    primaryIncoherence: incoherences.length > 0 ? incoherences[0] : null,
    
    // Inputs for debugging
    inputs: {
      conflictApproach,
      conflictIntensity,
      primaryDriver,
      primaryDriverScore,
      repairSpeed,
      capacityLevel,
      criticismScore,
      stonewallingScore
    },
    
    // For AI report generation
    reportContext: {
      voicePrinciples: NARRATIVE_VOICE.principles,
      forbiddenPhrases: NARRATIVE_VOICE.forbiddenPhrases,
      summary,
      incoherences: incoherences.map(i => ({
        name: i.name,
        explanation: i.explanation,
        resolution: i.resolution
      })),
      coherences: coherences.map(c => c.note || c.specific),
      userGender: gender
    }
  };
}

/**
 * Computes compatibility based on internal coherence
 * 
 * @param {Object} user1Coherence - User 1's coherence profile
 * @param {Object} user2Coherence - User 2's coherence profile
 * @returns {Object} Coherence compatibility analysis
 */
function computeCoherenceCompatibility(user1Coherence, user2Coherence) {
  const c1 = user1Coherence.coherenceScore;
  const c2 = user2Coherence.coherenceScore;
  const avgCoherence = (c1 + c2) / 2;
  
  let score;
  let dynamic;
  let challenge;
  let opportunity;
  
  // Both highly coherent
  if (c1 >= 70 && c2 >= 70) {
    score = 80;
    dynamic = 'Both of you have internally coherent conflict patterns. You\'re not fighting yourselves, so you can actually address issues together.';
    challenge = 'Coherent doesn\'t mean compatible. Your patterns are aligned internally but might clash with each other.';
    opportunity = 'When neither person is at war with themselves, more energy goes into the relationship.';
  }
  // One coherent, one not
  else if ((c1 >= 70 && c2 < 50) || (c2 >= 70 && c1 < 50)) {
    const coherent = c1 >= 70 ? 'you' : 'they';
    const incoherent = c1 < 50 ? 'you' : 'they';
    score = 50;
    dynamic = `One of you (${coherent}) has coherent patterns. The other (${incoherent}) is fighting internal contradictions.`;
    challenge = `The coherent partner may not understand why the incoherent one seems to sabotage themselves.`;
    opportunity = 'The coherent partner can model integration. But they can\'t do the internal work for the other.';
  }
  // Both incoherent
  else if (c1 < 50 && c2 < 50) {
    score = 35;
    dynamic = 'Both of you have internal contradictions in your conflict patterns. You\'re each fighting yourselves while trying to work things out together.';
    challenge = 'Four patterns at war: yours with yourself, theirs with themselves, and both of you with each other. Exhausting.';
    opportunity = 'You understand internal struggle. That\'s empathy. Use it. But don\'t use shared dysfunction as an excuse to not grow.';
  }
  // Mixed
  else {
    score = 55;
    dynamic = 'You have moderate internal coherence. Some patterns align, others conflict.';
    challenge = 'Partial coherence means partial predictability. Sometimes you\'ll show up consistently; sometimes you won\'t.';
    opportunity = 'Identify which patterns are coherent and lean on those. Know where your contradictions live.';
  }
  
  // Check for specific problematic combinations
  const user1Incoherences = user1Coherence.incoherences.map(i => i.type);
  const user2Incoherences = user2Coherence.incoherences.map(i => i.type);
  
  // Both have withdraw-abandonment = trouble
  if (user1Incoherences.includes('withdrawAbandonment') && user2Incoherences.includes('withdrawAbandonment')) {
    score -= 15;
    challenge = 'You both withdraw while fearing abandonment. You\'ll create distance while terrified of it. Someone has to stay.';
  }
  
  // Both have pursue-engulfment = trouble
  if (user1Incoherences.includes('pursueEngulfment') && user2Incoherences.includes('pursueEngulfment')) {
    score -= 15;
    challenge = 'You both pursue while fearing engulfment. You\'ll chase each other until you both feel trapped.';
  }
  
  return {
    score: Math.max(20, Math.min(90, score)),
    user1Coherence: c1,
    user2Coherence: c2,
    avgCoherence,
    dynamic,
    challenge,
    opportunity,
    
    // Narrative
    narrative: `${dynamic} ${challenge} ${opportunity}`
  };
}

// =============================================================================
// SECTION 8: TENSION STACK - MARKET REALITY (Patti Stanger)
// =============================================================================
// Source: Demographics + M1 (what you want) + M2 (what you offer)
//
// INTRODUCTION:
// Every other assessment tells you who you are and what you want. None of them
// tell you what the market is actually offering you. That gap is where
// frustration lives.
// 
// The Market Reality stack does something uncomfortable: it compares your
// preferences to your actual dating market. How many people fit what you want?
// What are you actually offering them? Is there a gap between how you see
// yourself and how the market sees you?
// 
// This is where three gaps get measured:
// 
// THE FANTASY GAP: What you want vs what the market offers you. If you're
// holding out for someone who represents 0.3% of your local market, that's
// not standardsâ€”that's strategy that will fail.
// 
// THE MIRROR GAP: What you want vs what you offer. This is why you "keep
// attracting the wrong people." You're fishing with bait that attracts
// different fish than the ones you want to catch.
// 
// THE PERCEPTION GAP: What you think you offer vs what you actually offer.
// If your self-image doesn't match how you come across, you're targeting
// wrong and getting confused by rejection.
// 
// This stack isn't about lowering your standards. It's about seeing clearly
// where the market is and where you are in it. What you do with that
// information is your choice.

const MARKET_REALITY_CONFIG = {
  name: 'Market Reality',
  author: 'Patti Stanger',
  sources: ['Demographics', 'M1', 'M2'],
  
  // The three gaps
  gaps: {
    fantasyGap: {
      name: 'Fantasy Gap',
      description: 'The distance between what you want and what the market offers you.',
      
      computation: 'M1 preferences vs Demographics pool data',
      
      starters: {
        male: {
          large: `You're shopping in the wrong store. The woman you've built in your headâ€”she exists, but not in the numbers you need. You want specific things that significantly shrink your pool. This isn't wrong. But it means you're either going to wait longer, expand your radius, or adjust your expectations. The market doesn't care what you deserve. It only cares what it has.`,
          
          moderate: `Your expectations are ambitious but not unrealistic. The pool is smaller than you'd like, but it's not empty. You'll need patience and strategy. Cast a wider net geographically, be more flexible on one or two dimensions, or accept that your search will take longer. Pick your constraint.`,
          
          small: `Your expectations align with your market position. The pool of women who fit what you want is healthy relative to what you bring. This doesn't guarantee successâ€”but it means the math is working for you, not against you. Don't create artificial scarcity by adding criteria you don't actually need.`
        },
        
        female: {
          large: `The man you want is rare in your market. Not impossibleâ€”but rare enough that waiting for him to show up is a strategy that might not pay off. You can expand geographically, adjust one or two criteria, or accept a longer timeline. But pretending the market owes you this specific man will only lead to frustration. The market doesn't negotiate.`,
          
          moderate: `Your criteria are selective but not fantasy. The pool is tight, which means you'll need to be intentionalâ€”online dating, wider geography, saying yes to dates you might have declined. The man you want exists, but he won't fall into your lap. This requires effort, not just standards.`,
          
          small: `Your expectations match your market reality. The pool of men who fit your criteria is reasonable given what you bring. This is a workable situation. Stay consistent, stay visible, and don't add criteria you don't actually care about just because you can.`
        },
        
        general: {
          large: `There's a significant gap between what you want and what the market offers you. This gap is where frustration lives. You can close it three ways: adjust criteria, expand geography, or increase your own market position. Waiting and hoping is not a strategy.`,
          
          moderate: `Your expectations exceed your immediate market, but not by much. With intentional effortâ€”active dating, wider search radius, flexibility on negotiable criteriaâ€”the gap is bridgeable. Don't wait for luck. Create opportunity.`,
          
          small: `Your expectations align with market reality. The people you want are available in reasonable numbers. This is a good position. Don't complicate it by adding criteria that don't actually matter to you.`
        }
      }
    },
    
    mirrorGap: {
      name: 'Mirror Gap',
      description: 'The distance between what you want and what you offer.',
      
      computation: 'M1 code vs M2 codeâ€”are you attracting who you want?',
      
      explanation: `This is why you keep attracting the "wrong" people. You want one thing but you're signaling another. The people who respond to what you offer aren't the people you want. You're fishing with the wrong bait.`,
      
      starters: {
        male: {
          large: `The women you attract aren't the women you want. This isn't bad luckâ€”it's signal mismatch. What you offer attracts a different type than what you're seeking. You're putting out one frequency and expecting a different one to respond. Either change what you want, or change what you're projecting. The market is responding to you accurately; you just don't like the response.`,
          
          moderate: `There's some gap between who you attract and who you want. You're getting interest, but from women who aren't quite right. Look at what you're signaling versus what you're seeking. Small adjustments in presentation can shift who responds. You don't need a personality overhaulâ€”you need message alignment.`,
          
          small: `What you offer tends to attract what you want. Your signals and desires are aligned. This doesn't guarantee chemistry with any individual, but it means you're fishing in the right pond with the right bait. Stay consistent.`
        },
        
        female: {
          large: `You keep asking "why do I attract these men?" Here's why: what you offer signals to a different type than what you want. You want the stable provider but you're projecting excitement and edge. You want the adventurer but you're projecting domesticity. The men responding to you are responding accurately to what you're putting out. They're not wrong. Your signal is.`,
          
          moderate: `The men you attract are close to what you want, but not quite. There's signal leakageâ€”something in your presentation is calling in men who don't match your stated preferences. This is usually fixable with awareness. Notice what you're emphasizing versus what you actually want.`,
          
          small: `You tend to attract men who match what you're looking for. Your offer and your want are aligned. This is healthy positioning. The work now is selection, not attractionâ€”filtering the responses you get for actual compatibility.`
        },
        
        general: {
          large: `Major gap between what you want and what you offer. You're a walking contradiction to the market. What you project attracts people you don't want. What you want isn't attracted to what you project. Something has to give: change your criteria, or change your presentation.`,
          
          moderate: `Some misalignment between signal and desire. You're getting responses, but they're not quite right. This is usually fixable with conscious adjustments to how you present yourself.`,
          
          small: `Your want and offer are aligned. The market sees you accurately and responds appropriately. Good positioning.`
        }
      }
    },
    
    perceptionGap: {
      name: 'Perception Gap',
      description: 'The distance between what you claim and what the evidence shows.',
      
      computation: 'M2 self-perception vs Demographics/behavioral signals',
      
      explanation: `You think you're offering one thing; the market sees another. This isn't about lyingâ€”it's about blind spots. You rate yourself differently than the market rates you. This gap creates confusion and disappointment.`,
      
      starters: {
        male: {
          large: `There's a significant gap between how you see yourself and how you come across. This isn't about self-esteemâ€”it's about calibration. You think you're offering X, but your demographics, behaviors, and presentation say Y. The women who reject you aren't misjudging you. They're judging you accurately based on what they see. If you want different results, either change what you're actually offering, or get clearer on what you actually project.`,
          
          moderate: `Some gap between your self-image and your market presentation. You're slightly overestimating or underestimating something. This creates small mismatchesâ€”dates that don't convert, matches that fizzle. Get feedback from trusted sources. What do people actually experience when they meet you?`,
          
          small: `Your self-perception aligns with how you come across. What you think you offer is what people actually receive. This calibration is valuable. You can trust your self-assessment when making decisions about who to approach.`
        },
        
        female: {
          large: `You see yourself differently than the market sees you. This gap isn't about beauty or worthâ€”it's about accuracy. You're either overestimating something (and getting rejected when reality doesn't match), or underestimating something (and underselling yourself). The men you're meeting aren't blind. They're responding to what's actually in front of them. Get calibrated.`,
          
          moderate: `Some gap between your self-image and your market position. You're slightly off in how you see yourself versus how you land. This creates frictionâ€”things feel harder than they should. Ask people you trust: what do I actually project? The answer might surprise you.`,
          
          small: `Your self-perception is calibrated. What you think you offer is what people experience. This accuracy helps you target appropriately and set realistic expectations. Trust your read on yourself.`
        },
        
        general: {
          large: `Significant gap between self-perception and market perception. You're not seeing yourself clearly, which means you're targeting wrong and getting surprised by rejection. Calibration required.`,
          
          moderate: `Some self-perception gap. You're slightly off in how you see yourself. Minor adjustments to expectations or presentation would help.`,
          
          small: `Self-perception is calibrated. You see yourself the way the market sees you. Good foundation for strategy.`
        }
      }
    }
  },
  
  // Market reality types based on gap combinations
  marketTypes: {
    aligned: {
      name: 'Market Aligned',
      description: 'All three gaps are small. Rare and advantageous.',
      guidance: `You're in a strong position. Your wants match your market, your offer attracts your want, and your self-perception is accurate. Don't overthink it. Execute consistently.`
    },
    
    fantasyDriven: {
      name: 'Fantasy-Driven',
      description: 'Large Fantasy Gap, smaller other gaps. Wants exceed market.',
      guidance: `Your standards are the issue, not your attractiveness. The person you want is rare in your market. You can wait, expand geography, adjust criteria, or increase your own value. But hoping the market will change for you won't work.`
    },
    
    signalMismatch: {
      name: 'Signal Mismatch',
      description: 'Large Mirror Gap. Attracting wrong people.',
      guidance: `You're sending mixed signals. What you project attracts a different type than what you want. This is fixableâ€”but it requires examining what you're actually putting out there, not just what you intend to put out.`
    },
    
    blindSpot: {
      name: 'Blind Spot',
      description: 'Large Perception Gap. Self-image doesn\'t match reality.',
      guidance: `You have a calibration problem. You're not seeing yourself the way the market sees you. This creates targeting errors and surprise rejections. Get honest feedback. The issue isn't the marketâ€”it's your read on yourself.`
    },
    
    multipleGaps: {
      name: 'Multiple Gaps',
      description: 'Two or more large gaps. Compounding issues.',
      guidance: `You have compounding market issues. Fix them in order: Perception first (get calibrated), then Mirror (align signals), then Fantasy (adjust expectations). You can't solve the third until you've solved the first two.`
    }
  }
};

/**
 * Computes Market Reality from Demographics and Module results
 * 
 * @param {DemographicsResults} demographics - Demographics engine output
 * @param {M1Results} m1 - Module 1 results (what they want)
 * @param {M2Results} m2 - Module 2 results (what they offer)
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} Market reality profile with gaps and guidance
 */
function computeMarketReality(demographics, m1, m2, gender) {
  // Extract demographics safely
  const relateScore = safeGet(demographics, 'relateScore.score', 50);
  const idealPool = safeGet(demographics, 'matchPool.idealPool', 1000);
  const realisticPool = safeGet(demographics, 'matchPool.realisticPool', 5000);
  const localPool = safeGet(demographics, 'matchPool.localSinglePool', 50000);
  const userAge = safeGet(demographics, 'userProfile.age', 30);
  const userIncome = safeGet(demographics, 'userProfile.income', 'middle');
  
  // Extract M1 (what they want)
  const m1Code = safeGet(m1, 'code', 'ACEG');
  const m1Strengths = {
    physical: safeGet(m1, 'dimensions.physical.strength', 50),
    social: safeGet(m1, 'dimensions.social.strength', 50),
    lifestyle: safeGet(m1, 'dimensions.lifestyle.strength', 50),
    values: safeGet(m1, 'dimensions.values.strength', 50)
  };
  
  // Extract M2 (what they offer)
  const m2Code = safeGet(m2, 'code', 'ACEG');
  const selfPerceptionGap = safeGet(m2, 'overallSelfPerceptionGap.average', 0.5);
  const gapInterpretation = safeGet(m2, 'overallSelfPerceptionGap.interpretation', 'moderate');
  
  // Calculate Fantasy Gap (M1 vs Demographics)
  // Based on pool size relative to local market
  const poolRatio = idealPool / localPool;
  let fantasyGapSize;
  let fantasyGapScore;
  
  if (poolRatio < 0.01) { // Less than 1% of market fits criteria
    fantasyGapSize = 'large';
    fantasyGapScore = 20 + (poolRatio * 1000); // 20-30
  } else if (poolRatio < 0.05) { // 1-5% of market
    fantasyGapSize = 'moderate';
    fantasyGapScore = 40 + (poolRatio * 400); // 40-60
  } else { // More than 5%
    fantasyGapSize = 'small';
    fantasyGapScore = 70 + Math.min(25, poolRatio * 200); // 70-95
  }
  
  // Adjust for preference strength (stronger preferences = larger gap)
  const avgPreferenceStrength = (m1Strengths.physical + m1Strengths.social + m1Strengths.lifestyle + m1Strengths.values) / 4;
  if (avgPreferenceStrength > 60) {
    fantasyGapScore = Math.max(20, fantasyGapScore - (avgPreferenceStrength - 60) * 0.3);
  }
  
  // Calculate Mirror Gap (M1 vs M2)
  // How many code positions differ?
  let mirrorMismatches = 0;
  for (let i = 0; i < 4; i++) {
    const m1Pole = codeLetterToPole(m1Code[i]);
    const m2Pole = codeLetterToPole(m2Code[i]);
    if (m1Pole !== m2Pole) {
      mirrorMismatches++;
    }
  }
  
  let mirrorGapSize;
  let mirrorGapScore;
  
  if (mirrorMismatches >= 3) {
    mirrorGapSize = 'large';
    mirrorGapScore = 25;
  } else if (mirrorMismatches === 2) {
    mirrorGapSize = 'moderate';
    mirrorGapScore = 50;
  } else if (mirrorMismatches === 1) {
    mirrorGapSize = 'small';
    mirrorGapScore = 75;
  } else {
    mirrorGapSize = 'small';
    mirrorGapScore = 90;
  }
  
  // Identify specific mirror mismatches
  const mirrorDetails = [];
  const dimensions = ['physical', 'social', 'lifestyle', 'values'];
  const dimensionLetters = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']];
  
  for (let i = 0; i < 4; i++) {
    const m1Pole = codeLetterToPole(m1Code[i]);
    const m2Pole = codeLetterToPole(m2Code[i]);
    if (m1Pole !== m2Pole) {
      const wantPole = getPoleName(gender, 'want', dimensions[i], m1Code[i]);
      const offerPole = getPoleName(gender, 'offer', dimensions[i], m2Code[i]);
      mirrorDetails.push({
        dimension: dimensions[i],
        want: wantPole,
        offer: offerPole,
        interpretation: `You want ${wantPole} but offer ${offerPole}. These attract different types.`
      });
    }
  }
  
  // Calculate Perception Gap (M2 self-perception)
  let perceptionGapSize;
  let perceptionGapScore;
  
  if (selfPerceptionGap > 1.0) {
    perceptionGapSize = 'large';
    perceptionGapScore = 30;
  } else if (selfPerceptionGap > 0.6) {
    perceptionGapSize = 'moderate';
    perceptionGapScore = 55;
  } else {
    perceptionGapSize = 'small';
    perceptionGapScore = 80;
  }
  
  // Determine overall market type
  let marketType;
  const largeGaps = [fantasyGapSize, mirrorGapSize, perceptionGapSize].filter(g => g === 'large').length;
  const moderateGaps = [fantasyGapSize, mirrorGapSize, perceptionGapSize].filter(g => g === 'moderate').length;
  
  if (largeGaps >= 2) {
    marketType = 'multipleGaps';
  } else if (fantasyGapSize === 'large') {
    marketType = 'fantasyDriven';
  } else if (mirrorGapSize === 'large') {
    marketType = 'signalMismatch';
  } else if (perceptionGapSize === 'large') {
    marketType = 'blindSpot';
  } else if (largeGaps === 0 && moderateGaps <= 1) {
    marketType = 'aligned';
  } else {
    marketType = 'multipleGaps';
  }
  
  const marketTypeData = MARKET_REALITY_CONFIG.marketTypes[marketType];
  
  // Get gender-appropriate narratives
  const genderKey = gender === 'M' ? 'male' : gender === 'W' ? 'female' : 'general';
  const fantasyNarrative = MARKET_REALITY_CONFIG.gaps.fantasyGap.starters[genderKey][fantasyGapSize];
  const mirrorNarrative = MARKET_REALITY_CONFIG.gaps.mirrorGap.starters[genderKey][mirrorGapSize];
  const perceptionNarrative = MARKET_REALITY_CONFIG.gaps.perceptionGap.starters[genderKey][perceptionGapSize];
  
  // Build customizations
  const customizations = [];
  
  // Pool size context
  customizations.push(`Your ideal pool is ${idealPool.toLocaleString()} people in your market (${((idealPool/localPool)*100).toFixed(1)}% of available singles).`);
  
  // Relate score context
  if (relateScore >= 70) {
    customizations.push(`Your market position is strong (${relateScore}/100). You're bringing real value to the table.`);
  } else if (relateScore >= 50) {
    customizations.push(`Your market position is moderate (${relateScore}/100). You have things to offer but face competition.`);
  } else {
    customizations.push(`Your market position is challenging (${relateScore}/100). You may need to either expand criteria or improve your position.`);
  }
  
  // Mirror gap specifics
  if (mirrorDetails.length > 0) {
    customizations.push(`Signal mismatches: ${mirrorDetails.map(m => m.interpretation).join(' ')}`);
  }
  
  // Calculate overall market reality score
  const marketRealityScore = Math.round((fantasyGapScore * 0.4) + (mirrorGapScore * 0.35) + (perceptionGapScore * 0.25));
  
  return {
    // Overall assessment
    marketType,
    marketTypeName: marketTypeData.name,
    marketTypeDescription: marketTypeData.description,
    marketTypeGuidance: marketTypeData.guidance,
    marketRealityScore,
    
    // Individual gaps
    fantasyGap: {
      size: fantasyGapSize,
      score: Math.round(fantasyGapScore),
      narrative: fantasyNarrative,
      poolData: {
        idealPool,
        realisticPool,
        localPool,
        poolRatio: (poolRatio * 100).toFixed(2) + '%'
      }
    },
    
    mirrorGap: {
      size: mirrorGapSize,
      score: Math.round(mirrorGapScore),
      narrative: mirrorNarrative,
      mismatches: mirrorMismatches,
      details: mirrorDetails,
      m1Code,
      m2Code
    },
    
    perceptionGap: {
      size: perceptionGapSize,
      score: Math.round(perceptionGapScore),
      narrative: perceptionNarrative,
      selfPerceptionGap,
      interpretation: gapInterpretation
    },
    
    // Customizations
    customizations,
    
    // Demographics context
    demographics: {
      relateScore,
      age: userAge,
      income: userIncome
    },
    
    // For AI report generation
    reportContext: {
      voicePrinciples: NARRATIVE_VOICE.principles,
      forbiddenPhrases: NARRATIVE_VOICE.forbiddenPhrases,
      marketType: marketTypeData.name,
      guidance: marketTypeData.guidance,
      fantasyNarrative,
      mirrorNarrative,
      perceptionNarrative,
      customizations,
      userGender: gender
    }
  };
}

/**
 * Computes Market Reality compatibility between two users
 * Both people's market positions affect relationship viability
 * 
 * @param {Object} user1Market - User 1's market reality profile
 * @param {Object} user2Market - User 2's market reality profile
 * @returns {Object} Combined market reality analysis
 */
function computeMarketCompatibility(user1Market, user2Market) {
  const score1 = user1Market.marketRealityScore;
  const score2 = user2Market.marketRealityScore;
  const avgScore = (score1 + score2) / 2;
  
  // Check if they're in each other's pools (simplified check via mirror gap)
  const user1WantsUser2Offers = user1Market.mirrorGap.m1Code === user2Market.mirrorGap.m2Code;
  const user2WantsUser1Offers = user2Market.mirrorGap.m1Code === user1Market.mirrorGap.m2Code;
  
  const mutualFit = user1WantsUser2Offers && user2WantsUser1Offers;
  const oneSidedFit = user1WantsUser2Offers || user2WantsUser1Offers;
  
  let compatibility;
  let dynamic;
  let challenge;
  let opportunity;
  
  if (mutualFit && avgScore >= 70) {
    compatibility = 90;
    dynamic = 'You\'re both in each other\'s target market AND have realistic expectations. This is the sweet spot.';
    challenge = 'Don\'t let good positioning make you lazy. Compatibility potential still requires effort.';
    opportunity = 'The market math is working for both of you. This is rare. Don\'t waste it.';
  } else if (mutualFit) {
    compatibility = 70;
    dynamic = 'You each want what the other offers. The fit is there even if market positioning has challenges.';
    challenge = 'One or both of you may have unrealistic expectations in other areas. Address those.';
    opportunity = 'The core fit exists. That\'s the hard part. Everything else is adjustable.';
  } else if (oneSidedFit) {
    compatibility = 50;
    dynamic = 'One of you fits what the other wants, but not vice versa. This creates imbalance.';
    challenge = 'The person whose preferences aren\'t met may feel like they\'re settling. Resentment risk.';
    opportunity = 'If the fit is close, small adjustments in perception might close the gap.';
  } else {
    compatibility = 35;
    dynamic = 'Neither of you precisely fits what the other is looking for. You found each other outside your criteria.';
    challenge = 'Both of you may have "is this settling?" thoughts. Be honest about why you\'re together.';
    opportunity = 'Sometimes the market is wrong about what we need. If this works, it works regardless of criteria.';
  }
  
  // Adjust for market position gap
  const positionGap = Math.abs(score1 - score2);
  if (positionGap > 30) {
    compatibility -= 10;
    challenge = `${challenge} Large gap in market positioning (${positionGap} points) creates power imbalance risk.`;
  }
  
  return {
    score: Math.max(20, Math.min(95, compatibility)),
    user1Score: score1,
    user2Score: score2,
    avgScore: Math.round(avgScore),
    positionGap,
    mutualFit,
    oneSidedFit,
    dynamic,
    challenge,
    opportunity,
    narrative: `${dynamic} ${challenge} ${opportunity}`
  };
}

// =============================================================================
// MASTER FUNCTION: COMPUTE ALL TENSION STACKS
// =============================================================================

/**
 * Computes all six Tension Stacks for a user
 * 
 * @param {M1Results} m1 - Module 1 results
 * @param {M2Results} m2 - Module 2 results
 * @param {M3Results} m3 - Module 3 results
 * @param {M4Results} m4 - Module 4 results
 * @param {DemographicsResults} demographics - Demographics results
 * @param {string} gender - 'M' or 'W'
 * @returns {Object} All tension stack results
 */
function computeAllTensionStacks(m1, m2, m3, m4, demographics, gender) {
  return {
    eroticDimension: computeEroticDimension(m1, m2, m3, gender),
    vulnerabilityProfile: computeVulnerabilityProfile(m2, m3, m4, gender),
    attractionAttachment: computeAttractionAttachment(m1, m4, gender),
    intimacyConflictBridge: computeIntimacyConflictBridge(m3, m4, gender),
    internalConflictCoherence: computeInternalConflictCoherence(m4, gender),
    marketReality: computeMarketReality(demographics, m1, m2, gender)
  };
}

/**
 * Computes all Tension Stack compatibilities between two users
 * 
 * @param {Object} user1Stacks - User 1's tension stack results
 * @param {Object} user2Stacks - User 2's tension stack results
 * @returns {Object} All compatibility results
 */
function computeAllTensionStackCompatibilities(user1Stacks, user2Stacks) {
  return {
    eroticCompatibility: computeEroticCompatibility(
      user1Stacks.eroticDimension, 
      user2Stacks.eroticDimension
    ),
    vulnerabilityCompatibility: computeVulnerabilityCompatibility(
      user1Stacks.vulnerabilityProfile, 
      user2Stacks.vulnerabilityProfile
    ),
    attractionAttachmentCompatibility: computeAttractionAttachmentCompatibility(
      user1Stacks.attractionAttachment, 
      user2Stacks.attractionAttachment
    ),
    coherenceCompatibility: computeCoherenceCompatibility(
      user1Stacks.internalConflictCoherence, 
      user2Stacks.internalConflictCoherence
    ),
    marketCompatibility: computeMarketCompatibility(
      user1Stacks.marketReality, 
      user2Stacks.marketReality
    )
  };
}

// =============================================================================
// EXPORTS (Complete)
// =============================================================================

module.exports = {
  // Utilities
  safeGet,
  validateModuleResults,
  getPoleName,
  getDimensionFromPosition,
  codeLetterToPole,
  
  // Reference
  POLES,
  NARRATIVE_VOICE,
  
  // Parallels
  PARALLELS_CONFIG,
  calculateParallels,
  
  // Strengths
  STRENGTHS_CONFIG,
  calculateStrengths,
  
  // Combined Compatibility
  analyzeCompatibility,
  generateCompatibilitySummary,
  
  // Tension Stack 1: Erotic Dimension
  EROTIC_DIMENSION_CONFIG,
  computeEroticDimension,
  computeEroticCompatibility,
  
  // Tension Stack 2: Vulnerability Profile
  VULNERABILITY_PROFILE_CONFIG,
  computeVulnerabilityProfile,
  computeVulnerabilityCompatibility,
  analyzeShameInteraction,
  
  // Tension Stack 3: Attraction-Attachment
  ATTRACTION_ATTACHMENT_CONFIG,
  computeAttractionAttachment,
  computeAttractionAttachmentCompatibility,
  
  // Tension Stack 4: Intimacy-Conflict Bridge
  INTIMACY_CONFLICT_BRIDGE_CONFIG,
  computeIntimacyConflictBridge,
  
  // Tension Stack 5: Internal Conflict Coherence
  INTERNAL_CONFLICT_COHERENCE_CONFIG,
  computeInternalConflictCoherence,
  computeCoherenceCompatibility,
  
  // Tension Stack 6: Market Reality
  MARKET_REALITY_CONFIG,
  computeMarketReality,
  computeMarketCompatibility,
  
  // Master Functions
  computeAllTensionStacks,
  computeAllTensionStackCompatibilities
};
