import { NextRequest, NextResponse } from 'next/server';
import { flattenM1M2Questions, flattenM3Questions, flattenM4Questions } from '@/lib/questions';
import { getM1Questions, getM2Questions, getM3Questions, getM4Questions } from '@/lib/scoring';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const module = parseInt(searchParams.get('module') || '1');
  const gender = searchParams.get('gender') || 'M';

  try {
    let questions;
    switch (module) {
      case 1:
        questions = flattenM1M2Questions(getM1Questions(gender));
        break;
      case 2:
        questions = flattenM1M2Questions(getM2Questions(gender));
        break;
      case 3:
        questions = flattenM3Questions(getM3Questions(gender));
        break;
      case 4:
        questions = flattenM4Questions(getM4Questions(gender));
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
