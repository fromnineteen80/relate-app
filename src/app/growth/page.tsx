'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GROWTH_EXERCISES,
  GROWTH_CATEGORIES,
  getIndividualGrowthLevel,
  getRecommendedExercises,
  generatePatternInsights,
  projectGrowthImpact,
  type GrowthExercise,
  type GrowthCategory,
  type GrowthProjection,
} from '@/lib/growth';
import { SiteHeader } from '@/components/SiteHeader';
import { SubNav } from '@/components/SubNav';
import { SiteFooter } from '@/components/SiteFooter';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function GrowthPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [completedExercises, setCompletedExercises] = useState<any[]>([]);
  const [activeExercise, setActiveExercise] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [reflectionText, setReflectionText] = useState('');
  const [activeCategory, setActiveCategory] = useState<GrowthCategory | 'all' | 'recommended'>('recommended');
  const [showInsights, setShowInsights] = useState(false);
  const [projection, setProjection] = useState<GrowthProjection | null>(null);

  useEffect(() => {
    // Need at least M2 to be meaningful
    const m2 = localStorage.getItem('relate_m2_scored');
    if (!m2) {
      router.push('/assessment');
      return;
    }

    const m1 = localStorage.getItem('relate_m1_scored');
    const m3 = localStorage.getItem('relate_m3_scored');
    const m4 = localStorage.getItem('relate_m4_scored');
    const results = localStorage.getItem('relate_results');
    const parsedResults = results ? JSON.parse(results) : null;
    const parsedM2 = JSON.parse(m2);
    const persona = parsedResults?.persona || parsedM2?.personaMetadata;
    const dimensions = parsedResults?.dimensions || parsedM2?.dimensions;
    const gender = parsedResults?.gender || localStorage.getItem('relate_gender') || 'M';

    const ud = {
      persona,
      dimensions,
      gender,
      m1: m1 ? JSON.parse(m1) : null,
      m2: parsedM2,
      m3: m3 ? JSON.parse(m3) : null,
      m4: m4 ? JSON.parse(m4) : null,
      individualCompatibility: parsedResults?.individualCompatibility || null,
    };
    setUserData(ud);
    setProjection(projectGrowthImpact(ud));

    const savedCompleted = JSON.parse(localStorage.getItem('relate_growth_exercises_completed') || '[]');
    const savedActive = localStorage.getItem('relate_growth_active_exercise');
    const savedPoints = parseInt(localStorage.getItem('relate_individual_growth_points') || '0', 10);

    setCompletedExercises(savedCompleted);
    setActiveExercise(savedActive ? JSON.parse(savedActive) : null);
    setPoints(savedPoints);
  }, [router]);

  const level = getIndividualGrowthLevel(points);
  const recommended = userData ? getRecommendedExercises(userData) : GROWTH_EXERCISES.slice(0, 4);
  const patternInsights = userData ? generatePatternInsights(userData) : [];
  const completedIds = new Set(completedExercises.map((c: any) => c.id));

  const startExercise = useCallback((exercise: GrowthExercise) => {
    const active = { ...exercise, startedAt: new Date().toISOString() };
    setActiveExercise(active);
    localStorage.setItem('relate_growth_active_exercise', JSON.stringify(active));
  }, []);

  const completeExercise = useCallback(() => {
    if (!activeExercise) return;
    const completed = {
      ...activeExercise,
      completedAt: new Date().toISOString(),
      reflection: reflectionText || null,
    };
    const newCompleted = [...completedExercises, completed];
    const newPoints = points + (activeExercise.points || 10);

    setCompletedExercises(newCompleted);
    setPoints(newPoints);
    setActiveExercise(null);
    setReflectionText('');

    localStorage.setItem('relate_growth_exercises_completed', JSON.stringify(newCompleted));
    localStorage.setItem('relate_individual_growth_points', String(newPoints));
    localStorage.removeItem('relate_growth_active_exercise');
  }, [activeExercise, completedExercises, points, reflectionText]);

  const cancelExercise = useCallback(() => {
    setActiveExercise(null);
    setReflectionText('');
    localStorage.removeItem('relate_growth_active_exercise');
  }, []);

  const filteredExercises = activeCategory === 'recommended'
    ? recommended
    : activeCategory === 'all'
      ? GROWTH_EXERCISES
      : GROWTH_EXERCISES.filter(e => e.category === activeCategory);

  if (!userData) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl font-semibold">Growth Plan</h1>
          <p className="text-sm text-secondary mt-1">
            Evidence-based exercises grounded in Cognitive Behavioral Therapy, Gottman Method, Attachment Theory, Emotionally Focused Therapy, and Internal Family Systems
          </p>
        </div>

        {/* Growth Level */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-serif text-sm font-semibold">Level {level.level}: {level.name}</p>
              <p className="text-xs text-secondary">
                {points} points · {level.pointsToNext > 0 ? `${level.pointsToNext} to next level` : 'Max level!'}
              </p>
            </div>
            <span className="font-mono text-2xl font-bold text-accent">{level.level}</span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          <p className="text-[10px] text-secondary mt-2">
            {completedExercises.length} exercises completed
          </p>
        </div>

        {/* Growth Impact — shows borderline dimensions and persona evolution */}
        {projection && projection.borderlineDimensions.length > 0 && (
          <div className="card border-accent/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-serif text-sm font-semibold">Growth Impact</p>
                <p className="text-xs text-secondary">Where targeted exercises can shift your profile</p>
              </div>
              <Link href="/results/persona" className="font-mono text-xs text-accent hover:underline">
                {projection.originalName}
              </Link>
            </div>

            <div className="space-y-3">
              {projection.borderlineDimensions.map(b => {
                const pct = b.strength;
                const gap = pct - 50;
                return (
                  <div key={b.dimension}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium capitalize">{b.dimension}</span>
                      <span className="text-[10px] text-secondary">
                        {b.currentPole} ({pct}%) → {b.oppositePole}
                      </span>
                    </div>
                    <div className="relative h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="absolute h-full bg-accent/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      <div className="absolute h-full border-r-2 border-dashed border-accent" style={{ left: '50%' }} />
                    </div>
                    <p className="text-[10px] text-secondary/70 mt-1 leading-snug">
                      Only {gap} points from the threshold. {b.targetExercises.length > 0
                        ? `${b.targetExercises.length} exercises in your plan target this area.`
                        : 'Complete exercises that build this dimension.'}
                    </p>
                  </div>
                );
              })}
            </div>

            {projection.projectedCode && projection.projectedCode !== projection.originalCode && (
              <div className="mt-4 pt-3 border-t border-stone-100">
                <p className="text-xs text-secondary">
                  <span className="font-medium text-foreground">Growth trajectory: </span>
                  {projection.originalName} ({projection.originalCode}) → {projection.projectedName || projection.projectedCode}
                </p>
              </div>
            )}

            {projection.matchImpactNote && (
              <p className="text-[11px] text-accent mt-3 leading-snug">{projection.matchImpactNote}</p>
            )}
          </div>
        )}

        {/* Pattern Insights */}
        {patternInsights.length > 0 && (
          <div className="card">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="w-full flex items-center justify-between"
            >
              <div>
                <p className="font-serif text-sm font-semibold text-left">Your Pattern Insights</p>
                <p className="text-xs text-secondary text-left">
                  {patternInsights.length} pattern{patternInsights.length !== 1 ? 's' : ''} identified from your assessment
                </p>
              </div>
              <span className="text-secondary text-sm">{showInsights ? '−' : '+'}</span>
            </button>
            {showInsights && (
              <div className="mt-4 space-y-4">
                {patternInsights.map((insight, i) => (
                  <div key={i} className="border-l-2 border-accent pl-4">
                    <p className="text-xs text-secondary leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Exercise */}
        {activeExercise && (
          <div className="card border-accent">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-accent font-mono">Active Exercise</p>
                <p className="font-serif text-sm font-semibold mt-1">{activeExercise.title}</p>
              </div>
              <span className="font-mono text-xs text-secondary">+{activeExercise.points}pts</span>
            </div>
            <p className="text-xs text-secondary mb-3">{activeExercise.description}</p>

            <div className="bg-stone-50 rounded p-4 mb-4">
              <p className="text-xs font-medium mb-2">Instructions</p>
              <p className="text-xs text-secondary leading-relaxed whitespace-pre-line">{activeExercise.instruction}</p>
            </div>

            <div className="mb-4">
              <label className="text-xs text-secondary block mb-1">Reflection (optional)</label>
              <textarea
                value={reflectionText}
                onChange={e => setReflectionText(e.target.value)}
                className="input w-full h-24 resize-none text-sm"
                placeholder="What did you notice? What surprised you? What pattern did you see?"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={cancelExercise} className="btn-secondary text-xs flex-1">
                Cancel
              </button>
              <button onClick={completeExercise} className="btn-primary text-xs flex-1">
                Complete (+{activeExercise.points}pts)
              </button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        {!activeExercise && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('recommended')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === 'recommended' ? 'bg-accent text-white border-accent' : 'border-stone-300 text-secondary hover:border-accent'
              }`}
            >
              Recommended
            </button>
            <button
              onClick={() => setActiveCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === 'all' ? 'bg-accent text-white border-accent' : 'border-stone-300 text-secondary hover:border-accent'
              }`}
            >
              All
            </button>
            {(Object.entries(GROWTH_CATEGORIES) as [GrowthCategory, { name: string }][]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === key ? 'bg-accent text-white border-accent' : 'border-stone-300 text-secondary hover:border-accent'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Category Description */}
        {!activeExercise && activeCategory !== 'recommended' && activeCategory !== 'all' && (
          <p className="text-xs text-secondary">{GROWTH_CATEGORIES[activeCategory].description}</p>
        )}

        {/* Exercise Grid */}
        {!activeExercise && (
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">
              {activeCategory === 'recommended' ? 'Recommended for You' : activeCategory === 'all' ? 'All Exercises' : GROWTH_CATEGORIES[activeCategory].name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredExercises.filter(e => !completedIds.has(e.id)).map(exercise => (
                <div key={exercise.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-serif text-sm font-semibold">{exercise.title}</p>
                    <span className="font-mono text-xs text-accent">+{exercise.points}</span>
                  </div>
                  <p className="text-xs text-secondary mb-3">{exercise.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-secondary capitalize">{exercise.category} · {exercise.duration}</span>
                      <span className="text-[10px] text-accent/60">{exercise.framework}</span>
                    </div>
                    <button onClick={() => startExercise(exercise)} className="text-xs text-accent hover:underline">
                      Start →
                    </button>
                  </div>
                </div>
              ))}
              {filteredExercises.filter(e => !completedIds.has(e.id)).length === 0 && (
                <p className="text-xs text-secondary col-span-2">All exercises in this category completed.</p>
              )}
            </div>
          </div>
        )}

        {/* Completed Exercises */}
        {completedExercises.length > 0 && !activeExercise && (
          <div>
            <h3 className="font-serif text-lg font-semibold mb-3">
              Completed ({completedExercises.length})
            </h3>
            <div className="space-y-2">
              {completedExercises.slice().reverse().slice(0, 8).map((c: any, i: number) => (
                <div key={i} className="card flex items-center justify-between opacity-60">
                  <div>
                    <p className="text-xs font-medium">{c.title}</p>
                    <p className="text-[10px] text-secondary">
                      {new Date(c.completedAt).toLocaleDateString()}
                      {c.reflection ? ' · Has reflection' : ''}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-success">+{c.points}pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 flex-wrap pt-4">
          <Link href="/results" className="btn-secondary text-xs">Results</Link>
          <Link href="/advisor" className="btn-secondary text-xs">Advisor</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
