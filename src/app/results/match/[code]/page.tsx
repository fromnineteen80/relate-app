'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function tierLabel(tier: string) {
  const labels: Record<string, string> = {
    ideal: 'Ideal', kismet: 'Kismet', effort: 'Effort',
    longShot: 'Long Shot', atRisk: 'At Risk', incompatible: 'Incompatible',
  };
  return labels[tier] || tier;
}

function tierColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'bg-success', kismet: 'bg-success', effort: 'bg-warning',
    longShot: 'bg-secondary', atRisk: 'bg-danger', incompatible: 'bg-danger',
  };
  return colors[tier] || 'bg-secondary';
}

export default function MatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const [report, setReport] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (!stored) { router.push('/assessment'); return; }
    const r = JSON.parse(stored);
    setReport(r);
    const m = r.matches?.find((m: any) => m.code === code);
    if (!m) { router.push('/results/matches'); return; }
    setMatch(m);
  }, [router, code]);

  if (!match || !report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <Link href="/results/matches" className="text-sm text-secondary hover:text-foreground">← All Matches</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 w-full">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="font-mono text-xs text-secondary">Match #{match.rank}</span>
            <h2 className="font-serif text-3xl font-semibold">{match.name}</h2>
            <span className="font-mono text-sm text-accent">{match.code}</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-3xl font-semibold">{match.compatibilityScore}</span>
            <p className="text-xs text-secondary">compatibility</p>
          </div>
        </div>

        <div className={`inline-block text-white text-xs px-3 py-1 rounded-full mb-6 ${tierColor(match.tier)}`}>
          {tierLabel(match.tier)}
        </div>

        {match.traits && <p className="text-secondary mb-6">{match.traits}</p>}

        {match.summary && (
          <section className="card mb-4">
            <h3 className="font-serif font-semibold mb-2">Compatibility Summary</h3>
            <p className="text-sm text-secondary">{match.summary}</p>
          </section>
        )}

        <section className="card mb-4">
          <h3 className="font-serif font-semibold mb-3">Your Pairing</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-secondary">You</span>
              <p className="font-serif font-semibold">{report.persona.name}</p>
              <span className="font-mono text-xs text-accent">{report.persona.code}</span>
            </div>
            <div>
              <span className="text-xs text-secondary">Match</span>
              <p className="font-serif font-semibold">{match.name}</p>
              <span className="font-mono text-xs text-accent">{match.code}</span>
            </div>
          </div>
        </section>

        <div className="flex gap-3 mt-6">
          <Link href="/results/matches" className="btn-secondary text-xs">All Matches</Link>
          <Link href="/advisor" className="btn-primary text-xs">Discuss with Advisor</Link>
        </div>
      </main>
    </div>
  );
}
