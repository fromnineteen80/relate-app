'use client';

import { useEffect, useState, useRef } from 'react';
import { Icon } from '@/components/Icon';
import { renderDatingPoolGrid, type DatingPoolData, type TargetGender } from '@/lib/dating-pool-grid';
import { cleanProse } from '@/lib/prose';

/* eslint-disable @typescript-eslint/no-explicit-any */

type FunnelStage = { stage: string; count: number; filter?: string; percentage?: number; isMilestone?: boolean };

export type MarketData = {
  location?: { cbsaName?: string; cbsaLabel?: string; population?: number };
  relateScore?: { score: number; components?: Record<string, { national?: number; local?: number; score?: number; weight: number }>; marriagePremium?: number };
  matchPool?: { localSinglePool: number; identityPool: number; realisticPool: number; preferredPool: number; idealPool: number; funnel?: FunnelStage[]; contextPools?: any };
  matchProbability?: { rate: number; percentage: string };
  matchCount?: number;
  stateComparison?: any;
  nationalComparison?: any;
};

export type Demographics = { age?: number; gender?: string; relationshipStatus?: string; seeking?: string; orientation?: string; [key: string]: unknown };

// ── Dating Pool Grid (plain-JS blip visualization) ──
export function DatingPoolGridCard({ data, demographics }: { data: MarketData | null; demographics: Demographics }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data?.matchPool) return;

    const pool = data.matchPool;
    const metro = data.location?.cbsaLabel || data.location?.cbsaName || 'Your Metro';
    const metroPop = data.location?.population || 0;
    const singlesPool = pool.localSinglePool || 0;

    // Derive targetGender from user's gender (seeking opposite)
    const userGender = demographics.gender || localStorage.getItem('relate_gender');
    let targetGender: TargetGender = 'women';
    if (userGender === 'W') {
      targetGender = 'men';
    } else if (userGender === 'M') {
      targetGender = 'women';
    } else {
      targetGender = 'all';
    }

    // Also check explicit orientation if available (gay/lesbian flips the target)
    const orientation = demographics.orientation;
    if (orientation) {
      const o = String(orientation).toLowerCase();
      if (o.includes('gay') || o.includes('lesbian')) {
        // Same-gender attraction: target = own gender
        if (userGender === 'W') targetGender = 'women';
        else if (userGender === 'M') targetGender = 'men';
      }
    }

    const poolData: DatingPoolData = {
      metro,
      metroPopulation: metroPop,
      pools: {
        metro:     { label: 'Metro Singles Pool',        count: singlesPool },
        identity:  { label: 'Identity Pool',             count: pool.identityPool || 0 },
        realistic: { label: 'Your Realistic Match Pool', count: pool.realisticPool || 0 },
        preferred: { label: 'Your Preferred Lifestyle Pool', count: pool.preferredPool || 0 },
        ideal:     { label: 'Your Ideal Match Pool',     count: pool.idealPool || 0 },
      },
    };

    renderDatingPoolGrid(containerRef.current, poolData, targetGender);
  }, [data, demographics]);

  if (!data?.matchPool) return null;

  return <div ref={containerRef} className="w-full h-full" />;
}

// ── Dating Market Visualization ──
const HEIGHTS = [
  '4\'10"','4\'11"','5\'0"','5\'1"','5\'2"','5\'3"','5\'4"','5\'5"','5\'6"','5\'7"',
  '5\'8"','5\'9"','5\'10"','5\'11"','6\'0"','6\'1"','6\'2"','6\'3"','6\'4"','6\'5"','6\'6"','6\'7"','6\'8"',
];

// ── Top Metros Scatter Plot ──

export function nextMultipleOf10(n: number) {
  if (n <= 0) return 10;
  return Math.ceil(n / 10) * 10;
}

