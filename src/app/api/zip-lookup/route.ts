import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const demoEngine = require('../../../../relate_demographics_engine.js');

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip');
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 });
  }

  try {
    await demoEngine.initializeData();
    const cbsa = await demoEngine.findCBSAFromZIP(zip);

    if (cbsa.error) {
      return NextResponse.json({ error: cbsa.error }, { status: 404 });
    }

    // cbsaLabel is e.g. "Birmingham, AL" or "New York-Newark-Jersey City, NY-NJ-PA"
    const label = cbsa.cbsaLabel || cbsa.cbsaName || '';
    const parts = label.split(', ');
    const state = parts.length > 1 ? parts[parts.length - 1].split('-')[0].trim() : '';

    return NextResponse.json({ city: label, state });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lookup failed' }, { status: 500 });
  }
}
