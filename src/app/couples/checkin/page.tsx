'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CheckinHistoryPage() {
  const router = useRouter();
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('relate_checkins') || '[]');
    setCheckins(saved);
  }, []);

  // Calculate trends
  const recentCheckins = checkins.slice(0, 8);
  const avgSatisfaction = recentCheckins.length > 0
    ? Math.round(recentCheckins.reduce((s, c) => s + c.satisfaction, 0) / recentCheckins.length * 10) / 10
    : 0;
  const avgCommunication = recentCheckins.length > 0
    ? Math.round(recentCheckins.reduce((s, c) => s + c.communication, 0) / recentCheckins.length * 10) / 10
    : 0;
  const avgConnection = recentCheckins.length > 0
    ? Math.round(recentCheckins.reduce((s, c) => s + c.connection, 0) / recentCheckins.length * 10) / 10
    : 0;

  // Trend direction (compare first half to second half)
  function getTrend(field: string): 'up' | 'down' | 'stable' {
    if (recentCheckins.length < 4) return 'stable';
    const half = Math.floor(recentCheckins.length / 2);
    const recent = recentCheckins.slice(0, half);
    const older = recentCheckins.slice(half);
    const recentAvg = recent.reduce((s: number, c: any) => s + c[field], 0) / recent.length;
    const olderAvg = older.reduce((s: number, c: any) => s + c[field], 0) / older.length;
    if (recentAvg - olderAvg > 0.5) return 'up';
    if (olderAvg - recentAvg > 0.5) return 'down';
    return 'stable';
  }

  const trendIcons = { up: '↑', down: '↓', stable: '→' };
  const trendColors = { up: 'text-success', down: 'text-danger', stable: 'text-secondary' };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-1">Check-In History</h2>
        <p className="text-sm text-secondary mb-6">{checkins.length} check-in{checkins.length !== 1 ? 's' : ''} recorded</p>

        {checkins.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-secondary mb-4">No check-ins yet. Start tracking your relationship progress.</p>
            <Link href="/couples" className="btn-primary text-sm">Go to Dashboard</Link>
          </div>
        ) : (
          <>
            {/* Averages */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Satisfaction', avg: avgSatisfaction, trend: getTrend('satisfaction') },
                { label: 'Communication', avg: avgCommunication, trend: getTrend('communication') },
                { label: 'Connection', avg: avgConnection, trend: getTrend('connection') },
              ].map(m => (
                <div key={m.label} className="card text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-xl font-semibold">{m.avg}</span>
                    <span className={`text-sm ${trendColors[m.trend]}`}>{trendIcons[m.trend]}</span>
                  </div>
                  <p className="text-[10px] text-secondary mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              {checkins.map((ci, i) => (
                <div key={i} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary">{new Date(ci.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="font-mono text-xs text-secondary">
                      Avg: {Math.round((ci.satisfaction + ci.communication + ci.connection) / 3 * 10) / 10}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Satisfaction', value: ci.satisfaction },
                      { label: 'Communication', value: ci.communication },
                      { label: 'Connection', value: ci.connection },
                    ].map(f => (
                      <div key={f.label}>
                        <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${f.value * 10}%` }} />
                        </div>
                        <p className="text-[10px] text-secondary">{f.label}: {f.value}</p>
                      </div>
                    ))}
                  </div>
                  {ci.notes && <p className="text-xs text-secondary mt-2 italic">&ldquo;{ci.notes}&rdquo;</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
