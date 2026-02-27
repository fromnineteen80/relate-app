'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { useAdvisor } from '@/lib/advisor-context';

function AdvisorRedirect() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode');
  const { open, setMode, isOpen } = useAdvisor();

  useEffect(() => {
    // Set mode from URL param
    if (initialMode === 'couples') {
      setMode('couples');
    } else if (initialMode === 'individual') {
      setMode('individual');
    }
    // Auto-open the sidebar
    if (!isOpen) open();
  }, [initialMode, open, setMode, isOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="font-serif text-2xl font-semibold mb-3">RELATE Advisor</h2>
          <p className="text-sm text-secondary mb-6">
            The advisor is available as a sidebar on every page. Click the button in the bottom-right corner to open it anytime.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={open} className="btn-primary text-sm">
              Open Advisor
            </button>
            <Link href="/results" className="btn-secondary text-sm">
              Back to Results
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-secondary">Loading advisor...</div>}>
      <AdvisorRedirect />
    </Suspense>
  );
}
