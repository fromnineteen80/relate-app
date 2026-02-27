'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ModulePage from '@/components/assessment/ModulePage';
import M3Reward from '@/components/assessment/rewards/M3Reward';
import { loadModuleQuestions } from '@/lib/question-data';
import { FlatQuestion } from '@/lib/questions';

export default function Module3Page() {
  const router = useRouter();
  const [questions, setQuestions] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<string>('M');

  useEffect(() => {
    const g = localStorage.getItem('relate_gender');
    if (!g) { router.push('/onboarding/demographics'); return; }
    setGender(g);
    loadModuleQuestions(3, g).then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleComplete = useCallback(async (responses: Record<string, number | string>) => {
    const res = await fetch('/api/score-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: 3, gender, responses }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('relate_m3_scored', JSON.stringify(data));
    }
    return data;
  }, [gender]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading questions...</div>;

  return (
    <ModulePage
      moduleNumber={3}
      title="How You Connect"
      questions={questions}
      nextPath="/assessment"
      onModuleComplete={handleComplete}
      renderReward={({ scoredData, onContinue }) => (
        <M3Reward scoredData={scoredData} onContinue={onContinue} />
      )}
    />
  );
}
