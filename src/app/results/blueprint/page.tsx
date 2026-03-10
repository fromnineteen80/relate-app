'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubNav } from '@/components/SubNav';
import { Icon } from '@/components/Icon';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Profile display names ──
const Q1_PROFILE_LABELS: Record<number, { title: string; subtitle: string; description: string }> = {
  1: {
    title: 'The Invisible Foundation',
    subtitle: 'Chronic, Caregiver, Unresolved',
    description: 'Your earliest experiences of love were not defined by a single event but by an atmosphere. What you learned about closeness came slowly, through the emotional weather of your household, and that learning still shapes how you read every relationship you enter.'
  },
  2: {
    title: 'The Earned Ground',
    subtitle: 'Chronic, Caregiver, Repaired',
    description: 'The conditions you grew up in were difficult, but something came along that changed what you believed was possible. A relationship, a period of genuine self-examination, or a corrective experience that gave you evidence against the original conclusions your body drew about love.'
  },
  3: {
    title: 'The Slow Erosion',
    subtitle: 'Chronic, Romantic, Unresolved',
    description: 'You came into adult relationships with a functional template, and something wore it down. Not a single betrayal but a gradual accumulation of evidence that changed what you were willing to risk. That accumulation has not yet been fully processed.'
  },
  4: {
    title: 'The Clear-Eyed Survivor',
    subtitle: 'Chronic, Romantic, Repaired',
    description: 'You have done the work. The erosion happened, you examined it, and you emerged with a clarity about your own patterns that most people never reach. The risk now is that understanding becomes a sophisticated substitute for the thing it describes.'
  },
  5: {
    title: 'The Vigilant Heart',
    subtitle: 'Acute, Caregiver, Unresolved',
    description: 'Something specific happened with someone who was supposed to be safe, and it was never resolved. Your capacity to function despite what you carry is real and impressive. It is also expensive, and the cost shows up in the relationships that matter most.'
  },
  6: {
    title: 'The Open Wound',
    subtitle: 'Acute, Romantic, Unresolved',
    description: 'A betrayal, a sudden loss, an ending without explanation. You know what happened. You know what it did. Knowing has not yet separated the wound from the present enough for you to stop responding to new people through the lens of what that person did.'
  },
};

const Q2_PROFILE_LABELS: Record<string, { title: string; description: string }> = {
  fear_of_abandonment: {
    title: 'Fear of Abandonment',
    description: 'When the relationship feels uncertain, the emotion underneath everything is the fear of disappearance. Not conflict, not criticism. Gone. Your system is built to detect the earliest signals of withdrawal, and it is often right. It is also often responding before the other person has consciously decided anything.'
  },
  shame: {
    title: 'Shame',
    description: 'The emotion underneath your response to relational threat is not the fear of being left. It is the fear of being truly seen and found inadequate. Intimacy increases the threat rather than decreasing it, because closeness brings someone nearer to the verdict you have been organizing your entire relational life around preventing.'
  },
  contempt: {
    title: 'Contempt',
    description: 'When the relationship feels threatening, your system locates the problem in the other person. High standards that function as a protection system. The contempt is what happens when someone who genuinely needs connection is unable to tolerate the vulnerability that needing it requires.'
  },
  grief: {
    title: 'Grief',
    description: 'You carry love and loss simultaneously. Not depression, but a quality of pre-nostalgia that colors the way you hold every relationship. You love people with an awareness of losing them that produces a tenderness partners find profound and, eventually, exhausting.'
  },
  rage: {
    title: 'Rage',
    description: 'The emotion underneath is not anger exactly. It is a sovereignty response. When the relationship activates a sense of powerlessness, being at the mercy of another person\'s choices, something in you rises to meet it with an intensity that surprises even you. Underneath that intensity is usually fear or grief that learned it was not safe to come forward directly.'
  },
};

