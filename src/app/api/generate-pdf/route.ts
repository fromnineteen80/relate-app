import { NextRequest, NextResponse } from 'next/server';

// PDF generation route for RELATE reports
// Uses jsPDF-compatible HTML-to-PDF approach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, persona, dimensions, m3, m4, matches, individualCompatibility, marketData } = body;

    if (!persona) {
      return NextResponse.json({ error: 'No report data provided' }, { status: 400 });
    }

    // Build a clean HTML report for PDF conversion
    const html = buildReportHTML({ report, persona, dimensions, m3, m4, matches, individualCompatibility, marketData });

    // Return HTML that the client can use with window.print() or a client-side PDF library
    return NextResponse.json({
      html,
      filename: `RELATE-Report-${persona.code || 'unknown'}.pdf`,
    });
  } catch (error: unknown) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function buildReportHTML(data: {
  report?: Record<string, string>;
  persona: { code: string; name: string; traits?: string; datingBehavior?: string[] };
  dimensions?: Record<string, { assignedPole?: string; poleAScore?: number; poleBScore?: number; strength?: number }>;
  m3?: { wantScore: number; offerScore: number; typeName?: string };
  m4?: { summary?: Record<string, string> };
  matches?: Array<{ rank: number; code: string; name: string; tier: string; compatibilityScore: number; summary?: string }>;
  individualCompatibility?: any;
  marketData?: any;
}) {
  const { persona, dimensions, m3, m4, matches, report, individualCompatibility, marketData } = data;

  const dimensionRows = dimensions
    ? Object.entries(dimensions).map(([dim, d]) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #e5e5e5;text-transform:capitalize">${dim}</td>
         <td style="padding:8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${d.assignedPole || '-'}</td>
         <td style="padding:8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${d.strength || '-'}%</td></tr>`
      ).join('')
    : '';

  const pdfTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      ideal: '#047857', kismet: '#4da88f', effort: '#d97706',
      longShot: '#a8a29e', atRisk: '#d1546e', incompatible: '#be123c',
    };
    return colors[tier] || '#78716c';
  };

  const pdfTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      ideal: 'Ideal', kismet: 'Kismet', effort: 'Effort',
      longShot: 'Long Shot', atRisk: 'At Risk', incompatible: 'Incompatible',
    };
    return labels[tier] || tier;
  };

  const matchRows = matches
    ? matches.map(m =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${m.rank}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5">${m.name}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${m.code}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;color:${pdfTierColor(m.tier)};font-weight:600">${pdfTierLabel(m.tier)}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${m.compatibilityScore}%</td></tr>`
      ).join('')
    : '';

  const m4Summary = m4?.summary || {};

  const marketSection = buildMarketHTML(marketData);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RELATE Assessment Report</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 28px; margin-bottom: 4px; }
    h2 { font-size: 20px; margin-top: 32px; margin-bottom: 12px; border-bottom: 2px solid #e5e5e5; padding-bottom: 8px; }
    h3 { font-size: 16px; margin-top: 24px; }
    .mono { font-family: 'Courier New', monospace; }
    .secondary { color: #6b6b6b; }
    .accent { color: #c2410c; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { text-align: left; padding: 8px; border-bottom: 2px solid #1a1a1a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 16px 0; }
    .grid-item { text-align: center; padding: 16px; border: 1px solid #e5e5e5; border-radius: 8px; }
    .grid-item .value { font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; }
    .grid-item .label { font-size: 12px; color: #6b6b6b; margin-top: 4px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #6b6b6b; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:40px">
    <p class="mono secondary" style="font-size:12px;letter-spacing:2px">RELATE ASSESSMENT</p>
    <h1>${persona.name}</h1>
    <p class="mono accent">${persona.code}</p>
    ${persona.traits ? `<p class="secondary" style="margin-top:12px">${persona.traits}</p>` : ''}
  </div>

  ${report?.executiveSummary ? `<h2>Executive Summary</h2><p>${report.executiveSummary}</p>` : ''}

  ${dimensionRows ? `
  <h2>Dimension Scores</h2>
  <table>
    <thead><tr><th>Dimension</th><th>Assigned Pole</th><th>Strength</th></tr></thead>
    <tbody>${dimensionRows}</tbody>
  </table>` : ''}

  ${m3 ? `
  <h2>Connection Style</h2>
  <div class="grid">
    <div class="grid-item"><div class="value">${m3.wantScore}</div><div class="label">Want Score</div></div>
    <div class="grid-item"><div class="value">${m3.offerScore}</div><div class="label">Offer Score</div></div>
    <div class="grid-item"><div class="value">${m3.typeName || '-'}</div><div class="label">Type</div></div>
  </div>` : ''}

  ${Object.keys(m4Summary).length > 0 ? `
  <h2>Conflict Profile</h2>
  <table>
    <thead><tr><th>Metric</th><th>Value</th></tr></thead>
    <tbody>
      ${Object.entries(m4Summary).map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #e5e5e5;text-transform:capitalize">${k}</td><td style="padding:8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${v}</td></tr>`).join('')}
    </tbody>
  </table>` : ''}

  ${individualCompatibility?.attachment ? `
  <h2>Attachment Style</h2>
  <div class="grid" style="grid-template-columns: 1fr 1fr">
    <div class="grid-item"><div class="value" style="text-transform:capitalize">${individualCompatibility.attachment.style}</div><div class="label">Style${individualCompatibility.attachment.subtype ? ` (${individualCompatibility.attachment.subtype})` : ''}${individualCompatibility.attachment.leaningToward ? ` — leaning ${individualCompatibility.attachment.leaningToward}` : ''}</div></div>
    <div class="grid-item"><div class="value">${Math.round((individualCompatibility.attachment.confidence || 0) * 100)}%</div><div class="label">Confidence</div></div>
  </div>
  <p class="secondary">${individualCompatibility.attachment.description}</p>` : ''}

  ${individualCompatibility?.m3States ? (() => {
    const states = individualCompatibility.m3States.states;
    const insights = individualCompatibility.m3States.insights;
    const barStyle = (pct: number, color: string) => `display:inline-block;height:12px;border-radius:6px;background:${color};width:${pct}%`;
    return `
  <h2>Your Intimacy Under Stress</h2>
  <p class="secondary" style="font-size:13px;margin-bottom:16px">How your Want and Offer shift across relationship states</p>
  <table>
    <thead><tr><th>State</th><th>Want</th><th>Offer</th><th>Gap</th></tr></thead>
    <tbody>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e5e5">Baseline</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5"><span style="${barStyle(states.normal.want, '#a8a29e')}"></span> <span class="mono">${states.normal.want}</span></td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5"><span style="${barStyle(states.normal.offer, '#a8a29e')}"></span> <span class="mono">${states.normal.offer}</span></td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5" class="mono">${states.normal.gap > 0 ? '+' : ''}${states.normal.gap}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e5e5">Under Stress</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5"><span style="${barStyle(states.conflict.want, '#d97706')}"></span> <span class="mono">${states.conflict.want}</span></td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5"><span style="${barStyle(states.conflict.offer, '#d97706')}"></span> <span class="mono">${states.conflict.offer}</span></td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5" class="mono">${states.conflict.gap > 0 ? '+' : ''}${states.conflict.gap}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e5e5">Making Effort</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5"><span style="${barStyle(states.repair.want, '#16a34a')}"></span> <span class="mono">${states.repair.want}</span></td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5"><span style="${barStyle(states.repair.offer, '#16a34a')}"></span> <span class="mono">${states.repair.offer}</span></td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5" class="mono">${states.repair.gap > 0 ? '+' : ''}${states.repair.gap}</td></tr>
    </tbody>
  </table>
  <p class="secondary" style="font-size:13px;margin-top:12px">Gap expansion: <strong>${insights.gapExpansion > 0 ? '+' : ''}${insights.gapExpansion} points (${insights.gapExpansionLevel})</strong> | Repair effort: <strong>${insights.repairSustainable ? 'Sustainable' : 'High strain'}</strong></p>`;
  })() : ''}

  ${individualCompatibility?.attachmentTiers ? (() => {
    const at = individualCompatibility.attachmentTiers;
    const dt = individualCompatibility.driverTiers;
    const hi = individualCompatibility.horsemenInsights;
    const tierRow = (label: string, items: any[], field: string) => items?.length > 0
      ? `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e5e5">${label}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${items.map((i: any) => `${i[field]} (${i.score})`).join(', ')}</td></tr>`
      : '';
    return `
  <h2>Your Ideal Partner Profile</h2>
  <h3>Attachment Compatibility</h3>
  <table>
    <thead><tr><th>Tier</th><th>Styles</th></tr></thead>
    <tbody>
      ${tierRow('Best', at.bestMatches, 'style')}
      ${tierRow('Good', at.goodMatches, 'style')}
      ${tierRow('Workable', at.workableMatches, 'style')}
      ${tierRow('Risky', at.riskyMatches, 'style')}
      ${tierRow('Avoid', at.avoidMatches, 'style')}
    </tbody>
  </table>
  <p class="secondary" style="font-size:13px">${at.recommendation}</p>

  ${dt ? `
  <h3>Emotional Driver Compatibility</h3>
  <p class="secondary" style="font-size:13px;margin-bottom:8px">Your primary driver: <strong style="text-transform:capitalize">${dt.yourDriver.primary}</strong></p>
  <table>
    <thead><tr><th>Tier</th><th>Drivers</th></tr></thead>
    <tbody>
      ${tierRow('Best', dt.bestMatches, 'driver')}
      ${tierRow('Good', dt.goodMatches, 'driver')}
      ${tierRow('Workable', dt.workableMatches, 'driver')}
      ${tierRow('Avoid', dt.avoidMatches, 'driver')}
    </tbody>
  </table>
  <p class="secondary" style="font-size:13px">${dt.recommendation}</p>` : ''}

  ${hi?.lookFor?.length > 0 || hi?.avoid?.length > 0 ? `
  <h3>Conflict Behavior Guidance</h3>
  ${hi.urgent ? `<p style="color:#dc2626;font-size:13px;margin-bottom:8px"><strong>${hi.urgent}</strong></p>` : ''}
  ${hi.lookFor?.length > 0 ? `<p style="font-size:13px;margin-bottom:4px"><strong style="color:#16a34a">Look for:</strong></p>
  ${hi.lookFor.map((i: any) => `<p class="secondary" style="font-size:13px;margin-left:16px">${i.partnerTrait} — ${i.reason}</p>`).join('')}` : ''}
  ${hi.avoid?.length > 0 ? `<p style="font-size:13px;margin-top:8px;margin-bottom:4px"><strong style="color:#d97706">Avoid:</strong></p>
  ${hi.avoid.map((i: any) => `<p class="secondary" style="font-size:13px;margin-left:16px">${i.partnerTrait} — ${i.reason}</p>`).join('')}` : ''}` : ''}`;
  })() : ''}

  ${report?.m1DeepDive ? `<h2>What You Want</h2><p>${report.m1DeepDive}</p>` : ''}
  ${report?.m3DeepDive ? `<h2>How You Connect</h2><p>${report.m3DeepDive}</p>` : ''}
  ${report?.m4DeepDive ? `<h2>When Things Get Hard</h2><p>${report.m4DeepDive}</p>` : ''}

  ${matchRows ? `
  <h2>Compatibility Rankings</h2>
  <table>
    <thead><tr><th>#</th><th>Persona</th><th>Code</th><th>Tier</th><th>Score</th></tr></thead>
    <tbody>${matchRows}</tbody>
  </table>` : ''}

  ${marketSection}

  ${report?.growthPath ? `<h2>Growth Path</h2><p>${report.growthPath}</p>` : ''}

  <div class="footer">
    <p>RELATE | Relationship Intelligence Platform</p>
    <p>This report draws from Gottman Method, Emotionally Focused Therapy, Attachment Theory, and Internal Family Systems. It is not a diagnostic tool and does not replace licensed therapy. Demographic estimates derived from publicly available datasets from the U.S. Census Bureau, CDC, Pew Research Center, and Bureau of Justice Statistics.</p>
    <p>Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>`;
}

function buildMarketHTML(marketData: any): string {
  if (!marketData) return '';

  const pool = marketData.matchPool;
  const ctx = pool?.contextPools;
  const metro = marketData.location?.cbsaLabel || marketData.location?.cbsaName || 'Your Metro';
  const matchCount = marketData.matchCount ?? 0;
  const score = marketData.relateScore?.score ?? 0;
  const prob = marketData.matchProbability;
  const state = marketData.stateComparison;
  const national = marketData.nationalComparison;

  if (!pool) return '';

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
  const pctOf = (ideal: number, base: number) => base > 0 ? ((ideal / base) * 100).toFixed(1) + '%' : '—';
  const gLabel = ctx?.targetGenderLabel || 'target gender';
  const oLabel = ctx?.orientationLabel || 'orientation';
  const eLabel = ctx?.userEthnicity || 'ethnicity';

  // Funnel
  const funnel = pool.funnel || [];
  const funnelMax = funnel[0]?.count || 1;
  const funnelRows = funnel.map((s: any) => {
    const pct = Math.round((s.count / funnelMax) * 100);
    const isMilestone = s.isMilestone;
    return `<tr${isMilestone ? ' style="font-weight:600"' : ''}>
      <td style="padding:4px 8px;border-bottom:1px solid #f0f0f0;${isMilestone ? 'text-transform:uppercase;font-size:11px;letter-spacing:1px' : ''}">${s.stage}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f0f0f0;font-family:monospace;text-align:right">${fmt(s.count)}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f0f0f0;font-family:monospace;text-align:right;color:#6b6b6b">${s.filter || ''}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f0f0f0;width:40%">
        <div style="background:#f0f0f0;border-radius:4px;height:8px;overflow:hidden">
          <div style="background:${isMilestone ? '#c2410c' : '#a8a29e'};height:100%;width:${Math.max(1, pct)}%;border-radius:4px"></div>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Comparison table rows
  const compRows = [
    { label: metro, ideal: pool.idealPool, matches: matchCount, ctx, highlight: true },
    ...(state ? [{ label: `${state.label} (statewide)`, ideal: state.idealPool, matches: state.matchCount, ctx: state.contextPools }] : []),
    ...(national ? [{ label: 'National', ideal: national.idealPool, matches: national.matchCount, ctx: national.contextPools }] : []),
  ];

  const compTableRows = compRows.map((r: any) => {
    const bg = r.highlight ? 'background:#fff7ed;' : '';
    const weight = r.highlight ? 'font-weight:600;' : '';
    return `<tr style="${bg}">
      <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;${weight}">${r.label}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace;text-align:right">${fmt(r.ideal)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace;text-align:right;${weight}">${fmt(r.matches)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace;text-align:right">${r.ctx ? pctOf(r.ideal, r.ctx.allGender) : '—'}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace;text-align:right">${r.ctx ? pctOf(r.ideal, r.ctx.eligiblePool) : '—'}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace;text-align:right">${r.ctx ? pctOf(r.ideal, r.ctx.eligibleEthnicityPool) : '—'}</td>
    </tr>`;
  }).join('');

  return `
  <div style="page-break-before:always"></div>
  <h2>Your Dating Market</h2>

  <div class="grid" style="grid-template-columns:1fr 1fr 1fr 1fr">
    <div class="grid-item"><div class="value accent">${score}</div><div class="label">Relate Score</div></div>
    <div class="grid-item"><div class="value">${fmt(pool.localSinglePool)}</div><div class="label">Local Singles</div></div>
    <div class="grid-item"><div class="value">${fmt(pool.idealPool)}</div><div class="label">Ideal Pool</div></div>
    <div class="grid-item"><div class="value">${fmt(matchCount)}</div><div class="label">Matches</div></div>
  </div>
  <p class="secondary" style="font-size:12px;text-align:center;margin-bottom:4px">${metro} | Match Probability: ${prob?.percentage || '—'}</p>

  <h3>Match Pool Funnel</h3>
  <table style="font-size:12px">
    <thead><tr>
      <th>Stage</th>
      <th style="text-align:right">Count</th>
      <th style="text-align:right">Filter</th>
      <th></th>
    </tr></thead>
    <tbody>${funnelRows}</tbody>
  </table>

  <h3>Geographic Comparison</h3>
  <table style="font-size:12px">
    <thead><tr>
      <th>Scope</th>
      <th style="text-align:right">Ideal Pool</th>
      <th style="text-align:right">Matches</th>
      <th style="text-align:right">% of ${gLabel}</th>
      <th style="text-align:right">% of eligible</th>
      <th style="text-align:right">% of ${eLabel}</th>
    </tr></thead>
    <tbody>${compTableRows}</tbody>
  </table>

  <div style="margin-top:12px;font-size:11px;color:#6b6b6b;line-height:1.5">
    <p style="margin-bottom:6px"><strong style="color:#1a1a1a">Ideal Pool</strong> — People in this area who meet every preference you specified: gender, orientation, age range, income, relationship status, lifestyle traits, and physical preferences. This is your fully-filtered pool before accounting for mutual interest.</p>
    <p style="margin-bottom:6px"><strong style="color:#1a1a1a">Matches</strong> — Your ideal pool adjusted for the probability that someone in it would also be interested in you, based on your Relate Score. A higher Relate Score means a larger share of your ideal pool converts into realistic mutual matches.</p>
    <p style="margin-bottom:6px"><strong style="color:#1a1a1a">% of ${gLabel}</strong> — Your ideal pool expressed as a percentage of all ${gLabel} (ages 18–64, excluding homeless) in the area. This is the broadest lens: of every ${gLabel.slice(0, -1)} you could theoretically encounter, how many fit what you are looking for.</p>
    <p style="margin-bottom:6px"><strong style="color:#1a1a1a">% of eligible</strong> — Your ideal pool as a percentage of ${oLabel} ${gLabel} in your preferred age range with no criminal record. This filters out people who were never realistic candidates, giving you a truer sense of how selective your remaining preferences are.</p>
    <p style="margin-bottom:6px"><strong style="color:#1a1a1a">% of ${eLabel}</strong> — The same eligible pool narrowed further to ${eLabel} ${gLabel} only. Because felon rates, income distributions, and lifestyle patterns differ by ethnicity, this shows the most apples-to-apples view of your selectivity within the demographic group that most closely mirrors your own background.</p>
  </div>
  <p style="font-size:10px;color:#999;margin-top:12px">Estimates derived from publicly available census, demographic, and survey datasets from the U.S. Census Bureau, CDC, Pew Research Center, and Bureau of Justice Statistics. See relate.date/methodology for full details.</p>`;
}
