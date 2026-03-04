'use client';

import { Component, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import Link from 'next/link';
import { type PricingTier } from '@/lib/config';
import { fetchPaymentTier } from '@/lib/payments';
import { generateReferrals, Referral } from '@/lib/referrals';
import { useAuth } from '@/lib/auth-context';
import { SiteHeader } from '@/components/SiteHeader';
import { loadAndHydrateProgress } from '@/lib/supabase/progress';

/* eslint-disable @typescript-eslint/no-explicit-any */

type FunnelStage = { stage: string; count: number; filter?: string; percentage?: number; isMilestone?: boolean };

type MarketData = {
  location?: { cbsaName?: string; cbsaLabel?: string; population?: number };
  relateScore?: { score: number; components?: Record<string, { national?: number; local?: number; score?: number; weight: number }>; marriagePremium?: number };
  matchPool?: { localSinglePool: number; realisticPool: number; preferredPool: number; idealPool: number; funnel?: FunnelStage[]; contextPools?: any };
  matchProbability?: { rate: number; percentage: string };
  matchCount?: number;
  stateComparison?: any;
  nationalComparison?: any;
};

type Demographics = { age?: number; gender?: string; relationshipStatus?: string; seeking?: string; [key: string]: unknown };

// Error boundary
class ResultsErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Results page error:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col">
          <div className="max-w-3xl mx-auto px-6 py-16 w-full text-center">
            <h1 className="font-serif text-2xl font-semibold mb-4">Something went wrong</h1>
            <p className="text-sm text-secondary mb-4">{this.state.error.message}</p>
            <pre className="text-xs text-left bg-stone-100 p-4 rounded overflow-auto max-h-48 mb-6">{this.state.error.stack}</pre>
            <button onClick={() => this.setState({ error: null })} className="btn-primary text-sm">Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ResultsPage() {
  return (
    <ResultsErrorBoundary>
      <ResultsDashboard />
    </ResultsErrorBoundary>
  );
}

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

function ResultsDashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [pricingTier, setPricingTier] = useState<PricingTier>('free');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [hasResults, setHasResults] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const marketFetchedRef = useRef(false);

  // Load everything from localStorage / Supabase
  useEffect(() => {
    function tryLoad() {
      try {
        const stored = localStorage.getItem('relate_results');
        if (stored) {
          const parsed = JSON.parse(stored);
          setReport(parsed);
          setHasResults(true);
          try { setReferrals(generateReferrals(parsed)); } catch { /* */ }
          return true;
        }
      } catch { /* */ }
      return false;
    }

    try {
      const demoStr = localStorage.getItem('relate_demographics');
      if (demoStr) setDemographics(JSON.parse(demoStr));
    } catch { /* */ }

    if (!tryLoad() && user) {
      loadAndHydrateProgress(user.id).then(() => {
        tryLoad();
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchPaymentTier(user.email).then(({ tier }) => setPricingTier(tier));
  }, [user]);

  // Fetch market data
  useEffect(() => {
    if (!user || marketData || marketFetchedRef.current) return;
    const cached = localStorage.getItem('relate_market_data');
    if (cached) {
      try { setMarketData(JSON.parse(cached)); return; } catch { /* */ }
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
          gender, age: demo.age, zipCode: demo.zipCode || demo.zip_code,
          ethnicity: demo.ethnicity, orientation: demo.orientation, income: demo.income,
          education: demo.education, height: demo.height,
          bodyType: demo.bodyType || demo.body_type, fitness: demo.fitness || demo.fitness_level,
          political: demo.political, smoking: demo.smoking,
          hasKids: demo.hasKids ?? demo.has_kids, wantKids: demo.wantKids || demo.want_kids,
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
      .catch(() => { })
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
          persona: report.persona, dimensions: report.dimensions, m3: report.m3, m4: report.m4,
          matches: report.matches, individualCompatibility: report.individualCompatibility,
          marketData: marketData || undefined,
          demographics: (() => { try { return JSON.parse(localStorage.getItem('relate_demographics') || '{}'); } catch { return undefined; } })(),
          fullM3: (() => { try { return JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result; } catch { return undefined; } })(),
          fullM4: (() => { try { return JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result; } catch { return undefined; } })(),
        }),
      });
      const data = await res.json();
      if (data.html) {
        const win = window.open('', '_blank');
        if (win) { win.document.write(data.html); win.document.close(); setTimeout(() => win.print(), 500); }
      }
    } catch (err) { console.error('PDF download failed:', err); }
    finally { setDownloading(false); }
  }, [report, marketData]);

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  // Derived data — all guarded
  const hasPaid = pricingTier !== 'free';
  const canDownload = hasPaid;
  const persona = report?.persona;
  const dimensions = report?.dimensions || {};
  const hasDimensions = Object.keys(dimensions).length > 0;
  const m3 = report?.m3;
  const m4Summary = report?.m4?.summary;
  const matches = report?.matches || [];
  const freeMatchLimit = 3;
  const visibleMatches = hasPaid ? matches : matches.slice(0, freeMatchLimit);
  const ic = report?.individualCompatibility;
  const hasMarket = !!(marketData || marketLoading);

  let fullM3: any = null;
  let fullM4: any = null;
  try { fullM3 = JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result || null; } catch { /* */ }
  try { fullM4 = JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result || null; } catch { /* */ }

  // Sub-nav items — only show sections that have data
  const navItems = [
    { id: 'persona', label: 'Persona', show: !!persona },
    { id: 'dimensions', label: 'Dimensions', show: hasDimensions },
    { id: 'connection', label: 'Connection', show: !!m3 },
    { id: 'conflict', label: 'Conflict', show: !!m4Summary },
    { id: 'market', label: 'Market', show: hasMarket },
    { id: 'matches', label: 'Matches', show: matches.length > 0 },
    { id: 'downloads', label: 'Downloads', show: canDownload },
  ].filter(n => n.show);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Sub-Navigation */}
      {navItems.length > 0 && (
        <nav className="border-b border-border bg-background sticky top-[65px] z-10">
          <div className="max-w-3xl mx-auto px-6 flex gap-1 overflow-x-auto">
            {navItems.map(n => (
              <a key={n.id} href={`#${n.id}`} className="text-xs font-medium px-3 py-2.5 border-b-2 border-transparent hover:border-accent transition-colors whitespace-nowrap text-secondary hover:text-primary">{n.label}</a>
            ))}
          </div>
        </nav>
      )}

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <h1 className="font-serif text-3xl font-semibold mb-8">Results</h1>

        {/* ── Assessment Incomplete CTA ── */}
        {!hasResults && (
          <section className="card mb-6 text-center py-12">
            <h2 className="font-serif text-xl font-semibold mb-2">Assessment Not Complete</h2>
            <p className="text-sm text-secondary mb-6 max-w-md mx-auto">
              Complete all four modules of your RELATE assessment to generate your persona, compatibility rankings, dating market analysis, and personalized coaching.
            </p>
            <Link href="/assessment" className="btn-primary text-sm inline-block">
              Continue Assessment
            </Link>
          </section>
        )}

        {/* ── Persona ── */}
        {persona && (
          <section id="persona" className="card mb-6 scroll-mt-28">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-mono text-xs text-secondary">Your Persona</span>
                <h2 className="font-serif text-3xl font-semibold">{persona.name}</h2>
                {persona.code && <span className="font-mono text-sm text-accent">{persona.code}</span>}
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
            {persona.traits && <p className="text-sm text-secondary">{persona.traits}</p>}
          </section>
        )}

        {/* ── Dimensions ── */}
        {hasDimensions && (
          <section id="dimensions" className="card mb-6 scroll-mt-28">
            <h3 className="font-serif text-lg font-semibold mb-4">Dimension Scores</h3>
            <div className="space-y-3">
              {Object.entries(dimensions).map(([dim, data]: [string, any]) => {
                if (!data || typeof data !== 'object') return null;
                return (
                  <div key={dim} className="flex items-center gap-3">
                    <span className="text-xs text-secondary w-20 capitalize">{dim}</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${Math.max(data.poleAScore || 50, data.poleBScore || 50)}%` }} />
                    </div>
                    <span className="text-xs font-mono w-20 text-right">{data.assignedPole || '-'}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Connection Style ── */}
        {m3 && (
          <section id="connection" className="card mb-6 scroll-mt-28">
            <h3 className="font-serif text-lg font-semibold mb-3">Connection Style</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="font-mono text-2xl font-semibold">{m3.wantScore ?? '-'}</span>
                <p className="text-xs text-secondary mt-1">Want Score</p>
              </div>
              <div>
                <span className="font-mono text-2xl font-semibold">{m3.offerScore ?? '-'}</span>
                <p className="text-xs text-secondary mt-1">Offer Score</p>
              </div>
              <div>
                <span className="font-mono text-2xl font-semibold">{m3.typeName ?? '-'}</span>
                <p className="text-xs text-secondary mt-1">Type</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Conflict Profile ── */}
        {m4Summary && (
          <section id="conflict" className="card mb-6 scroll-mt-28">
            <h3 className="font-serif text-lg font-semibold mb-3">Conflict Profile</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Approach', m4Summary.approach],
                ['Primary Driver', m4Summary.primaryDriver],
                ['Repair Speed', m4Summary.repairSpeed],
                ['Repair Mode', m4Summary.repairMode],
                ['Capacity', m4Summary.capacity],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between py-1 border-b border-border last:border-0">
                  <span className="text-secondary">{label}</span>
                  <span className="font-mono capitalize">{(val as string) || '-'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Attachment Style ── */}
        {ic?.attachment && (
          <section className="card mb-6">
            <h3 className="font-serif text-lg font-semibold mb-3">Attachment Style</h3>
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-2xl font-semibold capitalize">{ic.attachment.style}</span>
              {ic.attachment.subtype && <span className="text-xs font-mono text-secondary">({ic.attachment.subtype})</span>}
              {ic.attachment.leaningToward && <span className="text-xs font-mono text-secondary">leaning {ic.attachment.leaningToward}</span>}
              <span className="text-xs font-mono text-accent ml-auto">{Math.round((ic.attachment.confidence ?? 0) * 100)}% confidence</span>
            </div>
            {ic.attachment.description && <p className="text-sm text-secondary">{ic.attachment.description}</p>}
          </section>
        )}

        {/* ── Intimacy Under Stress ── */}
        {ic?.m3States?.states?.normal && (
          <section className="card mb-6">
            <h3 className="font-serif text-lg font-semibold mb-1">Your Intimacy Under Stress</h3>
            <p className="text-xs text-secondary mb-4">How your Want and Offer shift across relationship states</p>
            <div className="space-y-5">
              {[
                { key: 'normal', data: ic.m3States.states.normal, color: 'bg-stone-400' },
                { key: 'conflict', data: ic.m3States.states.conflict, color: 'bg-warning' },
                { key: 'repair', data: ic.m3States.states.repair, color: 'bg-success' },
              ].filter(s => s.data).map(({ key, data, color }) => {
                const wantDelta = key !== 'normal' ? data.want - ic.m3States.states.normal.want : null;
                const offerDelta = key !== 'normal' ? data.offer - ic.m3States.states.normal.offer : null;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">{data.label}</span>
                      <span className="text-xs font-mono text-secondary">Gap: {data.gap > 0 ? '+' : ''}{data.gap}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-secondary w-10">Want</span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${data.want}%` }} />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">{data.want}</span>
                      {wantDelta !== null && <span className={`text-[10px] font-mono w-8 ${wantDelta > 0 ? 'text-warning' : 'text-success'}`}>{wantDelta > 0 ? '+' : ''}{wantDelta}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-secondary w-10">Offer</span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${data.offer}%` }} />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">{data.offer}</span>
                      {offerDelta !== null && <span className={`text-[10px] font-mono w-8 ${offerDelta < 0 ? 'text-warning' : 'text-success'}`}>{offerDelta > 0 ? '+' : ''}{offerDelta}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {ic.m3States.insights && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  ic.m3States.insights.gapExpansionLevel === 'HIGH' ? 'bg-danger/10 text-danger' :
                  ic.m3States.insights.gapExpansionLevel === 'MODERATE' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                }`}>
                  Gap expansion: {ic.m3States.insights.gapExpansion > 0 ? '+' : ''}{ic.m3States.insights.gapExpansion} pts ({ic.m3States.insights.gapExpansionLevel})
                </span>
                <p className="text-xs text-secondary">
                  Repair effort: <span className={`font-mono ${ic.m3States.insights.repairSustainable ? 'text-success' : 'text-warning'}`}>
                    {ic.m3States.insights.repairSustainable ? 'Sustainable' : 'High strain'}
                  </span>
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── Ideal Partner Profile ── */}
        {ic?.attachmentTiers && (
          <section className="card mb-6">
            <h3 className="font-serif text-lg font-semibold mb-1">Your Ideal Partner Profile</h3>
            <p className="text-xs text-secondary mb-4">Based on your attachment, drivers, and conflict patterns</p>
            <div className="mb-4">
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">Attachment Style</span>
              <div className="mt-2 space-y-1">
                {[
                  { label: 'Best', items: ic.attachmentTiers.bestMatches, color: 'text-success' },
                  { label: 'Good', items: ic.attachmentTiers.goodMatches, color: 'text-accent' },
                  { label: 'Workable', items: ic.attachmentTiers.workableMatches, color: 'text-warning' },
                  { label: 'Risky', items: ic.attachmentTiers.riskyMatches, color: 'text-danger' },
                  { label: 'Avoid', items: ic.attachmentTiers.avoidMatches, color: 'text-danger' },
                ].filter(g => Array.isArray(g.items) && g.items.length > 0).map(group => (
                  <div key={group.label} className="flex items-center gap-3 py-1">
                    <span className={`text-xs w-16 ${group.color}`}>{group.label}</span>
                    <div className="flex gap-2">
                      {group.items.map((m: any, i: number) => (
                        <span key={i} className="text-xs font-mono capitalize bg-stone-50 px-2 py-0.5 rounded">
                          {m.style} ({m.score})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {ic.attachmentTiers.recommendation && <p className="text-xs text-secondary mt-2">{ic.attachmentTiers.recommendation}</p>}
            </div>
            {ic.driverTiers && (
              <div className="mb-4 pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Emotional Driver</span>
                <p className="text-xs text-secondary mt-1 mb-2">Your primary: <span className="font-mono capitalize text-foreground">{ic.driverTiers.yourDriver?.primary || '-'}</span></p>
                <div className="space-y-1">
                  {[
                    { label: 'Best', items: ic.driverTiers.bestMatches, color: 'text-success' },
                    { label: 'Good', items: ic.driverTiers.goodMatches, color: 'text-accent' },
                    { label: 'Workable', items: ic.driverTiers.workableMatches, color: 'text-warning' },
                    { label: 'Avoid', items: ic.driverTiers.avoidMatches, color: 'text-danger' },
                  ].filter(g => Array.isArray(g.items) && g.items.length > 0).map(group => (
                    <div key={group.label} className="flex items-center gap-3 py-1">
                      <span className={`text-xs w-16 ${group.color}`}>{group.label}</span>
                      <div className="flex gap-2">
                        {group.items.map((m: any, i: number) => (
                          <span key={i} className="text-xs font-mono capitalize bg-stone-50 px-2 py-0.5 rounded">
                            {m.driver} ({m.score})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {ic.driverTiers.recommendation && <p className="text-xs text-secondary mt-2">{ic.driverTiers.recommendation}</p>}
              </div>
            )}
            {ic.horsemenInsights && (
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Conflict Behavior</span>
                {ic.horsemenInsights.urgent && (
                  <div className="mt-2 p-2 bg-danger/5 border border-danger/20 rounded text-xs text-danger">{ic.horsemenInsights.urgent}</div>
                )}
                {Array.isArray(ic.horsemenInsights.lookFor) && ic.horsemenInsights.lookFor.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-success mb-1">Look for:</p>
                    {ic.horsemenInsights.lookFor.map((item: any, i: number) => (
                      <p key={i} className="text-xs text-secondary ml-3">{item.partnerTrait} — {item.reason}</p>
                    ))}
                  </div>
                )}
                {Array.isArray(ic.horsemenInsights.avoid) && ic.horsemenInsights.avoid.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-warning mb-1">Avoid:</p>
                    {ic.horsemenInsights.avoid.map((item: any, i: number) => (
                      <p key={i} className="text-xs text-secondary ml-3">{item.partnerTrait} — {item.reason}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Dating Market ── */}
        {hasMarket && (
          <div id="market" className="scroll-mt-28">
            <DatingMarketViz data={marketData} loading={marketLoading} />
          </div>
        )}

        {/* ── Market Coaching ── */}
        {marketData && (
          <MarketCoaching
            marketData={marketData}
            demographics={demographics}
            m3={fullM3}
            m4={fullM4}
            persona={persona || null}
          />
        )}

        {/* ── Matches ── */}
        {matches.length > 0 && (
          <section id="matches" className="mb-6 scroll-mt-28">
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
                    <th className="text-left px-3 py-2 font-mono text-xs text-secondary hidden sm:table-cell">Tier</th>
                    <th className="text-right px-3 py-2 font-mono text-xs text-secondary">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMatches.map((match: any) => (
                    <tr key={match.code} className="border-b border-border last:border-0 hover:bg-stone-50">
                      <td className="px-3 py-2 font-mono text-secondary">{match.rank}</td>
                      <td className="px-3 py-2">
                        {hasPaid ? (
                          <Link href={`/results/match/${match.code}`} className="text-accent hover:underline">{match.name}</Link>
                        ) : match.name}
                        <span className="font-mono text-xs text-secondary ml-1">{match.code}</span>
                      </td>
                      <td className={`px-3 py-2 text-xs font-medium hidden sm:table-cell ${tierColor(match.tier)}`}>{tierLabel(match.tier)}</td>
                      <td className="px-3 py-2 font-mono text-right">{match.compatibilityScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!hasPaid && matches.length > freeMatchLimit && (
              <div className="mt-4 card border-accent text-center">
                <p className="text-sm mb-3">{matches.length - freeMatchLimit} more matches available with Plus</p>
                <div className="flex gap-2 justify-center">
                  <Link href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary inline-block text-sm">Plus ($29.99)</Link>
                  <Link href={`/api/checkout?product=premium&email=${encodeURIComponent(user?.email || '')}`} className="btn-primary inline-block text-sm">Premium ($49.99)</Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Referrals ── */}
        {referrals.length > 0 && (
          <section className="mb-6">
            <h3 className="font-serif text-lg font-semibold mb-3">Recommended Resources</h3>
            <div className="space-y-2">
              {referrals.map((ref) => (
                <a key={ref.service} href={ref.url} target="_blank" rel="noopener noreferrer"
                  onClick={() => fetch('/api/referral-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service: ref.service, affiliateUrl: ref.url }) })}
                  className="card block hover:border-accent transition-colors">
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

        {/* ── Downloads ── */}
        {canDownload && (
          <section id="downloads" className="card mb-6 scroll-mt-28">
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

        {/* ── Couples CTA ── */}
        {hasResults && (
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
        )}

        {/* ── Navigation ── */}
        {hasResults && (
          <div className="flex gap-3 flex-wrap">
            <Link href="/results/persona" className="btn-secondary text-xs">Persona Details</Link>
            {hasPaid && (
              <>
                <Link href="/results/matches" className="btn-secondary text-xs">All Matches</Link>
                <Link href="/results/conflict" className="btn-secondary text-xs">Conflict Analysis</Link>
              </>
            )}
            <Link href="/invite" className="btn-secondary text-xs">Invite Partner</Link>
          </div>
        )}
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
  const compLabels: Record<string, string> = { income: 'Income', education: 'Education', age: 'Age', ethnicity: 'Ethnicity', children: 'Children' };

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
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, background: score >= 65 ? 'var(--color-success)' : score >= 50 ? 'var(--color-accent)' : score >= 35 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
          {[25, 50, 75].map(tick => <div key={tick} className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: `${tick}%` }} />)}
        </div>
        <p className="text-xs text-secondary mt-2">How competitive you are in the {metro} dating market based on income, education, age, and demographics.</p>
      </div>

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
                    <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, val))}%` }} />
                  </div>
                  <span className="text-xs font-mono w-8 text-right">{Math.round(val)}</span>
                  <span className="text-[10px] text-secondary w-6">{Math.round(weight * 100)}%</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-secondary mt-2">Each bar shows your local percentile (0 = bottom, 100 = top). The percentage is how much that category weighs in your overall Relate Score.</p>
        </div>
      )}

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
                    <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${isLast ? 'bg-accent' : 'bg-stone-300'}`} style={{ width: `${Math.max(1, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 space-y-1">
            {milestones.map(m => (
              <p key={m.label} className="text-[11px] text-secondary"><span className="font-medium">{m.label}:</span> {m.desc}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <span className="text-xs font-mono text-secondary uppercase tracking-wider">Match Probability</span>
          <p className="font-mono text-2xl font-semibold mt-1">{prob?.percentage || '—'}</p>
          <p className="text-xs text-secondary mt-1">Chance of matching with someone from your ideal pool</p>
        </div>
        <div className="text-center">
          <span className="text-xs font-mono text-secondary uppercase tracking-wider">Estimated Matches</span>
          <p className="font-mono text-2xl font-semibold mt-1">{matchCount.toLocaleString()}</p>
          <p className="text-xs text-secondary mt-1">Compatible singles in the surrounding {metro} metro area</p>
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
  persona: any;
}) {
  if (!marketData?.matchPool || !marketData?.relateScore) return null;

  const pool = marketData.matchPool;
  const score = marketData.relateScore;
  const funnel: FunnelStage[] = pool.funnel || [];
  const matchCount = marketData.matchCount ?? 0;
  const prob = marketData.matchProbability;
  const metro = marketData.location?.cbsaLabel || marketData.location?.cbsaName || 'your area';
  const national = marketData.nationalComparison;
  const components = score.components || {};

  type Insight = { priority: 'high' | 'medium' | 'low'; title: string; description: string; action: string };
  const insights: Insight[] = [];

  const compEntries = Object.entries(components).map(([k, v]: [string, any]) => ({
    name: k, local: v.local ?? v.score ?? 0, weight: v.weight ?? 0,
    weighted: (v.local ?? v.score ?? 0) * (v.weight ?? 0),
  })).sort((a, b) => a.weighted - b.weighted);

  const weakest = compEntries[0];
  if (weakest && weakest.local < 40) {
    const coaching: Record<string, { title: string; desc: string; action: string }> = {
      income: {
        title: 'Your Income Is Limiting You',
        desc: `Your income ranks in the bottom ${Math.round(weakest.local)}% locally. For ${demographics.gender === 'Woman' ? 'women' : 'men'} in ${metro}, income carries ${Math.round(weakest.weight * 100)}% of your Relate Score weight.`,
        action: 'Concrete paths: negotiate a raise, pursue a certification, or explore side income. Even a 20% increase can move your score meaningfully.',
      },
      education: {
        title: 'Education Is Holding You Back',
        desc: `Your education level ranks in the bottom ${Math.round(weakest.local)}% locally.`,
        action: 'Consider professional certifications, online degrees, or skill-based credentials.',
      },
      age: {
        title: 'Age Is Working Against You',
        desc: `Your age score is ${Math.round(weakest.local)}.`,
        action: 'Focus on what you control: fitness, style, income, and emotional maturity.',
      },
      children: {
        title: 'Having Kids Is Narrowing Your Pool',
        desc: `Many singles in your age range prefer partners without existing children.`,
        action: 'Position it as a strength: show that your life is full, not burdened.',
      },
      ethnicity: {
        title: 'Your Demographic Is Competitive Here',
        desc: `Your ethnicity score is ${Math.round(weakest.local)} in ${metro}.`,
        action: national && national.relateScore > score.score + 5
          ? `Your national score is ${national.relateScore} vs ${score.score} locally. Consider whether a different metro would shift your odds.`
          : 'Focus on income, fitness, and being genuinely interesting.',
      },
    };
    const c = coaching[weakest.name];
    if (c) insights.push({ priority: 'high', title: c.title, description: c.desc, action: c.action });
  }

  const strongest = compEntries[compEntries.length - 1];
  if (strongest && strongest.local >= 70) {
    insights.push({
      priority: 'low',
      title: `${strongest.name.charAt(0).toUpperCase() + strongest.name.slice(1)} Is Your Biggest Asset`,
      description: `Your ${strongest.name} ranks in the top ${Math.round(100 - strongest.local)}% in ${metro}.`,
      action: 'Lead with this. Make sure your dating profile reflects this strength.',
    });
  }

  // Funnel bottleneck
  const nonPreferenceFilters = /orientation|sexual|gender|base.*age|18.*64|eligible/i;
  const drops: { lostPct: number; lostCount: number; stageName: string }[] = [];
  for (let i = 1; i < funnel.length; i++) {
    const prev = funnel[i - 1];
    const curr = funnel[i];
    if (curr.isMilestone || prev.isMilestone || prev.count === 0) continue;
    if (nonPreferenceFilters.test(curr.stage) || nonPreferenceFilters.test(curr.filter || '')) continue;
    const lostPct = ((prev.count - curr.count) / prev.count) * 100;
    if (lostPct > 5) drops.push({ lostPct, lostCount: prev.count - curr.count, stageName: curr.stage });
  }
  drops.sort((a, b) => b.lostPct - a.lostPct);

  if (drops[0] && drops[0].lostPct > 30) {
    insights.push({
      priority: 'high',
      title: `Biggest Bottleneck: ${drops[0].stageName}`,
      description: `This filter eliminates ${Math.round(drops[0].lostPct)}% of your remaining pool (${drops[0].lostCount.toLocaleString()} people).`,
      action: 'Evaluate whether this reflects a genuine dealbreaker or a nice-to-have.',
    });
  }
  if (drops[1] && drops[1].lostPct > 25) {
    insights.push({
      priority: 'medium',
      title: `Secondary Bottleneck: ${drops[1].stageName}`,
      description: `Removes another ${Math.round(drops[1].lostPct)}% (${drops[1].lostCount.toLocaleString()} people).`,
      action: `Your top two bottlenecks are ${drops[0]?.stageName || 'unknown'} and ${drops[1].stageName}. Consider flexibility on ${drops[1].stageName}.`,
    });
  }

  // Selectivity
  if (pool.localSinglePool > 0 && pool.idealPool > 0) {
    const pct = (pool.idealPool / pool.localSinglePool) * 100;
    if (pct < 1) {
      insights.push({ priority: 'high', title: 'Your Preferences Filter Out 99%+ of Singles', description: `Only ${pool.idealPool.toLocaleString()} of ${pool.localSinglePool.toLocaleString()} local singles meet all your criteria.`, action: 'Review your funnel to see which filters you could relax.' });
    }
  }

  // Match probability
  if (prob && prob.rate < 0.05) {
    insights.push({ priority: 'medium', title: 'Match Probability Below 5%', description: `Only ${prob.percentage} of your ideal pool would likely be mutually interested.`, action: 'A 10 point score improvement can nearly double your match probability.' });
  }

  // Geographic
  if (national && national.matchCount > matchCount * 3 && matchCount < 100) {
    insights.push({ priority: 'low', title: 'Your Market Is Better Elsewhere', description: `Nationally, matches jump to ${national.matchCount.toLocaleString()} vs. ${matchCount.toLocaleString()} locally.`, action: 'If relocation is feasible, research metros with better demographics for your profile.' });
  }

  if (insights.length === 0) return null;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <section className="card mb-6">
      <h2 className="font-serif text-lg font-semibold mb-1">Market Coaching</h2>
      <p className="text-xs text-secondary mb-5">Actionable insights from your dating market data and assessment results</p>
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className="border border-border rounded-md p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                insight.priority === 'high' ? 'bg-danger/10 text-danger' : insight.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-stone-100 text-secondary'
              }`}>{insight.priority}</span>
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
