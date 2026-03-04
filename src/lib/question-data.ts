// Client-side question data loader
// Since relate_questions.js is CommonJS and very large, we load questions
// via an API route that returns the flattened question arrays.
// A seed (typically user ID) is passed so question order within each section
// is shuffled deterministically per user, breaking up pole redundancy.

import { FlatQuestion } from './questions';

const questionCache: Record<string, FlatQuestion[]> = {};

export async function loadModuleQuestions(moduleNumber: number, gender: string, seed?: string): Promise<FlatQuestion[]> {
  const key = `m${moduleNumber}_${gender}_${seed || 'noseed'}`;
  if (questionCache[key]) return questionCache[key];

  const params = new URLSearchParams({ module: String(moduleNumber), gender });
  if (seed) params.set('seed', seed);

  const res = await fetch(`/api/questions?${params}`);
  if (!res.ok) throw new Error('Failed to load questions');
  const data = await res.json();
  questionCache[key] = data.questions;
  return data.questions;
}
