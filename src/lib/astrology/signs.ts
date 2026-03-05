/**
 * Zodiac sign reference data for profile & cheat sheet.
 * Unicode symbols are used as fallbacks — see ASTROLOGY_ICON_SETUP.md
 * for instructions on swapping in Noun Project icons at build time.
 */

import type { ZodiacSign } from './engine';

export type SignData = {
  name: ZodiacSign;
  symbol: string;           // Unicode symbol fallback
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  rulingPlanet: string;
  dateRange: string;        // approximate sun-sign date range
  // ─── Personality content (women-focused) ───
  sunTraits: string;
  moonTraits: string;
  risingTraits: string;
  // ─── Cheat sheet: dating quick-read ───
  cheatDating: string;
  cheatStrength: string;
  cheatChallenge: string;
  cheatTip: string;
};

export const SIGN_DATA: Record<ZodiacSign, SignData> = {
  Aries: {
    name: 'Aries',
    symbol: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    rulingPlanet: 'Mars',
    dateRange: 'Mar 21 – Apr 19',
    sunTraits: '[PLACEHOLDER — Aries Sun personality copy for women. Describe core identity, drive, and how she shows up in the world.]',
    moonTraits: '[PLACEHOLDER — Aries Moon emotional style. How she processes feelings, what she needs to feel safe, her instinctive reactions.]',
    risingTraits: '[PLACEHOLDER — Aries Rising first impression. How others perceive her, her outward energy, her social mask.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Aries. What she leads with, how she flirts, her pace in relationships.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as an Aries.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as an Aries.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for an Aries woman.]',
  },
  Taurus: {
    name: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    modality: 'Fixed',
    rulingPlanet: 'Venus',
    dateRange: 'Apr 20 – May 20',
    sunTraits: '[PLACEHOLDER — Taurus Sun personality copy for women. Core identity rooted in sensuality, stability, and loyalty.]',
    moonTraits: '[PLACEHOLDER — Taurus Moon emotional style. Comfort-seeking, slow to warm, deeply devoted once attached.]',
    risingTraits: '[PLACEHOLDER — Taurus Rising first impression. Grounded presence, approachable warmth, quiet magnetism.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Taurus. Steady courtship pace, values consistency and effort.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Taurus.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Taurus.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Taurus woman.]',
  },
  Gemini: {
    name: 'Gemini',
    symbol: '♊',
    element: 'Air',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'May 21 – Jun 20',
    sunTraits: '[PLACEHOLDER — Gemini Sun personality copy for women. Intellectual curiosity, adaptability, communication as love language.]',
    moonTraits: '[PLACEHOLDER — Gemini Moon emotional style. Processes feelings through conversation, needs mental stimulation to feel secure.]',
    risingTraits: '[PLACEHOLDER — Gemini Rising first impression. Witty, sociable, youthful energy that draws people in.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Gemini. Flirtatious banter, needs variety, attracted to intelligence.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Gemini.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Gemini.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Gemini woman.]',
  },
  Cancer: {
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    modality: 'Cardinal',
    rulingPlanet: 'Moon',
    dateRange: 'Jun 21 – Jul 22',
    sunTraits: '[PLACEHOLDER — Cancer Sun personality copy for women. Nurturing core identity, protective instincts, emotional depth.]',
    moonTraits: '[PLACEHOLDER — Cancer Moon emotional style. Deeply intuitive, strong attachment needs, cyclical moods.]',
    risingTraits: '[PLACEHOLDER — Cancer Rising first impression. Warm and approachable but guarded, maternal energy.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Cancer. Seeks emotional security first, shows love through care.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Cancer.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Cancer.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Cancer woman.]',
  },
  Leo: {
    name: 'Leo',
    symbol: '♌',
    element: 'Fire',
    modality: 'Fixed',
    rulingPlanet: 'Sun',
    dateRange: 'Jul 23 – Aug 22',
    sunTraits: '[PLACEHOLDER — Leo Sun personality copy for women. Radiant confidence, generous heart, craves recognition and loyalty.]',
    moonTraits: '[PLACEHOLDER — Leo Moon emotional style. Needs to feel admired and special, dramatic emotional expression.]',
    risingTraits: '[PLACEHOLDER — Leo Rising first impression. Commanding presence, natural star quality, warm magnetism.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Leo. Loves grand gestures, expects effort, loyalty is non-negotiable.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Leo.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Leo.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Leo woman.]',
  },
  Virgo: {
    name: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'Aug 23 – Sep 22',
    sunTraits: '[PLACEHOLDER — Virgo Sun personality copy for women. Analytical mind, service-oriented love, perfectionist tendencies.]',
    moonTraits: '[PLACEHOLDER — Virgo Moon emotional style. Processes feelings through fixing and organizing, anxious attachment when stressed.]',
    risingTraits: '[PLACEHOLDER — Virgo Rising first impression. Put-together appearance, helpful demeanor, quietly observant.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Virgo. Shows love through acts of service, notices every detail.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Virgo.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Virgo.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Virgo woman.]',
  },
  Libra: {
    name: 'Libra',
    symbol: '♎',
    element: 'Air',
    modality: 'Cardinal',
    rulingPlanet: 'Venus',
    dateRange: 'Sep 23 – Oct 22',
    sunTraits: '[PLACEHOLDER — Libra Sun personality copy for women. Partnership-oriented, aesthetic sensibility, diplomatic nature.]',
    moonTraits: '[PLACEHOLDER — Libra Moon emotional style. Needs harmony to feel balanced, avoids conflict, seeks fairness in love.]',
    risingTraits: '[PLACEHOLDER — Libra Rising first impression. Graceful and charming, socially polished, beauty-conscious.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Libra. Romantic idealist, values partnership equality, flirtatious by nature.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Libra.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Libra.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Libra woman.]',
  },
  Scorpio: {
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    modality: 'Fixed',
    rulingPlanet: 'Pluto',
    dateRange: 'Oct 23 – Nov 21',
    sunTraits: '[PLACEHOLDER — Scorpio Sun personality copy for women. Intense depth, transformative power, all-or-nothing love.]',
    moonTraits: '[PLACEHOLDER — Scorpio Moon emotional style. Deep wells of feeling, trust issues until safety is proven, passionate bonds.]',
    risingTraits: '[PLACEHOLDER — Scorpio Rising first impression. Magnetic and mysterious, piercing gaze, intimidating allure.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Scorpio. Tests loyalty before opening up, seeks soul-deep connection.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Scorpio.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Scorpio.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Scorpio woman.]',
  },
  Sagittarius: {
    name: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    modality: 'Mutable',
    rulingPlanet: 'Jupiter',
    dateRange: 'Nov 22 – Dec 21',
    sunTraits: '[PLACEHOLDER — Sagittarius Sun personality copy for women. Freedom-loving spirit, philosophical mind, adventurous heart.]',
    moonTraits: '[PLACEHOLDER — Sagittarius Moon emotional style. Needs space to process, optimistic outlook, avoids emotional heaviness.]',
    risingTraits: '[PLACEHOLDER — Sagittarius Rising first impression. Enthusiastic and open, traveler energy, infectious laugh.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Sagittarius. Attracted to adventure partners, values honesty over tact.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Sagittarius.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Sagittarius.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Sagittarius woman.]',
  },
  Capricorn: {
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    rulingPlanet: 'Saturn',
    dateRange: 'Dec 22 – Jan 19',
    sunTraits: '[PLACEHOLDER — Capricorn Sun personality copy for women. Ambitious drive, traditional values, earns love through commitment.]',
    moonTraits: '[PLACEHOLDER — Capricorn Moon emotional style. Stoic exterior hiding deep feeling, needs structure to feel safe in love.]',
    risingTraits: '[PLACEHOLDER — Capricorn Rising first impression. Poised and professional, ageless elegance, quietly commanding.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Capricorn. Takes relationships seriously, vets for long-term potential early.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Capricorn.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Capricorn.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Capricorn woman.]',
  },
  Aquarius: {
    name: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    modality: 'Fixed',
    rulingPlanet: 'Uranus',
    dateRange: 'Jan 20 – Feb 18',
    sunTraits: '[PLACEHOLDER — Aquarius Sun personality copy for women. Independent thinker, humanitarian heart, unconventional approach to love.]',
    moonTraits: '[PLACEHOLDER — Aquarius Moon emotional style. Intellectualizes feelings, needs freedom within attachment, values friendship in romance.]',
    risingTraits: '[PLACEHOLDER — Aquarius Rising first impression. Quirky and original, detached cool, progressive vibe.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Aquarius. Needs intellectual connection first, resists traditional relationship scripts.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as an Aquarius.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as an Aquarius.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for an Aquarius woman.]',
  },
  Pisces: {
    name: 'Pisces',
    symbol: '♓',
    element: 'Water',
    modality: 'Mutable',
    rulingPlanet: 'Neptune',
    dateRange: 'Feb 19 – Mar 20',
    sunTraits: '[PLACEHOLDER — Pisces Sun personality copy for women. Dreamy romantic, empathic sponge, creative soul seeking transcendent love.]',
    moonTraits: '[PLACEHOLDER — Pisces Moon emotional style. Absorbs others\' emotions, needs escape valves, boundless compassion.]',
    risingTraits: '[PLACEHOLDER — Pisces Rising first impression. Ethereal and gentle, artistic aura, slightly otherworldly presence.]',
    cheatDating: '[PLACEHOLDER — Quick dating read for Pisces. Falls in love with potential, needs a partner who grounds without caging.]',
    cheatStrength: '[PLACEHOLDER — Her biggest relationship superpower as a Pisces.]',
    cheatChallenge: '[PLACEHOLDER — Her trickiest relationship pattern as a Pisces.]',
    cheatTip: '[PLACEHOLDER — One actionable dating tip for a Pisces woman.]',
  },
};

/** Element-based color mapping used on cards */
export const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fire:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  Earth: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Air:   { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200' },
  Water: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export const ALL_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export function getSignData(sign: ZodiacSign): SignData {
  return SIGN_DATA[sign];
}
