'use client';

type ZipResult = {
  city: string;
  state: string;
  counties: string[];
};

// Client-side zip code lookup using the free Zippopotam.us API
// Falls back to a basic static mapping for offline/mock mode
let cache: Record<string, ZipResult> = {};

export async function lookupZip(zip: string): Promise<ZipResult | null> {
  if (!/^\d{5}$/.test(zip)) return null;

  if (cache[zip]) return cache[zip];

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();

    const places = data.places || [];
    if (places.length === 0) return null;

    const state = places[0]['state abbreviation'] || '';
    const city = places[0]['place name'] || '';
    // Collect unique county names from all places for this zip
    const countySet = new Set<string>();
    places.forEach((p: Record<string, string>) => { if (p['place name']) countySet.add(p['place name']); });
    const counties = Array.from(countySet);

    const result: ZipResult = { city, state, counties: counties.length > 0 ? counties : [city] };
    cache[zip] = result;
    return result;
  } catch {
    // Fallback for offline/error scenarios
    return lookupZipOffline(zip);
  }
}

// Minimal offline fallback for common zip prefixes
function lookupZipOffline(zip: string): ZipResult | null {
  const prefix = zip.substring(0, 3);
  const stateMap: Record<string, string> = {
    '100': 'NY', '101': 'NY', '102': 'NY', '103': 'NY', '104': 'NY', '110': 'NY', '111': 'NY', '112': 'NY',
    '200': 'DC', '201': 'VA', '202': 'DC', '203': 'DC', '210': 'MD', '211': 'MD', '212': 'MD',
    '300': 'GA', '301': 'GA', '302': 'GA', '303': 'GA', '304': 'GA',
    '330': 'FL', '331': 'FL', '332': 'FL', '333': 'FL', '334': 'FL',
    '600': 'IL', '601': 'IL', '602': 'IL', '603': 'IL', '604': 'IL', '605': 'IL', '606': 'IL',
    '700': 'LA', '701': 'LA',
    '750': 'TX', '751': 'TX', '752': 'TX', '760': 'TX', '770': 'TX', '771': 'TX', '772': 'TX', '773': 'TX',
    '800': 'CO', '801': 'CO', '802': 'CO', '803': 'CO',
    '900': 'CA', '901': 'CA', '902': 'CA', '903': 'CA', '904': 'CA', '905': 'CA', '906': 'CA',
    '910': 'CA', '911': 'CA', '912': 'CA', '913': 'CA', '914': 'CA', '915': 'CA', '916': 'CA', '917': 'CA',
    '920': 'CA', '921': 'CA', '922': 'CA', '923': 'CA', '924': 'CA', '925': 'CA', '926': 'CA',
    '930': 'CA', '931': 'CA', '932': 'CA', '933': 'CA', '934': 'CA', '935': 'CA',
    '940': 'CA', '941': 'CA', '942': 'CA', '943': 'CA', '944': 'CA', '945': 'CA', '946': 'CA', '947': 'CA',
    '950': 'CA', '951': 'CA', '952': 'CA', '953': 'CA', '954': 'CA', '955': 'CA', '956': 'CA',
    '980': 'WA', '981': 'WA', '982': 'WA', '983': 'WA', '984': 'WA', '985': 'WA', '986': 'WA',
    '070': 'NJ', '071': 'NJ', '072': 'NJ', '073': 'NJ', '074': 'NJ', '075': 'NJ', '076': 'NJ',
    '080': 'NJ', '081': 'NJ', '082': 'NJ', '083': 'NJ', '084': 'NJ', '085': 'NJ', '086': 'NJ', '087': 'NJ', '088': 'NJ', '089': 'NJ',
    '190': 'PA', '191': 'PA',
    '021': 'MA', '022': 'MA',
    '480': 'MI', '481': 'MI', '482': 'MI',
    '430': 'OH', '431': 'OH', '432': 'OH',
    '550': 'MN', '551': 'MN', '553': 'MN', '554': 'MN', '555': 'MN',
    '850': 'AZ', '852': 'AZ', '853': 'AZ', '855': 'AZ', '856': 'AZ', '857': 'AZ',
    '460': 'IN', '461': 'IN', '462': 'IN',
    '370': 'TN', '371': 'TN', '372': 'TN', '373': 'TN', '374': 'TN', '375': 'TN',
  };
  const state = stateMap[prefix];
  if (!state) return null;
  return { city: '', state, counties: [] };
}

// For looking up counties given a state (client-side API call)
export async function lookupCounties(state: string): Promise<string[]> {
  // Use Census Bureau or a simple mapping per state
  // For now, return empty and let the API handle it
  void state;
  return [];
}
