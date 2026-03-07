'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ModulePage from '@/components/assessment/ModulePage';
import M5Reward from '@/components/assessment/rewards/M5Reward';
import { loadModuleQuestions } from '@/lib/question-data';
import { FlatQuestion } from '@/lib/questions';
import { useAuth } from '@/lib/auth-context';

export default function Module5Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<string>('M');
  const [totalQuestions, setTotalQuestions] = useState(391);

  useEffect(() => {
    const g = localStorage.getItem('relate_gender');
    if (!g) { router.push('/onboarding/demographics'); return; }
    setGender(g);
    loadModuleQuestions(5, g, user?.id).then(qs => {
      setQuestions(qs);
      setLoading(false);
      // Calculate total questions across all modules
      const m1Count = JSON.parse(localStorage.getItem('relate_m1_responses') || '{}');
      const m2Count = JSON.parse(localStorage.getItem('relate_m2_responses') || '{}');
      const m3Count = JSON.parse(localStorage.getItem('relate_m3_responses') || '{}');
      const m4Count = JSON.parse(localStorage.getItem('relate_m4_responses') || '{}');
      setTotalQuestions(Object.keys(m1Count).length + Object.keys(m2Count).length + Object.keys(m3Count).length + Object.keys(m4Count).length + qs.length);
    }).catch(() => setLoading(false));
  }, [router, user]);

  const handleComplete = useCallback(async (responses: Record<string, number | string>) => {
    const res = await fetch('/api/score-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: 5, gender, responses }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('relate_m5_scored', JSON.stringify(data));
    }
    return data;
  }, [gender]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading questions...</div>;

  return (
    <ModulePage
      moduleNumber={5}
      title="Know Your Patterns"
      questions={questions}
      nextPath="/assessment/processing"
      onModuleComplete={handleComplete}
      renderReward={({ scoredData, onContinue }) => (
        <M5Reward scoredData={scoredData} totalQuestions={totalQuestions} onContinue={onContinue} />
      )}
    />
  );
}
