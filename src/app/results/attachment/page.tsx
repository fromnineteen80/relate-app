'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';
import { cleanProse } from '@/lib/prose';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Style display names ──────────────────────────────────────────────
const Q1_STYLE_LABELS: Record<number, { title: string; subtitle: string; description: string }> = {
  1: {
    title: 'The Invisible Foundation',
    subtitle: 'Chronic, Caregiver, Unresolved',
    description: 'Your earliest experiences of love were not defined by a single event but by an atmosphere. What you learned about closeness came slowly, through the emotional weather of your household, and that learning still shapes how you read every relationship you enter.',
  },
  2: {
    title: 'The Earned Ground',
    subtitle: 'Chronic, Caregiver, Repaired',
    description: 'The conditions you grew up in were difficult, but something came along that changed what you believed was possible. A relationship, a period of genuine self-examination, or a corrective experience that gave you evidence against the original conclusions your body drew about love.',
  },
  3: {
    title: 'The Slow Erosion',
    subtitle: 'Chronic, Romantic, Unresolved',
    description: 'You came into adult relationships with a functional template, and something wore it down. Not a single betrayal but a gradual accumulation of evidence that changed what you were willing to risk. That accumulation has not yet been fully processed.',
  },
  4: {
    title: 'The Clear-Eyed Survivor',
    subtitle: 'Chronic, Romantic, Repaired',
    description: 'You have done the work. The erosion happened, you examined it, and you emerged with a clarity about your own patterns that most people never reach. The risk now is that understanding becomes a sophisticated substitute for the thing it describes.',
  },
  5: {
    title: 'The Vigilant Heart',
    subtitle: 'Acute, Caregiver, Unresolved',
    description: 'Something specific happened with someone who was supposed to be safe, and it was never resolved. Your capacity to function despite what you carry is real and impressive. It is also expensive, and the cost shows up in the relationships that matter most.',
  },
  6: {
    title: 'The Open Wound',
    subtitle: 'Acute, Romantic, Unresolved',
    description: 'A betrayal, a sudden loss, an ending without explanation. You know what happened. You know what it did. Knowing has not yet separated the wound from the present enough for you to stop responding to new people through the lens of what that person did.',
  },
};

const Q2_STYLE_LABELS: Record<string, { title: string; description: string }> = {
  fear_of_abandonment: {
    title: 'Fear of Abandonment',
    description: 'When the relationship feels uncertain, the emotion underneath everything is the fear of disappearance. Not conflict, not criticism. Gone. Your system is built to detect the earliest signals of withdrawal, and it is often right. It is also often responding before the other person has consciously decided anything.',
  },
  shame: {
    title: 'Shame',
    description: 'The emotion underneath your response to relational threat is not the fear of being left. It is the fear of being truly seen and found inadequate. Intimacy increases the threat rather than decreasing it, because closeness brings someone nearer to the verdict you have been organizing your entire relational life around preventing.',
  },
  contempt: {
    title: 'Contempt',
    description: 'When the relationship feels threatening, your system locates the problem in the other person. High standards that function as a protection system. The contempt is what happens when someone who genuinely needs connection is unable to tolerate the vulnerability that needing it requires.',
  },
  grief: {
    title: 'Grief',
    description: 'You carry love and loss simultaneously. Not depression, but a quality of pre-nostalgia that colors the way you hold every relationship. You love people with an awareness of losing them that produces a tenderness partners find profound and, eventually, exhausting.',
  },
  rage: {
    title: 'Rage',
    description: 'The emotion underneath is not anger exactly. It is a sovereignty response. When the relationship activates a sense of powerlessness, being at the mercy of another person\'s choices, something in you rises to meet it with an intensity that surprises even you. Underneath that intensity is usually fear or grief that learned it was not safe to come forward directly.',
  },
};

