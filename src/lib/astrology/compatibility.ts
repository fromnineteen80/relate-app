/**
 * Dynamic Astrology Compatibility Generator
 *
 * Generates personalized dating reads for each of the 12 male Sun signs
 * relative to HER specific Sun, Moon, and Rising placements.
 *
 * Used by the cheat sheet and profile pages.
 */

import type { ZodiacSign, BirthChartResult } from './engine';
import { SIGN_DATA, type SignData } from './signs';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Element Compatibility Matrix ───

type Element = 'Fire' | 'Earth' | 'Air' | 'Water';

const ELEMENT_COMPAT: Record<Element, Record<Element, 'natural' | 'complementary' | 'challenging' | 'neutral'>> = {
  Fire:  { Fire: 'natural', Earth: 'challenging', Air: 'complementary', Water: 'challenging' },
  Earth: { Fire: 'challenging', Earth: 'natural', Air: 'challenging', Water: 'complementary' },
  Air:   { Fire: 'complementary', Air: 'natural', Earth: 'challenging', Water: 'neutral' },
  Water: { Fire: 'challenging', Earth: 'complementary', Air: 'neutral', Water: 'natural' },
};

// ─── Modality Dynamics ───

type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

const MODALITY_DYNAMIC: Record<Modality, Record<Modality, string>> = {
  Cardinal: {
    Cardinal: 'Both of you lead, which creates momentum but can also create power struggles over direction.',
    Fixed:    'He holds steady while you initiate. This can feel like a perfect balance or like pushing against a wall.',
    Mutable:  'He adapts easily to your direction. The flow is natural, but you may wish he pushed back more.',
  },
  Fixed: {
    Cardinal: 'You hold your ground while he charges ahead. This creates stability but can spark friction when neither yields.',
    Fixed:    'Two immovable forces. The loyalty runs deep, but compromise requires real effort from both sides.',
    Mutable:  'He bends while you stand firm. He may feel like he is always adjusting, so watch for quiet resentment.',
  },
  Mutable: {
    Cardinal: 'He leads and you adapt, which feels easy at first. Make sure your own voice stays in the conversation.',
    Fixed:    'His steadiness grounds your flexibility. You bring variety while he brings structure.',
    Mutable:  'Both of you flow and adjust freely. The connection feels effortless, but someone needs to make decisions.',
  },
};

// ─── Element Personality Templates (for her profile cards) ───

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
 * Generate her personalized Sun/Moon/Rising profile descriptions
 * based on her actual chart placements.
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
 * Generate a personalized compatibility read for a specific male Sun sign
 * relative to her chart.
 */
export function generateCompatibilityRead(
  herChart: BirthChartResult,
  hisSunSign: ZodiacSign,
): CompatibilityRead {
  const herSun = SIGN_DATA[herChart.sun.sign];
  const herMoon = SIGN_DATA[herChart.moon.sign];
  const hisSign = SIGN_DATA[hisSunSign];

  const sunCompat = ELEMENT_COMPAT[herSun.element][hisSign.element];
  const moonCompat = ELEMENT_COMPAT[herMoon.element][hisSign.element];
  const modalityNote = MODALITY_DYNAMIC[herSun.modality][hisSign.modality];

  const dating = buildDatingRead(herChart, hisSunSign, sunCompat, moonCompat);
  const strength = buildStrengthRead(herChart, hisSunSign, sunCompat, moonCompat);
  const challenge = buildChallengeRead(herChart, hisSunSign, sunCompat, moonCompat, modalityNote);
  const tip = buildTipRead(herChart, hisSunSign, sunCompat, moonCompat);

  return { dating, strength, challenge, tip };
}

// ─── Content Builders ───

function buildDatingRead(
  herChart: BirthChartResult,
  hisSun: ZodiacSign,
  sunCompat: string,
  moonCompat: string,
): string {
  const his = SIGN_DATA[hisSun];
  const herSunEl = SIGN_DATA[herChart.sun.sign].element;

  const openings: Record<string, string> = {
    natural: `A ${hisSun} man shares your ${herSunEl} element, so the initial connection often feels instant and familiar.`,
    complementary: `A ${hisSun} man\'s ${his.element} energy feeds your ${herSunEl} nature in ways that feel exciting and expansive.`,
    challenging: `A ${hisSun} man\'s ${his.element} energy operates very differently from your ${herSunEl} nature, which creates tension but also real attraction.`,
    neutral: `A ${hisSun} man brings ${his.element} energy that neither clashes with nor mirrors your ${herSunEl} nature, creating a blank slate dynamic.`,
  };

  const moonLayer = moonCompat === 'natural' || moonCompat === 'complementary'
    ? ` Your Moon supports this connection emotionally, which means the feelings will deepen naturally over time.`
    : ` Your Moon may process emotions differently than he does, so pay attention to whether you feel emotionally met, not just intellectually matched.`;

  return (openings[sunCompat] || openings.neutral) + moonLayer;
}

