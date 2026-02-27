'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';

export default function ProcessingPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Collecting responses...');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function process() {
      try {
        const gender = localStorage.getItem('relate_gender');
        if (!gender) { router.push('/onboarding/demographics'); return; }

        setProgress(10);
        setStatus('Loading module responses...');

        const m1 = JSON.parse(localStorage.getItem('relate_m1_responses') || '{}');
        const m2 = JSON.parse(localStorage.getItem('relate_m2_responses') || '{}');
        const m3 = JSON.parse(localStorage.getItem('relate_m3_responses') || '{}');
        const m4 = JSON.parse(localStorage.getItem('relate_m4_responses') || '{}');
        const demographics = JSON.parse(localStorage.getItem('relate_demographics') || '{}');

        setProgress(30);
        setStatus('Scoring modules...');

        const res = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gender,
            m1Responses: m1,
            m2Responses: m2,
            m3Responses: m3,
            m4Responses: m4,
            demographics,
          }),
        });

        setProgress(70);
        setStatus('Generating compatibility rankings...');

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || 'Processing failed');
        }

        setProgress(90);
        setStatus('Building your report...');

        localStorage.setItem('relate_results', JSON.stringify(data.report));

        setProgress(100);
        setStatus('Complete');

        setTimeout(() => router.push('/results'), 500);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Processing failed');
      }
    }

    process();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h2 className="font-serif text-2xl font-semibold mb-6">Processing Your Assessment</h2>

          <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-secondary">{status}</p>

          {error && (
            <div className="mt-6">
              <p className="text-sm text-danger mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-secondary">
                Retry
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
