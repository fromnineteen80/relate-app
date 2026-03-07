'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';
import { Icon } from '@/components/Icon';

/* eslint-disable @typescript-eslint/no-explicit-any */

const CODE_TO_POLE: Record<string, 'A' | 'B'> = {
  A: 'A', B: 'B', C: 'A', D: 'B', E: 'A', F: 'B', G: 'A', H: 'B',
};

const DIMS = ['physical', 'social', 'lifestyle', 'values'] as const;

const MEN_M2_POLES: Record<string, any> = {
  physical: { A: 'Fitness', B: 'Maturity', descriptionA: 'He leads with physical vitality and takes pride in how his body performs. His energy and discipline around fitness signal drive and self-investment.', descriptionB: 'He leads with depth and lived experience over raw physicality. His presence carries weight because of who he is, not how he looks.' },
  social: { A: 'Leadership', B: 'Presence', descriptionA: 'He naturally takes charge in social settings and people look to him for direction. His confidence in leading creates a sense of safety and momentum.', descriptionB: 'He draws people in through quiet attentiveness rather than commanding the room. His ability to make others feel seen is his strongest social asset.' },
  lifestyle: { A: 'Adventure', B: 'Stability', descriptionA: 'He is energized by novelty, adventure, and spontaneous experiences. A life without surprises feels stagnant to him.', descriptionB: 'He is grounded by routine, consistency, and a reliable foundation. He builds a life that feels secure and sustainable over time.' },
  values: { A: 'Traditional', B: 'Egalitarian', descriptionA: 'He values clearly defined roles and responsibilities in a partnership. Structure and tradition give his relationships a reliable foundation.', descriptionB: 'He believes partnership roles should be negotiated, not inherited. Shared responsibility and flexibility define how he builds a life together.' },
};

const WOMEN_W2_POLES: Record<string, any> = {
  physical: { A: 'Beauty', B: 'Confidence', descriptionA: 'She leads with aesthetic presence and takes pride in how she presents herself. Her appearance signals self-care and intentionality.', descriptionB: 'She leads with self-assurance that transcends appearance. Her confidence in who she is draws people in more than any physical trait.' },
  social: { A: 'Allure', B: 'Charm', descriptionA: 'She carries an air of magnetic mystery that makes people want to know more. Her selective attention creates intrigue and desire.', descriptionB: 'She connects through warmth, humor, and genuine engagement. People feel instantly comfortable around her because of how present she is.' },
  lifestyle: { A: 'Thrill', B: 'Peace', descriptionA: 'She is energized by novelty, adventure, and spontaneous experiences. A life without surprises feels stagnant to her.', descriptionB: 'She is grounded by routine, consistency, and intentional calm. She builds a life that feels secure and sustainable over time.' },
  values: { A: 'Traditional', B: 'Egalitarian', descriptionA: 'She values clearly defined roles and responsibilities in a partnership. Structure and tradition give her relationships a reliable foundation.', descriptionB: 'She believes partnership roles should be negotiated, not inherited. Shared responsibility and flexibility define how she builds a life together.' },
};

function getCodeKeys(code: string, m2Poles: any): Array<{ dim: string; pole: string; description: string }> {
  if (!code || code.length !== 4) return [];
  return DIMS.map((dim, i) => {
    const letter = code[i];
    const poleKey = CODE_TO_POLE[letter] || 'A';
    const poleName = m2Poles?.[dim]?.[poleKey] || letter;
    const descKey = poleKey === 'A' ? 'descriptionA' : 'descriptionB';
    const description = m2Poles?.[dim]?.[descKey] || '';
    return { dim, pole: poleName, description };
  });
}

function tierLabel(tier: string) {
  const labels: Record<string, string> = {
    ideal: 'Ideal', kismet: 'Kismet', effort: 'Effort',
    longShot: 'Long Shot', atRisk: 'At Risk', incompatible: 'Incompatible',
  };
  return labels[tier] || tier;
}

function tierTextColor(tier: string) {
  const colors: Record<string, string> = {
    ideal: 'text-success', kismet: 'text-success/70', effort: 'text-warning',
    longShot: 'text-stone-400', atRisk: 'text-danger/70', incompatible: 'text-danger',
  };
  return colors[tier] || 'text-secondary';
}

