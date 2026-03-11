'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function TestAccessCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activating, setActivating] = useState(false);

  async function handleActivate() {
    setActivating(true);
    // Always set localStorage for immediate UI
    localStorage.setItem('relate_payment_tier', JSON.stringify({ tier: 'pro', timestamp: Date.now() + 86400000 * 365 }));

    // Also persist to Supabase via discount code API so it survives across sessions
    if (user?.email) {
      const now = new Date();
      const month = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'][now.getMonth()];
      const code = `100-PRO-${month}-${now.getFullYear()}`;
      try {
        await fetch('/api/discount-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, email: user.email }),
        });
        // Also grant attachment style access
        const bpCode = `100-ATTACH-${month}-${now.getFullYear()}`;
        await fetch('/api/discount-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: bpCode, email: user.email }),
        });
        localStorage.removeItem('relate_attachment_access');
      } catch { /* localStorage fallback still works */ }
      router.push('/assessment');
    } else {
      router.push('/auth/signup');
    }
  }

  return (
    <div className="card flex flex-col border-2 border-dashed border-emerald-400/50 bg-emerald-50 relative">
      <span className="font-mono text-xs text-emerald-600 tracking-wider">TEST ACCESS</span>
      <p className="font-serif text-4xl font-semibold mt-2">$0</p>
      <p className="text-sm text-secondary mt-3 mb-6">All features unlocked for testing.</p>
      <ul className="bullet-list mb-8 flex-1">
        {[
          'Full premium access',
          'All 16 match rankings + details',
          'Unlimited AI advisor',
          'Downloadable PDF report',
          'No payment required',
        ].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button onClick={handleActivate} disabled={activating} className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-60">
        {activating ? 'Activating...' : 'Access All Features'}
      </button>
    </div>
  );
}
