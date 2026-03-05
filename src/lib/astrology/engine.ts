/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Relate Astrology Calculation Engine
 * Uses circular-natal-horoscope-js for Sun, Moon & Rising (Ascendant) calculations.
 * Women-only module — gated by gender check at the page level.
 */

// circular-natal-horoscope-js has no TS types; import as any
let Origin: any;
let Horoscope: any;

async function loadLib() {
  if (!Origin || !Horoscope) {
    const lib = await import('circular-natal-horoscope-js');
    Origin = lib.Origin;
    Horoscope = lib.Horoscope;
  }
}

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type Placement = {
  sign: ZodiacSign;
  degrees: number;        // 0-29 within sign
  minutes: number;
  formatted: string;      // e.g. "15° 23' Aries"
  isRetrograde?: boolean;
};

export type BirthChartResult = {
  sun: Placement;
  moon: Placement;
  rising: Placement;       // Ascendant
  calculatedAt: string;    // ISO timestamp
};

export type BirthData = {
  year: number;
  month: number;   // 0-indexed (0 = Jan)
  day: number;
  hour: number;    // 0-23
  minute: number;  // 0-59
  latitude: number;
  longitude: number;
  locationName?: string;    // display name for the birth city
  timezone?: string;        // IANA timezone string (informational)
};

function extractPlacement(body: any): Placement {
  const sign = body?.Sign?.label || body?.Sign?.key || 'Unknown';
  const arc = body?.ChartPosition?.Ecliptic?.ArcDegrees || {};
  const degrees = arc.degrees ?? 0;
  const minutes = arc.minutes ?? 0;
  const formatted30 = body?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30 || `${degrees}° ${minutes}'`;
  return {
    sign,
    degrees,
    minutes,
    formatted: `${formatted30} ${sign}`,
    isRetrograde: body?.isRetrograde ?? false,
  };
}

/**
 * Calculate Sun, Moon & Rising from birth data.
 * This is the core engine function.
 */
export async function calculateBirthChart(data: BirthData): Promise<BirthChartResult> {
  await loadLib();

  const origin = new Origin({
    year: data.year,
    month: data.month,       // 0-indexed
    date: data.day,
    hour: data.hour,
    minute: data.minute,
    latitude: data.latitude,
    longitude: data.longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major'],
    language: 'en',
  });

  const sun = extractPlacement(horoscope.CelestialBodies?.sun);
  const moon = extractPlacement(horoscope.CelestialBodies?.moon);

  // Rising = Ascendant angle
  const ascendant = horoscope.Angles?.ascendant || horoscope.Ascendant;
  const rising = extractPlacement(ascendant);

  return {
    sun,
    moon,
    rising,
    calculatedAt: new Date().toISOString(),
  };
}

// ─── localStorage persistence ───

const STORAGE_KEY = 'relate_astrology_birth_data';
const CHART_KEY = 'relate_astrology_chart';

export function saveBirthData(data: BirthData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadBirthData(): BirthData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveChartResult(result: BirthChartResult): void {
  localStorage.setItem(CHART_KEY, JSON.stringify(result));
}

export function loadChartResult(): BirthChartResult | null {
  try {
    const raw = localStorage.getItem(CHART_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearAstrologyData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CHART_KEY);
}