const Q3_STYLE_LABELS: Record<string, { title: string; description: string }> = {
  intellectualization: {
    title: 'Intellectualization',
    description: 'When relational ambiguity arrives, you move it from the emotional register into the analytical register as quickly as possible. You research, theorize, build frameworks. The understanding you produce is genuine. It also operates in a different system from the one running the behavior.',
  },
  impulsive_action: {
    title: 'Impulsive Action',
    description: 'You eliminate uncertainty by forcing a resolution. The text gets sent, the call gets made, the conversation gets pushed to its conclusion, not because the moment calls for it but because the alternative, sitting with the not-knowing, is more intolerable than any possible consequence.',
  },
  consensus_seeking: {
    title: 'Consensus Seeking',
    description: 'You cannot act on your own perception until someone else confirms it. The friend gets called, the conversation gets replayed, the read gets checked. This is not indecision. It is a specific form of self-distrust that developed when your internal signal was unreliable or unsafe to follow.',
  },
  silence_withdrawal: {
    title: 'Silence and Withdrawal',
    description: 'You go quiet. Not as punishment, not as strategy, but because it is the only regulation response available to you. You cannot find your own position while standing inside the other person\'s emotional field. The silence is you trying to locate yourself, and it rarely comes with an explanation.',
  },
  catastrophic_projection: {
    title: 'Catastrophic Forward Projection',
    description: 'Your mind moves immediately to the worst resolved endpoint. A fully rendered version of how this relationship ends badly, based on accurate pattern recognition from past experience. The projection becomes the reality you are operating inside before any evidence justifies it.',
  },
  dissociative_backward_anchoring: {
    title: 'Dissociative Backward Anchoring',
    description: 'When the present relationship becomes uncertain, your mind moves to a past one. You are partly somewhere else, measuring this person against a template from a relationship that ended, making decisions with reference to a history the current partner cannot see or account for.',
  },
};

// ── Report section headings ──────────────────────────────────────────
const REPORT_SECTIONS: { key: string; heading: string }[] = [
  { key: 'relationalHistory', heading: 'Relational History' },
  { key: 'emotionUnderneath', heading: 'The Emotion Underneath' },
  { key: 'howYouNavigateUncertainty', heading: 'How You Navigate Uncertainty' },
  { key: 'personaInContext', heading: 'Your Persona in This Context' },
  { key: 'thePortrait', heading: 'The Portrait' },
  { key: 'whatThisMeansForPartnership', heading: 'What This Means for Partnership' },
  { key: 'theGrowingEdge', heading: 'The Growing Edge' },
];

// ── Helpers ──────────────────────────────────────────────────────────
function sectionContent(report: any, key: string): string | null {
  // Support both flat shape ({ relationalHistory: "..." }) and
  // nested shape ({ sections: { relationalHistory: { content: "..." } } })
  if (report[key] && typeof report[key] === 'string') return report[key];
  if (report.sections?.[key]?.content) return report.sections[key].content;
  return null;
}

function growthContent(growth: any, key: string): string | null {
  if (growth[key] && typeof growth[key] === 'string') return growth[key];
  if (growth.parts?.[key]?.content) return growth.parts[key].content;
  return null;
}

