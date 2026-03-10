/**
 * RELATE Dating Blueprint - Scoring Engine
 *
 * Implements Profile routing for all four Quadrants, axis calculations
 * for Quadrants Three and Four, the emergent pattern detection logic
 * using the eight named patterns from Section 5, and confidence scoring
 * for each Profile assignment.
 *
 * API surface (from Section 8):
 *   initializeBlueprint(assessmentResults)
 *   saveBlueprintProgress(quadrantIndex, responses)
 *   scoreBlueprintSession(allResponses, assessmentResults)
 *   generateBlueprintReport(blueprintResults, assessmentResults, personaMetadata)
 *   generateGrowthPlan(blueprintResults, blueprintReport, assessmentResults, personaMetadata)
 *   generateCouplesOverlay(blueprintResults1, blueprintResults2, assessmentResults1, assessmentResults2)
 */

const { getBlueprintQuestions, buildQuadrantFourQuestions } = require('./relate_blueprint_questions');

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  checkpoint: 'relate_blueprint_checkpoint',
  results: 'relate_blueprint_results',
  report: 'relate_blueprint_report',
  growth: 'relate_blueprint_growth',
  couples: 'relate_blueprint_couples'
};

// Quadrant One Profile definitions
// Three dimensions: A (Disruption Character), B (Source Figure), C (Repair History)
const Q1_PROFILES = {
  1: { name: 'Chronic, Caregiver, Unresolved', disruption: 'chronic', source: 'caregiver', repair: 'unresolved' },
  2: { name: 'Chronic, Caregiver, Repaired', disruption: 'chronic', source: 'caregiver', repair: 'repaired' },
  3: { name: 'Chronic, Romantic, Unresolved', disruption: 'chronic', source: 'romantic', repair: 'unresolved' },
  4: { name: 'Chronic, Romantic, Repaired', disruption: 'chronic', source: 'romantic', repair: 'repaired' },
  5: { name: 'Acute, Caregiver, Unresolved', disruption: 'acute', source: 'caregiver', repair: 'unresolved' },
  6: { name: 'Acute, Romantic, Unresolved', disruption: 'acute', source: 'romantic', repair: 'unresolved' }
};

// Quadrant Two Profile definitions
const Q2_PROFILES = {
  fear_of_abandonment: { name: 'Fear of Abandonment' },
  shame: { name: 'Shame' },
  contempt: { name: 'Contempt' },
  grief: { name: 'Grief' },
  rage: { name: 'Rage' }
};

// Quadrant Three Profile definitions
const Q3_PROFILES = {
  intellectualization: { name: 'Intellectualization', direction: 'toward', register: 'cognitive' },
  impulsive_action: { name: 'Impulsive Action', direction: 'toward', register: 'behavioral' },
  consensus_seeking: { name: 'Consensus Seeking', direction: 'away', register: 'relational' },
  silence_withdrawal: { name: 'Silence and Withdrawal', direction: 'away', register: 'behavioral' },
  catastrophic_projection: { name: 'Catastrophic Forward Projection', direction: 'toward', register: 'cognitive' },
  dissociative_backward_anchoring: { name: 'Dissociative Backward Anchoring', direction: 'away', register: 'relational' }
};


// ============================================================================
// QUADRANT ONE SCORING
// ============================================================================

/**
 * Scores Quadrant One responses and routes to a Profile.
 *
 * Dimension A (Disruption Character): chronic vs acute
 * Dimension B (Source Figure): caregiver vs romantic
 * Dimension C (Repair History): repaired vs unresolved (with partial)
 *
 * @param {Array} responses - Array of { questionId, value } for Q1 questions
 * @returns {object} { profileId, profileName, dimensions, confidence }
 */
function scoreQuadrantOne(responses) {
  const scores = {
    disruption: { chronic: 0, acute: 0 },
    source: { caregiver: 0, romantic: 0 },
    repair: { repaired: 0, partial: 0, unresolved: 0 }
  };

  let totalSignals = 0;
  let consistentSignals = 0;

  for (const response of responses) {
    const qId = response.questionId;
    const value = response.value;

    // Scaled questions: extract dimension signals from numeric values
    if (typeof value === 'number') {
      if (qId === 'q1_03') {
        // Disruption character: low = chronic, high = acute
        if (value <= 2) { scores.disruption.chronic += 2; }
        else if (value >= 4) { scores.disruption.acute += 2; }
        else { scores.disruption.chronic += 1; scores.disruption.acute += 1; }
      }
      else if (qId === 'q1_07') {
        // Source figure: low = caregiver, high = romantic
        if (value <= 2) { scores.source.caregiver += 2; }
        else if (value >= 4) { scores.source.romantic += 2; }
        else { scores.source.caregiver += 1; scores.source.romantic += 1; }
      }
      else if (qId === 'q1_10') {
        // Repair history: low = unresolved, mid = partial, high = repaired
        if (value <= 2) { scores.repair.unresolved += 2; }
        else if (value === 3) { scores.repair.partial += 2; }
        else { scores.repair.repaired += 2; }
      }
      else if (qId === 'q1_13') {
        // Somatic reactivity: high = active wound (unresolved confirmation)
        if (value >= 4) { scores.repair.unresolved += 1; }
        else if (value <= 2) { scores.repair.repaired += 1; }
      }
      totalSignals++;
    }

    // Narrative questions: scored via NLP signals in the response text
    if (typeof value === 'string' && value.length > 0) {
      const signals = extractQ1NarrativeSignals(qId, value);
      if (signals.disruption) {
        scores.disruption[signals.disruption] += signals.strength || 1;
      }
      if (signals.source) {
        scores.source[signals.source] += signals.strength || 1;
      }
      if (signals.repair) {
        scores.repair[signals.repair] += signals.strength || 1;
      }
      if (signals.consistent !== undefined) {
        totalSignals++;
        if (signals.consistent) consistentSignals++;
      }
    }
  }

  // Route to Profile
  const disruption = scores.disruption.chronic >= scores.disruption.acute ? 'chronic' : 'acute';
  const source = scores.source.caregiver >= scores.source.romantic ? 'caregiver' : 'romantic';

  let repair;
  if (scores.repair.repaired > scores.repair.unresolved && scores.repair.repaired > scores.repair.partial) {
    repair = 'repaired';
  } else if (scores.repair.partial > scores.repair.unresolved) {
    repair = 'partial';
  } else {
    repair = 'unresolved';
  }

  // Map to Profile ID
  // Acute + Caregiver + Repaired and Acute + Romantic + Repaired collapse into
  // adjacent profiles per spec (8 theoretical -> 6 meaningful profiles)
  let profileId;
  if (disruption === 'chronic' && source === 'caregiver' && repair === 'unresolved') profileId = 1;
  else if (disruption === 'chronic' && source === 'caregiver' && (repair === 'repaired' || repair === 'partial')) profileId = 2;
  else if (disruption === 'chronic' && source === 'romantic' && repair === 'unresolved') profileId = 3;
  else if (disruption === 'chronic' && source === 'romantic' && (repair === 'repaired' || repair === 'partial')) profileId = 4;
  else if (disruption === 'acute' && source === 'caregiver') profileId = 5; // unresolved or repaired collapses here
  else if (disruption === 'acute' && source === 'romantic') profileId = 6; // unresolved or repaired collapses here
  else profileId = 1; // fallback

  const profile = Q1_PROFILES[profileId];

  // Confidence: ratio of consistent signals and margin between top/runner-up dimensions
  const disruptionMargin = Math.abs(scores.disruption.chronic - scores.disruption.acute);
  const sourceMargin = Math.abs(scores.source.caregiver - scores.source.romantic);
  const repairMax = Math.max(scores.repair.repaired, scores.repair.partial, scores.repair.unresolved);
  const repairSecond = [scores.repair.repaired, scores.repair.partial, scores.repair.unresolved]
    .sort((a, b) => b - a)[1] || 0;
  const repairMargin = repairMax - repairSecond;

  const marginConfidence = Math.min(1, (disruptionMargin + sourceMargin + repairMargin) / 12);
  const consistencyConfidence = totalSignals > 0 ? consistentSignals / totalSignals : 0.5;
  const confidence = Math.round((marginConfidence * 0.6 + consistencyConfidence * 0.4) * 100) / 100;

  return {
    profileId,
    profileName: profile.name,
    dimensions: {
      disruption: { value: disruption, scores: scores.disruption },
      source: { value: source, scores: scores.source },
      repair: { value: repair, scores: scores.repair }
    },
    confidence: Math.max(0.3, Math.min(1.0, confidence))
  };
}


