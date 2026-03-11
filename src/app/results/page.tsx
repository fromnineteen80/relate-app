'use client';

import { Component, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { type PricingTier } from '@/lib/config';
import { fetchPaymentTier } from '@/lib/payments';
import { generateReferrals, Referral } from '@/lib/referrals';
import { useAuth } from '@/lib/auth-context';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';
import { Icon } from '@/components/Icon';
import { loadAndHydrateProgress } from '@/lib/supabase/progress';
import { getProfile } from '@/lib/onboarding';
import { getSupabase } from '@/lib/supabase/client';
import { buildMarketRequestBody } from '@/lib/market-request';
import type { MarketData, Demographics } from '@/components/MarketComponents';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Dynamically import heavy market visualization components (code-split)
const DatingPoolGridCard = dynamic(() => import('@/components/MarketComponents').then(m => ({ default: m.DatingPoolGridCard })), { ssr: false });
const TopMetrosScatterPlot = dynamic(() => import('@/components/MarketComponents').then(m => ({ default: m.TopMetrosScatterPlot })), { ssr: false });
const DatingMarketViz = dynamic(() => import('@/components/MarketComponents').then(m => ({ default: m.DatingMarketViz })), { ssr: false });
const CompetitivenessBreakdown = dynamic(() => import('@/components/MarketComponents').then(m => ({ default: m.CompetitivenessBreakdown })), { ssr: false });
const MarketCoaching = dynamic(() => import('@/components/MarketComponents').then(m => ({ default: m.MarketCoaching })), { ssr: false });


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
            <p className="explainer mb-4">{this.state.error.message}</p>
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

// Explain when a match ranks higher/lower than its tier suggests
function rankingNote(match: any, allMatches: any[]): string | null {
  const TIER_EXPECT: Record<string, number> = { ideal: 1, kismet: 2, effort: 3, longShot: 4, atRisk: 5, incompatible: 6 };
  const tierRank = TIER_EXPECT[match.tier] || 6;
  // Find highest-tier match that ranks below this one
  const higherTierBelow = allMatches.find((m: any) => m.rank > match.rank && (TIER_EXPECT[m.tier] || 6) < tierRank);
  // Find lower-tier match that ranks above this one
  const lowerTierAbove = allMatches.find((m: any) => m.rank < match.rank && (TIER_EXPECT[m.tier] || 6) > tierRank);

  if (lowerTierAbove && match.rank <= 5) {
    // This match is outranked by a lower-tier match
    const strongest = match.subScores
      ? Object.entries(match.subScores as Record<string, number>)
          .filter(([k]) => k !== 'tier')
          .sort((a, b) => b[1] - a[1])[0]
      : null;
    if (strongest && strongest[1] >= 65) {
      const labels: Record<string, string> = { preference: 'preference alignment', dimension: 'behavioral match', intimacy: 'intimacy alignment', conflict: 'conflict compatibility' };
      return `Ranked by overall score. Strong ${labels[strongest[0]] || strongest[0]}.`;
    }
  }
  if (higherTierBelow && match.rank <= 5) {
    return `Ranked by overall compatibility across all dimensions.`;
  }
  return null;
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
  const [matchesExpanded, setMatchesExpanded] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [partnerPersonaName, setPartnerPersonaName] = useState<string | null>(null);
  const [partnerAssessmentComplete, setPartnerAssessmentComplete] = useState(false);
  const [partnerHasResults, setPartnerHasResults] = useState(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null);
  const [partnerProfilePhoto, setPartnerProfilePhoto] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const marketFetchedRef = useRef(false);
  const [topMetros, setTopMetros] = useState<any[] | null>(null);
  const [topMetrosInfo, setTopMetrosInfo] = useState<{ totalCompetitive: number; homeMetroRank: number | null; homeCbsa: string | null; effectiveMinScore: number } | null>(null);
  const topMetrosFetchedRef = useRef(false);
  const [worstMetros, setWorstMetros] = useState<any[] | null>(null);
  const worstMetrosFetchedRef = useRef(false);

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

  // Load payment tier, partner info, and market data in parallel
  useEffect(() => {
    if (!user) return;

    // Sync localStorage state immediately (non-blocking)
    const savedPartner = localStorage.getItem('relate_partner_email') || localStorage.getItem('relate_partner_results');
    if (savedPartner) setHasPartner(true);
    const savedDiscount = localStorage.getItem('relate_couples_discount');
    if (savedDiscount) setHasCouplesAccess(true);
    setUserProfilePhoto(localStorage.getItem('relate_profile_photo'));
    setPartnerProfilePhoto(localStorage.getItem('relate_partner_photo'));
    const profile = getProfile();
    if (profile?.firstName) setUserFullName(`${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`);

    // Fire all network requests in parallel
    const paymentPromise = fetchPaymentTier(user.email).then(({ tier }) => {
      setPricingTier(tier);
      if (tier === 'couples') setHasCouplesAccess(true);
    });

    const partnerPromise = fetch(`/api/partner-lookup?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.partner) {
          setHasPartner(true);
          const name = data.partner.firstName
            ? `${data.partner.firstName}${data.partner.lastName ? ` ${data.partner.lastName}` : ''}`
            : data.partner.email;
          setPartnerName(name);
          if (data.partner.personaName) setPartnerPersonaName(data.partner.personaName);
          if (data.partner.assessmentComplete) setPartnerAssessmentComplete(true);
          if (data.partner.hasResults) setPartnerHasResults(true);
          if (data.partner.photoUrl) {
            setPartnerProfilePhoto(data.partner.photoUrl);
            localStorage.setItem('relate_partner_photo', data.partner.photoUrl);
          }
          localStorage.setItem('relate_partner_email', data.partner.email);
          if (data.partner.gender) localStorage.setItem('relate_partner_gender', data.partner.gender);
          if (data.partner.results) {
            localStorage.setItem('relate_partner_results', JSON.stringify(data.partner.results));
          }
        }
      })
      .catch(() => { });

    // Fetch all market data in a single bundled request (demographics + top/worst metros)
    // This eliminates 3 sequential round-trips and shares data initialization server-side
    let marketPromise: Promise<void> = Promise.resolve();
    if (!marketFetchedRef.current) {
      const req = buildMarketRequestBody(user.id);
      if (req) {
        // Use cached market data if demographics unchanged and cache is < 5 min old
        const cached = localStorage.getItem('relate_market_bundle');
        const cachedDemoSnap = localStorage.getItem('relate_market_demo_snapshot');
        const cachedAt = parseInt(localStorage.getItem('relate_market_cached_at') || '0', 10);
        const cacheAge = Date.now() - cachedAt;
        if (cached && cachedDemoSnap === req.demoStr && cacheAge < 5 * 60 * 1000) {
          try {
            const bundle = JSON.parse(cached);
            setMarketData(bundle.market);
            if (bundle.topMetros) {
              setTopMetros(bundle.topMetros.metros);
              setTopMetrosInfo({ totalCompetitive: bundle.topMetros.totalCompetitive, homeMetroRank: bundle.topMetros.homeMetroRank, homeCbsa: bundle.topMetros.homeCbsa, effectiveMinScore: bundle.topMetros.effectiveMinScore });
              topMetrosFetchedRef.current = true;
            }
            if (bundle.worstMetros) {
              setWorstMetros(bundle.worstMetros);
              worstMetrosFetchedRef.current = true;
            }
            marketFetchedRef.current = true;
          } catch { /* refetch below */ }
        }

        if (!marketFetchedRef.current) {
          marketFetchedRef.current = true;
          topMetrosFetchedRef.current = true;
          worstMetrosFetchedRef.current = true;
          setMarketLoading(true);
          marketPromise = fetch('/api/market-bundle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...req.body, includeTopMetros: true, includeWorstMetros: true }),
          })
            .then(r => r.json())
            .then(data => {
              if (data.success) {
                const md: MarketData = { location: data.location, relateScore: data.relateScore, matchPool: data.matchPool, matchProbability: data.matchProbability, matchCount: data.matchCount, stateComparison: data.stateComparison, nationalComparison: data.nationalComparison };
                setMarketData(md);
                if (data.topMetros) {
                  setTopMetros(data.topMetros.metros);
                  setTopMetrosInfo({ totalCompetitive: data.topMetros.totalCompetitive, homeMetroRank: data.topMetros.homeMetroRank, homeCbsa: data.topMetros.homeCbsa, effectiveMinScore: data.topMetros.effectiveMinScore });
                }
                if (data.worstMetros) {
                  setWorstMetros(data.worstMetros);
                }
                // Cache the full bundle for 5 minutes
                const bundle = { market: md, topMetros: data.topMetros, worstMetros: data.worstMetros };
                localStorage.setItem('relate_market_bundle', JSON.stringify(bundle));
                localStorage.setItem('relate_market_demo_snapshot', req.demoStr);
                localStorage.setItem('relate_market_cached_at', String(Date.now()));
              }
            })
            .catch(() => { })
            .finally(() => setMarketLoading(false));
        }
      }
    }

    // All requests run concurrently
    Promise.allSettled([paymentPromise, partnerPromise, marketPromise]);
  }, [user]);

  // Recalculate market data after adjusting a preference
  const recalculateMarket = useCallback(async (prefKey: string, value: any) => {
    if (!user) return;
    const demoStr = localStorage.getItem('relate_demographics');
    if (!demoStr) return;
    let demo: Record<string, any>;
    try { demo = JSON.parse(demoStr); } catch { return; }

    // Normalize key to the DB format used in localStorage
    const dbKeyMap: Record<string, string> = {
      prefHeightMin: 'pref_height_min', prefBodyTypes: 'pref_body_types', prefFitnessLevels: 'pref_fitness_levels',
      prefPolitical: 'pref_political', prefHasKids: 'pref_has_kids', prefWantKids: 'pref_want_kids',
      prefSmoking: 'pref_smoking', prefEthnicities: 'pref_ethnicities', prefEducation: 'pref_education_levels',
      prefIncomeMin: 'pref_income_min',
    };
    const dbKey = dbKeyMap[prefKey] || prefKey;
    demo[dbKey] = value;
    localStorage.setItem('relate_demographics', JSON.stringify(demo));

    // Update Supabase
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('users').update({ [dbKey]: value }).eq('id', user.id);
      }
    } catch { /* non-blocking */ }

    // Re-fetch all market data using bundled endpoint (reads updated localStorage)
    setMarketLoading(true);
    try {
      const req = buildMarketRequestBody(user.id);
      if (req) {
        const res = await fetch('/api/market-bundle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...req.body, includeTopMetros: true, includeWorstMetros: true }),
        });
        const data = await res.json();
        if (data.success) {
          const md: MarketData = { location: data.location, relateScore: data.relateScore, matchPool: data.matchPool, matchProbability: data.matchProbability, matchCount: data.matchCount, stateComparison: data.stateComparison, nationalComparison: data.nationalComparison };
          setMarketData(md);
          if (data.topMetros) {
            setTopMetros(data.topMetros.metros);
            setTopMetrosInfo({ totalCompetitive: data.topMetros.totalCompetitive, homeMetroRank: data.topMetros.homeMetroRank, homeCbsa: data.topMetros.homeCbsa, effectiveMinScore: data.topMetros.effectiveMinScore });
          }
          if (data.worstMetros) setWorstMetros(data.worstMetros);
          const bundle = { market: md, topMetros: data.topMetros, worstMetros: data.worstMetros };
          localStorage.setItem('relate_market_bundle', JSON.stringify(bundle));
          localStorage.setItem('relate_market_demo_snapshot', req.demoStr);
          localStorage.setItem('relate_market_cached_at', String(Date.now()));
        }
      }
    } catch { /* */ }
    setMarketLoading(false);
  }, [user]);

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

  const ic = report?.individualCompatibility;

  const sortedAttachmentMatches = useMemo(() => {
    if (!ic?.attachmentTiers) return [];
    const all: { style: string; score: number; tier: string; color: string; bg: string }[] = [];
    [
      { items: ic.attachmentTiers.bestMatches, tier: 'Best', color: 'text-success', bg: 'bg-success/10 border-success/30' },
      { items: ic.attachmentTiers.goodMatches, tier: 'Good', color: 'text-success', bg: 'bg-success/10 border-success/30' },
      { items: ic.attachmentTiers.workableMatches, tier: 'Workable', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
      { items: ic.attachmentTiers.riskyMatches, tier: 'Risky', color: 'text-danger/70', bg: 'bg-danger/5 border-danger/20' },
      { items: ic.attachmentTiers.avoidMatches, tier: 'Avoid', color: 'text-danger', bg: 'bg-danger/10 border-danger/30' },
    ].forEach(group => {
      if (Array.isArray(group.items)) {
        group.items.forEach((m: any) => all.push({ style: m.style, score: m.score, tier: group.tier, color: group.color, bg: group.bg }));
      }
    });
    return all.sort((a, b) => b.score - a.score);
  }, [ic?.attachmentTiers]);

  const sortedDriverMatches = useMemo(() => {
    if (!ic?.driverTiers) return [];
    const all: { driver: string; score: number; tier: string; color: string; bg: string }[] = [];
    [
      { items: ic.driverTiers.bestMatches, tier: 'Best', color: 'text-success', bg: 'bg-success/10 border-success/30' },
      { items: ic.driverTiers.goodMatches, tier: 'Good', color: 'text-success', bg: 'bg-success/10 border-success/30' },
      { items: ic.driverTiers.workableMatches, tier: 'Workable', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
      { items: ic.driverTiers.avoidMatches, tier: 'Avoid', color: 'text-danger', bg: 'bg-danger/10 border-danger/30' },
    ].forEach(group => {
      if (Array.isArray(group.items)) {
        group.items.forEach((m: any) => all.push({ driver: m.driver, score: m.score, tier: group.tier, color: group.color, bg: group.bg }));
      }
    });
    return all.sort((a, b) => b.score - a.score);
  }, [ic?.driverTiers]);

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  // Derived data
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
  const hasMarket = !!(marketData || marketLoading);
  const tensionStacks = report?.tensionStacks;
  const modifiers = report?.modifiers;
  const gottman = m4?.gottmanScreener || m4?.gottmanScores;

  let fullM3: any = null;
  let fullM4: any = null;
  try { fullM3 = JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result || null; } catch { /* */ }
  try { fullM4 = JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result || null; } catch { /* */ }

  // Sub-nav items, grouped
  const navItems = [
    { id: 'persona', label: 'Your Persona', show: !!persona || hasDimensions || !!m4Summary || !!(tensionStacks && Object.keys(tensionStacks).length > 0) },
    { id: 'know-your-market', label: 'Dating Market', show: hasMarket },
    { id: 'attachment', label: 'Attachment', show: !!ic?.attachment },
    { id: 'how-you-date', label: 'How You Date', show: matches.length > 0 || !!(ic?.attachmentTiers) || !!m3 || (hasResults && true) },
  ].filter(n => n.show);

  // Helper: render a single tension stack card by key
  function renderTensionStack(key: string, stack: any) {
    if (!stack || typeof stack !== 'object') return null;
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()).trim();

    // Internal Conflict Coherence: dedicated renderer
    if (key === 'internalConflictCoherence') {
      return (
        <section key={key} className="card mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
            <div className="min-w-0">
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">{label}</span>
              <h4 className="text-sm font-semibold mt-1">
                {stack.interpretation === 'coherent' ? 'Your conflict patterns are aligned' :
                 stack.interpretation === 'mostly-coherent' ? 'Mostly aligned with minor friction' :
                 stack.interpretation === 'mixed' ? 'Mixed signals in your conflict patterns' :
                 'Your conflict patterns are working against each other'}
              </h4>
            </div>
            {stack.coherenceScore >= 95 ? (
              <span className="text-xs px-2 py-0.5 rounded shrink-0 bg-success/10 text-success flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Fully Aligned
              </span>
            ) : (
              <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                stack.coherenceScore >= 80 ? 'bg-success/10 text-success' :
                stack.coherenceScore >= 60 ? 'bg-success/10 text-success' :
                stack.coherenceScore >= 40 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
              }`}>
                {stack.coherenceScore}/100
              </span>
            )}
          </div>
          {stack.summary && <p className="text-sm text-secondary mb-3">{stack.summary}</p>}
          {Array.isArray(stack.incoherences) && stack.incoherences.length > 0 && (
            <div className="mb-3">
              <span className="text-xs font-mono text-warning uppercase tracking-wider">Internal Friction</span>
              <div className="mt-2 space-y-3">
                {stack.incoherences.map((inc: any, i: number) => (
                  <div key={i} className="p-3 bg-warning/5 border border-warning/20 rounded">
                    <p className="text-sm font-medium mb-1">{inc.name}</p>
                    <p className="text-xs text-secondary mb-1">{inc.explanation}</p>
                    {inc.behavioral && <p className="text-xs text-secondary italic">{inc.behavioral}</p>}
                    {inc.resolution && (
                      <p className="text-xs text-success mt-1.5"><span className="font-medium">Path forward:</span> {inc.resolution}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(stack.coherences) && stack.coherences.length > 0 && (
            <div>
              <span className="text-xs font-mono text-success uppercase tracking-wider">Healthy Alignments</span>
              <ul className="bullet-list mt-2">
                {stack.coherences.map((coh: any, i: number) => (
                  <li key={i}>
                    {coh.note || coh.specific || coh.name || String(coh)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      );
    }

    // Vulnerability Profile: dedicated renderer
    if (key === 'vulnerabilityProfile') {
      return (
        <section key={key} className="card mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">{label}</span>
              {stack.armorName && <h4 className="text-sm font-semibold mt-1">{stack.armorName}</h4>}
            </div>
            {stack.vulnerabilityLevel && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                stack.vulnerabilityLevel === 'high' ? 'bg-success/10 text-success' :
                stack.vulnerabilityLevel === 'moderate' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
              }`}>
                {stack.vulnerabilityLevel} openness
              </span>
            )}
          </div>
          {stack.armorCore && <p className="text-sm text-secondary mb-3">{stack.armorCore}</p>}
          {stack.starterNarrative && <p className="text-sm mb-3">{stack.starterNarrative}</p>}
          {Array.isArray(stack.customizations) && stack.customizations.length > 0 && (
            <div className="mb-3">
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">Key Patterns</span>
              <ul className="bullet-list mt-1.5">
                {stack.customizations.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {stack.inRelationship && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.isArray(stack.inRelationship.costs) && stack.inRelationship.costs.length > 0 && (
                <div>
                  <span className="text-xs font-mono text-secondary uppercase tracking-wider">Risks</span>
                  <ul className="bullet-list mt-1.5">
                    {stack.inRelationship.costs.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {stack.repairPath && (
                <div>
                  <span className="text-xs font-mono text-secondary uppercase tracking-wider">Growth Path</span>
                  <ul className="bullet-list mt-1.5"><li>{stack.repairPath}</li></ul>
                </div>
              )}
            </div>
          )}
          {stack.shamePattern && (
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">Watch For</span>
              <ul className="bullet-list mt-1.5">
                <li><span className="font-medium">Trigger:</span> {stack.shamePattern.trigger}</li>
                <li><span className="font-medium">Internal message:</span> {stack.shamePattern.shameMessage}</li>
                <li><span className="font-medium">Your response:</span> {stack.shamePattern.behavioralResponse}</li>
                <li><span className="font-medium">Partner experiences:</span> {stack.shamePattern.partnerExperience}</li>
              </ul>
            </div>
          )}
        </section>
      );
    }

    // Generic renderer for all other tension stacks
    const tensionLevel = stack.tensionLevel || stack.riskLevel;
    return (
      <section key={key} className="card mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-xs font-mono text-secondary uppercase tracking-wider">{label}</span>
            {stack.patternName && <h4 className="text-sm font-semibold mt-1">{stack.patternName}</h4>}
          </div>
          {tensionLevel !== undefined && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
              tensionLevel === 'high' ? 'bg-danger/10 text-danger' :
              tensionLevel === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
            }`}>
              {tensionLevel}
            </span>
          )}
        </div>
        {stack.patternDescription && <p className="text-sm text-secondary mb-3">{stack.patternDescription}</p>}
        {stack.starterNarrative && <p className="text-sm mb-3">{stack.starterNarrative}</p>}
        {Array.isArray(stack.customizations) && stack.customizations.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-mono text-secondary uppercase tracking-wider">Key Patterns</span>
            <ul className="bullet-list mt-1.5">
              {stack.customizations.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.isArray(stack.risks) && stack.risks.length > 0 && (
            <div>
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">Risks</span>
              <ul className="bullet-list mt-1.5">
                {stack.risks.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {stack.growthPath && (
            <div>
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">Growth Path</span>
              {Array.isArray(stack.growthPath) ? (
                <ul className="bullet-list mt-1.5">
                  {stack.growthPath.map((g: string, i: number) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-secondary mt-1.5">{stack.growthPath}</p>
              )}
              <Link href="/growth" className="text-xs text-accent hover:underline mt-2 inline-block">
                Start your Growth Plan <Icon name="arrow_forward" size={12} />
              </Link>
            </div>
          )}
        </div>
        {stack.signals && typeof stack.signals === 'object' && !Array.isArray(stack.signals) && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs font-mono text-secondary uppercase tracking-wider">Watch For</span>
            <ul className="bullet-list mt-1.5">
              {Object.entries(stack.signals).map(([k, v]: [string, any]) => {
                if (v && typeof v === 'object' && v.interpretation) {
                  const interpValue = typeof v.interpretation === 'object'
                    ? Object.values(v.interpretation).find((x: any) => typeof x === 'string') || JSON.stringify(v.interpretation)
                    : v.interpretation;
                  return (
                    <li key={k}><span className="font-medium capitalize">{v.name || k.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}{interpValue as string}</li>
                  );
                }
                if (v && typeof v === 'object') {
                  return (
                    <li key={k}><span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}{v.value !== undefined ? String(v.value) : JSON.stringify(v)}</li>
                  );
                }
                return (
                  <li key={k}><span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(v)}</li>
                );
              })}
            </ul>
          </div>
        )}
        {Array.isArray(stack.signals) && stack.signals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs font-mono text-secondary uppercase tracking-wider">Watch For</span>
            <ul className="bullet-list mt-1.5">
              {stack.signals.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  }

  // Tension stack keys rendered explicitly (no generic rendering needed)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Sub-Navigation */}
      <SubNav items={navItems.map(n => ({ ...n, href: `#${n.id}` }))} />

      <main className="flex-1 max-w-3xl lg:max-w-6xl mx-auto px-6 pt-[37px] pb-8 w-full lg:columns-2 lg:gap-x-6 [&>*]:break-inside-avoid">
        <div className="flex items-baseline justify-between mb-[27px] lg:[column-span:all]">
          <h1 className="font-serif text-2xl font-semibold">Results</h1>
          {canDownload && (
            <button onClick={handleDownloadPDF} disabled={downloading} className="text-xs text-accent hover:underline">
              {downloading ? 'Preparing...' : 'Download PDF Report'}
            </button>
          )}
        </div>

        {/* ── Assessment Incomplete CTA ── */}
        {!hasResults && (
          <section className="card mb-6 text-center py-12 lg:[column-span:all]">
            <h3 className="font-serif text-lg font-semibold mb-2">Assessment Not Complete</h3>
            <p className="explainer mb-6 max-w-md mx-auto">
              Complete all five modules of your RELATE assessment to generate your persona, compatibility rankings, dating market analysis, and personalized coaching.
            </p>
            <Link href="/assessment" className="btn-primary text-sm inline-block">
              Continue Assessment
            </Link>
          </section>
        )}

        {/* ── Module 5 Upgrade Banner (for existing users with results but no M5) ── */}
        {hasResults && !report?.m5 && (
          <section className="card border-accent/30 bg-accent/5 mb-4 lg:[column-span:all]">
            <p className="font-serif font-semibold mb-1">Enhance Your Tension Stacks</p>
            <p className="text-sm text-secondary mb-3">
              Complete Module 5 to unlock more accurate vulnerability, desire, and internal alignment profiles. Takes about 5 minutes.
            </p>
            <Link href="/assessment/module-5" className="btn-primary text-sm inline-block">
              Take Module 5
            </Link>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            GROUP 1: PERSONA
        ══════════════════════════════════════════════════ */}
        {(persona || hasDimensions || m4Summary || tensionStacks) && (
          <div id="persona" className="scroll-mt-32 mb-2 lg:[column-span:all]">
            <div className="flex items-baseline gap-3 mb-4 mt-6">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">01</span>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">Your Persona</span>
            </div>
          </div>
        )}

        {/* ── Persona ── */}
        {persona && (
          <section className="card mb-4 scroll-mt-32">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">{persona.code && <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-accent text-white text-[7px] font-mono font-bold leading-none shrink-0"><span className="flex flex-col items-center gap-px"><span>{persona.code.slice(0,2)}</span><span>{persona.code.slice(2,4)}</span></span></span>}{persona.name}</h3>
              <Link href="/results/persona" className="text-xs text-accent hover:underline">View Details</Link>
            </div>
            {persona.traits && <p className="explainer mb-4">{persona.traits}</p>}
            {/* Dating Behavior */}
            {persona.datingBehavior?.length > 0 && (
              <div>
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Dating Behavior</span>
                <ul className="bullet-list mt-2">
                  {persona.datingBehavior.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths & Growth */}
            {(persona.mostAttractive?.length > 0 || persona.leastAttractive?.length > 0) && (
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
                {persona.mostAttractive?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-success uppercase tracking-wider">Most Attractive Qualities</span>
                    <ul className="bullet-list mt-2">
                      {persona.mostAttractive.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {persona.leastAttractive?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-warning uppercase tracking-wider">Growth Areas</span>
                    <ul className="bullet-list mt-2">
                      {persona.leastAttractive.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* In Relationships + Shadow Side */}
            {(persona.inRelationships?.length > 0 || persona.struggles?.length > 0) && (
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
                {persona.inRelationships?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-secondary uppercase tracking-wider">In Relationships</span>
                    <ul className="bullet-list mt-2">
                      {persona.inRelationships.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {persona.struggles?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-secondary uppercase tracking-wider">Shadow Side</span>
                    <ul className="bullet-list mt-2">
                      {persona.struggles.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Score Breakdown ── */}
        {hasDimensions && (() => {
          const dimOrder = ['physical', 'social', 'lifestyle', 'values'] as const;
          const isMale = report?.gender === 'M';
          const genderBarBase = isMale ? 'bg-rose-400' : 'bg-blue-500';
          const dimBarColor: Record<string, string> = { physical: `${genderBarBase}/80`, social: `${genderBarBase}/60`, lifestyle: `${genderBarBase}/40`, values: `${genderBarBase}/20` };
          // Dimensions come from M2/W2 (what you offer)
          const polePairs: Record<string, { A: string; B: string }> = isMale
            ? { physical: { A: 'Fitness', B: 'Maturity' }, social: { A: 'Leadership', B: 'Presence' }, lifestyle: { A: 'Adventure', B: 'Stability' }, values: { A: 'Traditional', B: 'Egalitarian' } }
            : { physical: { A: 'Beauty', B: 'Confidence' }, social: { A: 'Allure', B: 'Charm' }, lifestyle: { A: 'Thrill', B: 'Peace' }, values: { A: 'Traditional', B: 'Egalitarian' } };
          return (
          <section className="card mb-4 scroll-mt-32">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2"><Icon name="bar_chart" size={20} className={isMale ? 'text-rose-400' : 'text-blue-500'} />Persona Signatures</h3>
            <div className="space-y-3.5">
              {dimOrder.map((dim) => {
                const data = (dimensions as any)[dim];
                if (!data || typeof data !== 'object') return null;
                const strength = data.strength || Math.max(data.poleAScore || 50, data.poleBScore || 50);
                const pole = data.poleName || data.assignedPole || '-';
                const pair = polePairs[dim];
                const oppositePole = pair ? (pole === pair.A ? pair.B : pair.A) : '-';
                const balanced = strength < 40;
                const strong = strength >= 70;
                const pn = persona?.name || 'your persona';
                const youLabel = isMale ? 'man' : 'woman';
                const desc = (() => {
                  if (balanced) {
                    switch (dim) {
                      case 'physical': return `You score evenly between ${pair.A} and ${pair.B}. As a ${youLabel}, this means your physical presentation doesn't strongly favor either pole — you blend elements of both, which gives your ${pn} profile range rather than a single defining physical signal.`;
                      case 'social': return `Your social energy sits between ${pair.A} and ${pair.B}. As a ${youLabel}, you're not locked into one mode — you can draw on either depending on the setting, making your ${pn} profile socially versatile.`;
                      case 'lifestyle': return `You don't lean strongly toward ${pair.A} or ${pair.B}. As a ${youLabel}, your day-to-day rhythm is flexible, and your ${pn} identity is shaped more by other dimensions than by lifestyle polarity.`;
                      case 'values': return `You sit between ${pair.A} and ${pair.B} on partnership values. As a ${youLabel}, this gives your ${pn} profile flexibility in how you negotiate roles and structure relationships.`;
                      default: return `Balanced between ${pair.A} and ${pair.B}.`;
                    }
                  }
                  if (strong) {
                    switch (dim) {
                      case 'physical': return `You score strongly toward ${pole}, far from ${oppositePole}. As a ${youLabel}, this is a core physical signal — it's central to what makes you ${pn} and how potential partners perceive you at first glance.`;
                      case 'social': return `Clear ${pole} orientation, well away from ${oppositePole}. As a ${youLabel}, this defines how people experience you socially and is a signature trait of your ${pn} profile.`;
                      case 'lifestyle': return `Strong ${pole} drive, distinctly away from ${oppositePole}. As a ${youLabel}, this shapes your day-to-day energy and is a defining feature of your ${pn} lifestyle.`;
                      case 'values': return `Firmly ${pole}, far from ${oppositePole}. As a ${youLabel}, this anchors how your ${pn} profile approaches partnership structure and long-term compatibility.`;
                      default: return `Strong ${pole} lean, far from ${oppositePole}.`;
                    }
                  }
                  // moderate
                  switch (dim) {
                    case 'physical': return `You lean toward ${pole} over ${oppositePole}. As a ${youLabel}, you show elements of both but your ${pn} identity tilts this way — it's a noticeable tendency without being absolute.`;
                    case 'social': return `Moderate ${pole} lean with some ${oppositePole} flexibility. As a ${youLabel}, your social style is consistent with ${pn} but you can adapt when the setting calls for it.`;
                    case 'lifestyle': return `You favor ${pole} over ${oppositePole}, though you can flex. As a ${youLabel}, this gives your ${pn} profile a clear lifestyle direction without rigidity.`;
                    case 'values': return `Leaning ${pole} over ${oppositePole}. As a ${youLabel}, your ${pn} profile has a clear values orientation while leaving room to negotiate with a partner.`;
                    default: return `Moderate ${pole} lean over ${oppositePole}.`;
                  }
                })();
                return (
                  <div key={dim}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-secondary w-20 shrink-0 capitalize">{dim} <span className="normal-case text-secondary/60">({pair.A} / {pair.B})</span></span>
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full ${dimBarColor[dim]} rounded-full transition-all`} style={{ width: `${Math.min(100, strength)}%` }} />
                      </div>
                      <span className="font-mono text-xs text-secondary w-8 text-right">{Math.round(strength)}</span>
                    </div>
                    <p className="text-[11px] text-secondary/70 mt-1 ml-[92px] leading-snug">{desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
          );
        })()}

        {/* ── Vulnerability Profile ── */}
        {tensionStacks?.vulnerabilityProfile && renderTensionStack('vulnerabilityProfile', tensionStacks.vulnerabilityProfile)}

        {/* ── Attraction Attachment ── */}
        {tensionStacks?.attractionAttachment && renderTensionStack('attractionAttachment', tensionStacks.attractionAttachment)}

        {/* ── Conflict Profile ── */}
        {m4Summary && (
          <section className="card mb-4 scroll-mt-32">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><Icon name="bolt" size={20} className="text-accent" />Conflict Profile</h3>
            <p className="text-sm text-secondary mb-5">How you engage in conflict, what drives your emotional reactions, and how you recover afterward.</p>
            <div className="space-y-4 mb-4">
              {(() => {
                const CONFLICT_DESCRIPTIONS: Record<string, Record<string, string>> = {
                  approach: {
                    pursue: 'You move toward conflict. You need resolution, engagement, and verbal confirmation that things are okay before you can rest.',
                    withdraw: 'You move away from conflict. You need space and time to process internally before you can engage productively.',
                  },
                  primaryDriver: {
                    abandonment: 'Your deepest fear in conflict is being left. Unresolved tension feels like the relationship itself is at risk.',
                    engulfment: 'Your deepest fear in conflict is losing yourself. You pull back when closeness starts to feel like control.',
                    inadequacy: 'Your deepest fear in conflict is not being enough. Criticism lands as confirmation of a deeper insecurity.',
                    injustice: 'Your deepest fear in conflict is unfairness. You track the scorecard and need to know the scales are balanced.',
                  },
                  repairSpeed: {
                    'Quick Repair': 'You need to resolve things immediately. Unresolved conflict creates physical discomfort you can\'t sit with.',
                    'Slow Repair': 'You need time before reconnecting. Premature repair attempts feel forced and inauthentic.',
                  },
                  repairMode: {
                    'Verbal Repair': 'You repair through conversation. You need to talk through what happened, understand, and be understood.',
                    'Physical Repair': 'You repair through presence and touch. A hug or sitting close says more than words after a fight.',
                  },
                  capacity: {
                    'High Capacity': 'You can hold significant emotional intensity before flooding. You stay regulated longer under stress than most.',
                    'Medium Capacity': 'You have average tolerance for emotional intensity. You benefit from breaks but return and re-engage.',
                    'Low Capacity': 'You flood quickly during conflict. You need structured breaks and a partner who understands that\'s self-regulation, not avoidance.',
                  },
                };
                const items: [string, string, string][] = [
                  ['Approach', m4Summary.approach, CONFLICT_DESCRIPTIONS.approach[m4Summary.approach] || ''],
                  ['Primary Driver', m4Summary.primaryDriver, CONFLICT_DESCRIPTIONS.primaryDriver[m4Summary.primaryDriver] || ''],
                  ['Repair Speed', m4Summary.repairSpeed, CONFLICT_DESCRIPTIONS.repairSpeed[m4Summary.repairSpeed] || ''],
                  ['Repair Mode', m4Summary.repairMode, CONFLICT_DESCRIPTIONS.repairMode[m4Summary.repairMode] || ''],
                  ['Capacity', m4Summary.capacity, CONFLICT_DESCRIPTIONS.capacity[m4Summary.capacity] || ''],
                ];
                return items.map(([label, val, desc]) => (
                  <div key={label}>
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs font-semibold capitalize">{(val as string) || '-'}</span>
                    </div>
                    {desc && <p className="text-xs text-secondary mb-2">{desc}</p>}
                  </div>
                ));
              })()}
            </div>

          </section>
        )}

        {/* ── Gottman Four Horsemen ── */}
        {gottman?.horsemen && Object.keys(gottman.horsemen).length > 0 && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="warning" size={20} className="text-accent" />Gottman Four Horsemen</h3>
            <p className="explainer mb-4">
              The four communication patterns researcher John Gottman identified as the strongest predictors of relationship failure. Lower scores are better.
            </p>
            {gottman.overallRisk && (
              <p className="text-xs text-secondary mb-3">
                Overall risk: <span className={`font-semibold ${gottman.overallRisk === 'high' ? 'text-danger' : gottman.overallRisk === 'medium' ? 'text-warning' : 'text-success'}`}>
                  {gottman.overallRisk}
                </span>
              </p>
            )}
            <div className="space-y-4">
              {Object.entries(gottman.horsemen).map(([name, data]: [string, any]) => {
                if (!data) return null;
                const rawScore = data.score ?? 4;
                const normalized = Math.round(((rawScore - 4) / 16) * 10);
                const pct = normalized * 10;
                const barColor = pct >= 63 ? 'bg-danger' : pct >= 32 ? 'bg-warning' : 'bg-success';
                const riskColor = pct >= 63 ? 'text-danger' : pct >= 32 ? 'text-warning' : 'text-success';
                const HORSEMAN_DESC: Record<string, string> = {
                  criticism: 'Attacking your partner\'s character instead of addressing a specific behavior.',
                  contempt: 'Expressing superiority or disgust through sarcasm, eye-rolling, or mockery.',
                  defensiveness: 'Deflecting responsibility by making excuses or counter-attacking.',
                  stonewalling: 'Shutting down and withdrawing from interaction entirely.',
                };
                return (
                  <div key={name}>
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <span className="text-sm font-medium capitalize">{name}</span>
                      <span className={`text-xs font-semibold ${riskColor}`}>{normalized}/10</span>
                    </div>
                    <p className="text-xs text-secondary mb-2">{HORSEMAN_DESC[name] || ''}</p>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.max(2, pct)}%` }} />
                    </div>
                    {data.antidote && (
                      <p className="text-xs text-secondary"><span className="font-medium">Antidote:</span> {data.antidote}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Internal Conflict Coherence ── */}
        {tensionStacks?.internalConflictCoherence && renderTensionStack('internalConflictCoherence', tensionStacks.internalConflictCoherence)}

        {/* ══════════════════════════════════════════════════
            GROUP 2: KNOW YOUR MARKET
        ══════════════════════════════════════════════════ */}
        {hasMarket && <hr className="border-border my-8 lg:[column-span:all]" />}
        {hasMarket && (
          <div id="know-your-market" className="scroll-mt-32 mb-2 lg:[column-span:all]">
            <div className="flex items-baseline gap-3 mb-4 mt-10">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">02</span>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">Dating Market</span>
            </div>
          </div>
        )}

        {/* ── Dating Market ── */}
        {hasMarket && (
          <div className="scroll-mt-32 w-full flex flex-col md:flex-row gap-4 items-stretch mb-4 lg:[column-span:all]">
            <div className="w-full md:w-1/2 min-w-0 flex flex-col gap-4">
              <DatingMarketViz data={marketData} loading={marketLoading} onRelaxPreference={recalculateMarket} demographics={demographics} />
            </div>
            {!marketLoading && marketData && (
              <div className="w-full md:w-1/2 min-w-0">
                <DatingPoolGridCard data={marketData} demographics={demographics} />
              </div>
            )}
          </div>
        )}

        {/* ── Top Metros Scatter Plot ── */}
        {topMetros && topMetros.length > 0 && (
          <TopMetrosScatterPlot metros={topMetros} worstMetros={worstMetros} demographics={demographics} marketData={marketData} topMetrosInfo={topMetrosInfo} />
        )}

        {/* ── What's Making You Competitive ── */}
        {marketData && marketData.relateScore && (
          <CompetitivenessBreakdown marketData={marketData} demographics={demographics} />
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

        {/* ── Market Data Sources Caveat ── */}
        {hasMarket && !marketLoading && marketData && (
          <p className="text-xs text-secondary text-center max-w-2xl mx-auto mb-6 lg:[column-span:all]">
            Demographic data sourced from public datasets provided by the U.S. Census Bureau, Centers for Disease Control and Prevention (CDC), and Pew Research Center. Segments of the population that are homeless or have committed felonies have been automatically excluded using local county and FBI data.
          </p>
        )}

        {/* ══════════════════════════════════════════════════
            GROUP 3: ATTACHMENT STYLE
        ══════════════════════════════════════════════════ */}
        {ic?.attachment && <hr className="border-border my-8 lg:[column-span:all]" />}
        {ic?.attachment && (
          <div id="attachment" className="scroll-mt-32 mb-2 lg:[column-span:all]">
            <div className="flex items-baseline gap-3 mb-4 mt-10">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">03</span>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">Attachment Style</span>
            </div>

          <section className="card mb-4 scroll-mt-32">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2"><Icon name="shield" size={20} className="text-accent" />Your Attachment Style</h3>
              {(() => {
                const hasReport = typeof window !== 'undefined' && localStorage.getItem('relate_attachment_results');
                return hasReport ? (
                  <Link href="/results/attachment" className="text-xs text-accent hover:underline font-medium whitespace-nowrap">
                    View Full Report <Icon name="arrow_forward" size={12} />
                  </Link>
                ) : (
                  <Link href="/attachment-style" className="text-xs text-secondary hover:text-accent transition-colors whitespace-nowrap">
                    Go deeper <Icon name="arrow_forward" size={12} />
                  </Link>
                );
              })()}
            </div>
            <p className="explainer mb-4">How you connect, protect, and respond in close relationships</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-lg font-semibold capitalize">{ic.attachment.style}</span>
              {ic.attachment.subtype && <span className="text-xs font-mono bg-stone-100 px-2 py-0.5 rounded capitalize">{ic.attachment.subtype}</span>}
              {ic.attachment.leaningToward && <span className="text-xs font-mono bg-stone-100 px-2 py-0.5 rounded">leaning {ic.attachment.leaningToward}</span>}
              <span className="text-xs font-mono text-secondary ml-auto">{Math.round((ic.attachment.confidence ?? 0) * 100)}% confidence</span>
            </div>
            {ic.attachment.description && <p className="explainer mb-4">{ic.attachment.description}</p>}
            {ic.attachment.strengths && Array.isArray(ic.attachment.strengths) && ic.attachment.strengths.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <span className="text-xs font-mono text-success uppercase tracking-wider">Strengths</span>
                  <ul className="bullet-list mt-2">
                    {ic.attachment.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                {ic.attachment.challenges && Array.isArray(ic.attachment.challenges) && ic.attachment.challenges.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-warning uppercase tracking-wider">Challenges</span>
                    <ul className="bullet-list mt-2">
                      {ic.attachment.challenges.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {ic.attachment.inRelationships && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">In Relationships</span>
                <p className="text-sm text-secondary mt-2">{ic.attachment.inRelationships}</p>
              </div>
            )}
            {ic.attachment.underStress && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Under Stress</span>
                <p className="text-sm text-secondary mt-2">{ic.attachment.underStress}</p>
              </div>
            )}
            {/* Attachment Style Insights */}
            {(() => {
              const bpRaw = typeof window !== 'undefined' ? localStorage.getItem('relate_attachment_results') : null;
              if (bpRaw) {
                try {
                  const bp = JSON.parse(bpRaw);
                  return (
                    <div className="mt-4 pt-4 border-t border-accent/30">
                      <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Attachment Style Insights</span>
                      <div className="mt-3 space-y-2">
                        {bp.q2?.patternName && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-secondary">Trigger Emotion</span>
                            <span className="text-xs font-medium">{bp.q2.patternName}</span>
                          </div>
                        )}
                        {bp.q3?.patternName && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-secondary">Decision Mode</span>
                            <span className="text-xs font-medium">{bp.q3.patternName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } catch { /* invalid JSON */ }
              }
              return null;
            })()}
          </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            GROUP 4: HOW YOU DATE
        ══════════════════════════════════════════════════ */}
        {(matches.length > 0 || ic?.attachmentTiers || m3 || hasResults) && <hr className="border-border my-8 lg:[column-span:all]" />}
        {(matches.length > 0 || ic?.attachmentTiers || m3 || hasResults) && (
          <div id="how-you-date" className="scroll-mt-32 mb-2 lg:[column-span:all]">
            <div className="flex items-baseline gap-3 mb-4 mt-10">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">04</span>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">How You Date</span>
            </div>
          </div>
        )}

        {/* ── Compatibility Rankings ── */}
        {matches.length > 0 && (
          <section className="card mb-4 scroll-mt-32">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2"><Icon name="leaderboard" size={20} className="text-accent" />Compatibility Rankings</h3>
              {hasPaid && <Link href="/results/matches" className="text-xs text-accent hover:underline">View all</Link>}
            </div>
            <div className="space-y-3">
              {(matchesExpanded ? visibleMatches : visibleMatches.slice(0, 5)).map((match: any) => (
                <div key={match.code} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-secondary">#{match.rank}</span>
                        {hasPaid ? (
                          <Link href={`/results/match/${match.code}`} className="text-sm font-semibold text-accent hover:underline">{match.name}</Link>
                        ) : <span className="text-sm font-semibold">{match.name}</span>}
                        <span className="font-mono text-xs text-secondary">{match.code}</span>
                      </div>
                      {match.traits && <p className="text-xs text-secondary mt-1">{match.traits.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',')}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-semibold block">{match.compatibilityScore}</span>
                      <span className={`text-xs font-medium ${tierColor(match.tier)}`}>{tierLabel(match.tier)}</span>
                      {(() => {
                        const note = rankingNote(match, visibleMatches);
                        return note ? <p className="text-[10px] text-secondary/60 mt-0.5 max-w-[120px] leading-tight ml-auto">{note}</p> : null;
                      })()}
                    </div>
                  </div>
                  {match.summary && <p className="text-sm text-secondary mt-2">{match.summary.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',')}</p>}
                </div>
              ))}
            </div>
            {visibleMatches.length > 5 && !matchesExpanded && (
              <button onClick={() => setMatchesExpanded(true)} className="text-xs text-accent hover:underline mt-3">
                Show all {visibleMatches.length} matches
              </button>
            )}
            {matchesExpanded && visibleMatches.length > 5 && (
              <button onClick={() => setMatchesExpanded(false)} className="text-xs text-accent hover:underline mt-3">
                Show top 5
              </button>
            )}
            {!hasPaid && matches.length > freeMatchLimit && (
              <div className="mt-4 card border-accent text-center">
                <p className="text-sm text-secondary mb-3">{matches.length - freeMatchLimit} more matches available with Plus</p>
                <div className="flex gap-2 justify-center">
                  <a href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary inline-block text-sm">Plus ($29.99/mo)</a>
                  <a href={`/api/checkout?product=premium&email=${encodeURIComponent(user?.email || '')}`} className="btn-primary inline-block text-sm">Premium ($49.99/mo)</a>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Ideal Partner Profile ── */}
        {ic?.attachmentTiers && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="person_search" size={20} className="text-accent" />Ideal Partner Profile</h3>
            <p className="explainer mb-4">The attachment styles, emotional drivers, and conflict behaviors that complement yours best</p>

            {/* Attachment Style */}
            <div className="mb-4">
              <span className="text-xs font-mono text-secondary uppercase tracking-wider">Partner Attachment Style</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {sortedAttachmentMatches.map((m, i) => (
                    <div key={i} className={`text-center px-3 py-2 rounded-lg border ${m.bg}`}>
                      <p className="text-sm font-medium capitalize">{m.style}</p>
                      <p className={`text-xs font-mono ${m.color}`}>{m.score}</p>
                    </div>
                  ))}
              </div>
              {ic.attachmentTiers.recommendation && <p className="text-sm text-secondary mt-3">{ic.attachmentTiers.recommendation}</p>}
            </div>

            {/* Emotional Driver */}
            {ic.driverTiers && (
              <div className="mb-4 pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Partner Emotional Driver</span>
                <p className="text-xs text-secondary mt-1 mb-3">Your primary: <span className="font-mono capitalize text-foreground">{ic.driverTiers.yourDriver?.primary || '-'}</span></p>
                <div className="flex flex-wrap gap-2">
                  {sortedDriverMatches.map((m, i) => (
                      <div key={i} className={`text-center px-3 py-2 rounded-lg border ${m.bg}`}>
                        <p className="text-sm font-medium capitalize">{m.driver}</p>
                        <p className={`text-xs font-mono ${m.color}`}>{m.score}</p>
                      </div>
                    ))}
                </div>
                {ic.driverTiers.recommendation && <p className="text-sm text-secondary mt-3">{ic.driverTiers.recommendation}</p>}
              </div>
            )}

            {/* Conflict Behavior */}
            {(ic.horsemenInsights || gottman) && (
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Partner Conflict Behavior</span>
                {ic.horsemenInsights?.urgent && (
                  <div className="mt-2 p-2 bg-danger/5 border border-danger/20 rounded text-xs text-danger">{ic.horsemenInsights.urgent}</div>
                )}
                {Array.isArray(ic.horsemenInsights?.lookFor) && ic.horsemenInsights.lookFor.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-mono text-success uppercase tracking-wider">Look for in a partner</span>
                    <ul className="bullet-list mt-2">
                      {ic.horsemenInsights.lookFor.map((item: any, i: number) => (
                        <li key={i}><span><span className="font-medium text-foreground">{item.partnerTrait}</span>: {item.reason}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(ic.horsemenInsights?.avoid) && ic.horsemenInsights.avoid.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-mono text-warning uppercase tracking-wider">Be cautious of</span>
                    <ul className="bullet-list mt-2">
                      {ic.horsemenInsights.avoid.map((item: any, i: number) => (
                        <li key={i}><span><span className="font-medium text-foreground">{item.partnerTrait}</span>: {item.reason}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                {!ic.horsemenInsights && gottman && (
                  <div className="mt-3">
                    <p className="text-sm text-secondary">
                      Based on your Gottman profile ({gottman.overallRisk || 'moderate'} risk), look for a partner
                      who demonstrates emotional regulation and constructive conflict habits.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Connection Style ── */}
        {m3 && (
          <section className="card mb-4 scroll-mt-32">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><Icon name="sync_alt" size={20} className="text-accent" />Connection Style</h3>
            <div className="grid grid-cols-3 gap-6 text-center mb-4">
              <div>
                <span className="font-mono text-lg font-semibold">{m3.wantScore ?? '-'}</span>
                <p className="text-xs text-secondary mt-1">Want Score</p>
              </div>
              <div>
                <span className="font-mono text-lg font-semibold">{m3.offerScore ?? '-'}</span>
                <p className="text-xs text-secondary mt-1">Offer Score</p>
              </div>
              <div>
                <span className="font-mono text-lg font-semibold">{m3.typeName ?? '-'}</span>
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
              <p className="explainer mb-4">{m3.typeDescription}</p>
            )}
            {m3.typeDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
                {m3.typeDetails.strengths?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-success uppercase tracking-wider">Strengths</span>
                    <ul className="bullet-list mt-2">
                      {m3.typeDetails.strengths.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {m3.typeDetails.challenges?.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-warning uppercase tracking-wider">Challenges</span>
                    <ul className="bullet-list mt-2">
                      {m3.typeDetails.challenges.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Erotic Dimension ── */}
        {tensionStacks?.eroticDimension && renderTensionStack('eroticDimension', tensionStacks.eroticDimension)}

        {/* ── Intimacy Under Stress ── */}
        {ic?.m3States?.states?.normal && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="local_fire_department" size={20} className="text-accent" />Intimacy Under Stress</h3>
            <p className="explainer mb-4">How your Want and Offer shift across relationship states</p>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-4 text-xs text-secondary">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-blue-500 inline-block" /> Offer (what you give)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-rose-400 inline-block" /> Want (what you need)</span>
            </div>

            <div className="space-y-5">
              {[
                { key: 'normal', data: ic.m3States.states.normal, label: 'Normal' },
                { key: 'conflict', data: ic.m3States.states.conflict, label: 'During Conflict' },
                { key: 'repair', data: ic.m3States.states.repair, label: 'During Repair' },
              ].filter(s => s.data).map(({ key, data, label }) => {
                const offerPct = Math.min(50, (data.offer / 100) * 50);
                const wantPct = Math.min(50, (data.want / 100) * 50);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">{data.label || label}</span>
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                        Math.abs(data.gap) <= 5 ? 'bg-success/10 text-success' :
                        Math.abs(data.gap) <= 15 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                      }`}>gap {data.gap > 0 ? '+' : ''}{data.gap}</span>
                    </div>
                    <div className="relative h-5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-blue-500/70 rounded-l-full transition-all duration-300"
                        style={{ width: `${offerPct}%` }} />
                      <div className="absolute right-0 top-0 h-full bg-rose-400/70 rounded-r-full transition-all duration-300"
                        style={{ width: `${wantPct}%` }} />
                      <div className="absolute left-1/2 top-0 w-px h-full bg-stone-300" />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-blue-800">{data.offer}</span>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-rose-800">{data.want}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-secondary mt-4">
              When Offer and Want overlap in the center, you are giving close to what you need.
              When they pull apart, there is a gap between what you bring to the relationship and what you ask from it.
            </p>

            {ic.m3States.insights && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <div>
                  <h4 className="font-serif text-sm font-semibold mb-1">Gap Expansion Under Stress</h4>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    ic.m3States.insights.gapExpansionLevel === 'HIGH' ? 'bg-danger/10 text-danger' :
                    ic.m3States.insights.gapExpansionLevel === 'MODERATE' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>
                    {ic.m3States.insights.gapExpansion > 0 ? '+' : ''}{ic.m3States.insights.gapExpansion} pts ({ic.m3States.insights.gapExpansionLevel})
                  </span>
                  <p className="text-xs text-secondary mt-2">
                    {ic.m3States.insights.gapExpansionLevel === 'HIGH'
                      ? 'Under stress, the gap between what you need and what you give widens significantly. Conflict amplifies your unmet needs faster than your capacity to offer, which can create a destabilizing spiral if unaddressed.'
                      : ic.m3States.insights.gapExpansionLevel === 'MODERATE'
                      ? 'Under stress, your want-offer gap grows moderately. You shift under pressure but maintain enough balance to course-correct before the gap becomes destabilizing.'
                      : 'Under stress, your want-offer gap stays relatively stable. You maintain balance between what you need and what you give, even when things get difficult.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold mb-1">Repair Effort</h4>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${ic.m3States.insights.repairSustainable ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {ic.m3States.insights.repairSustainable ? 'Sustainable' : 'High strain'}
                  </span>
                  <p className="text-xs text-secondary mt-2">
                    {ic.m3States.insights.repairSustainable
                      ? 'Your repair pattern is sustainable. When you shift into recovery mode, the effort you put in to close the gap does not exceed what you can maintain over time. This means your repair attempts are genuine and repeatable, not performative bursts.'
                      : 'Your repair pattern shows high strain. When you try to recover from conflict, you overextend what you can sustainably offer. This means your repair attempts may feel intense but are difficult to maintain, leading to cycles of over-giving followed by withdrawal.'}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Conflict Patterns ── */}
        {tensionStacks?.intimacyConflictBridge && (() => {
          const bridge = tensionStacks.intimacyConflictBridge;
          const riskLevel = bridge.riskLevel || bridge.tensionLevel;
          return (
            <section className="card mb-4">
              <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2">
                <Icon name="sports_mma" size={20} className="text-accent" />Conflict Patterns
              </h3>
              <div className="flex items-center gap-3 mb-4">
                {bridge.patternName && <span className="text-sm text-secondary">{bridge.patternName}</span>}
                {riskLevel && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    riskLevel === 'high' ? 'bg-danger/10 text-danger' :
                    riskLevel === 'medium' || riskLevel === 'medium-high' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>{riskLevel} risk</span>
                )}
              </div>

              {bridge.patternDescription && <p className="text-sm text-secondary mb-3">{bridge.patternDescription}</p>}
              {bridge.starterNarrative && <p className="text-sm mb-4">{bridge.starterNarrative}</p>}

              {Array.isArray(bridge.customizations) && bridge.customizations.length > 0 && (
                <div className="mb-4">
                  <ul className="bullet-list">
                    {bridge.customizations.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(bridge.withSameType || bridge.withOpposite) && (
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  <span className="text-xs font-mono text-secondary uppercase tracking-wider">With Partners</span>
                  {bridge.withSameType && (
                    <div>
                      <p className="text-xs font-medium mb-1">With a similar pattern</p>
                      <p className="text-sm text-secondary">{bridge.withSameType}</p>
                    </div>
                  )}
                  {bridge.withOpposite && (
                    <div>
                      <p className="text-xs font-medium mb-1">With an opposite pattern</p>
                      <p className="text-sm text-secondary">{bridge.withOpposite}</p>
                    </div>
                  )}
                </div>
              )}

              {bridge.growthPath && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs font-mono text-secondary uppercase tracking-wider">Growth Path</span>
                  {Array.isArray(bridge.growthPath) ? (
                    <ul className="bullet-list mt-1.5">
                      {bridge.growthPath.map((g: string, i: number) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-secondary mt-1.5">{bridge.growthPath}</p>
                  )}
                </div>
              )}
            </section>
          );
        })()}

        {/* ── Couples Mode ── */}
        {hasResults && (
          <section className="card mb-4 border-accent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2"><Icon name="favorite" size={20} className="text-accent" />Couples Mode</h3>
              {hasPartner && hasResults && partnerHasResults && hasCouplesAccess && (
                <Link href="/results/compare" className="text-xs text-accent hover:underline font-medium whitespace-nowrap">View Your Couples Results</Link>
              )}
            </div>

            {hasPartner ? (
              <div>
                {/* User / Connected / Partner — horizontal on desktop, vertical on mobile */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-border">
                      {userProfilePhoto ? (
                        <Image src={userProfilePhoto} alt="You" className="object-cover" fill sizes="48px" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent text-sm font-medium">
                          {userFullName ? userFullName.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{userFullName || 'You'}</p>
                      {persona?.name ? (
                        <Link href="/results/persona" className="text-xs text-secondary hover:text-accent truncate block">{persona.name}</Link>
                      ) : (
                        <Link href="/assessment" className="text-xs text-accent hover:underline">Complete Assessment</Link>
                      )}
                    </div>
                  </div>

                  {/* Connected pill */}
                  <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded flex-shrink-0">Connected</span>

                  {/* Partner */}
                  <div className="flex items-center gap-3 min-w-0 sm:flex-row-reverse">
                    <div className="relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-border">
                      {partnerProfilePhoto ? (
                        <Image src={partnerProfilePhoto} alt={partnerName || 'Partner'} className="object-cover" fill sizes="48px" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent text-sm font-medium">
                          {partnerName ? partnerName.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 sm:text-right">
                      <p className="text-sm font-medium truncate">{partnerName || 'Partner'}</p>
                      {partnerPersonaName ? (
                        <span className="text-xs text-secondary truncate block">{partnerPersonaName}</span>
                      ) : partnerAssessmentComplete ? (
                        <span className="text-xs text-secondary">Results ready</span>
                      ) : (
                        <span className="text-xs text-secondary">Complete Assessment</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activate prompt (only when not yet unlocked) */}
                {hasResults && partnerHasResults && !hasCouplesAccess ? (
                  <div className="mt-4">
                    <p className="text-xs text-secondary mb-2">Both assessments complete. Activate Couples access to unlock your compatibility report.</p>
                    <Link href="/invite" className="btn-secondary text-xs w-full text-center block">Activate Couples</Link>
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                <p className="explainer mb-4">
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
          <div className="max-w-3xl lg:max-w-6xl mx-auto px-6 py-10">
            <h2 className="font-serif text-2xl font-semibold mb-2">Ongoing Coaching</h2>
            <p className="explainer mb-6">
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
                  <p className="card-subheader text-accent">Option 1: Claude.ai Skill (Best experience)</p>
                  <ol className="text-xs text-secondary space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://claude.ai/customize/skills" target="_blank" rel="noopener noreferrer" className="text-accent underline">claude.ai/customize/skills</a> (profile icon &rarr; Customize &rarr; Skills)</li>
                    <li>Click <strong>&quot;Add Skill&quot;</strong> and upload <code className="bg-stone-100 px-1 rounded">relate-coach.zip</code></li>
                    <li>Toggle <strong>relate-coach</strong> on. Claude automatically uses your data in any relationship conversation</li>
                  </ol>
                </div>
                <div>
                  <p className="card-subheader text-accent">Option 2: Claude.ai Project</p>
                  <ol className="text-xs text-secondary space-y-1 list-decimal list-inside">
                    <li>Unzip the file, then create a new <strong>Project</strong> in <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-accent underline">claude.ai</a> called &quot;RELATE Coach&quot;</li>
                    <li>Add all files from the <code className="bg-stone-100 px-1 rounded">relate-coach/</code> folder as project knowledge</li>
                    <li>Start conversations within that project for coaching</li>
                  </ol>
                </div>
                <div>
                  <p className="card-subheader text-accent">Option 3: Any AI (ChatGPT, Gemini, etc.)</p>
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
              <p className="card-subheader mb-2">What you can ask your coach</p>
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
      <SiteFooter spacerClassName={hasResults && canDownload ? 'bg-stone-100' : 'bg-background'} />
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Market visualization components are code-split via dynamic imports from @/components/MarketComponents
