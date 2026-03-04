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
  relateScore?: { score: number; components?: Record<string, { national?: number; local?: number; score?: number; weight: number }>; marriagePremium?: number };
  matchPool?: { localSinglePool: number; realisticPool: number; preferredPool: number; idealPool: number; funnel?: FunnelStage[]; contextPools?: ContextPools };
  matchProbability?: { rate: number; percentage: string };
  matchCount?: number;
  stateComparison?: ComparisonData | null;
  nationalComparison?: ComparisonData | null;
};

type Demographics = { age?: number; gender?: string; relationshipStatus?: string; seeking?: string; [key: string]: unknown };

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
  const [demographics, setDemographics] = useState<Demographics>({});
  const [assessmentIncomplete, setAssessmentIncomplete] = useState(false);
  const marketFetchedRef = useRef(false);

  useEffect(() => {
    function tryLoad() {
      try {
        const stored = localStorage.getItem('relate_results');
        if (stored) {
          const parsedReport = JSON.parse(stored);
          setReport(parsedReport);
          try { setReferrals(generateReferrals(parsedReport)); } catch { /* silent */ }
          return true;
        }
      } catch { /* corrupted localStorage */ }
      return false;
    }

    // Load demographics
    try {
      const demoStr = localStorage.getItem('relate_demographics');
      if (demoStr) setDemographics(JSON.parse(demoStr));
    } catch { /* silent */ }

    if (!tryLoad() && user) {
      loadAndHydrateProgress(user.id).then((data) => {
        if (data?.results) {
          tryLoad();
        } else {
          setAssessmentIncomplete(true);
        }
      });
    } else if (!user && !localStorage.getItem('relate_results')) {
      setAssessmentIncomplete(true);
    }
  }, [router, user]);

  useEffect(() => {
    if (!user) return;
    fetchPaymentTier(user.email).then(({ tier }) => setPricingTier(tier));
  }, [user]);

  // Fetch dating market data
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
          marketData: marketData || undefined,
          demographics: (() => { try { return JSON.parse(localStorage.getItem('relate_demographics') || '{}'); } catch { return undefined; } })(),
          fullM3: (() => { try { return JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result; } catch { return undefined; } })(),
          fullM4: (() => { try { return JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result; } catch { return undefined; } })(),
        }),
      });
      const data = await res.json();
      if (data.html) {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(data.html);
          win.document.close();
          setTimeout(() => win.print(), 500);
        }
      }
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [report, marketData]);

  // Incomplete assessment state
  if (assessmentIncomplete && !report) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-6 py-8 w-full flex-1">
          <h1 className="font-serif text-3xl font-semibold mb-2">Results</h1>
          <p className="text-sm text-secondary mb-8">Complete your assessment to unlock your results.</p>

          <section className="card mb-6 text-center py-12">
            <div className="mb-4">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto text-secondary/30">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
                <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-serif text-xl font-semibold mb-2">Assessment Not Complete</h2>
            <p className="text-sm text-secondary mb-6 max-w-md mx-auto">
              Your RELATE assessment has four modules. Complete all four to generate your persona, compatibility rankings, dating market analysis, and personalized coaching.
            </p>
            <Link href="/assessment" className="btn-primary text-sm inline-block">
              Continue Assessment
            </Link>
          </section>
        </main>
      </div>
    );
  }

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const hasPaid = pricingTier !== 'free';
  const hasAdvisor = pricingTier === 'premium' || pricingTier === 'couples';
  const canDownload = hasPaid;
  const m4Summary = report.m4?.summary || {};
  const freeMatchLimit = 3;
  const visibleMatches = hasPaid ? report.matches : report.matches.slice(0, freeMatchLimit);

  // Get M3/M4 full data for MarketCoaching
  let fullM3: any = null;
  let fullM4: any = null;
  try { fullM3 = JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result || null; } catch { /* silent */ }
  try { fullM4 = JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result || null; } catch { /* silent */ }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Persona Card */}
        <section className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="font-mono text-xs text-secondary">Your Persona</span>
              <h2 className="font-serif text-3xl font-semibold">{report.persona?.name || 'Unknown'}</h2>
              <span className="font-mono text-sm text-accent">{report.persona?.code || ''}</span>
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
          {report.persona?.traits && <p className="text-sm text-secondary">{report.persona.traits}</p>}
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

        {/* Intimacy Under Stress */}
        {report.individualCompatibility?.m3States?.states && (() => {
          const states = report.individualCompatibility.m3States.states;
          const insights = report.individualCompatibility.m3States.insights;
          if (!states?.normal) return null;
          const stateList = [
            { key: 'normal', data: states.normal, color: 'bg-stone-400' },
            { key: 'conflict', data: states.conflict, color: 'bg-warning' },
            { key: 'repair', data: states.repair, color: 'bg-success' },
          ].filter(s => s.data);
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

              {insights && (
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
              )}
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
              {report.individualCompatibility.attachmentTiers.recommendation && (
                <p className="text-xs text-secondary mt-2">{report.individualCompatibility.attachmentTiers.recommendation}</p>
              )}
            </div>

            {/* Driver tiers */}
            {report.individualCompatibility.driverTiers && (
              <div className="mb-4 pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Emotional Driver</span>
                <p className="text-xs text-secondary mt-1 mb-2">
                  Your primary: <span className="font-mono capitalize text-foreground">{report.individualCompatibility.driverTiers.yourDriver?.primary || '-'}</span>
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
                {report.individualCompatibility.driverTiers.recommendation && (
                  <p className="text-xs text-secondary mt-2">{report.individualCompatibility.driverTiers.recommendation}</p>
                )}
              </div>
            )}

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

        {/* ── Dating Market ── */}
        {(marketData || marketLoading) && (
          <DatingMarketViz data={marketData} loading={marketLoading} />
        )}

        {/* ── Market Coaching ── */}
        {marketData && (
          <MarketCoaching
            marketData={marketData}
            demographics={demographics}
            m3={fullM3}
            m4={fullM4}
            persona={report.persona || null}
          />
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
                    <span className="text-accent text-sm">&rarr;</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Downloads */}
        {canDownload && (
          <section className="card mb-6">
            <h2 className="font-serif text-lg font-semibold mb-4">Downloads</h2>
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Full PDF Report</p>
                <p className="text-xs text-secondary">Complete assessment results, persona, matches, and market data</p>
              </div>
              <button onClick={handleDownloadPDF} disabled={downloading} className="btn-secondary text-xs flex-shrink-0">
                {downloading ? 'Preparing...' : 'Download PDF'}
              </button>
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

// ── Dating Market Visualization ──
function DatingMarketViz({ data, loading }: { data: MarketData | null; loading: boolean }) {
  if (loading) {
    return (
      <section className="card mb-6">
        <h2 className="font-serif text-lg font-semibold mb-1">Your Dating Market</h2>
        <p className="text-xs text-secondary mb-4">Analyzing your local market...</p>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (!data) return null;

  const score = data.relateScore?.score ?? 0;
  const pool = data.matchPool;
  const metro = data.location?.cbsaLabel || data.location?.cbsaName || 'Your Metro';
  const metroPop = data.location?.population || 0;
  const prob = data.matchProbability;
  const matchCount = data.matchCount ?? 0;

  function scoreTier(s: number) {
    if (s >= 80) return { label: 'Exceptional', color: 'text-success' };
    if (s >= 65) return { label: 'Strong', color: 'text-success' };
    if (s >= 50) return { label: 'Above Average', color: 'text-accent' };
    if (s >= 35) return { label: 'Average', color: 'text-warning' };
    return { label: 'Below Average', color: 'text-danger' };
  }

  const tier = scoreTier(score);
  const components = data.relateScore?.components || {};
  const compOrder = ['income', 'education', 'age', 'ethnicity', 'children'];
  const compLabels: Record<string, string> = {
    income: 'Income', education: 'Education', age: 'Age', ethnicity: 'Ethnicity', children: 'Children',
  };

  const milestones = [
    { label: 'Metro Population', value: metroPop, desc: 'Total population in your metro area' },
    { label: 'Singles Pool', value: pool?.localSinglePool || 0, desc: 'Unmarried adults of your preferred gender and orientation' },
    { label: 'Your Realistic Match Pool', value: pool?.realisticPool || 0, desc: 'Singles within your age range and income preferences' },
    { label: 'Your Preferred Pool', value: pool?.preferredPool || 0, desc: 'Realistic matches who also meet your lifestyle preferences' },
    { label: 'Your Ideal Match Pool', value: pool?.idealPool || 0, desc: 'People who meet every preference you set' },
  ];

  return (
    <section className="card mb-6">
      <h2 className="font-serif text-lg font-semibold mb-1">Your Dating Market</h2>
      <p className="text-xs text-secondary mb-5">{metro}</p>

      {/* Relate Score Gauge */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-xs font-mono text-secondary uppercase tracking-wider">Relate Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-3xl font-semibold">{score.toFixed(0)}</span>
              <span className={`text-sm font-medium ${tier.color}`}>{tier.label}</span>
            </div>
          </div>
          <span className="text-xs text-secondary font-mono">/100</span>
        </div>

        <div className="relative h-3 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              background: score >= 65 ? 'var(--color-success)' : score >= 50 ? 'var(--color-accent)' : score >= 35 ? 'var(--color-warning)' : 'var(--color-danger)',
            }}
          />
          {[25, 50, 75].map(tick => (
            <div key={tick} className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: `${tick}%` }} />
          ))}
        </div>
        <p className="text-xs text-secondary mt-2">
          How competitive you are in the {metro} dating market based on income, education, age, and demographics.
        </p>
      </div>

      {/* Score Components */}
      {Object.keys(components).length > 0 && (
        <div className="mb-6">
          <span className="text-xs font-mono text-secondary uppercase tracking-wider">Score Breakdown</span>
          <div className="space-y-2 mt-2">
            {compOrder.map(key => {
              const comp = components[key];
              if (!comp) return null;
              const val = comp.local ?? comp.score ?? comp.national ?? 50;
              const weight = comp.weight ?? 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-secondary w-16">{compLabels[key]}</span>
                  <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-8 text-right">{Math.round(val)}</span>
                  <span className="text-[10px] text-secondary w-6">{Math.round(weight * 100)}%</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-secondary mt-2">
            Each bar shows your local percentile (0 = bottom, 100 = top) for that category. The percentage is how much that category weighs in your overall Relate Score.
          </p>
        </div>
      )}

      {/* Match Pool Funnel */}
      {pool && (
        <div className="mb-6">
          <span className="text-xs font-mono text-secondary uppercase tracking-wider">Match Pool Funnel</span>
          <div className="mt-3 space-y-1">
            {milestones.map((m, i) => {
              const maxVal = milestones[0].value || 1;
              const pct = (m.value / maxVal) * 100;
              const isLast = i === milestones.length - 1;
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs ${isLast ? 'font-medium' : 'text-secondary'}`}>{m.label}</span>
                    <span className={`text-xs font-mono ${isLast ? 'font-semibold' : 'text-secondary'}`}>{m.value.toLocaleString()}</span>
                  </div>
                  <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${isLast ? 'bg-accent' : 'bg-stone-300'}`}
                      style={{ width: `${Math.max(1, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 space-y-1">
            {milestones.map(m => (
              <p key={m.label} className="text-[11px] text-secondary">
                <span className="font-medium">{m.label}:</span> {m.desc}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Match Probability & Count */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <span className="text-xs font-mono text-secondary uppercase tracking-wider">Match Probability</span>
          <p className="font-mono text-2xl font-semibold mt-1">{prob?.percentage || '—'}</p>
          <p className="text-xs text-secondary mt-1">
            Chance of matching with someone from your ideal pool
          </p>
        </div>
        <div className="text-center">
          <span className="text-xs font-mono text-secondary uppercase tracking-wider">Estimated Matches</span>
          <p className="font-mono text-2xl font-semibold mt-1">{matchCount.toLocaleString()}</p>
          <p className="text-xs text-secondary mt-1">
            Compatible singles in the surrounding {metro} metro area
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Market Coaching ──
function MarketCoaching({ marketData, demographics, m3, m4, persona }: {
  marketData: MarketData | null;
  demographics: Demographics;
  m3: any;
  m4: any;
  persona: { name?: string; datingBehavior?: string[]; mostAttractive?: string[]; leastAttractive?: string[] } | null;
}) {
  if (!marketData?.matchPool || !marketData?.relateScore) return null;

  const pool = marketData.matchPool;
  const score = marketData.relateScore;
  const funnel = pool.funnel || [];
  const matchCount = marketData.matchCount ?? 0;
  const prob = marketData.matchProbability;
  const metro = marketData.location?.cbsaLabel || marketData.location?.cbsaName || 'your area';
  const national = marketData.nationalComparison;
  const components = score.components || {};

  type Insight = { priority: 'high' | 'medium' | 'low'; title: string; description: string; action: string; category: 'score' | 'funnel' | 'honesty' | 'expansion' };
  const insights: Insight[] = [];

  // 1. Relate Score Component Analysis
  const compEntries = Object.entries(components).map(([k, v]: [string, any]) => ({
    name: k,
    local: v.local ?? v.score ?? 0,
    weight: v.weight ?? 0,
    weighted: (v.local ?? v.score ?? 0) * (v.weight ?? 0),
  })).sort((a, b) => a.weighted - b.weighted);

  const weakest = compEntries[0];
  if (weakest && weakest.local < 40) {
    const coaching: Record<string, { title: string; desc: string; action: string }> = {
      income: {
        title: 'Your Income Is Limiting You',
        desc: `Your income ranks in the bottom ${Math.round(weakest.local)}% locally. For ${demographics.gender === 'Woman' ? 'women' : 'men'} in ${metro}, income carries ${Math.round(weakest.weight * 100)}% of your Relate Score weight.`,
        action: 'Concrete paths: negotiate a raise at your current role, pursue a certification that increases earning power in your field, or explore a side income. Even a 20% income increase can move your score meaningfully.',
      },
      education: {
        title: 'Education Is Holding You Back',
        desc: `Your education level ranks in the bottom ${Math.round(weakest.local)}% locally. Higher education correlates with match probability and partner quality.`,
        action: 'Consider professional certifications, online degrees, or skill-based credentials. Even one credential bump (e.g., associate to bachelor\'s, or adding a professional certification) shifts your percentile.',
      },
      age: {
        title: 'Age Is Working Against You',
        desc: `Your age score is ${Math.round(weakest.local)}. ${demographics.gender === 'Woman' ? 'For women, the dating market peaks younger and narrows faster. This is a structural reality, not a judgment.' : 'For men, age carries less weight but still matters. The market rewards established men in their 30s-40s most.'}`,
        action: demographics.gender === 'Woman'
          ? 'You can\'t change your age, but you can offset it: fitness, style, and a strong Relate profile matter more as you get older. Focus on what you control.'
          : 'Offset age by maximizing income, fitness, and emotional maturity. Your assessment results are your edge. Lead with depth.',
      },
      children: {
        title: 'Having Kids Is Narrowing Your Pool',
        desc: `Your children score is ${Math.round(weakest.local)}. Many singles in your age range prefer partners without existing children.`,
        action: 'You can\'t change this, but you can position it as a strength: demonstrate that you\'re a capable, present parent. On dating profiles, show (don\'t tell) that your life is full, not burdened.',
      },
      ethnicity: {
        title: 'Your Demographic Is Competitive Here',
        desc: `Your ethnicity score is ${Math.round(weakest.local)} in ${metro}. This reflects local representation. A smaller population share means fewer people who share or prefer your background.`,
        action: national && national.relateScore > score.score + 5
          ? `Your national score is ${national.relateScore} vs ${score.score} locally. Consider whether a metro with a larger ${demographics.ethnicity || 'similar'} population would shift your odds.`
          : 'Focus on what you control: income, fitness, and being genuinely interesting. Demographic headwinds are real but they\'re one factor among many.',
      },
    };

    const c = coaching[weakest.name];
    if (c) {
      insights.push({ priority: 'high', title: c.title, description: c.desc, action: c.action, category: 'score' });
    }
  }

  const strongest = compEntries[compEntries.length - 1];
  if (strongest && strongest.local >= 70) {
    insights.push({
      priority: 'low',
      title: `${strongest.name.charAt(0).toUpperCase() + strongest.name.slice(1)} Is Your Biggest Asset`,
      description: `Your ${strongest.name} ranks in the top ${Math.round(100 - strongest.local)}% in ${metro}. This is pulling your Relate Score up.`,
      action: 'Lead with this. Make sure your dating profile and real-life presentation reflect this strength.',
      category: 'score',
    });
  }

  // 2. Funnel Bottleneck Analysis
  const nonPreferenceFilters = /orientation|sexual|gender|base.*age|18.*64|eligible/i;
  const drops: { from: string; to: string; lostPct: number; lostCount: number; stageName: string }[] = [];
  for (let i = 1; i < funnel.length; i++) {
    const prev = funnel[i - 1];
    const curr = funnel[i];
    if (curr.isMilestone || prev.isMilestone) continue;
    if (prev.count === 0) continue;
    if (nonPreferenceFilters.test(curr.stage) || nonPreferenceFilters.test(curr.filter || '')) continue;
    const lostPct = ((prev.count - curr.count) / prev.count) * 100;
    const lostCount = prev.count - curr.count;
    if (lostPct > 5) {
      drops.push({ from: prev.stage, to: curr.stage, lostPct, lostCount, stageName: curr.stage });
    }
  }
  drops.sort((a, b) => b.lostPct - a.lostPct);

  const biggestDrop = drops[0];
  if (biggestDrop && biggestDrop.lostPct > 30) {
    const isPhysical = /body type|fitness|height/i.test(biggestDrop.stageName);
    const isIncome = /income/i.test(biggestDrop.stageName);
    const isPolitical = /political/i.test(biggestDrop.stageName);

    insights.push({
      priority: 'high',
      title: `Biggest Bottleneck: ${biggestDrop.stageName}`,
      description: `This single filter eliminates ${Math.round(biggestDrop.lostPct)}% of your remaining pool (${biggestDrop.lostCount.toLocaleString()} people). Everything above this stage is fine. This is where your funnel chokes.`,
      action: isPhysical
        ? 'Physical preferences create the sharpest pool drops. Ask yourself: is this a genuine need, or a default? If you\'ve been happily attracted to people outside this filter before, consider expanding it.'
        : isIncome
        ? `You\'re requiring income levels that most people in ${metro} don\'t hit. If financial stability matters more than a specific number, consider lowering this threshold and screening for financial habits instead.`
        : isPolitical
        ? 'Political filters are binary eliminators. If you\'re filtering for agreement rather than values, consider including "Moderate." Many moderates are flexible on issues that matter to you.'
        : `This filter removes a huge chunk of candidates. Evaluate whether it reflects a genuine dealbreaker or a nice-to-have masquerading as a requirement.`,
      category: 'funnel',
    });
  }

  if (drops[1] && drops[1].lostPct > 25) {
    insights.push({
      priority: 'medium',
      title: `Secondary Bottleneck: ${drops[1].stageName}`,
      description: `Removes another ${Math.round(drops[1].lostPct)}% of your pool (${drops[1].lostCount.toLocaleString()} people) at the ${drops[1].stageName} filter.`,
      action: `Your top two bottlenecks are ${biggestDrop?.stageName || 'unknown'} and ${drops[1].stageName}. Together they account for the majority of your pool reduction. Evaluate whether ${drops[1].stageName} is a genuine dealbreaker or a preference you could be flexible on.`,
      category: 'funnel',
    });
  }

  // 3. Expansion Opportunity
  if (pool.localSinglePool > 0 && pool.idealPool > 0) {
    const selectivityPct = (pool.idealPool / pool.localSinglePool) * 100;
    if (selectivityPct < 1) {
      insights.push({
        priority: 'high',
        title: 'Your Preferences Filter Out 99%+ of Singles',
        description: `Of ${pool.localSinglePool.toLocaleString()} local singles, only ${pool.idealPool.toLocaleString()} (${selectivityPct.toFixed(2)}%) meet all your criteria. You are selecting from the absolute tip of the distribution.`,
        action: 'This level of selectivity is mathematically difficult. Not wrong, but it means you may need to meet hundreds of people to find one match. Review your funnel to see which filters you could relax without compromising what actually matters to you.',
        category: 'expansion',
      });
    } else if (selectivityPct < 5) {
      insights.push({
        priority: 'medium',
        title: 'You\'re Highly Selective',
        description: `Only ${selectivityPct.toFixed(1)}% of local singles meet all your criteria. That\'s a small but real pool of ${pool.idealPool.toLocaleString()} people.`,
        action: 'This is workable, but leave room for surprise. Some of your best matches might not check every box on paper.',
        category: 'expansion',
      });
    }
  }

  // 4. Cross-Reference: Assessment vs Market Preferences
  const wantScore = m3?.wantScore ?? 0;
  const offerScore = m3?.offerScore ?? 0;
  const gap = wantScore - offerScore;
  const prefBodyTypes = (demographics as any).prefBodyTypes || (demographics as any).pref_body_types || [];
  const prefFitness = (demographics as any).prefFitnessLevels || (demographics as any).pref_fitness_levels || [];
  const userFitness = (demographics as any).fitness || (demographics as any).fitness_level || '';
  const userBodyType = (demographics as any).bodyType || (demographics as any).body_type || '';

  const wantsOnlyFit = prefBodyTypes.length > 0
    && !prefBodyTypes.includes('No preference')
    && prefBodyTypes.every((t: string) => t === 'Lean or Fit');
  const wantsOnlyHighFitness = prefFitness.length > 0
    && !prefFitness.includes('No preference')
    && prefFitness.every((l: string) => ['4 to 6 days a week', 'Every day'].includes(l));

  if ((wantsOnlyFit || wantsOnlyHighFitness) && gap > 15) {
    const userIsntFitThemselves = !['Lean or Fit'].includes(userBodyType)
      || !['4 to 6 days a week', 'Every day'].includes(userFitness);

    if (userIsntFitThemselves) {
      insights.push({
        priority: 'high',
        title: 'Honesty Check: Physical Standards vs. What You Offer',
        description: `Your assessment shows a Want/Offer gap of +${gap}. You want significantly more than you offer. At the same time, you're filtering for only fit/lean partners who exercise intensely. But your own fitness and body type don't meet the standard you're setting for others.`,
        action: 'Two paths: (1) Get in the gym. Seriously. Consistent exercise 4+ days a week for 6 months will change your body, your confidence, and your Relate Score. (2) Or expand your physical preferences. Attraction grows in person in ways a filter can\'t predict.',
        category: 'honesty',
      });
    }
  }

  if (wantsOnlyFit && ['Never', '1 day a week'].includes(userFitness)) {
    insights.push({
      priority: 'high',
      title: 'You Want Fit Partners but Don\'t Exercise',
      description: `You\'re filtering for "Lean or Fit" body types, but you exercise ${userFitness === 'Never' ? 'never' : 'once a week'}. Attractive, fit people tend to date other fit people.`,
      action: 'Start with 3 days a week of exercise, even walking. Build to 4 to 5 days. This is the single highest ROI change you can make: it improves your Relate Score, your health, your confidence, and your attractiveness to the people you want to date.',
      category: 'honesty',
    });
  }

  const prefIncome = (demographics as any).prefIncome ?? (demographics as any).pref_income_min ?? 0;
  const userIncome = (demographics as any).income ?? 0;
  const incomeComponent = components.income;
  if (prefIncome > 0 && userIncome > 0 && prefIncome > userIncome * 1.5 && incomeComponent?.local && incomeComponent.local < 40) {
    insights.push({
      priority: 'medium',
      title: 'You\'re Requiring Income You Don\'t Match',
      description: `You require partners earning ${formatIncome(prefIncome)}+, but your own income puts you in the bottom ${Math.round(incomeComponent.local)}% locally. High earners typically partner with high earners.`,
      action: 'Focus on increasing your own income first. Alternatively, lower your income floor and look for financial responsibility rather than a specific number. Someone who saves, invests, and lives within their means.',
      category: 'honesty',
    });
  }

  const driver = m4?.emotionalDrivers?.primary;
  if (driver === 'abandonment' && matchCount < 50) {
    insights.push({
      priority: 'medium',
      title: 'Small Pool + Abandonment Fear = Scarcity Spiral',
      description: `With only ${matchCount} estimated matches and abandonment as your primary emotional driver, you\'re at risk of clinging to anyone who shows interest rather than choosing wisely.`,
      action: 'Work on your abandonment patterns (see Growth Plan above) before actively dating. A small pool requires patience and confidence, not desperation. Therapy that targets attachment anxiety will serve you better than loosening your standards.',
      category: 'honesty',
    });
  }

  if (national && national.matchCount > matchCount * 3 && matchCount < 100) {
    insights.push({
      priority: 'low',
      title: 'Your Market Is Better Elsewhere',
      description: `Nationally, your estimated matches jump to ${national.matchCount.toLocaleString()} vs. ${matchCount.toLocaleString()} locally. ${metro} may not be the best market for what you\'re looking for.`,
      action: 'If relocation is feasible, research metros with better demographics for your profile. Even within your state, a larger metro might triple your pool. Dating apps with wider radius settings can help in the short term.',
      category: 'expansion',
    });
  }

  if (prob && prob.rate < 0.05) {
    insights.push({
      priority: 'medium',
      title: 'Your Match Probability Is Below 5%',
      description: `Even within your ideal pool, only ${prob.percentage} of people would likely be mutually interested. This is driven by your Relate Score of ${score.score}.`,
      action: 'Improve your Relate Score by focusing on your weakest component. A 10 point score improvement can nearly double your match probability due to the sigmoid curve. Small gains compound.',
      category: 'score',
    });
  }

  if (insights.length === 0) return null;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  function priorityBadge(p: 'high' | 'medium' | 'low') {
    const styles = {
      high: 'bg-danger/10 text-danger',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-stone-100 text-secondary',
    };
    return styles[p];
  }

  return (
    <section className="card mb-6">
      <h2 className="font-serif text-lg font-semibold mb-1">Market Coaching</h2>
      <p className="text-xs text-secondary mb-5">Actionable insights from your dating market data and assessment results</p>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className="border border-border rounded-md p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${priorityBadge(insight.priority)}`}>
                {insight.priority}
              </span>
              <h3 className="text-sm font-medium leading-tight">{insight.title}</h3>
            </div>
            <p className="text-xs text-secondary mb-2">{insight.description}</p>
            <div className="bg-stone-50 border border-border rounded p-2">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider">What to do</span>
              <p className="text-xs text-secondary mt-1">{insight.action}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function formatIncome(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}