export function TopMetrosScatterPlot({ metros, worstMetros, demographics, marketData, topMetrosInfo }: { metros: any[]; worstMetros?: any[] | null; demographics?: any; marketData?: any; topMetrosInfo?: { totalCompetitive: number; homeMetroRank: number | null; homeCbsa: string | null; effectiveMinScore: number } | null }) {
  const [tooltip, setTooltip] = useState<{ metro: any; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const datingGender = demographics?.gender === 'M' ? 'women' : demographics?.gender === 'W' ? 'men' : 'singles';
  const userGender = demographics?.gender === 'M' ? 'men' : demographics?.gender === 'W' ? 'women' : 'singles';

  // Chart dimensions
  const W = 560, H = 480;
  const pad = { top: 20, right: 30, bottom: 50, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const maxIdeal = nextMultipleOf10(Math.max(...metros.map(m => m.idealPool)));
  const maxMatch = nextMultipleOf10(Math.max(...metros.map(m => m.matchCount)));

  const scaleX = (v: number) => pad.left + (v / maxIdeal) * plotW;
  const scaleY = (v: number) => pad.top + plotH - (v / maxMatch) * plotH;

  // Generate tick marks
  const xTicks: number[] = [];
  const xStep = maxIdeal / 5;
  for (let i = 0; i <= 5; i++) xTicks.push(Math.round(xStep * i));
  const yTicks: number[] = [];
  const yStep = maxMatch / 5;
  for (let i = 0; i <= 5; i++) yTicks.push(Math.round(yStep * i));

  const compOrderBase = ['income', 'age', 'education', 'height', 'body', 'politics', 'hasKids', 'costOfLiving'];
  const compOrder = demographics?.gender === 'W' ? compOrderBase.filter(k => k !== 'height') : compOrderBase;
  const compLabels: Record<string, string> = { income: 'Income', age: 'Age', education: 'Education', height: 'Height', body: 'Fitness', politics: 'Politics', hasKids: 'Children', costOfLiving: 'Cost of Living' };

  function scoreTier(s: number) {
    if (s >= 80) return { label: 'Exceptional', color: '#16a34a' };
    if (s >= 65) return { label: 'Strong', color: '#16a34a' };
    if (s >= 50) return { label: 'Above Average', color: '#c2854a' };
    if (s >= 35) return { label: 'Average', color: '#ca8a04' };
    return { label: 'Below Average', color: '#dc2626' };
  }

  const handleMouseEnter = (metro: any, e: React.MouseEvent) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    setTooltip({ metro, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleListHover = (metro: any) => {
    const wrapper = wrapperRef.current;
    const svg = svgRef.current;
    if (!wrapper || !svg) return;
    // Convert SVG coords to pixel coords within the wrapper
    const svgRect = svg.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const ratioX = svgRect.width / W;
    const ratioY = svgRect.height / H;
    const px = (scaleX(metro.idealPool) * ratioX) + svgRect.left - wrapperRect.left;
    const py = (scaleY(metro.matchCount) * ratioY) + svgRect.top - wrapperRect.top;
    setTooltip({ metro, x: px, y: py });
  };

  const handleMouseLeave = () => setTooltip(null);

  // Dot color based on gender being pursued; user's home metro gets green
  const dotColor = datingGender === 'women' ? '#fb7185' : datingGender === 'men' ? '#3b82f6' : '#c2854a';
  const homeCbsa = topMetrosInfo?.homeCbsa || null;

  return (
    <>
    <section className="card mb-4">
      <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2">
        <Icon name="scatter_plot" size={20} className="text-accent" />
        Your Best Metro Areas
      </h3>
      <p className="card-summary mb-4">Top 20 metro areas where you have the best chance of finding a match.</p>

      <div className="flex gap-4">
      <div ref={wrapperRef} className="relative flex-1 min-w-0" style={{ overflow: 'visible' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
        >
          {/* Grid lines */}
          {xTicks.map(t => (
            <line key={`xg-${t}`} x1={scaleX(t)} y1={pad.top} x2={scaleX(t)} y2={pad.top + plotH} stroke="#e7e5e4" strokeWidth={1} />
          ))}
          {yTicks.map(t => (
            <line key={`yg-${t}`} x1={pad.left} y1={scaleY(t)} x2={pad.left + plotW} y2={scaleY(t)} stroke="#e7e5e4" strokeWidth={1} />
          ))}

          {/* Axes */}
          <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#78716c" strokeWidth={1} />
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#78716c" strokeWidth={1} />

          {/* X tick labels */}
          {xTicks.map(t => (
            <text key={`xl-${t}`} x={scaleX(t)} y={pad.top + plotH + 16} textAnchor="middle" fontSize="9" fill="#78716c" fontFamily="monospace">
              {t >= 1000 ? `${(t / 1000).toFixed(t % 1000 === 0 ? 0 : 1)}k` : t}
            </text>
          ))}
          {/* Y tick labels */}
          {yTicks.map(t => (
            <text key={`yl-${t}`} x={pad.left - 8} y={scaleY(t) + 3} textAnchor="end" fontSize="9" fill="#78716c" fontFamily="monospace">
              {t >= 1000 ? `${(t / 1000).toFixed(t % 1000 === 0 ? 0 : 1)}k` : t}
            </text>
          ))}

          {/* Axis labels */}
          <text x={pad.left + plotW / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--color-secondary)" textDecoration="none" letterSpacing="0.05em">
            IDEAL MATCH POOL
          </text>
          <text x={14} y={pad.top + plotH / 2} textAnchor="middle" fontSize="12" fill="var(--color-secondary)" letterSpacing="0.05em" transform={`rotate(-90, 14, ${pad.top + plotH / 2})`}>
            ESTIMATED MATCHES
          </text>

          {/* Data points */}
          {metros.map((m, i) => (
            <g
              key={m.cbsa || i}
              className="cursor-pointer"
              onMouseEnter={(e) => handleMouseEnter(m, e)}
              onMouseLeave={handleMouseLeave}
            >
              <circle
                cx={scaleX(m.idealPool)}
                cy={scaleY(m.matchCount)}
                r={8}
                fill={m.cbsa === homeCbsa ? '#16a34a' : dotColor}
                fillOpacity={0.85}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
              />
              <text
                x={scaleX(m.idealPool)}
                y={scaleY(m.matchCount) + 3.5}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fontFamily="monospace"
                fill="#fff"
                style={{ pointerEvents: 'none' }}
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {tooltip && (() => {
          const m = tooltip.metro;
          const tier = scoreTier(m.relateScore);
          const components = m.components || {};
          const wrapRect = wrapperRef.current?.getBoundingClientRect();
          const containerW = wrapRect?.width || W;
          const containerH = wrapRect?.height || H;
          const ttW = 240;
          const ttH = 260;
          // Horizontal: prefer right of cursor, flip left if clipped
          let ttLeft = tooltip.x + 12;
          if (ttLeft + ttW > containerW) ttLeft = tooltip.x - ttW - 10;
          ttLeft = Math.max(4, Math.min(ttLeft, containerW - ttW - 4));
          // Vertical: prefer above cursor center, clamp to container bounds
          let ttTop = tooltip.y - 40;
          if (ttTop + ttH > containerH) ttTop = containerH - ttH - 4;
          if (ttTop < 4) ttTop = 4;
          return (
            <div
              className="absolute pointer-events-none z-10"
              style={{ left: ttLeft, top: ttTop, width: ttW }}
            >
              <div className="bg-black text-white rounded-lg shadow-xl p-3" style={{ fontSize: '11px' }}>
                <div className="font-semibold text-sm mb-0.5">{m.cbsaLabel || m.cbsaName}</div>
                <div className="text-gray-400 text-[10px] mb-2">Pop. {(m.population || 0).toLocaleString()}</div>

                {/* Local Competition Score */}
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Local Competition</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1.5">
                  <span className="font-serif text-lg font-semibold">{m.relateScore.toFixed(0)}</span>
                  <span style={{ color: tier.color }} className="text-[10px] font-medium">{tier.label}</span>
                  <span className="text-gray-500 text-[10px] font-serif ml-auto">/100</span>
                </div>

                {/* Score progress bar */}
                <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${m.relateScore}%`, backgroundColor: tier.color }} />
                  {[25, 50, 75].map(tick => <div key={tick} className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${tick}%` }} />)}
                </div>

                {/* Stats bars */}
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Your Stats</span>
                <div className="space-y-1 mt-1">
                  {compOrder.map(key => {
                    const comp = components[key];
                    if (!comp) return null;
                    const val = comp.local ?? comp.score ?? comp.national ?? 50;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-gray-400 w-14 text-[10px]">{compLabels[key]}</span>
                        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-white/70 rounded-full" style={{ width: `${Math.min(100, Math.max(0, val))}%` }} />
                        </div>
                        <span className="font-serif text-[10px] w-6 text-right">{Math.round(val)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Key numbers */}
                <div className="mt-2 pt-2 border-t border-gray-700 grid grid-cols-2 gap-x-3">
                  <div>
                    <div className="text-gray-400 text-[9px] uppercase">Ideal Pool</div>
                    <div className="font-serif text-xs font-medium">{m.idealPool.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-[9px] uppercase">Est. Matches</div>
                    <div className="font-serif text-xs font-medium">{m.matchCount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Explainer paragraph ── */}
        {marketData?.location && (
          <p className="explainer mt-3 mb-0">
            {topMetrosInfo?.homeMetroRank != null
              ? `The ${(marketData.location.cbsaLabel || marketData.location.cbsaName || 'your area').split(',')[0]} metro area ranks #${topMetrosInfo.homeMetroRank} out of ${topMetrosInfo.totalCompetitive} metro areas nationally where you have at least a ${topMetrosInfo.effectiveMinScore} competition score. `
              : ''
            }
            If your ideal match pool and the number of {datingGender} feels small, consider how and where you are looking for love. Are dating apps working? Are they worth the investment? Are there things you can do to improve your desirability to {datingGender} in your ideal match pool? Do you need to adjust your expectations? Could you expand your search to other metro areas where you have better chances of matching?
          </p>
        )}
      </div>

      {/* Metro legend */}
      <div className="hidden md:block flex-shrink-0" style={{ paddingRight: '6px' }}>
        <div className="space-y-0">
          {/* Column header */}
          <div className="py-1 px-1.5 border-b border-[#e7e5e4]" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#78716c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              Metro Area
            </span>
          </div>
          {metros.map((m, i) => {
            const shortName = (m.cbsaLabel || m.cbsaName || '').split(/[,\-]/)[0].trim();
            return (
              <div
                key={m.cbsa || i}
                className="flex items-center gap-1.5 py-1.5 px-1.5 cursor-pointer hover:bg-stone-50 transition-colors"
                style={{ borderBottom: i < metros.length - 1 ? '1px solid #f0efed' : 'none' }}
                onMouseEnter={() => handleListHover(m)}
                onMouseLeave={handleMouseLeave}
              >
                <span style={{ fontSize: '10px', color: '#78716c', fontFamily: 'monospace', width: '24px', textAlign: 'right', flexShrink: 0 }}>
                  #{i + 1}
                </span>
                <span style={{ fontSize: '10px', color: '#141413', whiteSpace: 'nowrap' }}>
                  {shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </section>

      {/* ── Worst Metros ── */}
      {worstMetros && worstMetros.length > 0 && (
        <section className="card mb-4 mt-4">
          <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2">
            <Icon name="trending_down" size={20} className="text-accent" />
            Your Worst Large Metro Areas
          </h3>
          <p className="card-summary mb-3">Bottom 10 metros (population set at 750k+) ranked by smallest ideal match pool.</p>
          <div className="space-y-0">
            {/* Column headers */}
            <div className="flex items-end gap-2.5 py-1 px-1.5 border-b border-[#e7e5e4]">
              <span style={{ fontSize: '10px', color: '#78716c', fontFamily: 'monospace', width: '24px', textAlign: 'right', flexShrink: 0 }}>&nbsp;</span>
              <span style={{ fontSize: '10px', color: '#78716c', fontWeight: 600, flex: 1, minWidth: 0, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.3' }}>
                Metro<br />Area
              </span>
              <span style={{ fontSize: '10px', color: '#78716c', fontWeight: 600, fontFamily: 'monospace', width: '32px', textAlign: 'right', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.3' }}>
                Comp<br />Score
              </span>
              <span style={{ fontSize: '10px', color: '#78716c', fontWeight: 600, fontFamily: 'monospace', width: '48px', textAlign: 'right', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.3' }}>
                Est.<br />Matches
              </span>
              <span style={{ fontSize: '10px', color: '#78716c', fontWeight: 600, fontFamily: 'monospace', width: '80px', textAlign: 'right', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.3' }}>
                Ideal<br />per 10k
              </span>
            </div>
            {worstMetros.map((m, i) => {
              const per10k = m.localSinglePool > 0
                ? Math.round((m.idealPool / m.localSinglePool) * 10000)
                : 0;
              return (
                <div
                  key={m.cbsa || i}
                  className="flex items-center gap-2.5 py-1.5 px-1.5"
                  style={{ borderBottom: i < worstMetros.length - 1 ? '1px solid #f0efed' : 'none' }}
                >
                  <span style={{ fontSize: '12px', color: '#78716c', fontFamily: 'monospace', width: '24px', textAlign: 'right', flexShrink: 0 }}>
                    #{i + 1}
                  </span>
                  <span style={{ fontSize: '12px', color: '#141413', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.cbsaLabel || m.cbsaName}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#141413', fontFamily: 'monospace', width: '32px', textAlign: 'right', flexShrink: 0 }} title="Competition Score">
                    {Math.round(m.relateScore)}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#141413', fontFamily: 'monospace', width: '48px', textAlign: 'right', flexShrink: 0 }} title="Estimated Matches">
                    {m.matchCount.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '11px', color: '#78716c', fontFamily: 'monospace', width: '80px', textAlign: 'right', flexShrink: 0 }} title={`Per 10,000 local single ${datingGender}`}>
                    {per10k.toLocaleString()} / 10k
                  </span>
                </div>
              );
            })}
          </div>
          <p className="explainer mt-2">
            per 10k = ideal matches per 10,000 local single {datingGender}
          </p>
        </section>
      )}
    </>
  );
}

export function formatCurrencyShort(val: number) {
  if (val >= 1000000) return '$1M+';
  if (val === 0) return '$0';
  return '$' + val.toLocaleString();
}

export function DatingMarketViz({ data, loading, onRelaxPreference, demographics }: { data: MarketData | null; loading: boolean; onRelaxPreference?: (prefKey: string, value: any) => void; demographics?: any }) {
  const [relaxing, setRelaxing] = useState<string | null>(null);

  if (loading) {
    return (
      <section className="card mb-4">
        <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="trending_up" size={20} className="text-accent" />Your Dating Market</h3>
        <p className="explainer mb-4">{relaxing ? 'Recalculating your market...' : 'Analyzing your local market...'}</p>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }
  if (!data) return null;

  const score = data.relateScore?.score ?? 0;
  const pool = data.matchPool;
  const metro = data.location?.cbsaLabel || data.location?.cbsaName || 'Your Metro';
  const metroPop = data.location?.population || 0;
  const matchCount = data.matchCount ?? 0;

  function scoreTier(s: number) {
    if (s >= 80) return { label: 'Exceptional', color: 'text-success' };
    if (s >= 65) return { label: 'Strong', color: 'text-success' };
    if (s >= 50) return { label: 'Above Average', color: 'text-accent' };
    if (s >= 35) return { label: 'Average', color: 'text-warning' };
    return { label: 'Below Average', color: 'text-danger' };
  }

  const tier = scoreTier(score);
  const components = data.relateScore?.components || {};
  const compOrderBase = ['income', 'age', 'education', 'height', 'body', 'politics', 'hasKids', 'costOfLiving'];
  const compOrder = demographics?.gender === 'W' ? compOrderBase.filter(k => k !== 'height') : compOrderBase;
  const compLabels: Record<string, string> = { income: 'Income', age: 'Age', education: 'Education', height: 'Height', body: 'Fitness', politics: 'Politics', hasKids: 'Children', costOfLiving: 'Cost of Living' };

  const metroShort = metro.includes(',') ? metro.split(',')[0] : metro;

  // Determine the gendered label for who the user is dating
  const datingGender = demographics?.gender === 'M' ? 'women' : demographics?.gender === 'W' ? 'men' : 'singles';
  const datingGenderCap = datingGender.charAt(0).toUpperCase() + datingGender.slice(1);

  // The user's own gender (plural) for "How competitive you are with other men/women"
  const ownGender = demographics?.gender === 'M' ? 'men' : demographics?.gender === 'W' ? 'women' : 'singles';

  const singlesPool = pool?.localSinglePool || 0;
  const milestones = [
    { label: 'Metro Singles Pool', value: singlesPool, desc: `Unmarried ${datingGender} in the metro area` },
    { label: 'Identity Pool', value: pool?.identityPool || 0, desc: `${datingGenderCap} matching your preferred ethnicity` },
    { label: 'Your Realistic Match Pool', value: pool?.realisticPool || 0, desc: `${datingGenderCap} within your age range and income requirements` },
    { label: 'Your Preferred Lifestyle Pool', value: pool?.preferredPool || 0, desc: `${datingGenderCap} who match your aesthetic and fitness choices` },
    { label: 'Your Ideal Match Pool', value: pool?.idealPool || 0, desc: `${datingGenderCap} who meet every preference you set` },
  ];

  // Identify relaxable filters when ideal pool is zero
  const idealPool = pool?.idealPool || 0;
  const funnel = pool?.funnel || [];
  type FilterType = 'toggle' | 'height' | 'income';
  const funnelPrefKeyMap: Record<string, { key: string; label: string; type: FilterType }> = {
    'Political': { key: 'prefPolitical', label: 'Political Views', type: 'toggle' },
    'Has kids': { key: 'prefHasKids', label: 'Partner Has Kids', type: 'toggle' },
    'Wants kids': { key: 'prefWantKids', label: 'Partner Wants Kids', type: 'toggle' },
    'Smoking': { key: 'prefSmoking', label: 'Smoking', type: 'toggle' },
    'Height': { key: 'prefHeightMin', label: 'Minimum Height', type: 'height' },
    'Body type': { key: 'prefBodyTypes', label: 'Body Type', type: 'toggle' },
    'Fitness': { key: 'prefFitnessLevels', label: 'Fitness Level', type: 'toggle' },
    'Income': { key: 'prefIncomeMin', label: 'Minimum Income', type: 'income' },
  };

  // Build list of filters that reduced the pool, sorted by biggest impact
  const relaxableFilters: { key: string; label: string; stage: string; lostPct: number; type: FilterType; currentValue?: string }[] = [];
  if (idealPool === 0) {
    for (const entry of funnel) {
      if (entry.isMilestone || !entry.filter) continue;
      const filterPct = parseFloat(entry.filter);
      if (isNaN(filterPct) || filterPct >= 100) continue;
      const lostPct = 100 - filterPct;
      for (const [prefix, info] of Object.entries(funnelPrefKeyMap)) {
        if (entry.stage.startsWith(prefix)) {
          // Extract current value from stage (e.g. "Height ≥ 5'10\"" → "5'10\"")
          const currentValue = entry.stage.includes('≥') ? entry.stage.split('≥')[1]?.trim() : entry.stage.split(':')[1]?.trim();
          relaxableFilters.push({ key: info.key, label: info.label, stage: entry.stage, lostPct, type: info.type, currentValue });
          break;
        }
      }
    }
    relaxableFilters.sort((a, b) => b.lostPct - a.lostPct);
  }

  // Read current preference values from localStorage for slider/dropdown controls
  let currentIncomeMin = 0;
  let currentHeightMin = '';
  try {
    const demoStr = localStorage.getItem('relate_demographics');
    if (demoStr) {
      const d = JSON.parse(demoStr);
      currentIncomeMin = d.pref_income_min ?? d.prefIncome ?? 0;
      currentHeightMin = d.pref_height_min || d.prefHeight || '';
    }
  } catch { /* */ }

  const handleRelax = async (prefKey: string, value: any) => {
    if (!onRelaxPreference) return;
    setRelaxing(prefKey);
    await onRelaxPreference(prefKey, value);
    setRelaxing(null);
  };

  return (
    <>
    <section className="card">
      {idealPool === 0 && relaxableFilters.length > 0 && (
        <div className="mb-6 border-2 border-dashed border-red-400/50 bg-red-50 rounded-lg p-4">
          <span className="text-xs text-red-600 tracking-wider uppercase">Zero Matches</span>
          <p className="data-label mt-1">Your preferences have filtered your match pool to zero.</p>
          <p className="text-sm text-secondary mt-1 mb-3">
            Adjust your preferences below to find matches. Each change updates your profile automatically.
          </p>
          <div className="space-y-3">
            {relaxableFilters.map(f => (
              <div key={f.key} className="bg-white border border-red-200 rounded-md px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="data-label">{f.label}</span>
                  <span className="text-xs text-red-500 font-serif">-{Math.round(f.lostPct)}% of pool</span>
                </div>
                {f.type === 'income' && (
                  <div className="mt-2">
                    <input
                      type="range" min={0} max={1000000} step={10000}
                      defaultValue={currentIncomeMin}
                      disabled={!!relaxing}
                      className="w-full accent-red-500"
                      onChange={e => {
                        const el = e.target;
                        const label = el.nextElementSibling;
                        if (label) label.textContent = formatCurrencyShort(parseInt(el.value));
                      }}
                      onMouseUp={e => handleRelax('prefIncomeMin', parseInt((e.target as HTMLInputElement).value))}
                      onTouchEnd={e => handleRelax('prefIncomeMin', parseInt((e.target as HTMLInputElement).value))}
                    />
                    <div className="flex justify-between card-summary mt-0.5">
                      <span>$0</span>
                      <span>{formatCurrencyShort(currentIncomeMin)}</span>
                      <span>$1M+</span>
                    </div>
                  </div>
                )}
                {f.type === 'height' && (
                  <div className="mt-2">
                    <select
                      defaultValue={currentHeightMin}
                      disabled={!!relaxing}
                      className="input text-sm"
                      onChange={e => {
                        const val = e.target.value;
                        handleRelax('prefHeightMin', val || null);
                      }}
                    >
                      <option value="">No preference</option>
                      {HEIGHTS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                )}
                {f.type === 'toggle' && (
                  <button
                    onClick={() => {
                      const isArray = ['prefBodyTypes', 'prefFitnessLevels', 'prefPolitical', 'prefEthnicities', 'prefEducation'].includes(f.key);
                      handleRelax(f.key, isArray ? ['No preference'] : 'No preference');
                    }}
                    disabled={!!relaxing}
                    className="mt-1 text-xs px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    {relaxing === f.key ? 'Updating...' : 'Set to No Preference'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="trending_up" size={20} className="text-accent" />Your Dating Market</h3>
      <p className="card-summary mb-4">{metro}</p>

      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="subsection-label">Local Competition</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-3xl font-semibold">{score.toFixed(0)}</span>
              <span className={`text-sm font-medium ${tier.color}`}>{tier.label}</span>
            </div>
          </div>
          <span className="text-xs text-secondary font-serif">/100</span>
        </div>
        <div className="relative h-5 bg-stone-200 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, background: score >= 65 ? 'var(--color-success)' : score >= 50 ? 'var(--color-accent)' : score >= 35 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
          {[25, 50, 75].map(tick => <div key={tick} className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: `${tick}%` }} />)}
        </div>
        <p className="explainer mt-2">How competitive you are with other {ownGender} in the local dating market based on age, income, education, fitness, height, and other demographic data points.</p>
      </div>

      {Object.keys(components).length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <span className="subsection-label">Your Stats</span>
          <div className="space-y-2 mt-2">
            {compOrder.map(key => {
              const comp = components[key];
              if (!comp) return null;
              const val = comp.local ?? comp.score ?? comp.national ?? 50;
              const weight = comp.weight ?? 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="card-summary w-16">{compLabels[key]}</span>
                  <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, val))}%` }} />
                  </div>
                  <span className="text-xs font-serif w-8 text-right">{Math.round(val)}</span>
                </div>
              );
            })}
          </div>
          <p className="explainer mt-2">Each bar shows your local percentile (0 = bottom, 100 = top).</p>
        </div>
      )}
    </section>

    <section className="card">
      <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="filter_alt" size={20} className="text-accent" />Your Match Funnel</h3>
      <p className="card-summary mb-4">{metro}</p>
      {pool && (
        <div className="mb-6">
          <span className="subsection-label">Finding Your Ideal Match</span>
          <p className="explainer mt-1 mb-3">The {metroShort} metro population is <span className="font-medium">{metroPop.toLocaleString()}</span>.</p>
          <div className="mt-3 space-y-1">
            {(() => {
              const datingWomenFunnel = demographics?.gender === 'M';
              const funnelColors = [
                '#d6d3d1', // metro — stone-300
                '#292524', // identity — brand black
                '#F9A825', // realistic — yellow
                '#047857', // preferred — green
                datingWomenFunnel ? '#fb7185' : '#3b82f6', // ideal — rose/blue
              ];
              return milestones.map((m, i) => {
              const baseVal = singlesPool || 1;
              const pct = (m.value / baseVal) * 100;
              const isLast = i === milestones.length - 1;
              let pctLabel = '';
              if (i > 0) {
                if (isLast) {
                  let decimals = 1;
                  while (decimals < 10 && Number(pct.toFixed(decimals)) === 0 && pct > 0) decimals++;
                  pctLabel = `${pct.toFixed(decimals)}%`;
                } else {
                  pctLabel = `${pct.toFixed(1)}%`;
                }
              }
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[11px] ${isLast ? 'font-medium' : 'text-secondary'}`}>{m.label}</span>
                    <span className={`text-[11px] font-serif ${isLast ? 'font-semibold' : 'text-secondary'}`}>{m.value.toLocaleString()}{pctLabel ? ` (${pctLabel})` : ''}</span>
                  </div>
                  <div className="relative h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${Math.max(1, pct)}%`, backgroundColor: funnelColors[i] }} />
                  </div>
                </div>
              );
            });
            })()}
          </div>
          <div className="mt-3 space-y-1">
            {milestones.map(m => (
              <p key={m.label} className="definition"><span className="font-medium">{m.label}:</span> {m.desc}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Estimated Matches — filled rectangle bar ── */}
      {(() => {
        const idealCount = pool?.idealPool || 0;
        const matchPct = idealCount > 0 ? Math.min(1, matchCount / idealCount) : 0;
        // Color of gender being dated: Man (M) dates women → pink, Woman (W) dates men → blue
        const datingWomen = demographics?.gender === 'M';
        const matchColor = datingWomen ? '#fb7185' : '#3b82f6'; // rose-400 / blue-500
        const bgColor = '#e7e5e4'; // stone-200

        return (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="subsection-label">Match Likelihood</span>
            {/* Rectangle bar — match color fills left-to-right, rest is gray */}
            <div className="relative w-full rounded overflow-hidden mt-3" style={{ height: '48px', backgroundColor: bgColor }}>
              {/* Filled portion */}
              <div className="absolute inset-y-0 left-0" style={{ width: `${Math.max(1, matchPct * 100)}%`, backgroundColor: matchColor }} />
              {/* Estimated Matches — left-justified, white text */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-serif text-xl font-semibold text-white drop-shadow-sm" style={{ zIndex: 1 }}>
                {matchCount.toLocaleString()}
              </span>
              {/* Ideal Match Pool — right-justified, black text */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-serif text-xl font-semibold text-foreground" style={{ zIndex: 1 }}>
                {idealCount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-start justify-between mt-1">
              <p className="explainer">Estimated Matches</p>
              <p className="explainer">Ideal Match Pool</p>
            </div>
            <p className="explainer mt-2 mb-0">Number of {datingGender} from your Ideal Match Pool in the surrounding {metroShort} metro area likely to be interested in you based on your own reported stats. That is {singlesPool > 0 ? ((matchCount / singlesPool) * 100).toFixed(2) : '0'}% of the Metro Singles Pool, or {(() => {
              if (singlesPool <= 0) return '0 out of 1,000';
              // Scale denominator up until we get at least 1 whole person
              let denom = 1000;
              while (denom <= 1_000_000) {
                const num = (matchCount / singlesPool) * denom;
                if (num >= 1) return `${Math.round(num).toLocaleString()} out of ${denom.toLocaleString()}`;
                denom *= 10;
              }
              return `${((matchCount / singlesPool) * denom).toFixed(1)} out of ${denom.toLocaleString()}`;
            })()} local single {datingGender}.</p>
          </div>
        );
      })()}
    </section>
    </>
  );
}

// ── Market Coaching ──

export function humanizeBottleneck(
  stageName: string,
  lostPct: number,
  lostCount: number,
  metro: string,
  gender: string | undefined,
): { title: string; description: string; action: string } {
  const pctStr = Math.round(lostPct);
  const countStr = lostCount.toLocaleString();
  const seeking = gender === 'W' ? 'men' : 'women';

  // Has kids: No / Yes / Open to either
  if (/^Has kids:/i.test(stageName)) {
    const val = stageName.replace(/^Has kids:\s*/i, '').trim();
    if (/no/i.test(val)) {
      return {
        title: 'You Want a Partner Without Children',
        description: `Requiring a childless partner removes ${pctStr}% of your remaining pool, which is ${countStr} people in ${metro}. As singles move into their 30s and beyond, a growing majority already have children. This preference is one of the most common pool-shrinking filters in the dating market.`,
        action: 'Ask yourself whether this is a firm boundary or a preference. If you\'d consider dating a great partner who happened to have kids, relaxing this single filter could dramatically expand your options. If it\'s non-negotiable, that\'s valid, but be aware you\'ll need to compensate with flexibility elsewhere.',
      };
    }
    if (/yes/i.test(val)) {
      return {
        title: 'You Prefer Partners Who Already Have Children',
        description: `Filtering for partners who have kids removes ${pctStr}% of your pool (${countStr} people). Younger singles are less likely to have children, so this filter becomes more costly in younger age brackets.`,
        action: 'If you\'re looking for someone who understands parenting, that\'s a meaningful compatibility signal. Consider whether "open to either" might serve the same goal without cutting as many people.',
      };
    }
    return {
      title: 'Your Preference on Partner\'s Children',
      description: `Your children preference removes ${pctStr}% of your pool (${countStr} people) in ${metro}.`,
      action: 'Consider whether this reflects a core value or a soft preference. Even small flexibility here can meaningfully expand your match pool.',
    };
  }

  // Wants kids: No / Yes
  if (/^Wants kids:/i.test(stageName)) {
    const val = stageName.replace(/^Wants kids:\s*/i, '').trim();
    if (/no/i.test(val)) {
      return {
        title: 'You Want a Partner Who Doesn\'t Want Children',
        description: `This removes ${pctStr}% of your remaining pool (${countStr} people). The majority of singles under 40 say they want children eventually, which makes this a significant filter, especially in family-oriented metros like ${metro}.`,
        action: 'If you know you don\'t want kids, finding a partner who shares that conviction is important for long-term compatibility. This is worth keeping if it\'s a core life decision, but be honest with yourself about whether it\'s settled or still evolving.',
      };
    }
    return {
      title: 'You Want a Partner Who Wants Children',
      description: `Filtering for partners who want children removes ${pctStr}% of your pool (${countStr} people). In older age brackets, more singles have either completed their families or decided against children, making this filter increasingly costly with age.`,
      action: 'This is one of the most important long-term compatibility factors. Keep it, but if your timeline is flexible, widening your age range slightly can offset the pool reduction.',
    };
  }

  // Smoking: No / Yes
  if (/^Smoking:/i.test(stageName)) {
    const val = stageName.replace(/^Smoking:\s*/i, '').trim();
    if (/no/i.test(val)) {
      return {
        title: 'You Require a Non-Smoking Partner',
        description: `Excluding smokers removes ${pctStr}% of your pool (${countStr} people) in ${metro}. Smoking rates vary significantly by region. In some metros this is barely noticeable, but in areas with higher smoking prevalence it can be a meaningful cut.`,
        action: `In ${metro}, this filter costs you ${countStr} potential matches. For most people, non-smoking is a reasonable health and lifestyle boundary. If it's removing more than 15% of your pool, you're in a higher-smoking metro, but this is usually worth keeping.`,
      };
    }
    return {
      title: 'Your Smoking Preference Is Narrowing Your Pool',
      description: `Your smoking preference removes ${pctStr}% of your pool (${countStr} people). The majority of the dating population doesn't smoke, so requiring a smoker significantly limits your options.`,
      action: 'If smoking compatibility matters to you, consider broadening to "open to either." You\'ll still encounter smokers but won\'t exclude non-smokers.',
    };
  }

  // Height ≥ X
  if (/^Height/i.test(stageName)) {
    const heightVal = stageName.replace(/^Height[^0-9]*/i, '').trim();
    return {
      title: 'Your Minimum Height Preference Is Filtering Heavily',
      description: `Requiring a partner ${heightVal} or taller eliminates ${pctStr}% of the remaining ${seeking} in your pool, ${countStr} people gone from one preference alone. Height follows a bell curve: each additional inch above average cuts the eligible pool roughly in half.`,
      action: `Dropping your minimum by just 1-2 inches could recover thousands of potential matches. Many people find that in person, a partner slightly below their "ideal" height is a non-issue. If height is truly important to you, keep it, but recognize this is one of your most expensive filters.`,
    };
  }

  // Body type: X, Y
  if (/^Body type:/i.test(stageName)) {
    const types = stageName.replace(/^Body type:\s*/i, '').trim();
    return {
      title: 'Your Body Type Preferences Are Narrowing Your Pool',
      description: `Filtering for "${types}" body types removes ${pctStr}% of your remaining pool (${countStr} people). Body type preferences tend to compound with height and fitness filters. Together, these physical preferences can eliminate the vast majority of otherwise compatible matches.`,
      action: `Consider whether you're stacking physical filters. If you're also filtering on height and fitness level, the combined effect is much larger than any single filter suggests. Try keeping your strongest physical preference and relaxing the others. You may find that fitness level is a better proxy for what you actually care about than a self-reported body type label.`,
    };
  }

  // Fitness: X
  if (/^Fitness:/i.test(stageName)) {
    const levels = stageName.replace(/^Fitness:\s*/i, '').trim();
    return {
      title: 'Your Fitness Level Preference Is Costly',
      description: `Requiring "${levels}" fitness removes ${pctStr}% of your pool (${countStr} people). Only a minority of adults exercise at high frequency, and self-reported fitness levels tend to be optimistic, meaning the real pool of people who meet this standard is even smaller than the data suggests.`,
      action: 'Fitness matters for lifestyle compatibility, but consider whether you need a gym partner or simply someone who takes care of themselves. Broadening from "daily" to "a few times a week" or accepting one tier lower can significantly expand your options without compromising on an active lifestyle.',
    };
  }

  // Political: X, Y
  if (/^Political:/i.test(stageName)) {
    const views = stageName.replace(/^Political:\s*/i, '').trim();
    return {
      title: 'Your Political Compatibility Filter Is Expensive',
      description: `Filtering for "${views}" political views removes ${pctStr}% of your pool (${countStr} people) in ${metro}. Political demographics vary dramatically by metro. This filter could cost you 10% in one city and 60% in another.`,
      action: `In ${metro}, this preference eliminates ${countStr} people. If political alignment is essential for your relationship satisfaction, keep it. But if you'd be happy with someone who's politically moderate or simply not strongly opposed to your views, broadening this filter is one of the easiest ways to grow your pool.`,
    };
  }

  // Age X-Y
  if (/^Age \d/i.test(stageName)) {
    const range = stageName.replace(/^Age\s*/i, '').trim();
    return {
      title: 'Your Age Range Is Limiting Your Options',
      description: `Your preferred age range of ${range} removes ${pctStr}% of eligible singles (${countStr} people). Narrow age windows, especially ranges of 5 years or less, are one of the biggest hidden pool killers because they cut across every other filter you've set.`,
      action: 'Widening your age range by even 2-3 years on either end can recover a significant number of matches. Research consistently shows that age-gap relationships of 5-7 years report similar satisfaction levels to same-age relationships. The "right" person might be just outside your current window.',
    };
  }

  // Income ≥ $X
  if (/^Income/i.test(stageName)) {
    const threshold = stageName.replace(/^Income[^$]*/i, '').trim();
    return {
      title: 'Your Income Requirement Is a Major Filter',
      description: `Requiring a partner earning ${threshold} or more eliminates ${pctStr}% of your pool (${countStr} people). Income distribution is heavily skewed. Each step up the income ladder removes a disproportionately large share of people because far fewer earn above each threshold.`,
      action: `Consider what income actually represents to you: financial stability, ambition, lifestyle compatibility? Someone earning slightly below your threshold may check all those boxes. Lowering your minimum by 15-20% could double or triple the number of people who pass this filter, because of how income distribution works at higher levels.`,
    };
  }

  // Fallback for any unrecognized stage
  const cleanName = stageName.replace(/:\s*.*$/, '').trim();
  return {
    title: `Your "${cleanName}" Preference Is Reducing Your Pool`,
    description: `This preference removes ${pctStr}% of your remaining matches (${countStr} people) in ${metro}. Every filter you add compounds with the others, so even moderate individual cuts create large combined reductions.`,
    action: 'Rank your preferences by importance. Keep your top 2-3 non-negotiables firm and consider adding flexibility to the rest. Small concessions on lower-priority preferences often recover more matches than you\'d expect.',
  };
}

export function CompetitivenessBreakdown({ marketData, demographics }: { marketData: MarketData; demographics: Demographics }) {
  const score = marketData.relateScore;
  if (!score || !score.components) return null;

  const components = score.components;
  const metro = marketData.location?.cbsaLabel || marketData.location?.cbsaName || 'your area';
  const metroShort = metro.includes(',') ? metro.split(',')[0] : metro;
  const ownGender = demographics?.gender === 'M' ? 'men' : demographics?.gender === 'W' ? 'women' : 'singles';
  const ownGenderSingular = demographics?.gender === 'M' ? 'man' : demographics?.gender === 'W' ? 'woman' : 'person';
  const datingGender = demographics?.gender === 'M' ? 'women' : demographics?.gender === 'W' ? 'men' : 'singles';

  const hiddenTraits = new Set(['ethnicity', 'smoking', 'wantKids']);
  if (demographics?.gender === 'W') hiddenTraits.add('height');
  const labelMap: Record<string, string> = {
    income: 'Income', education: 'Education', age: 'Age',
    height: 'Height', body: 'Fitness', politics: 'Politics',
    hasKids: 'Children', costOfLiving: 'Cost of Living',
  };

  const fmt$ = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

  // Generate rich, plain-English explanations per trait
  function explain(key: string, comp: any): string {
    const c = comp.ctx || {};

    switch (key) {
      case 'income': {
        const nom = fmt$(c.nominal || 0);
        const adj = fmt$(c.adjusted || 0);
        if (comp.score >= 80) return `${nom} goes even further in ${metroShort}, where the cost of living stretches it to about ${adj} in purchasing power. You out-earn virtually every other single ${ownGenderSingular} in this market. Income is the single most important trait ${datingGender} evaluate in ${ownGender}.`;
        if (comp.score >= 50) return `${nom} puts you above the local median for ${ownGender} in ${metroShort}. After adjusting for cost of living (about ${adj} in real purchasing power), you are in a solid position, though not yet a standout.`;
        return `At ${nom}, your income falls in the bottom half of ${ownGender} in ${metroShort}. After adjusting for cost of living, your real purchasing power is about ${adj}. For men, this is the most heavily weighted factor in the dating market.`;
      }
      case 'education': {
        const pct = c.marketPercentile || 0;
        if (comp.score >= 80) return `A ${(c.level || 'graduate degree').toLowerCase()} puts you ahead of ${pct}% of ${ownGender} in ${metroShort}. Only about ${Math.max(1, Math.round(100 - pct))}% of single ${ownGender} here have the same level of education or higher.`;
        if (comp.score >= 50) return `Your education level is above the local average in ${metroShort}. It reinforces your other strengths but is not a major differentiator on its own.`;
        return `Your education level is below the local average in ${metroShort}. Many ${datingGender} here filter on credentials, which limits your competitive position.`;
      }
      case 'age': {
        const peak = c.peakRange || '34 to 42';
        const age = c.age || 0;
        if (comp.score >= 70) return `At ${age}, you are right in the sweet spot. The most desirable age range for ${ownGender} is ${peak}, and you are squarely in it. This is a structural advantage you do not have to work for.`;
        if (comp.score >= 50) {
          const pastPeak = age > 42;
          return pastPeak
            ? `At ${age}, you are ${age - 42} years past the peak desirability range for ${ownGender} (${peak}). You are still in a range that most ${datingGender} find acceptable, but more than half of single ${ownGender} in ${metroShort} are younger than you.`
            : `At ${age}, you are near the peak desirability range for ${ownGender} (${peak}). A solid position, though not the absolute sweet spot.`;
        }
        return `At ${age}, age is working against you. The peak for ${ownGender} is ${peak}, and the majority of single ${ownGender} in ${metroShort} are younger. This is a dimension you cannot change, but understanding it helps you focus on what you can.`;
      }
      case 'ethnicity': {
        const own = c.ownPct || 0;
        const eth = c.ethnicity || 'Your background';
        if (comp.score >= 70) return `${eth} aligns well with the dating preferences of ${datingGender} in ${metroShort}. About ${own}% of singles here share your background, and cross-group interest patterns also work in your favor.`;
        if (comp.score >= 50) return `${eth} has moderate appeal in ${metroShort}, where about ${own}% of singles share your background. Not a strong tailwind, but not a headwind either.`;
        return `The demographic makeup of ${metroShort} creates a tougher environment for your profile. Only ${own}% of singles share your background, and dating preference patterns in this market favor other groups more heavily.`;
      }
      case 'height': {
        if (comp.score >= 80) return `At ${c.height || 'your height'}, you are taller than the vast majority of ${ownGender} in ${metroShort}. Above about 6 feet, additional inches add very little, but being in this range is a clear advantage that most ${ownGender} cannot match.`;
        if (comp.score >= 60) return `${c.height || 'Your height'} is above average for ${ownGender} in ${metroShort}. A modest but real advantage.`;
        return `${c.height || 'Your height'} is below the average for ${ownGender} in ${metroShort}. Height is one of the hardest traits to compensate for in the dating market, because ${datingGender} often filter on it before anything else.`;
      }
      case 'body': {
        const bt = c.bodyType || 'your body type';
        const fit = c.fitness || 'your fitness level';
        if (comp.score >= 75) return `Being ${bt.toLowerCase()} and working out ${fit.toLowerCase()} puts your physical profile near the top of ${ownGender} in ${metroShort}. Physical fitness is one of the most visible signals in the dating market, and yours is strong.`;
        if (comp.score >= 50) return `Your body type (${bt.toLowerCase()}) and fitness level (${fit.toLowerCase()}) are above average in ${metroShort}. Competitive, but not yet a standout. This is one of the most improvable factors on the list.`;
        return `Your body type (${bt.toLowerCase()}) and fitness level (${fit.toLowerCase()}) are below the competitive threshold in ${metroShort}. The good news: this is one of the most changeable factors. Fitness and body composition are entirely within your control.`;
      }
      case 'politics': {
        const pol = c.political || 'your political views';
        const con = c.conPct || 0;
        const mod = c.modPct || 0;
        const lib = c.libPct || 0;
        if (comp.score >= 70) return `${pol} aligns well with the singles pool in ${metroShort}, which is about ${con}% conservative, ${mod}% moderate, and ${lib}% liberal. Political alignment removes one of the most common dealbreakers.`;
        if (comp.score >= 50) return `${pol} in a market that is ${con}% conservative, ${mod}% moderate, and ${lib}% liberal. You have moderate alignment. Moderates and adjacent groups provide some tolerance, but it is not a strong tailwind.`;
        return `${pol} is out of step with the ${metroShort} singles pool (${con}% conservative, ${mod}% moderate, ${lib}% liberal). Political mismatch is one of the hardest dealbreakers to overcome, and it shrinks your compatible pool before any other filter is applied.`;
      }
      case 'smoking': {
        const nonPct = c.nonSmokerPct || 80;
        if (!c.isSmoker) return `Not smoking puts you in alignment with ${nonPct}% of singles in ${metroShort}. One less barrier between you and a match.`;
        return `Smoking is a hard filter for most ${datingGender}. ${nonPct}% of singles in ${metroShort} do not smoke, and most of them will not consider a partner who does. This single trait can exclude you from the majority of potential matches.`;
      }
      case 'hasKids': {
        const noKids = c.noKidsPct || 50;
        const wantYes = c.wantKidsYesPct || 0;
        if (!c.hasKids) return `Not having children gives you a clear edge. ${noKids}% of single ${ownGender} in ${metroShort} are also childless, and most ${datingGender} prefer partners without existing kids.`;
        return `Having children puts you at a disadvantage against the ${noKids}% of single ${ownGender} who do not have kids. In a market where ${wantYes}% of ${datingGender} say they want children, having them already creates friction. Many ${datingGender} want to start fresh.`;
      }
      case 'wantKids': {
        const wantYes = c.wantKidsYesPct || 0;
        const wants = c.wantKids === 'Yes' ? 'wanting kids' : c.wantKids === 'No' ? 'not wanting kids' : 'being open either way';
        if (comp.score >= 60) return `${wants.charAt(0).toUpperCase() + wants.slice(1)} is in sync with the local singles pool, where ${wantYes}% also want children. Alignment here removes a quiet but common dealbreaker.`;
        return `${wants.charAt(0).toUpperCase() + wants.slice(1)} puts you out of step with the local market, where ${wantYes}% of singles want kids. Misalignment on children is a dealbreaker for many ${datingGender}, even if they do not say it out loud.`;
      }
      case 'costOfLiving': {
        const src = c.sourceTraitLabel === 'income' ? 'earning power' : 'physical profile';
        if (comp.score >= 80) return `${metroShort} is more affordable than average, which makes your ${src} go further. The same profile would score lower in a more expensive city where everyone earns more or fitness culture is more intense.`;
        if (comp.score >= 50) return `The cost of living in ${metroShort} is close to the national average. Your ${src} is neither amplified nor diminished by where you live.`;
        return `${metroShort} is expensive, and that works against you. Your ${src} does not stretch as far here as it would in a more affordable city. The same profile would score noticeably higher somewhere with a lower cost of living.`;
      }
      default: return '';
    }
  }

  // Build a narrative summary
  function buildSummary(strengths: any[], weaknesses: any[]): string {
    const strongTraits = strengths.slice(0, 3).map(s => s.label.toLowerCase()).join(', ');
    const weakTraits = weaknesses.map(w => `${w.label.toLowerCase()} (${w.key === 'age' ? 'past peak' : w.key === 'hasKids' ? 'has kids' : 'drag'})`).join(', ');

    const overall = score?.score ?? 0;
    let tone = '';
    if (overall >= 80) tone = `a genuinely elite profile with identifiable vulnerabilities`;
    else if (overall >= 65) tone = `a competitive profile with clear strengths and some structural headwinds`;
    else if (overall >= 50) tone = `an average profile where a few key improvements could move the needle significantly`;
    else tone = `a profile facing real headwinds, but several factors are within your control to change`;

    let summary = `Your ${Math.round(overall)} composite reflects ${tone}.`;
    if (strongTraits) summary += ` Your ${strongTraits} ${strengths.length === 1 ? 'is' : 'are'} carrying the score.`;
    if (weakTraits) summary += ` Working against you: ${weakTraits}.`;
    return summary;
  }

  // Build entries from components (exclude hidden traits)
  const entries = Object.entries(components)
    .filter(([key]) => !hiddenTraits.has(key))
    .map(([key, comp]: [string, any]) => {
    const val = comp.local ?? comp.score ?? comp.national ?? 50;
    const weight = comp.weight ?? 0;
    return { key, val, weight, weighted: val * weight, label: labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1), comp };
  }).sort((a, b) => b.weighted - a.weighted);

  const strengths = entries.filter(e => e.val >= 65 && e.weight > 0);
  const weaknesses = entries.filter(e => e.val < 50 && e.weight > 0);

  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <section className="card mb-4">
      <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2">
        <Icon name="insights" size={20} className="text-accent" />
        What&apos;s Making You Competitive
      </h3>
      <p className="card-summary mb-4">How each trait is affecting your score in {metroShort}</p>

      {strengths.length > 0 && (
        <div className="mb-5">
          <span className="card-subheader text-success">Pulling You Up</span>
          <div className="mt-2 space-y-0 divide-y divide-border">
            {strengths.map(s => (
              <div key={s.key} className="py-3 flex gap-3">
                <div className="flex-shrink-0 w-12 text-right pt-0.5">
                  <span className="text-lg font-bold text-success">{Math.round(s.val)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  <p className="body-paragraph mt-0.5 leading-relaxed">{cleanProse(explain(s.key, s.comp))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div className="mb-3">
          <span className="card-subheader text-danger">Pulling You Down</span>
          <div className="mt-2 space-y-0 divide-y divide-border">
            {weaknesses.map(w => (
              <div key={w.key} className="py-3 flex gap-3">
                <div className="flex-shrink-0 w-12 text-right pt-0.5">
                  <span className="text-lg font-bold text-danger">{Math.round(w.val)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{w.label}</span>
                  <p className="body-paragraph mt-0.5 leading-relaxed">{cleanProse(explain(w.key, w.comp))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary narrative */}
      <div className="border-t border-border pt-3 mt-1">
        <p className="body-paragraph italic">{cleanProse(buildSummary(strengths, weaknesses))}</p>
      </div>
    </section>
  );
}

export function MarketCoaching({ marketData, demographics, m3, m4, persona }: {
  marketData: MarketData | null;
  demographics: Demographics;
  m3: any;
  m4: any;
  persona: any;
}) {
  if (!marketData?.matchPool || !marketData?.relateScore) return null;

  const pool = marketData.matchPool;
  const score = marketData.relateScore;
  const funnel: FunnelStage[] = pool.funnel || [];
  const matchCount = marketData.matchCount ?? 0;
  const prob = marketData.matchProbability;
  const metro = marketData.location?.cbsaLabel || marketData.location?.cbsaName || 'your area';
  const national = marketData.nationalComparison;
  const components = score.components || {};

  type Insight = { priority: 'high' | 'medium' | 'low'; title: string; description: string; action: string };
  const insights: Insight[] = [];

  const compEntries = Object.entries(components).map(([k, v]: [string, any]) => ({
    name: k, local: v.local ?? v.score ?? 0, weight: v.weight ?? 0,
    weighted: (v.local ?? v.score ?? 0) * (v.weight ?? 0),
  })).sort((a, b) => a.weighted - b.weighted);

  // ── Weakest Relate Score component ──
  const weakest = compEntries[0];
  if (weakest && weakest.local < 40) {
    const pct = Math.round(weakest.local);
    const weightPct = Math.round(weakest.weight * 100);
    const genderLabel = demographics.gender === 'W' ? 'women' : 'men';
    const coaching: Record<string, { title: string; desc: string; action: string }> = {
      income: {
        title: 'Your Income Is Limiting Your Competitiveness',
        desc: `Your income puts you in the bottom ${pct}% of ${genderLabel} in ${metro}. Income carries ${weightPct}% of your overall Relate Score weight, meaning it's one of the strongest factors determining how competitive you are in this market. In practical terms, this means a significant share of potential matches who filter by income will never see your profile.`,
        action: `Even a modest income increase can move your score meaningfully because the weight is so high (${weightPct}%). Concrete paths: negotiate a raise or promotion, pursue a professional certification that unlocks higher pay, or develop a side income stream. A 20% income increase in ${metro} could move your score by 5-10 points. Long-term, investing in earning power is the single highest-leverage move you can make for your dating market position.`,
      },
      education: {
        title: 'Your Education Level Is Below the Local Average',
        desc: `Your education ranks in the bottom ${pct}% of ${genderLabel} in ${metro}. Education affects your Relate Score because it correlates with the pool of people you're likely to meet and match with. Higher-education metros tend to filter heavily on credentials, even unconsciously.`,
        action: 'The good news is education is improvable. Professional certifications, online degrees from accredited programs, or specialized skill-based credentials can all shift your percentile. Even a single credential upgrade (e.g., associate\'s to bachelor\'s, or adding a professional cert) can meaningfully change how you\'re perceived in the dating market. Focus on credentials that also boost your income. That way you improve two score components at once.',
      },
      age: {
        title: 'Age Is Working Against You in This Market',
        desc: `Your age competitiveness score is ${pct} out of 100 in ${metro}. This doesn't mean your age is "wrong." It means the singles you're seeking tend to prefer a different age range than yours. The dating market has well-documented age preferences, and your current position means you're competing against a larger pool of people in a more preferred age bracket.`,
        action: 'Age is the one factor you can\'t change, but you can offset it by excelling in areas you control. Fitness and physical presentation become more important as age works against you. Staying in strong physical shape can effectively "subtract" years from how competitive you are. Income and emotional maturity are also areas where age can become an advantage if you invest in them. Focus on being the most compelling version of yourself in the areas that are within your control.',
      },
      children: {
        title: 'Having Children Is Narrowing Your Dating Pool',
        desc: `Being a parent places you in a more competitive segment of the ${metro} dating market. Many singles, particularly those without children of their own, prefer partners without existing kids. This isn't a reflection of your worth as a parent; it's a market reality that affects how many people will consider you as a potential match.`,
        action: 'Rather than hiding this part of your life, lead with it authentically. Singles who are open to partners with children tend to value maturity, stability, and family orientation, qualities you can highlight. On dating profiles, showing (not just telling) that your life is full and well-managed is more effective than downplaying your kids. Also consider that your best matches may be other parents. Shared parenting experience creates immediate common ground and mutual understanding.',
      },
      ethnicity: {
        title: 'Your Demographic Profile Is Highly Competitive Here',
        desc: `Your ethnicity competitiveness score is ${pct} in ${metro}. This reflects documented preference patterns in the local dating market. Certain demographic groups face more competition for matches in specific metros based on population ratios and stated preferences. ${national && national.relateScore > score.score + 5 ? `Nationally, your score jumps to ${national.relateScore} (vs. ${score.score} locally), meaning your demographic is significantly more competitive in other markets.` : ''}`,
        action: national && national.relateScore > score.score + 5
          ? `Geography is working against you here. Your national Relate Score of ${national.relateScore} vs. your local score of ${score.score} tells you that other metros would give you a structural advantage. If relocation is on the table, research metros where the demographic composition works more in your favor. In the meantime, focus on the factors you control. Income, fitness, and genuine charisma go a long way in any market.`
          : 'Focus on maximizing the factors within your control: income, fitness, style, and emotional intelligence. People who score lower on demographic competitiveness but higher on personal development factors often outperform their "expected" match rate. Invest in being genuinely interesting. Hobbies, travel, skills, and social proof all help differentiate you in a competitive market.',
      },
    };
    const c = coaching[weakest.name];
    if (c) insights.push({ priority: 'high', title: c.title, description: c.desc, action: c.action });
  }

  // ── Strongest component ──
  const strongest = compEntries[compEntries.length - 1];
  if (strongest && strongest.local >= 70) {
    const topPct = Math.round(100 - strongest.local);
    const nameLabel = strongest.name.charAt(0).toUpperCase() + strongest.name.slice(1);
    insights.push({
      priority: 'low',
      title: `${nameLabel} Is Your Strongest Market Advantage`,
      description: `Your ${strongest.name} ranks in the top ${topPct}% of singles in ${metro}. This is the component pulling your Relate Score up the most. It's what makes you competitive against others in your market. Potential matches who value ${strongest.name} will find you disproportionately attractive compared to the local average.`,
      action: `Make this visible. Your dating profile, first-date conversations, and overall presentation should reflect this strength. If ${strongest.name} is your edge, don't be modest about it. Let it do the work for you. People tend to underplay their strongest assets; lean into yours.`,
    });
  }

  // ── Funnel bottlenecks (humanized) ──
  const nonPreferenceFilters = /orientation|sexual|gender|base.*age|18.*64|eligible/i;
  const drops: { lostPct: number; lostCount: number; stageName: string }[] = [];
  for (let i = 1; i < funnel.length; i++) {
    const prev = funnel[i - 1];
    const curr = funnel[i];
    if (curr.isMilestone || prev.isMilestone || prev.count === 0) continue;
    if (nonPreferenceFilters.test(curr.stage) || nonPreferenceFilters.test(curr.filter || '')) continue;
    const lostPct = ((prev.count - curr.count) / prev.count) * 100;
    if (lostPct > 5) drops.push({ lostPct, lostCount: prev.count - curr.count, stageName: curr.stage });
  }
  drops.sort((a, b) => b.lostPct - a.lostPct);

  if (drops[0] && drops[0].lostPct > 30) {
    const h = humanizeBottleneck(drops[0].stageName, drops[0].lostPct, drops[0].lostCount, metro, demographics.gender);
    insights.push({ priority: 'high', title: h.title, description: h.description, action: h.action });
  }
  if (drops[1] && drops[1].lostPct > 25) {
    const h = humanizeBottleneck(drops[1].stageName, drops[1].lostPct, drops[1].lostCount, metro, demographics.gender);
    insights.push({ priority: 'medium', title: h.title, description: h.description, action: h.action });
  }

  // ── Selectivity ──
  if (pool.localSinglePool > 0 && pool.idealPool > 0) {
    const pct = (pool.idealPool / pool.localSinglePool) * 100;
    if (pct < 1) {
      const idealStr = pool.idealPool.toLocaleString();
      const totalStr = pool.localSinglePool.toLocaleString();
      insights.push({
        priority: 'high',
        title: 'Your Combined Preferences Filter Out Over 99% of Singles',
        description: `After applying all your preferences, only ${idealStr} of ${totalStr} eligible singles in ${metro} remain, less than 1%. Each individual filter may seem reasonable on its own, but stacked together they create an extremely narrow funnel. This means you're not just being selective on one dimension; the compound effect of all your preferences is working against you.`,
        action: 'You don\'t need to lower your standards across the board. Instead, identify your 2-3 true dealbreakers and hold firm on those while adding flexibility everywhere else. Look at your funnel breakdown to see which filters are doing the most damage. Often, loosening just one or two secondary preferences can move you from dozens of potential matches to hundreds.',
      });
    }
  }

  // ── Match probability ──
  if (prob && prob.rate < 0.05) {
    insights.push({
      priority: 'medium',
      title: 'Your Mutual Match Probability Is Below 5%',
      description: `Of the people who meet all your criteria, only ${prob.percentage} would also find you competitive enough to match with. This is the "two-way" problem: it's not enough to want them. They have to want you back. A low mutual match rate usually means there's a gap between the caliber of partner you're seeking and your current market competitiveness.`,
      action: 'There are two levers here: make yourself more competitive (improve your Relate Score by raising income, fitness, or presentation) or widen your preferences so you\'re fishing in a pool where you\'re more competitive. A 10-point Relate Score improvement can nearly double your match probability because you move up in the ranking of everyone\'s potential matches. Focus on your weakest score component, and that\'s where improvement has the highest return.',
    });
  }

  // ── Geographic opportunity ──
  if (national && national.matchCount > matchCount * 3 && matchCount < 100) {
    insights.push({
      priority: 'low',
      title: 'Your Dating Market Is Significantly Better in Other Cities',
      description: `Nationally, your estimated match count jumps to ${national.matchCount.toLocaleString()} compared to just ${matchCount.toLocaleString()} in ${metro}. That's a ${Math.round(national.matchCount / Math.max(matchCount, 1))}x difference. This gap means the local population composition, including age distribution, income levels, political leanings, and demographic mix, is working against your specific preference profile.`,
      action: `If you have any flexibility on location, this is worth exploring seriously. Research metros where the demographics align better with what you're looking for. You don't necessarily need to move permanently. Even expanding your search radius to nearby metros, or being open to long-distance for the right person, could dramatically change your odds. With only ${matchCount.toLocaleString()} estimated local matches, geography may be your single biggest constraint.`,
    });
  }

  if (insights.length === 0) return null;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <section className="card mb-4">
      <h3 className="font-serif text-lg font-semibold mb-1 flex items-center gap-2"><Icon name="tips_and_updates" size={20} className="text-accent" />Market Coaching</h3>
      <p className="card-summary mb-4">Actionable insights from your dating market data and assessment results</p>
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className="border border-border rounded-md p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                insight.priority === 'high' ? 'bg-danger/10 text-danger' : insight.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-stone-100 text-secondary'
              }`}>{insight.priority}</span>
              <h3 className="data-label leading-tight">{insight.title}</h3>
            </div>
            <p className="body-paragraph mb-2">{insight.description}</p>
            <div className="bg-stone-50 border border-border rounded p-2">
              <span className="text-[10px] text-accent uppercase tracking-wider">What to do</span>
              <p className="body-paragraph mt-1">{insight.action}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/no-explicit-any */
