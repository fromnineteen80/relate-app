'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ProfileSettings() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
        </div>
      </header>
      <main className="max-w-md mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-6">Profile Settings</h2>
        <div className="card mb-4">
          <p className="text-sm text-secondary">Email</p>
          <p className="font-mono text-sm">{user?.email || '—'}</p>
        </div>
        <Link href="/onboarding/demographics" className="btn-secondary block text-center mb-4">
          Update Demographics
        </Link>
        <button onClick={handleSignOut} className="text-sm text-danger hover:underline">
          Sign out
        </button>
      </main>
    </div>
  );
}
