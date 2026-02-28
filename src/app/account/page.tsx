'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { config, PRICING, type PricingTier } from '@/lib/config';
import { getMockPaymentStatus, mockPurchase } from '@/lib/mock/payments';
import { getProfile } from '@/lib/onboarding';
import { SiteHeader } from '@/components/SiteHeader';

type Demographics = { age?: number; gender?: string; relationshipStatus?: string; seeking?: string };

const TIER_ORDER: PricingTier[] = ['free', 'plus', 'premium', 'couples'];

function tierIndex(t: PricingTier) { return TIER_ORDER.indexOf(t); }

export default function AccountPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (config.useMockPayments) {
      setCurrentTier(getMockPaymentStatus().tier);
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

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const completedModules = Object.values(moduleProgress).filter(Boolean).length;
  const assessmentComplete = completedModules === 4;
  const initial = profileData?.firstName ? profileData.firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <h1 className="font-serif text-3xl font-semibold mb-8">Account</h1>

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

          {/* Current tier badge */}
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

          {/* Upgrade options */}
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
                    <Link href={`/api/checkout?product=${tier}`} className={`text-xs w-full text-center block ${tier === 'premium' ? 'btn-primary' : 'btn-secondary'}`}>
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
              View Results
            </Link>
          )}
          {assessmentComplete && (currentTier === 'premium' || currentTier === 'couples') && (
            <p className="text-xs text-secondary mt-2 text-center">
              As a {PRICING[currentTier].label} member, you can retake the assessment at any time.
            </p>
          )}
        </section>

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

              {/* Search by email or URL */}
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

              {/* Share your link */}
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
