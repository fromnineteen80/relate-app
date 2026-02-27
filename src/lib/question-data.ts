// Client-side question data loader
// Since relate_questions.js is CommonJS and very large, we load questions
// via an API route that returns the flattened question arrays.

import { FlatQuestion } from './questions';

const questionCache: Record<string, FlatQuestion[]> = {};

export async function loadModuleQuestions(moduleNumber: number, gender: string): Promise<FlatQuestion[]> {
  const key = `m${moduleNumber}_${gender}`;
  if (questionCache[key]) return questionCache[key];

  const res = await fetch(`/api/questions?module=${moduleNumber}&gender=${gender}`);
  if (!res.ok) throw new Error('Failed to load questions');
  const data = await res.json();
  questionCache[key] = data.questions;
  return data.questions;
}
