'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { config, PRICING, type PricingTier } from '@/lib/config';
import { getMockPaymentStatus, mockPurchase } from '@/lib/mock/payments';
import { fetchPaymentTier, refreshPaymentTier } from '@/lib/payments';
import { getProfile } from '@/lib/onboarding';
import { SiteHeader } from '@/components/SiteHeader';

type Demographics = { age?: number; gender?: string; relationshipStatus?: string; seeking?: string };

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
  };
};

type M4Scored = {
  result?: {
    conflictApproach?: { approach?: string; score?: number };
    emotionalDrivers?: { primary?: string; secondary?: string };
    repairRecovery?: {
      speed?: { style?: string };
      mode?: { style?: string };
    };
    emotionalCapacity?: { level?: string; score?: number };
    gottmanScreener?: {
      horsemen?: Record<string, { score?: number; riskLevel?: string }>;
      overallRisk?: string;
    };
  };
};

type MatchResult = { rank: number; code: string; name: string; tier: string; compatibilityScore: number; traits: string; summary: string };

const TIER_ORDER: PricingTier[] = ['free', 'plus', 'premium', 'couples'];

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
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
      } catch { /* ignore */ }
    }

    setHasResults(!!localStorage.getItem('relate_results'));
    setHasPartner(!!localStorage.getItem('relate_partner_results'));
    setPartnerEmail(localStorage.getItem('relate_partner_email'));
    setProfileData(getProfile());
  }, [authLoading, user, router]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  function handleMockUpgrade(tier: PricingTier) {
    setMockUpgrading(true);
    mockPurchase(tier);
    setCurrentTier(getMockPaymentStatus().tier);
    setTimeout(() => setMockUpgrading(false), 500);
  }

  function handleCopyLink() {
    const url = `${config.appUrl}/u/${user?.id || ''}`;
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
  }, []);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const completedModules = Object.values(moduleProgress).filter(Boolean).length;
  const assessmentComplete = completedModules === 4;
  const initial = profileData?.firstName ? profileData.firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?';
  const hasPaid = currentTier !== 'free';
  const canDownload = hasPaid;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <h1 className="font-serif text-3xl font-semibold mb-8">Account</h1>

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
        <section className="card mb-4">
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
            {demographics.relationshipStatus && <Row label="Status" value={demographics.relationshipStatus} />}
            {demographics.seeking && <Row label="Seeking" value={demographics.seeking} />}
          </div>
        </section>

        {/* ── Subscription ── */}
        <section className="card mb-4">
          <h2 className="font-serif text-lg font-semibold mb-4">Subscription</h2>

          <div className={`flex items-center gap-3 p-3 mb-4 rounded-md border ${
            currentTier !== 'free' ? 'bg-success/5 border-success/20' : 'bg-stone-50 border-border'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
              currentTier !== 'free' ? 'bg-success/10 text-success' : 'bg-stone-200 text-secondary'
            }`}>
              {currentTier !== 'free' ? '✓' : '-'}
            </div>
            <div>
              <p className="text-sm font-medium">{PRICING[currentTier].label}: Active</p>
              <p className="text-xs text-secondary">
                {currentTier === 'free' && 'Persona code, top 3 matches, 3 advisor messages.'}
                {currentTier === 'plus' && 'Full report, all 16 matches, PDF download.'}
                {currentTier === 'premium' && 'Full report, AI advisor, assessment retakes, PDF download.'}
                {currentTier === 'couples' && 'Everything for both partners, couples report, shared advisor.'}
              </p>
            </div>
          </div>

          {currentTier !== 'couples' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIER_ORDER.filter(t => t !== 'free' && tierIndex(t) > tierIndex(currentTier)).map(tier => (
                <div key={tier} className={`p-3 border rounded-md ${tier === 'premium' ? 'border-accent' : 'border-border'}`}>
                  <p className="text-sm font-medium">{PRICING[tier].label}</p>
                  <p className="font-serif text-xl font-semibold my-1">{PRICING[tier].priceDisplay}</p>
                  <p className="text-xs text-secondary mb-3">
                    {tier === 'plus' && 'All 16 matches, conflict analysis, growth path, PDF report.'}
                    {tier === 'premium' && 'Plus features + AI advisor + retake assessment.'}
                    {tier === 'couples' && 'Premium for both + compatibility report + shared tools.'}
                  </p>
                  {config.useMockPayments ? (
                    <button onClick={() => handleMockUpgrade(tier)} className={`text-xs w-full ${tier === 'premium' ? 'btn-primary' : 'btn-secondary'}`} disabled={mockUpgrading}>
                      {mockUpgrading ? 'Processing...' : `Upgrade to ${PRICING[tier].label}`}
                    </button>
                  ) : (
                    <Link href={`/api/checkout?product=${tier}&email=${encodeURIComponent(user?.email || '')}`} className={`text-xs w-full text-center block ${tier === 'premium' ? 'btn-primary' : 'btn-secondary'}`}>
                      Upgrade to {PRICING[tier].label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Assessment Progress ── */}
        <section className="card mb-4">
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
          {assessmentComplete && (currentTier === 'premium' || currentTier === 'couples') && (
            <button
              onClick={() => {
                if (!confirm('This will clear your current assessment progress. Your existing results will still be available until you generate new ones. Continue?')) return;
                for (let m = 1; m <= 4; m++) {
                  localStorage.removeItem(`relate_m${m}_responses`);
                  localStorage.removeItem(`relate_m${m}_completed`);
                  localStorage.removeItem(`relate_m${m}_scored`);
                }
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
          <section className="card mb-4">
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
          <section className="card mb-4">
            <h2 className="font-serif text-lg font-semibold mb-4">Downloads</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm font-medium">Persona Card</p>
                  <p className="text-xs text-secondary">Your persona summary and key traits</p>
                </div>
                <Link href="/results/persona" className="btn-secondary text-xs">
                  View
                </Link>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Full PDF Report</p>
                  <p className="text-xs text-secondary">
                    {canDownload
                      ? 'Persona, dimensions, matches, and conflict profile'
                      : 'Available with Plus, Premium, or Couples'}
                  </p>
                </div>
                {canDownload ? (
                  <button onClick={handleDownloadPDF} disabled={downloading} className="btn-primary text-xs">
                    {downloading ? 'Preparing...' : 'Download'}
                  </button>
                ) : (
                  <Link href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-secondary text-xs">
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Partner Connection ── */}
        <section className="card mb-4">
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
                    {config.appUrl}/u/{user?.id || ''}
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

        {/* ── Sign Out ── */}
        <div className="pt-4 border-t border-border">
          <button onClick={handleSignOut} className="text-sm text-danger hover:underline">
            Sign out
          </button>
        </div>
      </main>
    </div>
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

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-border last:border-0">
      <span className="text-xs text-secondary">{label}</span>
      <span className="text-xs font-mono capitalize">{value}</span>
    </div>
  );
}
