'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ModulePage from '@/components/assessment/ModulePage';
import M1Reward from '@/components/assessment/rewards/M1Reward';
import { loadModuleQuestions } from '@/lib/question-data';
import { FlatQuestion } from '@/lib/questions';
import { useAuth } from '@/lib/auth-context';

export default function Module1Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<string>('M');

  useEffect(() => {
    const g = localStorage.getItem('relate_gender');
    if (!g) { router.push('/onboarding/demographics'); return; }
    setGender(g);
    loadModuleQuestions(1, g, user?.id).then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router, user]);

  const handleComplete = useCallback(async (responses: Record<string, number | string>) => {
    const res = await fetch('/api/score-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: 1, gender, responses }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('relate_m1_scored', JSON.stringify(data));
    }
    return data;
  }, [gender]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading questions...</div>;

  return (
    <ModulePage
      moduleNumber={1}
      title="What You Want"
      questions={questions}
      nextPath="/assessment"
      onModuleComplete={handleComplete}
      renderReward={({ scoredData, onContinue }) => (
        <M1Reward scoredData={scoredData} onContinue={onContinue} />
      )}
    />
  );
}
