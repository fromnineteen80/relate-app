/**
 * Tests for Blueprint (attachment style) scoring engine.
 * Validates pattern routing, axis calculations, and emergent pattern detection.
 */
import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const scoring = require('../relate_attachment_scoring.js');
const questions = require('../relate_attachment_questions.js');
const personaDefs = require('../relate_persona_definitions.js');

// Helper to get persona metadata for tests
const TEST_CODE = 'ACEG';
const TEST_GENDER = 'M';
const TEST_META = personaDefs.M2_PERSONA_METADATA[TEST_CODE];
const TEST_NAME = personaDefs.getPersonaName(TEST_CODE, TEST_GENDER);

// ── Exports ──

describe('Blueprint scoring exports', () => {
  it('exports all required functions', () => {
    expect(typeof scoring.scoreQuadrantOne).toBe('function');
    expect(typeof scoring.scoreQuadrantTwo).toBe('function');
    expect(typeof scoring.scoreQuadrantThree).toBe('function');
    expect(typeof scoring.scoreQuadrantFour).toBe('function');
    expect(typeof scoring.detectEmergentPattern).toBe('function');
    expect(typeof scoring.scoreAttachmentSession).toBe('function');
    expect(typeof scoring.initializeAttachment).toBe('function');
    expect(typeof scoring.saveAttachmentProgress).toBe('function');
  });

  it('exports pattern definitions', () => {
    expect(scoring.Q1_PATTERNS).toBeDefined();
    expect(Object.keys(scoring.Q1_PATTERNS).length).toBe(6);
    expect(scoring.Q2_EMOTIONS).toBeDefined();
    expect(Object.keys(scoring.Q2_EMOTIONS).length).toBe(5);
    expect(scoring.Q3_MODES).toBeDefined();
    expect(Object.keys(scoring.Q3_MODES).length).toBe(6);
  });

  it('exports storage keys', () => {
    expect(scoring.STORAGE_KEYS).toBeDefined();
    expect(scoring.STORAGE_KEYS.checkpoint).toBe('relate_blueprint_checkpoint');
    expect(scoring.STORAGE_KEYS.results).toBe('relate_blueprint_results');
  });
});

// ── Question bank ──

describe('Blueprint question bank', () => {
  it('exports question banks for Q1-Q3', () => {
    expect(questions.QUADRANT_ONE_QUESTIONS).toBeDefined();
    expect(questions.QUADRANT_TWO_QUESTIONS).toBeDefined();
    expect(questions.QUADRANT_THREE_QUESTIONS).toBeDefined();
  });

  it('Q1 questions have required fields', () => {
    for (const q of questions.QUADRANT_ONE_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.text || q.prompt).toBeDefined();
    }
  });

  it('builds Q4 questions from persona code', () => {
    expect(typeof questions.buildQuadrantFourQuestions).toBe('function');
    const q4 = questions.buildQuadrantFourQuestions(TEST_CODE, TEST_META, TEST_NAME);
    expect(Array.isArray(q4)).toBe(true);
    expect(q4.length).toBeGreaterThan(0);
  });

  it('getAttachmentQuestions returns full question set', () => {
    expect(typeof questions.getAttachmentQuestions).toBe('function');
    const all = questions.getAttachmentQuestions({
      personaCode: TEST_CODE,
      personaMetadata: TEST_META,
      personaName: TEST_NAME,
      attachmentType: 'Anchored'
    });
    expect(all).toBeDefined();
  });
});

// ── Quadrant One scoring ──

describe('Quadrant One scoring', () => {
  it('routes to one of 6 patterns', () => {
    const q1Questions = questions.QUADRANT_ONE_QUESTIONS;
    const responses = q1Questions.map(q => ({
      questionId: q.id,
      value: q.format === 'narrative'
        ? 'I remember feeling uncertain about whether my mother would be emotionally available. The anxiety was always there, a low hum that never fully resolved.'
        : 4
    }));

    const result = scoring.scoreQuadrantOne(responses);
    expect(result).toBeDefined();
    expect(result.patternId).toBeDefined();
    expect(result.patternName).toBeDefined();
    expect(result.dimensions).toBeDefined();
    expect(result.confidence).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.patternId).toBeGreaterThanOrEqual(1);
    expect(result.patternId).toBeLessThanOrEqual(6);
  });
});

// ── Quadrant Two scoring ──

describe('Quadrant Two scoring', () => {
  it('routes to one of 5 trigger emotions', () => {
    const q2Questions = questions.QUADRANT_TWO_QUESTIONS;
    const responses = q2Questions.map(q => ({
      questionId: q.id,
      value: q.format === 'narrative'
        ? 'When my partner goes quiet, the first thing I feel is a sinking in my chest and an overwhelming urge to reach out immediately.'
        : 4
    }));

    const result = scoring.scoreQuadrantTwo(responses);
    expect(result).toBeDefined();
    expect(result.patternId).toBeDefined();
    expect(result.patternName).toBeDefined();
    expect(result.confidence).toBeDefined();
    const validEmotions = ['fear_of_abandonment', 'shame', 'contempt', 'grief', 'rage'];
    expect(validEmotions).toContain(result.patternId);
  });
});

