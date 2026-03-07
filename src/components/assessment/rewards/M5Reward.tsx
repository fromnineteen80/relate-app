'use client';

import { useState, useEffect } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  scoredData: any;
  totalQuestions: number;
  onContinue: () => void;
};

const ARMOR_LABELS: Record<string, string> = {
  perfectionism: 'Perfectionism',
  numbing: 'Numbing',
  cynicism: 'Cynicism',
  control: 'Control',
  flooding: 'Flooding',
  hypervigilance: 'Hypervigilance',
};

const ARMOR_CORE: Record<string, string> = {
  perfectionism: 'If I look perfect, I can avoid shame.',
  numbing: "If I don't feel it, it can't hurt me.",
  cynicism: "If I don't hope, I can't be disappointed.",
  control: 'If I control everything, nothing can surprise me.',
  flooding: "If I feel everything loudly, they'll have to respond.",
  hypervigilance: 'If I watch closely enough, I can prevent the pain.',
};

export default function M5Reward({ scoredData, totalQuestions, onContinue }: Props) {
  const [screen, setScreen] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [screen]);

  const result = scoredData?.result;
  const primaryArmor = result?.vulnerability?.primaryArmor;
  const armorLabel = ARMOR_LABELS[primaryArmor] || 'Unknown';
  const armorCore = ARMOR_CORE[primaryArmor] || '';

  // Screen 0: Armor reveal
  if (screen === 0) {
    return (
      <div className={`max-w-md mx-auto text-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <span className="font-mono text-xs text-secondary tracking-wider">YOUR PRIMARY ARMOR</span>
        <h2 className="font-serif text-3xl font-semibold mt-2 mb-3">{armorLabel}</h2>
        <p className="text-secondary text-sm italic mb-6">&ldquo;{armorCore}&rdquo;</p>
        <p className="text-sm text-secondary leading-relaxed mb-8">
          This is the protection strategy you developed early and still reach for under stress.
          It served you once. Your full report explores what it costs you now and what the first step toward something different looks like.
        </p>
        <button onClick={() => setScreen(1)} className="btn-primary w-full">
          Continue
        </button>
      </div>
    );
  }

  // Screen 1: Final summary
  return (
    <div className={`max-w-md mx-auto text-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-8">
        <span className="font-mono text-xs text-secondary">YOUR ASSESSMENT IS COMPLETE</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { value: `${totalQuestions}+`, label: 'questions answered' },
          { value: '5', label: 'modules scored' },
          { value: '1', label: 'persona assigned' },
          { value: '16', label: 'matches ranked' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="card text-center transition-all duration-500"
            style={{ transitionDelay: `${i * 150}ms`, opacity: fadeIn ? 1 : 0 }}
          >
            <p className="font-mono text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="font-serif text-lg mb-8">Your results are ready.</p>

      <button onClick={onContinue} className="btn-primary px-8 py-3 w-full">
        See Your Results
      </button>
    </div>
  );
}
