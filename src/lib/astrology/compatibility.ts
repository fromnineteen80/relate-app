/**
 * Dynamic Astrology Compatibility Generator
 *
 * Generates personalized dating reads for each of the 12 partner Sun signs
 * relative to the user's specific Sun, Moon, and Rising placements.
 * Gender-aware via AstroGenderContext.
 *
 * Used by the cheat sheet and profile pages.
 */

import type { ZodiacSign, BirthChartResult } from './engine';
import { SIGN_DATA, type SignData } from './signs';
import type { AstroGenderContext } from './gender-context';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Element Compatibility Matrix ───

type Element = 'Fire' | 'Earth' | 'Air' | 'Water';

const ELEMENT_COMPAT: Record<Element, Record<Element, 'natural' | 'complementary' | 'challenging' | 'neutral'>> = {
  Fire:  { Fire: 'natural', Earth: 'challenging', Air: 'complementary', Water: 'challenging' },
  Earth: { Fire: 'challenging', Earth: 'natural', Air: 'challenging', Water: 'complementary' },
  Air:   { Fire: 'complementary', Air: 'natural', Earth: 'challenging', Water: 'neutral' },
  Water: { Fire: 'challenging', Earth: 'complementary', Air: 'neutral', Water: 'natural' },
};

export function getElementCompat(userElement: Element, partnerElement: Element): 'natural' | 'complementary' | 'challenging' | 'neutral' {
  return ELEMENT_COMPAT[userElement][partnerElement];
}

// ─── Modality Dynamics ───

type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

function getModalityDynamic(userMod: Modality, partnerMod: Modality, ctx: AstroGenderContext): string {
  const p = ctx.partnerPronoun;
  const P = p.charAt(0).toUpperCase() + p.slice(1);
  const po = ctx.partnerPossessive;

  const table: Record<Modality, Record<Modality, string>> = {
    Cardinal: {
      Cardinal: 'Both of you lead, which creates momentum but can also create power struggles over direction.',
      Fixed:    `${P} holds steady while you initiate. This can feel like a perfect balance or like pushing against a wall.`,
      Mutable:  `${P} adapts easily to your direction. The flow is natural, but you may wish ${p} pushed back more.`,
    },
    Fixed: {
      Cardinal: `You hold your ground while ${p} charges ahead. This creates stability but can spark friction when neither yields.`,
      Fixed:    'Two immovable forces. The loyalty runs deep, but compromise requires real effort from both sides.',
      Mutable:  `${P} bends while you stand firm. ${P} may feel like ${p} is always adjusting, so watch for quiet resentment.`,
    },
    Mutable: {
      Cardinal: `${P} leads and you adapt, which feels easy at first. Make sure your own voice stays in the conversation.`,
      Fixed:    `${P.charAt(0).toUpperCase() + po.slice(1)} steadiness grounds your flexibility. You bring variety while ${p} brings structure.`,
      Mutable:  'Both of you flow and adjust freely. The connection feels effortless, but someone needs to make decisions.',
    },
  };

  // Fix the Mutable-Fixed case (possessive form)
  if (userMod === 'Mutable' && partnerMod === 'Fixed') {
    return `${ctx.partnerPossessive.charAt(0).toUpperCase() + ctx.partnerPossessive.slice(1)} steadiness grounds your flexibility. You bring variety while ${p} brings structure.`;
  }

  return table[userMod][partnerMod];
}

// ─── Element Personality Templates (for user profile cards) ───

const SUN_ELEMENT_READS: Record<Element, (sign: ZodiacSign) => string> = {
  Fire: (sign) => `Your ${sign} Sun burns with initiative and honesty. You show up in relationships with directness and passion, and you expect the same energy returned. You are not interested in games or half measures. When you love, you love openly, and when something is wrong, you say so.`,
  Earth: (sign) => `Your ${sign} Sun is rooted in loyalty and practicality. You show love through consistency, through showing up, through building something real over time. You do not chase sparks. You build fires that last, and you expect a partner who values substance over flash.`,
  Air: (sign) => `Your ${sign} Sun lives in connection and ideas. You process the world through conversation and need a partner who can meet you there. Intellectual chemistry is not optional for you. It is the foundation everything else is built on.`,
  Water: (sign) => `Your ${sign} Sun feels everything deeply, even when you do not show it. Emotional intelligence is your core strength, and you read people with startling accuracy. You need a partner who is willing to go beneath the surface with you.`,
};