/**
 * Extracts scoring signals from narrative responses for Quadrant One.
 * Uses keyword and pattern analysis to infer dimensional signals.
 *
 * In production, this function would be augmented or replaced by LLM-based
 * signal extraction. The keyword approach provides a reliable baseline.
 */
function extractQ1NarrativeSignals(questionId, text) {
  const lower = text.toLowerCase();
  const signals = {};

  // Disruption character signals
  const chronicIndicators = [
    'always', 'atmosphere', 'climate', 'feeling', 'gradual', 'over time',
    'never really', 'just how', 'normal', 'nothing specific', 'no single',
    'grew up with', 'constant', 'consistent', 'background', 'subtle',
    'fine on the surface', 'conditional', 'walking on eggshells', 'absent',
    'emotionally unavailable', 'performance', 'earn', 'prove'
  ];
  const acuteIndicators = [
    'suddenly', 'one day', 'the moment', 'everything changed', 'before and after',
    'left', 'died', 'betrayed', 'discovered', 'walked out', 'divorce',
    'specific', 'remember exactly', 'that day', 'overnight', 'shattered',
    'abandoned', 'cheated', 'affair', 'explosion', 'rupture'
  ];

  let chronicCount = chronicIndicators.filter(w => lower.includes(w)).length;
  let acuteCount = acuteIndicators.filter(w => lower.includes(w)).length;

  if (chronicCount > 0 || acuteCount > 0) {
    signals.disruption = chronicCount > acuteCount ? 'chronic' : 'acute';
    signals.strength = Math.max(1, Math.abs(chronicCount - acuteCount));
  }

  // Source figure signals
  const caregiverIndicators = [
    'parent', 'mother', 'father', 'mom', 'dad', 'family', 'childhood',
    'grew up', 'household', 'sibling', 'always been', 'as long as i can remember',
    'never known', 'born into', 'raised', 'home', 'caregiver'
  ];
  const romanticIndicators = [
    'ex', 'partner', 'boyfriend', 'girlfriend', 'husband', 'wife',
    'relationship', 'dating', 'broke up', 'breakup', 'divorce',
    'used to be', 'before that relationship', 'changed me',
    'never the same after', 'that person'
  ];

  let caregiverCount = caregiverIndicators.filter(w => lower.includes(w)).length;
  let romanticCount = romanticIndicators.filter(w => lower.includes(w)).length;

  if (caregiverCount > 0 || romanticCount > 0) {
    signals.source = caregiverCount > romanticCount ? 'caregiver' : 'romantic';
  }

  // Repair signals
  const repairedIndicators = [
    'therapy', 'therapist', 'healed', 'processed', 'worked through',
    'understood', 'shifted', 'changed', 'realized', 'grew', 'learned',
    'forgave', 'let go', 'moved past', 'settled', 'resolved',
    'corrective', 'different now', 'no longer'
  ];
  const unresolvedIndicators = [
    'still', 'unfinished', 'never', 'haunts', 'carries', 'remains',
    'not over', 'keeps coming', 'resurfaces', 'triggers', 'same pattern',
    'cannot shake', 'lingers', 'raw', 'tender', 'never got',
    'no closure', 'unanswered', 'incomplete'
  ];

  let repairedCount = repairedIndicators.filter(w => lower.includes(w)).length;
  let unresolvedCount = unresolvedIndicators.filter(w => lower.includes(w)).length;

  if (repairedCount > 0 || unresolvedCount > 0) {
    if (repairedCount > unresolvedCount * 1.5) {
      signals.repair = 'repaired';
    } else if (unresolvedCount > repairedCount * 1.5) {
      signals.repair = 'unresolved';
    } else {
      signals.repair = 'partial';
    }
  }

  // Cross-angle consistency tracking
  if (['q1_01', 'q1_04'].includes(questionId)) {
    // Somatic/emotional angles, check if disruption signal aligns with earlier behavioral
    signals.consistent = true; // baseline; refined when compared across all responses
  }

  return signals;
}


// ============================================================================
// QUADRANT TWO SCORING
// ============================================================================

/**
 * Scores Quadrant Two responses and routes to a Trigger Emotion Profile.
 *
 * @param {Array} responses - Array of { questionId, value } for Q2 questions
 * @returns {object} { profileId, profileName, confidence }
 */
function scoreQuadrantTwo(responses) {
  const emotionScores = {
    fear_of_abandonment: 0,
    shame: 0,
    contempt: 0,
    grief: 0,
    rage: 0
  };

  let totalSignals = 0;

  for (const response of responses) {
    const qId = response.questionId;
    const value = response.value;

    if (typeof value === 'number') {
      totalSignals++;

      if (qId === 'q2_05') {
        // Abandonment vs shame differentiator
        if (value >= 4) { emotionScores.fear_of_abandonment += 3; }
        else if (value <= 2) { emotionScores.shame += 3; }
        else { emotionScores.fear_of_abandonment += 1; emotionScores.shame += 1; }
      }
      else if (qId === 'q2_06') {
        // Rage vs sadness/fear differentiator
        if (value >= 4) { emotionScores.rage += 3; }
        else if (value <= 2) {
          // Need to check somatic context for grief vs shame/abandonment
          emotionScores.grief += 1;
          emotionScores.shame += 1;
          emotionScores.fear_of_abandonment += 1;
        }
      }
      else if (qId === 'q2_09') {
        // Grief: awareness of loss even when things are good
        if (value >= 4) { emotionScores.grief += 3; }
        else if (value >= 3) { emotionScores.grief += 1; emotionScores.fear_of_abandonment += 1; }
      }
      else if (qId === 'q2_10') {
        // Contempt: cascade pattern
        if (value >= 4) { emotionScores.contempt += 3; }
        else if (value >= 3) { emotionScores.contempt += 1; }
      }
      else if (qId === 'q2_13') {
        // Somatic primacy confirmation: amplifies all signals
        // (does not differentiate between emotions, but confirms depth)
      }
    }

    if (typeof value === 'string' && value.length > 0) {
      const signals = extractQ2NarrativeSignals(qId, value);
      for (const [emotion, weight] of Object.entries(signals)) {
        if (emotionScores[emotion] !== undefined) {
          emotionScores[emotion] += weight;
        }
      }
      totalSignals++;
    }
  }

  // Find dominant emotion
  const sorted = Object.entries(emotionScores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0];
  const runnerUp = sorted[1];

  const profileId = dominant[0];
  const profile = Q2_PROFILES[profileId];

  // Confidence: margin between dominant and runner-up
  const margin = dominant[1] - (runnerUp ? runnerUp[1] : 0);
  const maxPossible = dominant[1] + (runnerUp ? runnerUp[1] : 0);
  const confidence = maxPossible > 0
    ? Math.round(Math.max(0.3, Math.min(1.0, 0.5 + (margin / maxPossible) * 0.5)) * 100) / 100
    : 0.5;

  return {
    profileId,
    profileName: profile.name,
    emotionScores,
    confidence
  };
}


/**
 * Extracts trigger emotion signals from narrative responses.
 */