const Q3_PROFILE_LABELS: Record<string, { title: string; description: string }> = {
  intellectualization: {
    title: 'Intellectualization',
    description: 'When relational ambiguity arrives, you move it from the emotional register into the analytical register as quickly as possible. You research, theorize, build frameworks. The understanding you produce is genuine. It also operates in a different system from the one running the behavior.'
  },
  impulsive_action: {
    title: 'Impulsive Action',
    description: 'You eliminate uncertainty by forcing a resolution. The text gets sent, the call gets made, the conversation gets pushed to its conclusion, not because the moment calls for it but because the alternative, sitting with the not-knowing, is more intolerable than any possible consequence.'
  },
  consensus_seeking: {
    title: 'Consensus Seeking',
    description: 'You cannot act on your own perception until someone else confirms it. The friend gets called, the conversation gets replayed, the read gets checked. This is not indecision. It is a specific form of self-distrust that developed when your internal signal was unreliable or unsafe to follow.'
  },
  silence_withdrawal: {
    title: 'Silence and Withdrawal',
    description: 'You go quiet. Not as punishment, not as strategy, but because it is the only regulation response available to you. You cannot find your own position while standing inside the other person\'s emotional field. The silence is you trying to locate yourself, and it rarely comes with an explanation.'
  },
  catastrophic_projection: {
    title: 'Catastrophic Forward Projection',
    description: 'Your mind moves immediately to the worst resolved endpoint. A fully rendered version of how this relationship ends badly, based on accurate pattern recognition from past experience. The projection becomes the reality you are operating inside before any evidence justifies it.'
  },
  dissociative_backward_anchoring: {
    title: 'Dissociative Backward Anchoring',
    description: 'When the present relationship becomes uncertain, your mind moves to a past one. You are partly somewhere else, measuring this person against a template from a relationship that ended, making decisions with reference to a history the current partner cannot see or account for.'
  },
};

// ── Confidence badge ──
function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-secondary';
  return <span className={`font-mono text-xs ${color}`}>{pct}% confidence</span>;
}

// ── Axis bar ──
function AxisBar({ label, value, low, high }: { label: string; value: number; low: string; high: string }) {
  const pct = Math.round(((value - 1) / 4) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-secondary uppercase tracking-wider">{label}</span>
        <span className="font-mono text-xs text-accent">{value.toFixed(1)}/5</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-secondary">{low}</span>
        <span className="text-[10px] text-secondary">{high}</span>
      </div>
    </div>
  );
}

