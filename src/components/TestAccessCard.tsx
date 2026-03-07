'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function TestAccessCard() {
  const { user } = useAuth();
  const router = useRouter();

  function handleActivate() {
    localStorage.setItem('relate_payment_tier', JSON.stringify({ tier: 'pro', timestamp: Date.now() + 86400000 * 365 }));
    if (user) {
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
      <button onClick={handleActivate} className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors">
        Access All Features
      </button>
    </div>
  );
}
