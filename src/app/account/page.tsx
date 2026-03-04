'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { config, PRICING, type PricingTier } from '@/lib/config';
import { getMockPaymentStatus, mockPurchase } from '@/lib/mock/payments';
import { fetchPaymentTier, refreshPaymentTier } from '@/lib/payments';
import { getProfile } from '@/lib/onboarding';
import { SiteHeader } from '@/components/SiteHeader';
import { TestAccessCard } from '@/components/TestAccessCard';
import { clearAllProgress } from '@/lib/supabase/progress';

type Demographics = { age?: number; gender?: string; relationshipStatus?: string; seeking?: string; [key: string]: unknown };

type MarketComparisonData = {
  label: string;
  population: number;
  idealPool: number;
  matchCount: number;
  relateScore: number;
  matchProbability: number;
  contextPools?: { allGender: number; eligiblePool: number; eligibleEthnicityPool: number; userEthnicity: string; targetGenderLabel: string; orientationLabel: string };
};

type MarketData = {
  location?: { cbsaName?: string; cbsaLabel?: string; population?: number };
  relateScore?: { score: number; components?: Record<string, { national?: number; local?: number; score?: number; weight: number }>; marriagePremium?: number };
  matchPool?: { localSinglePool: number; realisticPool: number; preferredPool: number; idealPool: number; funnel?: { stage: string; count: number; filter?: string; isMilestone?: boolean }[]; contextPools?: { allGender: number; eligiblePool: number; eligibleEthnicityPool: number; userEthnicity: string; targetGenderLabel: string; orientationLabel: string } };
  matchProbability?: { rate: number; percentage: string };
  matchCount?: number;
  stateComparison?: MarketComparisonData | null;
  nationalComparison?: MarketComparisonData | null;
};

type M1Scored = {
  result?: {
    code?: string;
    dimensions?: Record<string, { assignedPole?: string; strength?: number; poleAScore?: number; poleBScore?: number }>;
    keyDriver?: { dimension?: string; pole?: string; strength?: number };
  };
};

type M2Scored = {
  result?: {
    code?: string;
    overallSelfPerceptionGap?: number;
  };
  personaMetadata?: {
    name?: string;
    traits?: string;
    mostAttractive?: string[];
    leastAttractive?: string[];
  };
};

type M3Scored = {
  result?: {
    wantScore?: number;
    offerScore?: number;
    wantOfferGap?: number;
    typeName?: string;
    typeDescription?: string;
    typeDetails?: {
      strengths?: string[];
      challenges?: string[];
    };
  };
  attentiveness?: {
    level?: string;
    score?: number;
  };
};

type M4Scored = {
  result?: {
    conflictApproach?: { approach?: string; score?: number };
    emotionalDrivers?: { primary?: string; secondary?: string; scores?: Record<string, number>; primaryScore?: number };
    repairRecovery?: {
      speed?: { style?: string; score?: number };
      mode?: { style?: string; score?: number };
    };
    emotionalCapacity?: { level?: string; score?: number };
    gottmanScreener?: {
      horsemen?: Record<string, { score?: number; riskLevel?: string; antidote?: string }>;
      overallRisk?: string;
      coachingPriority?: string;
      primary?: string;
    };
  };
};

type MatchResult = { rank: number; code: string; name: string; tier: string; compatibilityScore: number; traits: string; summary: string };

const TIER_ORDER: PricingTier[] = ['free', 'plus', 'premium', 'pro', 'couples'];

function tierIndex(t: PricingTier) { return TIER_ORDER.indexOf(t); }

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

export default function AccountPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>}>
      <AccountPage />
    </Suspense>
  );
}

function AccountPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTier, setCurrentTier] = useState<PricingTier>('free');
  const [demographics, setDemographics] = useState<Demographics>({});
  const [gender, setGender] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState(false);
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<number, boolean>>({});
  const [mockUpgrading, setMockUpgrading] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [profileData, setProfileData] = useState<{ firstName: string; lastName: string; photoUrl: string | null } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [m1Data, setM1Data] = useState<M1Scored | null>(null);
  const [m2Data, setM2Data] = useState<M2Scored | null>(null);
  const [m3Data, setM3Data] = useState<M3Scored | null>(null);
  const [m4Data, setM4Data] = useState<M4Scored | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadingCoach, setDownloadingCoach] = useState(false);
  const [showCoachInfo, setShowCoachInfo] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  // Full results for richer graphics / coaching
  const [fullM3, setFullM3] = useState<M3Scored['result'] | null>(null);
  const [fullM4, setFullM4] = useState<M4Scored['result'] | null>(null);
  // Market data
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  // Discount code
  const [discountCode, setDiscountCode] = useState('');
  const [discountSubmitting, setDiscountSubmitting] = useState(false);
  const [discountResult, setDiscountResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  // Fetch payment tier (works in both mock and real mode)
  useEffect(() => {
    if (!user) return;
    const isSuccess = searchParams.get('success') === 'true';

    async function loadTier() {
      const fetcher = isSuccess ? refreshPaymentTier : fetchPaymentTier;
      const { tier } = await fetcher(user!.email);
      setCurrentTier(tier);
      if (isSuccess) setPaymentSuccess(true);
    }
    loadTier();
  }, [user, searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const demoStr = localStorage.getItem('relate_demographics');
    if (demoStr) {
      try { setDemographics(JSON.parse(demoStr)); } catch { /* ignore */ }
    }
    setGender(localStorage.getItem('relate_gender'));

    const progress: Record<number, boolean> = {};
    for (let m = 1; m <= 4; m++) {
      progress[m] = localStorage.getItem(`relate_m${m}_completed`) === 'true';
    }
    setModuleProgress(progress);

    // Load progressive module results
    try {
      const m1Str = localStorage.getItem('relate_m1_scored');
      if (m1Str) setM1Data(JSON.parse(m1Str));
    } catch { /* ignore */ }
    try {
      const m2Str = localStorage.getItem('relate_m2_scored');
      if (m2Str) setM2Data(JSON.parse(m2Str));
    } catch { /* ignore */ }
    try {
      const m3Str = localStorage.getItem('relate_m3_scored');
      if (m3Str) setM3Data(JSON.parse(m3Str));
    } catch { /* ignore */ }
    try {
      const m4Str = localStorage.getItem('relate_m4_scored');
      if (m4Str) setM4Data(JSON.parse(m4Str));
    } catch { /* ignore */ }

    // Load full results with matches
    const resultsStr = localStorage.getItem('relate_results');
    if (resultsStr) {
      try {
        const results = JSON.parse(resultsStr);
        setMatches(results.matches || []);
        if (results.m3) setFullM3(results.m3);
        if (results.m4) setFullM4(results.m4);
      } catch { /* ignore */ }
    }

    setHasResults(!!localStorage.getItem('relate_results'));
    setHasPartner(!!localStorage.getItem('relate_partner_results'));
    setPartnerEmail(localStorage.getItem('relate_partner_email'));
    setProfileData(getProfile());
  }, [authLoading, user, router]);

  // Fetch dating market data when demographics are available
  const marketFetchedRef = useRef(false);
  useEffect(() => {
    if (!user || marketData || marketFetchedRef.current) return;

    // Check for cached market data first
    const cached = localStorage.getItem('relate_market_data');
    if (cached) {
      try { setMarketData(JSON.parse(cached)); return; } catch { /* fetch fresh */ }
    }

    const demoStr = localStorage.getItem('relate_demographics');
    const profile = getProfile();
    if (!demoStr || !profile?.zipCode) return;

    let demo: Demographics;
    try { demo = JSON.parse(demoStr); } catch { return; }

    marketFetchedRef.current = true;
    setMarketLoading(true);
    fetch('/api/demographics-market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        demographics: {
          zipCode: profile.zipCode,
          gender: demo.gender,
          age: demo.age,
          ethnicity: (demo as Record<string, unknown>).ethnicity || 'White',
          orientation: (demo as Record<string, unknown>).orientation || 'Straight',
          income: (demo as Record<string, unknown>).income || 50000,
          education: (demo as Record<string, unknown>).education || "Bachelor's Degree",
          height: (demo as Record<string, unknown>).height || null,
          bodyType: (demo as Record<string, unknown>).body_type || 'Average',
          fitness: (demo as Record<string, unknown>).fitness_level || '2 to 3 days a week',
          political: (demo as Record<string, unknown>).political || 'Moderate',
          smoking: (demo as Record<string, unknown>).smoking || false,
          hasKids: (demo as Record<string, unknown>).has_kids || false,
          wantKids: (demo as Record<string, unknown>).want_kids || 'Not sure',
          relationshipStatus: demo.relationshipStatus || 'Single',
        },
        preferences: {
          prefAgeMin: (demo as Record<string, unknown>).pref_age_min || ((demo.age || 30) - 5),
          prefAgeMax: (demo as Record<string, unknown>).pref_age_max || ((demo.age || 30) + 5),
          prefIncomeMin: (demo as Record<string, unknown>).pref_income_min || 0,
          prefHeightMin: (demo as Record<string, unknown>).pref_height_min || null,
          prefBodyTypes: (demo as Record<string, unknown>).pref_body_types || ['No preference'],
          prefFitnessLevels: (demo as Record<string, unknown>).pref_fitness_levels || ['No preference'],
          prefPolitical: (demo as Record<string, unknown>).pref_political || ['No preference'],
          prefHasKids: (demo as Record<string, unknown>).pref_has_kids || 'No preference',
          prefSmoking: (demo as Record<string, unknown>).pref_smoking || 'No preference',
        },
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const md: MarketData = {
            location: data.location,
            relateScore: data.relateScore,
            matchPool: data.matchPool,
            matchProbability: data.matchProbability,
            matchCount: data.matchCount,
          };
          setMarketData(md);
          localStorage.setItem('relate_market_data', JSON.stringify(md));
        }
      })
      .catch(() => { /* silent fail — market data is optional */ })
      .finally(() => setMarketLoading(false));
  }, [user, marketData]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  async function handleDiscountCode(e: React.FormEvent) {
    e.preventDefault();
    if (!discountCode.trim() || discountSubmitting) return;
    setDiscountSubmitting(true);
    setDiscountResult(null);
    try {
      const res = await fetch('/api/discount-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim(), email: user?.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscountResult({ success: true, message: data.message });
        // Refresh payment tier after successful code redemption
        if (data.percent === 100) {
          localStorage.removeItem('relate_payment_tier');
          const { tier } = await refreshPaymentTier(user?.email);
          setCurrentTier(tier);
        }
        setDiscountCode('');
      } else {
        setDiscountResult({ error: data.error || 'Invalid code' });
      }
    } catch {
      setDiscountResult({ error: 'Failed to process code. Try again.' });
    } finally {
      setDiscountSubmitting(false);
    }
  }

  function handleMockUpgrade(tier: PricingTier) {
    setMockUpgrading(true);
    mockPurchase(tier);
    setCurrentTier(getMockPaymentStatus().tier);
    setTimeout(() => setMockUpgrading(false), 500);
  }

  function handleCopyLink() {
    const productionUrl = config.appUrl.includes('localhost') ? 'https://relate.date' : config.appUrl;
    const url = `${productionUrl}/u/${user?.id || ''}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const handleDownloadPDF = useCallback(async () => {
    const resultsStr = localStorage.getItem('relate_results');
    if (!resultsStr) return;
    setDownloading(true);
    try {
      const report = JSON.parse(resultsStr);
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
  }, [marketData]);

  const handleDownloadCoach = useCallback(async () => {
    const resultsStr = localStorage.getItem('relate_results');
    if (!resultsStr) return;
    setDownloadingCoach(true);
    try {
      const report = JSON.parse(resultsStr);
      const demoData = (() => { try { return JSON.parse(localStorage.getItem('relate_demographics') || '{}'); } catch { return {}; } })();
      const m3Full = (() => { try { return JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result; } catch { return undefined; } })();
      const m4Full = (() => { try { return JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result; } catch { return undefined; } })();
      const couplesData = (() => { try { return JSON.parse(localStorage.getItem('relate_couples_report') || 'null'); } catch { return null; } })();

      const res = await fetch('/api/generate-coach-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: report.persona,
          dimensions: report.dimensions,
          m3: m3Full || report.m3,
          m4: m4Full || report.m4,
          matches: report.matches,
          individualCompatibility: report.individualCompatibility,
          marketData: marketData || undefined,
          demographics: demoData,
          couplesReport: couplesData || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate coach skill');

      // Response is a ZIP file
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relate-coach.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowCoachInfo(true);
    } catch (err) {
      console.error('Coach prompt download failed:', err);
    } finally {
      setDownloadingCoach(false);
    }
  }, [marketData]);

  const handleDownloadCoachMd = useCallback(async () => {
    const resultsStr = localStorage.getItem('relate_results');
    if (!resultsStr) return;
    setDownloadingCoach(true);
    try {
      const report = JSON.parse(resultsStr);
      const demoData = (() => { try { return JSON.parse(localStorage.getItem('relate_demographics') || '{}'); } catch { return {}; } })();
      const m3Full = (() => { try { return JSON.parse(localStorage.getItem('relate_m3_scored') || '{}')?.result; } catch { return undefined; } })();
      const m4Full = (() => { try { return JSON.parse(localStorage.getItem('relate_m4_scored') || '{}')?.result; } catch { return undefined; } })();
      const couplesData = (() => { try { return JSON.parse(localStorage.getItem('relate_couples_report') || 'null'); } catch { return null; } })();

      const res = await fetch('/api/generate-coach-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: report.persona,
          dimensions: report.dimensions,
          m3: m3Full || report.m3,
          m4: m4Full || report.m4,
          matches: report.matches,
          individualCompatibility: report.individualCompatibility,
          marketData: marketData || undefined,
          demographics: demoData,
          couplesReport: couplesData || undefined,
          format: 'md',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate coach prompt');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relate-coach.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Coach .md download failed:', err);
    } finally {
      setDownloadingCoach(false);
    }
  }, [marketData]);

  // Section refs for sub-navigation
  const coachingSectionRef = useRef<HTMLDivElement>(null);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const completedModules = Object.values(moduleProgress).filter(Boolean).length;
  const assessmentComplete = completedModules === 4;
  const initial = profileData?.firstName ? profileData.firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?';
  const hasPaid = currentTier !== 'free';
  const canDownload = hasPaid;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* ── Sub-Navigation ── */}
      <nav className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', show: true },
            { id: 'subscription', label: 'Subscription', show: true },
            { id: 'assessment', label: 'Assessment', show: true },
            { id: 'downloads', label: 'Downloads', show: hasResults },
            { id: 'partner', label: 'Partner', show: true },
            { id: 'coaching', label: 'Ongoing Coaching', show: hasResults && canDownload, accent: true },
          ].filter(n => n.show).map(n => (
            <a key={n.id} href={`#${n.id}`} className={`text-xs font-medium px-3 py-2.5 border-b-2 border-transparent hover:border-accent transition-colors whitespace-nowrap ${n.accent ? 'text-accent font-semibold' : 'text-secondary hover:text-primary'}`}>{n.label}</a>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-semibold">Account</h1>
          {hasResults && (
            <Link href="/results" className="text-xs text-accent hover:underline">See Results</Link>
          )}
        </div>

        {/* ── Payment Success Toast ── */}
        {paymentSuccess && (
          <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-md flex items-center gap-3 animate-fade-in">
            <span className="text-success text-lg">✓</span>
            <div>
              <p className="text-sm font-medium">Payment successful</p>
              <p className="text-xs text-secondary">Your account has been upgraded to {PRICING[currentTier].label}.</p>
            </div>
          </div>
        )}

        {/* ── Profile ── */}
        <section id="profile" className="card mb-4 scroll-mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold">Profile</h2>
            <div className="flex gap-2">
              <Link href="/onboarding/profile" className="text-xs text-accent hover:underline">Edit profile</Link>
              <Link href="/onboarding/demographics" className="text-xs text-accent hover:underline">Edit demographics</Link>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-border">
              {profileData?.photoUrl ? (
                <Image src={profileData.photoUrl} alt="Profile" width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent text-lg font-medium">
                  {initial}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {profileData?.firstName && profileData?.lastName
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : user?.email || '-'}
              </p>
              <p className="text-xs text-secondary">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Row label="Gender" value={gender === 'M' ? 'Man' : gender === 'W' ? 'Woman' : '-'} />
            {demographics.age && <Row label="Age" value={String(demographics.age)} />}
            {marketData?.location?.cbsaLabel && <Row label="Metro Area" value={marketData.location.cbsaLabel} />}
            {demographics.relationshipStatus && <Row label="Status" value={demographics.relationshipStatus} />}
            {demographics.seeking && <Row label="Seeking" value={demographics.seeking} />}
          </div>
        </section>

        {/* ── Subscription ── */}
        <section id="subscription" className="card mb-4 scroll-mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold">Subscription</h2>
            {currentTier !== 'free' && currentTier !== 'couples' && (
              <a href="#subscription" className="text-xs text-accent hover:underline">Edit subscription</a>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 mb-4 rounded-md border ${
            currentTier !== 'free' ? 'bg-stone-50 border-stone-300' : 'bg-stone-50 border-border'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
              currentTier !== 'free' ? 'bg-stone-200 text-stone-600' : 'bg-stone-200 text-secondary'
            }`}>
              {currentTier !== 'free' ? '✓' : '-'}
            </div>
            <div>
              <p className="text-sm font-medium">{PRICING[currentTier].label}: Active</p>
              <p className="text-xs text-secondary">
                {currentTier === 'free' && 'Persona code, top 3 matches, 3 advisor messages.'}
                {currentTier === 'plus' && 'Full report, all 16 matches, PDF download.'}
                {currentTier === 'premium' && 'Plus features + rate-limited AI advisor + retake assessment.'}
                {currentTier === 'pro' && 'Everything in Premium + unlimited AI advisor.'}
                {currentTier === 'couples' && 'Everything for both partners, couples report, shared advisor.'}
              </p>
            </div>
          </div>

          {currentTier === 'free' && (
            <div className="mb-3">
              <TestAccessCard />
            </div>
          )}

          {currentTier !== 'couples' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIER_ORDER.filter(t => t !== 'free' && tierIndex(t) > tierIndex(currentTier)).map(tier => (
                <div key={tier} className="p-3 border rounded-md border-border">
                  <p className="text-sm font-medium">{PRICING[tier].label}</p>
                  <p className="font-serif text-xl font-semibold my-1">{PRICING[tier].priceDisplay}</p>
                  <p className="text-xs text-secondary mb-3">
                    {tier === 'plus' && 'All 16 matches, conflict analysis, growth path, PDF report.'}
                    {tier === 'premium' && 'Plus features + rate-limited AI advisor + retake assessment.'}
                    {tier === 'pro' && 'Everything in Premium + unlimited AI advisor.'}
                    {tier === 'couples' && 'Pro for both + compatibility report + shared tools.'}
                  </p>
                  {config.useMockPayments ? (
                    <button onClick={() => handleMockUpgrade(tier)} className="text-xs w-full btn-secondary" disabled={mockUpgrading}>
                      {mockUpgrading ? 'Processing...' : `Upgrade to ${PRICING[tier].label}`}
                    </button>
                  ) : (
                    <Link href={`/api/checkout?product=${tier}&email=${encodeURIComponent(user?.email || '')}`} className="text-xs w-full text-center block btn-secondary">
                      Upgrade to {PRICING[tier].label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Discount Code */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-secondary mb-2">Have a discount code?</p>
            <form onSubmit={handleDiscountCode} className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="input flex-1 text-xs font-mono"
              />
              <button
                type="submit"
                disabled={discountSubmitting || !discountCode.trim()}
                className="btn-secondary text-xs whitespace-nowrap"
              >
                {discountSubmitting ? 'Applying...' : 'Apply'}
              </button>
            </form>
            {discountResult?.success && (
              <p className="text-xs text-success mt-2">{discountResult.message}</p>
            )}
            {discountResult?.error && (
              <p className="text-xs text-danger mt-2">{discountResult.error}</p>
            )}
          </div>
        </section>

        {/* ── Assessment Progress ── */}
        <section id="assessment" className="card mb-4 scroll-mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold">Assessment Progress</h2>
            <span className="text-xs font-mono text-secondary">{completedModules}/4 modules</span>
          </div>

          <div className="space-y-2">
            {[
              { id: 1, name: 'What You Want' },
              { id: 2, name: 'Who You Are' },
              { id: 3, name: 'How You Connect' },
              { id: 4, name: 'When Things Get Hard' },
            ].map((mod) => (
              <div key={mod.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                    moduleProgress[mod.id] ? 'bg-success text-white' : 'bg-stone-200 text-secondary'
                  }`}>
                    {moduleProgress[mod.id] ? '✓' : mod.id}
                  </div>
                  <span className="text-sm">Module {mod.id}: {mod.name}</span>
                </div>
                {moduleProgress[mod.id] ? (
                  <span className="text-xs text-success font-mono">Complete</span>
                ) : (
                  <Link href={`/assessment/module-${mod.id}`} className="text-xs text-accent hover:underline">
                    {mod.id === 1 || moduleProgress[mod.id - 1] ? 'Start' : 'Locked'}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {!assessmentComplete && (
            <Link href="/assessment" className="btn-primary w-full text-center mt-4 block">
              Continue Assessment
            </Link>
          )}
          {assessmentComplete && !hasResults && (
            <Link href="/assessment/processing" className="btn-primary w-full text-center mt-4 block">
              Generate Results
            </Link>
          )}
          {hasResults && (
            <Link href="/results" className="btn-secondary w-full text-center mt-4 block">
              View Full Results
            </Link>
          )}
          {assessmentComplete && (currentTier === 'premium' || currentTier === 'pro' || currentTier === 'couples') && (
            <button
              onClick={async () => {
                if (!confirm('This will clear all your assessment answers and results. You will need to retake the full assessment. Continue?')) return;
                if (user) await clearAllProgress(user.id);
                setModuleProgress({});
                setM1Data(null);
                setM2Data(null);
                setM3Data(null);
                setM4Data(null);
                router.push('/assessment');
              }}
              className="btn-secondary w-full text-center mt-2"
            >
              Retake Assessment
            </button>
          )}
        </section>

        {/* ── Progressive Module Results ── */}
        {(m1Data || m2Data || m3Data || m4Data) && (
          <section id="results" className="card mb-4 scroll-mt-12">
            <h2 className="font-serif text-lg font-semibold mb-4">Your Results</h2>

            {/* Module 1: Preference Profile */}
            {m1Data?.result && (
              <div className="mb-5">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs">1</span>
                  Preference Profile
                  {m1Data.result.code && <span className="font-mono text-xs text-accent">{m1Data.result.code}</span>}
                </h3>
                {m1Data.result.dimensions && (
                  <div className="space-y-2 pl-7">
                    {Object.entries(m1Data.result.dimensions).map(([dim, data]) => (
                      <div key={dim} className="flex items-center gap-3">
                        <span className="text-xs text-secondary w-16 capitalize">{dim}</span>
                        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${Math.max(data.poleAScore || 50, data.poleBScore || 50)}%` }} />
                        </div>
                        <span className="text-xs font-mono w-20 text-right">{data.assignedPole || '-'}</span>
                      </div>
                    ))}
                    {m1Data.result.keyDriver && (
                      <p className="text-xs text-secondary mt-1">
                        Key driver: {m1Data.result.keyDriver.dimension} ({m1Data.result.keyDriver.pole}, {m1Data.result.keyDriver.strength}% strength)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Module 2: Persona */}
            {m2Data?.personaMetadata && (
              <div className="mb-5">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs">2</span>
                  Your Persona
                </h3>
                <div className="pl-7 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-lg font-semibold">{m2Data.personaMetadata.name}</span>
                    {m2Data.result?.code && <span className="font-mono text-xs text-accent">{m2Data.result.code}</span>}
                  </div>
                  {m2Data.personaMetadata.traits && (
                    <p className="text-xs text-secondary">{m2Data.personaMetadata.traits}</p>
                  )}
                  {m2Data.result?.overallSelfPerceptionGap !== undefined && (
                    <p className="text-xs text-secondary">
                      Self-perception gap: {m2Data.result.overallSelfPerceptionGap}%
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {m2Data.personaMetadata.mostAttractive && m2Data.personaMetadata.mostAttractive.length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-success uppercase mb-1">Strengths</p>
                        <ul className="space-y-0.5">
                          {m2Data.personaMetadata.mostAttractive.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-xs text-secondary">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {m2Data.personaMetadata.leastAttractive && m2Data.personaMetadata.leastAttractive.length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-warning uppercase mb-1">Growth Areas</p>
                        <ul className="space-y-0.5">
                          {m2Data.personaMetadata.leastAttractive.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-xs text-secondary">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Module 3: Connection Style */}
            {m3Data?.result && (
              <div className="mb-5">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs">3</span>
                  Connection Style
                </h3>
                <div className="pl-7">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <span className="font-mono text-xl font-semibold">{m3Data.result.wantScore ?? '-'}</span>
                      <p className="text-xs text-secondary">Want</p>
                    </div>
                    <div>
                      <span className="font-mono text-xl font-semibold">{m3Data.result.offerScore ?? '-'}</span>
                      <p className="text-xs text-secondary">Offer</p>
                    </div>
                    <div>
                      <span className="font-mono text-xl font-semibold">{m3Data.result.typeName ?? '-'}</span>
                      <p className="text-xs text-secondary">Type</p>
                    </div>
                  </div>
                  {m3Data.result.wantOfferGap !== undefined && (
                    <p className="text-xs text-secondary mt-2 text-center">
                      Gap: {m3Data.result.wantOfferGap > 0 ? '+' : ''}{m3Data.result.wantOfferGap}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Module 4: Conflict Profile */}
            {m4Data?.result && (
              <div className="mb-2">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs">4</span>
                  Conflict Profile
                </h3>
                <div className="pl-7">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {m4Data.result.conflictApproach?.approach && (
                      <MiniRow label="Approach" value={m4Data.result.conflictApproach.approach} />
                    )}
                    {m4Data.result.emotionalDrivers?.primary && (
                      <MiniRow label="Primary Driver" value={m4Data.result.emotionalDrivers.primary} />
                    )}
                    {m4Data.result.repairRecovery?.speed?.style && (
                      <MiniRow label="Repair Speed" value={m4Data.result.repairRecovery.speed.style} />
                    )}
                    {m4Data.result.repairRecovery?.mode?.style && (
                      <MiniRow label="Repair Mode" value={m4Data.result.repairRecovery.mode.style} />
                    )}
                    {m4Data.result.emotionalCapacity?.level && (
                      <MiniRow label="Capacity" value={m4Data.result.emotionalCapacity.level} />
                    )}
                    {m4Data.result.gottmanScreener?.overallRisk && (
                      <MiniRow label="Gottman Risk" value={m4Data.result.gottmanScreener.overallRisk} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Want vs Offer Graphic ── */}
        {(m3Data?.result || fullM3) && (
          <WantOfferGraphic m3={fullM3 || m3Data?.result || null} />
        )}

        {/* ── Growth Plan / Coaching ── */}
        {(fullM3 || fullM4 || m3Data?.result || m4Data?.result) && (
          <GrowthPlan
            m3={fullM3 || m3Data?.result || null}
            m4={fullM4 || m4Data?.result || null}
          />
        )}

        {/* Dating Market and Market Coaching are on the Results page */}

        {/* ── Compatibility Rankings ── */}
        {matches.length > 0 && (
          <section className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold">Compatibility Rankings</h2>
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
                  {(hasPaid ? matches.slice(0, 8) : matches.slice(0, 3)).map((match) => (
                    <tr key={match.code} className="border-b border-border last:border-0 hover:bg-stone-50">
                      <td className="px-3 py-2 font-mono text-secondary">{match.rank}</td>
                      <td className="px-3 py-2">
                        {hasPaid ? (
                          <Link href={`/results/match/${match.code}`} className="text-accent hover:underline">{match.name}</Link>
                        ) : match.name}
                        <span className="font-mono text-xs text-secondary ml-1">{match.code}</span>
                      </td>
                      <td className={`px-3 py-2 text-xs font-medium hidden sm:table-cell ${tierColor(match.tier)}`}>
                        {tierLabel(match.tier)}
                      </td>
                      <td className="px-3 py-2 font-mono text-right">{match.compatibilityScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!hasPaid && matches.length > 3 && (
              <p className="text-xs text-secondary mt-3 text-center">
                {matches.length - 3} more matches available with Plus or Premium.
              </p>
            )}
          </section>
        )}

        {/* ── Downloads ── */}
        {hasResults && (
          <section id="downloads" className="card mb-4 scroll-mt-12">
            <h2 className="font-serif text-lg font-semibold mb-4">Downloads</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4 py-2 border-b border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Persona Card</p>
                  <p className="text-xs text-secondary">Your persona summary and key traits</p>
                </div>
                <Link href="/results/persona" className="btn-secondary text-xs flex-shrink-0">
                  View
                </Link>
              </div>
              <div className="flex items-center gap-4 py-2 border-b border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Full PDF Report</p>
                  <p className="text-xs text-secondary">
                    {canDownload
                      ? 'Complete assessment report with market data'
                      : 'Available with Plus, Premium, or Couples'}
                  </p>
                </div>
                {canDownload ? (
                  <button onClick={handleDownloadPDF} disabled={downloading} className="btn-primary text-xs flex-shrink-0">
                    {downloading ? 'Preparing...' : 'Download'}
                  </button>
                ) : (
                  <Link href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary text-xs flex-shrink-0">
                    Upgrade
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4 py-2 border-b border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">AI Coach Skill (.zip)</p>
                  <p className="text-xs text-secondary">
                    {canDownload
                      ? 'Claude skill with coaching workflows and your data'
                      : 'Available with Plus, Premium, or Couples'}
                  </p>
                </div>
                {canDownload ? (
                  <button onClick={handleDownloadCoach} disabled={downloadingCoach} className="btn-primary text-xs flex-shrink-0">
                    {downloadingCoach ? 'Preparing...' : 'Download'}
                  </button>
                ) : (
                  <Link href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary text-xs flex-shrink-0">
                    Upgrade
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">AI Coach Prompt (.md)</p>
                  <p className="text-xs text-secondary">
                    {canDownload
                      ? 'Basic coaching file for any AI platform'
                      : 'Available with Plus, Premium, or Couples'}
                  </p>
                </div>
                {canDownload ? (
                  <button onClick={handleDownloadCoachMd} disabled={downloadingCoach} className="btn-primary text-xs flex-shrink-0">
                    {downloadingCoach ? 'Preparing...' : 'Download'}
                  </button>
                ) : (
                  <Link href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary text-xs flex-shrink-0">
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Partner Connection ── */}
        <section id="partner" className="card mb-4 scroll-mt-12">
          <h2 className="font-serif text-lg font-semibold mb-4">Partner</h2>

          {hasPartner ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-md">
                <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center text-sm flex-shrink-0">✓</div>
                <div>
                  <p className="text-sm font-medium">Partner connected</p>
                  {partnerEmail && <p className="text-xs text-secondary">{partnerEmail}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/results/compare" className="btn-primary text-xs">Couples Report</Link>
                <Link href="/couples" className="btn-secondary text-xs">Couples Dashboard</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-secondary">
                Find your partner by email or share your profile link.
              </p>

              <div>
                <label className="label">Find partner by email or profile URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partnerSearch}
                    onChange={e => setPartnerSearch(e.target.value)}
                    className="input flex-1"
                    placeholder="partner@email.com or profile URL"
                  />
                  <Link
                    href={`/invite?email=${encodeURIComponent(partnerSearch)}`}
                    className="btn-primary text-xs flex-shrink-0"
                  >
                    Search
                  </Link>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-border rounded-md">
                <p className="text-xs text-secondary mb-2">Your shareable profile link:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-secondary bg-white px-2 py-1 rounded border border-border flex-1 truncate">
                    {config.appUrl.includes('localhost') ? 'https://relate.date' : config.appUrl}/u/{user?.id || ''}
                  </code>
                  <button onClick={handleCopyLink} className="btn-secondary text-xs flex-shrink-0">
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <Link href="/invite" className="btn-secondary text-xs inline-block">Send Invite</Link>
            </div>
          )}
        </section>

        {/* ── Quick Links ── */}
        <section className="card mb-4">
          <h2 className="font-serif text-lg font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/results" className="text-sm text-accent hover:underline">Results Dashboard</Link>
            <Link href="/results/persona" className="text-sm text-accent hover:underline">Your Persona</Link>
            <Link href="/results/matches" className="text-sm text-accent hover:underline">All Matches</Link>
            <Link href="/results/conflict" className="text-sm text-accent hover:underline">Conflict Analysis</Link>
            <Link href="/personas" className="text-sm text-accent hover:underline">Browse Personas</Link>
            <Link href="/methodology" className="text-sm text-accent hover:underline">Methodology</Link>
            <Link href="/settings/profile" className="text-sm text-accent hover:underline">Profile Settings</Link>
            {(currentTier === 'premium' || currentTier === 'couples') && (
              <Link href="/advisor" className="text-sm text-accent hover:underline">AI Advisor</Link>
            )}
            <Link href="/couples" className="text-sm text-accent hover:underline">Couples Dashboard</Link>
          </div>
        </section>

        {/* ── Feedback ── */}
        <section className="card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold">Feedback</h2>
              <p className="text-xs text-secondary">Help us improve RELATE</p>
            </div>
            <Link href="/feedback" className="btn-secondary text-xs">
              Send Feedback
            </Link>
          </div>
        </section>

        {/* ── Sign Out ── */}
        <div className="pt-4 border-t border-border">
          <button onClick={handleSignOut} className="text-sm text-danger hover:underline">
            Sign out
          </button>
        </div>
      </main>

      {/* ── Ongoing Coaching Section (darker background, outside main container) ── */}
      {hasResults && canDownload && (
        <div id="coaching" ref={coachingSectionRef} className="bg-stone-100 border-t border-border scroll-mt-12">
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
                <button onClick={handleDownloadCoach} disabled={downloadingCoach} className="btn-primary text-xs w-full">
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
      <section className="card mb-4">
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

  // Score tier label
  function scoreTier(s: number) {
    if (s >= 80) return { label: 'Exceptional', color: 'text-success' };
    if (s >= 65) return { label: 'Strong', color: 'text-success' };
    if (s >= 50) return { label: 'Above Average', color: 'text-accent' };
    if (s >= 35) return { label: 'Average', color: 'text-warning' };
    return { label: 'Below Average', color: 'text-danger' };
  }

  const tier = scoreTier(score);

  // Component score bars
  const components = data.relateScore?.components || {};
  const compOrder = ['income', 'education', 'age', 'ethnicity', 'children'];
  const compLabels: Record<string, string> = {
    income: 'Income', education: 'Education', age: 'Age', ethnicity: 'Ethnicity', children: 'Children',
  };

  // Funnel milestones
  const milestones = [
    { label: 'Metro Population', value: metroPop, desc: 'Total population in your metro area' },
    { label: 'Singles Pool', value: pool?.localSinglePool || 0, desc: 'Unmarried adults of your preferred gender and orientation' },
    { label: 'Your Realistic Match Pool', value: pool?.realisticPool || 0, desc: 'Singles within your age range and income preferences' },
    { label: 'Your Preferred Pool', value: pool?.preferredPool || 0, desc: 'Realistic matches who also meet your lifestyle preferences' },
    { label: 'Your Ideal Match Pool', value: pool?.idealPool || 0, desc: 'People who meet every preference you set' },
  ];

  return (
    <section className="card mb-4">
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

        {/* Score bar */}
        <div className="relative h-3 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              background: score >= 65 ? 'var(--color-success)' : score >= 50 ? 'var(--color-accent)' : score >= 35 ? 'var(--color-warning)' : 'var(--color-danger)',
            }}
          />
          {/* Marker ticks */}
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

// ── Want vs Offer Bar Chart ──
function WantOfferGraphic({ m3 }: { m3: M3Scored['result'] | null }) {
  if (!m3) return null;
  const want = m3.wantScore ?? 50;
  const offer = m3.offerScore ?? 50;
  const gap = m3.wantOfferGap ?? (want - offer);
  const typeName = m3.typeName || '';

  function gapLabel(g: number) {
    if (g > 20) return 'You seek significantly more than you provide';
    if (g > 5) return 'You seek slightly more than you provide';
    if (g < -20) return 'You provide significantly more than you seek';
    if (g < -5) return 'You provide slightly more than you seek';
    return 'Your want and offer are well balanced';
  }

  function gapColor(g: number) {
    const abs = Math.abs(g);
    if (abs <= 5) return 'text-success';
    if (abs <= 20) return 'text-warning';
    return 'text-danger';
  }

  return (
    <section className="card mb-4">
      <h2 className="font-serif text-lg font-semibold mb-1">Connection Balance</h2>
      <p className="text-xs text-secondary mb-5">What you seek in a partner vs. what you offer</p>

      <div className="space-y-4">
        {/* Want bar */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-mono text-secondary uppercase tracking-wider">What You Want</span>
            <span className="font-mono text-lg font-semibold">{want}</span>
          </div>
          <div className="relative h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${want}%` }}
            />
          </div>
          <p className="text-xs text-secondary mt-1">
            {want >= 60 ? 'You seek exclusive access — a partner with hidden depth' : 'You value consistency and transparency in a partner'}
          </p>
        </div>

        {/* Offer bar */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-mono text-secondary uppercase tracking-wider">What You Offer</span>
            <span className="font-mono text-lg font-semibold">{offer}</span>
          </div>
          <div className="relative h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-stone-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${offer}%` }}
            />
          </div>
          <p className="text-xs text-secondary mt-1">
            {offer >= 60 ? 'You reveal different sides of yourself in different contexts' : 'You are the same person in every context'}
          </p>
        </div>

        {/* Gap visualization */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-secondary uppercase tracking-wider">Gap</span>
            <span className={`font-mono text-sm font-semibold ${gapColor(gap)}`}>
              {gap > 0 ? '+' : ''}{gap}
            </span>
          </div>

          {/* Gap bar: center-anchored */}
          <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-300" />
            {gap !== 0 && (
              <div
                className={`absolute top-0 bottom-0 rounded-full transition-all duration-700 ${gap > 0 ? 'bg-accent/60' : 'bg-stone-500/60'}`}
                style={{
                  left: gap > 0 ? '50%' : `${50 + (gap / 2)}%`,
                  width: `${Math.abs(gap) / 2}%`,
                }}
              />
            )}
          </div>

          <p className={`text-xs mt-2 ${gapColor(gap)}`}>{gapLabel(gap)}</p>
        </div>

        {/* Type badge */}
        {typeName && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-mono text-secondary">Type:</span>
            <span className="text-xs font-medium bg-stone-100 px-2 py-0.5 rounded">{typeName}</span>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Growth Plan / CBT Coaching ──
function GrowthPlan({ m3, m4 }: { m3: M3Scored['result'] | null; m4: M4Scored['result'] | null }) {
  // Build coaching steps from assessment data
  const steps: { priority: 'high' | 'medium' | 'low'; title: string; description: string; technique: string }[] = [];

  // M3-based coaching: Want/Offer gap
  if (m3) {
    const gap = m3.wantOfferGap ?? 0;
    if (gap > 20) {
      steps.push({
        priority: 'high',
        title: 'Close the Want/Offer Gap',
        description: 'You want significantly more from a partner than you currently offer. This asymmetry can create relationship debt.',
        technique: 'Practice reciprocity awareness: each week, identify one way you ask for connection and match it with something you give. Journal the exchange.',
      });
    } else if (gap < -20) {
      steps.push({
        priority: 'medium',
        title: 'Set Boundaries on Giving',
        description: 'You offer far more than you ask for. Generous, but watch for resentment if the balance stays skewed.',
        technique: 'Practice asking for what you need before giving. Use the "request before offer" rule in conversations this week.',
      });
    }

    // Type-specific challenge coaching
    if (m3.typeDetails?.challenges && m3.typeDetails.challenges.length > 0) {
      steps.push({
        priority: 'low',
        title: 'Work Your Growth Edge',
        description: m3.typeDetails.challenges[0],
        technique: 'Identify one relationship moment this week where this challenge showed up. Write down what happened, what you felt, and one alternative response.',
      });
    }
  }

  // M4-based coaching
  if (m4) {
    // Gottman horsemen: highest priority
    const horsemen = m4.gottmanScreener?.horsemen;
    if (horsemen) {
      const highRisk = Object.entries(horsemen).filter(([, h]) => h.riskLevel === 'high');
      const mediumRisk = Object.entries(horsemen).filter(([, h]) => h.riskLevel === 'medium');

      for (const [name, data] of highRisk) {
        steps.push({
          priority: 'high',
          title: `Address ${name.charAt(0).toUpperCase() + name.slice(1)}`,
          description: `Your ${name} score is elevated. This is one of the strongest predictors of relationship difficulty.`,
          technique: data.antidote || `Practice the antidote to ${name} daily. Notice when it arises and pause before responding.`,
        });
      }

      for (const [name, data] of mediumRisk) {
        steps.push({
          priority: 'medium',
          title: `Monitor ${name.charAt(0).toUpperCase() + name.slice(1)}`,
          description: `Moderate ${name} tendency detected. Worth watching before it escalates under stress.`,
          technique: data.antidote || `When you notice ${name} arising, take a breath and reframe your response.`,
        });
      }
    }

    // Emotional driver coaching
    const driver = m4.emotionalDrivers?.primary;
    if (driver) {
      const driverCoaching: Record<string, { title: string; desc: string; technique: string }> = {
        abandonment: {
          title: 'Soothe Abandonment Anxiety',
          desc: 'Your conflict behavior is driven by fear of being left. This can cause pursuit patterns that push partners away.',
          technique: 'When you feel the urge to pursue during conflict, pause for 90 seconds. Name the fear ("I\'m afraid they\'ll leave") then check: is there actual evidence of leaving, or am I projecting?',
        },
        engulfment: {
          title: 'Honor Your Need for Space',
          desc: 'Your conflict behavior is driven by fear of losing autonomy. You may withdraw when you feel controlled.',
          technique: 'Practice communicating your need for space proactively: "I need 20 minutes to process, then I\'ll come back." This prevents your partner from feeling abandoned.',
        },
        inadequacy: {
          title: 'Challenge Inadequacy Beliefs',
          desc: 'Your conflict behavior is driven by feeling "not good enough." This can cause collapse or overcompensation.',
          technique: 'CBT thought record: when you feel inadequate during conflict, write the trigger, automatic thought, evidence for/against, and a balanced alternative thought.',
        },
        injustice: {
          title: 'Reframe the Fairness Lens',
          desc: 'Your conflict behavior is driven by perceived unfairness. This can turn disagreements into moral battles.',
          technique: 'Before arguing your case, state your partner\'s perspective back to them. Ask: "Did I get that right?" This builds empathy before you advocate for yourself.',
        },
      };

      const coaching = driverCoaching[driver];
      if (coaching) {
        steps.push({
          priority: 'medium',
          title: coaching.title,
          description: coaching.desc,
          technique: coaching.technique,
        });
      }
    }

    // Emotional capacity coaching
    if (m4.emotionalCapacity?.level === 'low') {
      steps.push({
        priority: 'high',
        title: 'Build Emotional Capacity',
        description: 'You get overwhelmed quickly during conflict. This limits your ability to stay present and repair.',
        technique: 'Practice the physiological sigh (double inhale through nose, long exhale through mouth) when you feel flooded. Build tolerance gradually: start with 2-minute difficult conversations and extend over time.',
      });
    }

    // Repair mismatch awareness
    if (m4.repairRecovery?.speed?.style === 'slow' && m4.conflictApproach?.approach === 'pursue') {
      steps.push({
        priority: 'low',
        title: 'Align Repair Timing',
        description: 'You pursue resolution immediately but need time to repair well. This internal contradiction can lead to premature, ineffective repair attempts.',
        technique: 'When conflict arises, say: "I want to resolve this, and I also know I need a bit of time to do it well. Can we revisit in 30 minutes?"',
      });
    }
  }

  if (steps.length === 0) return null;

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  steps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  function priorityBadge(p: 'high' | 'medium' | 'low') {
    const styles = {
      high: 'bg-danger/10 text-danger',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-stone-100 text-secondary',
    };
    return styles[p];
  }

  return (
    <section className="card mb-4">
      <h2 className="font-serif text-lg font-semibold mb-1">Growth Plan</h2>
      <p className="text-xs text-secondary mb-5">Evidence-based coaching steps from your assessment results</p>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="border border-border rounded-md p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${priorityBadge(step.priority)}`}>
                {step.priority}
              </span>
              <h3 className="text-sm font-medium leading-tight">{step.title}</h3>
            </div>
            <p className="text-xs text-secondary mb-2">{step.description}</p>
            <div className="bg-stone-50 border border-border rounded p-2">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider">Try this</span>
              <p className="text-xs text-secondary mt-1">{step.technique}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Market Coaching ──

/* eslint-disable @typescript-eslint/no-explicit-any */
function MarketCoaching({ marketData, demographics, m3, m4, persona }: {
  marketData: MarketData | null;
  demographics: Demographics;
  m3: M3Scored['result'] | null;
  m4: M4Scored['result'] | null;
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

  // ─── 1. Relate Score Component Analysis ───

  const compEntries = Object.entries(components).map(([k, v]: [string, any]) => ({
    name: k,
    local: v.local ?? v.score ?? 0,
    weight: v.weight ?? 0,
    weighted: (v.local ?? v.score ?? 0) * (v.weight ?? 0),
  })).sort((a, b) => a.weighted - b.weighted);

  // Weakest component coaching
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

  // Strongest component: acknowledge it
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

  // ─── 2. Funnel Bottleneck Analysis ───

  // Skip non-preference stages that users can't control (orientation, base age range, gender)
  const nonPreferenceFilters = /orientation|sexual|gender|base.*age|18.*64|eligible/i;

  // Find biggest non-milestone drops from user-controlled preference filters only
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

  // Top bottleneck
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

  // Second biggest if also severe
  if (drops[1] && drops[1].lostPct > 25) {
    insights.push({
      priority: 'medium',
      title: `Secondary Bottleneck: ${drops[1].stageName}`,
      description: `Removes another ${Math.round(drops[1].lostPct)}% of your pool (${drops[1].lostCount.toLocaleString()} people) at the ${drops[1].stageName} filter.`,
      action: `Your top two bottlenecks are ${biggestDrop?.stageName || 'unknown'} and ${drops[1].stageName}. Together they account for the majority of your pool reduction. Evaluate whether ${drops[1].stageName} is a genuine dealbreaker or a preference you could be flexible on.`,
      category: 'funnel',
    });
  }

  // ─── 3. Expansion Opportunity ───

  // idealPool vs localSinglePool ratio
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

  // ─── 4. Cross-Reference: Assessment vs Market Preferences ───

  // Want/Offer gap vs physical selectivity
  const wantScore = m3?.wantScore ?? 0;
  const offerScore = m3?.offerScore ?? 0;
  const gap = wantScore - offerScore;
  const prefBodyTypes = (demographics as any).prefBodyTypes || (demographics as any).pref_body_types || [];
  const prefFitness = (demographics as any).prefFitnessLevels || (demographics as any).pref_fitness_levels || [];
  const userFitness = (demographics as any).fitness || (demographics as any).fitness_level || '';
  const userBodyType = (demographics as any).bodyType || (demographics as any).body_type || '';

  // Wants hot partners but assessment says they want depth
  const wantsOnlyFit = prefBodyTypes.length > 0
    && !prefBodyTypes.includes('No preference')
    && prefBodyTypes.every((t: string) => t === 'Lean or Fit');
  const wantsOnlyHighFitness = prefFitness.length > 0
    && !prefFitness.includes('No preference')
    && prefFitness.every((l: string) => ['4 to 6 days a week', 'Every day'].includes(l));

  if ((wantsOnlyFit || wantsOnlyHighFitness) && gap > 15) {
    // They want a lot but are very selective on physicals: possible mismatch
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

  // Wants physical attractiveness but doesn't exercise
  if (wantsOnlyFit && ['Never', '1 day a week'].includes(userFitness)) {
    insights.push({
      priority: 'high',
      title: 'You Want Fit Partners but Don\'t Exercise',
      description: `You\'re filtering for "Lean or Fit" body types, but you exercise ${userFitness === 'Never' ? 'never' : 'once a week'}. Attractive, fit people tend to date other fit people.`,
      action: 'Start with 3 days a week of exercise, even walking. Build to 4 to 5 days. This is the single highest ROI change you can make: it improves your Relate Score, your health, your confidence, and your attractiveness to the people you want to date.',
      category: 'honesty',
    });
  }

  // Wants high income but has low income themselves
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

  // Conflict style coaching that affects dating
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

  // Geographic arbitrage opportunity
  if (national && national.matchCount > matchCount * 3 && matchCount < 100) {
    insights.push({
      priority: 'low',
      title: 'Your Market Is Better Elsewhere',
      description: `Nationally, your estimated matches jump to ${national.matchCount.toLocaleString()} vs. ${matchCount.toLocaleString()} locally. ${metro} may not be the best market for what you\'re looking for.`,
      action: 'If relocation is feasible, research metros with better demographics for your profile. Even within your state, a larger metro might triple your pool. Dating apps with wider radius settings can help in the short term.',
      category: 'expansion',
    });
  }

  // Match probability coaching
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

  // Sort: high > medium > low
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
    <section className="card mb-4">
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-secondary">{label}</span>
      <span className="text-sm font-mono">{value}</span>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-border last:border-0">
      <span className="text-xs text-secondary">{label}</span>
      <span className="text-xs font-mono capitalize">{value}</span>
    </div>
  );
}
