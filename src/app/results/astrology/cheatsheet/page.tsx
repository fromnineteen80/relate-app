'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuth } from '@/lib/auth-context';
import { loadChartResult, type BirthChartResult } from '@/lib/astrology/engine';
import { ALL_SIGNS, SIGN_DATA, ELEMENT_COLORS, type SignData } from '@/lib/astrology/signs';
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const sunSign = chart?.sun.sign || null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <Link href="/results/astrology" className="text-xs text-secondary hover:text-foreground mb-4 inline-block">&larr; Back to Profile</Link>
        <span className="font-mono text-xs text-secondary block">Sun, Moon &amp; Rise</span>
        <h1 className="font-serif text-2xl font-semibold mt-1 mb-2">The 12-Sign Cheat Sheet</h1>
        <p className="text-sm text-secondary mb-6">
          {sunSign
            ? <>Your Sun is in <span className="font-medium text-foreground">{sunSign}</span> — that sign is highlighted below. Tap any sign to see its dating quick-read.</>
            : <>Tap any sign to see its dating quick-read. Complete your birth chart to see your sign highlighted.</>
          }
        </p>

        {/* ── Sign grid ── */}
        <div className="space-y-3">
          {ALL_SIGNS.map(signName => {
            const sign = SIGN_DATA[signName];
            const colors = ELEMENT_COLORS[sign.element];
            const isSun = signName === sunSign;
            const isExpanded = expandedSign === signName;

            return (
              <div key={signName} className={`border rounded-md overflow-hidden transition-colors ${isSun ? colors.border + ' ' + colors.bg : 'border-border'}`}>
                <button
                  onClick={() => setExpandedSign(isExpanded ? null : signName)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sign.symbol}</span>
                    <div>
                      <span className="font-serif font-semibold text-sm">{sign.name}</span>
                      {isSun && <span className="ml-2 text-xs font-mono text-accent">Your Sun</span>}
                      <span className="block text-xs text-secondary">{sign.dateRange} · {sign.element} · {sign.rulingPlanet}</span>
                    </div>
                  </div>
                  <span className="text-secondary text-xs">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 animate-fade-in">
                    <div className="border-t border-border pt-3" />
                    <CheatRow label="Dating Quick-Read" content={sign.cheatDating} />
                    <CheatRow label="Superpower" content={sign.cheatStrength} icon="✦" iconColor="text-success" />
                    <CheatRow label="Watch Out For" content={sign.cheatChallenge} icon="⚡" iconColor="text-warning" />
                    <CheatRow label="Tip" content={sign.cheatTip} icon="→" iconColor="text-accent" />
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
