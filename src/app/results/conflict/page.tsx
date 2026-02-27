'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConflictPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (!stored) { router.push('/assessment'); return; }
    setReport(JSON.parse(stored));
  }, [router]);

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const m4 = report.m4 || {};
  const summary = m4.summary || {};
  const gottman = m4.gottmanScreener || m4.gottmanScores || {};

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <Link href="/results" className="text-sm text-secondary hover:text-foreground">← Back to Results</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-6">Conflict Profile</h2>

        <section className="card mb-4">
          <h3 className="font-serif font-semibold mb-3">Conflict Approach</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-secondary">Style</span>
              <p className="font-mono capitalize">{summary.approach || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-secondary">Primary Driver</span>
              <p className="font-mono capitalize">{summary.primaryDriver || '—'}</p>
            </div>
          </div>
        </section>

        <section className="card mb-4">
          <h3 className="font-serif font-semibold mb-3">Repair Style</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs text-secondary">Speed</span>
              <p className="font-mono capitalize">{summary.repairSpeed || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-secondary">Mode</span>
              <p className="font-mono capitalize">{summary.repairMode || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-secondary">Capacity</span>
              <p className="font-mono capitalize">{summary.capacity || '—'}</p>
            </div>
          </div>
        </section>

        <section className="card mb-4">
          <h3 className="font-serif font-semibold mb-3">Gottman Four Horsemen</h3>
          <div className="space-y-3">
            {['criticism', 'contempt', 'defensiveness', 'stonewalling'].map(horseman => {
              const score = gottman[horseman] ?? 0;
              const level = score > 70 ? 'text-danger' : score > 40 ? 'text-warning' : 'text-success';
              return (
                <div key={horseman}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{horseman}</span>
                    <span className={`font-mono ${level}`}>{score}</span>
                  </div>
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${score > 70 ? 'bg-danger' : score > 40 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {report.attentiveness && (
          <section className="card">
            <h3 className="font-serif font-semibold mb-3">Attentiveness</h3>
            <div className="flex items-center gap-4">
              <span className="font-mono text-2xl font-semibold">{report.attentiveness.score ?? '—'}</span>
              <span className="text-sm text-secondary capitalize">{report.attentiveness.level || '—'}</span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