export default function BlueprintResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [baseResults, setBaseResults] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Load Blueprint results
    const stored = localStorage.getItem('relate_blueprint_results');
    const storedReport = localStorage.getItem('relate_blueprint_report');
    const storedGrowth = localStorage.getItem('relate_blueprint_growth');
    const base = localStorage.getItem('relate_results');

    if (!stored) {
      // No Blueprint results yet, show the landing state
      if (base) {
        try { setBaseResults(JSON.parse(base)); } catch { /* */ }
      }
      return;
    }

    try { setResults(JSON.parse(stored)); } catch { /* */ }
    if (storedReport) { try { setReport(JSON.parse(storedReport)); } catch { /* */ } }
    if (storedGrowth) { try { setGrowth(JSON.parse(storedGrowth)); } catch { /* */ } }
    if (base) { try { setBaseResults(JSON.parse(base)); } catch { /* */ } }
  }, []);

  const navSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'History' },
    { id: 'emotion', label: 'Emotion' },
    { id: 'decisions', label: 'Decisions' },
    { id: 'persona', label: 'Persona' },
    ...(results?.emergentPattern ? [{ id: 'pattern', label: 'Pattern' }] : []),
    ...(report ? [{ id: 'report', label: 'Full Report' }] : []),
    ...(growth ? [{ id: 'growth', label: 'Growth' }] : []),
  ];

  // ── No results yet: show the entry point ──
  if (!results) {
    const hasCompletedAssessment = baseResults?.persona && baseResults?.individualCompatibility?.attachment;

    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="max-w-3xl mx-auto px-6 py-12 w-full">
          <div className="card text-center py-12">
            <Icon name="psychology" size={48} className="text-accent mb-4" />
            <h1 className="font-serif text-2xl font-semibold mb-3">Dating Blueprint</h1>
            <p className="explainer max-w-lg mx-auto mb-6">
              A deep psychological portrait of how you love, what drives your relational behavior under pressure,
              and where your patterns are costing you something they do not have to cost.
              Built on your RELATE persona and attachment type. Takes 25 to 35 minutes.
            </p>
            {hasCompletedAssessment ? (
              <p className="text-sm text-secondary">
                Your RELATE assessment is complete. The Blueprint assessment will be available here
                once the Blueprint session is built into the assessment flow.
              </p>
            ) : (
              <div>
                <p className="text-sm text-secondary mb-4">Complete all five modules of your RELATE assessment first.</p>
                <Link href="/assessment" className="btn-primary text-sm">Go to Assessment</Link>
              </div>
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // ── Main results display ──
  const q1 = results.quadrant1;
  const q2 = results.quadrant2;
  const q3 = results.quadrant3;
  const q4 = results.quadrant4;
  const pattern = results.emergentPattern;
  const attachment = baseResults?.individualCompatibility?.attachment;
  const persona = baseResults?.persona;

  const q1Info = Q1_PROFILE_LABELS[q1.profileId] || { title: q1.profileName, subtitle: '', description: '' };
  const q2Info = Q2_PROFILE_LABELS[q2.profileId] || { title: q2.profileName, description: '' };
  const q3Info = Q3_PROFILE_LABELS[q3.profileId] || { title: q3.profileName, description: '' };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">Dating Blueprint</span>
          <h1 className="font-serif text-3xl font-semibold mt-1 mb-2">Your Relational Portrait</h1>
          {persona && (
            <p className="text-sm text-secondary">
              {persona.name} {attachment ? `\u00b7 ${attachment.style}` : ''}
            </p>
          )}
        </div>

        {/* Section nav */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-border">
          {navSections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`text-xs font-mono whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${
                activeSection === s.id
                  ? 'bg-accent text-white'
                  : 'bg-stone-100 text-secondary hover:bg-stone-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            OVERVIEW
        ══════════════════════════════════════════════════ */}
        {activeSection === 'overview' && (
          <div className="space-y-4">
            {/* Four Quadrant Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Q1 Card */}
              <button onClick={() => setActiveSection('history')} className="card text-left hover:border-accent transition-colors">
                <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Quadrant One</span>
                <h3 className="font-serif text-base font-semibold mt-1">{q1Info.title}</h3>
                <p className="text-xs text-secondary mt-1">{q1Info.subtitle}</p>
                <ConfidenceBadge value={q1.confidence} />
              </button>

              {/* Q2 Card */}
              <button onClick={() => setActiveSection('emotion')} className="card text-left hover:border-accent transition-colors">
                <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Quadrant Two</span>
                <h3 className="font-serif text-base font-semibold mt-1">{q2Info.title}</h3>
                <p className="text-xs text-secondary mt-1">Primary trigger emotion</p>
                <ConfidenceBadge value={q2.confidence} />
              </button>

              {/* Q3 Card */}
              <button onClick={() => setActiveSection('decisions')} className="card text-left hover:border-accent transition-colors">
                <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Quadrant Three</span>
                <h3 className="font-serif text-base font-semibold mt-1">{q3Info.title}</h3>
                <p className="text-xs text-secondary mt-1">Decision mode under pressure</p>
                <ConfidenceBadge value={q3.confidence} />
              </button>

              {/* Q4 Card */}
              <button onClick={() => setActiveSection('persona')} className="card text-left hover:border-accent transition-colors">
                <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Quadrant Four</span>
                <h3 className="font-serif text-base font-semibold mt-1">{persona?.name || 'Your Persona'} in Practice</h3>
                <p className="text-xs text-secondary mt-1 capitalize">{q4.compositeDescriptor}</p>
                <ConfidenceBadge value={q4.confidence} />
              </button>
            </div>

            {/* Emergent Pattern Card */}
            {pattern && (
              <div className="card border-accent">
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Emergent Pattern Detected</span>
                <h3 className="font-serif text-lg font-semibold mt-1 mb-2">{pattern.patternName}</h3>
                <p className="text-sm text-secondary leading-relaxed">{pattern.synthesisFrame}</p>
              </div>
            )}

            {/* Attachment Integration */}
            {attachment && (
              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <Icon name="shield" size={20} className="text-accent" />
                  <div>
                    <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">RELATE Attachment Type</span>
                    <h3 className="font-serif text-base font-semibold capitalize">{attachment.style}</h3>
                  </div>
                </div>
                <p className="text-sm text-secondary leading-relaxed mb-4">
                  Your attachment type describes the shape of how you connect. The Blueprint describes what is inside that shape,
                  the specific history, emotion, and decision architecture that makes your version of {attachment.style} attachment
                  different from anyone else who shares the same type.
                </p>
                {attachment.description && (
                  <p className="text-xs text-secondary border-t border-border pt-3">{attachment.description}</p>
                )}
              </div>
            )}

            {/* Report & Growth Access */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {report && (
                <button onClick={() => setActiveSection('report')} className="card text-left hover:border-accent transition-colors">
                  <Icon name="article" size={24} className="text-accent mb-2" />
                  <h3 className="font-serif text-sm font-semibold">Full Report</h3>
                  <p className="text-xs text-secondary mt-1">Your complete relational portrait in seven sections</p>
                </button>
              )}
              {growth && (
                <button onClick={() => setActiveSection('growth')} className="card text-left hover:border-accent transition-colors">
                  <Icon name="trending_up" size={24} className="text-accent mb-2" />
                  <h3 className="font-serif text-sm font-semibold">Growth Plan</h3>
                  <p className="text-xs text-secondary mt-1">Personalized reflection prompts and experiments</p>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            QUADRANT ONE: RELATIONAL HISTORY
        ══════════════════════════════════════════════════ */}
        {activeSection === 'history' && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">Quadrant One: Relational History</span>
              <h2 className="font-serif text-2xl font-semibold mt-1 mb-1">{q1Info.title}</h2>
              <p className="text-xs text-secondary mb-1">{q1Info.subtitle}</p>
              <ConfidenceBadge value={q1.confidence} />
            </div>

            <div className="card">
              <p className="text-sm text-secondary leading-relaxed">{q1Info.description}</p>
            </div>

            <div className="card">
              <h3 className="font-serif text-sm font-semibold mb-4">Dimension Scores</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-secondary">Disruption Character</span>
                  <span className="font-mono text-xs font-semibold capitalize">{q1.dimensions.disruption.value}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-secondary">Source Figure</span>
                  <span className="font-mono text-xs font-semibold capitalize">{q1.dimensions.source.value}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-secondary">Repair History</span>
                  <span className="font-mono text-xs font-semibold capitalize">{q1.dimensions.repair.value}</span>
                </div>
              </div>
            </div>

            {/* Cross-quadrant connection */}
            {q2 && (
              <div className="card bg-stone-50">
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Cross-Quadrant Connection</span>
                <p className="text-sm text-secondary leading-relaxed mt-2">
                  Your relational history ({q1Info.subtitle.toLowerCase()}) explains why {q2Info.title.toLowerCase()} is
                  the emotion your system defaults to under relational threat. The history shaped the conclusion, and the
                  emotion is that conclusion running in real time.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            QUADRANT TWO: TRIGGER EMOTION
        ══════════════════════════════════════════════════ */}
        {activeSection === 'emotion' && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">Quadrant Two: The Emotion Underneath</span>
              <h2 className="font-serif text-2xl font-semibold mt-1 mb-1">{q2Info.title}</h2>
              <ConfidenceBadge value={q2.confidence} />
            </div>

            <div className="card">
              <p className="text-sm text-secondary leading-relaxed">{q2Info.description}</p>
            </div>

            {/* Emotion scores breakdown */}
            {q2.emotionScores && (
              <div className="card">
                <h3 className="font-serif text-sm font-semibold mb-4">Emotion Signal Strength</h3>
                {Object.entries(q2.emotionScores as Record<string, number>)
                  .sort((a, b) => b[1] - a[1])
                  .map(([emotion, score]) => {
                    const maxScore = Math.max(...Object.values(q2.emotionScores as Record<string, number>));
                    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                    const isPrimary = emotion === q2.profileId;
                    return (
                      <div key={emotion} className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs capitalize ${isPrimary ? 'font-semibold text-accent' : 'text-secondary'}`}>
                            {emotion.replace(/_/g, ' ')}
                          </span>
                          <span className="font-mono text-[10px] text-secondary">{score}</span>
                        </div>
                        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isPrimary ? 'bg-accent' : 'bg-stone-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}

            {/* Attachment integration */}
            {attachment && (
              <div className="card bg-stone-50">
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest">What This Means for Your Attachment</span>
                <p className="text-sm text-secondary leading-relaxed mt-2">
                  Your {attachment.style} attachment style describes the behavioral pattern. {q2Info.title} is the emotion
                  running underneath that pattern. Two people with the same attachment type but different trigger emotions
                  behave completely differently in conflict and need completely different things from a partner.
                  Your specific combination, {attachment.style} attachment driven by {q2Info.title.toLowerCase()},
                  produces a relational signature that is yours alone.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            QUADRANT THREE: DECISION ARCHITECTURE
        ══════════════════════════════════════════════════ */}
        {activeSection === 'decisions' && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">Quadrant Three: Decision Architecture</span>
              <h2 className="font-serif text-2xl font-semibold mt-1 mb-1">{q3Info.title}</h2>
              <ConfidenceBadge value={q3.confidence} />
            </div>

            <div className="card">
              <p className="text-sm text-secondary leading-relaxed">{q3Info.description}</p>
            </div>

            {/* Internal axes */}
            <div className="card">
              <h3 className="font-serif text-sm font-semibold mb-4">Internal Architecture</h3>
              <AxisBar
                label="Direction"
                value={q3.axes.direction.value}
                low="Away from threat"
                high="Toward threat"
              />
              <AxisBar
                label="Register"
                value={q3.axes.register.value}
                low="Behavioral"
                high="Cognitive"
              />
            </div>

            {q3.secondaryMode && (
              <div className="card bg-stone-50">
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Secondary Mode</span>
                <p className="text-sm text-secondary mt-2 capitalize">
                  When {q3Info.title.toLowerCase()} is unavailable or overwhelmed, your system shifts to{' '}
                  <span className="font-semibold">{q3.secondaryMode.replace(/_/g, ' ')}</span>.
                </p>
              </div>
            )}

            {/* Cross-quadrant */}
            <div className="card bg-stone-50">
              <span className="text-[10px] font-mono text-accent uppercase tracking-widest">The Sequence Partners Experience</span>
              <p className="text-sm text-secondary leading-relaxed mt-2">
                When {q2Info.title.toLowerCase()} activates, it runs through {q3Info.title.toLowerCase()} as the
                behavioral output. This is the specific sequence your partners experience: the emotion arrives,
                the decision mode activates, and the behavior your partner sees is the end product of both systems
                operating together.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            QUADRANT FOUR: PERSONA IN PRACTICE
        ══════════════════════════════════════════════════ */}
        {activeSection === 'persona' && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">Quadrant Four: Your Persona in Practice</span>
              <h2 className="font-serif text-2xl font-semibold mt-1 mb-1">{persona?.name || 'Your Persona'}</h2>
              <p className="text-xs text-secondary capitalize">{q4.compositeDescriptor}</p>
              <ConfidenceBadge value={q4.confidence} />
            </div>

            {/* Three axes */}
            <div className="card">
              <h3 className="font-serif text-sm font-semibold mb-4">Persona Axes</h3>
              <AxisBar
                label="Expression vs Defense"
                value={q4.axes.defense.value}
                low="Authentic expression"
                high="Defensive deployment"
              />
              <AxisBar
                label="Awareness vs Automaticity"
                value={q4.axes.awareness.value}
                low="Fused with persona"
                high="Conscious relationship"
              />
              <AxisBar
                label="Dating Amplification"
                value={q4.axes.amplification.value}
                low="Consistent across stakes"
                high="Amplifies under attachment"
              />
            </div>

            {/* Axis interpretation */}
            <div className="card">
              <h3 className="font-serif text-sm font-semibold mb-3">What This Configuration Means</h3>
              {q4.axes.defense.label === 'high' && q4.axes.awareness.label === 'high' && (
                <p className="text-sm text-secondary leading-relaxed mb-3">
                  You see the pattern clearly. You understand what the persona is doing in your relationships.
                  And the pattern still runs. This gap between insight and behavior is not a failure of intelligence
                  or willpower. It is the specific architecture of high defense with high awareness: the knowing
                  and the doing operate in different systems.
                </p>
              )}
              {q4.axes.defense.label === 'high' && (q4.axes.awareness.label === 'low' || q4.axes.awareness.label === 'moderate') && (
                <p className="text-sm text-secondary leading-relaxed mb-3">
                  Your persona is doing significant work in your relationships, protecting against something
                  specific, and the protection has been running long enough that it feels like personality
                  rather than adaptation. Partners have likely tried to describe what they experience.
                  The description may have been hard to recognize because the pattern operates faster than
                  self-reflection.
                </p>
              )}
              {q4.axes.defense.label === 'low' && q4.axes.amplification.label === 'high' && (
                <p className="text-sm text-secondary leading-relaxed mb-3">
                  Your persona is genuinely expressed in most contexts. There is real health in how you carry
                  these qualities. The specific territory worth examining is what happens to this same persona
                  when the stakes rise. When you care deeply, something in you amplifies, and the version
                  of you that appears under attachment pressure is more intense than the version people see
                  at the beginning.
                </p>
              )}
              {q4.axes.defense.label === 'low' && q4.axes.amplification.label !== 'high' && (
                <p className="text-sm text-secondary leading-relaxed mb-3">
                  Your persona holds relatively stable across contexts, including high-stakes romantic ones.
                  This consistency is genuine strength. It takes real internal security to remain the same person
                  when the relationship matters.
                </p>
              )}
              {q4.axes.defense.label === 'moderate' && (
                <p className="text-sm text-secondary leading-relaxed mb-3">
                  Your persona operates with a balance of genuine expression and protective function.
                  There are specific contexts where the defensive register activates, and the growth
                  edge is learning to notice the shift as it happens rather than after it has already
                  shaped the interaction.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            EMERGENT PATTERN
        ══════════════════════════════════════════════════ */}
        {activeSection === 'pattern' && pattern && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">Emergent Pattern</span>
              <h2 className="font-serif text-2xl font-semibold mt-1 mb-2">{pattern.patternName}</h2>
            </div>

            <div className="card border-accent">
              <p className="text-sm text-secondary leading-relaxed mb-4">{pattern.synthesisFrame}</p>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">This pattern emerges from</span>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="text-xs text-secondary"><span className="font-semibold">History:</span> {q1Info.subtitle}</div>
                  <div className="text-xs text-secondary"><span className="font-semibold">Emotion:</span> {q2Info.title}</div>
                  <div className="text-xs text-secondary"><span className="font-semibold">Decision Mode:</span> {q3Info.title}</div>
                  <div className="text-xs text-secondary"><span className="font-semibold">Persona:</span> {q4.compositeDescriptor}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            FULL REPORT
        ══════════════════════════════════════════════════ */}
        {activeSection === 'report' && report && (
          <div className="space-y-8">
            <div>
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">Your Blueprint Report</span>
              <h2 className="font-serif text-2xl font-semibold mt-1">The Full Portrait</h2>
            </div>

            {report.relationalHistory && (
              <section className="card">
                <h3 className="font-serif text-lg font-semibold mb-3">Relational History</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{report.relationalHistory}</div>
              </section>
            )}
            {report.emotionUnderneath && (
              <section className="card">
                <h3 className="font-serif text-lg font-semibold mb-3">The Emotion Underneath</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{report.emotionUnderneath}</div>
              </section>
            )}
            {report.howYouNavigateUncertainty && (
              <section className="card">
                <h3 className="font-serif text-lg font-semibold mb-3">How You Navigate Uncertainty</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{report.howYouNavigateUncertainty}</div>
              </section>
            )}
            {report.personaInContext && (
              <section className="card">
                <h3 className="font-serif text-lg font-semibold mb-3">Your Persona in Context</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{report.personaInContext}</div>
              </section>
            )}
            {report.thePortrait && (
              <section className="card">
                <h3 className="font-serif text-lg font-semibold mb-3">The Portrait</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{report.thePortrait}</div>
              </section>
            )}
            {report.whatThisMeansForPartnership && (
              <section className="card">
                <h3 className="font-serif text-lg font-semibold mb-3">What This Means for Partnership</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{report.whatThisMeansForPartnership}</div>
              </section>
            )}
            {report.theGrowingEdge && (
              <section className="card">
                <h3 className="font-serif text-lg font-semibold mb-3">The Growing Edge</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{report.theGrowingEdge}</div>
              </section>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            GROWTH PLAN
        ══════════════════════════════════════════════════ */}
        {activeSection === 'growth' && growth && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">Growth Plan</span>
              <h2 className="font-serif text-2xl font-semibold mt-1">Your Specific Work</h2>
            </div>

            {growth.whatBlueprintAdds && (
              <section className="card">
                <h3 className="font-serif text-sm font-semibold mb-3">What the Blueprint Adds to Your Portrait</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{growth.whatBlueprintAdds}</div>
              </section>
            )}
            {growth.reflectionPrompts && (
              <section className="card">
                <h3 className="font-serif text-sm font-semibold mb-3">Reflection Prompts</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{growth.reflectionPrompts}</div>
              </section>
            )}
            {growth.specificWork && (
              <section className="card">
                <h3 className="font-serif text-sm font-semibold mb-3">Experiments</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{growth.specificWork}</div>
              </section>
            )}
            {growth.whatToWatchFor && (
              <section className="card">
                <h3 className="font-serif text-sm font-semibold mb-3">What to Watch For</h3>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{growth.whatToWatchFor}</div>
              </section>
            )}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href="/results" className="text-xs text-accent hover:underline flex items-center gap-1">
            <Icon name="arrow_back" size={14} /> Back to Results
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