function extractQ2NarrativeSignals(questionId, text) {
  const lower = text.toLowerCase();
  const signals = {};

  // Abandonment indicators
  const abandonmentWords = [
    'leave', 'leaving', 'left', 'gone', 'disappear', 'abandon', 'alone',
    'silence', 'quiet', 'not there', 'pulling away', 'losing', 'lost',
    'they will go', 'end', 'they are done', 'replaced', 'forgotten'
  ];
  // Shame indicators
  const shameWords = [
    'exposed', 'seen', 'found out', 'inadequate', 'not enough', 'too much',
    'defective', 'flawed', 'hide', 'shrink', 'invisible', 'perform',
    'prove', 'worthy', 'deserve', 'judge', 'verdict', 'pretend',
    'real me', 'mask', 'fraud', 'embarrass'
  ];
  // Contempt indicators
  const contemptWords = [
    'beneath', 'weak', 'pathetic', 'disappointing', 'not good enough',
    'standards', 'settle', 'deserve better', 'small', 'inferior',
    'ridiculous', 'unimpressive', 'cannot handle', 'incompetent',
    'their fault', 'their problem', 'above'
  ];
  // Grief indicators
  const griefWords = [
    'already over', 'loss', 'heavy', 'sad', 'mourning', 'letting go',
    'ending', 'impermanent', 'temporary', 'passing', 'fading',
    'inevitable', 'resigned', 'beautiful and fleeting', 'tender',
    'precious because temporary', 'weight', 'sinking'
  ];
  // Rage indicators
  const rageWords = [
    'unfair', 'wrong', 'disrespect', 'violated', 'boundary', 'anger',
    'rage', 'fury', 'injustice', 'unacceptable', 'powerless',
    'controlled', 'manipulated', 'taken advantage', 'stood up for',
    'fight', 'confront', 'demand', 'accountability'
  ];

  const counts = {
    fear_of_abandonment: abandonmentWords.filter(w => lower.includes(w)).length,
    shame: shameWords.filter(w => lower.includes(w)).length,
    contempt: contemptWords.filter(w => lower.includes(w)).length,
    grief: griefWords.filter(w => lower.includes(w)).length,
    rage: rageWords.filter(w => lower.includes(w)).length
  };

  // Weight by question importance
  const questionWeight = {
    'q2_01': 2, // Somatic phenomenology, high value
    'q2_02': 2, // First thought, high value
    'q2_03': 2, // Impulse and fear, high value
    'q2_04': 3, // Story in the silence, critical differentiator
    'q2_07': 2, // Perception shift, high value
    'q2_08': 2, // Intimacy difficulty, high value
    'q2_11': 3, // Partner feedback, highest reliability
    'q2_12': 2, // Gap question, high value
    'q2_14': 3  // Departure guarantee, critical differentiator
  };

  const weight = questionWeight[questionId] || 1;

  for (const [emotion, count] of Object.entries(counts)) {
    if (count > 0) {
      signals[emotion] = count * weight;
    }
  }

  return signals;
}


// ============================================================================
// QUADRANT THREE SCORING
// ============================================================================

/**
 * Scores Quadrant Three responses and routes to a Decision Mode Profile.
 * Also calculates the two internal axes: Direction and Register.
 *
 * @param {Array} responses - Array of { questionId, value } for Q3 questions
 * @returns {object} { profileId, profileName, axes, confidence }
 */
function scoreQuadrantThree(responses) {
  const modeScores = {
    intellectualization: 0,
    impulsive_action: 0,
    consensus_seeking: 0,
    silence_withdrawal: 0,
    catastrophic_projection: 0,
    dissociative_backward_anchoring: 0
  };

  // Internal axis scores (1-5 scale, derived from responses)
  let directionSum = 0; // toward (+) vs away (-)
  let directionCount = 0;
  let registerCognitiveSignal = 0;
  let registerBehavioralSignal = 0;
  let registerRelationalSignal = 0;

  for (const response of responses) {
    const qId = response.questionId;
    const value = response.value;

    if (typeof value === 'number') {
      if (qId === 'q3_04') {
        // Direction axis: high = toward, low = away
        directionSum += value;
        directionCount++;
        if (value >= 4) {
          modeScores.intellectualization += 1;
          modeScores.impulsive_action += 1;
          modeScores.catastrophic_projection += 1;
        } else if (value <= 2) {
          modeScores.consensus_seeking += 1;
          modeScores.silence_withdrawal += 1;
          modeScores.dissociative_backward_anchoring += 1;
        }
      }
      else if (qId === 'q3_05') {
        // Register axis: high = cognitive, low = behavioral
        if (value >= 4) {
          registerCognitiveSignal += 2;
          modeScores.intellectualization += 2;
          modeScores.catastrophic_projection += 1;
        } else if (value <= 2) {
          registerBehavioralSignal += 2;
          modeScores.impulsive_action += 2;
          modeScores.silence_withdrawal += 1;
        } else {
          registerRelationalSignal += 2;
          modeScores.consensus_seeking += 1;
          modeScores.dissociative_backward_anchoring += 1;
        }
      }
      else if (qId === 'q3_06') {
        // Consensus seeking direct probe
        if (value >= 4) { modeScores.consensus_seeking += 3; registerRelationalSignal += 1; }
        else if (value >= 3) { modeScores.consensus_seeking += 1; }
      }
      else if (qId === 'q3_07') {
        // Catastrophic forward projection
        if (value >= 4) { modeScores.catastrophic_projection += 3; registerCognitiveSignal += 1; }
        else if (value >= 3) { modeScores.catastrophic_projection += 1; }
      }
      else if (qId === 'q3_08') {
        // Dissociative backward anchoring
        if (value >= 4) { modeScores.dissociative_backward_anchoring += 3; registerRelationalSignal += 1; }
        else if (value >= 3) { modeScores.dissociative_backward_anchoring += 1; }
      }
      else if (qId === 'q3_14') {
        // Temporal orientation: future vs past
        if (value >= 4) { modeScores.catastrophic_projection += 2; }
        else if (value <= 2) { modeScores.dissociative_backward_anchoring += 2; }
      }
    }

    if (typeof value === 'string' && value.length > 0) {
      const signals = extractQ3NarrativeSignals(qId, value);
      for (const [mode, weight] of Object.entries(signals)) {
        if (modeScores[mode] !== undefined) {
          modeScores[mode] += weight;
        }
      }
    }
  }

  // Determine dominant mode
  const sorted = Object.entries(modeScores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0];
  const runnerUp = sorted[1];
  const profileId = dominant[0];
  const profile = Q3_PROFILES[profileId];

  // Calculate axis scores (1-5 scale)
  const directionScore = directionCount > 0
    ? Math.round((directionSum / directionCount) * 10) / 10
    : (profile.direction === 'toward' ? 4 : 2);

  const totalRegister = registerCognitiveSignal + registerBehavioralSignal + registerRelationalSignal;
  let registerScore;
  if (totalRegister > 0) {
    // 1-2 = behavioral, 3 = relational, 4-5 = cognitive
    registerScore = Math.round((
      (registerCognitiveSignal * 5 + registerRelationalSignal * 3 + registerBehavioralSignal * 1) /
      totalRegister
    ) * 10) / 10;
  } else {
    registerScore = profile.register === 'cognitive' ? 4 : profile.register === 'behavioral' ? 2 : 3;
  }

  // Confidence
  const margin = dominant[1] - (runnerUp ? runnerUp[1] : 0);
  const maxPossible = dominant[1] + (runnerUp ? runnerUp[1] : 0);
  const confidence = maxPossible > 0
    ? Math.round(Math.max(0.3, Math.min(1.0, 0.5 + (margin / maxPossible) * 0.5)) * 100) / 100
    : 0.5;

  return {
    profileId,
    profileName: profile.name,
    modeScores,
    axes: {
      direction: { value: directionScore, label: directionScore >= 3 ? 'toward' : 'away' },
      register: {
        value: registerScore,
        label: registerScore >= 4 ? 'cognitive' : registerScore <= 2 ? 'behavioral' : 'relational'
      }
    },
    secondaryMode: runnerUp ? runnerUp[0] : null,
    confidence
  };
}


