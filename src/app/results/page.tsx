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
          <div className="max-w-2xl mx-auto px-6 py-16 w-full text-center">
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
  const [downloadingCoach, setDownloadingCoach] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [hasResults, setHasResults] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasPartner, setHasPartner] = useState(false);
  const [hasCouplesAccess, setHasCouplesAccess] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
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
    fetchPaymentTier(user.email).then(({ tier }) => {
      setPricingTier(tier);
      if (tier === 'couples') setHasCouplesAccess(true);
    });
  }, [user]);

  // Load partner info
  useEffect(() => {
    if (!user) return;
    const savedPartner = localStorage.getItem('relate_partner_results');
    if (savedPartner) setHasPartner(true);
    const savedDiscount = localStorage.getItem('relate_couples_discount');
    if (savedDiscount) setHasCouplesAccess(true);

    fetch(`/api/partner-lookup?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.partner) {
          setHasPartner(true);
          const name = data.partner.firstName
            ? `${data.partner.firstName}${data.partner.lastName ? ` ${data.partner.lastName}` : ''}`
            : data.partner.email;
          setPartnerName(name);
          localStorage.setItem('relate_partner_results', 'true');
        }
      })
      .catch(() => { });
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

  const handleDownloadCoach = useCallback(async () => {
    const resultsStr = localStorage.getItem('relate_results');
    if (!resultsStr) return;
    setDownloadingCoach(true);
    try {
      const rpt = JSON.parse(resultsStr);
      const demoData = (() => { try { return JSON.parse(localStorage.getItem('relate_demographics') || '{}'); } catch { return {}; } })();
      const m3Full = (() => { try { return JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result; } catch { return undefined; } })();
      const m4Full = (() => { try { return JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result; } catch { return undefined; } })();
      const couplesData = (() => { try { return JSON.parse(localStorage.getItem('relate_couples_report') || 'null'); } catch { return null; } })();
      const res = await fetch('/api/generate-coach-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: rpt.persona, dimensions: rpt.dimensions, m3: m3Full || rpt.m3, m4: m4Full || rpt.m4,
          matches: rpt.matches, individualCompatibility: rpt.individualCompatibility,
          marketData: marketData || undefined, demographics: demoData, couplesReport: couplesData || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate coach skill');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'relate-coach.zip';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) { console.error('Coach prompt download failed:', err); }
    finally { setDownloadingCoach(false); }
  }, [marketData]);

  const handleDownloadCoachMd = useCallback(async () => {
    const resultsStr = localStorage.getItem('relate_results');
    if (!resultsStr) return;
    setDownloadingCoach(true);
    try {
      const rpt = JSON.parse(resultsStr);
      const demoData = (() => { try { return JSON.parse(localStorage.getItem('relate_demographics') || '{}'); } catch { return {}; } })();
      const m3Full = (() => { try { return JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result; } catch { return undefined; } })();
      const m4Full = (() => { try { return JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result; } catch { return undefined; } })();
      const couplesData = (() => { try { return JSON.parse(localStorage.getItem('relate_couples_report') || 'null'); } catch { return null; } })();
      const res = await fetch('/api/generate-coach-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: rpt.persona, dimensions: rpt.dimensions, m3: m3Full || rpt.m3, m4: m4Full || rpt.m4,
          matches: rpt.matches, individualCompatibility: rpt.individualCompatibility,
          marketData: marketData || undefined, demographics: demoData, couplesReport: couplesData || undefined, format: 'md',
        }),
      });
      if (!res.ok) throw new Error('Failed to generate coach prompt');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'relate-coach.md';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) { console.error('Coach .md download failed:', err); }
    finally { setDownloadingCoach(false); }
  }, [marketData]);

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  // Derived data — all guarded
  const hasPaid = pricingTier !== 'free';
  const canDownload = hasPaid;
  const persona = report?.persona;
  const dimensions = report?.dimensions || {};
  const hasDimensions = Object.keys(dimensions).length > 0;
  const m3 = report?.m3;
  const m4 = report?.m4;
  const m4Summary = m4?.summary;
  const matches = report?.matches || [];
  const freeMatchLimit = 3;
  const visibleMatches = hasPaid ? matches : matches.slice(0, freeMatchLimit);
  const ic = report?.individualCompatibility;
  const hasMarket = !!(marketData || marketLoading);
  const tensionStacks = report?.tensionStacks;
  const modifiers = report?.modifiers;
  const gottman = m4?.gottmanScreener || m4?.gottmanScores;

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
    { id: 'insights', label: 'Insights', show: !!tensionStacks },
    { id: 'market', label: 'Market', show: hasMarket },
    { id: 'matches', label: 'Matches', show: matches.length > 0 },
    { id: 'downloads', label: 'Downloads', show: canDownload },
    { id: 'coaching', label: 'Ongoing Coaching', show: hasResults && canDownload },
  ].filter(n => n.show);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Sub-Navigation */}
      {navItems.length > 0 && (
        <nav className="border-b border-border bg-background sticky top-[65px] z-10">
          <div className="max-w-2xl mx-auto px-6 flex gap-1 overflow-x-auto">
            {navItems.map(n => (
              <a key={n.id} href={`#${n.id}`} className="text-xs font-medium px-3 py-2.5 border-b-2 border-transparent hover:border-accent transition-colors whitespace-nowrap text-secondary hover:text-primary">{n.label}</a>
            ))}
          </div>
        </nav>
      )}

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
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
            {persona.traits && <p className="text-sm text-secondary mb-4">{persona.traits}</p>}

            {/* Dating Behavior */}
            {persona.datingBehavior?.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Dating Behavior</span>
                <ul className="mt-2 space-y-1.5">
                  {persona.datingBehavior.map((b: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2"><span className="text-accent">&#8226;</span>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths & Growth */}
            {(persona.mostAttractive?.length > 0 || persona.leastAttractive?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {persona.mostAttractive?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-success uppercase tracking-wider">Most Attractive Qualities</span>
                    <ul className="mt-2 space-y-1">
                      {persona.mostAttractive.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-secondary">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {persona.leastAttractive?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-warning uppercase tracking-wider">Growth Areas</span>
                    <ul className="mt-2 space-y-1">
                      {persona.leastAttractive.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-secondary">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* In Relationships */}
            {persona.inRelationships?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">In Relationships</span>
                <ul className="mt-2 space-y-1.5">
                  {persona.inRelationships.map((b: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2"><span className="text-accent">&#8226;</span>{b}</li>
                  ))}
                </ul>
              </div>
            )}
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
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
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
            {m3.wantOfferGap !== undefined && (
              <p className="text-xs text-secondary text-center mb-4">
                Gap: <span className={`font-mono ${Math.abs(m3.wantOfferGap) <= 5 ? 'text-success' : Math.abs(m3.wantOfferGap) <= 20 ? 'text-warning' : 'text-danger'}`}>
                  {m3.wantOfferGap > 0 ? '+' : ''}{m3.wantOfferGap}
                </span>
              </p>
            )}
            {m3.typeDescription && (
              <p className="text-sm text-secondary mb-4">{m3.typeDescription}</p>
            )}
            {m3.typeDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                {m3.typeDetails.strengths?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-success uppercase tracking-wider">Strengths</span>
                    <ul className="mt-2 space-y-1">
                      {m3.typeDetails.strengths.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-secondary">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {m3.typeDetails.challenges?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-warning uppercase tracking-wider">Challenges</span>
                    <ul className="mt-2 space-y-1">
                      {m3.typeDetails.challenges.map((c: string, i: number) => (
                        <li key={i} className="text-sm text-secondary">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Conflict Profile ── */}
        {m4Summary && (
          <section id="conflict" className="card mb-6 scroll-mt-28">
            <h3 className="font-serif text-lg font-semibold mb-3">Conflict Profile</h3>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
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

            {/* Gottman Four Horsemen */}
            {gottman?.horsemen && Object.keys(gottman.horsemen).length > 0 && (
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Gottman Four Horsemen</span>
                {gottman.overallRisk && (
                  <p className="text-xs mt-1 mb-3">
                    Overall risk: <span className={`font-mono ${gottman.overallRisk === 'high' ? 'text-danger' : gottman.overallRisk === 'medium' ? 'text-warning' : 'text-success'}`}>
                      {gottman.overallRisk}
                    </span>
                  </p>
                )}
                <div className="space-y-3">
                  {Object.entries(gottman.horsemen).map(([name, data]: [string, any]) => {
                    if (!data) return null;
                    const riskColor = data.riskLevel === 'high' ? 'text-danger' : data.riskLevel === 'medium' ? 'text-warning' : 'text-success';
                    const barColor = data.riskLevel === 'high' ? 'bg-danger' : data.riskLevel === 'medium' ? 'bg-warning' : 'bg-success';
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm capitalize font-medium">{name}</span>
                          <span className={`text-xs font-mono ${riskColor}`}>{data.riskLevel || '-'} ({data.score ?? '-'})</span>
                        </div>
                        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, (data.score ?? 0) * 10)}%` }} />
                        </div>
                        {data.antidote && (
                          <p className="text-xs text-secondary">Antidote: {data.antidote}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

        {/* ── Tension Stacks / Insights ── */}
        {tensionStacks && Object.keys(tensionStacks).length > 0 && (
          <section id="insights" className="mb-6 scroll-mt-28">
            <h3 className="font-serif text-lg font-semibold mb-4">Relationship Insights</h3>
            <div className="space-y-4">
              {Object.entries(tensionStacks).map(([key, stack]: [string, any]) => {
                if (!stack || typeof stack !== 'object') return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()).trim();
                return (
                  <div key={key} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-mono text-secondary uppercase tracking-wider">{label}</span>
                        {stack.patternName && <h4 className="text-sm font-semibold mt-1">{stack.patternName}</h4>}
                      </div>
                      {stack.tensionLevel !== undefined && (
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          stack.tensionLevel === 'high' ? 'bg-danger/10 text-danger' :
                          stack.tensionLevel === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                        }`}>
                          {stack.tensionLevel}
                        </span>
                      )}
                    </div>
                    {stack.patternDescription && <p className="text-sm text-secondary mb-3">{stack.patternDescription}</p>}
                    {stack.starterNarrative && <p className="text-sm mb-3">{stack.starterNarrative}</p>}
                    {Array.isArray(stack.customizations) && stack.customizations.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-mono text-secondary uppercase tracking-wider">Key Patterns</span>
                        <ul className="mt-1.5 space-y-1">
                          {stack.customizations.map((c: string, i: number) => (
                            <li key={i} className="text-sm flex gap-2"><span className="text-accent">&#8226;</span>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.isArray(stack.risks) && stack.risks.length > 0 && (
                        <div>
                          <span className="text-xs font-mono text-warning uppercase tracking-wider">Risks</span>
                          <ul className="mt-1.5 space-y-1">
                            {stack.risks.map((r: string, i: number) => (
                              <li key={i} className="text-xs text-secondary">{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {stack.growthPath && (
                        <div>
                          <span className="text-xs font-mono text-success uppercase tracking-wider">Growth Path</span>
                          {Array.isArray(stack.growthPath) ? (
                            <ul className="mt-1.5 space-y-1">
                              {stack.growthPath.map((g: string, i: number) => (
                                <li key={i} className="text-xs text-secondary">{g}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-secondary mt-1.5">{stack.growthPath}</p>
                          )}
                        </div>
                      )}
                    </div>
                    {stack.signals && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-xs font-mono text-secondary uppercase tracking-wider">Watch For</span>
                        {Array.isArray(stack.signals) ? (
                          <ul className="mt-1.5 space-y-1">
                            {stack.signals.map((s: string, i: number) => (
                              <li key={i} className="text-xs text-secondary">{s}</li>
                            ))}
                          </ul>
                        ) : typeof stack.signals === 'object' ? (
                          <div className="mt-1.5 space-y-1">
                            {Object.entries(stack.signals).map(([k, v]: [string, any]) => (
                              <p key={k} className="text-xs text-secondary"><span className="font-mono capitalize">{k}:</span> {String(v)}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-secondary mt-1.5">{String(stack.signals)}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Relationship Capacity / Modifiers ── */}
        {modifiers && (
          <section className="card mb-6">
            <h3 className="font-serif text-lg font-semibold mb-3">Relationship Capacity</h3>
            {modifiers.relationshipCapacity && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-2xl font-semibold">
                    {typeof modifiers.relationshipCapacity === 'object' ? modifiers.relationshipCapacity.score ?? modifiers.relationshipCapacity.level ?? '-' : modifiers.relationshipCapacity}
                  </span>
                  {modifiers.relationshipCapacity.level && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      modifiers.relationshipCapacity.level === 'high' ? 'bg-success/10 text-success' :
                      modifiers.relationshipCapacity.level === 'medium' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                    }`}>
                      {modifiers.relationshipCapacity.level}
                    </span>
                  )}
                </div>
                {modifiers.relationshipCapacity.description && (
                  <p className="text-sm text-secondary">{modifiers.relationshipCapacity.description}</p>
                )}
              </div>
            )}
            {Array.isArray(modifiers.strengths) && modifiers.strengths.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-mono text-success uppercase tracking-wider">Strengths</span>
                <ul className="mt-1.5 space-y-1">
                  {modifiers.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-secondary">{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(modifiers.growthAreas) && modifiers.growthAreas.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-mono text-warning uppercase tracking-wider">Growth Areas</span>
                <ul className="mt-1.5 space-y-1">
                  {modifiers.growthAreas.map((g: string, i: number) => (
                    <li key={i} className="text-sm text-secondary">{g}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(modifiers.coachingRecommendations) && modifiers.coachingRecommendations.length > 0 && (
              <div className="pt-3 border-t border-border">
                <span className="text-xs font-mono text-accent uppercase tracking-wider">Recommendations</span>
                <ul className="mt-1.5 space-y-1.5">
                  {modifiers.coachingRecommendations.map((rec: any, i: number) => (
                    <li key={i} className="text-sm">
                      {typeof rec === 'string' ? rec : (
                        <div>
                          {rec.title && <span className="font-medium">{rec.title}: </span>}
                          <span className="text-secondary">{rec.description || rec.recommendation || JSON.stringify(rec)}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {modifiers.modifierList && Array.isArray(modifiers.modifierList) && modifiers.modifierList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Active Modifiers</span>
                <div className="mt-2 space-y-2">
                  {modifiers.modifierList.map((mod: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`text-xs font-mono mt-0.5 ${mod.direction === 'positive' ? 'text-success' : mod.direction === 'negative' ? 'text-danger' : 'text-secondary'}`}>
                        {mod.direction === 'positive' ? '+' : mod.direction === 'negative' ? '−' : '·'}
                      </span>
                      <div>
                        <span className="text-sm font-medium">{mod.name || mod.label}</span>
                        {mod.description && <p className="text-xs text-secondary">{mod.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="space-y-3">
              {visibleMatches.map((match: any) => (
                <div key={match.code} className="card">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-secondary">#{match.rank}</span>
                      {hasPaid ? (
                        <Link href={`/results/match/${match.code}`} className="text-sm font-semibold text-accent hover:underline">{match.name}</Link>
                      ) : <span className="text-sm font-semibold">{match.name}</span>}
                      <span className="font-mono text-xs text-secondary">{match.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${tierColor(match.tier)}`}>{tierLabel(match.tier)}</span>
                      <span className="font-mono text-sm font-semibold">{match.compatibilityScore}</span>
                    </div>
                  </div>
                  {match.traits && <p className="text-xs text-secondary mb-1">{match.traits}</p>}
                  {match.summary && <p className="text-sm text-secondary">{match.summary}</p>}
                </div>
              ))}
            </div>
            {!hasPaid && matches.length > freeMatchLimit && (
              <div className="mt-4 card border-accent text-center">
                <p className="text-sm mb-3">{matches.length - freeMatchLimit} more matches available with Plus</p>
                <div className="flex gap-2 justify-center">
                  <a href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary inline-block text-sm">Plus ($29.99/mo)</a>
                  <a href={`/api/checkout?product=premium&email=${encodeURIComponent(user?.email || '')}`} className="btn-primary inline-block text-sm">Premium ($49.99/mo)</a>
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

        {/* ── Couples Mode ── */}
        {hasResults && (
          <section className="card mb-6 border-accent">
            <h3 className="font-serif text-lg font-semibold mb-2">Couples Mode</h3>
            {hasPartner && hasCouplesAccess ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {partnerName ? partnerName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connected with {partnerName || 'your partner'}</p>
                    <p className="text-xs text-secondary">Couples access active</p>
                  </div>
                </div>
                <Link href="/results/compare" className="btn-primary text-xs">View Couples Results</Link>
              </div>
            ) : hasPartner ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {partnerName ? partnerName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <p className="text-sm font-medium">Connected with {partnerName || 'your partner'}</p>
                </div>
                <p className="text-sm text-secondary mb-4">
                  Activate Couples access to unlock your compatibility report, growth plan, and shared advisor.
                </p>
                <Link href="/invite" className="btn-primary text-xs">Activate Couples</Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-secondary mb-4">
                  Connect with your partner to unlock your compatibility report, growth plan, and shared advisor.
                </p>
                <Link href="/invite" className="btn-primary text-xs">Connect Partner</Link>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── Ongoing Coaching Section ── */}
      {hasResults && canDownload && (
        <div id="coaching" className="bg-stone-100 border-t border-border scroll-mt-12">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <h2 className="font-serif text-2xl font-semibold mb-2">Ongoing Coaching</h2>
            <p className="text-sm text-secondary mb-6">
              Take your RELATE results with you. Download a personalized AI coaching prompt built from your assessment data, conflict patterns, dating market analysis, and compatibility profile.
            </p>

            {/* Download Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* ZIP Skill */}
              <div className="bg-white border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded">ZIP</span>
                  <h3 className="text-sm font-semibold">Claude Skill Package</h3>
                </div>
                <p className="text-xs text-secondary mb-3">
                  Full skill with coaching workflows, response patterns, report summary, and disclaimer. Upload directly to Claude.ai as a Skill.
                </p>
                <div className="mb-3 text-[11px] text-secondary font-mono leading-relaxed bg-stone-50 p-2 rounded border border-border">
                  <p>relate-coach/</p>
                  <p className="ml-3">SKILL.md</p>
                  <p className="ml-3">references/assessment-data.md</p>
                  <p className="ml-3">references/report-summary.md</p>
                  <p className="ml-3">references/workflow.md</p>
                  <p className="ml-3">references/output-patterns.md</p>
                  <p className="ml-3">LICENSE &middot; DISCLAIMER.md</p>
                </div>
                <button onClick={handleDownloadCoach} disabled={downloadingCoach} className="btn-secondary text-xs w-full">
                  {downloadingCoach ? 'Preparing...' : 'Download relate-coach.zip'}
                </button>
              </div>

              {/* Basic .md */}
              <div className="bg-white border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-stone-200 text-secondary px-1.5 py-0.5 rounded">MD</span>
                  <h3 className="text-sm font-semibold">Basic Coaching Prompt</h3>
                </div>
                <p className="text-xs text-secondary mb-3">
                  Single markdown file with your coaching instructions and assessment data combined. Works with any AI. Paste it into a chat or upload as a file.
                </p>
                <div className="mb-3 text-[11px] text-secondary bg-stone-50 p-2 rounded border border-border">
                  <p>A single <code className="bg-stone-100 px-1 rounded">relate-coach.md</code> file containing your coaching prompt, report summary, and full assessment data. No setup required. Just upload or paste.</p>
                </div>
                <button onClick={handleDownloadCoachMd} disabled={downloadingCoach} className="btn-secondary text-xs w-full">
                  {downloadingCoach ? 'Preparing...' : 'Download relate-coach.md'}
                </button>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-white border border-border rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold mb-3">How to Use Your Coach</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-1.5">Option 1: Claude.ai Skill (Best experience)</p>
                  <ol className="text-xs text-secondary space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://claude.ai/customize/skills" target="_blank" rel="noopener noreferrer" className="text-accent underline">claude.ai/customize/skills</a> (profile icon &rarr; Customize &rarr; Skills)</li>
                    <li>Click <strong>&quot;Add Skill&quot;</strong> and upload <code className="bg-stone-100 px-1 rounded">relate-coach.zip</code></li>
                    <li>Toggle <strong>relate-coach</strong> on. Claude automatically uses your data in any relationship conversation</li>
                  </ol>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-1.5">Option 2: Claude.ai Project</p>
                  <ol className="text-xs text-secondary space-y-1 list-decimal list-inside">
                    <li>Unzip the file, then create a new <strong>Project</strong> in <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-accent underline">claude.ai</a> called &quot;RELATE Coach&quot;</li>
                    <li>Add all files from the <code className="bg-stone-100 px-1 rounded">relate-coach/</code> folder as project knowledge</li>
                    <li>Start conversations within that project for coaching</li>
                  </ol>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-1.5">Option 3: Any AI (ChatGPT, Gemini, etc.)</p>
                  <ol className="text-xs text-secondary space-y-1 list-decimal list-inside">
                    <li>Download the <strong>.md file</strong> above</li>
                    <li>Upload <code className="bg-stone-100 px-1 rounded">relate-coach.md</code> to any AI chat as a file attachment, or paste its contents as a message</li>
                    <li>Say: &quot;Use this as my coaching profile and help me with dating/relationships&quot;</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Example prompts */}
            <div className="bg-white border border-border rounded-lg p-4 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2">What you can ask your coach</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Should I lower my income filter?',
                  'I just had a fight, what happened?',
                  'Is this person a good match for me?',
                  'Help me write a dating profile',
                  'What should I work on this week?',
                  'How do I improve my Relate Score?',
                  'Analyze my last date',
                ].map((q, i) => (
                  <span key={i} className="text-[11px] text-secondary bg-stone-50 border border-border px-2 py-1 rounded">
                    &quot;{q}&quot;
                  </span>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <p className="text-[11px] text-secondary">
                <strong>Not a therapist.</strong> This coaching tool references evidence-based frameworks but is not a substitute for licensed therapy. See DISCLAIMER.md in the download. If you&apos;re in crisis: <strong>988 Suicide &amp; Crisis Lifeline</strong> or <strong>National Domestic Violence Hotline (1-800-799-7233)</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
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

  const metroShort = metro.includes(',') ? metro.split(',')[0] : metro;

  const milestones = [
    { label: 'Metro Population', value: metroPop, desc: 'Total population in your metro area' },
    { label: 'Metro Singles Pool', value: pool?.localSinglePool || 0, desc: 'Unmarried adults of your preferred gender and orientation' },
    { label: 'Your Realistic Match Pool', value: pool?.realisticPool || 0, desc: 'Singles within your age range and income requirements' },
    { label: 'Your Preferred Pool', value: pool?.preferredPool || 0, desc: 'Singles who additionally meet your lifestyle preferences' },
    { label: 'Your Ideal Match Pool', value: pool?.idealPool || 0, desc: 'Singles who meet every preference you set' },
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
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-secondary mt-2">Each bar shows your local percentile (0 = bottom, 100 = top).</p>
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
              const singlesPool = milestones[1].value || 1;
              let pctOfSingles = '';
              if (i >= 1) {
                const raw = (m.value / singlesPool) * 100;
                if (isLast) {
                  // Use enough decimals to show a non-zero result
                  let decimals = 1;
                  while (decimals < 10 && Number(raw.toFixed(decimals)) === 0 && raw > 0) decimals++;
                  pctOfSingles = `${raw.toFixed(decimals)}%`;
                } else {
                  pctOfSingles = `${raw.toFixed(1)}%`;
                }
              }
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs ${isLast ? 'font-medium' : 'text-secondary'}`}>{m.label}</span>
                    <span className={`text-xs font-mono ${isLast ? 'font-semibold' : 'text-secondary'}`}>{m.value.toLocaleString()}{pctOfSingles ? ` (${pctOfSingles})` : ''}</span>
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
          <p className="text-xs text-secondary mt-1">Number of Singles from your Ideal Match Pool in the surrounding {metroShort} metro area likely to be interested in you based on your own reported stats</p>
        </div>
      </div>
    </section>
  );
}

// ── Market Coaching ──

function humanizeBottleneck(
  stageName: string,
  lostPct: number,
  lostCount: number,
  metro: string,
  gender: string | undefined,
): { title: string; description: string; action: string } {
  const pctStr = Math.round(lostPct);
  const countStr = lostCount.toLocaleString();
  const seeking = gender === 'Woman' ? 'men' : 'women';

  // Has kids: No / Yes / Open to either
  if (/^Has kids:/i.test(stageName)) {
    const val = stageName.replace(/^Has kids:\s*/i, '').trim();
    if (/no/i.test(val)) {
      return {
        title: 'You Want a Partner Without Children',
        description: `Requiring a childless partner removes ${pctStr}% of your remaining pool — that's ${countStr} people in ${metro}. As singles move into their 30s and beyond, a growing majority already have children. This preference is one of the most common pool-shrinking filters in the dating market.`,
        action: 'Ask yourself whether this is a firm boundary or a preference. If you\'d consider dating a great partner who happened to have kids, relaxing this single filter could dramatically expand your options. If it\'s non-negotiable, that\'s valid — but be aware you\'ll need to compensate with flexibility elsewhere.',
      };
    }
    if (/yes/i.test(val)) {
      return {
        title: 'You Prefer Partners Who Already Have Children',
        description: `Filtering for partners who have kids removes ${pctStr}% of your pool (${countStr} people). Younger singles are less likely to have children, so this filter becomes more costly in younger age brackets.`,
        action: 'If you\'re looking for someone who understands parenting, that\'s a meaningful compatibility signal. Consider whether "open to either" might serve the same goal without cutting as many people.',
      };
    }
    return {
      title: 'Your Preference on Partner\'s Children',
      description: `Your children preference removes ${pctStr}% of your pool (${countStr} people) in ${metro}.`,
      action: 'Consider whether this reflects a core value or a soft preference. Even small flexibility here can meaningfully expand your match pool.',
    };
  }

  // Wants kids: No / Yes
  if (/^Wants kids:/i.test(stageName)) {
    const val = stageName.replace(/^Wants kids:\s*/i, '').trim();
    if (/no/i.test(val)) {
      return {
        title: 'You Want a Partner Who Doesn\'t Want Children',
        description: `This removes ${pctStr}% of your remaining pool (${countStr} people). The majority of singles under 40 say they want children eventually, which makes this a significant filter — especially in family-oriented metros like ${metro}.`,
        action: 'If you know you don\'t want kids, finding a partner who shares that conviction is important for long-term compatibility. This is worth keeping if it\'s a core life decision, but be honest with yourself about whether it\'s settled or still evolving.',
      };
    }
    return {
      title: 'You Want a Partner Who Wants Children',
      description: `Filtering for partners who want children removes ${pctStr}% of your pool (${countStr} people). In older age brackets, more singles have either completed their families or decided against children, making this filter increasingly costly with age.`,
      action: 'This is one of the most important long-term compatibility factors. Keep it — but if your timeline is flexible, widening your age range slightly can offset the pool reduction.',
    };
  }

  // Smoking: No / Yes
  if (/^Smoking:/i.test(stageName)) {
    const val = stageName.replace(/^Smoking:\s*/i, '').trim();
    if (/no/i.test(val)) {
      return {
        title: 'You Require a Non-Smoking Partner',
        description: `Excluding smokers removes ${pctStr}% of your pool (${countStr} people) in ${metro}. Smoking rates vary significantly by region — in some metros this is barely noticeable, but in areas with higher smoking prevalence it can be a meaningful cut.`,
        action: `In ${metro}, this filter costs you ${countStr} potential matches. For most people, non-smoking is a reasonable health and lifestyle boundary. If it's removing more than 15% of your pool, you're in a higher-smoking metro — but this is usually worth keeping.`,
      };
    }
    return {
      title: 'Your Smoking Preference Is Narrowing Your Pool',
      description: `Your smoking preference removes ${pctStr}% of your pool (${countStr} people). The majority of the dating population doesn't smoke, so requiring a smoker significantly limits your options.`,
      action: 'If smoking compatibility matters to you, consider broadening to "open to either" — you\'ll still encounter smokers but won\'t exclude non-smokers.',
    };
  }

  // Height ≥ X
  if (/^Height/i.test(stageName)) {
    const heightVal = stageName.replace(/^Height[^0-9]*/i, '').trim();
    return {
      title: 'Your Minimum Height Preference Is Filtering Heavily',
      description: `Requiring a partner ${heightVal} or taller eliminates ${pctStr}% of the remaining ${seeking} in your pool — ${countStr} people gone from one preference alone. Height follows a bell curve: each additional inch above average cuts the eligible pool roughly in half.`,
      action: `Dropping your minimum by just 1-2 inches could recover thousands of potential matches. Many people find that in person, a partner slightly below their "ideal" height is a non-issue. If height is truly important to you, keep it — but recognize this is one of your most expensive filters.`,
    };
  }

  // Body type: X, Y
  if (/^Body type:/i.test(stageName)) {
    const types = stageName.replace(/^Body type:\s*/i, '').trim();
    return {
      title: 'Your Body Type Preferences Are Narrowing Your Pool',
      description: `Filtering for "${types}" body types removes ${pctStr}% of your remaining pool (${countStr} people). Body type preferences tend to compound with height and fitness filters — together, these physical preferences can eliminate the vast majority of otherwise compatible matches.`,
      action: `Consider whether you're stacking physical filters. If you're also filtering on height and fitness level, the combined effect is much larger than any single filter suggests. Try keeping your strongest physical preference and relaxing the others — you may find that fitness level is a better proxy for what you actually care about than a self-reported body type label.`,
    };
  }

  // Fitness: X
  if (/^Fitness:/i.test(stageName)) {
    const levels = stageName.replace(/^Fitness:\s*/i, '').trim();
    return {
      title: 'Your Fitness Level Preference Is Costly',
      description: `Requiring "${levels}" fitness removes ${pctStr}% of your pool (${countStr} people). Only a minority of adults exercise at high frequency, and self-reported fitness levels tend to be optimistic — meaning the real pool of people who meet this standard is even smaller than the data suggests.`,
      action: 'Fitness matters for lifestyle compatibility, but consider whether you need a gym partner or simply someone who takes care of themselves. Broadening from "daily" to "a few times a week" or accepting one tier lower can significantly expand your options without compromising on an active lifestyle.',
    };
  }

  // Political: X, Y
  if (/^Political:/i.test(stageName)) {
    const views = stageName.replace(/^Political:\s*/i, '').trim();
    return {
      title: 'Your Political Compatibility Filter Is Expensive',
      description: `Filtering for "${views}" political views removes ${pctStr}% of your pool (${countStr} people) in ${metro}. Political demographics vary dramatically by metro — this filter could cost you 10% in one city and 60% in another.`,
      action: `In ${metro}, this preference eliminates ${countStr} people. If political alignment is essential for your relationship satisfaction, keep it. But if you'd be happy with someone who's politically moderate or simply not strongly opposed to your views, broadening this filter is one of the easiest ways to grow your pool.`,
    };
  }

  // Age X-Y
  if (/^Age \d/i.test(stageName)) {
    const range = stageName.replace(/^Age\s*/i, '').trim();
    return {
      title: 'Your Age Range Is Limiting Your Options',
      description: `Your preferred age range of ${range} removes ${pctStr}% of eligible singles (${countStr} people). Narrow age windows — especially ranges of 5 years or less — are one of the biggest hidden pool killers because they cut across every other filter you've set.`,
      action: 'Widening your age range by even 2-3 years on either end can recover a significant number of matches. Research consistently shows that age-gap relationships of 5-7 years report similar satisfaction levels to same-age relationships. The "right" person might be just outside your current window.',
    };
  }

  // Income ≥ $X
  if (/^Income/i.test(stageName)) {
    const threshold = stageName.replace(/^Income[^$]*/i, '').trim();
    return {
      title: 'Your Income Requirement Is a Major Filter',
      description: `Requiring a partner earning ${threshold} or more eliminates ${pctStr}% of your pool (${countStr} people). Income distribution is heavily skewed — each step up the income ladder removes a disproportionately large share of people because far fewer earn above each threshold.`,
      action: `Consider what income actually represents to you: financial stability, ambition, lifestyle compatibility? Someone earning slightly below your threshold may check all those boxes. Lowering your minimum by 15-20% could double or triple the number of people who pass this filter, because of how income distribution works at higher levels.`,
    };
  }

  // Fallback for any unrecognized stage
  const cleanName = stageName.replace(/:\s*.*$/, '').trim();
  return {
    title: `Your "${cleanName}" Preference Is Reducing Your Pool`,
    description: `This preference removes ${pctStr}% of your remaining matches (${countStr} people) in ${metro}. Every filter you add compounds with the others, so even moderate individual cuts create large combined reductions.`,
    action: 'Rank your preferences by importance. Keep your top 2-3 non-negotiables firm and consider adding flexibility to the rest. Small concessions on lower-priority preferences often recover more matches than you\'d expect.',
  };
}

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

  // ── Weakest Relate Score component ──
  const weakest = compEntries[0];
  if (weakest && weakest.local < 40) {
    const pct = Math.round(weakest.local);
    const weightPct = Math.round(weakest.weight * 100);
    const genderLabel = demographics.gender === 'Woman' ? 'women' : 'men';
    const coaching: Record<string, { title: string; desc: string; action: string }> = {
      income: {
        title: 'Your Income Is Limiting Your Competitiveness',
        desc: `Your income puts you in the bottom ${pct}% of ${genderLabel} in ${metro}. Income carries ${weightPct}% of your overall Relate Score weight — meaning it's one of the strongest factors determining how competitive you are in this market. In practical terms, this means a significant share of potential matches who filter by income will never see your profile.`,
        action: `Even a modest income increase can move your score meaningfully because the weight is so high (${weightPct}%). Concrete paths: negotiate a raise or promotion, pursue a professional certification that unlocks higher pay, or develop a side income stream. A 20% income increase in ${metro} could move your score by 5-10 points. Long-term, investing in earning power is the single highest-leverage move you can make for your dating market position.`,
      },
      education: {
        title: 'Your Education Level Is Below the Local Average',
        desc: `Your education ranks in the bottom ${pct}% of ${genderLabel} in ${metro}. Education affects your Relate Score because it correlates with the pool of people you're likely to meet and match with — higher-education metros tend to filter heavily on credentials, even unconsciously.`,
        action: 'The good news is education is improvable. Professional certifications, online degrees from accredited programs, or specialized skill-based credentials can all shift your percentile. Even a single credential upgrade (e.g., associate\'s to bachelor\'s, or adding a professional cert) can meaningfully change how you\'re perceived in the dating market. Focus on credentials that also boost your income — that way you improve two score components at once.',
      },
      age: {
        title: 'Age Is Working Against You in This Market',
        desc: `Your age competitiveness score is ${pct} out of 100 in ${metro}. This doesn't mean your age is "wrong" — it means the singles you're seeking tend to prefer a different age range than yours. The dating market has well-documented age preferences, and your current position means you're competing against a larger pool of people in a more preferred age bracket.`,
        action: 'Age is the one factor you can\'t change, but you can offset it by excelling in areas you control. Fitness and physical presentation become more important as age works against you — staying in strong physical shape can effectively "subtract" years from how competitive you are. Income and emotional maturity are also areas where age can become an advantage if you invest in them. Focus on being the most compelling version of yourself in the areas that are within your control.',
      },
      children: {
        title: 'Having Children Is Narrowing Your Dating Pool',
        desc: `Being a parent places you in a more competitive segment of the ${metro} dating market. Many singles — particularly those without children of their own — prefer partners without existing kids. This isn't a reflection of your worth as a parent; it's a market reality that affects how many people will consider you as a potential match.`,
        action: 'Rather than hiding this part of your life, lead with it authentically. Singles who are open to partners with children tend to value maturity, stability, and family orientation — qualities you can highlight. On dating profiles, showing (not just telling) that your life is full and well-managed is more effective than downplaying your kids. Also consider that your best matches may be other parents — shared parenting experience creates immediate common ground and mutual understanding.',
      },
      ethnicity: {
        title: 'Your Demographic Profile Is Highly Competitive Here',
        desc: `Your ethnicity competitiveness score is ${pct} in ${metro}. This reflects documented preference patterns in the local dating market — certain demographic groups face more competition for matches in specific metros based on population ratios and stated preferences. ${national && national.relateScore > score.score + 5 ? `Nationally, your score jumps to ${national.relateScore} (vs. ${score.score} locally), meaning your demographic is significantly more competitive in other markets.` : ''}`,
        action: national && national.relateScore > score.score + 5
          ? `Geography is working against you here. Your national Relate Score of ${national.relateScore} vs. your local score of ${score.score} tells you that other metros would give you a structural advantage. If relocation is on the table, research metros where the demographic composition works more in your favor. In the meantime, focus on the factors you control — income, fitness, and genuine charisma go a long way in any market.`
          : 'Focus on maximizing the factors within your control: income, fitness, style, and emotional intelligence. People who score lower on demographic competitiveness but higher on personal development factors often outperform their "expected" match rate. Invest in being genuinely interesting — hobbies, travel, skills, and social proof all help differentiate you in a competitive market.',
      },
    };
    const c = coaching[weakest.name];
    if (c) insights.push({ priority: 'high', title: c.title, description: c.desc, action: c.action });
  }

  // ── Strongest component ──
  const strongest = compEntries[compEntries.length - 1];
  if (strongest && strongest.local >= 70) {
    const topPct = Math.round(100 - strongest.local);
    const nameLabel = strongest.name.charAt(0).toUpperCase() + strongest.name.slice(1);
    insights.push({
      priority: 'low',
      title: `${nameLabel} Is Your Strongest Market Advantage`,
      description: `Your ${strongest.name} ranks in the top ${topPct}% of singles in ${metro}. This is the component pulling your Relate Score up the most — it's what makes you competitive against others in your market. Potential matches who value ${strongest.name} will find you disproportionately attractive compared to the local average.`,
      action: `Make this visible. Your dating profile, first-date conversations, and overall presentation should reflect this strength. If ${strongest.name} is your edge, don't be modest about it — let it do the work for you. People tend to underplay their strongest assets; lean into yours.`,
    });
  }

  // ── Funnel bottlenecks (humanized) ──
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
    const h = humanizeBottleneck(drops[0].stageName, drops[0].lostPct, drops[0].lostCount, metro, demographics.gender);
    insights.push({ priority: 'high', title: h.title, description: h.description, action: h.action });
  }
  if (drops[1] && drops[1].lostPct > 25) {
    const h = humanizeBottleneck(drops[1].stageName, drops[1].lostPct, drops[1].lostCount, metro, demographics.gender);
    insights.push({ priority: 'medium', title: h.title, description: h.description, action: h.action });
  }

  // ── Selectivity ──
  if (pool.localSinglePool > 0 && pool.idealPool > 0) {
    const pct = (pool.idealPool / pool.localSinglePool) * 100;
    if (pct < 1) {
      const idealStr = pool.idealPool.toLocaleString();
      const totalStr = pool.localSinglePool.toLocaleString();
      insights.push({
        priority: 'high',
        title: 'Your Combined Preferences Filter Out Over 99% of Singles',
        description: `After applying all your preferences, only ${idealStr} of ${totalStr} eligible singles in ${metro} remain — less than 1%. Each individual filter may seem reasonable on its own, but stacked together they create an extremely narrow funnel. This means you're not just being selective on one dimension; the compound effect of all your preferences is working against you.`,
        action: 'You don\'t need to lower your standards across the board. Instead, identify your 2-3 true dealbreakers and hold firm on those while adding flexibility everywhere else. Look at your funnel breakdown to see which filters are doing the most damage — often, loosening just one or two secondary preferences can move you from dozens of potential matches to hundreds.',
      });
    }
  }

  // ── Match probability ──
  if (prob && prob.rate < 0.05) {
    insights.push({
      priority: 'medium',
      title: 'Your Mutual Match Probability Is Below 5%',
      description: `Of the people who meet all your criteria, only ${prob.percentage} would also find you competitive enough to match with. This is the "two-way" problem: it's not enough to want them — they have to want you back. A low mutual match rate usually means there's a gap between the caliber of partner you're seeking and your current market competitiveness.`,
      action: 'There are two levers here: make yourself more competitive (improve your Relate Score by raising income, fitness, or presentation) or widen your preferences so you\'re fishing in a pool where you\'re more competitive. A 10-point Relate Score improvement can nearly double your match probability because you move up in the ranking of everyone\'s potential matches. Focus on your weakest score component — that\'s where improvement has the highest return.',
    });
  }

  // ── Geographic opportunity ──
  if (national && national.matchCount > matchCount * 3 && matchCount < 100) {
    insights.push({
      priority: 'low',
      title: 'Your Dating Market Is Significantly Better in Other Cities',
      description: `Nationally, your estimated match count jumps to ${national.matchCount.toLocaleString()} compared to just ${matchCount.toLocaleString()} in ${metro}. That's a ${Math.round(national.matchCount / Math.max(matchCount, 1))}x difference. This gap means the local population composition — age distribution, income levels, political leanings, and demographic mix — is working against your specific preference profile.`,
      action: `If you have any flexibility on location, this is worth exploring seriously. Research metros where the demographics align better with what you're looking for. You don't necessarily need to move permanently — even expanding your search radius to nearby metros, or being open to long-distance for the right person, could dramatically change your odds. With only ${matchCount.toLocaleString()} estimated local matches, geography may be your single biggest constraint.`,
    });
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
