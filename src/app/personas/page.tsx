'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

type PersonaData = {
  code: string;
  name: string;
  traits: string;
  datingBehavior: string[];
  inRelationships: string[];
  mostAttractive: string[];
  leastAttractive: string[];
  struggles: string[];
};

const MALE_CODES = ['ACEG', 'ACEH', 'ACFG', 'ACFH', 'ADEG', 'ADEH', 'ADFG', 'ADFH', 'BCEG', 'BCEH', 'BCFG', 'BCFH', 'BDEG', 'BDEH', 'BDFG', 'BDFH'];
const FEMALE_CODES = ['ACEG', 'ACEH', 'ACFG', 'ACFH', 'ADEG', 'ADEH', 'ADFG', 'ADFH', 'BCEG', 'BCEH', 'BCFG', 'BCFH', 'BDEG', 'BDEH', 'BDFG', 'BDFH'];

const MALE_DIMENSION_LABELS: Record<string, string> = {
  A: 'Fitness', B: 'Maturity', C: 'Leadership', D: 'Presence',
  E: 'Adventure', F: 'Stability', G: 'Traditional', H: 'Egalitarian',
};

const FEMALE_DIMENSION_LABELS: Record<string, string> = {
  A: 'Beauty', B: 'Confidence', C: 'Allure', D: 'Charm',
  E: 'Thrill', F: 'Peace', G: 'Traditional', H: 'Egalitarian',
};

function decodeDimensions(code: string, gender: 'male' | 'female'): string[] {
  const labels = gender === 'male' ? MALE_DIMENSION_LABELS : FEMALE_DIMENSION_LABELS;
  return code.split('').map(letter => labels[letter] || letter);
}