/**
 * Extracts decision mode signals from narrative responses.
 */
function extractQ3NarrativeSignals(questionId, text) {
  const lower = text.toLowerCase();
  const signals = {};

  const intellectualizationWords = [
    'analyze', 'research', 'framework', 'understand', 'figure out',
    'think about', 'thought through', 'perspective', 'logic', 'rational',
    'assess', 'evaluate', 'probability', 'pattern', 'theory',
    'dissect', 'categorize', 'clinical', 'objective'
  ];
  const impulsiveWords = [
    'texted', 'called', 'sent', 'said something', 'confronted',
    'immediately', 'could not wait', 'had to know', 'blurted',
    'regret', 'too fast', 'before i thought', 'impulse',
    'acted on', 'forced', 'ultimatum', 'demanded'
  ];
  const consensusWords = [
    'friend', 'called someone', 'asked', 'what do you think',
    'opinion', 'advice', 'checked with', 'talked to',
    'someone else', 'validated', 'confirmed', 'perspective from',
    'running it by', 'needed to hear'
  ];
  const silenceWords = [
    'quiet', 'silent', 'withdrew', 'pulled back', 'space',
    'alone', 'could not speak', 'shut down', 'disappeared',
    'went inward', 'needed distance', 'nothing came out',
    'frozen', 'could not find words', 'blank'
  ];
  const projectionWords = [
    'imagined', 'saw the ending', 'knew how it would end',
    'worst case', 'already over', 'future', 'will happen',
    'saw it coming', 'inevitable', 'predicted', 'foresaw',
    'endgame', 'doomed', 'where this is going'
  ];
  const backwardWords = [
    'reminded me of', 'like my ex', 'past relationship', 'just like',
    'same thing', 'happened before', 'déjà vu', 'back then',
    'previous', 'compared', 'similar to', 'reminded',
    'old relationship', 'like last time', 'used to'
  ];

  const modeMap = {
    intellectualization: intellectualizationWords,
    impulsive_action: impulsiveWords,
    consensus_seeking: consensusWords,
    silence_withdrawal: silenceWords,
    catastrophic_projection: projectionWords,
    dissociative_backward_anchoring: backwardWords
  };

  const questionWeight = {
    'q3_01': 3, // Primary mode identification
    'q3_02': 2, // Uncertainty texture
    'q3_03': 2, // Regretted action
    'q3_09': 2, // Silence probe
    'q3_10': 3, // What you reach for
    'q3_11': 2, // Backup system (secondary mode)
    'q3_12': 2, // Gap question
    'q3_13': 3  // Partner feedback
  };

  const weight = questionWeight[questionId] || 1;

  for (const [mode, words] of Object.entries(modeMap)) {
    const count = words.filter(w => lower.includes(w)).length;
    if (count > 0) {
      signals[mode] = count * weight;
    }
  }

  return signals;
}


// ============================================================================
// QUADRANT FOUR SCORING
// ============================================================================

/**
 * Scores Quadrant Four responses and calculates the three axis scores.
 * Does not route to a single named Profile, produces axis modifier values
 * that the report generation engine uses to calibrate the narrative.
 *
 * @param {Array} responses - Array of { questionId, value } for Q4 questions
 * @param {string} personaCode - The user's RELATE persona code
 * @returns {object} { axes, compositeDescriptor, confidence }
 */
function scoreQuadrantFour(responses, personaCode) {
  // Axis accumulators (each axis scores 1-5)
  let defenseSum = 0, defenseCount = 0;
  let awarenessSum = 0, awarenessCount = 0;
  let amplificationSum = 0, amplificationCount = 0;

  for (const response of responses) {
    const qId = response.questionId;
    const value = response.value;

    // Map questions to axes based on question ID patterns
    const baseId = qId.replace(/_[A-Z]{4}$/, '');

    if (typeof value === 'number') {
      // Expression/Defense questions
      if (baseId === 'q4_03') {
        // Strength = shadow recognition → high defense awareness
        defenseSum += value;
        defenseCount++;
      }
      else if (baseId === 'q4_06') {
        // Can distinguish chosen vs automatic → awareness
        awarenessSum += value;
        awarenessCount++;
      }
      else if (baseId === 'q4_10') {
        // Amplification under deep attachment
        amplificationSum += value;
        amplificationCount++;
      }
      else if (baseId === 'q4_13') {
        // See pattern but cannot change → defense + awareness
        defenseSum += value;
        defenseCount++;
        awarenessSum += value;
        awarenessCount++;
      }
      else if (baseId === 'q4_16') {
        // Somatic defense → defense level
        defenseSum += value;
        defenseCount++;
      }
    }

    if (typeof value === 'string' && value.length > 0) {
      const signals = extractQ4NarrativeSignals(qId, value);

      if (signals.defense !== undefined) {
        defenseSum += signals.defense;
        defenseCount++;
      }
      if (signals.awareness !== undefined) {
        awarenessSum += signals.awareness;
        awarenessCount++;
      }
      if (signals.amplification !== undefined) {
        amplificationSum += signals.amplification;
        amplificationCount++;
      }
    }
  }

  // Calculate axis scores (1-5 scale)
  const defenseScore = defenseCount > 0
    ? Math.round((defenseSum / defenseCount) * 10) / 10
    : 3;
  const awarenessScore = awarenessCount > 0
    ? Math.round((awarenessSum / awarenessCount) * 10) / 10
    : 3;
  const amplificationScore = amplificationCount > 0
    ? Math.round((amplificationSum / amplificationCount) * 10) / 10
    : 3;

  // Build composite descriptor
  const defenseLabel = defenseScore >= 3.5 ? 'high' : defenseScore <= 2.5 ? 'low' : 'moderate';
  const awarenessLabel = awarenessScore >= 3.5 ? 'high' : awarenessScore <= 2.5 ? 'low' : 'moderate';
  const amplificationLabel = amplificationScore >= 3.5 ? 'high' : amplificationScore <= 2.5 ? 'low' : 'moderate';

  const compositeDescriptor =
    `${defenseLabel} defense, ${awarenessLabel} awareness, ${amplificationLabel} amplification`;

  // Confidence: based on number of signals and internal consistency
  const totalSignals = defenseCount + awarenessCount + amplificationCount;
  const confidence = Math.round(Math.max(0.3, Math.min(1.0, 0.3 + (totalSignals / 30) * 0.7)) * 100) / 100;

  return {
    axes: {
      defense: { value: defenseScore, label: defenseLabel },
      awareness: { value: awarenessScore, label: awarenessLabel },
      amplification: { value: amplificationScore, label: amplificationLabel }
    },
    compositeDescriptor,
    personaCode,
    confidence
  };
}


/**
 * Extracts Q4 axis signals from narrative responses.
 */
