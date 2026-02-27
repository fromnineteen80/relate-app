'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGrowthLevel, getRecommendedChallenges, CHALLENGE_LIBRARY } from '@/lib/couples';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CouplesDashboard() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<any[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [showCheckin, setShowCheckin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('relate_couples_report');
    if (!stored) {
      router.push('/results/compare');
      return;
    }
    setReport(JSON.parse(stored));

    // Load growth plan state from localStorage
    const savedCheckins = JSON.parse(localStorage.getItem('relate_checkins') || '[]');
    const savedChallenges = JSON.parse(localStorage.getItem('relate_completed_challenges') || '[]');
    const savedActive = localStorage.getItem('relate_active_challenge');
    const savedPoints = parseInt(localStorage.getItem('relate_growth_points') || '0', 10);

    setCheckins(savedCheckins);
    setCompletedChallenges(savedChallenges);
    setActiveChallenge(savedActive ? JSON.parse(savedActive) : null);
    setPoints(savedPoints);
  }, [router]);

  const level = getGrowthLevel(points);
  const recommended = report ? getRecommendedChallenges(report) : CHALLENGE_LIBRARY.slice(0, 4);

  const startChallenge = useCallback((challenge: any) => {
    const active = { ...challenge, startedAt: new Date().toISOString() };
    setActiveChallenge(active);
    localStorage.setItem('relate_active_challenge', JSON.stringify(active));
  }, []);

  const completeChallenge = useCallback(() => {
    if (!activeChallenge) return;
    const completed = { ...activeChallenge, completedAt: new Date().toISOString() };
    const newCompleted = [...completedChallenges, completed];
    const newPoints = points + (activeChallenge.points || 10);

    setCompletedChallenges(newCompleted);
    setPoints(newPoints);
    setActiveChallenge(null);

    localStorage.setItem('relate_completed_challenges', JSON.stringify(newCompleted));
    localStorage.setItem('relate_growth_points', String(newPoints));
    localStorage.removeItem('relate_active_challenge');
  }, [activeChallenge, completedChallenges, points]);

  const submitCheckin = useCallback((data: { satisfaction: number; communication: number; connection: number; notes: string }) => {
    const checkin = { ...data, date: new Date().toISOString() };
    const newCheckins = [checkin, ...checkins];
    setCheckins(newCheckins);
    setShowCheckin(false);
    setPoints(p => {
      const newP = p + 5;
      localStorage.setItem('relate_growth_points', String(newP));
      return newP;
    });
    localStorage.setItem('relate_checkins', JSON.stringify(newCheckins));

    // Also POST to API (fire and forget)
    fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, partnershipId: 'mock' }),
    }).catch(() => {});
  }, [checkins]);

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const overview = report.overview || {};
  const completedIds = new Set(completedChallenges.map((c: any) => c.id));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-secondary">Couples Dashboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Couple Header */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="font-serif text-lg font-semibold">
              {overview.user1?.name} & {overview.user2?.name}
            </p>
            <p className="text-xs text-secondary">{overview.archetype?.name} · Score: {overview.overallScore}</p>
          </div>
          <Link href="/results/compare" className="btn-secondary text-xs">
            Full Report
          </Link>
        </div>

        {/* Growth Level */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-serif text-sm font-semibold">Level {level.level}: {level.name}</p>
              <p className="text-xs text-secondary">{points} points · {level.pointsToNext > 0 ? `${level.pointsToNext} to next level` : 'Max level!'}</p>
            </div>
            <span className="font-mono text-2xl font-bold text-accent">{level.level}</span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => setShowCheckin(true)} className="card text-center hover:border-accent transition-colors">
            <p className="text-lg mb-1">◎</p>
            <p className="text-xs font-medium">Check-In</p>
          </button>
          <Link href="/couples/dates" className="card text-center hover:border-accent transition-colors">
            <p className="text-lg mb-1">◆</p>
            <p className="text-xs font-medium">Date Ideas</p>
          </Link>
          <Link href="/couples/cards" className="card text-center hover:border-accent transition-colors">
            <p className="text-lg mb-1">◇</p>
            <p className="text-xs font-medium">Card Decks</p>
          </Link>
          <Link href="/advisor?mode=couples" className="card text-center hover:border-accent transition-colors">
            <p className="text-lg mb-1">○</p>
            <p className="text-xs font-medium">Advisor</p>
          </Link>
        </div>

        {/* Active Challenge */}
        {activeChallenge && (
          <div className="card border-accent">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-accent font-mono">Active Challenge</p>
                <p className="font-serif text-sm font-semibold mt-1">{activeChallenge.title}</p>
              </div>
              <span className="font-mono text-xs text-secondary">+{activeChallenge.points}pts</span>
            </div>
            <p className="text-xs text-secondary mb-3">{activeChallenge.description}</p>
            <button onClick={completeChallenge} className="btn-primary text-xs w-full">
              Mark Complete
            </button>
          </div>
        )}

        {/* Recommended Challenges */}
        {!activeChallenge && (
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Recommended Challenges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommended.filter(c => !completedIds.has(c.id)).map(challenge => (
                <div key={challenge.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-serif text-sm font-semibold">{challenge.title}</p>
                    <span className="font-mono text-xs text-accent">+{challenge.points}</span>
                  </div>
                  <p className="text-xs text-secondary mb-3">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-secondary capitalize">{challenge.category} · {challenge.duration}</span>
                    <button onClick={() => startChallenge(challenge)} className="text-xs text-accent hover:underline">
                      Start →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Check-ins */}
        {checkins.length > 0 && (
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">Recent Check-Ins</h3>
            <div className="space-y-2">
              {checkins.slice(0, 5).map((ci, i) => (
                <div key={i} className="card flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="font-mono text-sm font-semibold">{ci.satisfaction}</span>
                      <p className="text-[10px] text-secondary">Satisfaction</p>
                    </div>
                    <div>
                      <span className="font-mono text-sm font-semibold">{ci.communication}</span>
                      <p className="text-[10px] text-secondary">Communication</p>
                    </div>
                    <div>
                      <span className="font-mono text-sm font-semibold">{ci.connection}</span>
                      <p className="text-[10px] text-secondary">Connection</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-secondary whitespace-nowrap">
                    {new Date(ci.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">
              Completed ({completedChallenges.length})
            </h3>
            <div className="space-y-2">
              {completedChallenges.slice(0, 5).map((c: any, i: number) => (
                <div key={i} className="card flex items-center justify-between opacity-60">
                  <div>
                    <p className="text-xs font-medium">{c.title}</p>
                    <p className="text-[10px] text-secondary">{new Date(c.completedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-mono text-xs text-success">+{c.points}pts ✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 flex-wrap pt-4">
          <Link href="/results/compare" className="btn-secondary text-xs">Compatibility Report</Link>
          <Link href="/couples/dates" className="btn-secondary text-xs">Date Ideas</Link>
          <Link href="/couples/cards" className="btn-secondary text-xs">Conversation Cards</Link>
          <Link href="/advisor?mode=couples" className="btn-secondary text-xs">Couples Advisor</Link>
        </div>
      </main>

      {/* Check-in Modal */}
      {showCheckin && (
        <CheckinModal onSubmit={submitCheckin} onClose={() => setShowCheckin(false)} />
      )}
    </div>
  );
}

function CheckinModal({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) {
  const [satisfaction, setSatisfaction] = useState(7);
  const [communication, setCommunication] = useState(7);
  const [connection, setConnection] = useState(7);
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h3 className="font-serif text-lg font-semibold mb-4">Weekly Check-In</h3>

        <div className="space-y-4">
          <SliderField label="Relationship Satisfaction" value={satisfaction} onChange={setSatisfaction} />
          <SliderField label="Communication Quality" value={communication} onChange={setCommunication} />
          <SliderField label="Feeling of Connection" value={connection} onChange={setConnection} />

          <div>
            <label className="text-xs text-secondary block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input w-full h-20 resize-none text-sm"
              placeholder="How is the relationship feeling this week?"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => onSubmit({ satisfaction, communication, connection, notes })}
            className="btn-primary flex-1"
          >
            Submit (+5pts)
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-secondary">{label}</label>
        <span className="font-mono text-xs font-semibold">{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-accent"
      />
    </div>
  );
}
