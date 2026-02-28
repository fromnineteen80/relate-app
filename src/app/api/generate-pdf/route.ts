import { NextRequest, NextResponse } from 'next/server';

// PDF generation route for RELATE reports
// Uses jsPDF-compatible HTML-to-PDF approach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, persona, dimensions, m3, m4, matches } = body;

    if (!persona) {
      return NextResponse.json({ error: 'No report data provided' }, { status: 400 });
    }

    // Build a clean HTML report for PDF conversion
    const html = buildReportHTML({ report, persona, dimensions, m3, m4, matches });

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

function buildReportHTML(data: {
  report?: Record<string, string>;
  persona: { code: string; name: string; traits?: string; datingBehavior?: string[] };
  dimensions?: Record<string, { assignedPole?: string; poleAScore?: number; poleBScore?: number; strength?: number }>;
  m3?: { wantScore: number; offerScore: number; typeName?: string };
  m4?: { summary?: Record<string, string> };
  matches?: Array<{ rank: number; code: string; name: string; tier: string; compatibilityScore: number; summary?: string }>;
}) {
  const { persona, dimensions, m3, m4, matches, report } = data;

  const dimensionRows = dimensions
    ? Object.entries(dimensions).map(([dim, d]) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #e5e5e5;text-transform:capitalize">${dim}</td>
         <td style="padding:8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${d.assignedPole || '-'}</td>
         <td style="padding:8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${d.strength || '-'}%</td></tr>`
      ).join('')
    : '';

  const matchRows = matches
    ? matches.map(m =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${m.rank}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5">${m.name}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${m.code}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5">${m.tier}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;font-family:monospace">${m.compatibilityScore}%</td></tr>`
      ).join('')
    : '';

  const m4Summary = m4?.summary || {};

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

  ${report?.m1DeepDive ? `<h2>What You Want</h2><p>${report.m1DeepDive}</p>` : ''}
  ${report?.m3DeepDive ? `<h2>How You Connect</h2><p>${report.m3DeepDive}</p>` : ''}
  ${report?.m4DeepDive ? `<h2>When Things Get Hard</h2><p>${report.m4DeepDive}</p>` : ''}

  ${matchRows ? `
  <h2>Compatibility Rankings</h2>
  <table>
    <thead><tr><th>#</th><th>Persona</th><th>Code</th><th>Tier</th><th>Score</th></tr></thead>
    <tbody>${matchRows}</tbody>
  </table>` : ''}

  ${report?.growthPath ? `<h2>Growth Path</h2><p>${report.growthPath}</p>` : ''}

  <div class="footer">
    <p>RELATE | Relationship Intelligence Platform</p>
    <p>This report draws from Gottman Method, Emotionally Focused Therapy, Attachment Theory, and Internal Family Systems. It is not a diagnostic tool and does not replace licensed therapy.</p>
    <p>Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>`;
}
