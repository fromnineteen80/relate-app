'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModulePage from '@/components/assessment/ModulePage';
import { loadModuleQuestions } from '@/lib/question-data';
import { FlatQuestion } from '@/lib/questions';

export default function Module1Page() {
  const router = useRouter();
  const [questions, setQuestions] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gender = localStorage.getItem('relate_gender');
    if (!gender) { router.push('/onboarding/demographics'); return; }
    loadModuleQuestions(1, gender).then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading questions...</div>;

  return <ModulePage moduleNumber={1} title="What You Want" questions={questions} nextPath="/assessment" />;
}