// ── Quadrant Three scoring ──

describe('Quadrant Three scoring', () => {
  it('routes to one of 6 decision modes', () => {
    const q3Questions = questions.QUADRANT_THREE_QUESTIONS;
    const responses = q3Questions.map(q => ({
      questionId: q.id,
      value: q.format === 'narrative'
        ? 'I tend to think through every possible outcome before I act. I analyze what happened, build frameworks.'
        : 4
    }));

    const result = scoring.scoreQuadrantThree(responses);
    expect(result).toBeDefined();
    expect(result.patternId).toBeDefined();
    expect(result.patternName).toBeDefined();
    expect(result.axes).toBeDefined();
    expect(result.confidence).toBeDefined();
    const validModes = ['intellectualization', 'impulsive_action', 'consensus_seeking', 'silence_withdrawal', 'catastrophic_projection', 'dissociative_backward_anchoring'];
    expect(validModes).toContain(result.patternId);
  });
});

// ── Emergent pattern detection ──

describe('Emergent pattern detection', () => {
  it('returns null or a valid pattern', () => {
    const q1 = { patternId: 1, patternName: 'Chronic, Caregiver, Unresolved' };
    const q2 = { patternId: 'contempt', patternName: 'Contempt' };
    const q3 = { patternId: 'intellectualization', patternName: 'Intellectualization' };
    const q4 = { axes: { defense: 4, awareness: 1, amplification: 4 } };

    const result = scoring.detectEmergentPattern(q1, q2, q3, q4);
    if (result) {
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.frame).toBeDefined();
    }
  });

  it('does not throw for any combination', () => {
    const q1 = { patternId: 4, patternName: 'Chronic, Romantic, Repaired' };
    const q2 = { patternId: 'fear_of_abandonment', patternName: 'Fear of Abandonment' };
    const q3 = { patternId: 'impulsive_action', patternName: 'Impulsive Action' };
    const q4 = { axes: { defense: 1, awareness: 4, amplification: 1 } };

    expect(() => scoring.detectEmergentPattern(q1, q2, q3, q4)).not.toThrow();
  });
});

// ── Full session scoring ──

describe('Full session scoring', () => {
  it('scores a complete session with all 4 quadrants', () => {
    const q1Responses = questions.QUADRANT_ONE_QUESTIONS.map(q => ({
      questionId: q.id,
      value: q.format === 'narrative' ? 'A memory of emotional distance in childhood.' : 3
    }));
    const q2Responses = questions.QUADRANT_TWO_QUESTIONS.map(q => ({
      questionId: q.id,
      value: q.format === 'narrative' ? 'I feel fear rising when connection is uncertain.' : 3
    }));
    const q3Responses = questions.QUADRANT_THREE_QUESTIONS.map(q => ({
      questionId: q.id,
      value: q.format === 'narrative' ? 'I go quiet and withdraw to think things through.' : 3
    }));
    const q4Questions = questions.buildQuadrantFourQuestions(TEST_CODE, TEST_META, TEST_NAME);
    const q4Responses = q4Questions.map(q => ({
      questionId: q.id,
      value: q.format === 'narrative' ? 'In dating I become more guarded than usual.' : 3
    }));

    const allResponses = {
      quadrant1: q1Responses,
      quadrant2: q2Responses,
      quadrant3: q3Responses,
      quadrant4: q4Responses
    };

    const personaMetadata = { code: 'ACEG', name: 'The Curator' };
    const result = scoring.scoreAttachmentSession(allResponses, personaMetadata);

    expect(result).toBeDefined();
    expect(result.quadrant1).toBeDefined();
    expect(result.quadrant2).toBeDefined();
    expect(result.quadrant3).toBeDefined();
    expect(result.quadrant4).toBeDefined();
    expect(result.quadrant1.patternId).toBeDefined();
    expect(result.quadrant2.patternId).toBeDefined();
    expect(result.quadrant3.patternId).toBeDefined();
    expect(result.quadrant4.axes).toBeDefined();
  });
});

// ── Collision matrices ──

describe('Collision matrices', () => {
  it('getQ2CollisionFrame returns frame for valid emotion pair', () => {
    const frame = scoring.getQ2CollisionFrame('fear_of_abandonment', 'shame');
    expect(frame).toBeDefined();
    expect(frame.name).toBeDefined();
    expect(frame.mechanism).toBeDefined();
  });

  it('getQ3CollisionFrame returns frame for valid mode pair', () => {
    const frame = scoring.getQ3CollisionFrame('impulsive_action', 'silence_withdrawal');
    if (frame) {
      expect(frame.name).toBeDefined();
      expect(frame.mechanism).toBeDefined();
    }
  });
});
