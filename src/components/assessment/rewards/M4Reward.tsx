'use client';

import { useState, useEffect } from 'react';
import ProgressRing from '../ProgressRing';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  scoredData: any;
  totalQuestions: number;
  onContinue: () => void;
};

const APPROACH_DESC: Record<string, string> = {
  withdraw: "When overwhelmed, you need space to process. You'll come back - but you need to leave first.",
  pursue: "When threatened, you move toward the conflict. You'd rather fight it out than let it fester.",
};

const DRIVER_DESC: Record<string, string> = {
  inadequacy: "Your deepest fear in conflict: not being enough. Criticism lands harder on you than most.",
  abandonment: "Your deepest fear in conflict: being left. Distance during fights feels existentially threatening.",
  engulfment: "Your deepest fear in conflict: losing yourself. Pressure to change feels like erasure.",
  injustice: "Your deepest fear in conflict: unfairness. Double standards and hypocrisy are your triggers.",
};

const REPAIR_SPEED_DESC: Record<string, string> = {
  slow: "You don't bounce back quickly. You need to process before you can reconnect.",
  quick: "You recover fast. You'd rather resolve and move on than sit in the aftermath.",
};

const REPAIR_MODE_DESC: Record<string, string> = {
  verbal: "Words heal you more than touch. You need to talk through what happened.",
  physical: "Physical closeness heals you. A touch can say what words can't.",
};

const CAPACITY_DESC: Record<string, string> = {
  high: "You can hold intensity without flooding. You have bandwidth for difficult conversations.",
  medium: "You can handle moderate conflict but need breaks during intense episodes.",
  low: "Conflict overwhelms your system quickly. You need careful pacing and safety.",
};

function normalizeGottmanScore(rawScore: number): number {
  // Raw scores are 4-20, normalize to 0-100
  return Math.round(((rawScore - 4) / 16) * 100);
}

export default function M4Reward({ scoredData, totalQuestions, onContinue }: Props) {
  const [screen, setScreen] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const { result } = scoredData;
  const summary = result?.summary || {};
  const gottman = result?.gottmanScreener?.horsemen || {};

  useEffect(() => {
    if (screen === 0) {
      const timer = setTimeout(() => {
        setFadeIn(true);
        setTimeout(() => setScreen(1), 2500);
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
          <h2 className="font-serif text-2xl font-semibold">Assessment Complete</h2>
        </div>
      </div>
    );
  }

  // Screen 1: Conflict Signature
  if (screen === 1) {
    const fields = [
      { label: 'Approach', value: summary.approach, desc: APPROACH_DESC[summary.approach] || '' },
      { label: 'Primary Driver', value: summary.primaryDriver, desc: DRIVER_DESC[summary.primaryDriver] || '' },
      { label: 'Repair Speed', value: summary.repairSpeed, desc: REPAIR_SPEED_DESC[summary.repairSpeed] || '' },
      { label: 'Repair Mode', value: summary.repairMode, desc: REPAIR_MODE_DESC[summary.repairMode] || '' },
      { label: 'Capacity', value: summary.capacity, desc: CAPACITY_DESC[summary.capacity] || '' },
    ];

    return (
      <div className={`max-w-xl mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <span className="font-mono text-xs text-secondary">Your Conflict Signature</span>
        <h2 className="font-serif text-2xl font-semibold mt-1 mb-8">When Things Get Hard</h2>

        <div className="space-y-5">
          {fields.map((f, i) => (
            <div
              key={f.label}
              className="transition-all duration-500"
              style={{ transitionDelay: `${i * 150}ms`, opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-xs font-mono text-secondary w-28">{f.label}:</span>
                <span className="font-serif font-semibold uppercase">{f.value || '-'}</span>
              </div>
              {f.desc && <p className="text-sm text-secondary ml-[7.5rem] leading-relaxed">{f.desc}</p>}
            </div>
          ))}
        </div>

        <button onClick={() => setScreen(2)} className="btn-primary w-full mt-8">
          See Warning Signals
        </button>
      </div>
    );
  }

  // Screen 2: Gottman Horsemen
  if (screen === 2) {
    const horsemen = ['criticism', 'contempt', 'defensiveness', 'stonewalling'];

    const ANTIDOTES: Record<string, string> = {
      criticism: 'When hurt, you may attack character rather than behavior. "You always..." and "You never..." are your tells.',
      contempt: 'Superiority or mockery during conflict. The most corrosive pattern in relationships.',
      defensiveness: 'When accused, your instinct is to counter-attack. Hearing feedback is a growth edge.',
      stonewalling: 'Shutting down entirely. You withdraw not just physically but emotionally.',
    };

    return (
      <div className={`max-w-xl mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-serif text-xl font-semibold mb-6">Patterns to Watch</h3>

        <div className="space-y-5">
          {horsemen.map((h, i) => {
            const data = gottman[h] || {};
            const raw = data.score || 4;
            const score = normalizeGottmanScore(raw);
            const risk = data.riskLevel || (score > 70 ? 'high' : score > 40 ? 'moderate' : 'low');
            const isRisk = risk === 'high' || risk === 'elevated';

            return (
              <div
                key={h}
                className="transition-all duration-500"
                style={{ transitionDelay: `${i * 200}ms`, opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(8px)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm ${isRisk ? 'text-warning' : 'text-success'}`}>
                    {isRisk ? '\u26A0' : '\u2713'}
                  </span>
                  <span className="text-sm font-medium capitalize">{h}</span>
                  <span className={`font-mono text-xs ml-auto ${isRisk ? 'text-warning' : 'text-success'}`}>
                    {score}/100
                  </span>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      score > 70 ? 'bg-danger' : score > 40 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${score}%`, transitionDelay: `${i * 200 + 400}ms` }}
                  />
                </div>
                {isRisk && (
                  <p className="text-xs text-secondary leading-relaxed">{ANTIDOTES[h]}</p>
                )}
                {!isRisk && (
                  <p className="text-xs text-secondary">
                    {risk === 'low' ? 'Low risk. This is not a significant pattern for you.' : 'Moderate range. Worth monitoring.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-secondary italic mt-6 mb-6">
          These aren&apos;t character flaws. They&apos;re patterns you can interrupt once you see them.
        </p>

        <button onClick={() => setScreen(3)} className="btn-primary w-full">
          Continue
        </button>
      </div>
    );
  }

  // Screen 3: Compatibility Preview
  if (screen === 3) {
    return (
      <div className={`max-w-md mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-secondary text-sm leading-relaxed mb-8">
          Your conflict style shapes which matches will thrive and which will spiral.
          {summary.approach === 'withdraw'
            ? " A partner who pursues while you withdraw creates a deadly loop - unless one of you can break pattern. A partner who also withdraws may avoid conflict entirely, letting resentment build."
            : " A partner who withdraws while you pursue creates a chase dynamic - your intensity meets their silence. A partner who also pursues may escalate conflicts into warfare."
          }
        </p>
        <p className="text-xs text-secondary italic mb-8">
          Your full report shows exactly which of your 16 matches carry these risks - and which are built to last.
        </p>

        <button onClick={() => setScreen(4)} className="btn-primary w-full">
          See Summary
        </button>
      </div>
    );
  }

  // Screen 4: Final Summary
  return (
    <div className={`max-w-md mx-auto text-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-8">
        <span className="font-mono text-xs text-secondary">YOUR ASSESSMENT IS COMPLETE</span>
      </div>

      <div
        className="grid grid-cols-2 gap-4 mb-8"
      >
        {[
          { value: `${totalQuestions}+`, label: 'questions answered' },
          { value: '4', label: 'modules scored' },
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
