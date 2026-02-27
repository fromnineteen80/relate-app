// Question flattening utilities for the assessment UI
// The source files use nested structures; we flatten them into linear arrays for display.

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
 * Flatten M1/M2 question structure into a linear array.
 * Structure: { physical: { likertDirect: { poleA: [], poleB: [] }, likertBehavioral: { poleA: [], poleB: [] }, forcedChoice: [] }, social: {...}, ... }
 */
export function flattenM1M2Questions(questionBank: Record<string, unknown>): FlatQuestion[] {
  const questions: FlatQuestion[] = [];
  const dimensions = ['physical', 'social', 'lifestyle', 'values'];

  for (const dim of dimensions) {
    const dimData = questionBank[dim] as Record<string, unknown>;
    if (!dimData) continue;

    // Likert Direct questions
    const likertDirect = dimData.likertDirect as Record<string, unknown[]> | undefined;
    if (likertDirect) {
      for (const pole of ['poleA', 'poleB']) {
        const qs = likertDirect[pole] as Array<Record<string, unknown>> | undefined;
        if (qs) {
          for (const q of qs) {
            questions.push({
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

    // Likert Behavioral questions
    const likertBehavioral = dimData.likertBehavioral as Record<string, unknown[]> | undefined;
    if (likertBehavioral) {
      for (const pole of ['poleA', 'poleB']) {
        const qs = likertBehavioral[pole] as Array<Record<string, unknown>> | undefined;
        if (qs) {
          for (const q of qs) {
            questions.push({
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

    // Forced Choice questions
    const forcedChoice = dimData.forcedChoice as Array<Record<string, unknown>> | undefined;
    if (forcedChoice) {
      for (const q of forcedChoice) {
        questions.push({
          id: q.id as string,
          text: q.stem as string || q.text as string || '',
          stem: q.stem as string,
          optionA: q.optionA as string,
          optionB: q.optionB as string,
          type: 'forced_choice',
        });
      }
    }
  }

  return questions;
}

/**
 * Flatten M3 question structure into a linear array.
 * Structure: { want: [...], offer: [...], attentiveness: [...] }
 */
export function flattenM3Questions(questionBank: Record<string, unknown>): FlatQuestion[] {
  const questions: FlatQuestion[] = [];

  for (const section of ['want', 'offer', 'attentiveness']) {
    const qs = questionBank[section] as Array<Record<string, unknown>> | undefined;
    if (qs) {
      for (const q of qs) {
        questions.push({
          id: q.id as string,
          text: q.text as string,
          type: 'likert',
          pole: q.pole as string,
          reversed: q.reversed as boolean,
          scenario: q.scenario as string,
          section,
        });
      }
    }
  }

  return questions;
}

/**
 * Flatten M4 question structure into a linear array.
 * Structure: { conflictApproach: [...], emotionalDrivers: [...], repairRecovery: [...], emotionalCapacity: [...], gottmanScreener: [...], attentiveness: [...] }
 */
export function flattenM4Questions(questionBank: Record<string, unknown>): FlatQuestion[] {
  const questions: FlatQuestion[] = [];

  for (const section of ['conflictApproach', 'emotionalDrivers', 'repairRecovery', 'emotionalCapacity', 'gottmanScreener', 'attentiveness']) {
    const qs = questionBank[section] as Array<Record<string, unknown>> | undefined;
    if (qs) {
      for (const q of qs) {
        questions.push({
          id: q.id as string,
          text: q.text as string,
          type: 'likert',
          pole: q.pole as string,
          reversed: q.reversed as boolean,
          subscale: q.subscale as string,
          section,
        });
      }
    }
  }

  return questions;
}