// ── Main page component ─────────────────────────────────────────────
export default function AttachmentResultsPage() {
  const [results, setResults] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [baseResults, setBaseResults] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_attachment_results');
    const storedReport = localStorage.getItem('relate_attachment_report');
    const storedGrowth = localStorage.getItem('relate_attachment_growth');
    const base = localStorage.getItem('relate_results');

    if (stored) { try { setResults(JSON.parse(stored)); } catch { /* */ } }
    if (storedReport) { try { setReport(JSON.parse(storedReport)); } catch { /* */ } }
    if (storedGrowth) { try { setGrowth(JSON.parse(storedGrowth)); } catch { /* */ } }
    if (base) { try { setBaseResults(JSON.parse(base)); } catch { /* */ } }
  }, []);

  // ── Generate report from API ──
  async function handleGenerateReport() {
    if (!results || !baseResults) return;
    setGenerating(true);
    setGenError(null);

    try {
      const persona = baseResults.persona;
      const res = await fetch('/api/attachment-style/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachmentResults: results,
          assessmentResults: baseResults,
          personaMetadata: {
            name: persona?.name,
            code: persona?.code,
            attachmentType: baseResults.individualCompatibility?.attachment?.style,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
        localStorage.setItem('relate_attachment_report', JSON.stringify(data.report));
      } else {
        setGenError(data.error || 'Report generation failed.');
      }
    } catch (err: any) {
      setGenError(err.message || 'Something went wrong.');
    } finally {
      setGenerating(false);
    }
  }

  // ── SubNav items for page sections ──
  const navItems = [
    { id: 'bp-style', label: 'Style', href: '#style', show: !!results },
    { id: 'bp-patterns', label: 'Patterns', href: '#patterns', show: !!results },
    { id: 'bp-report', label: 'Report', href: '#report', show: !!results },
    { id: 'bp-growth', label: 'Growth', href: '#growth', show: !!growth },
  ];

  // ── No attachment style results: empty state ──
  if (!results) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="max-w-3xl mx-auto px-6 py-12 w-full">
          <div className="card text-center py-12">
            <h1 className="font-serif text-2xl font-semibold mb-3">Attachment Style</h1>
            <p className="text-sm text-secondary max-w-lg mx-auto mb-6">
              Complete the Attachment Style assessment to see your results here.
            </p>
            <Link href="/attachment-style" className="btn-primary text-sm">
              Go to Attachment Style
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // ── Resolve quadrant data ──
  const q1 = results.quadrant1;
  const q2 = results.quadrant2;
  const q3 = results.quadrant3;
  const q4 = results.quadrant4;
  const persona = baseResults?.persona;

  const q1Info = Q1_STYLE_LABELS[q1?.patternId] || { title: q1?.patternName || 'Unknown', subtitle: '', description: '' };
  const q2Info = Q2_STYLE_LABELS[q2?.patternId] || { title: q2?.patternName || 'Unknown', description: '' };
  const q3Info = Q3_STYLE_LABELS[q3?.patternId] || { title: q3?.patternName || 'Unknown', description: '' };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav items={navItems} />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">

        {/* ═══════════════════════════════════════════════
            PAGE HEADER
        ═══════════════════════════════════════════════ */}
        <div className="mb-10">
          <span className="text-[10px] text-secondary uppercase tracking-widest">Attachment Style</span>
          <h1 className="font-serif text-3xl font-semibold mt-1 mb-2">Your Attachment Style</h1>
          {persona && (
            <p className="text-sm text-secondary">
              {persona.name}
              {baseResults?.individualCompatibility?.attachment?.style
                ? ` \u00b7 ${baseResults.individualCompatibility.attachment.style}`
                : ''}
            </p>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            LAYER 1: FOUR PATTERN NAMES CARD
        ═══════════════════════════════════════════════ */}
        <section id="style" className="mb-12">
          <div className="card">
            <h2 className="font-serif text-xl font-semibold mb-5">Your Attachment Style</h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between py-2 border-b border-border">
                <div>
                  <span className="text-[10px] text-secondary uppercase tracking-widest">Relational History</span>
                  <p className="font-serif text-sm font-semibold mt-0.5">{q1Info.title}</p>
                </div>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-border">
                <div>
                  <span className="text-[10px] text-secondary uppercase tracking-widest">Trigger Emotion</span>
                  <p className="font-serif text-sm font-semibold mt-0.5">{q2Info.title}</p>
                </div>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-border">
                <div>
                  <span className="text-[10px] text-secondary uppercase tracking-widest">Decision Architecture</span>
                  <p className="font-serif text-sm font-semibold mt-0.5">{q3Info.title}</p>
                </div>
              </div>
              <div className="flex items-start justify-between py-2">
                <div>
                  <span className="text-[10px] text-secondary uppercase tracking-widest">Persona in Practice</span>
                  <p className="font-serif text-sm font-semibold mt-0.5">
                    {persona?.name || 'Your Persona'}
                    {q4?.compositeDescriptor ? ` \u2014 ${q4.compositeDescriptor}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            LAYER 2: SHORT PATTERN SUMMARIES
        ═══════════════════════════════════════════════ */}
        <section id="patterns" className="mb-12 space-y-6">
          <h2 className="font-serif text-xl font-semibold">Your Patterns</h2>

          {/* Q1 Summary */}
          <div className="card">
            <span className="text-[10px] text-secondary uppercase tracking-widest">Relational History</span>
            <h3 className="font-serif text-base font-semibold mt-1 mb-2">{q1Info.title}</h3>
            <p className="text-sm text-secondary leading-relaxed">{q1Info.description}</p>
          </div>

          {/* Q2 Summary */}
          <div className="card">
            <span className="text-[10px] text-secondary uppercase tracking-widest">Trigger Emotion</span>
            <h3 className="font-serif text-base font-semibold mt-1 mb-2">{q2Info.title}</h3>
            <p className="text-sm text-secondary leading-relaxed">{q2Info.description}</p>
          </div>

          {/* Q3 Summary */}
          <div className="card">
            <span className="text-[10px] text-secondary uppercase tracking-widest">Decision Architecture</span>
            <h3 className="font-serif text-base font-semibold mt-1 mb-2">{q3Info.title}</h3>
            <p className="text-sm text-secondary leading-relaxed">{q3Info.description}</p>
          </div>

          {/* Q4 Summary */}
          <div className="card">
            <span className="text-[10px] text-secondary uppercase tracking-widest">Persona in Practice</span>
            <h3 className="font-serif text-base font-semibold mt-1 mb-2">
              {persona?.name || 'Your Persona'}
              {q4?.compositeDescriptor ? ` \u2014 ${q4.compositeDescriptor}` : ''}
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              {q4?.compositeDescriptor
                ? `Your persona operates as ${q4.compositeDescriptor} in romantic contexts. This is not who you are in every setting, but the version of you that appears when the relational stakes are high enough to activate your attachment system.`
                : 'Your persona in the context of attachment and dating, shaped by the interaction of your history, emotion, and decision architecture.'}
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            LAYER 3: FULL REPORT
        ═══════════════════════════════════════════════ */}
        <section id="report" className="mb-12">
          <h2 className="font-serif text-xl font-semibold mb-6">Your Full Portrait</h2>

          {report ? (
            <div className="space-y-8">
              {REPORT_SECTIONS.map(({ key, heading }) => {
                const content = sectionContent(report, key);
                if (!content) return null;
                return (
                  <div key={key}>
                    <h3 className="font-serif text-lg font-semibold mb-3">{heading}</h3>
                    {cleanProse(content).split('\n\n').map((paragraph: string, i: number) => (
                      <p key={i} className="text-sm text-secondary leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-sm text-secondary mb-4">
                Your Attachment Style has been scored. Generate your full report to see a flowing narrative portrait
                of your relational patterns.
              </p>
              {genError && (
                <p className="text-sm text-warning mb-3">{genError}</p>
              )}
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="btn-primary text-sm"
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════
            GROWTH PLAN
        ═══════════════════════════════════════════════ */}
        {growth && (
          <section id="growth" className="mb-12">
            <h2 className="font-serif text-xl font-semibold mb-6">Your Growth Plan</h2>
            <div className="space-y-8">

              {/* Part 1: What Attachment Style Adds */}
              {growthContent(growth, 'whatDeepDiveAdds') && (
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-3">
                    What the Attachment Style Assessment Adds to Your RELATE Portrait
                  </h3>
                  {cleanProse(growthContent(growth, 'whatDeepDiveAdds')!).split('\n\n').map((p: string, i: number) => (
                    <p key={i} className="text-sm text-secondary leading-relaxed mb-3">{p}</p>
                  ))}
                </div>
              )}

              {/* Part 2: Reflection Prompts */}
              {growthContent(growth, 'reflectionPrompts') && (
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-3">Reflection Prompts</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {cleanProse(growthContent(growth, 'reflectionPrompts')!)
                      .split('\n')
                      .filter((line: string) => line.trim())
                      .map((line: string, i: number) => (
                        <li key={i} className="text-sm text-secondary leading-relaxed">
                          {line.replace(/^\d+[\.\)]\s*/, '')}
                        </li>
                      ))}
                  </ol>
                </div>
              )}

              {/* Part 3: The Specific Work */}
              {growthContent(growth, 'specificWork') && (
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-3">The Specific Work</h3>
                  {cleanProse(growthContent(growth, 'specificWork')!).split('\n\n').map((p: string, i: number) => (
                    <p key={i} className="text-sm text-secondary leading-relaxed mb-3">{p}</p>
                  ))}
                </div>
              )}

              {/* Part 4: What to Watch For */}
              {growthContent(growth, 'whatToWatchFor') && (
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-3">What to Watch For</h3>
                  {cleanProse(growthContent(growth, 'whatToWatchFor')!).split('\n\n').map((p: string, i: number) => (
                    <p key={i} className="text-sm text-secondary leading-relaxed mb-3">{p}</p>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href="/results" className="text-xs text-accent hover:underline">
            &larr; Back to Results
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
