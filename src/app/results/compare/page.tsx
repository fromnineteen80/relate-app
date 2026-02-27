'use client';

import Link from 'next/link';

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <Link href="/results" className="text-sm text-secondary hover:text-foreground">← Back to Results</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12 w-full text-center">
        <h2 className="font-serif text-2xl font-semibold mb-4">Partner Comparison</h2>
        <p className="text-secondary mb-6">
          Both partners must complete the assessment before the comparison report is available.
        </p>
        <Link href="/invite" className="btn-primary">Invite Partner</Link>
      </main>
    </div>
  );
}
