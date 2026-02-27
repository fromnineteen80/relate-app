// Wrapper for the scoring functions from relate_questions.js
// These are CommonJS modules, so we import them as needed.

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

let questionsModule: any = null;

function getModule() {
  if (!questionsModule) {
    questionsModule = require('../../relate_questions.js');
  }
  return questionsModule;
}

export function getM1Questions(gender: string) {
  const mod = getModule();
  return gender === 'M' ? mod.MEN_MODULE1_QUESTIONS : mod.WOMEN_MODULE1_QUESTIONS;
}

export function getM2Questions(gender: string) {
  const mod = getModule();
  return gender === 'M' ? mod.MEN_MODULE2_QUESTIONS : mod.WOMEN_MODULE2_QUESTIONS;
}

export function getM3Questions(gender: string) {
  const mod = getModule();
  return gender === 'M' ? mod.MEN_M3_QUESTIONS : mod.WOMEN_M3_QUESTIONS;
}

export function getM4Questions(gender: string) {
  const mod = getModule();
  return gender === 'M' ? mod.MEN_M4_QUESTIONS : mod.WOMEN_M4_QUESTIONS;
}

export function scoreModule1(gender: string, responses: Record<string, any>) {
  return getModule().scoreModule1(gender === 'M' ? 'male' : 'female', responses);
}

export function scoreModule2(gender: string, responses: Record<string, any>) {
  return getModule().scoreModule2(gender === 'M' ? 'male' : 'female', responses);
}

export function scoreModule3(gender: string, responses: Record<string, any>) {
  return getModule().scoreModule3(gender === 'M' ? 'male' : 'female', responses);
}

export function scoreModule4(gender: string, responses: Record<string, any>) {
  return getModule().scoreModule4(gender === 'M' ? 'male' : 'female', responses);
}

export function scoreAttentiveness(
  allResponses: Record<string, any>,
  gender: string,
  m3Scores: any,
  gottmanScores: any,
  selfPerceptionGap: number
) {
  return getModule().scoreAttentiveness(allResponses, gender === 'M' ? 'male' : 'female', m3Scores, gottmanScores, selfPerceptionGap);
}

export function validateResponses(responses: Record<string, any>, gender: string) {
  return getModule().validateResponses(responses, gender === 'M' ? 'male' : 'female');
}

export function getPersonaName(code: string, gender: string) {
  return getModule().getPersonaName?.(code, gender === 'M' ? 'male' : 'female') || code;
}
