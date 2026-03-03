'use client';

type ZipResult = {
  city: string;
  state: string;
};

// Looks up the closest CBSA metro area name for a ZIP code via server-side engine.
// County is entered manually by the user.
const cache: Record<string, ZipResult> = {};

export async function lookupZip(zip: string): Promise<ZipResult | null> {
  if (!/^\d{5}$/.test(zip)) return null;
  if (cache[zip]) return cache[zip];

  try {
    const res = await fetch(`/api/zip-lookup?zip=${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.city) return null;

    const result: ZipResult = { city: data.city, state: data.state || '' };
    cache[zip] = result;
    return result;
  } catch {
    return null;
  }
}