function extractQ4NarrativeSignals(questionId, text) {
  const lower = text.toLowerCase();
  const signals = {};
  const baseId = questionId.replace(/_[A-Z]{4}$/, '');

  // Defense signals
  if (['q4_01', 'q4_02', 'q4_04', 'q4_14'].includes(baseId)) {
    const highDefenseWords = [
      'protecting', 'safe', 'shield', 'armor', 'wall', 'guard',
      'perform', 'managing', 'controlling', 'strategy', 'deflect',
      'avoid', 'cannot show', 'hide', 'mask', 'pretend'
    ];
    const lowDefenseWords = [
      'genuine', 'authentic', 'natural', 'comfortable', 'just who i am',
      'real', 'open', 'honest', 'vulnerable', 'easy', 'effortless'
    ];

    const highCount = highDefenseWords.filter(w => lower.includes(w)).length;
    const lowCount = lowDefenseWords.filter(w => lower.includes(w)).length;

    if (highCount > 0 || lowCount > 0) {
      signals.defense = highCount > lowCount
        ? Math.min(5, 3 + highCount)
        : Math.max(1, 3 - lowCount);
    }
  }

  // Awareness signals
  if (['q4_05', 'q4_07', 'q4_08'].includes(baseId)) {
    const highAwarenessWords = [
      'i know', 'i see', 'pattern', 'recognize', 'aware',
      'noticed', 'worked on', 'therapy', 'understand', 'insight',
      'conscious', 'deliberate', 'intentional'
    ];
    const lowAwarenessWords = [
      'first time', 'never thought', 'surprised', 'just how i am',
      'did not realize', 'never noticed', 'their problem',
      'they caused', 'not my pattern', 'news to me'
    ];

    const highCount = highAwarenessWords.filter(w => lower.includes(w)).length;
    const lowCount = lowAwarenessWords.filter(w => lower.includes(w)).length;

    if (highCount > 0 || lowCount > 0) {
      signals.awareness = highCount > lowCount
        ? Math.min(5, 3 + highCount)
        : Math.max(1, 3 - lowCount);
    }
  }

  // Amplification signals
  if (['q4_09', 'q4_11', 'q4_12'].includes(baseId)) {
    const highAmpWords = [
      'intensif', 'amplif', 'worse', 'more', 'escalate', 'compulsive',
      'could not stop', 'took over', 'different person', 'surprised',
      'lost control', 'out of character', 'changed', 'tightened',
      'rigid', 'extreme'
    ];
    const lowAmpWords = [
      'same', 'consistent', 'stable', 'steady', 'no change',
      'hold', 'balanced', 'unchanged', 'reliably', 'predictable'
    ];

    const highCount = highAmpWords.filter(w => lower.includes(w)).length;
    const lowCount = lowAmpWords.filter(w => lower.includes(w)).length;

    if (highCount > 0 || lowCount > 0) {
      signals.amplification = highCount > lowCount
        ? Math.min(5, 3 + highCount)
        : Math.max(1, 3 - lowCount);
    }
  }

  return signals;
}


// ============================================================================
// EMERGENT PATTERN DETECTION
// ============================================================================

/**
 * Detects emergent patterns from the combination of all four Quadrant results.
 * Returns the pattern identifier if one applies, or null.
 *
 * The eight patterns from Section 5:
 *   1. The Convinced Realist
 *   2. The Loyal Exile
 *   3. The Performing Sovereign
 *   4. The Tender Catastrophist
 *   5. The Invisible Architect
 *   6. The Activated Sovereign
 *   7. The Reconstructed Skeptic
 *   8. The Circling Seeker
 *
 * @param {object} q1 - Quadrant One result
 * @param {object} q2 - Quadrant Two result
 * @param {object} q3 - Quadrant Three result
 * @param {object} q4 - Quadrant Four result
 * @returns {object|null} { patternId, patternName, synthesisFrame } or null
 */
function detectEmergentPattern(q1, q2, q3, q4) {
  const q1Profile = q1.profileId;
  const q2Profile = q2.profileId;
  const q3Profile = q3.profileId;
  const q4Defense = q4.axes.defense.label;
  const q4Awareness = q4.axes.awareness.label;
  const q4Amplification = q4.axes.amplification.label;

  // Pattern One: The Convinced Realist
  // Q1: Profile 1 (Chronic, Caregiver, Unresolved)
  // Q2: Contempt or Grief
  // Q3: Intellectualization
  // Q4: High defense, high automaticity (low awareness)
  if (
    q1Profile === 1 &&
    (q2Profile === 'contempt' || q2Profile === 'grief') &&
    q3Profile === 'intellectualization' &&
    q4Defense === 'high' &&
    (q4Awareness === 'low' || q4Awareness === 'moderate')
  ) {
    return {
      patternId: 'convinced_realist',
      patternName: 'The Convinced Realist',
      synthesisFrame: 'Names the intelligence of the system while asking what the analysis is protecting against. Acknowledges the assessments are often accurate and asks what accurate assessments cost when they run faster than openness.'
    };
  }

  // Pattern Two: The Loyal Exile
  // Q1: Profile 5 (Acute, Caregiver, Unresolved)
  // Q2: Fear of Abandonment
  // Q3: Impulsive Action or Consensus Seeking
  // Q4: High defense, high amplification
  if (
    q1Profile === 5 &&
    q2Profile === 'fear_of_abandonment' &&
    (q3Profile === 'impulsive_action' || q3Profile === 'consensus_seeking') &&
    q4Defense === 'high' &&
    q4Amplification === 'high'
  ) {
    return {
      patternId: 'loyal_exile',
      patternName: 'The Loyal Exile',
      synthesisFrame: 'Names the loyalty underneath the fear. These people are often the most committed partners in any room. Honors that before naming what the commitment is costing.'
    };
  }

  // Pattern Three: The Performing Sovereign
  // Q1: Profile 1 or 2 (Chronic, Caregiver)
  // Q2: Shame
  // Q3: Silence/Withdrawal or Intellectualization
  // Q4: High defense, high awareness, variable amplification
  if (
    (q1Profile === 1 || q1Profile === 2) &&
    q2Profile === 'shame' &&
    (q3Profile === 'silence_withdrawal' || q3Profile === 'intellectualization') &&
    q4Defense === 'high' &&
    q4Awareness === 'high'
  ) {
    return {
      patternId: 'performing_sovereign',
      patternName: 'The Performing Sovereign',
      synthesisFrame: 'Names the exhaustion of the performance before naming the shame underneath it. Earns its way into the more difficult claim by demonstrating it understands how much effort the presentation requires.'
    };
  }

  // Pattern Four: The Tender Catastrophist
  // Q1: Profile 6 (Acute, Romantic, Unresolved)
  // Q2: Grief
  // Q3: Catastrophic Forward Projection
  // Q4: Moderate defense, high awareness, moderate amplification
  if (
    q1Profile === 6 &&
    q2Profile === 'grief' &&
    q3Profile === 'catastrophic_projection' &&
    (q4Defense === 'moderate' || q4Defense === 'low') &&
    q4Awareness === 'high'
  ) {
    return {
      patternId: 'tender_catastrophist',
      patternName: 'The Tender Catastrophist',
      synthesisFrame: 'Names the tenderness before naming the cost. Honors what these people offer as partners before asking what the anticipatory grief is taking from the present.'
    };
  }

  // Pattern Five: The Invisible Architect
  // Q1: Profile 1 (Chronic, Caregiver, Unresolved)
  // Q2: Shame or Fear of Abandonment
  // Q3: Consensus Seeking or Silence/Withdrawal
  // Q4: High defense, high automaticity, high amplification
  if (
    q1Profile === 1 &&
    (q2Profile === 'shame' || q2Profile === 'fear_of_abandonment') &&
    (q3Profile === 'consensus_seeking' || q3Profile === 'silence_withdrawal') &&
    q4Defense === 'high' &&
    (q4Awareness === 'low' || q4Awareness === 'moderate') &&
    q4Amplification === 'high'
  ) {
    return {
      patternId: 'invisible_architect',
      patternName: 'The Invisible Architect',
      synthesisFrame: 'The most careful synthesis. Names something the person has no frame for. Approaches through the partner experience first before turning toward the interior.'
    };
  }

  // Pattern Six: The Activated Sovereign
  // Q1: Any
  // Q2: Rage
  // Q3: Impulsive Action
  // Q4: Moderate-high defense, low-moderate awareness, high amplification
  if (
    q2Profile === 'rage' &&
    q3Profile === 'impulsive_action' &&
    (q4Defense === 'high' || q4Defense === 'moderate') &&
    (q4Awareness === 'low' || q4Awareness === 'moderate') &&
    q4Amplification === 'high'
  ) {
    return {
      patternId: 'activated_sovereign',
      patternName: 'The Activated Sovereign',
      synthesisFrame: 'Names the legitimate grievance underneath the rage before naming what the rage costs. Honors the accuracy of the perception while examining what the response produces.'
    };
  }

  // Pattern Seven: The Reconstructed Skeptic
  // Q1: Profile 4 or 6 with repair (Romantic, Repaired), but Profile 6 is unresolved,
  // so accept Profile 4 or Profile 2 (repaired histories)
  // Q2: Any
  // Q3: Intellectualization or Catastrophic Projection
  // Q4: Low-moderate defense, high awareness, moderate amplification
  if (
    (q1Profile === 2 || q1Profile === 4) &&
    (q3Profile === 'intellectualization' || q3Profile === 'catastrophic_projection') &&
    (q4Defense === 'low' || q4Defense === 'moderate') &&
    q4Awareness === 'high' &&
    (q4Amplification === 'moderate' || q4Amplification === 'low')
  ) {
    return {
      patternId: 'reconstructed_skeptic',
      patternName: 'The Reconstructed Skeptic',
      synthesisFrame: 'Names what the work has built before asking what the work has not yet reached. Written with respect for genuine progress and honest about the specific territory that self-knowledge alone cannot access.'
    };
  }

  // Pattern Eight: The Circling Seeker
  // Q1: Any
  // Q2: Fear of Abandonment or Shame
  // Q3: Dissociative Backward Anchoring
  // Q4: Moderate defense, moderate awareness, high amplification
  if (
    (q2Profile === 'fear_of_abandonment' || q2Profile === 'shame') &&
    q3Profile === 'dissociative_backward_anchoring' &&
    q4Defense === 'moderate' &&
    (q4Awareness === 'moderate' || q4Awareness === 'low') &&
    q4Amplification === 'high'
  ) {
    return {
      patternId: 'circling_seeker',
      patternName: 'The Circling Seeker',
      synthesisFrame: 'Names the past relationship directly, not its content but its gravitational pull. Tells this person they are in two relationships simultaneously and asks which one they are actually in right now.'
    };
  }

  // No named pattern matches
  return null;
}


