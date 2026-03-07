'use client';

import { Component, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import Link from 'next/link';
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

/* eslint-disable @typescript-eslint/no-explicit-any */

type FunnelStage = { stage: string; count: number; filter?: string; percentage?: number; isMilestone?: boolean };

type MarketData = {
  location?: { cbsaName?: string; cbsaLabel?: string; population?: number };
  relateScore?: { score: number; components?: Record<string, { national?: number; local?: number; score?: number; weight: number }>; marriagePremium?: number };
  matchPool?: { localSinglePool: number; identityPool: number; realisticPool: number; preferredPool: number; idealPool: number; funnel?: FunnelStage[]; contextPools?: any };
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
  const [userFullName, setUserFullName] = useState<string | null>(null);
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

  // Load partner info and user profile
  useEffect(() => {
    if (!user) return;
    const savedPartner = localStorage.getItem('relate_partner_results');
    if (savedPartner) setHasPartner(true);
    const savedDiscount = localStorage.getItem('relate_couples_discount');
    if (savedDiscount) setHasCouplesAccess(true);

    // Load user's own profile photo and name
    setUserProfilePhoto(localStorage.getItem('relate_profile_photo'));
    const profile = getProfile();
    if (profile?.firstName) setUserFullName(`${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`);

    fetch(`/api/partner-lookup?userId=${user.id}`)
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
          localStorage.setItem('relate_partner_email', data.partner.email);
          if (data.partner.hasResults) localStorage.setItem('relate_partner_results', 'true');
        }
      })
      .catch(() => { });
  }, [user]);

  // Fetch market data
  useEffect(() => {
    if (!user || marketFetchedRef.current) return;
    const demoStr = localStorage.getItem('relate_demographics');
    const gender = localStorage.getItem('relate_gender');
    if (!demoStr) return;

    // Use cached market data if demographics unchanged and cache is < 5 min old
    const cached = localStorage.getItem('relate_market_data');
    const cachedDemoSnap = localStorage.getItem('relate_market_demo_snapshot');
    const cachedAt = parseInt(localStorage.getItem('relate_market_cached_at') || '0', 10);
    const cacheAge = Date.now() - cachedAt;
    if (cached && cachedDemoSnap === demoStr && cacheAge < 30 * 1000) {
      try { setMarketData(JSON.parse(cached)); marketFetchedRef.current = true; return; } catch { /* refetch */ }
    }

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
          prefBodyTypes: (demo.pref_body_types || demo.prefBodyTypes)?.length ? (demo.pref_body_types || demo.prefBodyTypes) : ['No preference'],
          prefFitnessLevels: (demo.pref_fitness_levels || demo.prefFitnessLevels)?.length ? (demo.pref_fitness_levels || demo.prefFitnessLevels) : ['No preference'],
          prefPolitical: (demo.pref_political || demo.prefPolitical)?.length ? (demo.pref_political || demo.prefPolitical) : ['No preference'],
          prefEthnicities: (demo.pref_ethnicities || demo.prefEthnicities)?.length ? (demo.pref_ethnicities || demo.prefEthnicities) : ['No preference'],
          prefEducation: (demo.pref_education_levels || demo.prefEducation)?.length ? (demo.pref_education_levels || demo.prefEducation) : ['No preference'],
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
          localStorage.setItem('relate_market_demo_snapshot', demoStr);
          localStorage.setItem('relate_market_cached_at', String(Date.now()));
        }
      })
      .catch(() => { })
      .finally(() => setMarketLoading(false));
  }, [user]);

  // Recalculate market data after adjusting a preference
  const recalculateMarket = useCallback(async (prefKey: string, value: any) => {
    if (!user) return;
    const demoStr = localStorage.getItem('relate_demographics');
    const gender = localStorage.getItem('relate_gender');
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

    // Re-fetch market data
    setMarketLoading(true);
    try {
      const res = await fetch('/api/demographics-market', {
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
            prefEthnicities: demo.pref_ethnicities || demo.prefEthnicities || ['No preference'],
            prefEducation: demo.pref_education_levels || demo.prefEducation || ['No preference'],
            prefHasKids: demo.pref_has_kids || demo.prefHasKids || 'No preference',
            prefWantKids: demo.pref_want_kids || demo.prefWantKids || 'No preference',
            prefSmoking: demo.pref_smoking || demo.prefSmoking || 'No preference',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        const md: MarketData = { location: data.location, relateScore: data.relateScore, matchPool: data.matchPool, matchProbability: data.matchProbability, matchCount: data.matchCount, stateComparison: data.stateComparison, nationalComparison: data.nationalComparison };
        setMarketData(md);
        const updatedDemo = localStorage.getItem('relate_demographics') || '';
        localStorage.setItem('relate_market_data', JSON.stringify(md));
        localStorage.setItem('relate_market_demo_snapshot', updatedDemo);
        localStorage.setItem('relate_market_cached_at', String(Date.now()));
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

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  // Derived data, all guarded
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

  // Sub-nav items, grouped
  const navItems = [
    { id: 'persona', label: 'Persona', show: !!persona },
    { id: 'know-yourself', label: 'Know Yourself', show: hasDimensions || !!m3 || !!m4Summary || !!ic?.attachment || !!(tensionStacks && Object.keys(tensionStacks).length > 0) },
    { id: 'know-your-match', label: 'Know Your Ideal Match', show: !!(ic?.attachmentTiers) || !!modifiers || (hasResults && true) },
    { id: 'know-your-market', label: 'Know Your Market', show: hasMarket },
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

  // Tension stack keys that belong to Group 1 (Know Yourself)
  const group1TensionKeys = ['eroticDimension', 'intimacyConflictBridge', 'vulnerabilityProfile', 'attractionAttachment', 'internalConflictCoherence'];
  // Keys for Group 2 (anything not in Group 1 and not marketReality)
  const group2TensionKeys = tensionStacks
    ? Object.keys(tensionStacks).filter(k => k !== 'marketReality' && !group1TensionKeys.includes(k))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Sub-Navigation */}
      <SubNav items={navItems.map(n => ({ ...n, href: `#${n.id}` }))} />

      <main className="flex-1 max-w-3xl mx-auto px-6 pt-[37px] pb-8 w-full">
        <div className="flex items-baseline justify-between mb-[27px]">
          <h1 className="font-serif text-2xl font-semibold">Results</h1>
          {canDownload && (
            <button onClick={handleDownloadPDF} disabled={downloading} className="text-xs text-accent hover:underline">
              {downloading ? 'Preparing...' : 'Download PDF Report'}
            </button>
          )}
        </div>

        {/* ── Assessment Incomplete CTA ── */}
        {!hasResults && (
          <section className="card mb-6 text-center py-12">
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
          <section className="card border-accent/30 bg-accent/5 mb-4">
            <p className="font-serif font-semibold mb-1">Enhance Your Tension Stacks</p>
            <p className="text-sm text-secondary mb-3">
              Complete Module 5 to unlock more accurate vulnerability, desire, and internal alignment profiles. Takes about 5 minutes.
            </p>
            <Link href="/assessment/module-5" className="btn-primary text-sm inline-block">
              Take Module 5
            </Link>
          </section>
        )}

        {/* ── Persona ── */}
        {persona && (
          <section id="persona" className="card mb-4 scroll-mt-32">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Your Persona</span>
                <h3 className="font-serif text-lg font-semibold mt-1">{persona.name}</h3>
                {persona.code && <span className="font-mono text-xs text-accent">{persona.code}</span>}
              </div>
              <Link href="/results/persona" className="btn-secondary text-xs">Details</Link>
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

        {/* ── Matches (below persona) ── */}
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

        {/* ══════════════════════════════════════════════════
            GROUP 1: KNOW YOURSELF
        ══════════════════════════════════════════════════ */}
        {(hasDimensions || m3 || m4Summary || ic?.attachment || tensionStacks) && (
          <div id="know-yourself" className="scroll-mt-32 mb-2">
            <div className="flex items-baseline gap-3 mb-4 mt-6">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">01</span>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">Know Yourself</span>
            </div>
          </div>
        )}

        {/* ── Score Breakdown ── */}
        {hasDimensions && (() => {
          const dimOrder = ['physical', 'social', 'lifestyle', 'values'] as const;
          const dimBarColor: Record<string, string> = { physical: 'bg-accent/80', social: 'bg-accent/60', lifestyle: 'bg-accent/40', values: 'bg-accent/20' };
          const isMale = report?.gender === 'M';
          // Dimensions come from M2/W2 (what you offer)
          const polePairs: Record<string, { A: string; B: string }> = isMale
            ? { physical: { A: 'Fitness', B: 'Maturity' }, social: { A: 'Leadership', B: 'Presence' }, lifestyle: { A: 'Adventure', B: 'Stability' }, values: { A: 'Traditional', B: 'Egalitarian' } }
            : { physical: { A: 'Beauty', B: 'Confidence' }, social: { A: 'Allure', B: 'Charm' }, lifestyle: { A: 'Thrill', B: 'Peace' }, values: { A: 'Traditional', B: 'Egalitarian' } };
          return (
          <section className="card mb-4 scroll-mt-32">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2"><Icon name="bar_chart" size={20} className="text-accent" />Score Breakdown</h3>
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

        {/* ── Intimacy Under Stress ── (moved up from below Attachment) */}
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

        {/* ── Intimacy Conflict Bridge ── */}
        {tensionStacks?.intimacyConflictBridge && renderTensionStack('intimacyConflictBridge', tensionStacks.intimacyConflictBridge)}

        {/* ── Your Attachment Style ── (moved down) */}
        {ic?.attachment && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="shield" size={20} className="text-accent" />Your Attachment Style</h3>
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
          </section>
        )}

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
            GROUP 2: KNOW YOUR IDEAL MATCH
        ══════════════════════════════════════════════════ */}
        {(ic?.attachmentTiers || modifiers || hasResults) && (
          <div id="know-your-match" className="scroll-mt-32 mb-2">
            <div className="flex items-baseline gap-3 mb-4 mt-10">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">02</span>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">Know Your Ideal Match</span>
            </div>
          </div>
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
                {(() => {
                  const allMatches: { style: string; score: number; tier: string; color: string; bg: string }[] = [];
                  [
                    { items: ic.attachmentTiers.bestMatches, tier: 'Best', color: 'text-success', bg: 'bg-success/10 border-success/30' },
                    { items: ic.attachmentTiers.goodMatches, tier: 'Good', color: 'text-success', bg: 'bg-success/10 border-success/30' },
                    { items: ic.attachmentTiers.workableMatches, tier: 'Workable', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
                    { items: ic.attachmentTiers.riskyMatches, tier: 'Risky', color: 'text-danger/70', bg: 'bg-danger/5 border-danger/20' },
                    { items: ic.attachmentTiers.avoidMatches, tier: 'Avoid', color: 'text-danger', bg: 'bg-danger/10 border-danger/30' },
                  ].forEach(group => {
                    if (Array.isArray(group.items)) {
                      group.items.forEach((m: any) => allMatches.push({ style: m.style, score: m.score, tier: group.tier, color: group.color, bg: group.bg }));
                    }
                  });
                  return allMatches.sort((a, b) => b.score - a.score).map((m, i) => (
                    <div key={i} className={`text-center px-3 py-2 rounded-lg border ${m.bg}`}>
                      <p className="text-sm font-medium capitalize">{m.style}</p>
                      <p className={`text-xs font-mono ${m.color}`}>{m.score}</p>
                    </div>
                  ));
                })()}
              </div>
              {ic.attachmentTiers.recommendation && <p className="text-sm text-secondary mt-3">{ic.attachmentTiers.recommendation}</p>}
            </div>

            {/* Emotional Driver */}
            {ic.driverTiers && (
              <div className="mb-4 pt-4 border-t border-border">
                <span className="text-xs font-mono text-secondary uppercase tracking-wider">Partner Emotional Driver</span>
                <p className="text-xs text-secondary mt-1 mb-3">Your primary: <span className="font-mono capitalize text-foreground">{ic.driverTiers.yourDriver?.primary || '-'}</span></p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const allDrivers: { driver: string; score: number; tier: string; color: string; bg: string }[] = [];
                    [
                      { items: ic.driverTiers.bestMatches, tier: 'Best', color: 'text-success', bg: 'bg-success/10 border-success/30' },
                      { items: ic.driverTiers.goodMatches, tier: 'Good', color: 'text-success', bg: 'bg-success/10 border-success/30' },
                      { items: ic.driverTiers.workableMatches, tier: 'Workable', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
                      { items: ic.driverTiers.avoidMatches, tier: 'Avoid', color: 'text-danger', bg: 'bg-danger/10 border-danger/30' },
                    ].forEach(group => {
                      if (Array.isArray(group.items)) {
                        group.items.forEach((m: any) => allDrivers.push({ driver: m.driver, score: m.score, tier: group.tier, color: group.color, bg: group.bg }));
                      }
                    });
                    return allDrivers.sort((a, b) => b.score - a.score).map((m, i) => (
                      <div key={i} className={`text-center px-3 py-2 rounded-lg border ${m.bg}`}>
                        <p className="text-sm font-medium capitalize">{m.driver}</p>
                        <p className={`text-xs font-mono ${m.color}`}>{m.score}</p>
                      </div>
                    ));
                  })()}
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

        {/* ── Other Tension Stacks (Group 2) ── */}
        {group2TensionKeys.map(key => renderTensionStack(key, tensionStacks[key]))}

        {/* ── Relationship Capacity / Modifiers ── */}
        {modifiers && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><Icon name="speed" size={20} className="text-accent" />Relationship Capacity</h3>
            {modifiers.relationshipCapacity && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-lg font-semibold">
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
                <ul className="bullet-list mt-1.5">
                  {modifiers.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(modifiers.growthAreas) && modifiers.growthAreas.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-mono text-warning uppercase tracking-wider">Growth Areas</span>
                <ul className="bullet-list mt-1.5">
                  {modifiers.growthAreas.map((g: string, i: number) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(modifiers.coachingRecommendations) && modifiers.coachingRecommendations.length > 0 && (
              <div className="pt-3 border-t border-border">
                <span className="text-xs font-mono text-success uppercase tracking-wider">Recommendations</span>
                <ul className="bullet-list mt-1.5">
                  {modifiers.coachingRecommendations.map((rec: any, i: number) => (
                    <li key={i}>
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

        {/* ── Couples Mode ── */}
        {hasResults && (
          <section className="card mb-4 border-accent">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><Icon name="favorite" size={20} className="text-accent" />Couples Mode</h3>

            {hasPartner ? (
              <div>
                {/* User / Connected / Partner row */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left: current user */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-border">
                      {userProfilePhoto ? (
                        <img src={userProfilePhoto} alt="You" className="w-full h-full object-cover" />
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

                  {/* Center: connected pill */}
                  <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded flex-shrink-0">Connected</span>

                  {/* Right: partner */}
                  <div className="flex items-center gap-3 min-w-0 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-border">
                      <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent text-sm font-medium">
                        {partnerName ? partnerName.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="min-w-0 text-right">
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

                {/* Action button */}
                {hasResults && partnerHasResults && hasCouplesAccess ? (
                  <Link href="/results/compare" className="btn-secondary text-xs w-full text-center block mt-4">View Couples Results</Link>
                ) : hasResults && partnerHasResults ? (
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

        {/* ══════════════════════════════════════════════════
            GROUP 3: KNOW YOUR MARKET
        ══════════════════════════════════════════════════ */}
        {hasMarket && (
          <div id="know-your-market" className="scroll-mt-32 mb-2">
            <div className="flex items-baseline gap-3 mb-4 mt-10">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">03</span>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">Know Your Market</span>
            </div>
          </div>
        )}

        {/* ── Dating Market ── */}
        {hasMarket && (
          <div className="scroll-mt-32">
            <DatingMarketViz data={marketData} loading={marketLoading} onRelaxPreference={recalculateMarket} demographics={demographics} />
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

        {/* ── Market Data Sources Caveat ── */}
        {hasMarket && !marketLoading && marketData && (
          <p className="text-xs text-secondary text-center max-w-2xl mx-auto mb-6">
            Demographic data sourced from public datasets provided by the U.S. Census Bureau, Centers for Disease Control and Prevention (CDC), and Pew Research Center. Segments of the population that are homeless or have committed felonies have been automatically excluded using local county and FBI data.
          </p>
        )}
      </main>

      {/* ── Ongoing Coaching Section ── */}
      {hasResults && canDownload && (
        <div id="coaching" className="bg-stone-100 border-t border-border scroll-mt-12">
          <div className="max-w-3xl mx-auto px-6 py-10">
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
      <SiteFooter />
    </div>
  );
}

// ── Dating Market Visualization ──
const HEIGHTS = [
  '4\'10"','4\'11"','5\'0"','5\'1"','5\'2"','5\'3"','5\'4"','5\'5"','5\'6"','5\'7"',
  '5\'8"','5\'9"','5\'10"','5\'11"','6\'0"','6\'1"','6\'2"','6\'3"','6\'4"','6\'5"','6\'6"','6\'7"','6\'8"',
];

function formatCurrencyShort(val: number) {
  if (val >= 1000000) return '$1M+';
  if (val === 0) return '$0';
  return '$' + val.toLocaleString();
}

function DatingMarketViz({ data, loading, onRelaxPreference, demographics }: { data: MarketData | null; loading: boolean; onRelaxPreference?: (prefKey: string, value: any) => void; demographics?: any }) {
  const [relaxing, setRelaxing] = useState<string | null>(null);

  if (loading) {
    return (
      <section className="card mb-4">
        <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="trending_up" size={20} className="text-accent" />Your Dating Market</h3>
        <p className="explainer mb-4">{relaxing ? 'Recalculating your market...' : 'Analyzing your local market...'}</p>
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

  const singlesPool = pool?.localSinglePool || 0;
  const milestones = [
    { label: 'Metro Singles Pool', value: singlesPool, desc: 'Unmarried adults of your preferred gender and orientation' },
    { label: 'Identity Pool', value: pool?.identityPool || 0, desc: 'Singles matching your preferred ethnicity' },
    { label: 'Your Realistic Match Pool', value: pool?.realisticPool || 0, desc: 'Singles within your age range and income requirements' },
    { label: 'Your Preferred Pool', value: pool?.preferredPool || 0, desc: 'Singles who additionally meet your lifestyle preferences' },
    { label: 'Your Ideal Match Pool', value: pool?.idealPool || 0, desc: 'Singles who meet every preference you set' },
  ];

  // Identify relaxable filters when ideal pool is zero
  const idealPool = pool?.idealPool || 0;
  const funnel = pool?.funnel || [];
  type FilterType = 'toggle' | 'height' | 'income';
  const funnelPrefKeyMap: Record<string, { key: string; label: string; type: FilterType }> = {
    'Political': { key: 'prefPolitical', label: 'Political Views', type: 'toggle' },
    'Has kids': { key: 'prefHasKids', label: 'Partner Has Kids', type: 'toggle' },
    'Wants kids': { key: 'prefWantKids', label: 'Partner Wants Kids', type: 'toggle' },
    'Smoking': { key: 'prefSmoking', label: 'Smoking', type: 'toggle' },
    'Height': { key: 'prefHeightMin', label: 'Minimum Height', type: 'height' },
    'Body type': { key: 'prefBodyTypes', label: 'Body Type', type: 'toggle' },
    'Fitness': { key: 'prefFitnessLevels', label: 'Fitness Level', type: 'toggle' },
    'Income': { key: 'prefIncomeMin', label: 'Minimum Income', type: 'income' },
  };

  // Build list of filters that reduced the pool, sorted by biggest impact
  const relaxableFilters: { key: string; label: string; stage: string; lostPct: number; type: FilterType; currentValue?: string }[] = [];
  if (idealPool === 0) {
    for (const entry of funnel) {
      if (entry.isMilestone || !entry.filter) continue;
      const filterPct = parseFloat(entry.filter);
      if (isNaN(filterPct) || filterPct >= 100) continue;
      const lostPct = 100 - filterPct;
      for (const [prefix, info] of Object.entries(funnelPrefKeyMap)) {
        if (entry.stage.startsWith(prefix)) {
          // Extract current value from stage (e.g. "Height ≥ 5'10\"" → "5'10\"")
          const currentValue = entry.stage.includes('≥') ? entry.stage.split('≥')[1]?.trim() : entry.stage.split(':')[1]?.trim();
          relaxableFilters.push({ key: info.key, label: info.label, stage: entry.stage, lostPct, type: info.type, currentValue });
          break;
        }
      }
    }
    relaxableFilters.sort((a, b) => b.lostPct - a.lostPct);
  }

  // Read current preference values from localStorage for slider/dropdown controls
  let currentIncomeMin = 0;
  let currentHeightMin = '';
  try {
    const demoStr = localStorage.getItem('relate_demographics');
    if (demoStr) {
      const d = JSON.parse(demoStr);
      currentIncomeMin = d.pref_income_min ?? d.prefIncome ?? 0;
      currentHeightMin = d.pref_height_min || d.prefHeight || '';
    }
  } catch { /* */ }

  const handleRelax = async (prefKey: string, value: any) => {
    if (!onRelaxPreference) return;
    setRelaxing(prefKey);
    await onRelaxPreference(prefKey, value);
    setRelaxing(null);
  };

  return (
    <section className="card mb-4">
      {idealPool === 0 && relaxableFilters.length > 0 && (
        <div className="mb-6 border-2 border-dashed border-red-400/50 bg-red-50 rounded-lg p-4">
          <span className="font-mono text-xs text-red-600 tracking-wider uppercase">Zero Matches</span>
          <p className="text-sm font-medium mt-1">Your preferences have filtered your match pool to zero.</p>
          <p className="text-sm text-secondary mt-1 mb-3">
            Adjust your preferences below to find matches. Each change updates your profile automatically.
          </p>
          <div className="space-y-3">
            {relaxableFilters.map(f => (
              <div key={f.key} className="bg-white border border-red-200 rounded-md px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="text-xs text-red-500 font-mono">-{Math.round(f.lostPct)}% of pool</span>
                </div>
                {f.type === 'income' && (
                  <div className="mt-2">
                    <input
                      type="range" min={0} max={1000000} step={10000}
                      defaultValue={currentIncomeMin}
                      disabled={!!relaxing}
                      className="w-full accent-red-500"
                      onChange={e => {
                        const el = e.target;
                        const label = el.nextElementSibling;
                        if (label) label.textContent = formatCurrencyShort(parseInt(el.value));
                      }}
                      onMouseUp={e => handleRelax('prefIncomeMin', parseInt((e.target as HTMLInputElement).value))}
                      onTouchEnd={e => handleRelax('prefIncomeMin', parseInt((e.target as HTMLInputElement).value))}
                    />
                    <div className="flex justify-between text-xs text-secondary mt-0.5">
                      <span>$0</span>
                      <span>{formatCurrencyShort(currentIncomeMin)}</span>
                      <span>$1M+</span>
                    </div>
                  </div>
                )}
                {f.type === 'height' && (
                  <div className="mt-2">
                    <select
                      defaultValue={currentHeightMin}
                      disabled={!!relaxing}
                      className="input text-sm"
                      onChange={e => {
                        const val = e.target.value;
                        handleRelax('prefHeightMin', val || null);
                      }}
                    >
                      <option value="">No preference</option>
                      {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                )}
                {f.type === 'toggle' && (
                  <button
                    onClick={() => {
                      const isArray = ['prefBodyTypes', 'prefFitnessLevels', 'prefPolitical', 'prefEthnicities', 'prefEducation'].includes(f.key);
                      handleRelax(f.key, isArray ? ['No preference'] : 'No preference');
                    }}
                    disabled={!!relaxing}
                    className="mt-1 text-xs px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    {relaxing === f.key ? 'Updating...' : 'Set to No Preference'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="trending_up" size={20} className="text-accent" />Your Dating Market</h3>
      <p className="explainer mb-4">{metro}</p>

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
          <p className="text-[12px] text-foreground font-serif mt-1 mb-3">The {metroShort} metro population is <span className="font-medium">{metroPop.toLocaleString()}</span>.</p>
          <div className="mt-3 space-y-1">
            {milestones.map((m, i) => {
              const baseVal = singlesPool || 1;
              const pct = (m.value / baseVal) * 100;
              const isLast = i === milestones.length - 1;
              let pctLabel = '';
              if (i > 0) {
                if (isLast) {
                  let decimals = 1;
                  while (decimals < 10 && Number(pct.toFixed(decimals)) === 0 && pct > 0) decimals++;
                  pctLabel = `${pct.toFixed(decimals)}%`;
                } else {
                  pctLabel = `${pct.toFixed(1)}%`;
                }
              }
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs ${isLast ? 'font-medium' : 'text-secondary'}`}>{m.label}</span>
                    <span className={`text-xs font-mono ${isLast ? 'font-semibold' : 'text-secondary'}`}>{m.value.toLocaleString()}{pctLabel ? ` (${pctLabel})` : ''}</span>
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
          <p className="font-mono text-2xl font-semibold mt-1">{prob?.percentage || 'N/A'}</p>
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
        description: `Requiring a childless partner removes ${pctStr}% of your remaining pool, which is ${countStr} people in ${metro}. As singles move into their 30s and beyond, a growing majority already have children. This preference is one of the most common pool-shrinking filters in the dating market.`,
        action: 'Ask yourself whether this is a firm boundary or a preference. If you\'d consider dating a great partner who happened to have kids, relaxing this single filter could dramatically expand your options. If it\'s non-negotiable, that\'s valid, but be aware you\'ll need to compensate with flexibility elsewhere.',
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
        description: `This removes ${pctStr}% of your remaining pool (${countStr} people). The majority of singles under 40 say they want children eventually, which makes this a significant filter, especially in family-oriented metros like ${metro}.`,
        action: 'If you know you don\'t want kids, finding a partner who shares that conviction is important for long-term compatibility. This is worth keeping if it\'s a core life decision, but be honest with yourself about whether it\'s settled or still evolving.',
      };
    }
    return {
      title: 'You Want a Partner Who Wants Children',
      description: `Filtering for partners who want children removes ${pctStr}% of your pool (${countStr} people). In older age brackets, more singles have either completed their families or decided against children, making this filter increasingly costly with age.`,
      action: 'This is one of the most important long-term compatibility factors. Keep it, but if your timeline is flexible, widening your age range slightly can offset the pool reduction.',
    };
  }

  // Smoking: No / Yes
  if (/^Smoking:/i.test(stageName)) {
    const val = stageName.replace(/^Smoking:\s*/i, '').trim();
    if (/no/i.test(val)) {
      return {
        title: 'You Require a Non-Smoking Partner',
        description: `Excluding smokers removes ${pctStr}% of your pool (${countStr} people) in ${metro}. Smoking rates vary significantly by region. In some metros this is barely noticeable, but in areas with higher smoking prevalence it can be a meaningful cut.`,
        action: `In ${metro}, this filter costs you ${countStr} potential matches. For most people, non-smoking is a reasonable health and lifestyle boundary. If it's removing more than 15% of your pool, you're in a higher-smoking metro, but this is usually worth keeping.`,
      };
    }
    return {
      title: 'Your Smoking Preference Is Narrowing Your Pool',
      description: `Your smoking preference removes ${pctStr}% of your pool (${countStr} people). The majority of the dating population doesn't smoke, so requiring a smoker significantly limits your options.`,
      action: 'If smoking compatibility matters to you, consider broadening to "open to either." You\'ll still encounter smokers but won\'t exclude non-smokers.',
    };
  }

  // Height ≥ X
  if (/^Height/i.test(stageName)) {
    const heightVal = stageName.replace(/^Height[^0-9]*/i, '').trim();
    return {
      title: 'Your Minimum Height Preference Is Filtering Heavily',
      description: `Requiring a partner ${heightVal} or taller eliminates ${pctStr}% of the remaining ${seeking} in your pool, ${countStr} people gone from one preference alone. Height follows a bell curve: each additional inch above average cuts the eligible pool roughly in half.`,
      action: `Dropping your minimum by just 1-2 inches could recover thousands of potential matches. Many people find that in person, a partner slightly below their "ideal" height is a non-issue. If height is truly important to you, keep it, but recognize this is one of your most expensive filters.`,
    };
  }

  // Body type: X, Y
  if (/^Body type:/i.test(stageName)) {
    const types = stageName.replace(/^Body type:\s*/i, '').trim();
    return {
      title: 'Your Body Type Preferences Are Narrowing Your Pool',
      description: `Filtering for "${types}" body types removes ${pctStr}% of your remaining pool (${countStr} people). Body type preferences tend to compound with height and fitness filters. Together, these physical preferences can eliminate the vast majority of otherwise compatible matches.`,
      action: `Consider whether you're stacking physical filters. If you're also filtering on height and fitness level, the combined effect is much larger than any single filter suggests. Try keeping your strongest physical preference and relaxing the others. You may find that fitness level is a better proxy for what you actually care about than a self-reported body type label.`,
    };
  }

  // Fitness: X
  if (/^Fitness:/i.test(stageName)) {
    const levels = stageName.replace(/^Fitness:\s*/i, '').trim();
    return {
      title: 'Your Fitness Level Preference Is Costly',
      description: `Requiring "${levels}" fitness removes ${pctStr}% of your pool (${countStr} people). Only a minority of adults exercise at high frequency, and self-reported fitness levels tend to be optimistic, meaning the real pool of people who meet this standard is even smaller than the data suggests.`,
      action: 'Fitness matters for lifestyle compatibility, but consider whether you need a gym partner or simply someone who takes care of themselves. Broadening from "daily" to "a few times a week" or accepting one tier lower can significantly expand your options without compromising on an active lifestyle.',
    };
  }

  // Political: X, Y
  if (/^Political:/i.test(stageName)) {
    const views = stageName.replace(/^Political:\s*/i, '').trim();
    return {
      title: 'Your Political Compatibility Filter Is Expensive',
      description: `Filtering for "${views}" political views removes ${pctStr}% of your pool (${countStr} people) in ${metro}. Political demographics vary dramatically by metro. This filter could cost you 10% in one city and 60% in another.`,
      action: `In ${metro}, this preference eliminates ${countStr} people. If political alignment is essential for your relationship satisfaction, keep it. But if you'd be happy with someone who's politically moderate or simply not strongly opposed to your views, broadening this filter is one of the easiest ways to grow your pool.`,
    };
  }

  // Age X-Y
  if (/^Age \d/i.test(stageName)) {
    const range = stageName.replace(/^Age\s*/i, '').trim();
    return {
      title: 'Your Age Range Is Limiting Your Options',
      description: `Your preferred age range of ${range} removes ${pctStr}% of eligible singles (${countStr} people). Narrow age windows, especially ranges of 5 years or less, are one of the biggest hidden pool killers because they cut across every other filter you've set.`,
      action: 'Widening your age range by even 2-3 years on either end can recover a significant number of matches. Research consistently shows that age-gap relationships of 5-7 years report similar satisfaction levels to same-age relationships. The "right" person might be just outside your current window.',
    };
  }

  // Income ≥ $X
  if (/^Income/i.test(stageName)) {
    const threshold = stageName.replace(/^Income[^$]*/i, '').trim();
    return {
      title: 'Your Income Requirement Is a Major Filter',
      description: `Requiring a partner earning ${threshold} or more eliminates ${pctStr}% of your pool (${countStr} people). Income distribution is heavily skewed. Each step up the income ladder removes a disproportionately large share of people because far fewer earn above each threshold.`,
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
        desc: `Your income puts you in the bottom ${pct}% of ${genderLabel} in ${metro}. Income carries ${weightPct}% of your overall Relate Score weight, meaning it's one of the strongest factors determining how competitive you are in this market. In practical terms, this means a significant share of potential matches who filter by income will never see your profile.`,
        action: `Even a modest income increase can move your score meaningfully because the weight is so high (${weightPct}%). Concrete paths: negotiate a raise or promotion, pursue a professional certification that unlocks higher pay, or develop a side income stream. A 20% income increase in ${metro} could move your score by 5-10 points. Long-term, investing in earning power is the single highest-leverage move you can make for your dating market position.`,
      },
      education: {
        title: 'Your Education Level Is Below the Local Average',
        desc: `Your education ranks in the bottom ${pct}% of ${genderLabel} in ${metro}. Education affects your Relate Score because it correlates with the pool of people you're likely to meet and match with. Higher-education metros tend to filter heavily on credentials, even unconsciously.`,
        action: 'The good news is education is improvable. Professional certifications, online degrees from accredited programs, or specialized skill-based credentials can all shift your percentile. Even a single credential upgrade (e.g., associate\'s to bachelor\'s, or adding a professional cert) can meaningfully change how you\'re perceived in the dating market. Focus on credentials that also boost your income. That way you improve two score components at once.',
      },
      age: {
        title: 'Age Is Working Against You in This Market',
        desc: `Your age competitiveness score is ${pct} out of 100 in ${metro}. This doesn't mean your age is "wrong." It means the singles you're seeking tend to prefer a different age range than yours. The dating market has well-documented age preferences, and your current position means you're competing against a larger pool of people in a more preferred age bracket.`,
        action: 'Age is the one factor you can\'t change, but you can offset it by excelling in areas you control. Fitness and physical presentation become more important as age works against you. Staying in strong physical shape can effectively "subtract" years from how competitive you are. Income and emotional maturity are also areas where age can become an advantage if you invest in them. Focus on being the most compelling version of yourself in the areas that are within your control.',
      },
      children: {
        title: 'Having Children Is Narrowing Your Dating Pool',
        desc: `Being a parent places you in a more competitive segment of the ${metro} dating market. Many singles, particularly those without children of their own, prefer partners without existing kids. This isn't a reflection of your worth as a parent; it's a market reality that affects how many people will consider you as a potential match.`,
        action: 'Rather than hiding this part of your life, lead with it authentically. Singles who are open to partners with children tend to value maturity, stability, and family orientation, qualities you can highlight. On dating profiles, showing (not just telling) that your life is full and well-managed is more effective than downplaying your kids. Also consider that your best matches may be other parents. Shared parenting experience creates immediate common ground and mutual understanding.',
      },
      ethnicity: {
        title: 'Your Demographic Profile Is Highly Competitive Here',
        desc: `Your ethnicity competitiveness score is ${pct} in ${metro}. This reflects documented preference patterns in the local dating market. Certain demographic groups face more competition for matches in specific metros based on population ratios and stated preferences. ${national && national.relateScore > score.score + 5 ? `Nationally, your score jumps to ${national.relateScore} (vs. ${score.score} locally), meaning your demographic is significantly more competitive in other markets.` : ''}`,
        action: national && national.relateScore > score.score + 5
          ? `Geography is working against you here. Your national Relate Score of ${national.relateScore} vs. your local score of ${score.score} tells you that other metros would give you a structural advantage. If relocation is on the table, research metros where the demographic composition works more in your favor. In the meantime, focus on the factors you control. Income, fitness, and genuine charisma go a long way in any market.`
          : 'Focus on maximizing the factors within your control: income, fitness, style, and emotional intelligence. People who score lower on demographic competitiveness but higher on personal development factors often outperform their "expected" match rate. Invest in being genuinely interesting. Hobbies, travel, skills, and social proof all help differentiate you in a competitive market.',
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
      description: `Your ${strongest.name} ranks in the top ${topPct}% of singles in ${metro}. This is the component pulling your Relate Score up the most. It's what makes you competitive against others in your market. Potential matches who value ${strongest.name} will find you disproportionately attractive compared to the local average.`,
      action: `Make this visible. Your dating profile, first-date conversations, and overall presentation should reflect this strength. If ${strongest.name} is your edge, don't be modest about it. Let it do the work for you. People tend to underplay their strongest assets; lean into yours.`,
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
        description: `After applying all your preferences, only ${idealStr} of ${totalStr} eligible singles in ${metro} remain, less than 1%. Each individual filter may seem reasonable on its own, but stacked together they create an extremely narrow funnel. This means you're not just being selective on one dimension; the compound effect of all your preferences is working against you.`,
        action: 'You don\'t need to lower your standards across the board. Instead, identify your 2-3 true dealbreakers and hold firm on those while adding flexibility everywhere else. Look at your funnel breakdown to see which filters are doing the most damage. Often, loosening just one or two secondary preferences can move you from dozens of potential matches to hundreds.',
      });
    }
  }

  // ── Match probability ──
  if (prob && prob.rate < 0.05) {
    insights.push({
      priority: 'medium',
      title: 'Your Mutual Match Probability Is Below 5%',
      description: `Of the people who meet all your criteria, only ${prob.percentage} would also find you competitive enough to match with. This is the "two-way" problem: it's not enough to want them. They have to want you back. A low mutual match rate usually means there's a gap between the caliber of partner you're seeking and your current market competitiveness.`,
      action: 'There are two levers here: make yourself more competitive (improve your Relate Score by raising income, fitness, or presentation) or widen your preferences so you\'re fishing in a pool where you\'re more competitive. A 10-point Relate Score improvement can nearly double your match probability because you move up in the ranking of everyone\'s potential matches. Focus on your weakest score component, and that\'s where improvement has the highest return.',
    });
  }

  // ── Geographic opportunity ──
  if (national && national.matchCount > matchCount * 3 && matchCount < 100) {
    insights.push({
      priority: 'low',
      title: 'Your Dating Market Is Significantly Better in Other Cities',
      description: `Nationally, your estimated match count jumps to ${national.matchCount.toLocaleString()} compared to just ${matchCount.toLocaleString()} in ${metro}. That's a ${Math.round(national.matchCount / Math.max(matchCount, 1))}x difference. This gap means the local population composition, including age distribution, income levels, political leanings, and demographic mix, is working against your specific preference profile.`,
      action: `If you have any flexibility on location, this is worth exploring seriously. Research metros where the demographics align better with what you're looking for. You don't necessarily need to move permanently. Even expanding your search radius to nearby metros, or being open to long-distance for the right person, could dramatically change your odds. With only ${matchCount.toLocaleString()} estimated local matches, geography may be your single biggest constraint.`,
    });
  }

  if (insights.length === 0) return null;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <section className="card mb-4">
      <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="tips_and_updates" size={20} className="text-accent" />Market Coaching</h3>
      <p className="explainer mb-4">Actionable insights from your dating market data and assessment results</p>
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
