'use client';

import { useState, useEffect } from 'react';
import ProgressRing from '../ProgressRing';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  scoredData: any;
  onContinue: () => void;
};

function getGapInterpretation(gap: number): string {
  if (gap > 20) return "You want significantly more than you offer. This creates relationship debt, and partners may feel they're giving access you don't reciprocate.";
  if (gap < -20) return "You offer far more than you ask for. This can feel generous but may attract partners who take without giving.";
  if (gap > 5) return "You want slightly more than you offer. Watch this balance over time, as a small tilt can widen under stress.";
  if (gap < -5) return "You offer slightly more than you ask for. This is sustainable, and you won't drain partners or feel perpetually unsatisfied.";
  return "Your want and offer are well balanced. This symmetry is a relationship strength.";
}

function getAttentivenessInterpretation(level: string): { label: string; desc: string } {
  switch (level) {
    case 'strongly_other_focused':
      return { label: 'Strongly Other-Focused', desc: "You track your partner's experience closely. Be careful not to lose yourself in the process." };
    case 'balanced':
      return { label: 'Balanced', desc: "You track your partner's experience while also honoring your own needs. This is healthy reciprocity." };
    case 'moderately_self_focused':
      return { label: 'Moderately Self-Focused', desc: "You may miss partner cues. Building awareness of their experience is a growth edge." };
    case 'self_absorbed':
      return { label: 'Self-Focused', desc: "Partners may feel unseen. Developing curiosity about their inner world will transform your connections." };
    default:
      return { label: level || '-', desc: '' };
  }
}

export default function M3Reward({ scoredData, onContinue }: Props) {
  const [screen, setScreen] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const { result, attentiveness } = scoredData;
  const wantScore = result?.wantScore ?? 50;
  const offerScore = result?.offerScore ?? 50;
  const wantOfferGap = result?.wantOfferGap ?? (wantScore - offerScore);
  const typeName = result?.typeName || 'Unknown';

  useEffect(() => {
    if (screen === 0) {
      const timer = setTimeout(() => {
        setFadeIn(true);
        setTimeout(() => setScreen(1), 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, [screen]);

  // Screen 0: Transition
  if (screen === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className={`text-center transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mx-auto mb-6">
            <ProgressRing progress={100} size={80} strokeWidth={4} />
          </div>
          <h2 className="font-serif text-2xl font-semibold">Module 3 Complete</h2>
        </div>
      </div>
    );
  }

  // Screen 1: Connection Style
  if (screen === 1) {
    return (
      <div className={`max-w-xl mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <span className="font-mono text-xs text-secondary">Your Connection Style</span>
        <h2 className="font-serif text-2xl font-semibold mt-1 mb-8">How You Connect</h2>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div
            className="text-center transition-all duration-700"
            style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)' }}
          >
            <span className="text-xs font-mono text-secondary">WHAT YOU SEEK</span>
            <p className="font-mono text-3xl font-semibold mt-2">{wantScore}</p>
            <div className="h-2 bg-stone-200 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-1000"
                style={{ width: `${wantScore}%`, transitionDelay: '400ms' }}
              />
            </div>
            <p className="text-xs text-secondary mt-2">
              {wantScore > 60 ? 'You want exclusive access to hidden sides' : 'You value consistency over mystery'}
            </p>
          </div>

          <div
            className="text-center transition-all duration-700"
            style={{ transitionDelay: '200ms', opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)' }}
          >
            <span className="text-xs font-mono text-secondary">WHAT YOU OFFER</span>
            <p className="font-mono text-3xl font-semibold mt-2">{offerScore}</p>
            <div className="h-2 bg-stone-200 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-1000"
                style={{ width: `${offerScore}%`, transitionDelay: '600ms' }}
              />
            </div>
            <p className="text-xs text-secondary mt-2">
              {offerScore > 60 ? 'You reveal yourself in layers over time' : 'You are the same person in every context'}
            </p>
          </div>
        </div>

        <button onClick={() => setScreen(2)} className="btn-primary w-full">
          See Balance
        </button>
      </div>
    );
  }

  // Screen 2: Gap Analysis
  if (screen === 2) {
    return (
      <div className={`max-w-xl mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-serif text-xl font-semibold mb-6">Your Want/Offer Balance</h3>

        <div className="card mb-6">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono text-secondary mb-1">
                <span>WANT</span>
                <span>{wantScore}</span>
              </div>
              <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${wantScore}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-secondary mb-1">
                <span>OFFER</span>
                <span>{offerScore}</span>
              </div>
              <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${offerScore}%`, transitionDelay: '200ms' }} />
              </div>
            </div>
          </div>

          <p className="text-sm text-secondary mt-4 leading-relaxed">
            {getGapInterpretation(wantOfferGap)}
          </p>
        </div>

        <div className="card mb-6">
          <span className="text-xs font-mono text-secondary">Connection Type</span>
          <p className="font-serif text-lg font-semibold mt-1">{typeName}</p>
        </div>

        <button onClick={() => setScreen(3)} className="btn-primary w-full">
          {attentiveness ? 'See Attention Pattern' : 'Continue'}
        </button>
      </div>
    );
  }

  // Screen 3: Attentiveness (if available) or Teaser
  if (screen === 3 && attentiveness) {
    const { label, desc } = getAttentivenessInterpretation(attentiveness.level);
    const score = attentiveness.score ?? 50;

    return (
      <div className={`max-w-xl mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-serif text-xl font-semibold mb-6">Your Attention Pattern</h3>

        <div className="card mb-6">
          <div className="relative h-3 bg-stone-200 rounded-full mb-4">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full border-2 border-white transition-all duration-1000"
              style={{ left: `${Math.min(95, Math.max(5, score))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-secondary mb-4">
            <span>Other-Focused</span>
            <span>Self-Focused</span>
          </div>

          <p className="font-serif font-semibold mb-1">You scored: {label}</p>
          <p className="text-sm text-secondary">{desc}</p>
        </div>

        <button onClick={() => setScreen(4)} className="btn-primary w-full">
          Continue
        </button>
      </div>
    );
  }

  // Screen 4 (or 3 if no attentiveness): Teaser
  return (
    <div className={`max-w-md mx-auto text-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <p className="text-lg font-serif leading-relaxed mb-4">
        You know what you want, who you are, and how you connect. One question remains: what happens when it gets hard?
      </p>
      <p className="text-sm text-secondary mb-8">
        Module 4 maps your conflict patterns: how you fight, what triggers you, and whether you can repair.
      </p>
      <button onClick={onContinue} className="btn-primary px-8 py-3">
        Continue to Module 4
        <span className="text-xs opacity-70 ml-2">~17 min</span>
      </button>
    </div>
  );
}
