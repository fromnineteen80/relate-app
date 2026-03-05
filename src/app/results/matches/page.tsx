'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';

/* eslint-disable @typescript-eslint/no-explicit-any */

function tierBg(tier: string) {
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

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-secondary w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="font-mono text-[11px] text-secondary w-6 text-right">{Math.round(value)}</span>
    </div>
  );
}

function InsightSection({ label, items, color }: { label: string; items?: string[]; color?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="card">
      <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-2 ${color || 'text-secondary'}`}>{label}</span>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-secondary flex gap-2">
            <span className="text-accent shrink-0 mt-0.5">&bull;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (!stored) { router.push('/assessment'); return; }
    setReport(JSON.parse(stored));
  }, [router]);

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const persona = report.persona;
  const genderLabel = report.gender === 'M' ? 'him' : 'her';
  const GenderCap = report.gender === 'M' ? 'He' : 'She';

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
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
              <span className={`w-2 h-2 rounded-full ${tierBg(t)}`} />
              <span className="text-secondary">{tierLabel(t)}</span>
            </span>
          ))}
        </div>

        <div className="space-y-4">
          {report.matches.map((match: any) => {
            const isExpanded = expandedCode === match.code;
            return (
              <div key={match.code} className={`card transition-colors ${isExpanded ? 'border-accent/40' : ''}`}>
                {/* Card header — always visible */}
                <button
                  onClick={() => setExpandedCode(isExpanded ? null : match.code)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex items-start gap-4 min-w-0">
                      <span className="font-mono text-lg text-secondary w-8 shrink-0">{match.rank}</span>
                      <div className="min-w-0">
                        <h3 className="font-serif font-semibold">{match.name}</h3>
                        <span className="font-mono text-xs text-secondary">{match.code}</span>
                        {match.traits && <p className="text-xs text-secondary mt-1">{match.traits}</p>}
                      </div>
                    </div>
                    <div className="text-center shrink-0">
                      <span className="font-mono text-xl font-semibold block">{match.compatibilityScore}</span>
                      <span className={`inline-block text-white text-[10px] px-2 py-0.5 rounded-full ${tierBg(match.tier)}`}>
                        {tierLabel(match.tier)}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Compatibility summary — always visible */}
                {match.summary && (
                  <div className="mt-3">
                    <p className="text-sm text-secondary leading-relaxed">{match.summary}</p>
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-5">
                    {/* Your pairing */}
                    {persona && (
                      <div className="flex items-center gap-6 flex-wrap">
                        <div>
                          <span className="text-[11px] text-secondary uppercase tracking-wider">You</span>
                          <p className="font-serif font-semibold text-sm">{persona.name}</p>
                          <span className="font-mono text-xs text-accent">{persona.code}</span>
                        </div>
                        <span className="text-secondary text-lg">&times;</span>
                        <div>
                          <span className="text-[11px] text-secondary uppercase tracking-wider">Match</span>
                          <p className="font-serif font-semibold text-sm">{match.name}</p>
                          <span className="font-mono text-xs text-accent">{match.code}</span>
                        </div>
                      </div>
                    )}

                    {/* Score breakdown */}
                    {match.subScores && (
                      <div>
                        <span className="text-[11px] text-secondary uppercase tracking-wider block mb-2">Score Breakdown</span>
                        <div className="space-y-1.5">
                          <ScoreBar label="Persona" value={match.subScores.tier} />
                          <ScoreBar label="Preference" value={match.subScores.preference} />
                          <ScoreBar label="Behavioral" value={match.subScores.dimension} />
                          <ScoreBar label="Intimacy" value={match.subScores.intimacy} />
                          <ScoreBar label="Conflict" value={match.subScores.conflict} />
                        </div>
                      </div>
                    )}

                    {/* Full insight cards — all items shown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InsightSection label={`What draws people to ${genderLabel}`} items={match.mostAttractive} color="text-success" />
                      <InsightSection label="How they date" items={match.datingBehavior} />
                      <InsightSection label="In relationships" items={match.inRelationships} />
                      <InsightSection label={`How partners value ${genderLabel}`} items={match.howValued} />
                      <InsightSection label="Watch out for" items={match.leastAttractive} color="text-warning" />
                      <InsightSection label={`What disappoints ${genderLabel}`} items={match.disappointments} color="text-warning" />
                      <InsightSection label={`Where ${GenderCap.toLowerCase()} struggles`} items={match.struggles} color="text-danger/70" />
                    </div>

                    {/* Link to full detail page */}
                    <div className="flex gap-3 pt-2">
                      <Link href={`/results/match/${match.code}`} className="btn-secondary text-xs">
                        Full Match Detail
                      </Link>
                    </div>
                  </div>
                )}

                {/* Expand/collapse hint */}
                {!isExpanded && (match.subScores || match.mostAttractive?.length) && (
                  <button
                    onClick={() => setExpandedCode(match.code)}
                    className="text-[11px] text-accent hover:underline mt-3 block"
                  >
                    View breakdown &amp; insights
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
