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

type MatchResult = { rank: number; code: string; name: string; tier: string; compatibilityScore: number; traits: string; summary: string };

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

function tierColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'text-success', kismet: 'text-success/70', effort: 'text-warning',
    longShot: 'text-stone-400', atRisk: 'text-danger/70', incompatible: 'text-danger',
  };
  return colors[tier] || 'text-secondary';
}

function tierLabel(tier: string) {
  const labels: Record<string, string> = {
    ideal: 'Ideal', kismet: 'Kismet', effort: 'Effort',
    longShot: 'Long Shot', atRisk: 'At Risk', incompatible: 'Incompatible',
  };
  return labels[tier] || tier;
}

function tierBgColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'bg-success', kismet: 'bg-success/70', effort: 'bg-warning',
    longShot: 'bg-stone-400', atRisk: 'bg-danger/70', incompatible: 'bg-danger',
  };
  return colors[tier] || 'bg-secondary';
}

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
  const [userPersonaName, setUserPersonaName] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [userMatches, setUserMatches] = useState<MatchResult[]>([]);
  const [bestMatchCode, setBestMatchCode] = useState<string | null>(null);

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

    // Check if user has a persona and matches
    const results = localStorage.getItem('relate_results');
    if (results) {
      try {
        const parsed = JSON.parse(results);
        setUserPersonaCode(parsed.persona?.code || null);
        setUserPersonaName(parsed.persona?.name || null);
        setUserMatches(parsed.matches || []);
        if (parsed.matches?.length > 0) {
          setBestMatchCode(parsed.matches[0].code);
        }
      } catch { /* ignore */ }
    }
    setUserGender(localStorage.getItem('relate_gender'));
  }, []);

  const personas = activeTab === 'male' ? malePersonas : femalePersonas;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
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
          <h2 className="font-serif font-semibold mb-4">Code Key</h2>
          {activeTab === 'male' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-secondary font-mono mb-1">PHYSICAL</p>
                <p className="mb-0.5"><span className="font-mono text-accent">A</span> = Fitness</p>
                <p className="text-[11px] text-secondary/80 leading-snug mb-2">You lead with physical vitality and take pride in how your body performs. Your energy and discipline around fitness signal drive and self-investment.</p>
                <p className="mb-0.5"><span className="font-mono text-accent">B</span> = Maturity</p>
                <p className="text-[11px] text-secondary/80 leading-snug">You lead with depth and lived experience over raw physicality. Your presence carries weight because of who you are, not how you look.</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">SOCIAL</p>
                <p className="mb-0.5"><span className="font-mono text-accent">C</span> = Leadership</p>
                <p className="text-[11px] text-secondary/80 leading-snug mb-2">You naturally take charge in social settings and people look to you for direction. Your confidence in leading creates a sense of safety and momentum.</p>
                <p className="mb-0.5"><span className="font-mono text-accent">D</span> = Presence</p>
                <p className="text-[11px] text-secondary/80 leading-snug">You draw people in through quiet attentiveness rather than commanding the room. Your ability to make others feel seen is your strongest social asset.</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">LIFESTYLE</p>
                <p className="mb-0.5"><span className="font-mono text-accent">E</span> = Thrill</p>
                <p className="text-[11px] text-secondary/80 leading-snug mb-2">You are energized by novelty, adventure, and spontaneous experiences. A life without surprises feels stagnant to you.</p>
                <p className="mb-0.5"><span className="font-mono text-accent">F</span> = Peace</p>
                <p className="text-[11px] text-secondary/80 leading-snug">You are grounded by routine, consistency, and intentional calm. You build a life that feels secure and sustainable over time.</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">VALUES</p>
                <p className="mb-0.5"><span className="font-mono text-accent">G</span> = Traditional</p>
                <p className="text-[11px] text-secondary/80 leading-snug mb-2">You value clearly defined roles and responsibilities in a partnership. Structure and tradition give your relationships a reliable foundation.</p>
                <p className="mb-0.5"><span className="font-mono text-accent">H</span> = Egalitarian</p>
                <p className="text-[11px] text-secondary/80 leading-snug">You believe partnership roles should be negotiated, not inherited. Shared responsibility and flexibility define how you build a life together.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-secondary font-mono mb-1">PHYSICAL</p>
                <p className="mb-0.5"><span className="font-mono text-accent">A</span> = Beauty</p>
                <p className="text-[11px] text-secondary/80 leading-snug mb-2">You lead with aesthetic presence and take pride in how you present yourself. Your appearance signals self-care and intentionality.</p>
                <p className="mb-0.5"><span className="font-mono text-accent">B</span> = Confidence</p>
                <p className="text-[11px] text-secondary/80 leading-snug">You lead with self-assurance that transcends appearance. Your confidence in who you are draws people in more than any physical trait.</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">SOCIAL</p>
                <p className="mb-0.5"><span className="font-mono text-accent">C</span> = Allure</p>
                <p className="text-[11px] text-secondary/80 leading-snug mb-2">You carry an air of magnetic mystery that makes people want to know more. Your selective attention creates intrigue and desire.</p>
                <p className="mb-0.5"><span className="font-mono text-accent">D</span> = Charm</p>
                <p className="text-[11px] text-secondary/80 leading-snug">You connect through warmth, humor, and genuine engagement. People feel instantly comfortable around you because of how present you are.</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">LIFESTYLE</p>
                <p className="mb-0.5"><span className="font-mono text-accent">E</span> = Thrill</p>
                <p className="text-[11px] text-secondary/80 leading-snug mb-2">You are energized by novelty, adventure, and spontaneous experiences. A life without surprises feels stagnant to you.</p>
                <p className="mb-0.5"><span className="font-mono text-accent">F</span> = Peace</p>
                <p className="text-[11px] text-secondary/80 leading-snug">You are grounded by routine, consistency, and intentional calm. You build a life that feels secure and sustainable over time.</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-mono mb-1">VALUES</p>
                <p className="mb-0.5"><span className="font-mono text-accent">G</span> = Traditional</p>
                <p className="text-[11px] text-secondary/80 leading-snug mb-2">You value clearly defined roles and responsibilities in a partnership. Structure and tradition give your relationships a reliable foundation.</p>
                <p className="mb-0.5"><span className="font-mono text-accent">H</span> = Egalitarian</p>
                <p className="text-[11px] text-secondary/80 leading-snug">You believe partnership roles should be negotiated, not inherited. Shared responsibility and flexibility define how you build a life together.</p>
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
            const userGenderTab = userGender === 'M' ? 'male' : 'female';
            const isUserPersona = userPersonaCode === persona.code && activeTab === userGenderTab;
            const isBestMatch = bestMatchCode === persona.code && activeTab !== userGenderTab && !!userGender;
            const dims = decodeDimensions(persona.code, activeTab);

            return (
              <div
                key={persona.code}
                className={`card transition-all ${isUserPersona ? 'border-accent' : isBestMatch ? 'border-success' : ''}`}
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
                        {isBestMatch && (
                          <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-mono">Best Match</span>
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

                    {/* Row 1: Dating Behavior + In Relationships */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {persona.datingBehavior.length > 0 && (
                        <div>
                          <h4 className="text-xs font-mono text-secondary uppercase tracking-wider mb-2">Dating Behavior</h4>
                          <ul className="space-y-1.5">
                            {persona.datingBehavior.map((item, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-accent mt-0.5 flex-shrink-0">&#8226;</span>
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
                                <span className="text-accent mt-0.5 flex-shrink-0">&#8226;</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Row 2: Strengths + Growth Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {persona.mostAttractive.length > 0 && (
                        <div>
                          <h4 className="text-xs font-mono text-success uppercase tracking-wider mb-2">Strengths</h4>
                          <ul className="space-y-1.5">
                            {persona.mostAttractive.map((item, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-success mt-0.5 flex-shrink-0">&#8226;</span>
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
                                <span className="text-warning mt-0.5 flex-shrink-0">&#8226;</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Row 3: Shadow Side (centered) */}
                    {persona.struggles.length > 0 && (
                      <div className="md:w-1/2 md:mx-auto">
                        <h4 className="text-xs font-mono text-secondary uppercase tracking-wider mb-2">Shadow Side</h4>
                        <ul className="space-y-1.5">
                          {persona.struggles.map((item, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-secondary mt-0.5 flex-shrink-0">&#8226;</span>
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

        {/* Cross-Gender Compatibility */}
        {userPersonaCode && userMatches.length > 0 && (
          <div className="mt-10">
            <div className="text-center mb-6">
              <p className="font-mono text-xs tracking-widest text-accent uppercase mb-2">Your Matches</p>
              <h2 className="font-serif text-2xl font-semibold mb-2">
                How {userPersonaName || 'You'} Matches With {userGender === 'M' ? 'Female' : 'Male'} Personas
              </h2>
              <p className="text-secondary text-sm max-w-lg mx-auto">
                Based on your complete assessment results, here is your compatibility with all 16 {userGender === 'M' ? 'female' : 'male'} personas, ranked by score.
              </p>
            </div>

            <div className="card mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-mono text-sm font-semibold">
                  {userPersonaCode}
                </div>
                <div>
                  <p className="font-serif font-semibold">{userPersonaName}</p>
                  <p className="text-xs text-secondary">Your persona compatibility with all {userGender === 'M' ? 'female' : 'male'} personas</p>
                </div>
              </div>

              <div className="space-y-2">
                {userMatches.map((match) => (
                  <div key={match.code} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <span className="font-mono text-xs text-secondary w-6 text-right">{match.rank}</span>
                    <div className={`w-2 h-2 rounded-full ${tierBgColor(match.tier)} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{match.name}</span>
                        <span className="font-mono text-xs text-accent">{match.code}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${tierColor(match.tier)}`}>{tierLabel(match.tier)}</span>
                    <div className="w-16 text-right">
                      <span className="font-mono text-sm font-semibold">{match.compatibilityScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center text-xs">
              {['ideal', 'kismet', 'effort', 'longShot', 'atRisk', 'incompatible'].map(tier => {
                const count = userMatches.filter(m => m.tier === tier).length;
                if (count === 0) return null;
                return (
                  <span key={tier} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${tierBgColor(tier)}`} />
                    <span className="text-secondary">{tierLabel(tier)} ({count})</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12 mb-8">
          <p className="text-secondary mb-4">Don&apos;t know your persona yet?</p>
          <Link href="/auth/signup" className="btn-primary">Take the Assessment</Link>
        </div>
      </main>
    </div>
  );
}