const MOON_ELEMENT_READS: Record<Element, (sign: ZodiacSign) => string> = {
  Fire: (sign) => `With your Moon in ${sign}, your emotional instinct is to act. When feelings arise, you want to move, solve, or express immediately. You need a partner who can handle your intensity without asking you to slow down or quiet down.`,
  Earth: (sign) => `With your Moon in ${sign}, you process emotions through your body and your routines. You need physical comfort, predictability, and a partner who proves their feelings through actions, not just words. Consistency is your emotional oxygen.`,
  Air: (sign) => `With your Moon in ${sign}, you process feelings by talking them through. You need a partner who listens without fixing and who understands that your need to analyze emotions is how you make sense of them, not how you avoid them.`,
  Water: (sign) => `With your Moon in ${sign}, your emotional world runs deep and tidal. You absorb the moods around you and need a partner who is emotionally present without being chaotic. Safety comes before vulnerability for you, always.`,
};

const RISING_ELEMENT_READS: Record<Element, (sign: ZodiacSign) => string> = {
  Fire: (sign) => `With ${sign} Rising, people experience your energy before your words. You come across as confident and direct, sometimes before you even feel that way inside. First impressions read as bold, which attracts some and intimidates others.`,
  Earth: (sign) => `With ${sign} Rising, you come across as grounded, composed, and trustworthy. People feel at ease around you quickly. Your first impression is calm capability, even on days when you feel anything but.`,
  Air: (sign) => `With ${sign} Rising, you come across as engaging, quick, and socially fluent. People are drawn to your curiosity and conversation. The first impression is warmth with intellect behind it.`,
  Water: (sign) => `With ${sign} Rising, people sense depth in you immediately. There is something perceptive about your presence that makes others feel seen. First impressions read as empathetic and a little guarded, which draws people in.`,
};

// ─── Compatibility Read Generator ───

export type CompatibilityRead = {
  dating: string;
  strength: string;
  challenge: string;
  tip: string;
};

export type PersonalProfileRead = {
  sunRead: string;
  moonRead: string;
  risingRead: string;
};

/**
 * Generate personalized Sun/Moon/Rising profile descriptions
 * based on the user's actual chart placements.
 */
export function generateProfileReads(chart: BirthChartResult): PersonalProfileRead {
  const sunData = SIGN_DATA[chart.sun.sign];
  const moonData = SIGN_DATA[chart.moon.sign];
  const risingData = SIGN_DATA[chart.rising.sign];

  return {
    sunRead: SUN_ELEMENT_READS[sunData.element](chart.sun.sign),
    moonRead: MOON_ELEMENT_READS[moonData.element](chart.moon.sign),
    risingRead: RISING_ELEMENT_READS[risingData.element](chart.rising.sign),
  };
}

/**
 * Generate a personalized compatibility read for a specific partner Sun sign
 * relative to the user's chart. Pass ctx for gender-aware language.
 */
export function generateCompatibilityRead(
  userChart: BirthChartResult,
  partnerSunSign: ZodiacSign,
  ctx: AstroGenderContext,
): CompatibilityRead {
  const userSun = SIGN_DATA[userChart.sun.sign];
  const userMoon = SIGN_DATA[userChart.moon.sign];
  const partnerSign = SIGN_DATA[partnerSunSign];

  const sunCompat = ELEMENT_COMPAT[userSun.element][partnerSign.element];
  const moonCompat = ELEMENT_COMPAT[userMoon.element][partnerSign.element];
  const modalityNote = getModalityDynamic(userSun.modality, partnerSign.modality, ctx);

  const dating = buildDatingRead(userChart, partnerSunSign, sunCompat, moonCompat, ctx);
  const strength = buildStrengthRead(userChart, partnerSunSign, sunCompat, moonCompat, ctx);
  const challenge = buildChallengeRead(userChart, partnerSunSign, sunCompat, moonCompat, modalityNote, ctx);
  const tip = buildTipRead(userChart, partnerSunSign, sunCompat, moonCompat, ctx);

  return { dating, strength, challenge, tip };
}

// ─── Content Builders ───

