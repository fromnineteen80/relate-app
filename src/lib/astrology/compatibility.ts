/**
 * Dynamic Astrology Compatibility Generator
 *
 * Generates personalized dating reads for each of the 12 male Sun signs
 * relative to HER specific Sun, Moon, and Rising placements.
 *
 * Used by the cheat sheet and profile pages.
 */

import type { ZodiacSign, BirthChartResult } from './engine';
import { SIGN_DATA } from './signs';

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