// ============================================================================
// FULL SESSION SCORING
// ============================================================================

/**
 * Scores a complete Blueprint session and returns the full results object.
 *
 * @param {object} allResponses - { quadrant1: [...], quadrant2: [...], quadrant3: [...], quadrant4: [...] }
 * @param {object} assessmentResults - Complete RELATE assessment results
 * @returns {object} The Blueprint results object as specified in Section 8
 */
function scoreBlueprintSession(allResponses, assessmentResults) {
  const personaCode = assessmentResults.personaCode;

  const q1 = scoreQuadrantOne(allResponses.quadrant1 || []);
  const q2 = scoreQuadrantTwo(allResponses.quadrant2 || []);
  const q3 = scoreQuadrantThree(allResponses.quadrant3 || []);
  const q4 = scoreQuadrantFour(allResponses.quadrant4 || [], personaCode);

  const emergentPattern = detectEmergentPattern(q1, q2, q3, q4);

  // Flag high-value narrative responses for the report generation engine
  const flaggedResponses = flagHighValueResponses(allResponses);

  return {
    quadrant1: q1,
    quadrant2: q2,
    quadrant3: q3,
    quadrant4: q4,
    emergentPattern: emergentPattern,
    confidenceScores: {
      quadrant1: q1.confidence,
      quadrant2: q2.confidence,
      quadrant3: q3.confidence,
      quadrant4: q4.confidence
    },
    flaggedResponses,
    metadata: {
      personaCode,
      attachmentType: assessmentResults.attachmentType,
      scoredAt: new Date().toISOString()
    }
  };
}


/**
 * Flags narrative responses that contain high-value experiential material
 * for the report generation engine to draw on.
 */
function flagHighValueResponses(allResponses) {
  const flagged = [];

  const allQuadrantResponses = [
    ...(allResponses.quadrant1 || []),
    ...(allResponses.quadrant2 || []),
    ...(allResponses.quadrant3 || []),
    ...(allResponses.quadrant4 || [])
  ];

  for (const response of allQuadrantResponses) {
    if (typeof response.value === 'string') {
      const wordCount = response.value.split(/\s+/).length;

      // Flag responses that are substantive (50+ words) and contain
      // experiential markers (specific memories, somatic descriptions,
      // partner observations, gap descriptions)
      if (wordCount >= 50) {
        const lower = response.value.toLowerCase();
        const experientialMarkers = [
          'remember', 'felt', 'body', 'chest', 'stomach', 'throat',
          'partner said', 'they told me', 'was told', 'moment when',
          'specific', 'that time', 'one night', 'one day',
          'wanted to', 'instead i', 'found myself'
        ];

        const markerCount = experientialMarkers.filter(m => lower.includes(m)).length;
        if (markerCount >= 2 || wordCount >= 100) {
          flagged.push({
            questionId: response.questionId,
            quadrant: response.questionId.charAt(1),
            excerpt: response.value.substring(0, 500),
            markerCount
          });
        }
      }
    }
  }

  return flagged;
}


// ============================================================================
// SESSION MANAGEMENT API (Section 8 specified functions)
// ============================================================================

/**
 * Initializes a Blueprint session from completed RELATE assessment results.
 *
 * @param {object} assessmentResults - Must contain personaCode, attachmentType,
 *   and the persona metadata lookup context
 * @returns {object} Blueprint session configuration
 */
function initializeBlueprint(assessmentResults) {
  const { personaCode, attachmentType, gender } = assessmentResults;

  if (!personaCode || !attachmentType) {
    throw new Error('Blueprint requires completed RELATE assessment with personaCode and attachmentType.');
  }

  // Resolve persona metadata, caller must provide or we indicate it needs to be loaded
  const personaMetadata = assessmentResults.personaMetadata || null;
  const personaName = assessmentResults.personaName || null;

  let questions;
  if (personaMetadata && personaName) {
    questions = getBlueprintQuestions({
      personaCode,
      personaMetadata,
      personaName,
      attachmentType
    });
  } else {
    // Return partial config; caller must provide metadata before questions can be built
    questions = null;
  }

  return {
    sessionId: `blueprint_${Date.now()}`,
    sessionType: 'blueprint',
    fixedInputs: {
      personaCode,
      attachmentType,
      gender: gender || null,
      personaName
    },
    questions,
    quadrantCount: 4,
    currentQuadrant: 1,
    startedAt: new Date().toISOString()
  };
}

/**
 * Saves Blueprint progress at a Quadrant boundary.
 *
 * @param {number} quadrantIndex - The Quadrant just completed (1-4)
 * @param {object} responses - All responses captured to this point
 * @returns {object} Checkpoint data to be persisted under STORAGE_KEYS.checkpoint
 */
function saveBlueprintProgress(quadrantIndex, responses) {
  return {
    storageKey: STORAGE_KEYS.checkpoint,
    checkpoint: {
      quadrantIndex,
      responses,
      savedAt: new Date().toISOString()
    }
  };
}

/**
 * Generates the Blueprint report by calling the report generation engine
 * section by section as specified in Section 6.
 *
 * This function returns the structured input that the report generation
 * engine (LLM) receives. The actual LLM calls are performed by the
 * calling application layer.
 *
 * @param {object} blueprintResults - Output of scoreBlueprintSession
 * @param {object} assessmentResults - Complete RELATE assessment results
 * @param {object} personaMetadata - Persona metadata from relate_persona_definitions.js
 * @returns {object} Report generation input structured by section
 */