function buildDatingRead(
  userChart: BirthChartResult,
  partnerSun: ZodiacSign,
  sunCompat: string,
  moonCompat: string,
  ctx: AstroGenderContext,
): string {
  const partner = SIGN_DATA[partnerSun];
  const userSunEl = SIGN_DATA[userChart.sun.sign].element;
  const lbl = ctx.partnerLabelLower;
  const p = ctx.partnerPronoun;

  const openings: Record<string, string> = {
    natural: `A ${partnerSun} ${lbl} shares your ${userSunEl} element, so the initial connection often feels instant and familiar.`,
    complementary: `A ${partnerSun} ${lbl}'s ${partner.element} energy feeds your ${userSunEl} nature in ways that feel exciting and expansive.`,
    challenging: `A ${partnerSun} ${lbl}'s ${partner.element} energy operates very differently from your ${userSunEl} nature, which creates tension but also real attraction.`,
    neutral: `A ${partnerSun} ${lbl} brings ${partner.element} energy that neither clashes with nor mirrors your ${userSunEl} nature, creating a blank slate dynamic.`,
  };

  const moonLayer = moonCompat === 'natural' || moonCompat === 'complementary'
    ? ` Your Moon supports this connection emotionally, which means the feelings will deepen naturally over time.`
    : ` Your Moon may process emotions differently than ${p} does, so pay attention to whether you feel emotionally met, not just intellectually matched.`;

  return (openings[sunCompat] || openings.neutral) + moonLayer;
}

function buildStrengthRead(
  userChart: BirthChartResult,
  partnerSun: ZodiacSign,
  sunCompat: string,
  moonCompat: string,
  ctx: AstroGenderContext,
): string {
  const partner = SIGN_DATA[partnerSun];
  const userSunData = SIGN_DATA[userChart.sun.sign];
  const lbl = ctx.partnerLabelLower;
  const po = ctx.partnerPossessive;

  if (sunCompat === 'natural') {
    return `You both speak the same elemental language. A ${partnerSun} ${lbl} intuitively understands your ${userSunData.element} nature, which means less explaining and more being understood. The ease between you is genuine.`;
  }
  if (sunCompat === 'complementary') {
    return `${po.charAt(0).toUpperCase() + po.slice(1)} ${partner.element} energy brings out something in you that you cannot access alone. A ${partnerSun} ${lbl} activates parts of your personality that make you feel more complete, not less yourself.`;
  }
  if (moonCompat === 'natural' || moonCompat === 'complementary') {
    return `Even though your Sun signs operate differently, your Moon connects well with ${po} energy. The emotional bond can run deeper than the surface friction suggests.`;
  }
  return `The differences between you create real growth potential. A ${partnerSun} ${lbl} challenges your defaults in ways that, if you are both willing, can make you a stronger version of yourself.`;
}

function buildChallengeRead(
  userChart: BirthChartResult,
  partnerSun: ZodiacSign,
  sunCompat: string,
  _moonCompat: string,
  modalityNote: string,
  ctx: AstroGenderContext,
): string {
  const partner = SIGN_DATA[partnerSun];
  const userSunData = SIGN_DATA[userChart.sun.sign];
  const p = ctx.partnerPronoun;

  let core = '';
  if (sunCompat === 'challenging') {
    core = `${partner.element} and ${userSunData.element} can frustrate each other. What feels natural to ${p} may feel foreign to you, and vice versa. `;
  } else if (sunCompat === 'natural') {
    core = `Too much similarity can mean you amplify each other's blind spots instead of balancing them. `;
  } else {
    core = `The dynamic between ${partner.element} and ${userSunData.element} is workable but requires awareness. `;
  }

  return core + modalityNote;
}

function buildTipRead(
  userChart: BirthChartResult,
  _partnerSun: ZodiacSign,
  sunCompat: string,
  moonCompat: string,
  ctx: AstroGenderContext,
): string {
  const userMoon = SIGN_DATA[userChart.moon.sign];
  const po = ctx.partnerPossessive;
  const p = ctx.partnerPronoun;

  if (sunCompat === 'natural') {
    return `The easy chemistry is real, but do not let comfort replace depth. Ask the hard questions early. Ease is not the same as intimacy.`;
  }
  if (sunCompat === 'complementary') {
    return `Let ${po} differences teach you something. The friction you feel is not a red flag. It is growth potential. Stay curious before you judge.`;
  }
  if (moonCompat === 'challenging') {
    return `Pay attention to how ${p} handles your emotions, not just your ideas. Your ${userMoon.element} Moon needs to feel safe, and that is non-negotiable.`;
  }
  return `Watch how ${p} shows up consistently, not just how ${p} shows up on the first date. Your Moon in ${userChart.moon.sign} needs proof over time, not promises.`;
}

