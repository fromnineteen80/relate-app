'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ModulePage from '@/components/assessment/ModulePage';
import M4Reward from '@/components/assessment/rewards/M4Reward';
import { loadModuleQuestions } from '@/lib/question-data';
import { FlatQuestion } from '@/lib/questions';

export default function Module4Page() {
  const router = useRouter();
  const [questions, setQuestions] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<string>('M');
  const [totalQuestions, setTotalQuestions] = useState(367);

  useEffect(() => {
    const g = localStorage.getItem('relate_gender');
    if (!g) { router.push('/onboarding/demographics'); return; }
    setGender(g);
    loadModuleQuestions(4, g).then(qs => {
      setQuestions(qs);
      setLoading(false);
      // Calculate total questions across all modules
      const m1Count = JSON.parse(localStorage.getItem('relate_m1_responses') || '{}');
      const m2Count = JSON.parse(localStorage.getItem('relate_m2_responses') || '{}');
      const m3Count = JSON.parse(localStorage.getItem('relate_m3_responses') || '{}');
      setTotalQuestions(Object.keys(m1Count).length + Object.keys(m2Count).length + Object.keys(m3Count).length + qs.length);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleComplete = useCallback(async (responses: Record<string, number | string>) => {
    const m3Responses = JSON.parse(localStorage.getItem('relate_m3_responses') || '{}');

    const res = await fetch('/api/score-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: 4, gender, responses, m3Responses }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('relate_m4_scored', JSON.stringify(data));
    }
    return data;
  }, [gender]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading questions...</div>;

  return (
    <ModulePage
      moduleNumber={4}
      title="When Things Get Hard"
      questions={questions}
      nextPath="/assessment/processing"
      onModuleComplete={handleComplete}
      renderReward={({ scoredData, onContinue }) => (
        <M4Reward scoredData={scoredData} totalQuestions={totalQuestions} onContinue={onContinue} />
      )}
    />
  );
}