function scoreContext(key: string, value: number, userName?: string, matchName?: string): string {
  const v = Math.round(value);
  const high = v >= 70;
  const mid = v >= 40 && v < 70;
  const you = userName || 'your persona';
  const them = matchName || 'this persona';
  switch (key) {
    case 'tier':
      return high ? `Strong alignment between ${you} and ${them}. Your core personalities are naturally compatible.`
        : mid ? `Moderate alignment between ${you} and ${them}, workable with mutual effort and awareness.`
        : `Lower alignment between ${you} and ${them}. Meaningful differences in how you each approach relationships.`;
    case 'preference':
      return high ? `As ${you}, you closely match what ${them} typically looks for in a partner.`
        : mid ? `You partially match what ${them} looks for, with some gaps to be aware of.`
        : `As ${you}, you fall outside several of ${them}'s typical preferences.`;
    case 'dimension':
      return high ? `${you} and ${them} share closely aligned behavioral patterns and lifestyle values.`
        : mid ? `Some behavioral overlap between ${you} and ${them}, but notable differences in a few areas.`
        : `Significant differences in day-to-day tendencies between ${you} and ${them}.`;
    case 'intimacy':
      return high ? `High alignment in how ${you} and ${them} each express and receive intimacy.`
        : mid ? `Some differences in intimacy needs between ${you} and ${them}. Communication will be important.`
        : `${you} and ${them} have very different intimacy styles. Requires intentional understanding.`;
    case 'conflict':
      return high ? `${you} and ${them} handle disagreements in complementary ways, reducing friction.`
        : mid ? `Some differences in conflict style between ${you} and ${them} that may require adjustment.`
        : `${you} and ${them} have opposing conflict styles. May need clear strategies for disagreements.`;
    default:
      return '';
  }
}

