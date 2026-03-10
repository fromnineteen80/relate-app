/**
 * Safety tests for original RELATE assessment scoring.
 * These ensure the Blueprint build does not break existing scoring logic.
 */
import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const relateQuestions = require('../relate_questions.js');
const personaDefs = require('../relate_persona_definitions.js');

// ── Module 1 scoring safety ──

describe('Module 1 scoring', () => {
  it('exports scoreModule1 function', () => {
    expect(typeof relateQuestions.scoreModule1).toBe('function');
  });

  it('exports question banks for both genders', () => {
    expect(relateQuestions.MEN_MODULE1_QUESTIONS).toBeDefined();
    expect(relateQuestions.WOMEN_MODULE1_QUESTIONS).toBeDefined();
  });

  it('scores M1 with fixture data and produces a persona code', () => {
    const menQs = relateQuestions.MEN_MODULE1_QUESTIONS;
    const responses = {};
    for (const dim of ['physical', 'social', 'lifestyle', 'values']) {
      const dimData = menQs[dim];
      if (!dimData) continue;
      for (const type of ['likertDirect', 'likertBehavioral']) {
        const group = dimData[type];
        if (!group) continue;
        for (const pole of ['poleA', 'poleB']) {
          if (group[pole]) {
            for (const q of group[pole]) {
              responses[q.id] = 3;
            }
          }
        }
      }
      if (dimData.forcedChoice) {
        for (const q of dimData.forcedChoice) {
          responses[q.id] = 'A';
        }
      }
    }
    const result = relateQuestions.scoreModule1('M', responses);
    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
    expect(result.dimensions).toBeDefined();
    expect(result.dimensions.physical).toBeDefined();
    expect(result.dimensions.social).toBeDefined();
    expect(result.dimensions.lifestyle).toBeDefined();
    expect(result.dimensions.values).toBeDefined();
  });
});

// ── Module 2 scoring safety ──

describe('Module 2 scoring', () => {
  it('exports scoreModule2 function', () => {
    expect(typeof relateQuestions.scoreModule2).toBe('function');
  });

  it('scores M2 with fixture data and produces a persona code', () => {
    const menQs = relateQuestions.MEN_MODULE2_QUESTIONS;
    const responses = {};
    for (const dim of ['physical', 'social', 'lifestyle', 'values']) {
      const dimData = menQs[dim];
      if (!dimData) continue;
      for (const type of ['likertDirect', 'likertBehavioral']) {
        const group = dimData[type];
        if (!group) continue;
        for (const pole of ['poleA', 'poleB']) {
          if (group[pole]) {
            for (const q of group[pole]) {
              responses[q.id] = 3;
            }
          }
        }
      }
      if (dimData.forcedChoice) {
        for (const q of dimData.forcedChoice) {
          responses[q.id] = 'A';
        }
      }
    }
    const result = relateQuestions.scoreModule2('M', responses);
    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
    expect(result.code).toHaveLength(4);
  });
});

// ── Module 3 scoring safety ──

describe('Module 3 scoring', () => {
  it('exports scoreModule3 function', () => {
    expect(typeof relateQuestions.scoreModule3).toBe('function');
  });

  it('scores M3 and produces a type name', () => {
    const menQs = relateQuestions.MEN_M3_QUESTIONS;
    const responses = {};
    for (const section of ['want', 'offer', 'attentiveness']) {
      const qs = menQs[section];
      if (qs) {
        for (const q of qs) {
          responses[q.id] = 3;
        }
      }
    }
    const result = relateQuestions.scoreModule3('M', responses);
    expect(result).toBeDefined();
    expect(result.typeName).toBeDefined();
    expect(result.wantScore).toBeDefined();
    expect(result.offerScore).toBeDefined();
  });
});

// ── Module 4 scoring safety ──

describe('Module 4 scoring', () => {
  it('exports scoreModule4 function', () => {
    expect(typeof relateQuestions.scoreModule4).toBe('function');
  });

  it('scores M4 without throwing', () => {
    const menQs = relateQuestions.MEN_M4_QUESTIONS;
    const responses = {};
    for (const section of ['conflictApproach', 'emotionalDrivers', 'repairRecovery', 'emotionalCapacity', 'gottmanScreener', 'attentiveness']) {
      const qs = menQs[section];
      if (qs) {
        for (const q of qs) {
          responses[q.id] = 3;
        }
      }
    }
    const result = relateQuestions.scoreModule4('M', responses);
    expect(result).toBeDefined();
  });
});

// ── Persona definitions safety ──

describe('Persona definitions', () => {
  it('exports persona metadata for 16 male personas', () => {
    expect(personaDefs.M2_PERSONA_METADATA).toBeDefined();
    const codes = Object.keys(personaDefs.M2_PERSONA_METADATA);
    expect(codes.length).toBe(16);
  });

  it('exports persona metadata for 16 female personas', () => {
    expect(personaDefs.W2_PERSONA_METADATA).toBeDefined();
    const codes = Object.keys(personaDefs.W2_PERSONA_METADATA);
    expect(codes.length).toBe(16);
  });

  it('each male persona has a name', () => {
    for (const [code, meta] of Object.entries(personaDefs.M2_PERSONA_METADATA)) {
      expect(personaDefs.getPersonaName(code, 'M'), `${code} missing name`).toBeDefined();
    }
  });

  it('getFullProfile returns data for valid code', () => {
    expect(typeof personaDefs.getFullProfile).toBe('function');
    const profile = personaDefs.getFullProfile('ACEG', 'M');
    expect(profile).toBeDefined();
  });
});
