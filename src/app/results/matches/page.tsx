'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';

/* eslint-disable @typescript-eslint/no-explicit-any */

function tierTextColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'text-success', kismet: 'text-success/70', effort: 'text-warning',
    longShot: 'text-stone-400', atRisk: 'text-danger/70', incompatible: 'text-danger',
  };
  return colors[tier] || 'text-secondary';
}

function tierDotColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'bg-success', kismet: 'bg-success/70', effort: 'bg-warning',
    longShot: 'bg-stone-400', atRisk: 'bg-danger/70', incompatible: 'bg-danger',
  };
  return colors[tier] || 'bg-secondary';
}

function tierLabel(tier: string) {
  const labels: Record<string, string> = {
    ideal: 'Ideal', kismet: 'Kismet', effort: 'Effort',
    longShot: 'Long Shot', atRisk: 'At Risk', incompatible: 'Incompatible',
  };
  return labels[tier] || tier;
}

/** Truncate a summary to the first N sentences. */
function truncateSentences(text: string, max: number): string {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts || parts.length <= max) return text;
  return parts.slice(0, max).join('').trim();
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

  const persona = report.persona;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        <p className="text-xs text-secondary mb-1">Click on each persona to read the full match experience</p>
        <h2 className="font-serif text-2xl font-semibold mb-2">All Compatibility Rankings</h2>
        {persona && (
          <p className="text-sm text-secondary mb-6">
            Based on your <span className="font-semibold text-primary">{persona.name}</span> <span className="font-mono text-xs text-accent">{persona.code}</span> persona
          </p>
        )}

        {/* Tier legend */}
        <div className="flex flex-wrap gap-3 mb-6 text-[11px]">
          {(['ideal', 'kismet', 'effort', 'longShot', 'atRisk', 'incompatible'] as const).map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tierDotColor(t)}`} />
              <span className="text-secondary">{tierLabel(t)}</span>
            </span>
          ))}
        </div>

        <div className="space-y-4">
          {report.matches.map((match: any) => (
            <button
              key={match.code}
              onClick={() => router.push(`/results/match/${match.code}`)}
              className="card w-full text-left hover:border-accent/40 transition-colors cursor-pointer"
            >
              {/* Header row: rank + name/code/traits on left, score + tier on right, vertically centered */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-lg text-secondary w-8 shrink-0 text-center">{match.rank}</span>
                  <div className="min-w-0">
                    <h3 className="font-serif font-semibold">{match.name}</h3>
                    <span className="font-mono text-xs text-secondary">{match.code}</span>
                    {match.traits && <p className="text-xs text-secondary mt-0.5">{match.traits}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xl font-semibold block">{match.compatibilityScore}</span>
                  <span className={`text-xs font-semibold ${tierTextColor(match.tier)}`}>
                    {tierLabel(match.tier)}
                  </span>
                </div>
              </div>

              {/* Compatibility summary, first 3 sentences only on rankings page */}
              {match.summary && (
                <p className="text-sm text-secondary leading-relaxed mt-3 ml-12">{truncateSentences(match.summary, 3)}</p>
              )}
            </button>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
