'use client';

import { useState, useEffect } from 'react';
import ProgressRing from '../ProgressRing';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  scoredData: any;
  onContinue: () => void;
};

const PERSONA_TAGLINES: Record<string, string> = {
  ACEG: 'Commands the arena',
  ACEH: 'Charts the unknown',
  ACFG: 'Moves unseen',
  ACFH: 'Architects the system',
  ADEG: 'Rides the frontier',
  ADEH: 'Guides the ascent',
  ADFG: 'Preserves what matters',
  ADFH: 'Connects the network',
  BCEG: 'Holds the line',
  BCEH: 'Explores the edge',
  BCFG: 'Stewards the institution',
  BCFH: 'Illuminates the path',
  BDEG: 'Patrols the boundary',
  BDEH: 'Scripts the narrative',
  BDFG: 'Tends the roots',
  BDFH: 'Constructs the future',
};

function getPolePairs(m2Poles: any, code: string): Array<{ dim: string; pole: string }> {
  if (!code || code.length !== 4) return [];
  const dims = ['physical', 'social', 'lifestyle', 'values'];
  return dims.map((dim, i) => {
    const letter = code[i];
    const poleName = m2Poles?.[dim]?.[letter] || letter;
    return { dim, pole: poleName };
  });
}

export default function M2Reward({ scoredData, onContinue }: Props) {
  const [screen, setScreen] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const { result, personaMetadata, m2Poles, m1Result, m1Poles } = scoredData;
  const personaCode = result?.code || 'BDFH';
  const personaName = personaMetadata?.name || `The ${personaCode}`;
  const tagline = PERSONA_TAGLINES[personaCode] || '';
  const polePairs = getPolePairs(m2Poles, personaCode);

  useEffect(() => {
    if (screen === 0) {
      const timer = setTimeout(() => {
        setFadeIn(true);
        setTimeout(() => setScreen(1), 3000);
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
          <h2 className="font-serif text-2xl font-semibold">Module 2 Complete</h2>
        </div>
      </div>
    );
  }

  // Screen 1: Persona Reveal
  if (screen === 1) {
    return (
      <div className={`max-w-md mx-auto text-center transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-xs text-secondary">You are</span>
        <h2
          className="font-serif text-4xl font-semibold mt-2 mb-2 transition-all duration-1000"
          style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)' }}
        >
          {personaName}
        </h2>
        {tagline && (
          <p
            className="text-secondary italic mb-4 transition-all duration-700"
            style={{ transitionDelay: '400ms', opacity: fadeIn ? 1 : 0 }}
          >
            &ldquo;{tagline}&rdquo;
          </p>
        )}
        <p
          className="font-mono text-lg text-accent mb-6 transition-all duration-700"
          style={{ transitionDelay: '600ms', opacity: fadeIn ? 1 : 0 }}
        >
          {personaCode}
        </p>

        <div
          className="flex justify-center gap-4 flex-wrap transition-all duration-700"
          style={{ transitionDelay: '800ms', opacity: fadeIn ? 1 : 0 }}
        >
          {polePairs.map((p) => (
            <span key={p.dim} className="text-xs border border-border rounded-md px-3 py-1.5">
              {p.pole}
            </span>
          ))}
        </div>

        <button onClick={() => setScreen(2)} className="btn-primary mt-10">
          Learn More
        </button>
      </div>
    );
  }

  // Screen 2: Persona Description
  if (screen === 2) {
    const desc = personaMetadata?.datingBehavior?.[0] || personaMetadata?.inRelationships?.[0] || '';
    const strengths = personaMetadata?.mostAttractive?.slice(0, 2) || [];
    const challenges = personaMetadata?.leastAttractive?.slice(0, 2) || [];

    return (
      <div className={`max-w-xl mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="font-serif text-xl font-semibold">{personaName}</h3>
          <span className="font-mono text-xs text-accent">{personaCode}</span>
        </div>

        {desc && <p className="text-secondary mb-6 leading-relaxed">{desc}</p>}

        {(strengths.length > 0 || challenges.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {strengths.length > 0 && (
              <div className="card">
                <h4 className="text-xs font-mono text-success mb-2">In Partnership, You Offer</h4>
                {strengths.map((s: string, i: number) => (
                  <p key={i} className="text-sm text-secondary mb-1">{s}</p>
                ))}
              </div>
            )}
            {challenges.length > 0 && (
              <div className="card">
                <h4 className="text-xs font-mono text-warning mb-2">Your Challenge</h4>
                {challenges.map((c: string, i: number) => (
                  <p key={i} className="text-sm text-secondary mb-1">{c}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={() => setScreen(3)} className="btn-primary w-full">
          See How You Align
        </button>
      </div>
    );
  }

  // Screen 3: Tension Preview (M1 vs M2 comparison)
  if (screen === 3) {
    const m1Dims = m1Result?.dimensions || {};
    const m2Dims = result?.dimensions || {};
    const dims = ['physical', 'social', 'lifestyle', 'values'];

    const alignments: Array<{ dim: string; m1Pole: string; m2Pole: string; aligned: boolean }> = [];

    for (const dim of dims) {
      const m1Pole = m1Dims[dim]?.assignedPole || '';
      const m2PoleName = m2Dims[dim]?.poleName || m2Dims[dim]?.assignedPole || '';

      // Get M1 pole letter from assigned pole name
      const m1Dir = m1Dims[dim]?.direction || '';
      const m2Dir = m2Dims[dim]?.assignedPole || '';

      // They align if the same letter (A/B) or same conceptual pole
      // For lifestyle/values, poles have same names, so compare directly
      let aligned = false;
      if (dim === 'lifestyle' || dim === 'values') {
        aligned = m1Pole === m2PoleName;
      } else {
        // Cross-gender poles: check if direction letters match
        aligned = m1Dir === m2Dir;
      }

      alignments.push({ dim, m1Pole, m2Pole: m2PoleName, aligned });
    }

    const matched = alignments.filter(a => a.aligned);
    const tensions = alignments.filter(a => !a.aligned);

    return (
      <div className={`max-w-xl mx-auto transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-serif text-xl font-semibold mb-6">Where You Align</h3>

        {matched.length > 0 && (
          <div className="space-y-3 mb-8">
            {matched.map((a, i) => (
              <div
                key={a.dim}
                className="flex items-start gap-3 transition-all duration-500"
                style={{ transitionDelay: `${i * 150}ms`, opacity: fadeIn ? 1 : 0 }}
              >
                <span className="text-success mt-0.5">&#10003;</span>
                <div>
                  <span className="text-sm font-medium capitalize">{a.dim}</span>
                  <p className="text-xs text-secondary">
                    You want <strong>{a.m1Pole}</strong> and you are <strong>{a.m2Pole}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tensions.length > 0 && (
          <>
            <h3 className="font-serif text-xl font-semibold mb-4">Where There&apos;s Tension</h3>
            <div className="space-y-3 mb-4">
              {tensions.map((a, i) => (
                <div
                  key={a.dim}
                  className="flex items-start gap-3 transition-all duration-500"
                  style={{ transitionDelay: `${(matched.length + i) * 150}ms`, opacity: fadeIn ? 1 : 0 }}
                >
                  <span className="text-warning mt-0.5">&#9889;</span>
                  <div>
                    <span className="text-sm font-medium capitalize">{a.dim}</span>
                    <p className="text-xs text-secondary">
                      You want <strong>{a.m1Pole}</strong> but lead with <strong>{a.m2Pole}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-secondary italic mb-6">
              These gaps aren&apos;t flaws. They&apos;re where growth happens — and where the wrong match exposes friction.
            </p>
          </>
        )}

        {matched.length > 0 && tensions.length === 0 && (
          <p className="text-sm text-secondary mb-6">
            Strong alignment between what you seek and who you are. This coherence is an asset in relationships.
          </p>
        )}

        <button onClick={() => setScreen(4)} className="btn-primary w-full">
          Continue
        </button>
      </div>
    );
  }

  // Screen 4: Teaser for M3
  return (
    <div className={`max-w-md mx-auto text-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <p className="text-lg font-serif leading-relaxed mb-4">
        You know what you want and who you are. Now let&apos;s examine how you connect.
      </p>
      <p className="text-sm text-secondary mb-8">
        What you offer a partner, what you need from them, and whether you&apos;re paying attention.
      </p>
      <button onClick={onContinue} className="btn-primary px-8 py-3">
        Continue to Module 3
        <span className="text-xs opacity-70 ml-2">~8 min</span>
      </button>
    </div>
  );
}
