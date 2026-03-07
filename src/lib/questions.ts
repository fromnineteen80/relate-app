// Question flattening utilities for the assessment UI
// The source files use nested structures; we flatten them into linear arrays for display.
// Within each section/dimension, questions are shuffled using a seed so that
// pole-A and pole-B items interleave, reducing the "same question again" feel.

export type FlatQuestion = {
  id: string;
  text: string;
  type: 'direct' | 'behavioral' | 'forced_choice' | 'likert';
  pole?: string;
  reverseCoded?: boolean;
  reversed?: boolean;
  // Forced choice fields
  stem?: string;
  optionA?: string;
  optionB?: string;
  // M3/M4 fields
  scenario?: string;
  section?: string;
  subscale?: string;
};

/**
 * Seeded PRNG (mulberry32). Deterministic shuffle for a given seed string.
 */
function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return h >>> 0;
}

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Flatten M1/M2 question structure into a linear array.
 * Dimensions stay in order (physical → social → lifestyle → values).
 * Within each dimension, likert questions (direct + behavioral, all poles)
 * are shuffled together so poles interleave. Forced choice stays at the end
 * of each dimension since it uses a different UI interaction.
 */
export function flattenM1M2Questions(questionBank: Record<string, unknown>, seed?: string): FlatQuestion[] {
  const questions: FlatQuestion[] = [];
  const dimensions = ['physical', 'social', 'lifestyle', 'values'];
  const rand = seed ? seededRandom(hashSeed(seed)) : null;

  for (const dim of dimensions) {
    const dimData = questionBank[dim] as Record<string, unknown>;
    if (!dimData) continue;

    // Collect all likert questions (direct + behavioral, both poles)
    const likertBatch: FlatQuestion[] = [];

    const likertDirect = dimData.likertDirect as Record<string, unknown[]> | undefined;
    if (likertDirect) {
      for (const pole of ['poleA', 'poleB']) {
        const qs = likertDirect[pole] as Array<Record<string, unknown>> | undefined;
        if (qs) {
          for (const q of qs) {
            likertBatch.push({
              id: q.id as string,
              text: q.text as string,
              type: 'direct',
              pole: q.pole as string,
              reverseCoded: q.reverseCoded as boolean,
            });
          }
        }
      }
    }

    const likertBehavioral = dimData.likertBehavioral as Record<string, unknown[]> | undefined;
    if (likertBehavioral) {
      for (const pole of ['poleA', 'poleB']) {
        const qs = likertBehavioral[pole] as Array<Record<string, unknown>> | undefined;
        if (qs) {
          for (const q of qs) {
            likertBatch.push({
              id: q.id as string,
              text: q.text as string,
              type: 'behavioral',
              pole: q.pole as string,
              reverseCoded: q.reverseCoded as boolean,
            });
          }
        }
      }
    }

    // Shuffle likert batch if seed provided
    questions.push(...(rand ? shuffleArray(likertBatch, rand) : likertBatch));

    // Forced choice stays at end of dimension (different UI type)
    const fcBatch: FlatQuestion[] = [];
    const forcedChoice = dimData.forcedChoice as Array<Record<string, unknown>> | undefined;
    if (forcedChoice) {
      for (const q of forcedChoice) {
        fcBatch.push({
          id: q.id as string,
          text: q.stem as string || q.text as string || '',
          stem: q.stem as string,
          optionA: q.optionA as string,
          optionB: q.optionB as string,
          type: 'forced_choice',
        });
      }
    }
    questions.push(...(rand ? shuffleArray(fcBatch, rand) : fcBatch));
  }

  return questions;
}

/**
 * Flatten M3 question structure into a linear array.
 * Sections stay in order (want → offer → attentiveness).
 * Questions shuffled within each section.
 */
export function flattenM3Questions(questionBank: Record<string, unknown>, seed?: string): FlatQuestion[] {
  const questions: FlatQuestion[] = [];
  const rand = seed ? seededRandom(hashSeed(seed)) : null;

  for (const section of ['want', 'offer', 'attentiveness']) {
    const qs = questionBank[section] as Array<Record<string, unknown>> | undefined;
    if (qs) {
      const batch: FlatQuestion[] = [];
      for (const q of qs) {
        batch.push({
          id: q.id as string,
          text: q.text as string,
          type: 'likert',
          pole: q.pole as string,
          reversed: q.reversed as boolean,
          scenario: q.scenario as string,
          section,
        });
      }
      questions.push(...(rand ? shuffleArray(batch, rand) : batch));
    }
  }

  return questions;
}

/**
 * Flatten M4 question structure into a linear array.
 * Sections stay in order. Questions shuffled within each section.
 */
export function flattenM4Questions(questionBank: Record<string, unknown>, seed?: string): FlatQuestion[] {
  const questions: FlatQuestion[] = [];
  const rand = seed ? seededRandom(hashSeed(seed)) : null;

  for (const section of ['conflictApproach', 'emotionalDrivers', 'repairRecovery', 'emotionalCapacity', 'gottmanScreener', 'attentiveness']) {
    const qs = questionBank[section] as Array<Record<string, unknown>> | undefined;
    if (qs) {
      const batch: FlatQuestion[] = [];
      for (const q of qs) {
        batch.push({
          id: q.id as string,
          text: q.text as string,
          type: 'likert',
          pole: q.pole as string,
          reversed: q.reversed as boolean,
          subscale: q.subscale as string,
          section,
        });
      }
      questions.push(...(rand ? shuffleArray(batch, rand) : batch));
    }
  }

  return questions;
}

/**
 * Flatten M5 question structure into a linear array.
 * Sections stay in order. Questions shuffled within each section.
 */
export function flattenM5Questions(questionBank: Record<string, unknown>, seed?: string): FlatQuestion[] {
  const questions: FlatQuestion[] = [];
  const rand = seed ? seededRandom(hashSeed(seed)) : null;

  for (const section of ['vulnerability', 'eroticDimension', 'attractionAttachment', 'intimacyConflictBridge', 'internalConflictCoherence']) {
    const qs = questionBank[section] as Array<Record<string, unknown>> | undefined;
    if (qs) {
      const batch: FlatQuestion[] = [];
      for (const q of qs) {
        batch.push({
          id: q.id as string,
          text: q.text as string,
          type: 'likert',
          reversed: q.reversed as boolean,
          section,
        });
      }
      questions.push(...(rand ? shuffleArray(batch, rand) : batch));
    }
  }

  return questions;
}