function generateBlueprintReport(blueprintResults, assessmentResults, personaMetadata) {
  const reportInput = {
    // Universal context passed to every section prompt
    universalContext: {
      attachmentType: assessmentResults.attachmentType,
      personaCode: assessmentResults.personaCode,
      personaName: assessmentResults.personaName || personaMetadata.name || null,
      personaMetadata: {
        traits: personaMetadata.traits,
        datingBehavior: personaMetadata.datingBehavior,
        inRelationships: personaMetadata.inRelationships,
        struggles: personaMetadata.struggles,
        disappointments: personaMetadata.disappointments,
        howValued: personaMetadata.howValued
      },
      quadrant1: blueprintResults.quadrant1,
      quadrant2: blueprintResults.quadrant2,
      quadrant3: blueprintResults.quadrant3,
      quadrant4: blueprintResults.quadrant4,
      emergentPattern: blueprintResults.emergentPattern,
      confidenceScores: blueprintResults.confidenceScores,
      flaggedResponses: blueprintResults.flaggedResponses
    },

    // Section-specific inputs
    sections: {
      relationalHistory: {
        sectionNumber: 1,
        wordRange: { min: 400, max: 500 },
        primaryInput: blueprintResults.quadrant1,
        crossQuadrantConnections: []
      },
      emotionUnderneath: {
        sectionNumber: 2,
        wordRange: { min: 400, max: 500 },
        primaryInput: blueprintResults.quadrant2,
        crossQuadrantConnections: ['quadrant1']
      },
      howYouNavigateUncertainty: {
        sectionNumber: 3,
        wordRange: { min: 400, max: 500 },
        primaryInput: blueprintResults.quadrant3,
        crossQuadrantConnections: ['quadrant2']
      },
      personaInContext: {
        sectionNumber: 4,
        wordRange: { min: 450, max: 550 },
        primaryInput: blueprintResults.quadrant4,
        crossQuadrantConnections: ['quadrant1', 'quadrant2', 'quadrant3']
      },
      thePortrait: {
        sectionNumber: 5,
        wordRange: { min: 500, max: 600 },
        primaryInput: blueprintResults.emergentPattern,
        crossQuadrantConnections: ['quadrant1', 'quadrant2', 'quadrant3', 'quadrant4']
      },
      whatThisMeansForPartnership: {
        sectionNumber: 6,
        wordRange: { min: 300, max: 400 },
        primaryInput: null, // Uses full report as context
        crossQuadrantConnections: ['quadrant1', 'quadrant2', 'quadrant3', 'quadrant4']
      },
      theGrowingEdge: {
        sectionNumber: 7,
        wordRange: { min: 200, max: 300 },
        primaryInput: null, // Uses full report as context
        crossQuadrantConnections: ['quadrant1', 'quadrant2', 'quadrant3', 'quadrant4']
      }
    },

    storageKey: STORAGE_KEYS.report
  };

  return reportInput;
}

/**
 * Generates the growth plan input structure.
 *
 * @param {object} blueprintResults - Output of scoreBlueprintSession
 * @param {object} blueprintReport - The generated report sections
 * @param {object} assessmentResults - Complete RELATE assessment results
 * @param {object} personaMetadata - Persona metadata
 * @returns {object} Growth plan generation input
 */
function generateGrowthPlan(blueprintResults, blueprintReport, assessmentResults, personaMetadata) {
  return {
    parts: {
      whatBlueprintAdds: {
        partNumber: 1,
        context: {
          blueprintResults,
          assessmentResults,
          personaMetadata
        }
      },
      reflectionPrompts: {
        partNumber: 2,
        promptCount: { min: 12, max: 15 },
        groups: ['memory_exploration', 'persona_gap_examination', 'forward_imagination'],
        context: {
          blueprintResults,
          personaMetadata
        }
      },
      specificWork: {
        partNumber: 3,
        experimentCount: { min: 2, max: 3 },
        context: {
          blueprintResults,
          assessmentResults
        }
      },
      whatToWatchFor: {
        partNumber: 4,
        context: {
          quadrant2: blueprintResults.quadrant2,
          quadrant3: blueprintResults.quadrant3,
          emergentPattern: blueprintResults.emergentPattern
        }
      }
    },
    fullReportContext: blueprintReport,
    storageKey: STORAGE_KEYS.growth
  };
}

/**
 * Generates the couples overlay input structure.
 *
 * @param {object} blueprintResults1 - Partner 1 Blueprint results
 * @param {object} blueprintResults2 - Partner 2 Blueprint results
 * @param {object} assessmentResults1 - Partner 1 RELATE results
 * @param {object} assessmentResults2 - Partner 2 RELATE results
 * @returns {object} Couples overlay generation input
 */
function generateCouplesOverlay(blueprintResults1, blueprintResults2, assessmentResults1, assessmentResults2) {
  // Determine the Q2 collision from the collision matrix
  const q2Collision = getQ2CollisionFrame(
    blueprintResults1.quadrant2.profileId,
    blueprintResults2.quadrant2.profileId
  );

  // Determine the Q3 collision from the collision library
  const q3Collision = getQ3CollisionFrame(
    blueprintResults1.quadrant3.profileId,
    blueprintResults2.quadrant3.profileId
  );

  return {
    sections: {
      systemYouHaveBuilt: {
        sectionNumber: 1,
        wordRange: { min: 250, max: 300 },
        partner1: blueprintResults1,
        partner2: blueprintResults2
      },
      emotionCollision: {
        sectionNumber: 2,
        wordRange: { min: 300, max: 350 },
        collisionFrame: q2Collision,
        partner1Emotion: blueprintResults1.quadrant2,
        partner2Emotion: blueprintResults2.quadrant2
      },
      gapBetweenYou: {
        sectionNumber: 3,
        wordRange: { min: 250, max: 300 },
        collisionFrame: q3Collision,
        partner1Mode: blueprintResults1.quadrant3,
        partner2Mode: blueprintResults2.quadrant3
      },
      whatYouMakePossible: {
        sectionNumber: 4,
        wordRange: { min: 150, max: 200 },
        partner1: blueprintResults1,
        partner2: blueprintResults2
      },
      whatBothAreAskedToUnderstand: {
        sectionNumber: 5,
        wordRange: { min: 250, max: 300 },
        partner1: blueprintResults1,
        partner2: blueprintResults2,
        assessmentResults1,
        assessmentResults2
      }
    },
    storageKey: STORAGE_KEYS.couples
  };
}


// ============================================================================
// COLLISION MATRICES (Section 7)
// ============================================================================

/**
 * Returns the collision frame for a Quadrant Two emotion pairing.
 */
