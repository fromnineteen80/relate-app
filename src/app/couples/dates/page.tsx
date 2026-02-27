'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { getPersonalizedDates, DATE_IDEAS } from '@/lib/couples';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DatesPage() {
  const router = useRouter();
  const [dates, setDates] = useState<typeof DATE_IDEAS>([]);
  const [savedDates, setSavedDates] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const report = localStorage.getItem('relate_couples_report');
    if (!report) {
      // Fallback: show all dates
      setDates(DATE_IDEAS);
      return;
    }

    const parsed = JSON.parse(report);
    const user1Results = localStorage.getItem('relate_results');
    const user2Results = localStorage.getItem('relate_partner_results');

    if (user1Results && user2Results) {
      const personalized = getPersonalizedDates(JSON.parse(user1Results), JSON.parse(user2Results));
      setDates(personalized);
    } else {
      setDates(DATE_IDEAS);
    }

    // Load saved dates
    const saved = JSON.parse(localStorage.getItem('relate_saved_dates') || '[]');
    setSavedDates(new Set(saved));
  }, [router]);

  const toggleSave = (id: string) => {
    const updated = new Set(savedDates);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSavedDates(updated);
    localStorage.setItem('relate_saved_dates', JSON.stringify(Array.from(updated)));
  };

  const categories = ['all', 'adventure', 'intimate', 'social', 'growth'];
  const filtered = filter === 'all' ? dates : dates.filter(d => d.category === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-1">Date Ideas</h2>
        <p className="text-sm text-secondary mb-6">Personalized suggestions based on both your profiles</p>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md capitalize transition-colors ${
                filter === cat ? 'bg-accent text-white' : 'bg-stone-100 text-secondary hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(date => (
            <div key={date.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-serif text-sm font-semibold">{date.title}</p>
                    <span className="text-[10px] text-secondary capitalize bg-stone-100 px-1.5 py-0.5 rounded">{date.category}</span>
                  </div>
                  <p className="text-xs text-secondary">{date.description}</p>
                </div>
                <button
                  onClick={() => toggleSave(date.id)}
                  className={`ml-3 text-lg flex-shrink-0 ${savedDates.has(date.id) ? 'text-accent' : 'text-stone-300 hover:text-stone-400'}`}
                >
                  {savedDates.has(date.id) ? '★' : '☆'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {savedDates.size > 0 && (
          <div className="mt-8">
            <h3 className="font-serif text-sm font-semibold mb-3">Saved ({savedDates.size})</h3>
            <div className="flex flex-wrap gap-2">
              {dates.filter(d => savedDates.has(d.id)).map(d => (
                <span key={d.id} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-md">{d.title}</span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
