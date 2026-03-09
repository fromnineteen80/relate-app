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
  type BirthData,
  type BirthChartResult,
} from '@/lib/astrology/engine';
import { getSignData, ELEMENT_COLORS } from '@/lib/astrology/signs';
import { generateProfileReads } from '@/lib/astrology/compatibility';
import { analyzePersonaAlignment, type PersonaAlignmentResult } from '@/lib/astrology/persona-alignment';
import { Icon } from '@/components/Icon';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Months for the date picker ───
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function AstrologyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ─── Form state ───
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationResolved, setLocationResolved] = useState(false);

  // ─── Result state ───
  const [chart, setChart] = useState<BirthChartResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  // ─── Persona alignment ───
  const [alignment, setAlignment] = useState<PersonaAlignmentResult | null>(null);
  const [personaName, setPersonaName] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    // Load existing data
    const existingChart = loadChartResult();
    if (existingChart) setChart(existingChart);

    // Load persona results and compute alignment if chart exists
    try {
      const resultsStr = localStorage.getItem('relate_results');
      const demoStr = localStorage.getItem('relate_demographics');
      const demo = demoStr ? JSON.parse(demoStr) : undefined;
      if (resultsStr && existingChart) {
        const results = JSON.parse(resultsStr);
        if (results.persona?.code && results.persona?.name) {
          setPersonaName(results.persona.name);
          setAlignment(analyzePersonaAlignment(results.persona.code, results.persona.name, existingChart, demo));
        }
      }
    } catch { /* */ }

    const existingBirth = loadBirthData();
    if (existingBirth) {
      setMonth(String(existingBirth.month));
      setDay(String(existingBirth.day));
      setYear(String(existingBirth.year));
      const h24 = existingBirth.hour;
      setAmpm(h24 >= 12 ? 'PM' : 'AM');
      setHour(String(h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24));
      setMinute(String(existingBirth.minute).padStart(2, '0'));
      setLatitude(String(existingBirth.latitude));
      setLongitude(String(existingBirth.longitude));
      setCity(existingBirth.locationName || '');
      if (existingBirth.latitude && existingBirth.longitude) setLocationResolved(true);

      // Auto-calculate if birth data exists but no chart yet
      if (!existingChart && existingBirth.latitude && existingBirth.longitude && existingBirth.year && existingBirth.month != null && existingBirth.day) {
        setCalculating(true);
        calculateBirthChart(existingBirth).then(result => {
          saveChartResult(result);
          setChart(result);
          try {
            const resultsStr2 = localStorage.getItem('relate_results');
            const demoStr2 = localStorage.getItem('relate_demographics');
            const demo2 = demoStr2 ? JSON.parse(demoStr2) : undefined;
            if (resultsStr2) {
              const results2 = JSON.parse(resultsStr2);
              if (results2.persona?.code && results2.persona?.name) {
                setPersonaName(results2.persona.name);
                setAlignment(analyzePersonaAlignment(results2.persona.code, results2.persona.name, result, demo2));
              }
            }
          } catch { /* */ }
        }).catch(() => {}).finally(() => setCalculating(false));
      }
    }
  }, [user, loading, router]);

  // ─── City → lat/lng lookup via zip-lookup pattern ───
  async function lookupCity() {
    if (!city.trim()) return;
    setError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city.trim())}&format=json&limit=1`, {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(data[0].lat);
        setLongitude(data[0].lon);
        setLocationResolved(true);
        setCity(data[0].display_name?.split(',').slice(0, 2).join(',').trim() || city);
      } else {
        setError('City not found. Try a larger nearby city or enter coordinates manually.');
      }
    } catch {
      setError('Location lookup failed. You can enter latitude/longitude manually.');
    }
  }

  function canCalculate() {
    return month !== '' && day && year && hour && minute !== '' && latitude && longitude;
  }

  async function handleCalculate() {
    if (!canCalculate()) return;
    setCalculating(true);
    setError('');
    try {
      const h12 = parseInt(hour);
      let h24 = ampm === 'PM' ? (h12 === 12 ? 12 : h12 + 12) : (h12 === 12 ? 0 : h12);

      const birthData: BirthData = {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: h24,
        minute: parseInt(minute),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName: city || undefined,
      };

      const result = await calculateBirthChart(birthData);
      saveBirthData(birthData);
      saveChartResult(result);
      setChart(result);

      // Compute alignment with persona if available
      try {
        const resultsStr = localStorage.getItem('relate_results');
        const demoStr = localStorage.getItem('relate_demographics');
        const demo = demoStr ? JSON.parse(demoStr) : undefined;
        if (resultsStr) {
          const results = JSON.parse(resultsStr);
          if (results.persona?.code && results.persona?.name) {
            setPersonaName(results.persona.name);
            setAlignment(analyzePersonaAlignment(results.persona.code, results.persona.name, result, demo));
          }
        }
      } catch { /* */ }
    } catch (err: any) {
      setError(err?.message || 'Calculation failed. Please check your inputs.');
    } finally {
      setCalculating(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  // ─── Profile view (chart already calculated) ───
  if (chart) {
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

          <button onClick={() => { setChart(null); }} className="btn-secondary text-sm w-full">
            Edit Birth Data
          </button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // ─── Birth Data Input Form ───
  const maxDay = month !== '' && year ? daysInMonth(parseInt(month), parseInt(year)) : 31;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <Link href="/results" className="text-xs text-secondary hover:text-foreground mb-4 inline-block">&larr; Back to Results</Link>
        <span className="font-mono text-xs text-secondary uppercase tracking-wider block">Sun, Moon &amp; Rise</span>
        <h1 className="font-serif text-2xl font-semibold mt-1 mb-2">Enter Your Birth Details</h1>
        <p className="explainer mb-6">
          Your exact birth time and location determine your Moon sign and Rising sign. The more accurate your data, the more accurate your cosmic blueprint.
        </p>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="label">Birth Date *</label>
            <div className="grid grid-cols-3 gap-2">
              <select value={month} onChange={e => setMonth(e.target.value)} className="input">
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select value={day} onChange={e => setDay(e.target.value)} className="input">
                <option value="">Day</option>
                {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="number" value={year} onChange={e => setYear(e.target.value)}
                className="input" placeholder="Year" min={1900} max={2025}
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="label">Birth Time *</label>
            <p className="text-xs text-secondary mb-1">Check your birth certificate for the exact time.</p>
            <div className="grid grid-cols-3 gap-2">
              <select value={hour} onChange={e => setHour(e.target.value)} className="input">
                <option value="">Hour</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <select value={minute} onChange={e => setMinute(e.target.value)} className="input">
                <option value="">Minute</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
              <select value={ampm} onChange={e => setAmpm(e.target.value as 'AM' | 'PM')} className="input">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="label">Birth City *</label>
            <div className="flex gap-2">
              <input
                type="text" value={city}
                onChange={e => { setCity(e.target.value); setLocationResolved(false); }}
                onBlur={lookupCity}
                className="input flex-1" placeholder="e.g. Los Angeles, CA"
              />
              <button onClick={lookupCity} type="button" className="btn-secondary text-xs px-3 whitespace-nowrap">
                Look Up
              </button>
            </div>
            {locationResolved && (
              <p className="text-xs text-success mt-1">
                Location resolved: {parseFloat(latitude).toFixed(2)}°, {parseFloat(longitude).toFixed(2)}°
              </p>
            )}
          </div>

          {/* Manual coordinates fallback */}
          {!locationResolved && (
            <div>
              <label className="label text-xs text-secondary">Or enter coordinates manually</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number" value={latitude} onChange={e => setLatitude(e.target.value)}
                  className="input" placeholder="Latitude" step="0.01" min={-90} max={90}
                />
                <input
                  type="number" value={longitude} onChange={e => setLongitude(e.target.value)}
                  className="input" placeholder="Longitude" step="0.01" min={-180} max={180}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            onClick={handleCalculate}
            disabled={!canCalculate() || calculating}
            className="btn-primary w-full mt-4 text-sm"
          >
            {calculating ? 'Calculating...' : 'Calculate My Big Three'}
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
