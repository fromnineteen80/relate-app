'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';

/* eslint-disable @typescript-eslint/no-explicit-any */

const CODE_TO_POLE: Record<string, 'A' | 'B'> = {
  A: 'A', B: 'B', C: 'A', D: 'B', E: 'A', F: 'B', G: 'A', H: 'B',
};

const DIMS = ['physical', 'social', 'lifestyle', 'values'] as const;

function getCodeKeys(code: string, m2Poles: any): Array<{ dim: string; pole: string; description: string }> {
  if (!code || code.length !== 4) return [];
  return DIMS.map((dim, i) => {
    const letter = code[i];
    const poleKey = CODE_TO_POLE[letter] || 'A';
    const poleName = m2Poles?.[dim]?.[poleKey] || letter;
    const descKey = poleKey === 'A' ? 'descriptionA' : 'descriptionB';
    const description = m2Poles?.[dim]?.[descKey] || m2Poles?.[dim]?.description || '';
    return { dim, pole: poleName, description };
  });
}

function tierLabel(tier: string) {
  const labels: Record<string, string> = {
    ideal: 'Ideal', kismet: 'Kismet', effort: 'Effort',
    longShot: 'Long Shot', atRisk: 'At Risk', incompatible: 'Incompatible',
  };
  return labels[tier] || tier;
}

function tierTextColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'text-success', kismet: 'text-success/70', effort: 'text-warning',
    longShot: 'text-stone-400', atRisk: 'text-danger/70', incompatible: 'text-danger',
  };
  return colors[tier] || 'text-secondary';
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

async function hydrateMatch(match: any, userGender: string): Promise<any> {
  if (match.datingBehavior?.length > 0) return match;
  try {
    const res = await fetch('/api/persona-metadata');
    if (!res.ok) return match;
    const data = await res.json();
    const targetMeta = userGender === 'M' ? data.female : data.male;
    const meta = targetMeta?.[match.code];
    if (!meta) return match;
    return {
      ...match,
      datingBehavior: match.datingBehavior?.length ? match.datingBehavior : (meta.datingBehavior || []),
      inRelationships: match.inRelationships?.length ? match.inRelationships : (meta.inRelationships || []),
      howValued: match.howValued?.length ? match.howValued : (meta.howValued || []),
      disappointments: match.disappointments?.length ? match.disappointments : (meta.disappointments || []),
      struggles: match.struggles?.length ? match.struggles : (meta.struggles || []),
      mostAttractive: match.mostAttractive?.length ? match.mostAttractive : (meta.mostAttractive || []),
      leastAttractive: match.leastAttractive?.length ? match.leastAttractive : (meta.leastAttractive || []),
    };
  } catch {
    return match;
  }
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

    hydrateMatch(m, r.gender).then(hydrated => {
      if (hydrated !== m) {
        setMatch(hydrated);
        const updatedMatches = r.matches.map((x: any) => x.code === code ? hydrated : x);
        const updated = { ...r, matches: updatedMatches };
        localStorage.setItem('relate_results', JSON.stringify(updated));
      }
    });
  }, [router, code]);

  if (!match || !report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  // Matches are the OPPOSITE gender of the user
  const matchGenderPronoun = report.gender === 'M' ? 'her' : 'him';
  const matchGenderCap = report.gender === 'M' ? 'She' : 'He';

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Header: name/code on left, score/tier on right, vertically centered */}
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="min-w-0">
            <span className="font-mono text-xs text-secondary">Match #{match.rank}</span>
            <h2 className="font-serif text-3xl font-semibold">{match.name}</h2>
            <span className="font-mono text-sm text-accent">{match.code}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-3xl font-semibold block">{match.compatibilityScore}</span>
            <span className={`text-sm font-semibold ${tierTextColor(match.tier)}`}>
              {tierLabel(match.tier)}
            </span>
          </div>
        </div>

        {match.traits && <p className="text-secondary mb-6">{match.traits}</p>}

        {/* Dimension cards */}
        {(() => {
          const codeKeys = getCodeKeys(match.code, report.matchM2Poles);
          if (codeKeys.length === 0) return null;
          return (
            <section className="mt-2 mb-8">
              <div className="flex flex-wrap gap-3">
                {codeKeys.map((k) => (
                  <div key={k.dim} className="card text-center flex-1 min-w-[120px]">
                    <span className="inline-block text-xs border border-accent text-accent rounded-md px-3 py-1.5 mb-1.5 font-medium capitalize">
                      {k.dim}
                    </span>
                    <p className="font-serif text-sm font-semibold text-primary mb-1">{k.pole}</p>
                    {k.description && (
                      <p className="text-[11px] text-secondary/80 leading-snug">{k.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Compatibility summary */}
        {match.summary && (
          <section className="card mb-4 border-accent/30">
            <h3 className="font-serif font-semibold mb-2">Compatibility Summary</h3>
            <p className="text-sm text-secondary leading-relaxed">{match.summary.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',')}</p>
          </section>
        )}

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
          title={`What draws people to ${matchGenderPronoun}`}
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
          title={`How partners value ${matchGenderPronoun}`}
          items={match.howValued}
        />

        <InsightCard
          title="Watch out for"
          items={match.leastAttractive}
        />

        <InsightCard
          title={`What disappoints ${matchGenderPronoun}`}
          items={match.disappointments}
        />

        <InsightCard
          title={`Where ${matchGenderCap.toLowerCase()} struggles`}
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
