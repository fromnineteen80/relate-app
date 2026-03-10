'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';
import { useAuth } from '@/lib/auth-context';
import {
  calculateBirthChart,
  saveBirthData,
  saveChartResult,
  loadBirthData,
  loadChartResult,
  type BirthChartResult,
} from '@/lib/astrology/engine';
import { getSignData, ELEMENT_COLORS } from '@/lib/astrology/signs';
import { generateProfileReads } from '@/lib/astrology/compatibility';
import { analyzePersonaAlignment, type PersonaAlignmentResult } from '@/lib/astrology/persona-alignment';
import { Icon } from '@/components/Icon';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AstrologyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ─── Result state ───
  const [chart, setChart] = useState<BirthChartResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [missingData, setMissingData] = useState(false);

  // ─── Persona alignment ───
  const [alignment, setAlignment] = useState<PersonaAlignmentResult | null>(null);
  const [personaName, setPersonaName] = useState<string | null>(null);

  function computeAlignment(chartResult: BirthChartResult) {
    try {
      const resultsStr = localStorage.getItem('relate_results');
      const demoStr = localStorage.getItem('relate_demographics');
      const demo = demoStr ? JSON.parse(demoStr) : undefined;
      if (resultsStr) {
        const results = JSON.parse(resultsStr);
        if (results.persona?.code && results.persona?.name) {
          setPersonaName(results.persona.name);
          setAlignment(analyzePersonaAlignment(results.persona.code, results.persona.name, chartResult, demo));
        }
      }
    } catch { /* */ }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    // Load existing chart
    const existingChart = loadChartResult();
    if (existingChart) {
      setChart(existingChart);
      computeAlignment(existingChart);
    }

    // Try astrology-specific birth data first, then fall back to demographics profile
    let existingBirth = loadBirthData();
    if (!existingBirth) {
      try {
        const demoStr = localStorage.getItem('relate_demographics');
        if (demoStr) {
          const demo = JSON.parse(demoStr);
          if (demo.birth_month != null && demo.birth_day && demo.birth_year) {
            let h24 = 12; // default noon if no time provided
            if (demo.birth_hour != null && demo.birth_ampm) {
              const h12 = parseInt(demo.birth_hour);
              h24 = demo.birth_ampm === 'PM' ? (h12 === 12 ? 12 : h12 + 12) : (h12 === 12 ? 0 : h12);
            }
            const lat = demo.birth_latitude ? parseFloat(demo.birth_latitude) : null;
            const lng = demo.birth_longitude ? parseFloat(demo.birth_longitude) : null;
            if (lat != null && lng != null) {
              existingBirth = {
                year: parseInt(demo.birth_year),
                month: parseInt(demo.birth_month),
                day: parseInt(demo.birth_day),
                hour: h24,
                minute: demo.birth_minute != null ? parseInt(demo.birth_minute) : 0,
                latitude: lat,
                longitude: lng,
                locationName: demo.birth_city || undefined,
              };
              // Persist so we don't need to rebuild next time
              saveBirthData(existingBirth);
            }
          }
        }
      } catch { /* */ }
    }

    if (existingBirth) {
      // Auto-calculate if birth data exists but no chart yet
      if (!existingChart && existingBirth.latitude && existingBirth.longitude && existingBirth.year && existingBirth.month != null && existingBirth.day) {
        setCalculating(true);
        calculateBirthChart(existingBirth).then(result => {
          saveChartResult(result);
          setChart(result);
          computeAlignment(result);
        }).catch(() => {}).finally(() => setCalculating(false));
      }
    } else {
      // No birth data anywhere — direct user to profile
      if (!existingChart) setMissingData(true);
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  if (calculating) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full flex items-center justify-center">
          <p className="text-secondary">Calculating your cosmic blueprint...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // ─── Missing birth data — send to profile ───
  if (missingData || !chart) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
          <Link href="/results" className="text-xs text-secondary hover:text-foreground mb-4 inline-block">&larr; Back to Results</Link>
          <span className="font-mono text-xs text-secondary uppercase tracking-wider block">Sun, Moon &amp; Rise</span>
          <h1 className="font-serif text-2xl font-semibold mt-1 mb-2">Your Cosmic Blueprint</h1>
          <div className="card text-center py-8">
            <Icon name="stars" size={40} className="text-accent mx-auto mb-3" />
            <p className="text-secondary mb-4">
              Add your birth date, time, and city in your profile to unlock your astrology blueprint.
            </p>
            <Link href="/settings/profile" className="btn-primary text-sm inline-block">
              Edit Profile
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // ─── Profile view (chart already calculated) ───
  const sunSign = getSignData(chart.sun.sign);
  const moonSign = getSignData(chart.moon.sign);
  const risingSign = getSignData(chart.rising.sign);
  const profileReads = generateProfileReads(chart);

  const cards: { label: string; icon: React.ReactNode; placement: typeof chart.sun; data: typeof sunSign; description: string }[] = [
    { label: 'Sun', icon: '☉', placement: chart.sun, data: sunSign, description: profileReads.sunRead },
    { label: 'Moon', icon: '☽', placement: chart.moon, data: moonSign, description: profileReads.moonRead },
    { label: 'Rising', icon: <Icon name="north_east" size={28} fill={false} weight={500} className={ELEMENT_COLORS[risingSign.element].text} />, placement: chart.rising, data: risingSign, description: profileReads.risingRead },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <span className="font-mono text-xs text-secondary uppercase tracking-wider">Sun, Moon &amp; Rise</span>
          <div className="flex items-baseline justify-between gap-4 mt-1">
            <h1 className="font-serif text-2xl font-semibold">Your Cosmic Blueprint</h1>
            <Link href="/results/astrology/cheatsheet" className="text-sm text-accent hover:underline shrink-0">
              View Dating Cheat Sheet
            </Link>
          </div>
        </div>

        {/* ── Persona–Astrology Alignment Card ── */}
        {alignment && (
          <div className="card border border-accent/30 bg-accent/5 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg shrink-0">
                ✦
              </div>
              <div>
                <span className="font-mono text-xs text-accent uppercase tracking-wider">
                  {personaName} + Your Stars
                </span>
                <h3 className="font-serif text-lg font-semibold mt-0.5">Persona Alignment</h3>
              </div>
            </div>
            <p className="text-sm text-secondary mb-4">{alignment.summary}</p>
            {alignment.alignments.length > 0 && (
              <div className="space-y-2">
                {alignment.alignments.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={`shrink-0 mt-[5px] w-2 h-2 rounded-full ${a.strength === 'strong' ? 'bg-accent' : 'bg-accent/40'}`} />
                    <div>
                      <span className="font-medium text-foreground">{a.placement} · {a.themeLabel}</span>
                      <span className="text-secondary">. {a.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {alignment.demographicInsights.length > 0 && (
              <div className={`space-y-2 ${alignment.alignments.length > 0 ? 'mt-4 pt-4 border-t border-accent/15' : ''}`}>
                {alignment.demographicInsights.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 mt-[5px] w-2 h-2 rounded-full bg-secondary/40" />
                    <div>
                      <span className="font-medium text-foreground">{d.label}</span>
                      <span className="text-secondary">. {d.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Big Three Cards ── */}
        <div className="space-y-4 mb-8">
          {cards.map(c => {
            const colors = ELEMENT_COLORS[c.data.element];
            return (
              <div key={c.label} className={`card border ${colors.border}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colors.bg} ${colors.text}`}>
                    {typeof c.icon === 'string' ? c.icon : c.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono text-xs text-secondary uppercase tracking-wider">{c.label}</span>
                      <span className={`text-xs font-medium ${colors.text}`}>
                        {c.data.element} · {c.data.modality}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
                      <span className="text-lg">{c.data.symbol}</span>
                      {c.placement.sign}
                    </h2>
                    <span className="font-mono text-xs text-secondary">{c.placement.formatted}</span>
                    <p className="text-sm text-secondary mt-2">{c.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Element Balance ── */}
        {(() => {
          const ELEMENT_INFO: Record<string, { icon: string; keywords: string; description: string }> = {
            Fire:  { icon: 'local_fire_department', keywords: 'Passion · Drive · Confidence', description: 'Fire placements bring initiative, honesty, and intensity. You lead with energy and expect directness in return.' },
            Earth: { icon: 'park', keywords: 'Stability · Loyalty · Patience', description: 'Earth placements bring consistency and practicality. You build trust through actions, not words.' },
            Air:   { icon: 'air', keywords: 'Intellect · Communication · Curiosity', description: 'Air placements bring mental agility and social fluency. You connect through ideas and conversation first.' },
            Water: { icon: 'water_drop', keywords: 'Intuition · Depth · Empathy', description: 'Water placements bring emotional intelligence and sensitivity. You read people before they speak.' },
          };
          const elementCounts = (['Fire', 'Earth', 'Air', 'Water'] as const).map(el => ({
            element: el,
            count: cards.filter(c => c.data.element === el).length,
          }));
          const dominant = elementCounts.filter(e => e.count > 0).sort((a, b) => b.count - a.count);
          const missing = elementCounts.filter(e => e.count === 0);

          let balanceSummary = '';
          if (dominant.length === 1) {
            balanceSummary = `All three of your placements are ${dominant[0].element}. This gives you extraordinary focus in that element's qualities, but you may need to consciously develop the traits of your missing elements.`;
          } else if (dominant.length === 2 && dominant[0].count === 2) {
            balanceSummary = `You lean heavily toward ${dominant[0].element} with some ${dominant[1].element} influence. Your dominant element shapes your core approach, while your secondary adds nuance.`;
          } else if (dominant.length === 3) {
            balanceSummary = `Your placements span three elements, giving you a versatile personality. You can draw on different energies depending on the situation.`;
          }

          return (
            <div className="card border border-border mb-6">
              <span className="font-mono text-xs text-secondary uppercase tracking-wider">Your Element Balance</span>
              {balanceSummary && (
                <p className="text-sm text-secondary mt-2 mb-4">{balanceSummary}</p>
              )}
              <div className="space-y-3 mt-3">
                {(['Fire', 'Earth', 'Air', 'Water'] as const).map(el => {
                  const count = elementCounts.find(e => e.element === el)!.count;
                  const colors = ELEMENT_COLORS[el];
                  const info = ELEMENT_INFO[el];
                  const isActive = count > 0;
                  return (
                    <div key={el} className={`rounded-lg p-3 ${isActive ? `${colors.bg} border ${colors.border}` : 'bg-background border border-border opacity-50'}`}>
                      <div className="flex items-center gap-3">
                        <Icon name={info.icon} size={24} fill={true} className={isActive ? colors.text : 'text-secondary'} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm ${isActive ? colors.text : 'text-secondary'}`}>
                              {el}
                            </span>
                            <span className={`font-mono text-xs ${isActive ? colors.text : 'text-secondary'}`}>
                              {count === 0 ? 'none' : count === 1 ? '1 placement' : `${count} placements`}
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isActive ? colors.text : 'text-secondary'}`}>
                            {isActive ? info.keywords : `No ${el.toLowerCase()} placements in your Big Three`}
                          </p>
                        </div>
                        {isActive && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: count }).map((_, i) => (
                              <div key={i} className={`w-2.5 h-2.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <p className="text-xs text-secondary mt-2">{info.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {missing.length > 0 && (
                <p className="text-xs text-secondary mt-3 italic">
                  Missing {missing.map(m => m.element).join(' and ')} — these are growth areas you may consciously develop through awareness and effort.
                </p>
              )}
            </div>
          );
        })()}

        <Link href="/settings/profile" className="btn-secondary text-sm w-full block text-center">
          Edit Birth Data
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
