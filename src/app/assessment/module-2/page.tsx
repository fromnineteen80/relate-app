'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ModulePage from '@/components/assessment/ModulePage';
import M2Reward from '@/components/assessment/rewards/M2Reward';
import { loadModuleQuestions } from '@/lib/question-data';
import { FlatQuestion } from '@/lib/questions';

export default function Module2Page() {
  const router = useRouter();
  const [questions, setQuestions] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<string>('M');

  useEffect(() => {
    const g = localStorage.getItem('relate_gender');
    if (!g) { router.push('/onboarding/demographics'); return; }
    setGender(g);
    loadModuleQuestions(2, g).then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleComplete = useCallback(async (responses: Record<string, number | string>) => {
    // Get M1 responses for comparison
    const m1Responses = JSON.parse(localStorage.getItem('relate_m1_responses') || '{}');

    const res = await fetch('/api/score-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: 2, gender, responses, m1Responses }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('relate_m2_scored', JSON.stringify(data));
    }
    return data;
  }, [gender]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading questions...</div>;

  return (
    <ModulePage
      moduleNumber={2}
      title="Who You Are"
      questions={questions}
      nextPath="/assessment"
      onModuleComplete={handleComplete}
      renderReward={({ scoredData, onContinue }) => (
        <M2Reward scoredData={scoredData} onContinue={onContinue} />
      )}
    />
  );
}
