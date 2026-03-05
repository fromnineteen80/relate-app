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
};

export const SIGN_DATA: Record<ZodiacSign, SignData> = {
  Aries:       { name: 'Aries',       symbol: '♈', element: 'Fire',  modality: 'Cardinal', rulingPlanet: 'Mars',    dateRange: 'Mar 21 – Apr 19' },
  Taurus:      { name: 'Taurus',      symbol: '♉', element: 'Earth', modality: 'Fixed',    rulingPlanet: 'Venus',   dateRange: 'Apr 20 – May 20' },
  Gemini:      { name: 'Gemini',      symbol: '♊', element: 'Air',   modality: 'Mutable',  rulingPlanet: 'Mercury', dateRange: 'May 21 – Jun 20' },
  Cancer:      { name: 'Cancer',      symbol: '♋', element: 'Water', modality: 'Cardinal', rulingPlanet: 'Moon',    dateRange: 'Jun 21 – Jul 22' },
  Leo:         { name: 'Leo',         symbol: '♌', element: 'Fire',  modality: 'Fixed',    rulingPlanet: 'Sun',     dateRange: 'Jul 23 – Aug 22' },
  Virgo:       { name: 'Virgo',       symbol: '♍', element: 'Earth', modality: 'Mutable',  rulingPlanet: 'Mercury', dateRange: 'Aug 23 – Sep 22' },
  Libra:       { name: 'Libra',       symbol: '♎', element: 'Air',   modality: 'Cardinal', rulingPlanet: 'Venus',   dateRange: 'Sep 23 – Oct 22' },
  Scorpio:     { name: 'Scorpio',     symbol: '♏', element: 'Water', modality: 'Fixed',    rulingPlanet: 'Pluto',   dateRange: 'Oct 23 – Nov 21' },
  Sagittarius: { name: 'Sagittarius', symbol: '♐', element: 'Fire',  modality: 'Mutable',  rulingPlanet: 'Jupiter', dateRange: 'Nov 22 – Dec 21' },
  Capricorn:   { name: 'Capricorn',   symbol: '♑', element: 'Earth', modality: 'Cardinal', rulingPlanet: 'Saturn',  dateRange: 'Dec 22 – Jan 19' },
  Aquarius:    { name: 'Aquarius',    symbol: '♒', element: 'Air',   modality: 'Fixed',    rulingPlanet: 'Uranus',  dateRange: 'Jan 20 – Feb 18' },
  Pisces:      { name: 'Pisces',      symbol: '♓', element: 'Water', modality: 'Mutable',  rulingPlanet: 'Neptune', dateRange: 'Feb 19 – Mar 20' },
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