function InsightCard({ title, icon, items, accent, iconColor }: { title: string; icon: string; items: string[]; accent?: boolean; iconColor?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <section className={`card mb-4 ${accent ? 'border-accent/30' : ''}`}>
      <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2"><Icon name={icon} size={20} className={iconColor || 'text-accent'} />{title}</h3>
      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary marker:text-secondary">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ScoreBar({ label, value, description, barColor }: { label: string; value: number; description?: string; barColor?: string }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-secondary w-20 shrink-0">{label}</span>
        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor || 'bg-accent'} rounded-full transition-all`} style={{ width: `${Math.min(100, value)}%` }} />
        </div>
        <span className="font-mono text-xs text-secondary w-8 text-right">{Math.round(value)}</span>
      </div>
      {description && <p className="text-[11px] text-secondary/70 mt-1 ml-[92px] leading-snug">{description}</p>}
    </div>
  );
}

async function hydrateMatch(match: any, userGender: string): Promise<any> {
  if (match.datingBehavior?.length > 0) return match;
  try {
    const res = await fetch('/api/persona-metadata');
    if (!res.ok) return match;
    const data = await res.json();
    const targetMeta = userGender === 'M' ? data.female : data.male;
    const meta = targetMeta?.[match.code];
    if (!meta) return match;
    return {
      ...match,
      datingBehavior: match.datingBehavior?.length ? match.datingBehavior : (meta.datingBehavior || []),
      inRelationships: match.inRelationships?.length ? match.inRelationships : (meta.inRelationships || []),
      howValued: match.howValued?.length ? match.howValued : (meta.howValued || []),
      disappointments: match.disappointments?.length ? match.disappointments : (meta.disappointments || []),
      struggles: match.struggles?.length ? match.struggles : (meta.struggles || []),
      mostAttractive: match.mostAttractive?.length ? match.mostAttractive : (meta.mostAttractive || []),
      leastAttractive: match.leastAttractive?.length ? match.leastAttractive : (meta.leastAttractive || []),
    };
  } catch {
    return match;
  }
}

export default function MatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const [report, setReport] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (!stored) { router.push('/assessment'); return; }
    const r = JSON.parse(stored);
    setReport(r);
    const m = r.matches?.find((m: any) => m.code === code);
    if (!m) { router.push('/results/matches'); return; }
    setMatch(m);

    hydrateMatch(m, r.gender).then(hydrated => {
      if (hydrated !== m) {
        setMatch(hydrated);
        const updatedMatches = r.matches.map((x: any) => x.code === code ? hydrated : x);
        const updated = { ...r, matches: updatedMatches };
        localStorage.setItem('relate_results', JSON.stringify(updated));
      }
    });
  }, [router, code]);

  if (!match || !report) return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;

  // Matches are the OPPOSITE gender of the user
  const matchGenderPronoun = report.gender === 'M' ? 'her' : 'him';
  const matchGenderCap = report.gender === 'M' ? 'She' : 'He';
  const userName = report.persona?.name || 'your persona';
  const matchName = match.name || 'this persona';

  // Gender-based colors: male user (wants female) = pink, female user (wants male) = blue
  const genderColor = report.gender === 'M' ? 'text-rose-400' : 'text-blue-500';
  const genderBorder = report.gender === 'M' ? 'border-rose-400' : 'border-blue-500';
  const genderBg = report.gender === 'M' ? 'bg-rose-400' : 'bg-blue-500';

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Header: name/code on left, score/tier on right, vertically centered */}
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="min-w-0">
            <span className="font-mono text-xs text-secondary">Match #{match.rank}</span>
            <h2 className="font-serif text-3xl font-semibold">{match.name}</h2>
            <span className="font-mono text-sm text-accent">{match.code}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-3xl font-semibold block">{match.compatibilityScore}</span>
            <span className={`text-sm font-semibold ${tierTextColor(match.tier)}`}>
              {tierLabel(match.tier)}
            </span>
          </div>
        </div>

        {/* Dimension cards */}
        {(() => {
          const matchPoles = report.gender === 'M' ? WOMEN_W2_POLES : MEN_M2_POLES;
          const codeKeys = getCodeKeys(match.code, matchPoles);
          if (codeKeys.length === 0) return null;
          return (
            <section className="mt-2 mb-8">
              <div className="flex flex-wrap gap-3">
                {codeKeys.map((k) => (
                  <div key={k.dim} className="card text-center flex-1 min-w-[120px]">
                    <span className={`inline-block text-[10px] border ${genderBorder} ${genderColor} rounded-md px-2 py-1 mb-2.5 mt-1 font-medium capitalize`}>
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
          );
        })()}

        {/* Compatibility summary */}
        {match.summary && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-2 flex items-center gap-2"><Icon name="handshake" size={20} className={genderColor} />Compatibility Summary</h3>
            <p className="text-sm text-secondary leading-relaxed">{match.summary.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',')}</p>
          </section>
        )}

        {/* Score breakdown */}
        {match.subScores && (
          <section className="card mb-4">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2"><Icon name="bar_chart" size={20} className={genderColor} />Persona Signatures</h3>
            <div className="space-y-3.5">
              <ScoreBar label="Persona" value={match.subScores.tier} description={scoreContext('tier', match.subScores.tier, userName, matchName)} barColor={genderBg} />
              <ScoreBar label="Preference" value={match.subScores.preference} description={scoreContext('preference', match.subScores.preference, userName, matchName)} barColor={genderBg} />
              <ScoreBar label="Behavioral" value={match.subScores.dimension} description={scoreContext('dimension', match.subScores.dimension, userName, matchName)} barColor={genderBg} />
              <ScoreBar label="Intimacy" value={match.subScores.intimacy} description={scoreContext('intimacy', match.subScores.intimacy, userName, matchName)} barColor={genderBg} />
              <ScoreBar label="Conflict" value={match.subScores.conflict} description={scoreContext('conflict', match.subScores.conflict, userName, matchName)} barColor={genderBg} />
            </div>
          </section>
        )}

        {/* Persona insight cards */}
        <div className="mt-8 mb-2">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2"><Icon name="person" size={20} className={genderColor} />About {match.name}</h3>
          <p className="text-xs text-secondary mt-1">What to expect from this persona</p>
        </div>

        <InsightCard
          icon="star"
          title={`What draws people to ${matchGenderPronoun}`}
          items={match.mostAttractive}
          iconColor={genderColor}
        />

        <InsightCard
          icon="touch_app"
          title={`How ${report.gender === 'M' ? 'she' : 'he'} dates`}
          items={match.datingBehavior}
          iconColor={genderColor}
        />

        <InsightCard
          icon="people"
          title="In a relationship"
          items={match.inRelationships}
          iconColor={genderColor}
        />

        <InsightCard
          icon="volunteer_activism"
          title={`How partners value ${matchGenderPronoun}`}
          items={match.howValued}
          iconColor={genderColor}
        />

        <InsightCard
          icon="visibility"
          title="Watch out for"
          items={match.leastAttractive}
          iconColor={genderColor}
        />

        <InsightCard
          icon="sentiment_dissatisfied"
          title={`What disappoints ${matchGenderPronoun}`}
          items={match.disappointments}
          iconColor={genderColor}
        />

        <InsightCard
          icon="spa"
          title={`Where ${matchGenderCap.toLowerCase()} struggles`}
          items={match.struggles}
          iconColor={genderColor}
        />

        <div className="flex gap-3 mt-8">
          <Link href="/results/matches" className="btn-secondary text-xs">All Matches</Link>
          <Link href="/advisor" className="btn-primary text-xs">Discuss with Advisor</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