function buildStrengthRead(
  herChart: BirthChartResult,
  hisSun: ZodiacSign,
  sunCompat: string,
  moonCompat: string,
): string {
  const his = SIGN_DATA[hisSun];
  const herSun = SIGN_DATA[herChart.sun.sign];

  if (sunCompat === 'natural') {
    return `You both speak the same elemental language. A ${hisSun} man intuitively understands your ${herSun.element} nature, which means less explaining and more being understood. The ease between you is genuine.`;
  }
  if (sunCompat === 'complementary') {
    return `His ${his.element} energy brings out something in you that you cannot access alone. A ${hisSun} man activates parts of your personality that make you feel more complete, not less yourself.`;
  }
  if (moonCompat === 'natural' || moonCompat === 'complementary') {
    return `Even though your Sun signs operate differently, your Moon connects well with his energy. The emotional bond can run deeper than the surface friction suggests.`;
  }
  return `The differences between you create real growth potential. A ${hisSun} man challenges your defaults in ways that, if you are both willing, can make you a stronger version of yourself.`;
}

function buildChallengeRead(
  herChart: BirthChartResult,
  hisSun: ZodiacSign,
  sunCompat: string,
  moonCompat: string,
  modalityNote: string,
): string {
  const his = SIGN_DATA[hisSun];
  const herSun = SIGN_DATA[herChart.sun.sign];

  let core = '';
  if (sunCompat === 'challenging') {
    core = `${his.element} and ${herSun.element} can frustrate each other. What feels natural to him may feel foreign to you, and vice versa. `;
  } else if (sunCompat === 'natural') {
    core = `Too much similarity can mean you amplify each other\'s blind spots instead of balancing them. `;
  } else {
    core = `The dynamic between ${his.element} and ${herSun.element} is workable but requires awareness. `;
  }

  return core + modalityNote;
}

function buildTipRead(
  herChart: BirthChartResult,
  hisSun: ZodiacSign,
  sunCompat: string,
  moonCompat: string,
): string {
  const herMoon = SIGN_DATA[herChart.moon.sign];

  if (sunCompat === 'natural') {
    return `The easy chemistry is real, but do not let comfort replace depth. Ask the hard questions early. Ease is not the same as intimacy.`;
  }
  if (sunCompat === 'complementary') {
    return `Let his differences teach you something. The friction you feel is not a red flag. It is growth potential. Stay curious before you judge.`;
  }
  if (moonCompat === 'challenging') {
    return `Pay attention to how he handles your emotions, not just your ideas. Your ${herMoon.element} Moon needs to feel safe, and that is non negotiable.`;
  }
  return `Watch how he shows up consistently, not just how he shows up on the first date. Your Moon in ${herChart.moon.sign} needs proof over time, not promises.`;
}

// ─── Persona × Sign Read Generator ───
// Generates a read for each male Sun sign that incorporates the user's
// actual behavioral data from their persona assessment, not just pole labels.

