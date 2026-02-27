'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { config } from '@/lib/config';
import { SiteHeader } from '@/components/SiteHeader';

type ModuleStatus = { completed: boolean; questionIndex: number; total: number };

const MODULES = [
  { id: 1, title: 'What You Want', desc: 'Partner preferences across 4 dimensions', time: '~38 min', path: '/assessment/module-1' },
  { id: 2, title: 'Who You Are', desc: 'Self-assessment with validation', time: '~39 min', path: '/assessment/module-2' },
  { id: 3, title: 'How You Connect', desc: 'Intimacy access patterns', time: '~8 min', path: '/assessment/module-3' },
  { id: 4, title: 'When Things Get Hard', desc: 'Conflict, repair, capacity', time: '~17 min', path: '/assessment/module-4' },
];

export default function AssessmentHub() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<number, ModuleStatus>>({});
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (config.useMockAuth) {
      setGender(localStorage.getItem('relate_gender'));
      const s: Record<number, ModuleStatus> = {};
      for (let m = 1; m <= 4; m++) {
        const saved = localStorage.getItem(`relate_m${m}_responses`);
        const completed = localStorage.getItem(`relate_m${m}_completed`) === 'true';
        s[m] = { completed, questionIndex: saved ? Object.keys(JSON.parse(saved)).length : 0, total: 0 };
      }
      setStatuses(s);
    }
  }, [authLoading, user, router]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  if (!gender) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
          <h2 className="font-serif text-2xl font-semibold mb-4">Complete your profile first</h2>
          <p className="text-secondary mb-6">You need to fill in your demographics before starting the assessment.</p>
          <Link href="/onboarding/demographics" className="btn-primary">Go to Demographics</Link>
        </main>
      </div>
    );
  }

  const allCompleted = [1, 2, 3, 4].every(m => statuses[m]?.completed);

  function getModuleState(moduleId: number) {
    if (statuses[moduleId]?.completed) return 'completed';
    if (moduleId === 1) return 'active';
    if (statuses[moduleId - 1]?.completed) return 'active';
    return 'locked';
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-3xl font-semibold mb-2">Assessment</h2>
        <p className="text-secondary mb-8">Complete all 4 modules to receive your persona and compatibility rankings.</p>

        <div className="space-y-3">
          {MODULES.map((mod) => {
            const state = getModuleState(mod.id);
            return (
              <div key={mod.id} className={`card flex items-center justify-between ${state === 'locked' ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
                    state === 'completed' ? 'bg-success text-white' :
                    state === 'active' ? 'bg-accent text-white' :
                    'bg-stone-200 text-secondary'
                  }`}>
                    {state === 'completed' ? '✓' : mod.id}
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold">{mod.title}</h3>
                    <p className="text-xs text-secondary">{mod.desc} · {mod.time}</p>
                  </div>
                </div>
                {state === 'active' && (
                  <Link href={mod.path} className="btn-primary text-sm">
                    {statuses[mod.id]?.questionIndex > 0 ? 'Resume' : 'Start'}
                  </Link>
                )}
                {state === 'completed' && (
                  <span className="text-xs font-mono text-success">Complete</span>
                )}
              </div>
            );
          })}
        </div>

        {allCompleted && (
          <div className="mt-8">
            <Link href="/assessment/processing" className="btn-primary w-full block text-center">
              View Results
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