export default function PersonasPage() {
  const [malePersonas, setMalePersonas] = useState<PersonaData[]>([]);
  const [femalePersonas, setFemalePersonas] = useState<PersonaData[]>([]);
  const [activeTab, setActiveTab] = useState<'male' | 'female'>('male');
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [userPersonaCode, setUserPersonaCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const personaModule = require('../../../relate_persona_definitions.js');
      const maleData = personaModule.M2_PERSONA_METADATA || {};
      const femaleData = personaModule.W2_PERSONA_METADATA || {};

      const males: PersonaData[] = MALE_CODES.map(code => ({
        code,
        name: maleData[code]?.name || code,
        traits: maleData[code]?.traits || '',
        datingBehavior: maleData[code]?.datingBehavior || [],
        inRelationships: maleData[code]?.inRelationships || [],
        mostAttractive: maleData[code]?.mostAttractive || [],
        leastAttractive: maleData[code]?.leastAttractive || [],
        struggles: maleData[code]?.struggles || [],
      }));

      const females: PersonaData[] = FEMALE_CODES.map(code => ({
        code,
        name: femaleData[code]?.name || code,
        traits: femaleData[code]?.traits || '',
        datingBehavior: femaleData[code]?.datingBehavior || [],
        inRelationships: femaleData[code]?.inRelationships || [],
        mostAttractive: femaleData[code]?.mostAttractive || [],
        leastAttractive: femaleData[code]?.leastAttractive || [],
        struggles: femaleData[code]?.struggles || [],
      }));

      setMalePersonas(males);
      setFemalePersonas(females);
    } catch (e) {
      console.error('Failed to load persona data:', e);
    }

    // Check if user has a persona
    const results = localStorage.getItem('relate_results');
    if (results) {
      try {
        const parsed = JSON.parse(results);
        setUserPersonaCode(parsed.persona?.code || null);
      } catch { /* ignore */ }
    }
  }, []);

  const personas = activeTab === 'male' ? malePersonas : femalePersonas;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Reference Guide</p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-3">The 32 Personas</h1>
          <p className="text-secondary max-w-lg mx-auto">
            Each persona is defined by a 4-letter code representing your position on four dimensions: Physical, Social, Lifestyle, and Values.
          </p>
        </div>

        {/* Dimension Key */}
        <div className="card mb-8">
          <h2 className="font-serif font-semibold mb-3">Code Key</h2>
          {activeTab === 'male' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-secondary font-mono mb-1">PHYSICAL</p>
                <p><span className="font-mono text-accent">A</span> = Fitness</p>
                <p><span className="font-mono text-accent">B</span> = Maturity</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">SOCIAL</p>
                <p><span className="font-mono text-accent">C</span> = Leadership</p>
                <p><span className="font-mono text-accent">D</span> = Presence</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">LIFESTYLE</p>
                <p><span className="font-mono text-accent">E</span> = Adventure</p>
                <p><span className="font-mono text-accent">F</span> = Stability</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">VALUES</p>
                <p><span className="font-mono text-accent">G</span> = Traditional</p>
                <p><span className="font-mono text-accent">H</span> = Egalitarian</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-secondary font-mono mb-1">PHYSICAL</p>
                <p><span className="font-mono text-accent">A</span> = Beauty</p>
                <p><span className="font-mono text-accent">B</span> = Confidence</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">SOCIAL</p>
                <p><span className="font-mono text-accent">C</span> = Allure</p>
                <p><span className="font-mono text-accent">D</span> = Charm</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">LIFESTYLE</p>
                <p><span className="font-mono text-accent">E</span> = Thrill</p>
                <p><span className="font-mono text-accent">F</span> = Peace</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">VALUES</p>
                <p><span className="font-mono text-accent">G</span> = Traditional</p>
                <p><span className="font-mono text-accent">H</span> = Egalitarian</p>
              </div>
            </div>
          )}
        </div>

        {/* Gender tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-md w-fit">
          <button
            onClick={() => { setActiveTab('male'); setExpandedCode(null); }}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'male' ? 'bg-white text-foreground font-medium shadow-sm' : 'text-secondary hover:text-foreground'
            }`}
          >
            Male Personas (16)
          </button>
          <button
            onClick={() => { setActiveTab('female'); setExpandedCode(null); }}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'female' ? 'bg-white text-foreground font-medium shadow-sm' : 'text-secondary hover:text-foreground'
            }`}
          >
            Female Personas (16)
          </button>
        </div>

        {/* Personas grid */}
        <div className="space-y-3">
          {personas.map((persona) => {
            const isExpanded = expandedCode === persona.code;
            const isUserPersona = userPersonaCode === persona.code;
            const dims = decodeDimensions(persona.code, activeTab);

            return (
              <div
                key={persona.code}
                className={`card transition-all ${isUserPersona ? 'border-accent' : ''}`}
              >
                {/* Collapsed view */}
                <button
                  onClick={() => setExpandedCode(isExpanded ? null : persona.code)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-accent w-12">{persona.code}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-semibold">{persona.name}</h3>
                        {isUserPersona && (
                          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-mono">You</span>
                        )}
                      </div>
                      <p className="text-xs text-secondary">{dims.join(' + ')}</p>
                    </div>
                  </div>
                  <span className="text-secondary text-sm">{isExpanded ? '−' : '+'}</span>
                </button>

                {/* Expanded view */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-5">
                    {persona.traits && (
                      <p className="text-sm text-secondary italic">{persona.traits}</p>
                    )}

                    {persona.datingBehavior.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono text-secondary uppercase tracking-wider mb-2">Dating Behavior</h4>
                        <ul className="space-y-1.5">
                          {persona.datingBehavior.map((item, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-accent mt-0.5 flex-shrink-0">—</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {persona.inRelationships.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono text-secondary uppercase tracking-wider mb-2">In Relationships</h4>
                        <ul className="space-y-1.5">
                          {persona.inRelationships.map((item, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-accent mt-0.5 flex-shrink-0">—</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {persona.mostAttractive.length > 0 && (
                        <div>
                          <h4 className="text-xs font-mono text-success uppercase tracking-wider mb-2">Strengths</h4>
                          <ul className="space-y-1.5">
                            {persona.mostAttractive.map((item, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-success mt-0.5 flex-shrink-0">—</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {persona.leastAttractive.length > 0 && (
                        <div>
                          <h4 className="text-xs font-mono text-warning uppercase tracking-wider mb-2">Growth Areas</h4>
                          <ul className="space-y-1.5">
                            {persona.leastAttractive.map((item, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-warning mt-0.5 flex-shrink-0">—</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {persona.struggles.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono text-secondary uppercase tracking-wider mb-2">Shadow Side</h4>
                        <ul className="space-y-1.5">
                          {persona.struggles.map((item, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-secondary mt-0.5 flex-shrink-0">—</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 mb-8">
          <p className="text-secondary mb-4">Don&apos;t know your persona yet?</p>
          <Link href="/auth/signup" className="btn-primary">Take the Assessment</Link>
        </div>
      </main>
    </div>
  );
}