type PersonaSignRead = {
  alignment: string;   // Where her persona connects with this sign
  tension: string;     // Where it doesn't — framed as growth, not dealbreaker
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

// How each sign's element shows up in relationships — used to describe HIM specifically
const SIGN_ELEMENT_BEHAVIOR: Record<Element, Record<string, string>> = {
  Fire: {
    dating: 'pursues with intensity and expects decisive energy back',
    relationship: 'keeps things dynamic but can burn through patience',
    conflict: 'confronts directly and moves fast',
    strength: 'brings passion and momentum',
  },
  Earth: {
    dating: 'moves slowly, proves himself through consistency and action',
    relationship: 'builds stability and shows love through what he does, not what he says',
    conflict: 'digs in and waits you out',
    strength: 'provides structure and reliability',
  },
  Air: {
    dating: 'connects through conversation and ideas first',
    relationship: 'keeps things intellectually stimulating but can live in his head',
    conflict: 'rationalizes and detaches from the emotional layer',
    strength: 'brings perspective and mental flexibility',
  },
  Water: {
    dating: 'reads you before you speak and bonds through emotional depth',
    relationship: 'loves deeply but processes everything internally first',
    conflict: 'withdraws to process and may not surface for days',
    strength: 'brings emotional intelligence and loyalty',
  },
};

/**
 * Pick a relevant behavioral trait from a persona array that connects
 * to a specific sign element. Uses dimension context to select the most
 * relevant trait.
 */
function pickRelevantTrait(traits: string[] | undefined, dimension: string, element: Element, index: number): string | null {
  if (!traits || traits.length === 0) return null;
  // Pick different traits for different dimensions/signs to avoid repetition
  const offset = dimension === 'Physical' ? 0 : dimension === 'Social' ? 1 : dimension === 'Lifestyle' ? 2 : 3;
  const idx = (offset + index) % traits.length;
  return traits[idx];
}

/**
 * Generate a persona-informed read for a specific male Sun sign.
 * Uses the user's actual behavioral data (datingBehavior, inRelationships,
 * struggles, mostAttractive) to describe how SHE specifically would
 * interact with this sign type.
 */
export function generatePersonaSignRead(
  personaCode: string,
  personaName: string,
  hisSunSign: ZodiacSign,
  demographics?: any,
  persona?: any,
): PersonaSignRead {
  const his = SIGN_DATA[hisSunSign];
  const hisElement = his.element;
  const hisBehavior = SIGN_ELEMENT_BEHAVIOR[hisElement];
  const signIndex = (['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as string[]).indexOf(hisSunSign);

  const aligning: string[] = [];
  const tensioning: string[] = [];

  for (let i = 0; i < personaCode.length && i < 4; i++) {
    const letter = personaCode[i];
    const aff = POLE_AFFINITIES[letter];
    if (!aff) continue;

    const elMatch = aff.elements.includes(hisElement);
    const modMatch = aff.modalities.includes(his.modality);

    if (elMatch) {
      aligning.push(buildBehavioralAlignment(aff.dimension, his, hisSunSign, hisBehavior, persona, signIndex, elMatch && modMatch));
    } else {
      tensioning.push(buildBehavioralTension(aff.dimension, his, hisSunSign, hisBehavior, persona, signIndex));
    }
  }

  // Add selective demographic color if available
  if (demographics) {
    const demoNote = buildDemoSignNote(demographics, his, hisSunSign);
    if (demoNote) {
      if (aligning.length >= tensioning.length) {
        aligning.push(demoNote);
      } else {
        tensioning.push(demoNote);
      }
    }
  }

  // Build final reads — pick the best 1-2 from each bucket
  const alignment = aligning.length > 0
    ? aligning.slice(0, 2).join(' ')
    : `A ${hisSunSign} man does not naturally mirror your ${personaName} patterns. That is not a red flag — it means the connection, if it works, will teach you something your comfort zone never could.`;

  const tension = tensioning.length > 0
    ? tensioning.slice(0, 2).join(' ')
    : `There is little natural friction between your ${personaName} wiring and ${hisSunSign} energy. The risk is not conflict — it is complacency. Make sure ease does not become autopilot.`;

  return { alignment, tension };
}

function buildBehavioralAlignment(
  dimension: string,
  his: SignData,
  hisSign: ZodiacSign,
  hisBehavior: Record<string, string>,
  persona: any,
  signIndex: number,
  isStrong: boolean,
): string {
  // Pull actual behavioral data from the persona
  const datingTrait = pickRelevantTrait(persona?.datingBehavior, dimension, his.element, signIndex);
  const relationshipTrait = pickRelevantTrait(persona?.inRelationships, dimension, his.element, signIndex);
  const attractiveTrait = pickRelevantTrait(persona?.mostAttractive, dimension, his.element, signIndex);

  // Build reads that reference HER actual behavior and HIS sign traits
  if (isStrong && datingTrait) {
    return `You ${datingTrait.charAt(0).toLowerCase() + datingTrait.slice(1).replace(/\.$/, '')}. A ${hisSign} man ${hisBehavior.dating}. ${dimension === 'Physical' || dimension === 'Social' ? 'That is the same language — you will recognize each other immediately.' : 'These instincts run on the same frequency, so the early connection should feel natural.'}`;
  }

  if (relationshipTrait) {
    return `In relationships, you ${relationshipTrait.charAt(0).toLowerCase() + relationshipTrait.slice(1).replace(/\.$/, '')}. A ${hisSign} man ${hisBehavior.relationship}. ${isStrong ? 'This is a strong match — he delivers what you are wired to need.' : 'The overlap is there, but it will take time to fully sync.'}`;
  }

  if (attractiveTrait) {
    return `What draws people to you: ${attractiveTrait.charAt(0).toLowerCase() + attractiveTrait.slice(1).replace(/\.$/, '')}. A ${hisSign} man ${hisBehavior.strength}, which means he can actually meet that energy instead of being overwhelmed by it.`;
  }

  // Fallback without persona data
  return `A ${hisSign} man's ${his.element} energy ${isStrong ? 'directly supports' : 'shares ground with'} how you show up in the ${dimension.toLowerCase()} dimension of your life. The connection is intuitive, not forced.`;
}

function buildBehavioralTension(
  dimension: string,
  his: SignData,
  hisSign: ZodiacSign,
  hisBehavior: Record<string, string>,
  persona: any,
  signIndex: number,
): string {
  // Pull actual behavioral data — struggles and least attractive show friction points
  const struggle = pickRelevantTrait(persona?.struggles, dimension, his.element, signIndex);
  const leastAttractive = pickRelevantTrait(persona?.leastAttractive, dimension, his.element, signIndex);
  const datingTrait = pickRelevantTrait(persona?.datingBehavior, dimension, his.element, signIndex);

  if (struggle && datingTrait) {
    return `You ${datingTrait.charAt(0).toLowerCase() + datingTrait.slice(1).replace(/\.$/, '')}, but a ${hisSign} man ${hisBehavior.conflict}. Your own pattern of ${struggle.charAt(0).toLowerCase() + struggle.slice(1).replace(/\.$/, '')} could amplify under that pressure. Watch for it early.`;
  }

  if (leastAttractive) {
    return `A ${hisSign} man ${hisBehavior.conflict}. That can trigger the part of you that ${leastAttractive.charAt(0).toLowerCase() + leastAttractive.slice(1).replace(/\.$/, '')}. This is not a dealbreaker — but it is the exact friction point you need to be honest about.`;
  }

  if (struggle) {
    return `One of your growth edges is that you ${struggle.charAt(0).toLowerCase() + struggle.slice(1).replace(/\.$/, '')}. A ${hisSign} man ${hisBehavior.relationship}, which may make that pattern more visible, not less.`;
  }

  // Fallback without persona data
  return `A ${hisSign} man's ${his.element} energy operates differently from how you approach the ${dimension.toLowerCase()} dimension. He ${hisBehavior.conflict} — and you will need to decide if that pattern challenges you in a productive way or an exhausting one.`;
}

function buildDemoSignNote(demo: any, his: SignData, hisSign: ZodiacSign): string | null {
  // Fitness preferences × his element
  const prefFitness = demo.pref_fitness_levels;
  if (Array.isArray(prefFitness) && !prefFitness.includes('No preference') && prefFitness.length <= 2) {
    const wantsHighFitness = prefFitness.some((f: string) => f === '4 to 6 days a week' || f === 'Every day');
    if (wantsHighFitness && (his.element === 'Fire' || his.element === 'Earth')) {
      return `You set a high physical bar, and ${hisSign} men (${his.element}) tend to deliver — ${his.element === 'Fire' ? 'they channel energy into action and physicality' : 'they treat discipline as a lifestyle, not a phase'}.`;
    }
  }

  // Political alignment
  const political = demo.political;
  if (political === 'Conservative' && (his.element === 'Earth' || his.element === 'Water')) {
    return `Your conservative values and ${hisSign}'s ${his.element} nature share common ground — he is more likely to value tradition, structure, and loyalty.`;
  }
  if (political === 'Liberal' && (his.element === 'Air' || his.element === 'Fire')) {
    return `Your progressive values and ${hisSign}'s ${his.element} nature align — he is more likely to question defaults and build something new with you.`;
  }

  // Want kids × nurturing signs
  if (demo.want_kids === 'Yes' && (hisSign === 'Cancer' || hisSign === 'Taurus' || hisSign === 'Capricorn')) {
    return `You want children, and ${hisSign} men are builders by nature — ${hisSign === 'Cancer' ? 'family is his core drive' : hisSign === 'Taurus' ? 'he builds homes, not just houses' : 'he plans for generations, not just weekends'}.`;
  }
  if (demo.want_kids === 'No' && (his.element === 'Fire' || hisSign === 'Aquarius')) {
    return `You do not want children, and ${hisSign} men often share that independence — ${his.element === 'Fire' ? 'he is oriented toward experience, not domesticity' : 'he values freedom and unconventional paths'}.`;
  }

  return null;
}
