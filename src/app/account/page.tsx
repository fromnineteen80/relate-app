'use client';

import { Component, Suspense, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { config, PRICING, type PricingTier } from '@/lib/config';
import { getMockPaymentStatus, mockPurchase } from '@/lib/mock/payments';
import { fetchPaymentTier, refreshPaymentTier } from '@/lib/payments';
import { getProfile } from '@/lib/onboarding';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';
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

class AccountErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Account page error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
          <h1 className="font-serif text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-secondary mb-4">There was an error loading your account page. This is usually caused by stale cached data.</p>
          <div className="flex gap-3">
            <button onClick={() => { localStorage.removeItem('relate_payment_tier'); window.location.reload(); }} className="btn-primary text-xs">Clear Cache &amp; Reload</button>
            <button onClick={() => window.location.href = '/results'} className="btn-secondary text-xs">Go to Results</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AccountPageWrapper() {
  return (
    <AccountErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>}>
        <AccountPage />
      </Suspense>
    </AccountErrorBoundary>
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
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [partnerPersonaName, setPartnerPersonaName] = useState<string | null>(null);
  const [partnerAssessmentComplete, setPartnerAssessmentComplete] = useState(false);
  const [partnerHasResults, setPartnerHasResults] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<Record<number, boolean>>({});
  const [mockUpgrading, setMockUpgrading] = useState(false);
  const [profileData, setProfileData] = useState<{ firstName: string; lastName: string; photoUrl: string | null } | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [m1Data, setM1Data] = useState<M1Scored | null>(null);
  const [m2Data, setM2Data] = useState<M2Scored | null>(null);
  const [m3Data, setM3Data] = useState<M3Scored | null>(null);
  const [m4Data, setM4Data] = useState<M4Scored | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadingCoach, setDownloadingCoach] = useState(false);
  const [showCoachInfo, setShowCoachInfo] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
  const [activeDiscountCode, setActiveDiscountCode] = useState<string | null>(null);

  // Fetch payment tier (works in both mock and real mode)
  useEffect(() => {
    if (!user) return;
    const isSuccess = searchParams.get('success') === 'true';

    async function loadTier() {
      const fetcher = isSuccess ? refreshPaymentTier : fetchPaymentTier;
      const { tier } = await fetcher(user!.email);
      setCurrentTier(tier);
      if (isSuccess) setPaymentSuccess(true);

      // Also check for active discount code
      try {
        const res = await fetch(`/api/subscription-status?email=${encodeURIComponent(user!.email)}`);
        const data = await res.json();
        if (data.discountCode) setActiveDiscountCode(data.discountCode);
        if (data.subscription?.discount) setActiveDiscountCode(data.subscription.discount.name);
      } catch { /* ignore */ }
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
    setProfilePhoto(localStorage.getItem('relate_profile_photo'));

    // Load partner info from API
    if (user?.id) {
      fetch(`/api/partner-lookup?userId=${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.partner) {
            setHasPartner(true);
            setPartnerEmail(data.partner.email);
            const name = data.partner.firstName
              ? `${data.partner.firstName}${data.partner.lastName ? ` ${data.partner.lastName}` : ''}`
              : null;
            setPartnerName(name);
            if (data.connectedAt) setConnectedAt(data.connectedAt);
            if (data.partner.personaName) setPartnerPersonaName(data.partner.personaName);
            if (data.partner.assessmentComplete) setPartnerAssessmentComplete(true);
            if (data.partner.hasResults) setPartnerHasResults(true);
            localStorage.setItem('relate_partner_email', data.partner.email);
            if (data.partner.hasResults) localStorage.setItem('relate_partner_results', 'true');
          }
        })
        .catch(() => { /* silent */ });
    }
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
      .catch(() => { /* silent fail, market data is optional */ })
      .finally(() => setMarketLoading(false));
  }, [user, marketData]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  async function handleDeleteAccount() {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      // Clear all local data
      const keys = Object.keys(localStorage).filter(k => k.startsWith('relate_'));
      keys.forEach(k => localStorage.removeItem(k));
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Account deletion failed:', err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
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
      <SubNav items={[
        { id: 'profile', label: 'Profile', href: '#profile', show: true },
        { id: 'subscription', label: 'Subscription', href: '#subscription', show: true },
        { id: 'assessment', label: 'Assessment', href: '#assessment', show: true },
        { id: 'downloads', label: 'Downloads', href: '#downloads', show: hasResults },
        { id: 'coaching', label: 'Coaching', href: '#coaching', show: true },
      ]} />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <h1 className="font-serif text-3xl font-semibold mb-8">Account</h1>

        {/* ── Payment Success Toast ── */}
        {paymentSuccess && (
          <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-md flex items-center gap-3 animate-fade-in">
            <span className="text-success text-lg">✓</span>
            <div>
              <p className="text-sm font-medium">Payment successful</p>
              <p className="text-xs text-secondary">Your account has been upgraded to {(PRICING[currentTier]?.label || currentTier)}.</p>
            </div>
          </div>
        )}

        {/* ── Profile ── */}
        <section id="profile" className="card mb-4 scroll-mt-32">
          <div className="flex items-center justify-between gap-6 flex-wrap mb-4">
            <h2 className="font-serif text-lg font-semibold">Profile</h2>
            <Link href="/onboarding/profile" className="text-xs text-accent hover:underline">Edit</Link>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-border">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
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

        {/* ── Subscription & Partner ── */}
        <div id="subscription" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 scroll-mt-32">
          {/* Subscription Card */}
          <section className="card">
            <div className="flex items-center justify-between gap-6 flex-wrap mb-4">
              <h2 className="font-serif text-lg font-semibold">Subscription</h2>
              <Link href="/settings/billing" className="text-xs text-accent hover:underline">Change</Link>
            </div>

            {/* Individual tier badge, shown for paid/test accounts */}
            {currentTier !== 'free' && (() => {
              // Determine the individual-level tier (strip couples to show its individual component)
              const individualTier: PricingTier = currentTier === 'couples' ? 'pro' : currentTier;
              const individualDescriptions: Record<string, string> = {
                plus: 'Full report, all 16 matches, PDF download.',
                premium: 'Plus features + rate-limited AI advisor + retake assessment.',
                pro: 'Everything in Premium + unlimited AI advisor.',
              };
              return (
                <div className="flex items-center gap-3 p-3 mb-3 rounded-md border bg-stone-50 border-stone-300">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-stone-200 text-stone-600">
                    &#10003;
                  </div>
                  <div>
                    <p className="text-sm font-medium">{PRICING[individualTier]?.label || individualTier}: Active</p>
                    <p className="text-xs text-secondary">{individualDescriptions[individualTier] || ''}</p>
                  </div>
                </div>
              );
            })()}

            {/* Couples tier badge, shown when user has couples */}
            {currentTier === 'couples' && (
              <div className="flex items-center gap-3 p-3 mb-3 rounded-md border bg-stone-50 border-stone-300">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-stone-200 text-stone-600">
                  &#10003;
                </div>
                <div>
                  <p className="text-sm font-medium">Couples: Active</p>
                  <p className="text-xs text-secondary">Partner compatibility report, shared advisor, combined tools.</p>
                </div>
              </div>
            )}

            {/* Couples upgrade option, shown for paid accounts that don't have couples yet */}
            {currentTier !== 'free' && currentTier !== 'couples' && (
              <div className="p-3 border rounded-md border-border mt-1">
                <p className="text-sm font-medium">Couples</p>
                <p className="font-serif text-xl font-semibold my-1">{PRICING.couples.priceDisplay}</p>
                <p className="text-xs text-secondary mb-3">Add your partner for a couples compatibility report and shared advisor tools.</p>
                {config.useMockPayments ? (
                  <button onClick={() => handleMockUpgrade('couples')} className="text-xs w-full btn-secondary" disabled={mockUpgrading}>
                    {mockUpgrading ? 'Processing...' : 'Upgrade to Couples'}
                  </button>
                ) : (
                  <a href={`/api/checkout?product=couples&email=${encodeURIComponent(user?.email || '')}`} className="text-xs w-full text-center block btn-secondary">
                    Upgrade to Couples
                  </a>
                )}
              </div>
            )}

            {/* Free tier: show current status + test access + upgrade options + discount code */}
            {currentTier === 'free' && (
              <>
                <div className="flex items-center gap-3 p-3 mb-3 rounded-md border bg-stone-50 border-border">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-stone-200 text-secondary">
                    -
                  </div>
                  <div>
                    <p className="text-sm font-medium">Free: Active</p>
                    <p className="text-xs text-secondary">Persona code, top 3 matches, 3 advisor messages.</p>
                  </div>
                </div>

                <div className="mb-3">
                  <TestAccessCard />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIER_ORDER.filter(t => t !== 'free').map(tier => (
                    <div key={tier} className="p-3 border rounded-md border-border">
                      <p className="text-sm font-medium">{PRICING[tier]?.label || tier}</p>
                      <p className="font-serif text-xl font-semibold my-1">{PRICING[tier]?.priceDisplay || ''}</p>
                      <p className="text-xs text-secondary mb-3">
                        {tier === 'plus' && 'All 16 matches, conflict analysis, growth path, PDF report.'}
                        {tier === 'premium' && 'Plus features + rate-limited AI advisor + retake assessment.'}
                        {tier === 'pro' && 'Everything in Premium + unlimited AI advisor.'}
                        {tier === 'couples' && 'Pro for both + compatibility report + shared tools.'}
                      </p>
                      {config.useMockPayments ? (
                        <button onClick={() => handleMockUpgrade(tier)} className="text-xs w-full btn-secondary" disabled={mockUpgrading}>
                          {mockUpgrading ? 'Processing...' : `Upgrade to ${PRICING[tier]?.label || tier}`}
                        </button>
                      ) : (
                        <a href={`/api/checkout?product=${tier}&email=${encodeURIComponent(user?.email || '')}`} className="text-xs w-full text-center block btn-secondary">
                          Upgrade to {PRICING[tier]?.label || tier}
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Discount Code, only for free users */}
                <div className="mt-4 pt-4 border-t border-border">
                  {activeDiscountCode ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded">Discount Active</span>
                      <span className="text-xs font-mono">{activeDiscountCode}</span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Partner Card */}
          <section className="card">
            <div className="flex items-center justify-between gap-6 flex-wrap mb-4">
              <h2 className="font-serif text-lg font-semibold">Partner</h2>
              {hasPartner && <Link href="/invite" className="text-xs text-accent hover:underline">Manage</Link>}
            </div>

            {hasPartner ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-success/5 border border-success/20 rounded-md">
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-medium flex-shrink-0 overflow-hidden">
                    {partnerName ? partnerName.charAt(0).toUpperCase() : partnerEmail?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{partnerName || partnerEmail || 'Partner'}</p>
                      <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded flex-shrink-0">Connected</span>
                    </div>
                    {partnerPersonaName ? (
                      <p className="text-xs text-secondary truncate">{partnerPersonaName}</p>
                    ) : partnerName && partnerEmail ? (
                      <p className="text-xs text-secondary truncate">{partnerEmail}</p>
                    ) : null}
                    {connectedAt && (
                      <p className="text-xs text-secondary mt-0.5">Connected {new Date(connectedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    )}
                  </div>
                </div>
                {currentTier === 'couples' ? (
                  <Link href="/results/compare" className="btn-primary text-xs w-full text-center block">View Couples Results</Link>
                ) : (
                  <div>
                    <p className="text-xs text-secondary mb-2">Upgrade to Couples tier to unlock your compatibility report.</p>
                    <Link href="/invite" className="btn-primary text-xs w-full text-center block">Activate Couples</Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-secondary">
                  Connect with your partner by email to unlock your couples compatibility results.
                </p>
                <Link href="/invite" className="btn-primary text-xs inline-block">Connect Partner</Link>
              </div>
            )}
          </section>
        </div>

        {/* ── Assessment Progress ── */}
        <section id="assessment" className="card mb-4 scroll-mt-32">
          <div className="flex items-center justify-between gap-6 flex-wrap mb-4">
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

        {/* ── Downloads ── */}
        {hasResults && (
          <section id="downloads" className="card mb-4 scroll-mt-32">
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
                  <button onClick={handleDownloadPDF} disabled={downloading} className="btn-secondary text-xs flex-shrink-0">
                    {downloading ? 'Preparing...' : 'Download'}
                  </button>
                ) : (
                  <a href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary text-xs flex-shrink-0">
                    Upgrade
                  </a>
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
                  <button onClick={handleDownloadCoach} disabled={downloadingCoach} className="btn-secondary text-xs flex-shrink-0">
                    {downloadingCoach ? 'Preparing...' : 'Download'}
                  </button>
                ) : (
                  <a href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary text-xs flex-shrink-0">
                    Upgrade
                  </a>
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
                  <button onClick={handleDownloadCoachMd} disabled={downloadingCoach} className="btn-secondary text-xs flex-shrink-0">
                    {downloadingCoach ? 'Preparing...' : 'Download'}
                  </button>
                ) : (
                  <a href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary text-xs flex-shrink-0">
                    Upgrade
                  </a>
                )}
              </div>
            </div>
          </section>
        )}


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
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-serif text-lg font-semibold">Feedback</h2>
              <p className="text-xs text-secondary">Help us improve RELATE</p>
            </div>
            <Link href="/feedback" className="btn-secondary text-xs">
              Send Feedback
            </Link>
          </div>
        </section>

        {/* ── Sign Out & Delete ── */}
        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-secondary text-xs text-danger">
            Delete Account
          </button>
          <button onClick={handleSignOut} className="btn-secondary text-xs">
            Sign out
          </button>
        </div>

        {/* ── Delete Confirmation Modal ── */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm mx-4 p-6">
              <h3 className="font-serif text-lg font-semibold mb-2">Delete your account?</h3>
              <p className="text-sm text-secondary mb-4">
                This will permanently delete your account, assessment data, results, and all associated information. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={deleting} className="bg-danger text-white text-xs font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Ongoing Coaching Section (darker background, outside main container) ── */}
      {hasResults && canDownload && (
        <div id="coaching" ref={coachingSectionRef} className="bg-stone-100 border-t border-border scroll-mt-32">
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
      <SiteFooter />
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

  const metroShort = metro.includes(',') ? metro.split(',')[0] : metro;

  // Funnel milestones
  const milestones = [
    { label: 'Metro Population', value: metroPop, desc: 'Total population in your metro area' },
    { label: 'Metro Singles Pool', value: pool?.localSinglePool || 0, desc: 'Unmarried adults of your preferred gender and orientation' },
    { label: 'Your Realistic Match Pool', value: pool?.realisticPool || 0, desc: 'Singles within your age range and income requirements' },
    { label: 'Your Preferred Pool', value: pool?.preferredPool || 0, desc: 'Singles who additionally meet your lifestyle preferences' },
    { label: 'Your Ideal Match Pool', value: pool?.idealPool || 0, desc: 'Singles who meet every preference you set' },
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
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-secondary mt-2">
            Each bar shows your local percentile (0 = bottom, 100 = top).
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
              const singlesPool = milestones[1].value || 1;
              let pctOfSingles = '';
              if (i >= 1) {
                const raw = (m.value / singlesPool) * 100;
                if (isLast) {
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
          <p className="font-mono text-2xl font-semibold mt-1">{prob?.percentage || 'N/A'}</p>
          <p className="text-xs text-secondary mt-1">
            Chance of matching with someone from your ideal pool
          </p>
        </div>
        <div className="text-center">
          <span className="text-xs font-mono text-secondary uppercase tracking-wider">Estimated Matches</span>
          <p className="font-mono text-2xl font-semibold mt-1">{matchCount.toLocaleString()}</p>
          <p className="text-xs text-secondary mt-1">
            Number of Singles from your Ideal Match Pool in the surrounding {metroShort} metro area likely to be interested in you based on your own reported stats
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-secondary">{label}</span>
      <span className="text-sm font-mono">{value}</span>
    </div>
  );
}

