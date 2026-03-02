'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { SiteHeader } from '@/components/SiteHeader';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push('/auth/verify-email');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="auth" />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-semibold mb-2">Create your account</h1>
            <p className="text-sm text-secondary">Start the assessment. Discover your persona. It&apos;s free.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                placeholder="Confirm your password"
                required
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              Already have an account? <Link href="/auth/login" className="text-accent hover:underline">Log in</Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-xs text-secondary">
              <span className="text-accent mt-0.5">&#8226;</span>
              <span>The assessment takes ~100 minutes across 4 modules. Your progress is saved automatically.</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-secondary mt-2">
              <span className="text-accent mt-0.5">&#8226;</span>
              <span>Free tier includes your persona code, traits, and top 3 compatibility matches.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
