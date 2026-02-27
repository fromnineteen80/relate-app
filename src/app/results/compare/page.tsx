'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ComparePage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    // Check for existing couples report
    const stored = localStorage.getItem('relate_couples_report');
    if (stored) {
      setReport(JSON.parse(stored));
      setLoading(false);
      return;
    }

    // Check if both partners' data is available
    const user1Results = localStorage.getItem('relate_results');
    const user2Results = localStorage.getItem('relate_partner_results');

    if (!user1Results || !user2Results) {
      setLoading(false);
      return;
    }

    // Generate the report
    const user1Gender = localStorage.getItem('relate_gender') || 'M';
    const user2Gender = localStorage.getItem('relate_partner_gender') || (user1Gender === 'M' ? 'W' : 'M');

    fetch('/api/couples-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user1: { gender: user1Gender, report: JSON.parse(user1Results) },
        user2: { gender: user2Gender, report: JSON.parse(user2Results) },
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('relate_couples_report', JSON.stringify(data.report));
          setReport(data.report);
        } else {
          setError(data.error || 'Failed to generate report');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Connection error');
        setLoading(false);
      });
  }, []);

  // Mock data generation for testing
  const generateMockReport = useCallback(() => {
    const user1Results = localStorage.getItem('relate_results');
    if (!user1Results) {
      router.push('/assessment');
      return;
    }

    // Create mock partner data by mirroring user1 with slight variations
    const user1 = JSON.parse(user1Results);
    const user1Gender = localStorage.getItem('relate_gender') || 'M';
    const user2Gender = user1Gender === 'M' ? 'W' : 'M';

    // Store mock partner results
    const mockPartner = JSON.parse(JSON.stringify(user1));
    // Vary the partner's data slightly
    if (mockPartner.m3) {
      mockPartner.m3.wantScore = Math.max(0, Math.min(100, (mockPartner.m3.wantScore || 50) + 15));
      mockPartner.m3.offerScore = Math.max(0, Math.min(100, (mockPartner.m3.offerScore || 50) - 10));
    }
    localStorage.setItem('relate_partner_results', JSON.stringify(mockPartner));
    localStorage.setItem('relate_partner_gender', user2Gender);

    setLoading(true);
    fetch('/api/couples-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user1: { gender: user1Gender, report: user1 },
        user2: { gender: user2Gender, report: mockPartner },
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('relate_couples_report', JSON.stringify(data.report));
          setReport(data.report);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <CouplesHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-secondary">Generating your couples report...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col">
        <CouplesHeader />
        <main className="max-w-md mx-auto px-6 py-12 w-full text-center">
          <h2 className="font-serif text-2xl font-semibold mb-4">Couples Compatibility Report</h2>
          <p className="text-secondary mb-6">
            Both partners must complete the assessment before the comparison report is available.
          </p>
          {error && <p className="text-sm text-danger mb-4">{error}</p>}
          <div className="space-y-3">
            <Link href="/invite" className="btn-primary block">Invite Partner</Link>
            <button onClick={generateMockReport} className="btn-secondary block w-full text-xs">
              Preview with Mock Partner Data
            </button>
          </div>
        </main>
      </div>
    );
  }

  const sections = [
    { key: 'overview', label: 'Overview' },
    { key: 'alignment', label: 'Alignment' },
    { key: 'clashes', label: 'Clashes' },
    { key: 'conflict', label: 'Conflict' },
    { key: 'repair', label: 'Repair' },
    { key: 'daily', label: 'Daily Life' },
    { key: 'ceiling', label: 'Potential' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <CouplesHeader />

      {/* Section Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <div className="max-w-3xl mx-auto px-6 flex gap-1">
          {sections.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(i)}
              className={`px-3 py-3 text-xs font-mono whitespace-nowrap transition-colors border-b-2 ${
                activeSection === i ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        {activeSection === 0 && <OverviewSection data={report.overview} />}
        {activeSection === 1 && <AlignmentSection data={report.alignment} overview={report.overview} />}
        {activeSection === 2 && <ClashSection data={report.clashes} overview={report.overview} />}
        {activeSection === 3 && <ConflictSection data={report.conflictChoreography} overview={report.overview} />}
        {activeSection === 4 && <RepairSection data={report.repairCompatibility} />}
        {activeSection === 5 && <DailyLifeSection data={report.dailyLife} />}
        {activeSection === 6 && <CeilingFloorSection data={report.ceilingFloor} />}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-6 border-t border-border">
          <button
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            className="btn-secondary text-sm"
            disabled={activeSection === 0}
          >
            ← Previous
          </button>
          {activeSection < sections.length - 1 ? (
            <button
              onClick={() => setActiveSection(activeSection + 1)}
              className="btn-primary text-sm"
            >
              Next Section →
            </button>
          ) : (
            <Link href="/couples" className="btn-primary text-sm">
              Couples Dashboard →
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

function CouplesHeader() {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-secondary">Couples Report</span>
          <Link href="/results" className="text-xs text-secondary hover:text-foreground">← Results</Link>
        </div>
      </div>
    </header>
  );
}

// ── Section Components ──

function OverviewSection({ data }: { data: any }) {
  if (!data) return <p className="text-secondary">No overview data available.</p>;
  return (
    <div className="space-y-6">
      {/* Pairing header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-right">
            <p className="font-serif text-lg font-semibold">{data.user1?.name}</p>
            <p className="font-mono text-xs text-secondary">{data.user1?.code}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-accent">{data.overallScore}</span>
          </div>
          <div className="text-left">
            <p className="font-serif text-lg font-semibold">{data.user2?.name}</p>
            <p className="font-mono text-xs text-secondary">{data.user2?.code}</p>
          </div>
        </div>
        <p className="font-serif text-xl font-semibold">{data.archetype?.name}</p>
        <p className="text-sm text-secondary mt-1 max-w-lg mx-auto">{data.archetype?.description}</p>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <span className="font-mono text-2xl font-semibold">{data.alignmentPercent}%</span>
          <p className="text-xs text-secondary mt-1">Value Alignment</p>
        </div>
        <div className="card text-center">
          <span className="font-mono text-2xl font-semibold">{data.m3Compat}%</span>
          <p className="text-xs text-secondary mt-1">Connection Fit</p>
        </div>
        <div className="card text-center">
          <span className="font-mono text-2xl font-semibold">{data.m4Compat}%</span>
          <p className="text-xs text-secondary mt-1">Conflict Fit</p>
        </div>
      </div>

      {/* Dimension comparison */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold mb-4">Dimension Comparison</h3>
        <div className="space-y-3">
          {data.dimensionComparisons?.map((dc: any) => (
            <div key={dc.dimension} className="flex items-center gap-3">
              <span className="text-xs text-secondary w-16 capitalize">{dc.dimension}</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs font-mono w-20 text-right truncate">{dc.user1Pole}</span>
                <div className={`w-3 h-3 rounded-full ${dc.aligned ? 'bg-success' : 'bg-warning'}`} />
                <span className="text-xs font-mono w-20 truncate">{dc.user2Pole}</span>
              </div>
              <span className={`text-xs font-mono ${dc.aligned ? 'text-success' : 'text-warning'}`}>
                {dc.aligned ? 'Aligned' : 'Differs'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlignmentSection({ data, overview }: { data: any; overview: any }) {
  if (!data) return <p className="text-secondary">No alignment data available.</p>;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-1">Where You Align</h2>
        <p className="text-sm text-secondary">{data.totalParallels} parallel{data.totalParallels !== 1 ? 's' : ''} found across your profiles</p>
      </div>

      {data.parallels?.length > 0 ? (
        <div className="space-y-3">
          {data.parallels.map((p: any, i: number) => (
            <div key={i} className="card">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 text-sm">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{p.dimension} — {p.type === 'shared_desire' ? 'Shared Desire' : 'Want–Offer Match'}</p>
                  <p className="text-xs text-secondary mt-1">{p.narrative}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 flex-1 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${p.strength}%` }} />
                    </div>
                    <span className="text-xs font-mono text-secondary">{p.strength}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center text-secondary text-sm">
          <p>No direct parallels detected. Your compatibility comes from complementary differences rather than shared poles.</p>
        </div>
      )}

      {/* M3 Connection alignment */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold mb-3">Connection Exchange</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-secondary">{overview?.user1?.name} wants ↔ {overview?.user2?.name} offers</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 flex-1 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${Math.max(0, 100 - data.m3Alignment?.wantGap)}%` }} />
              </div>
              <span className="text-xs font-mono">{data.m3Alignment?.wantGap} gap</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-secondary">{overview?.user2?.name} wants ↔ {overview?.user1?.name} offers</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 flex-1 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${Math.max(0, 100 - data.m3Alignment?.offerGap)}%` }} />
              </div>
              <span className="text-xs font-mono">{data.m3Alignment?.offerGap} gap</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-secondary">{data.m3Alignment?.narrative}</p>
      </div>
    </div>
  );
}

function ClashSection({ data, overview }: { data: any; overview: any }) {
  if (!data) return <p className="text-secondary">No clash data available.</p>;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-1">Where You Clash</h2>
        <p className="text-sm text-secondary">
          {data.totalClashes === 0 ? 'No major clashes detected' : `${data.totalClashes} area${data.totalClashes !== 1 ? 's' : ''} of tension identified`}
        </p>
      </div>

      {data.clashes?.map((c: any, i: number) => (
        <div key={i} className="card">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
              c.severity === 'high' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
            }`}>
              !
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium capitalize">{c.dimension}</p>
                <span className={`text-xs font-mono ${c.severity === 'high' ? 'text-danger' : 'text-warning'}`}>
                  {c.severity}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-secondary mb-2">
                <span>{overview?.user1?.name}: <strong className="text-foreground">{c.user1Pole}</strong> ({c.user1Strength}%)</span>
                <span>vs</span>
                <span>{overview?.user2?.name}: <strong className="text-foreground">{c.user2Pole}</strong> ({c.user2Strength}%)</span>
              </div>
              <p className="text-xs text-secondary">{c.narrative}</p>
            </div>
          </div>
        </div>
      ))}

      {data.connectionTension && (
        <div className="card border-warning">
          <h3 className="font-serif text-sm font-semibold mb-2">Connection Tension</h3>
          <p className="text-xs text-secondary">{data.connectionTension.narrative}</p>
        </div>
      )}

      {data.totalClashes === 0 && (
        <div className="card text-center">
          <p className="text-sm text-secondary">
            Minimal clashes suggests strong baseline compatibility. Focus on maintaining this through continued awareness.
          </p>
        </div>
      )}
    </div>
  );
}

function ConflictSection({ data, overview }: { data: any; overview: any }) {
  if (!data) return <p className="text-secondary">No conflict data available.</p>;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-1">Conflict Choreography</h2>
        <p className="text-sm text-secondary">How you move through disagreements together</p>
      </div>

      {/* Conflict dynamic */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 text-center">
            <p className="text-xs text-secondary">{overview?.user1?.name}</p>
            <p className="font-mono text-sm font-semibold capitalize mt-1">{data.user1Approach}</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-lg font-semibold">{data.dynamic?.label}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-secondary">{overview?.user2?.name}</p>
            <p className="font-mono text-sm font-semibold capitalize mt-1">{data.user2Approach}</p>
          </div>
        </div>
        <p className="text-xs text-secondary">{data.dynamic?.description}</p>
      </div>

      {/* Emotional drivers */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold mb-3">Emotional Drivers</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center p-3 bg-stone-50 rounded-md">
            <p className="text-xs text-secondary">{overview?.user1?.name}</p>
            <p className="font-mono text-sm font-semibold capitalize mt-1">{data.driverAnalysis?.user1Driver}</p>
          </div>
          <div className="text-center p-3 bg-stone-50 rounded-md">
            <p className="text-xs text-secondary">{overview?.user2?.name}</p>
            <p className="font-mono text-sm font-semibold capitalize mt-1">{data.driverAnalysis?.user2Driver}</p>
          </div>
        </div>
        {data.driverAnalysis?.collision && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-warning">Driver Collision</span>
          </div>
        )}
        <p className="text-xs text-secondary">{data.driverAnalysis?.narrative}</p>
      </div>

      {/* Repair preview */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold mb-3">Repair Styles</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-secondary mb-1">Speed</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono capitalize">{data.repair?.user1Speed}</span>
              <span className={`w-2 h-2 rounded-full ${data.repair?.speedMatch ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-xs font-mono capitalize">{data.repair?.user2Speed}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Mode</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono capitalize">{data.repair?.user1Mode}</span>
              <span className={`w-2 h-2 rounded-full ${data.repair?.modeMatch ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-xs font-mono capitalize">{data.repair?.user2Mode}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-secondary">{data.repair?.narrative}</p>
      </div>
    </div>
  );
}

function RepairSection({ data }: { data: any }) {
  if (!data) return <p className="text-secondary">No repair data available.</p>;

  const horsemenLabels: Record<string, string> = {
    criticism: 'Criticism',
    contempt: 'Contempt',
    defensiveness: 'Defensiveness',
    stonewalling: 'Stonewalling',
  };

  const horsemenAntidotes: Record<string, string> = {
    criticism: 'Gentle startup — begin with "I feel..." instead of "You always..."',
    contempt: 'Build a culture of appreciation — express gratitude daily',
    defensiveness: 'Take responsibility — even a small part of the problem',
    stonewalling: 'Self-soothe — take a break and come back within 20 minutes',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-1">Repair Compatibility</h2>
        <p className="text-sm text-secondary">
          Overall risk: <span className={`font-mono ${data.overallRisk === 'high' ? 'text-danger' : data.overallRisk === 'moderate' ? 'text-warning' : 'text-success'}`}>
            {data.overallRisk}
          </span>
        </p>
      </div>

      {/* Gottman horsemen comparison */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold mb-4">Four Horsemen — Combined Risk</h3>
        <div className="space-y-4">
          {data.horsemen?.map((h: any) => (
            <div key={h.horseman}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{horsemenLabels[h.horseman]}</span>
                <span className={`text-xs font-mono ${
                  h.riskLevel === 'high' ? 'text-danger' : h.riskLevel === 'moderate' ? 'text-warning' : 'text-success'
                }`}>{h.riskLevel}</span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1">
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent/60 rounded-full" style={{ width: `${(h.user1Score / 20) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-secondary mt-0.5">Partner 1: {h.user1Score}</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${(h.user2Score / 20) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-secondary mt-0.5">Partner 2: {h.user2Score}</p>
                </div>
              </div>
              {h.riskLevel !== 'low' && (
                <p className="text-[10px] text-secondary mt-1 italic">Antidote: {horsemenAntidotes[h.horseman]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Emotional capacity */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold mb-3">Emotional Capacity</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <span className="font-mono text-2xl font-semibold">{data.capacity?.user1Score}</span>
            <p className="text-xs text-secondary mt-1 capitalize">{data.capacity?.user1Level}</p>
          </div>
          <div className="text-center">
            <span className="font-mono text-2xl font-semibold">{data.capacity?.user2Score}</span>
            <p className="text-xs text-secondary mt-1 capitalize">{data.capacity?.user2Level}</p>
          </div>
        </div>
        <p className="text-xs text-secondary">{data.capacity?.narrative}</p>
      </div>
    </div>
  );
}

function DailyLifeSection({ data }: { data: any }) {
  if (!data) return <p className="text-secondary">No daily life data available.</p>;

  const areaIcons: Record<string, string> = {
    'Daily Connection': '◎',
    'Decision Making': '◈',
    'Social Life': '◉',
    'Under Stress': '◊',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-1">Daily Life Preview</h2>
        <p className="text-sm text-secondary">How your profiles play out in everyday situations</p>
      </div>

      {data.scenarios?.map((s: any, i: number) => (
        <div key={i} className="card">
          <div className="flex items-start gap-3">
            <span className="text-lg">{areaIcons[s.area] || '·'}</span>
            <div>
              <p className="font-serif text-sm font-semibold mb-1">{s.area}</p>
              <p className="text-xs text-secondary">{s.dynamic}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CeilingFloorSection({ data }: { data: any }) {
  if (!data) return <p className="text-secondary">No potential data available.</p>;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-1">Your Ceiling & Floor</h2>
        <p className="text-sm text-secondary">The range of your relationship&apos;s potential</p>
      </div>

      {/* Visual range */}
      <div className="card">
        <div className="relative h-32 mb-4">
          <div className="absolute left-0 right-0 top-1/2 h-2 bg-stone-200 rounded-full -translate-y-1/2">
            {/* Floor to ceiling range */}
            <div
              className="absolute h-full bg-gradient-to-r from-warning/40 via-accent/40 to-success/40 rounded-full"
              style={{ left: `${data.floor}%`, width: `${data.ceiling - data.floor}%` }}
            />
          </div>
          {/* Floor marker */}
          <div className="absolute top-0" style={{ left: `${data.floor}%`, transform: 'translateX(-50%)' }}>
            <div className="text-center">
              <p className="font-mono text-xs text-warning">{data.floor}</p>
              <p className="text-[10px] text-secondary">Floor</p>
            </div>
            <div className="w-0.5 h-8 bg-warning mx-auto mt-1" />
          </div>
          {/* Current marker */}
          <div className="absolute top-0" style={{ left: `${data.current}%`, transform: 'translateX(-50%)' }}>
            <div className="text-center">
              <p className="font-mono text-sm font-bold text-accent">{data.current}</p>
              <p className="text-[10px] text-secondary">Current</p>
            </div>
            <div className="w-0.5 h-8 bg-accent mx-auto mt-1" />
          </div>
          {/* Ceiling marker */}
          <div className="absolute top-0" style={{ left: `${Math.min(data.ceiling, 95)}%`, transform: 'translateX(-50%)' }}>
            <div className="text-center">
              <p className="font-mono text-xs text-success">{data.ceiling}</p>
              <p className="text-[10px] text-secondary">Ceiling</p>
            </div>
            <div className="w-0.5 h-8 bg-success mx-auto mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <span className="font-mono text-lg font-semibold text-success">+{data.growthPotential}</span>
            <p className="text-xs text-secondary">Growth Potential</p>
          </div>
          <div>
            <span className="font-mono text-lg font-semibold text-warning">-{data.riskExposure}</span>
            <p className="text-xs text-secondary">Risk Exposure</p>
          </div>
        </div>
      </div>

      {/* Ceiling factors */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold mb-3 text-success">What Raises Your Ceiling</h3>
        <ul className="space-y-2">
          {data.ceilingFactors?.map((f: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span className="text-success mt-0.5">↑</span>
              <span className="text-secondary">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Floor factors */}
      <div className="card">
        <h3 className="font-serif text-sm font-semibold mb-3 text-warning">What Defines Your Floor</h3>
        <ul className="space-y-2">
          {data.floorFactors?.map((f: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span className="text-warning mt-0.5">↓</span>
              <span className="text-secondary">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Narrative */}
      <div className="card bg-stone-50">
        <p className="text-sm text-secondary italic">{data.narrative}</p>
      </div>
    </div>
  );
}