// ─── Persona × Sign Read Generator ───
// Generates a read for each partner Sun sign that incorporates the user's
// actual behavioral data from their persona assessment.

type PersonaSignRead = {
  alignment: string;
  tension: string;
};

// Pole element/modality affinities for matching
const POLE_AFFINITIES: Record<string, { dimension: string; elements: Element[]; modalities: Modality[] }> = {
  A: { dimension: 'Physical', elements: ['Fire', 'Earth'], modalities: ['Cardinal', 'Fixed'] },
  B: { dimension: 'Physical', elements: ['Water', 'Earth'], modalities: ['Fixed', 'Mutable'] },
  C: { dimension: 'Social', elements: ['Fire', 'Air'], modalities: ['Cardinal'] },
  D: { dimension: 'Social', elements: ['Water', 'Earth'], modalities: ['Fixed'] },
  E: { dimension: 'Lifestyle', elements: ['Fire', 'Air'], modalities: ['Cardinal', 'Mutable'] },
  F: { dimension: 'Lifestyle', elements: ['Earth', 'Water'], modalities: ['Fixed'] },
  G: { dimension: 'Values', elements: ['Earth', 'Water'], modalities: ['Fixed', 'Cardinal'] },
  H: { dimension: 'Values', elements: ['Air', 'Fire'], modalities: ['Mutable', 'Cardinal'] },
};

// How each sign's element shows up in relationships
function getSignElementBehavior(element: Element, ctx: AstroGenderContext): Record<string, string> {
  const p = ctx.partnerPronoun;
  const po = ctx.partnerPossessive;
  const rf = ctx.partnerReflexive;

  const table: Record<Element, Record<string, string>> = {
    Fire: {
      dating: `pursues with intensity and expects decisive energy back`,
      relationship: `keeps things dynamic but can burn through patience`,
      conflict: `confronts directly and moves fast`,
      strength: `brings passion and momentum`,
    },
    Earth: {
      dating: `moves slowly, proves ${rf} through consistency and action`,
      relationship: `builds stability and shows love through what ${p} does, not what ${p} says`,
      conflict: `digs in and waits you out`,
      strength: `provides structure and reliability`,
    },
    Air: {
      dating: `connects through conversation and ideas first`,
      relationship: `keeps things intellectually stimulating but can live in ${po} head`,
      conflict: `rationalizes and detaches from the emotional layer`,
      strength: `brings perspective and mental flexibility`,
    },
    Water: {
      dating: `reads you before you speak and bonds through emotional depth`,
      relationship: `loves deeply but processes everything internally first`,
      conflict: `withdraws to process and may not surface for days`,
      strength: `brings emotional intelligence and loyalty`,
    },
  };
  return table[element];
}

/**
 * Pick a relevant behavioral trait from a persona array that connects
 * to a specific sign element.
 */
function pickRelevantTrait(traits: string[] | undefined, dimension: string, element: Element, index: number): string | null {
  if (!traits || traits.length === 0) return null;
  const offset = dimension === 'Physical' ? 0 : dimension === 'Social' ? 1 : dimension === 'Lifestyle' ? 2 : 3;
  const idx = (offset + index) % traits.length;
  return traits[idx];
}

/**
 * Generate a persona-informed read for a specific partner Sun sign.
 * Uses the user's actual behavioral data to describe how they would
 * interact with this sign type.
 */
