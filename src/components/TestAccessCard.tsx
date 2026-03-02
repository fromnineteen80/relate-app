'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function TestAccessCard() {
  const { user } = useAuth();
  const router = useRouter();

  function handleActivate() {
    localStorage.setItem('relate_payment_tier', JSON.stringify({ tier: 'premium', timestamp: Date.now() + 86400000 * 365 }));
    if (user) {
      router.push('/assessment');
    } else {
      router.push('/auth/signup');
    }
  }

  return (
    <div className="card flex flex-col border-2 border-dashed border-accent/50 bg-accent/5 relative">
      <span className="font-mono text-xs text-accent tracking-wider">TEST ACCESS</span>
      <p className="font-serif text-4xl font-semibold mt-2">$0</p>
      <p className="text-sm text-secondary mt-3 mb-6">All features unlocked for testing.</p>
      <div className="space-y-2.5 mb-8 flex-1">
        {[
          'Full premium access',
          'All 16 match rankings + details',
          'Unlimited AI advisor',
          'Downloadable PDF report',
          'No payment required',
        ].map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm">
            <span className="text-accent mt-0.5">&#8226;</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <button onClick={handleActivate} className="btn-primary w-full text-center">
        Access All Features
      </button>
    </div>
  );
}
