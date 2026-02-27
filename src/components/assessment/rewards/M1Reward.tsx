'use client';

import { useState, useEffect } from 'react';
import ProgressRing from '../ProgressRing';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  scoredData: any;
  onContinue: () => void;
};

const DIMENSION_DESCRIPTIONS: Record<string, Record<string, string>> = {
  physical: {
    A_M: "You're drawn to how she looks. Physical appearance is primary.",
    B_M: "You're drawn to how she carries herself, not conventional attractiveness.",
    A_W: "You want a man who is physically fit and takes care of his body.",
    B_W: "You value experience and depth over raw physical attributes.",
  },
  social: {
    A_M: "You prefer magnetic mystery and allure in a partner.",
    B_M: "You prefer emotional warmth and genuine engagement.",
    A_W: "You're attracted to men who take charge and lead.",
    B_W: "You prefer quiet presence and deep attention over dominance.",
  },
  lifestyle: {
    A: "You want someone who pushes you, not someone who settles you.",
    B: "You seek stability and calm over adventure and risk.",
  },
  values: {
    A: "You value defined roles and traditional partnership structures.",
    B: "Partnership and equality matter more than defined roles.",
  },
};

function getDimDescription(dim: string, pole: string, gender: string): string {
  const genderKey = gender === 'M' ? '_M' : '_W';
  if (dim === 'lifestyle' || dim === 'values') {
    return DIMENSION_DESCRIPTIONS[dim]?.[pole] || '';
  }
  return DIMENSION_DESCRIPTIONS[dim]?.[pole + genderKey] || '';
}

export default function M1Reward({ scoredData, onContinue }: Props) {
  const [screen, setScreen] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const { result, poles } = scoredData;
  const gender = result?.gender === 'male' || result?.gender === 'M' ? 'M' : 'W';
  const dimensions = result?.dimensions || {};

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
          <h2 className="font-serif text-2xl font-semibold">Module 1 Complete</h2>
        </div>
      </div>
    );
  }

  // Screen 1: Preference Profile Reveal
  if (screen === 1) {
    return (
      <div className={`max-w-xl mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <span className="font-mono text-xs text-secondary">Your Preference Profile</span>
        <h2 className="font-serif text-2xl font-semibold mt-1 mb-8">What You&apos;re Looking For</h2>

        <div className="space-y-6">
          {(['physical', 'social', 'lifestyle', 'values'] as const).map((dim, i) => {
            const d = dimensions[dim];
            if (!d) return null;
            const poleName = d.assignedPole || '';
            const direction = d.direction || 'A';
            const poleA = poles?.[dim]?.A || 'A';
            const poleB = poles?.[dim]?.B || 'B';
            const strength = d.strength || 50;
            // Position: 0 = full A, 100 = full B
            const position = direction === 'A' ? Math.max(5, 50 - strength / 2) : Math.min(95, 50 + strength / 2);
            const desc = getDimDescription(dim, direction, gender);

            return (
              <div
                key={dim}
                className="transition-all duration-500"
                style={{ transitionDelay: `${i * 200}ms`, opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(8px)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-secondary uppercase w-20">{dim}</span>
                  <span className="font-serif font-semibold text-sm">{poleName}</span>
                </div>
                <div className="relative h-2 bg-stone-200 rounded-full mb-2">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full border-2 border-white transition-all duration-700"
                    style={{ left: `${position}%`, transitionDelay: `${i * 200 + 400}ms` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-secondary mb-1">
                  <span>{poleA}</span>
                  <span>{poleB}</span>
                </div>
                {desc && (
                  <p className="text-sm text-secondary mt-1">{desc}</p>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={() => setScreen(2)} className="btn-primary w-full mt-8">
          Continue
        </button>
      </div>
    );
  }

  // Screen 2: Teaser for Module 2
  return (
    <div className={`max-w-md mx-auto text-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <p className="text-lg font-serif leading-relaxed mb-4">
        You know what you want. Now let&apos;s see who you are, and whether those two things align.
      </p>
      <p className="text-sm text-secondary mb-8">
        Module 2 measures how you show up, not what you seek. The gap between them reveals your growth edges.
      </p>
      <button onClick={onContinue} className="btn-primary px-8 py-3">
        Continue to Module 2
        <span className="text-xs opacity-70 ml-2">~39 min</span>
      </button>
    </div>
  );
}
