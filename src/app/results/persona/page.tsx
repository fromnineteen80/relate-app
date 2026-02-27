'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PersonaPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (!stored) { router.push('/assessment'); return; }
    setReport(JSON.parse(stored));
  }, [router]);

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const { persona } = report;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <Link href="/results" className="text-sm text-secondary hover:text-foreground">← Back to Results</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 w-full">
        <span className="font-mono text-xs text-secondary">Your Persona</span>
        <h2 className="font-serif text-3xl font-semibold mt-1 mb-1">{persona.name}</h2>
        <span className="font-mono text-sm text-accent">{persona.code}</span>
        {persona.traits && <p className="text-secondary mt-3 mb-6">{persona.traits}</p>}

        {persona.datingBehavior?.length > 0 && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-3">Dating Behavior</h3>
            <ul className="space-y-2">
              {persona.datingBehavior.map((b: string, i: number) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-accent">—</span>{b}</li>
              ))}
            </ul>
          </section>
        )}

        {persona.inRelationships?.length > 0 && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-3">In Relationships</h3>
            <ul className="space-y-2">
              {persona.inRelationships.map((b: string, i: number) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-accent">—</span>{b}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {persona.mostAttractive?.length > 0 && (
            <section className="card">
              <h3 className="font-serif font-semibold mb-3 text-success">Strengths</h3>
              <ul className="space-y-2">
                {persona.mostAttractive.map((b: string, i: number) => (
                  <li key={i} className="text-sm">{b}</li>
                ))}
              </ul>
            </section>
          )}

          {persona.leastAttractive?.length > 0 && (
            <section className="card">
              <h3 className="font-serif font-semibold mb-3 text-warning">Growth Areas</h3>
              <ul className="space-y-2">
                {persona.leastAttractive.map((b: string, i: number) => (
                  <li key={i} className="text-sm">{b}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
