import { NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-require-imports */
const personaModule = require('../../../../relate_persona_definitions.js');

export async function GET() {
  return NextResponse.json({
    male: personaModule.M2_PERSONA_METADATA || {},
    female: personaModule.W2_PERSONA_METADATA || {},
  });
}