function getQ2CollisionFrame(emotion1, emotion2) {
  // Normalize order for symmetric lookup
  const pair = [emotion1, emotion2].sort().join('_');

  const collisions = {
    'fear_of_abandonment_fear_of_abandonment': {
      name: 'Mutual Monitoring',
      mechanism: 'Both people are monitoring for the same signal. The pursuit behavior of one activates the withdrawal response of the other, creating a self-reinforcing cycle where each person experiences themselves as responding rather than generating.',
      misread: 'Each person experiences the other\'s response as the origin of the cycle rather than as a node within it.'
    },
    'fear_of_abandonment_shame': {
      name: 'Pursuit Meets Concealment',
      mechanism: 'The abandonment-triggered person pursues closeness. The shame-triggered person experiences closeness as increasing threat. The pursuit is experienced as pressure to be known, which is exactly what the shame architecture is organized to prevent.',
      misread: 'The abandonment person reads the withdrawal as rejection. The shame person reads the pursuit as an approach toward the verdict they most fear.'
    },
    'contempt_fear_of_abandonment': {
      name: 'Reassurance Meets Standards',
      mechanism: 'The abandonment-triggered person seeks reassurance. The contempt-triggered person experiences the need for reassurance as evidence of inadequacy, which activates the contempt response, which lands as the beginning of departure.',
      misread: 'The abandonment person experiences contempt as rejection of them personally rather than as the contempt person\'s management of their own vulnerability.'
    },
    'fear_of_abandonment_grief': {
      name: 'Pursuit Meets Impermanence',
      mechanism: 'The abandonment person pursues presence. The grief-triggered person is present with an awareness of loss that reads as distance or emotional unavailability. The grief person is not distant, they are loving with the weight of impermanence.',
      misread: 'The abandonment person\'s pursuit feels to the grief person like being rushed past the depth they need. The grief quality reads to the abandonment person as not fully there.'
    },
    'fear_of_abandonment_rage': {
      name: 'Monitoring Meets Sovereignty',
      mechanism: 'The abandonment person\'s monitoring for withdrawal activates frequently in proximity to rage because anger reads neurologically as a precursor to departure. The rage person is expressing a sovereignty response, not a prelude to leaving.',
      misread: 'The abandonment person cannot distinguish between rage and pre-departure in the moment of activation. Their de-escalation attempts land to the rage person as exactly the powerlessness the rage is organized to prevent.'
    },
    'shame_shame': {
      name: 'Mutual Concealment',
      mechanism: 'Two people organized around concealment produce a relationship that is extraordinarily warm on its surface and extraordinarily lonely underneath. Both are skilled at creating the appearance of intimacy. Neither is fully present as a known subject.',
      misread: 'Each person attributes the distance to the other\'s withholding rather than to their own.'
    },
    'contempt_shame': {
      name: 'Standards Meet Self-Protection',
      mechanism: 'The shame person experiences the contempt person\'s high standards as confirmation of their core fear. The contempt person experiences the shame person\'s careful self-presentation as a performance that prevents real contact.',
      misread: 'Both are protecting against exposure from opposite directions. The cost is that genuine vulnerability from either person feels impossible.'
    },
    'grief_shame': {
      name: 'Tenderness Meets Concealment',
      mechanism: 'The grief person\'s quality of loving with awareness of loss can feel to the shame person like being loved without condition, the corrective experience the shame architecture most needs. But the grief person\'s pre-mourning can also activate the shame person\'s fear of being found insufficient.',
      misread: 'The shame person may perform closeness rather than risk it, leaving the grief person mourning a connection that was never fully real.'
    },
    'rage_shame': {
      name: 'Intensity Meets Withdrawal',
      mechanism: 'The rage person\'s intensity activates the shame person\'s concealment response. The shame person\'s increasing invisibility reads to the rage person as dismissal or disrespect.',
      misread: 'The rage person experiences the withdrawal as contempt. The shame person experiences the intensity as condemnation. Both are wrong about the other\'s intention.'
    },
    'contempt_grief': {
      name: 'Standards Meet Tenderness',
      mechanism: 'The grief person\'s awareness of impermanence can read to the contempt person as fragility or sentimentality. The contempt person\'s response lands to the grief person as a form of loss, which deepens the grief quality.',
      misread: 'The grief person is offering exactly the depth the contempt person has organized their entire relational life around never needing.'
    },
    'contempt_rage': {
      name: 'Dual Sovereignty',
      mechanism: 'Both trigger emotions are organized around sovereignty and the refusal of powerlessness. Neither person\'s system is organized to yield. The conflicts are intense and often clarifying in the short term.',
      misread: 'The long-term dynamic depends entirely on whether both people have access to the vulnerability underneath their respective defenses.'
    },
    'grief_rage': {
      name: 'Impermanence Meets Intensity',
      mechanism: 'The grief person is often grieving the relationship in real time while still in it, partly because the rage activates a sense of precariousness. The rage person experiences the grief quality as an accusation that they are causing harm.',
      misread: 'The rage person experiences the grief as withdrawal. The grief person experiences the rage as the beginning of the end.'
    },
    'contempt_contempt': {
      name: 'Mutual Evaluation',
      mechanism: 'Both people maintain high standards as protection against vulnerability. The relationship becomes a sustained assessment where neither person yields to dependency. Respect is genuine and earned. Tenderness is the rarest currency.',
      misread: 'Each person waits for the other to lower the drawbridge first. The wait can last the entire relationship.'
    },
    'grief_grief': {
      name: 'Shared Impermanence',
      mechanism: 'Both people carry love and loss simultaneously. The relationship has an extraordinary tenderness and a specific exhaustion. Both understand the other\'s anticipatory sadness from the inside, which creates a rare intimacy. Both are also pre-mourning the same relationship at the same time.',
      misread: 'The shared pre-mourning can become a self-fulfilling prophecy when neither person challenges the assumption that loss is inevitable.'
    },
    'rage_rage': {
      name: 'Mutual Sovereignty',
      mechanism: 'Both people are organized around never being powerless. The conflicts are the most intense in the matrix. When both people have access to what is underneath the rage, the combination produces extraordinary mutual respect and fierce loyalty.',
      misread: 'Without access to the vulnerability underneath, the relationship becomes a contest of wills that neither can win and both will exhaust themselves contesting.'
    }
  };

  return collisions[pair] || {
    name: 'Complex Dynamic',
    mechanism: `The interaction between ${emotion1.replace(/_/g, ' ')} and ${emotion2.replace(/_/g, ' ')} produces a dynamic that is specific to this pairing and is explored in full in the overlay narrative.`,
    misread: 'Each person\'s response is shaped by their own trigger architecture and may not map to the other person\'s intention.'
  };
}

/**
 * Returns the collision frame for a Quadrant Three decision mode pairing.
 */
function getQ3CollisionFrame(mode1, mode2) {
  const pair = [mode1, mode2].sort().join('_');

  const collisions = {
    'impulsive_action_silence_withdrawal': {
      name: 'Action Meets Silence',
      mechanism: 'One person forces resolution. The other goes quiet. The action person experiences the silence as abandonment or contempt. The silent person experiences the action as an assault on the only regulation strategy available to them.',
      dynamic: 'The silence intensifies the action person\'s urgency. The urgency deepens the silent person\'s withdrawal. Neither can access what the other needs because what each person needs is the opposite of what the other is doing.'
    },
    'catastrophic_projection_dissociative_backward_anchoring': {
      name: 'Future Meets Past',
      mechanism: 'One person is living in the imagined future and the other is living in the past. Both are absent from the present moment in different directions.',
      dynamic: 'The catastrophist experiences the backward-anchoring person as stuck or unwilling to move forward. The backward-anchoring person experiences the catastrophist as unable to appreciate what they have. Both are doing the same thing in opposite temporal directions.'
    },
    'consensus_seeking_intellectualization': {
      name: 'External Validation Meets Internal Analysis',
      mechanism: 'One person generates frameworks and the other gathers external opinions. Neither is actually present to the relationship itself. Both modes create the appearance of processing while maintaining distance from the raw emotional experience.',
      dynamic: 'These couples often have very sophisticated conversations about their relationship and very limited access to the felt experience of being in it together.'
    }
  };

  return collisions[pair] || {
    name: 'Mode Collision',
    mechanism: `The interaction between ${mode1.replace(/_/g, ' ')} and ${mode2.replace(/_/g, ' ')} produces a specific gap that is explored in the overlay narrative.`,
    dynamic: 'Each person\'s mode represents an intelligent adaptation that collides with the other person\'s equally intelligent but differently oriented adaptation.'
  };
}


// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Storage keys
  STORAGE_KEYS,

  // Profile definitions
  Q1_PROFILES,
  Q2_PROFILES,
  Q3_PROFILES,

  // Individual quadrant scoring
  scoreQuadrantOne,
  scoreQuadrantTwo,
  scoreQuadrantThree,
  scoreQuadrantFour,

  // Emergent pattern detection
  detectEmergentPattern,

  // Full session scoring
  scoreBlueprintSession,

  // Session management API (Section 8)
  initializeBlueprint,
  saveBlueprintProgress,
  generateBlueprintReport,
  generateGrowthPlan,
  generateCouplesOverlay,

  // Collision matrices
  getQ2CollisionFrame,
  getQ3CollisionFrame
};