export function generatePersonaSignRead(
  personaCode: string,
  personaName: string,
  partnerSunSign: ZodiacSign,
  ctx: AstroGenderContext,
  demographics?: any,
  persona?: any,
): PersonaSignRead {
  const partner = SIGN_DATA[partnerSunSign];
  const partnerElement = partner.element;
  const partnerBehavior = getSignElementBehavior(partnerElement, ctx);
  const signIndex = (['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as string[]).indexOf(partnerSunSign);
  const lbl = ctx.partnerLabelLower;

  const aligning: string[] = [];
  const tensioning: string[] = [];

  for (let i = 0; i < personaCode.length && i < 4; i++) {
    const letter = personaCode[i];
    const aff = POLE_AFFINITIES[letter];
    if (!aff) continue;

    const elMatch = aff.elements.includes(partnerElement);
    const modMatch = aff.modalities.includes(partner.modality);

    if (elMatch) {
      aligning.push(buildBehavioralAlignment(aff.dimension, partner, partnerSunSign, partnerBehavior, persona, signIndex, elMatch && modMatch, ctx));
    } else {
      tensioning.push(buildBehavioralTension(aff.dimension, partner, partnerSunSign, partnerBehavior, persona, signIndex, ctx));
    }
  }

  // Add selective demographic color if available
  if (demographics) {
    const demoNote = buildDemoSignNote(demographics, partner, partnerSunSign, ctx);
    if (demoNote) {
      if (aligning.length >= tensioning.length) {
        aligning.push(demoNote);
      } else {
        tensioning.push(demoNote);
      }
    }
  }

  // Pick the best 1-2 from each bucket
  const alignment = aligning.length > 0
    ? aligning.slice(0, 2).join(' ')
    : `A ${partnerSunSign} ${lbl} does not naturally mirror your ${personaName} patterns. That is not a red flag. It means the connection, if it works, will teach you something your comfort zone never could.`;

  const tension = tensioning.length > 0
    ? tensioning.slice(0, 2).join(' ')
    : `There is little natural friction between your ${personaName} wiring and ${partnerSunSign} energy. The risk is not conflict. It is complacency. Make sure ease does not become autopilot.`;

  return { alignment, tension };
}

function buildBehavioralAlignment(
  dimension: string,
  partner: SignData,
  partnerSign: ZodiacSign,
  partnerBehavior: Record<string, string>,
  persona: any,
  signIndex: number,
  isStrong: boolean,
  ctx: AstroGenderContext,
): string {
  const datingTrait = pickRelevantTrait(persona?.datingBehavior, dimension, partner.element, signIndex);
  const relationshipTrait = pickRelevantTrait(persona?.inRelationships, dimension, partner.element, signIndex);
  const attractiveTrait = pickRelevantTrait(persona?.mostAttractive, dimension, partner.element, signIndex);
  const lbl = ctx.partnerLabelLower;
  const p = ctx.partnerPronoun;

  if (isStrong && datingTrait) {
    return `You ${datingTrait.charAt(0).toLowerCase() + datingTrait.slice(1).replace(/\.$/, '')}. A ${partnerSign} ${lbl} ${partnerBehavior.dating}. ${dimension === 'Physical' || dimension === 'Social' ? 'That is the same language. You will recognize each other immediately.' : 'These instincts run on the same frequency, so the early connection should feel natural.'}`;
  }

  if (relationshipTrait) {
    return `In relationships, you ${relationshipTrait.charAt(0).toLowerCase() + relationshipTrait.slice(1).replace(/\.$/, '')}. A ${partnerSign} ${lbl} ${partnerBehavior.relationship}. ${isStrong ? `This is a strong match. ${p.charAt(0).toUpperCase() + p.slice(1)} delivers what you are wired to need.` : 'The overlap is there, but it will take time to fully sync.'}`;
  }

  if (attractiveTrait) {
    return `What draws people to you: ${attractiveTrait.charAt(0).toLowerCase() + attractiveTrait.slice(1).replace(/\.$/, '')}. A ${partnerSign} ${lbl} ${partnerBehavior.strength}, which means ${p} can actually meet that energy instead of being overwhelmed by it.`;
  }

  return `A ${partnerSign} ${lbl}'s ${partner.element} energy ${isStrong ? 'directly supports' : 'shares ground with'} how you show up in the ${dimension.toLowerCase()} dimension of your life. The connection is intuitive, not forced.`;
}

function buildBehavioralTension(
  dimension: string,
  partner: SignData,
  partnerSign: ZodiacSign,
  partnerBehavior: Record<string, string>,
  persona: any,
  signIndex: number,
  ctx: AstroGenderContext,
): string {
  const struggle = pickRelevantTrait(persona?.struggles, dimension, partner.element, signIndex);
  const leastAttractive = pickRelevantTrait(persona?.leastAttractive, dimension, partner.element, signIndex);
  const datingTrait = pickRelevantTrait(persona?.datingBehavior, dimension, partner.element, signIndex);
  const lbl = ctx.partnerLabelLower;
  const p = ctx.partnerPronoun;
  const P = p.charAt(0).toUpperCase() + p.slice(1);

  if (struggle && datingTrait) {
    return `You ${datingTrait.charAt(0).toLowerCase() + datingTrait.slice(1).replace(/\.$/, '')}, but a ${partnerSign} ${lbl} ${partnerBehavior.conflict}. Your own pattern of ${struggle.charAt(0).toLowerCase() + struggle.slice(1).replace(/\.$/, '')} could amplify under that pressure. Watch for it early.`;
  }

  if (leastAttractive) {
    return `A ${partnerSign} ${lbl} ${partnerBehavior.conflict}. That can trigger the part of you that ${leastAttractive.charAt(0).toLowerCase() + leastAttractive.slice(1).replace(/\.$/, '')}. This is not a dealbreaker, but it is the exact friction point you need to be honest about.`;
  }

  if (struggle) {
    return `One of your growth edges is that you ${struggle.charAt(0).toLowerCase() + struggle.slice(1).replace(/\.$/, '')}. A ${partnerSign} ${lbl} ${partnerBehavior.relationship}, which may make that pattern more visible, not less.`;
  }

  return `A ${partnerSign} ${lbl}'s ${partner.element} energy operates differently from how you approach the ${dimension.toLowerCase()} dimension. ${P} ${partnerBehavior.conflict}, and you will need to decide if that pattern challenges you in a productive way or an exhausting one.`;
}

function buildDemoSignNote(demo: any, partner: SignData, partnerSign: ZodiacSign, ctx: AstroGenderContext): string | null {
  const lbl = ctx.partnerPlural;
  const p = ctx.partnerPronoun;
  const po = ctx.partnerPossessive;

  // Fitness preferences
  const prefFitness = demo.pref_fitness_levels;
  if (Array.isArray(prefFitness) && !prefFitness.includes('No preference') && prefFitness.length <= 2) {
    const wantsHighFitness = prefFitness.some((f: string) => f === '4 to 6 days a week' || f === 'Every day');
    if (wantsHighFitness && (partner.element === 'Fire' || partner.element === 'Earth')) {
      return `You set a high physical bar, and ${partnerSign} ${lbl} (${partner.element}) tend to deliver. ${partner.element === 'Fire' ? 'They channel energy into action and physicality' : 'They treat discipline as a lifestyle, not a phase'}.`;
    }
  }

  // Political alignment
  const political = demo.political;
  if (political === 'Conservative' && (partner.element === 'Earth' || partner.element === 'Water')) {
    return `Your conservative values and ${partnerSign}'s ${partner.element} nature share common ground. ${p.charAt(0).toUpperCase() + p.slice(1)} is more likely to value tradition, structure, and loyalty.`;
  }
  if (political === 'Liberal' && (partner.element === 'Air' || partner.element === 'Fire')) {
    return `Your progressive values and ${partnerSign}'s ${partner.element} nature align. ${p.charAt(0).toUpperCase() + p.slice(1)} is more likely to question defaults and build something new with you.`;
  }

  // Want kids × nurturing signs
  if (demo.want_kids === 'Yes' && (partnerSign === 'Cancer' || partnerSign === 'Taurus' || partnerSign === 'Capricorn')) {
    return `You want children, and ${partnerSign} ${lbl} are builders by nature. ${partnerSign === 'Cancer' ? `Family is ${po} core drive` : partnerSign === 'Taurus' ? `${p.charAt(0).toUpperCase() + p.slice(1)} builds homes, not just houses` : `${p.charAt(0).toUpperCase() + p.slice(1)} plans for generations, not just weekends`}.`;
  }
  if (demo.want_kids === 'No' && (partner.element === 'Fire' || partnerSign === 'Aquarius')) {
    return `You do not want children, and ${partnerSign} ${lbl} often share that independence. ${partner.element === 'Fire' ? `${p.charAt(0).toUpperCase() + p.slice(1)} is oriented toward experience, not domesticity` : `${p.charAt(0).toUpperCase() + p.slice(1)} values freedom and unconventional paths`}.`;
  }

  return null;
}
