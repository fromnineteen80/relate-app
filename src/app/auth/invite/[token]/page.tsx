'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      localStorage.setItem('relate_partner_token', token);
      router.push('/onboarding/demographics');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-2xl font-semibold mb-2">You&apos;ve been invited</h2>
          <p className="text-sm text-secondary mb-6">Create an account to take the assessment and see your couples compatibility report.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required minLength={6} />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Accept & Create Account'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
