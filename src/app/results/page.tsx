'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type PricingTier } from '@/lib/config';
import { fetchPaymentTier } from '@/lib/payments';
import { generateReferrals, Referral } from '@/lib/referrals';
import { useAuth } from '@/lib/auth-context';
import { SiteHeader } from '@/components/SiteHeader';
import { loadAndHydrateProgress } from '@/lib/supabase/progress';

type FunnelStage = { stage: string; count: number; filter?: string; percentage?: number; isMilestone?: boolean };

type ContextPools = {
  allGender: number;
  eligiblePool: number;
  eligibleEthnicityPool: number;
  userEthnicity: string;
  targetGenderLabel: string;
  orientationLabel: string;
};

type ComparisonData = {
  label: string;
  population: number;
  idealPool: number;
  matchCount: number;
  relateScore: number;
  matchProbability: number;
  funnel?: FunnelStage[];
  contextPools?: ContextPools;
};

type MarketData = {
  location?: { cbsaName?: string; cbsaLabel?: string; population?: number };
  relateScore?: { score: number };
  matchPool?: { localSinglePool: number; realisticPool: number; preferredPool: number; idealPool: number; funnel?: FunnelStage[]; contextPools?: ContextPools };
  matchProbability?: { rate: number; percentage: string };
  matchCount?: number;
  stateComparison?: ComparisonData | null;
  nationalComparison?: ComparisonData | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

type ResultsReport = {
  persona: { code: string; name: string; traits: string; datingBehavior: string[]; mostAttractive: string[]; leastAttractive: string[] };
  dimensions: Record<string, { assignedPole: string; poleAScore: number; poleBScore: number; strength: number }>;
  m3: { wantScore: number; offerScore: number; typeName: string };
  m4: { summary?: { approach: string; primaryDriver: string; repairSpeed: string; repairMode: string; capacity: string } };
  attentiveness: { level: string; score: number } | null;
  matches: Array<{ rank: number; code: string; name: string; tier: string; compatibilityScore: number; traits: string; summary: string }>;
  individualCompatibility?: any;
};

function tierColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'text-success', kismet: 'text-success/70', effort: 'text-warning',
    longShot: 'text-stone-400', atRisk: 'text-danger/70', incompatible: 'text-danger',
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
  const { user } = useAuth();
  const [report, setReport] = useState<ResultsReport | null>(null);
  const [pricingTier, setPricingTier] = useState<PricingTier>('free');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const marketFetchedRef = useRef(false);

  useEffect(() => {
    function tryLoad() {
      const stored = localStorage.getItem('relate_results');
      if (stored) {
        const parsedReport = JSON.parse(stored);
        setReport(parsedReport);
        setReferrals(generateReferrals(parsedReport));
        return true;
      }
      return false;
    }

    if (!tryLoad() && user) {
      // No localStorage — try loading from Supabase
      loadAndHydrateProgress(user.id).then((data) => {
        if (data?.results) {
          tryLoad(); // DB data now in localStorage
        } else {
          router.push('/assessment');
        }
      });
    } else if (!user && !localStorage.getItem('relate_results')) {
      router.push('/assessment');
    }
  }, [router, user]);

  useEffect(() => {
    if (!user) return;
    fetchPaymentTier(user.email).then(({ tier }) => setPricingTier(tier));
  }, [user]);

  // Fetch dating market data (likelihood of finding ideal match)
  useEffect(() => {
    if (!user || marketData || marketFetchedRef.current) return;

    const cached = localStorage.getItem('relate_market_data');
    if (cached) {
      try { setMarketData(JSON.parse(cached)); return; } catch { /* fetch fresh */ }
    }

    const demoStr = localStorage.getItem('relate_demographics');
    const gender = localStorage.getItem('relate_gender');
    if (!demoStr) return;

    let demo: Record<string, any>;
    try { demo = JSON.parse(demoStr); } catch { return; }
    if (!demo.zipCode && !demo.zip_code) return;

    marketFetchedRef.current = true;
    setMarketLoading(true);
    fetch('/api/demographics-market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        demographics: {
          gender,
          age: demo.age,
          zipCode: demo.zipCode || demo.zip_code,
          ethnicity: demo.ethnicity,
          orientation: demo.orientation,
          income: demo.income,
          education: demo.education,
          height: demo.height,
          bodyType: demo.bodyType || demo.body_type,
          fitness: demo.fitness || demo.fitness_level,
          political: demo.political,
          smoking: demo.smoking,
          hasKids: demo.hasKids ?? demo.has_kids,
          wantKids: demo.wantKids || demo.want_kids,
          relationshipStatus: demo.relationshipStatus || demo.relationship_status,
        },
        preferences: {
          prefAgeMin: demo.pref_age_min || demo.prefAgeMin,
          prefAgeMax: demo.pref_age_max || demo.prefAgeMax,
          prefIncomeMin: demo.pref_income_min ?? demo.prefIncome ?? 0,
          prefHeightMin: demo.pref_height_min || demo.prefHeight || null,
          prefBodyTypes: demo.pref_body_types || demo.prefBodyTypes || ['No preference'],
          prefFitnessLevels: demo.pref_fitness_levels || demo.prefFitnessLevels || ['No preference'],
          prefPolitical: demo.pref_political || demo.prefPolitical || ['No preference'],
          prefHasKids: demo.pref_has_kids || demo.prefHasKids || 'No preference',
          prefWantKids: demo.pref_want_kids || demo.prefWantKids || 'No preference',
          prefSmoking: demo.pref_smoking || demo.prefSmoking || 'No preference',
        },
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const md: MarketData = { location: data.location, relateScore: data.relateScore, matchPool: data.matchPool, matchProbability: data.matchProbability, matchCount: data.matchCount, stateComparison: data.stateComparison, nationalComparison: data.nationalComparison };
          setMarketData(md);
          localStorage.setItem('relate_market_data', JSON.stringify(md));
        }
      })
      .catch(() => { /* silent fail */ })
      .finally(() => setMarketLoading(false));
  }, [user, marketData]);

  const handleDownloadPDF = useCallback(async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: report.persona,
          dimensions: report.dimensions,
          m3: report.m3,
          m4: report.m4,
          matches: report.matches,
          individualCompatibility: report.individualCompatibility,
        }),
      });
      const data = await res.json();
      if (data.html) {
        // Open in new window for print/save as PDF
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(data.html);
          win.document.close();
          // Trigger print dialog after a brief delay for rendering
          setTimeout(() => win.print(), 500);
        }
      }
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [report]);

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const hasPaid = pricingTier !== 'free';
  const hasAdvisor = pricingTier === 'premium' || pricingTier === 'couples';
  const canDownload = hasPaid; // Plus, Premium, Couples
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
            <div className="flex gap-2">
              {canDownload && (
                <button onClick={handleDownloadPDF} disabled={downloading} className="btn-secondary text-xs">
                  {downloading ? 'Preparing...' : 'Download PDF'}
                </button>
              )}
              <Link href="/results/persona" className="btn-secondary text-xs">Details</Link>
            </div>
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
                  <span className="text-xs font-mono w-20 text-right">{d.assignedPole || '-'}</span>
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
              <span className="font-mono text-2xl font-semibold">{report.m3?.wantScore ?? '-'}</span>
              <p className="text-xs text-secondary mt-1">Want Score</p>
            </div>
            <div>
              <span className="font-mono text-2xl font-semibold">{report.m3?.offerScore ?? '-'}</span>
              <p className="text-xs text-secondary mt-1">Offer Score</p>
            </div>
            <div>
              <span className="font-mono text-2xl font-semibold">{report.m3?.typeName ?? '-'}</span>
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
                <span className="font-mono capitalize">{val || '-'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Attachment Style */}
        {report.individualCompatibility?.attachment && (
          <section className="card mb-6">
            <h3 className="font-serif text-lg font-semibold mb-3">Attachment Style</h3>
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-2xl font-semibold capitalize">{report.individualCompatibility.attachment.style}</span>
              {report.individualCompatibility.attachment.subtype && (
                <span className="text-xs font-mono text-secondary">({report.individualCompatibility.attachment.subtype})</span>
              )}
              {report.individualCompatibility.attachment.leaningToward && (
                <span className="text-xs font-mono text-secondary">leaning {report.individualCompatibility.attachment.leaningToward}</span>
              )}
              <span className="text-xs font-mono text-accent ml-auto">
                {Math.round((report.individualCompatibility.attachment.confidence ?? 0) * 100)}% confidence
              </span>
            </div>
            <p className="text-sm text-secondary">{report.individualCompatibility.attachment.description}</p>
          </section>
        )}

        {/* Intimacy Under Stress — M3 State Modeling */}
        {report.individualCompatibility?.m3States && (() => {
          const { states, insights } = report.individualCompatibility.m3States;
          const stateList = [
            { key: 'normal', data: states.normal, color: 'bg-stone-400' },
            { key: 'conflict', data: states.conflict, color: 'bg-warning' },
            { key: 'repair', data: states.repair, color: 'bg-success' },
          ];
          return (
            <section className="card mb-6">
              <h3 className="font-serif text-lg font-semibold mb-1">Your Intimacy Under Stress</h3>
              <p className="text-xs text-secondary mb-4">How your Want and Offer shift across relationship states</p>
              <div className="space-y-5">
                {stateList.map(({ key, data, color }) => {
                  const wantDelta = key !== 'normal' ? data.want - states.normal.want : null;
                  const offerDelta = key !== 'normal' ? data.offer - states.normal.offer : null;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">{data.label}</span>
                        <span className="text-xs font-mono text-secondary">
                          Gap: {data.gap > 0 ? '+' : ''}{data.gap}
                        </span>
                      </div>
                      {/* Want bar */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-secondary w-10">Want</span>
                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${data.want}%` }} />
                        </div>
                        <span className="text-xs font-mono w-8 text-right">{data.want}</span>
                        {wantDelta !== null && (
                          <span className={`text-[10px] font-mono w-8 ${wantDelta > 0 ? 'text-warning' : 'text-success'}`}>
                            {wantDelta > 0 ? '+' : ''}{wantDelta}
                          </span>
                        )}
                      </div>
                      {/* Offer bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-secondary w-10">Offer</span>
                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${data.offer}%` }} />
                        </div>
                        <span className="text-xs font-mono w-8 text-right">{data.offer}</span>
                        {offerDelta !== null && (
                          <span className={`text-[10px] font-mono w-8 ${offerDelta < 0 ? 'text-warning' : 'text-success'}`}>
                            {offerDelta > 0 ? '+' : ''}{offerDelta}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insights */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    insights.gapExpansionLevel === 'HIGH' ? 'bg-danger/10 text-danger' :
                    insights.gapExpansionLevel === 'MODERATE' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}>
                    Gap expansion: {insights.gapExpansion > 0 ? '+' : ''}{insights.gapExpansion} pts ({insights.gapExpansionLevel})
                  </span>
                </div>
                <p className="text-xs text-secondary">
                  {insights.gapExpansionLevel === 'HIGH'
                    ? 'Under stress, your gap widens significantly. Partners may feel overwhelmed by increased demands while receiving less from you.'
                    : insights.gapExpansionLevel === 'MODERATE'
                    ? 'Your gap expands moderately under stress. Awareness of this pattern can help you manage it.'
                    : 'Your gap stays relatively stable under stress. This indicates strong emotional regulation.'}
                </p>
                <p className="text-xs text-secondary">
                  Repair effort: <span className={`font-mono ${insights.repairSustainable ? 'text-success' : 'text-warning'}`}>
                    {insights.repairSustainable ? 'Sustainable' : 'High strain'}
                  </span>
                  {insights.repairSustainable
                    ? ' — you can maintain elevated giving without burning out.'
                    : ' — sustaining this level of effort may lead to exhaustion over time.'}
                </p>
              </div>
            </section>
          );
        })()}

        {/* Ideal Partner Profile */}
        {report.individualCompatibility?.attachmentTiers && (
          <section className="card mb-6">
            <h3 className="font-serif text-lg font-semibold mb-1">Your Ideal Partner Profile</h3>
            <p className="text-xs text-secondary mb-4">Based on your attachment, drivers, and conflict patterns</p>

            {/* Attachment tiers */}
            <div className="mb-4">
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">Attachment Style</span>
              <div className="mt-2 space-y-1">
                {[
                  { label: 'Best', items: report.individualCompatibility.attachmentTiers.bestMatches, color: 'text-success' },
                  { label: 'Good', items: report.individualCompatibility.attachmentTiers.goodMatches, color: 'text-accent' },
                  { label: 'Workable', items: report.individualCompatibility.attachmentTiers.workableMatches, color: 'text-warning' },
                  { label: 'Risky', items: report.individualCompatibility.attachmentTiers.riskyMatches, color: 'text-danger' },
                  { label: 'Avoid', items: report.individualCompatibility.attachmentTiers.avoidMatches, color: 'text-danger' },
                ].filter(g => g.items?.length > 0).map(group => (
                  <div key={group.label} className="flex items-center gap-3 py-1">
                    <span className={`text-xs w-16 ${group.color}`}>{group.label}</span>
                    <div className="flex gap-2">
                      {group.items.map((m: any) => (
                        <span key={m.style} className="text-xs font-mono capitalize bg-stone-50 px-2 py-0.5 rounded">
                          {m.style} ({m.score})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-secondary mt-2">{report.individualCompatibility.attachmentTiers.recommendation}</p>
            </div>

            {/* Driver tiers */}
            <div className="mb-4 pt-4 border-t border-border">
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">Emotional Driver</span>
              <p className="text-xs text-secondary mt-1 mb-2">
                Your primary: <span className="font-mono capitalize text-foreground">{report.individualCompatibility.driverTiers.yourDriver.primary}</span>
              </p>
              <div className="space-y-1">
                {[
                  { label: 'Best', items: report.individualCompatibility.driverTiers.bestMatches, color: 'text-success' },
                  { label: 'Good', items: report.individualCompatibility.driverTiers.goodMatches, color: 'text-accent' },
                  { label: 'Workable', items: report.individualCompatibility.driverTiers.workableMatches, color: 'text-warning' },
                  { label: 'Avoid', items: report.individualCompatibility.driverTiers.avoidMatches, color: 'text-danger' },
                ].filter(g => g.items?.length > 0).map(group => (
                  <div key={group.label} className="flex items-center gap-3 py-1">
                    <span className={`text-xs w-16 ${group.color}`}>{group.label}</span>
                    <div className="flex gap-2">
                      {group.items.map((m: any) => (
                        <span key={m.driver} className="text-xs font-mono capitalize bg-stone-50 px-2 py-0.5 rounded">
                          {m.driver} ({m.score})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-secondary mt-2">{report.individualCompatibility.driverTiers.recommendation}</p>
            </div>

            {/* Horsemen insights */}
            {report.individualCompatibility.horsemenInsights && (
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Conflict Behavior</span>
                {report.individualCompatibility.horsemenInsights.urgent && (
                  <div className="mt-2 p-2 bg-danger/5 border border-danger/20 rounded text-xs text-danger">
                    {report.individualCompatibility.horsemenInsights.urgent}
                  </div>
                )}
                {report.individualCompatibility.horsemenInsights.lookFor?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-success mb-1">Look for:</p>
                    {report.individualCompatibility.horsemenInsights.lookFor.map((item: any, i: number) => (
                      <p key={i} className="text-xs text-secondary ml-3">
                        {item.partnerTrait} — {item.reason}
                      </p>
                    ))}
                  </div>
                )}
                {report.individualCompatibility.horsemenInsights.avoid?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-warning mb-1">Avoid:</p>
                    {report.individualCompatibility.horsemenInsights.avoid.map((item: any, i: number) => (
                      <p key={i} className="text-xs text-secondary ml-3">
                        {item.partnerTrait} — {item.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Dating Market / Likelihood */}
        {(marketData || marketLoading) && (
          <section className="card mb-6">
            <h3 className="font-serif text-lg font-semibold mb-1">Your Dating Market</h3>
            <p className="text-xs text-secondary mb-3">Based on your demographics and preferences, here&apos;s how your local dating pool narrows from the total metro population to people who match what you&apos;re looking for.</p>
            {marketLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : marketData && (() => {
              const pool = marketData.matchPool;
              const metro = marketData.location?.cbsaLabel || marketData.location?.cbsaName || 'Your Metro';
              const prob = marketData.matchProbability;
              const matchCount = marketData.matchCount ?? 0;
              const score = marketData.relateScore?.score ?? 0;
              const scoreTier = score >= 80 ? 'Exceptional' : score >= 65 ? 'Strong' : score >= 50 ? 'Above Average' : score >= 35 ? 'Average' : 'Below Average';
              const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'k' : String(n);

              return (
                <>
                  <p className="text-xs text-secondary mb-4">{metro}</p>
                  <div className="grid grid-cols-3 gap-4 text-center mb-5">
                    <div>
                      <span className="font-mono text-2xl font-semibold">{score.toFixed(0)}</span>
                      <p className="text-xs text-secondary mt-1">Relate Score</p>
                      <p className="text-[10px] text-secondary">{scoreTier}</p>
                      <p className="text-[10px] text-secondary mt-0.5">Your overall desirability based on demographics</p>
                    </div>
                    <div>
                      <span className="font-mono text-2xl font-semibold">{prob?.percentage || '—'}</span>
                      <p className="text-xs text-secondary mt-1">Match Probability</p>
                      <p className="text-[10px] text-secondary mt-0.5">Chance a given match leads to compatibility</p>
                    </div>
                    <div>
                      <span className="font-mono text-2xl font-semibold">{fmt(matchCount)}</span>
                      <p className="text-xs text-secondary mt-1">Estimated Matches</p>
                      <p className="text-[10px] text-secondary mt-0.5">Compatible people in your metro area</p>
                    </div>
                  </div>
                  {pool && (() => {
                    const funnel: FunnelStage[] = pool.funnel || [];
                    // Fallback to summary bars if funnel not available
                    const stages = funnel.length > 0 ? funnel : [
                      { stage: 'Metro Population', count: marketData.location?.population || 0 },
                      { stage: 'LOCAL SINGLES', count: pool.localSinglePool, isMilestone: true },
                      { stage: 'MEET YOUR BASICS', count: pool.realisticPool, isMilestone: true },
                      { stage: 'MATCH YOUR LIFESTYLE', count: pool.preferredPool, isMilestone: true },
                      { stage: 'YOUR IDEAL MATCH POOL', count: pool.idealPool, isMilestone: true },
                    ];
                    const maxCount = stages[0]?.count || 1;
                    return (
                      <div>
                        <span className="text-xs font-mono text-secondary uppercase tracking-wider">Match Pool Funnel</span>
                        <div className="mt-3 space-y-1.5">
                          {stages.map((s, i) => {
                            const pct = (s.count / maxCount) * 100;
                            const isLast = i === stages.length - 1;
                            const isMilestone = s.isMilestone;
                            return (
                              <div key={i} className={isMilestone ? 'pt-1' : ''}>
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className={`text-xs ${isMilestone ? 'font-semibold uppercase font-mono tracking-wider' : isLast ? 'font-medium' : 'text-secondary'}`}>
                                    {s.stage}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {s.filter && <span className="text-[10px] text-secondary font-mono">{s.filter}</span>}
                                    <span className={`text-xs font-mono ${isMilestone || isLast ? 'font-semibold' : 'text-secondary'}`}>{fmt(s.count)}</span>
                                  </div>
                                </div>
                                <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
                                  <div
                                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${isLast ? 'bg-accent' : isMilestone ? 'bg-accent/60' : 'bg-stone-300'}`}
                                    style={{ width: `${Math.max(1, pct)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {stages[stages.length - 1]?.count === 0 && (
                          <p className="text-xs text-warning mt-3">Your preferences narrow the pool to zero in this metro. Consider broadening age range, income, or lifestyle filters.</p>
                        )}
                        <p className="text-[10px] text-secondary mt-3">Estimates based on census and survey data for your metro area. Actual availability may vary.</p>
                      </div>
                    );
                  })()}

                  {/* State & National Comparison */}
                  {(marketData.stateComparison || marketData.nationalComparison) && (() => {
                    const metroIdeal = pool?.idealPool ?? 0;
                    const state = marketData.stateComparison;
                    const national = marketData.nationalComparison;
                    const showExpandedFunnels = metroIdeal < 100;
                    const ctx = pool?.contextPools;
                    const pctOf = (ideal: number, base: number) => base > 0 ? ((ideal / base) * 100).toFixed(1) + '%' : '—';

                    // Build comparison rows: metro, state, national
                    const rows = [
                      { label: metro, ideal: metroIdeal, matches: matchCount, pop: marketData.location?.population || 0, ctx, highlight: true },
                      ...(state ? [{ label: `${state.label} (statewide)`, ideal: state.idealPool, matches: state.matchCount, pop: state.population, ctx: state.contextPools }] : []),
                      ...(national ? [{ label: 'National', ideal: national.idealPool, matches: national.matchCount, pop: national.population, ctx: national.contextPools }] : []),
                    ];

                    const gLabel = ctx?.targetGenderLabel || 'target gender';
                    const oLabel = ctx?.orientationLabel || 'orientation';
                    const eLabel = ctx?.userEthnicity || 'ethnicity';
                    const funnel2: FunnelStage[] = pool?.funnel || [];
                    const ageStage = funnel2.find(s => s.stage.startsWith('Age '));
                    const ageRange = ageStage ? ageStage.stage.replace('Age ', '') : 'your age range';

                    return (
                      <div className="mt-6">
                        <span className="text-xs font-mono text-secondary uppercase tracking-wider">How You Compare</span>
                        <div className="mt-2 border border-border rounded-md overflow-hidden overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border bg-stone-50">
                                <th className="text-left px-3 py-1.5 font-mono text-secondary">Scope</th>
                                <th className="text-right px-3 py-1.5 font-mono text-secondary">Ideal Pool</th>
                                <th className="text-right px-3 py-1.5 font-mono text-secondary">Matches</th>
                                <th className="text-right px-3 py-1.5 font-mono text-secondary whitespace-nowrap">% of {gLabel}</th>
                                <th className="text-right px-3 py-1.5 font-mono text-secondary whitespace-nowrap">% of eligible</th>
                                <th className="text-right px-3 py-1.5 font-mono text-secondary whitespace-nowrap">% of {eLabel}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r, i) => (
                                <tr key={i} className={`${i < rows.length - 1 ? 'border-b border-border' : ''} ${r.highlight ? 'bg-orange-50/50' : ''}`}>
                                  <td className={`px-3 py-1.5 ${r.highlight ? 'font-medium' : ''}`}>{r.label}</td>
                                  <td className={`text-right px-3 py-1.5 font-mono ${r.highlight ? '' : 'text-secondary'}`}>{fmt(r.ideal)}</td>
                                  <td className={`text-right px-3 py-1.5 font-mono ${r.highlight ? 'font-semibold' : 'text-secondary'}`}>{fmt(r.matches)}</td>
                                  <td className={`text-right px-3 py-1.5 font-mono ${r.highlight ? '' : 'text-secondary'}`}>{r.ctx ? pctOf(r.ideal, r.ctx.allGender) : '—'}</td>
                                  <td className={`text-right px-3 py-1.5 font-mono ${r.highlight ? '' : 'text-secondary'}`}>{r.ctx ? pctOf(r.ideal, r.ctx.eligiblePool) : '—'}</td>
                                  <td className={`text-right px-3 py-1.5 font-mono ${r.highlight ? '' : 'text-secondary'}`}>{r.ctx ? pctOf(r.ideal, r.ctx.eligibleEthnicityPool) : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-1.5 space-y-1">
                          <p className="text-[10px] text-secondary leading-relaxed"><span className="font-mono font-medium text-foreground">Ideal Pool</span> — The number of people in this area who meet every preference you specified: gender, orientation, age range, income, relationship status, lifestyle traits, and physical preferences. This is your fully-filtered pool before accounting for mutual interest.</p>
                          <p className="text-[10px] text-secondary leading-relaxed"><span className="font-mono font-medium text-foreground">Matches</span> — Your ideal pool adjusted for the probability that someone in it would also be interested in you, based on your Relate Score. A higher Relate Score means a larger share of your ideal pool converts into realistic mutual matches.</p>
                          <p className="text-[10px] text-secondary leading-relaxed"><span className="font-mono font-medium text-foreground">% of {gLabel}</span> — Your ideal pool expressed as a percentage of all {gLabel} (ages 18-64, excluding homeless) in the area. This is the broadest lens: of every {gLabel.slice(0, -1)} you could theoretically encounter, how many fit what you are looking for.</p>
                          <p className="text-[10px] text-secondary leading-relaxed"><span className="font-mono font-medium text-foreground">% of eligible</span> — Your ideal pool as a percentage of {oLabel} {gLabel} aged {ageRange} with no criminal record. This filters out people who were never realistic candidates, giving you a truer sense of how selective your remaining preferences are.</p>
                          <p className="text-[10px] text-secondary leading-relaxed"><span className="font-mono font-medium text-foreground">% of {eLabel}</span> — The same eligible pool narrowed further to {eLabel} {gLabel} only. Because felon rates, income distributions, and lifestyle patterns differ by ethnicity, this shows the most apples-to-apples view of your selectivity within the demographic group that most closely mirrors your own background.</p>
                        </div>
                        <p className="text-[10px] text-secondary/60 mt-2 leading-relaxed">Estimates derived from publicly available census, demographic, and survey datasets. See <a href="/methodology#ideal-match" className="underline">methodology</a> for sources and approach.</p>

                        {/* Expanded fallback funnels when metro pool is small */}
                        {showExpandedFunnels && (
                          <div className="mt-4 space-y-4">
                            <p className="text-xs text-warning">Your metro ideal pool is small. Here&apos;s what the funnel looks like at broader scale.</p>
                            {[state, national].filter(Boolean).map((comp) => {
                              const cFunnel: FunnelStage[] = comp!.funnel || [];
                              if (cFunnel.length === 0) return null;
                              const cMax = cFunnel[0]?.count || 1;
                              return (
                                <div key={comp!.label}>
                                  <span className="text-xs font-mono text-secondary uppercase tracking-wider">{comp!.label} Funnel</span>
                                  <div className="mt-2 space-y-1">
                                    {cFunnel.map((s, i) => {
                                      const cPct = (s.count / cMax) * 100;
                                      const cIsLast = i === cFunnel.length - 1;
                                      const cIsMilestone = s.isMilestone;
                                      return (
                                        <div key={i} className={cIsMilestone ? 'pt-1' : ''}>
                                          <div className="flex items-center justify-between mb-0.5">
                                            <span className={`text-xs ${cIsMilestone ? 'font-semibold uppercase font-mono tracking-wider' : cIsLast ? 'font-medium' : 'text-secondary'}`}>{s.stage}</span>
                                            <div className="flex items-center gap-2">
                                              {s.filter && <span className="text-[10px] text-secondary font-mono">{s.filter}</span>}
                                              <span className={`text-xs font-mono ${cIsMilestone || cIsLast ? 'font-semibold' : 'text-secondary'}`}>{fmt(s.count)}</span>
                                            </div>
                                          </div>
                                          <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
                                            <div
                                              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${cIsLast ? 'bg-accent' : cIsMilestone ? 'bg-accent/60' : 'bg-stone-300'}`}
                                              style={{ width: `${Math.max(1, cPct)}%` }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </section>
        )}

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
                {report.matches.length - freeMatchLimit} more matches available with Plus
              </p>
              <div className="flex gap-2 justify-center">
                <Link href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary inline-block text-sm">
                  Plus ($29.99)
                </Link>
                <Link href={`/api/checkout?product=premium&email=${encodeURIComponent(user?.email || '')}`} className="btn-primary inline-block text-sm">
                  Premium ($49.99)
                </Link>
              </div>
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
            </>
          )}
          {hasAdvisor && (
            <Link href="/advisor" className="btn-secondary text-xs">Claude Advisor</Link>
          )}
          <Link href="/invite" className="btn-secondary text-xs">Invite Partner</Link>
        </div>
      </main>
    </div>
  );
}
