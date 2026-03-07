import { NextRequest, NextResponse } from 'next/server';
import { flattenM1M2Questions, flattenM3Questions, flattenM4Questions, flattenM5Questions } from '@/lib/questions';
import { getM1Questions, getM2Questions, getM3Questions, getM4Questions, getM5Questions } from '@/lib/scoring';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const module = parseInt(searchParams.get('module') || '1');
  const gender = searchParams.get('gender') || 'M';
  const seed = searchParams.get('seed') || undefined;

  try {
    let questions;
    switch (module) {
      case 1:
        questions = flattenM1M2Questions(getM1Questions(gender), seed);
        break;
      case 2:
        questions = flattenM1M2Questions(getM2Questions(gender), seed);
        break;
      case 3:
        questions = flattenM3Questions(getM3Questions(gender), seed);
        break;
      case 4:
        questions = flattenM4Questions(getM4Questions(gender), seed);
        break;
      case 5:
        questions = flattenM5Questions(getM5Questions(gender), seed);
        break;
      default:
        return NextResponse.json({ error: 'Invalid module' }, { status: 400 });
    }

    return NextResponse.json({ questions, total: questions.length });
  } catch (error) {
    console.error('Failed to load questions:', error);
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
  }
}
