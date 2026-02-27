'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function tierColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'text-success', kismet: 'text-success', effort: 'text-warning',
    longShot: 'text-secondary', atRisk: 'text-danger', incompatible: 'text-danger',
  };
  return colors[tier] || 'text-secondary';
}

function tierLabel(tier: string) {
  const labels: Record<string, string> = {
    ideal: 'Ideal', kismet: 'Kismet', effort: 'Effort',
    longShot: 'Long Shot', atRisk: 'At Risk', incompatible: 'Incompatible',
  };
  return labels[tier] || tier;
}

export default function MatchesPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (!stored) { router.push('/assessment'); return; }
    setReport(JSON.parse(stored));
  }, [router]);

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <Link href="/results" className="text-sm text-secondary hover:text-foreground">← Back to Results</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-6">All Compatibility Rankings</h2>

        <div className="space-y-3">
          {report.matches.map((match: any) => (
            <Link key={match.code} href={`/results/match/${match.code}`} className="card block hover:border-accent transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg text-secondary w-8">{match.rank}</span>
                  <div>
                    <h3 className="font-serif font-semibold">{match.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-secondary">{match.code}</span>
                      <span className={`text-xs font-medium ${tierColor(match.tier)}`}>{tierLabel(match.tier)}</span>
                    </div>
                    {match.traits && <p className="text-xs text-secondary mt-1">{match.traits}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-semibold">{match.compatibilityScore}</span>
                  <p className="text-xs text-secondary">compatibility</p>
                </div>
              </div>
              {match.summary && <p className="text-sm text-secondary mt-2">{match.summary}</p>}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
