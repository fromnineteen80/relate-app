'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';

/* eslint-disable @typescript-eslint/no-explicit-any */

function tierLabel(tier: string) {
  const labels: Record<string, string> = {
    ideal: 'Ideal', kismet: 'Kismet', effort: 'Effort',
    longShot: 'Long Shot', atRisk: 'At Risk', incompatible: 'Incompatible',
  };
  return labels[tier] || tier;
}

function tierColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'bg-success', kismet: 'bg-success/70', effort: 'bg-warning',
    longShot: 'bg-stone-400', atRisk: 'bg-danger/70', incompatible: 'bg-danger',
  };
  return colors[tier] || 'bg-secondary';
}

function InsightCard({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <section className={`card mb-4 ${accent ? 'border-accent/30' : ''}`}>
      <h3 className="font-serif font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-secondary flex gap-2">
            <span className="text-accent mt-0.5 shrink-0">&bull;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-secondary w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="font-mono text-xs text-secondary w-8 text-right">{Math.round(value)}</span>
    </div>
  );
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

  const genderLabel = report.gender === 'M' ? 'him' : 'her';
  const GenderCap = report.gender === 'M' ? 'He' : 'She';

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="max-w-2xl mx-auto px-6 py-8 w-full">
        {/* Header */}
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

        {/* Blended compatibility summary */}
        {match.summary && (
          <section className="card mb-4 border-accent/30">
            <h3 className="font-serif font-semibold mb-2">Compatibility Summary</h3>
            <p className="text-sm text-secondary leading-relaxed">{match.summary}</p>
          </section>
        )}

        {/* Your pairing */}
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

        {/* Score breakdown */}
        {match.subScores && (
          <section className="card mb-4">
            <h3 className="font-serif font-semibold mb-3">Score Breakdown</h3>
            <div className="space-y-2.5">
              <ScoreBar label="Persona" value={match.subScores.tier} />
              <ScoreBar label="Preference" value={match.subScores.preference} />
              <ScoreBar label="Behavioral" value={match.subScores.dimension} />
              <ScoreBar label="Intimacy" value={match.subScores.intimacy} />
              <ScoreBar label="Conflict" value={match.subScores.conflict} />
            </div>
          </section>
        )}

        {/* Persona insight cards */}
        <div className="mt-8 mb-2">
          <h3 className="font-serif text-xl font-semibold">About {match.name}</h3>
          <p className="text-xs text-secondary mt-1">What to expect from this persona</p>
        </div>

        <InsightCard
          title={`What draws people to ${genderLabel}`}
          items={match.mostAttractive}
          accent
        />

        <InsightCard
          title="How they date"
          items={match.datingBehavior}
        />

        <InsightCard
          title="In a relationship"
          items={match.inRelationships}
        />

        <InsightCard
          title={`How partners value ${genderLabel}`}
          items={match.howValued}
        />

        <InsightCard
          title="Watch out for"
          items={match.leastAttractive}
        />

        <InsightCard
          title={`What disappoints ${genderLabel}`}
          items={match.disappointments}
        />

        <InsightCard
          title={`Where ${GenderCap.toLowerCase()} struggles`}
          items={match.struggles}
        />

        <div className="flex gap-3 mt-8">
          <Link href="/results/matches" className="btn-secondary text-xs">All Matches</Link>
          <Link href="/advisor" className="btn-primary text-xs">Discuss with Advisor</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
