'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/lib/config';
import { getMockPaymentStatus } from '@/lib/mock/payments';
import { generateReferrals, Referral } from '@/lib/referrals';
import { SiteHeader } from '@/components/SiteHeader';

type ResultsReport = {
  persona: { code: string; name: string; traits: string; datingBehavior: string[]; mostAttractive: string[]; leastAttractive: string[] };
  dimensions: Record<string, { assignedPole: string; poleAScore: number; poleBScore: number; strength: number }>;
  m3: { wantScore: number; offerScore: number; typeName: string };
  m4: { summary?: { approach: string; primaryDriver: string; repairSpeed: string; repairMode: string; capacity: string } };
  attentiveness: { level: string; score: number } | null;
  matches: Array<{ rank: number; code: string; name: string; tier: string; compatibilityScore: number; traits: string; summary: string }>;
};

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

export default function ResultsDashboard() {
  const router = useRouter();
  const [report, setReport] = useState<ResultsReport | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (!stored) { router.push('/assessment'); return; }
    const parsedReport = JSON.parse(stored);
    setReport(parsedReport);
    setReferrals(generateReferrals(parsedReport));

    if (config.useMockPayments) {
      setHasPaid(getMockPaymentStatus().paid);
    }
  }, [router]);

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const m4Summary = report.m4?.summary || {};
  const freeMatchLimit = 3;
  const visibleMatches = hasPaid ? report.matches : report.matches.slice(0, freeMatchLimit);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Persona Card */}
        <section className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="font-mono text-xs text-secondary">Your Persona</span>
              <h2 className="font-serif text-3xl font-semibold">{report.persona.name}</h2>
              <span className="font-mono text-sm text-accent">{report.persona.code}</span>
            </div>
            <Link href="/results/persona" className="btn-secondary text-xs">Details</Link>
          </div>
          {report.persona.traits && <p className="text-sm text-secondary">{report.persona.traits}</p>}
        </section>

        {/* Dimensions */}
        <section className="card mb-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Dimension Scores</h3>
          <div className="space-y-3">
            {Object.entries(report.dimensions || {}).map(([dim, data]) => {
              if (!data || typeof data !== 'object') return null;
              const d = data as { assignedPole?: string; poleAScore?: number; poleBScore?: number; strength?: number };
              return (
                <div key={dim} className="flex items-center gap-3">
                  <span className="text-xs text-secondary w-20 capitalize">{dim}</span>
                  <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${Math.max(d.poleAScore || 50, d.poleBScore || 50)}%` }} />
                  </div>
                  <span className="text-xs font-mono w-20 text-right">{d.assignedPole || '—'}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Connection Style */}
        <section className="card mb-6">
          <h3 className="font-serif text-lg font-semibold mb-3">Connection Style</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="font-mono text-2xl font-semibold">{report.m3?.wantScore ?? '—'}</span>
              <p className="text-xs text-secondary mt-1">Want Score</p>
            </div>
            <div>
              <span className="font-mono text-2xl font-semibold">{report.m3?.offerScore ?? '—'}</span>
              <p className="text-xs text-secondary mt-1">Offer Score</p>
            </div>
            <div>
              <span className="font-mono text-2xl font-semibold">{report.m3?.typeName ?? '—'}</span>
              <p className="text-xs text-secondary mt-1">Type</p>
            </div>
          </div>
        </section>

        {/* Conflict Profile */}
        <section className="card mb-6">
          <h3 className="font-serif text-lg font-semibold mb-3">Conflict Profile</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Approach', (m4Summary as Record<string, string>).approach],
              ['Primary Driver', (m4Summary as Record<string, string>).primaryDriver],
              ['Repair Speed', (m4Summary as Record<string, string>).repairSpeed],
              ['Repair Mode', (m4Summary as Record<string, string>).repairMode],
              ['Capacity', (m4Summary as Record<string, string>).capacity],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between py-1 border-b border-border last:border-0">
                <span className="text-secondary">{label}</span>
                <span className="font-mono capitalize">{val || '—'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Matches */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold">Compatibility Rankings</h3>
            {hasPaid && <Link href="/results/matches" className="text-xs text-accent hover:underline">View all</Link>}
          </div>

          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-stone-50">
                  <th className="text-left px-3 py-2 font-mono text-xs text-secondary">#</th>
                  <th className="text-left px-3 py-2 font-mono text-xs text-secondary">Persona</th>
                  <th className="text-left px-3 py-2 font-mono text-xs text-secondary">Code</th>
                  <th className="text-left px-3 py-2 font-mono text-xs text-secondary">Tier</th>
                  <th className="text-right px-3 py-2 font-mono text-xs text-secondary">Score</th>
                </tr>
              </thead>
              <tbody>
                {visibleMatches.map((match) => (
                  <tr key={match.code} className="border-b border-border last:border-0 hover:bg-stone-50">
                    <td className="px-3 py-2 font-mono text-secondary">{match.rank}</td>
                    <td className="px-3 py-2">
                      {hasPaid ? (
                        <Link href={`/results/match/${match.code}`} className="text-accent hover:underline">{match.name}</Link>
                      ) : match.name}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{match.code}</td>
                    <td className={`px-3 py-2 text-xs font-medium ${tierColor(match.tier)}`}>{tierLabel(match.tier)}</td>
                    <td className="px-3 py-2 font-mono text-right">{match.compatibilityScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!hasPaid && report.matches.length > freeMatchLimit && (
            <div className="mt-4 card border-accent text-center">
              <p className="text-sm mb-3">
                {report.matches.length - freeMatchLimit} more matches available with Full Report
              </p>
              <Link href="/api/checkout?product=full_report" className="btn-primary inline-block">
                Unlock Full Report — $19
              </Link>
            </div>
          )}
        </section>

        {/* Referrals */}
        {referrals.length > 0 && (
          <section className="mb-6">
            <h3 className="font-serif text-lg font-semibold mb-3">Recommended Resources</h3>
            <div className="space-y-2">
              {referrals.map((ref) => (
                <a
                  key={ref.service}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => fetch('/api/referral-click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service: ref.service, affiliateUrl: ref.url }),
                  })}
                  className="card block hover:border-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{ref.cta}</p>
                      <p className="text-xs text-secondary">{ref.reason}</p>
                    </div>
                    <span className="text-accent text-sm">→</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Couples CTA */}
        <section className="card mb-6 border-accent">
          <h3 className="font-serif text-lg font-semibold mb-2">Couples Mode</h3>
          <p className="text-sm text-secondary mb-4">
            Invite your partner to take the assessment and unlock your compatibility report, growth plan, and shared advisor.
          </p>
          <div className="flex gap-3">
            <Link href="/invite" className="btn-primary text-xs">Invite Partner</Link>
            <Link href="/results/compare" className="btn-secondary text-xs">Couples Report</Link>
            <Link href="/couples" className="btn-secondary text-xs">Couples Dashboard</Link>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex gap-3 flex-wrap">
          <Link href="/results/persona" className="btn-secondary text-xs">Persona Details</Link>
          {hasPaid && (
            <>
              <Link href="/results/matches" className="btn-secondary text-xs">All Matches</Link>
              <Link href="/results/conflict" className="btn-secondary text-xs">Conflict Analysis</Link>
              <Link href="/advisor" className="btn-secondary text-xs">Claude Advisor</Link>
            </>
          )}
          <Link href="/invite" className="btn-secondary text-xs">Invite Partner</Link>
        </div>
      </main>
    </div>
  );
}
