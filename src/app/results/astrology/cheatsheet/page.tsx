'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';
import { useAuth } from '@/lib/auth-context';
import { loadChartResult, type BirthChartResult } from '@/lib/astrology/engine';
import { ALL_SIGNS, SIGN_DATA, ELEMENT_COLORS } from '@/lib/astrology/signs';
import { generateCompatibilityRead, type CompatibilityRead } from '@/lib/astrology/compatibility';
import type { ZodiacSign } from '@/lib/astrology/engine';

export default function CheatSheetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [chart, setChart] = useState<BirthChartResult | null>(null);
  const [expandedSign, setExpandedSign] = useState<ZodiacSign | null>(null);

  useEffect(() => {
    if (!loading && !user) { router.push('/auth/login'); return; }
    const existing = loadChartResult();
    if (existing) {
      setChart(existing);
      setExpandedSign(existing.sun.sign);
    }
  }, [user, loading, router]);

  // Generate compatibility reads for all 12 signs based on her chart
  const compatReads = useMemo(() => {
    if (!chart) return null;
    const reads: Record<string, CompatibilityRead> = {};
    for (const sign of ALL_SIGNS) {
      reads[sign] = generateCompatibilityRead(chart, sign);
    }
    return reads;
  }, [chart]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  if (!chart) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full text-center">
          <h1 className="font-serif text-2xl font-semibold mb-4">Calculate Your Chart First</h1>
          <p className="text-sm text-secondary mb-6">
            Your cheat sheet is personalized to your specific Sun, Moon, and Rising placements. Complete your birth chart to unlock it.
          </p>
          <Link href="/results/astrology" className="btn-primary text-sm">Enter Birth Details</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const herSunSign = chart.sun.sign;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <Link href="/results/astrology" className="text-xs text-secondary hover:text-foreground mb-4 inline-block">&larr; Back to Profile</Link>
        <span className="font-mono text-xs text-secondary uppercase tracking-wider block">Sun, Moon &amp; Rise</span>
        <h1 className="font-serif text-2xl font-semibold mt-1 mb-2">Your 12 Sign Cheat Sheet</h1>
        <p className="text-sm text-secondary mb-6">
          These reads are personalized to your <span className="font-medium text-foreground">{herSunSign} Sun</span>, <span className="font-medium text-foreground">{chart.moon.sign} Moon</span>, and <span className="font-medium text-foreground">{chart.rising.sign} Rising</span>. Tap any sign to see how that type of man connects with your specific chart.
        </p>

        {/* Sign grid */}
        <div className="space-y-3">
          {ALL_SIGNS.map(signName => {
            const sign = SIGN_DATA[signName];
            const colors = ELEMENT_COLORS[sign.element];
            const isSameSun = signName === herSunSign;
            const isExpanded = expandedSign === signName;
            const read = compatReads?.[signName];

            return (
              <div key={signName} className={`border rounded-md overflow-hidden transition-colors ${isSameSun ? colors.border + ' ' + colors.bg : 'border-border'}`}>
                <button
                  onClick={() => setExpandedSign(isExpanded ? null : signName)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sign.symbol}</span>
                    <div>
                      <span className="font-serif font-semibold text-sm">{sign.name} Man</span>
                      {isSameSun && <span className="ml-2 text-xs font-mono text-accent">Same Sun</span>}
                      <span className="block text-xs text-secondary">{sign.dateRange} · {sign.element} · {sign.rulingPlanet}</span>
                    </div>
                  </div>
                  <span className="text-secondary text-xs">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && read && (
                  <div className="px-4 pb-4 space-y-3 animate-fade-in">
                    <div className="border-t border-border pt-3" />
                    <CheatRow label="Dating Read" content={read.dating} />
                    <CheatRow label="Superpower" content={read.strength} icon="✦" iconColor="text-success" />
                    <CheatRow label="Watch Out For" content={read.challenge} icon="⚡" iconColor="text-warning" />
                    <CheatRow label="Tip for You" content={read.tip} icon="♡" iconColor="text-accent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Link href="/results/astrology" className="btn-secondary text-sm">Back to Your Profile</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function CheatRow({ label, content, icon, iconColor }: { label: string; content: string; icon?: string; iconColor?: string }) {
  return (
    <div>
      <span className="font-mono text-xs text-secondary uppercase tracking-wider">{label}</span>
      <p className="text-sm mt-0.5 flex gap-2">
        {icon && <span className={iconColor || 'text-secondary'}>{icon}</span>}
        <span>{content}</span>
      </p>
    </div>
  );
}
