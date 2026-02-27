'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { config } from '@/lib/config';
import { getMockPaymentStatus, mockPurchase } from '@/lib/mock/payments';
import { SiteHeader } from '@/components/SiteHeader';

type PaymentInfo = { paid: boolean; product: string | null };
type Demographics = { age?: number; gender?: string; relationshipStatus?: string; seeking?: string; location?: string };

export default function AccountPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentInfo>({ paid: false, product: null });
  const [demographics, setDemographics] = useState<Demographics>({});
  const [gender, setGender] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState(false);
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<number, boolean>>({});
  const [mockUpgrading, setMockUpgrading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Load payment status
    if (config.useMockPayments) {
      setPayment(getMockPaymentStatus());
    }

    // Load demographics
    const demoStr = localStorage.getItem('relate_demographics');
    if (demoStr) {
      try { setDemographics(JSON.parse(demoStr)); } catch { /* ignore */ }
    }
    setGender(localStorage.getItem('relate_gender'));

    // Load assessment progress
    const progress: Record<number, boolean> = {};
    for (let m = 1; m <= 4; m++) {
      progress[m] = localStorage.getItem(`relate_m${m}_completed`) === 'true';
    }
    setModuleProgress(progress);

    // Check results
    setHasResults(!!localStorage.getItem('relate_results'));

    // Check partner
    setHasPartner(!!localStorage.getItem('relate_partner_results'));
    setPartnerEmail(localStorage.getItem('relate_partner_email'));
  }, [authLoading, user, router]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  function handleMockUpgrade(product: 'full_report' | 'couples_report') {
    setMockUpgrading(true);
    mockPurchase(product);
    setPayment(getMockPaymentStatus());
    setTimeout(() => setMockUpgrading(false), 500);
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const completedModules = Object.values(moduleProgress).filter(Boolean).length;
  const assessmentComplete = completedModules === 4;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <h1 className="font-serif text-3xl font-semibold mb-8">Account</h1>

        {/* ── Profile ── */}
        <section className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold">Profile</h2>
            <Link href="/onboarding/demographics" className="text-xs text-accent hover:underline">
              Edit demographics
            </Link>
          </div>
          <div className="space-y-3">
            <Row label="Email" value={user?.email || '—'} />
            <Row label="Gender" value={gender === 'M' ? 'Man' : gender === 'W' ? 'Woman' : '—'} />
            {demographics.age && <Row label="Age" value={String(demographics.age)} />}
            {demographics.relationshipStatus && (
              <Row label="Relationship Status" value={demographics.relationshipStatus} />
            )}
            {demographics.seeking && <Row label="Seeking" value={demographics.seeking} />}
          </div>
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
        </section>

        {/* ── Subscription & Purchases ── */}
        <section className="card mb-4">
          <h2 className="font-serif text-lg font-semibold mb-4">Subscription</h2>

          {payment.paid ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-md">
                <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center text-sm flex-shrink-0">✓</div>
                <div>
                  <p className="text-sm font-medium">
                    {payment.product === 'couples_report' ? 'Couples Report' : 'Full Report'} — Active
                  </p>
                  <p className="text-xs text-secondary">One-time purchase. Full access to all features.</p>
                </div>
              </div>

              {payment.product === 'full_report' && (
                <div className="p-3 border border-border rounded-md">
                  <p className="text-sm font-medium mb-1">Upgrade to Couples</p>
                  <p className="text-xs text-secondary mb-3">
                    Add partner comparison, growth challenges, conversation cards, and shared advisor.
                  </p>
                  {config.useMockPayments ? (
                    <button onClick={() => handleMockUpgrade('couples_report')} className="btn-primary text-xs" disabled={mockUpgrading}>
                      {mockUpgrading ? 'Upgrading...' : 'Upgrade — $29'}
                    </button>
                  ) : (
                    <Link href="/api/checkout?product=couples_report" className="btn-primary text-xs inline-block">
                      Upgrade — $29
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-stone-50 border border-border rounded-md">
                <div className="w-8 h-8 rounded-full bg-stone-200 text-secondary flex items-center justify-center text-sm flex-shrink-0">—</div>
                <div>
                  <p className="text-sm font-medium">Free Tier</p>
                  <p className="text-xs text-secondary">Persona code, top 3 matches, 3 advisor messages.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border border-accent rounded-md">
                  <p className="text-sm font-medium">Full Report</p>
                  <p className="font-serif text-xl font-semibold my-1">$19</p>
                  <p className="text-xs text-secondary mb-3">All 16 matches, conflict analysis, unlimited advisor.</p>
                  {config.useMockPayments ? (
                    <button onClick={() => handleMockUpgrade('full_report')} className="btn-primary text-xs w-full" disabled={mockUpgrading}>
                      {mockUpgrading ? 'Processing...' : 'Purchase'}
                    </button>
                  ) : (
                    <Link href="/api/checkout?product=full_report" className="btn-primary text-xs w-full text-center block">
                      Purchase
                    </Link>
                  )}
                </div>

                <div className="p-3 border border-border rounded-md">
                  <p className="text-sm font-medium">Couples Report</p>
                  <p className="font-serif text-xl font-semibold my-1">$29</p>
                  <p className="text-xs text-secondary mb-3">Full report + partner comparison and growth tools.</p>
                  {config.useMockPayments ? (
                    <button onClick={() => handleMockUpgrade('couples_report')} className="btn-primary text-xs w-full" disabled={mockUpgrading}>
                      {mockUpgrading ? 'Processing...' : 'Purchase'}
                    </button>
                  ) : (
                    <Link href="/api/checkout?product=couples_report" className="btn-primary text-xs w-full text-center block">
                      Purchase
                    </Link>
                  )}
                </div>
              </div>
            </div>
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
            <div>
              <p className="text-sm text-secondary mb-4">
                Invite your partner to take the assessment. Once they complete it, you&apos;ll unlock couples features — compatibility report, growth challenges, conversation cards, and shared advisor.
              </p>
              <Link href="/invite" className="btn-primary text-xs inline-block">Invite Partner</Link>
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
