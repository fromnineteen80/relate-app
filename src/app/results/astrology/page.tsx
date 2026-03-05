'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
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

  // ─── Gender gate ───
  const [isWoman, setIsWoman] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    // Check gender
    const gender = localStorage.getItem('relate_gender');
    const demoStr = localStorage.getItem('relate_demographics');
    if (gender === 'W' || gender === 'Woman') {
      setIsWoman(true);
    } else if (demoStr) {
      try {
        const d = JSON.parse(demoStr);
        setIsWoman(d.gender === 'W' || d.gender === 'Woman');
      } catch { setIsWoman(false); }
    } else {
      setIsWoman(false);
    }

    // Load existing data
    const existingChart = loadChartResult();
    if (existingChart) setChart(existingChart);

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
    } catch (err: any) {
      setError(err?.message || 'Calculation failed. Please check your inputs.');
    } finally {
      setCalculating(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  // Women-only gate
  if (isWoman === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-2xl mx-auto px-6 py-16 w-full text-center">
          <h1 className="font-serif text-2xl font-semibold mb-4">Sun, Moon &amp; Rise</h1>
          <p className="text-sm text-secondary mb-6">
            This module is currently available for women only. Check back soon for expanded access.
          </p>
          <Link href="/results" className="btn-secondary text-sm">Back to Results</Link>
        </main>
      </div>
    );
  }

  // ─── Profile view (chart already calculated) ───
  if (chart) {
    const sunSign = getSignData(chart.sun.sign);
    const moonSign = getSignData(chart.moon.sign);
    const risingSign = getSignData(chart.rising.sign);

    const cards = [
      { label: 'Sun', icon: '☉', placement: chart.sun, data: sunSign, description: sunSign.sunTraits },
      { label: 'Moon', icon: '☽', placement: chart.moon, data: moonSign, description: moonSign.moonTraits },
      { label: 'Rising', icon: '↑', placement: chart.rising, data: risingSign, description: risingSign.risingTraits },
    ];

    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-mono text-xs text-secondary">Sun, Moon &amp; Rise</span>
              <h1 className="font-serif text-3xl font-semibold mt-1">Your Cosmic Blueprint</h1>
            </div>
            <Link href="/results/astrology/cheatsheet" className="btn-secondary text-xs">
              Cheat Sheet
            </Link>
          </div>

          {/* ── Big Three Cards ── */}
          <div className="space-y-4 mb-8">
            {cards.map(c => {
              const colors = ELEMENT_COLORS[c.data.element];
              return (
                <div key={c.label} className={`card border ${colors.border}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colors.bg} ${colors.text}`}>
                      {c.icon}
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

          {/* ── Summary row ── */}
          <div className="card mb-6">
            <span className="font-mono text-xs text-secondary uppercase tracking-wider">Your Element Balance</span>
            <div className="flex gap-4 mt-3">
              {(['Fire', 'Earth', 'Air', 'Water'] as const).map(el => {
                const count = cards.filter(c => c.data.element === el).length;
                const colors = ELEMENT_COLORS[el];
                return (
                  <div key={el} className={`flex-1 text-center rounded-md py-2 ${count > 0 ? colors.bg : 'bg-stone-50'}`}>
                    <span className={`text-lg font-semibold ${count > 0 ? colors.text : 'text-stone-300'}`}>{count}</span>
                    <p className={`text-xs ${count > 0 ? colors.text : 'text-stone-400'}`}>{el}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setChart(null); }} className="btn-secondary text-sm flex-1">
              Edit Birth Data
            </button>
            <Link href="/results/astrology/cheatsheet" className="btn-primary text-sm flex-1 text-center">
              View Cheat Sheet
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ─── Birth Data Input Form ───
  const maxDay = month !== '' && year ? daysInMonth(parseInt(month), parseInt(year)) : 31;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <Link href="/results" className="text-xs text-secondary hover:text-foreground mb-4 inline-block">&larr; Back to Results</Link>
        <span className="font-mono text-xs text-secondary block">Sun, Moon &amp; Rise</span>
        <h1 className="font-serif text-2xl font-semibold mt-1 mb-2">Enter Your Birth Details</h1>
        <p className="text-sm text-secondary mb-6">
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
            className="btn-primary w-full mt-4"
          >
            {calculating ? 'Calculating...' : 'Calculate My Big Three'}
          </button>
        </div>
      </main>
    </div>
  );
}
