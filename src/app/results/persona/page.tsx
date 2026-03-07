'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';
import { Icon } from '@/components/Icon';

const CODE_TO_POLE: Record<string, 'A' | 'B'> = {
  A: 'A', B: 'B', C: 'A', D: 'B', E: 'A', F: 'B', G: 'A', H: 'B',
};

const DIMS = ['physical', 'social', 'lifestyle', 'values'] as const;

function getCodeKeys(code: string, m2Poles: any): Array<{ dim: string; pole: string; description: string }> {
  if (!code || code.length !== 4) return [];
  return DIMS.map((dim, i) => {
    const letter = code[i];
    const poleKey = CODE_TO_POLE[letter] || 'A';
    const poleName = m2Poles?.[dim]?.[poleKey] || letter;
    const descKey = poleKey === 'A' ? 'descriptionA' : 'descriptionB';
    const description = m2Poles?.[dim]?.[descKey] || m2Poles?.[dim]?.description || '';
    return { dim, pole: poleName, description };
  });
}

export default function PersonaPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (!stored) { router.push('/assessment'); return; }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.persona) { router.push('/assessment'); return; }
      setReport(parsed);
    } catch { router.push('/assessment'); }
  }, [router]);

  if (!report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  const { persona } = report;
  const codeKeys = getCodeKeys(persona.code, report.m2Poles);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        <span className="font-mono text-xs text-secondary">Your Persona</span>
        <h2 className="font-serif text-3xl font-semibold mt-1 mb-1">{persona.name}</h2>
        <span className="font-mono text-sm text-accent">{persona.code}</span>
        {/* traits string removed per design */}

        {codeKeys.length > 0 && (
          <section className="mt-8 mb-6">
            <div className="flex flex-wrap gap-3">
              {codeKeys.map((k) => (
                <div key={k.dim} className="card text-center flex-1 min-w-[120px]">
                  <span className="inline-block text-[10px] border border-accent text-accent rounded-md px-2 py-1 mb-2.5 mt-1 font-medium capitalize">
                    {k.dim}
                  </span>
                  <p className="font-serif text-sm font-semibold text-foreground mb-1">{k.pole}</p>
                  {k.description && (
                    <p className="text-[11px] text-secondary/80 leading-snug">{k.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {persona.datingBehavior?.length > 0 && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2"><Icon name="touch_app" size={20} className="text-accent" />Dating Behavior</h3>
            <ul className="bullet-list">
              {persona.datingBehavior.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
        )}

        {persona.inRelationships?.length > 0 && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2"><Icon name="people" size={20} className="text-accent" />In Relationships</h3>
            <ul className="bullet-list">
              {persona.inRelationships.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {persona.mostAttractive?.length > 0 && (
            <section className="card">
              <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2 text-success"><Icon name="star" size={20} className="text-accent" />Strengths</h3>
              <ul className="bullet-list">
                {persona.mostAttractive.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </section>
          )}

          {persona.leastAttractive?.length > 0 && (
            <section className="card">
              <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2 text-warning"><Icon name="spa" size={20} className="text-accent" />Growth Areas</h3>
              <ul className="bullet-list">
                {persona.leastAttractive.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
