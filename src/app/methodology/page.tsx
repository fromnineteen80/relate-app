import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const TIERS = [
  { name: 'Ideal', score: '80+', color: 'bg-success', desc: 'Strong natural compatibility. Values and behavioral patterns align across most dimensions.' },
  { name: 'Kismet', score: '65-79', color: 'bg-success/70', desc: 'High potential for connection. Key dimensions complement each other with manageable tensions.' },
  { name: 'Effort', score: '45-64', color: 'bg-warning', desc: 'Promising match that requires conscious effort in specific areas to thrive.' },
  { name: 'Long Shot', score: '25-44', color: 'bg-stone-400', desc: 'Significant differences that would need sustained work and mutual commitment to bridge.' },
  { name: 'At Risk', score: '10-24', color: 'bg-danger/70', desc: 'Core value conflicts present. Proceed with clear expectations and professional support.' },
  { name: 'Incompatible', score: '2-9', color: 'bg-danger', desc: 'Fundamental misalignment in values and behavioral patterns across most dimensions.' },
];

const HORSEMEN = [
  { name: 'Criticism', antidote: 'Gentle Startup', desc: 'Attacking your partner\'s character rather than addressing specific behavior. The antidote is to use "I" statements and focus on what happened, not who they are.' },
  { name: 'Contempt', antidote: 'Culture of Appreciation', desc: 'Expressing disgust, superiority, or mockery toward your partner. Research shows this is the single strongest predictor of divorce. The antidote is building a culture of fondness and admiration.' },
  { name: 'Defensiveness', antidote: 'Taking Responsibility', desc: 'Refusing to take responsibility by counter-attacking or playing the victim. The antidote is accepting your part in the conflict, even a small part, before explaining your perspective.' },
  { name: 'Stonewalling', antidote: 'Self-Soothing', desc: 'Shutting down emotionally and withdrawing from the conversation entirely. The antidote is learning to self-soothe, take breaks when flooded, and commit to returning to the conversation.' },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-16 pb-12 px-6 bg-gradient-to-b from-stone-100 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-4">Deep Dive</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.1] mb-6">
            Assessment Methodology
          </h1>
          <p className="text-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Relate&apos;s assessment draws from four clinical frameworks to create a comprehensive picture of how you date, who you are, how you connect, and how you handle conflict.
          </p>
        </div>
      </section>

      {/* Clinical Foundations */}
      <section className="px-6 py-16 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Foundations</p>
          <h2 className="font-serif text-3xl font-semibold mb-8">Clinical Frameworks</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-serif font-semibold mb-2">Gottman Method</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Developed by Drs. John and Julie Gottman over 40 years of research, this framework identifies the &quot;Four Horsemen&quot; that predict relationship failure: criticism, contempt, defensiveness, and stonewalling. Module 4 screens for these patterns and their intensity.
              </p>
            </div>
            <div className="card">
              <h3 className="font-serif font-semibold mb-2">Emotionally Focused Therapy</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Created by Dr. Sue Johnson, EFT maps the pursue-withdraw cycle that drives most relationship distress. Module 4 identifies your conflict approach and emotional drivers, revealing the underlying needs behind your conflict behavior.
              </p>
            </div>
            <div className="card">
              <h3 className="font-serif font-semibold mb-2">Attachment Theory</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Rooted in the work of Bowlby and Ainsworth, attachment theory explains how early bonding experiences shape adult relationship patterns. Module 3 measures how you seek and offer emotional connection, reflecting your attachment style in action.
              </p>
            </div>
            <div className="card">
              <h3 className="font-serif font-semibold mb-2">Internal Family Systems</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Dr. Richard Schwartz&apos;s IFS model recognizes that we all carry multiple &quot;parts&quot; with different needs and fears. Module 4&apos;s emotional driver assessment identifies which parts are activated during conflict: the abandoned child, the engulfed protector, the inadequate self, or the justice seeker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Four Modules */}
      <section className="px-6 py-16 bg-stone-50 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">The Assessment</p>
          <h2 className="font-serif text-3xl font-semibold mb-3">Four Modules, 367 Questions</h2>
          <p className="text-secondary mb-10">
            The assessment takes approximately 75 minutes across four modules. Each module measures a distinct aspect of your relationship profile, and results build progressively as you complete each one.
          </p>

          {/* Module 1 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-mono text-lg">1</div>
              <div>
                <h3 className="font-serif text-xl font-semibold">What You Want</h3>
                <p className="text-xs text-secondary">134 questions, approximately 25 minutes</p>
              </div>
            </div>
            <div className="pl-13 space-y-3">
              <p className="text-sm text-secondary leading-relaxed">
                This module maps your partner preferences across four dimensions. Each dimension has two poles, and your responses reveal which pole you lean toward and how strongly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DimensionCard dim="Physical" desc="What draws you in physically. Are you attracted to fitness and appearance, or to how someone carries themselves with maturity and presence?" />
                <DimensionCard dim="Social" desc="How you want a partner to show up socially. Do you prefer magnetic leadership and initiative, or quiet warmth and emotional availability?" />
                <DimensionCard dim="Lifestyle" desc="The energy you want in your life together. Are you drawn to adventure and spontaneity, or to stability and consistency?" />
                <DimensionCard dim="Values" desc="Your worldview alignment. Do you lean toward clearly defined roles and traditions, or toward shared responsibility and equality?" />
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                Three question types are used: direct preference statements (Likert scale), behavioral scenarios based on past choices, and forced-choice tradeoffs. The combination reduces social desirability bias and captures both conscious and unconscious preferences.
              </p>
              <p className="text-sm text-secondary">
                <span className="font-medium text-foreground">Output:</span> A 4-letter preference code (e.g., ACEG) with strength percentages for each dimension, plus identification of your key driver, the single dimension that matters most to you.
              </p>
            </div>
          </div>

          {/* Module 2 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-mono text-lg">2</div>
              <div>
                <h3 className="font-serif text-xl font-semibold">Who You Are</h3>
                <p className="text-xs text-secondary">137 questions, approximately 25 minutes</p>
              </div>
            </div>
            <div className="pl-13 space-y-3">
              <p className="text-sm text-secondary leading-relaxed">
                Module 2 measures how you actually present yourself across the same four dimensions. Instead of asking what you want, it asks who you are. Your answers are scored against gender-specific poles, and the resulting 4-letter code maps to one of 16 personas.
              </p>
              <p className="text-sm text-secondary leading-relaxed">
                The system also calculates your self-perception gap: the distance between how you see yourself (Module 2) and what you want in a partner (Module 1). A large gap can signal blind spots in self-awareness or misalignment between your expectations and what you offer.
              </p>
              <p className="text-sm text-secondary">
                <span className="font-medium text-foreground">Output:</span> Your persona assignment (one of 32 total, 16 per gender), complete with dating behavior patterns, relationship tendencies, strengths, growth areas, and shadow traits.
              </p>
            </div>
          </div>

          {/* Module 3 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-mono text-lg">3</div>
              <div>
                <h3 className="font-serif text-xl font-semibold">How You Connect</h3>
                <p className="text-xs text-secondary">28 questions, approximately 10 minutes</p>
              </div>
            </div>
            <div className="pl-13 space-y-3">
              <p className="text-sm text-secondary leading-relaxed">
                This module measures your intimacy access patterns through the lens of context switching: whether you show different sides of yourself in different situations, and whether you seek that same range from a partner.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-border rounded-md">
                  <p className="text-xs font-mono text-accent uppercase mb-1">Want Score (0-100)</p>
                  <p className="text-sm text-secondary">How much differentiated access you seek from a partner. High scorers want someone who can be playful, serious, vulnerable, and commanding depending on context.</p>
                </div>
                <div className="p-3 bg-white border border-border rounded-md">
                  <p className="text-xs font-mono text-accent uppercase mb-1">Offer Score (0-100)</p>
                  <p className="text-sm text-secondary">How much differentiated access you provide. High scorers naturally adapt their energy and behavior to different situations and relationships.</p>
                </div>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                The gap between your Want and Offer scores reveals important patterns. A large positive gap means you want more from a partner than you provide. A large negative gap means you give more range than you expect to receive.
              </p>
              <p className="text-sm text-secondary">
                <span className="font-medium text-foreground">Output:</span> Context switching type classification, want/offer scores, gap analysis, and attentiveness pattern.
              </p>
            </div>
          </div>

          {/* Module 4 */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-mono text-lg">4</div>
              <div>
                <h3 className="font-serif text-xl font-semibold">When Things Get Hard</h3>
                <p className="text-xs text-secondary">68 questions, approximately 15 minutes</p>
              </div>
            </div>
            <div className="pl-13 space-y-3">
              <p className="text-sm text-secondary leading-relaxed">
                The final module maps your complete conflict signature. This is where the clinical frameworks come together most directly, measuring five distinct components of how you handle relational stress.
              </p>

              <div className="space-y-2">
                <ConflictComponent title="Conflict Approach" desc="Whether you pursue (move toward conflict seeking resolution) or withdraw (pull away to process). Neither is better; what matters is how your approach interacts with your partner's." />
                <ConflictComponent title="Emotional Drivers" desc="The core fear activated during conflict. There are four drivers: abandonment (fear of being left), engulfment (fear of losing yourself), inadequacy (fear of not being enough), and injustice (fear of unfairness). Your primary driver shapes your instinctive reaction when things escalate." />
                <ConflictComponent title="Repair Speed and Mode" desc="How quickly you can re-engage after conflict (fast or slow) and whether you repair through verbal processing (talking it through) or physical connection (touch, acts of service). Mismatched repair styles are one of the most common sources of ongoing friction." />
                <ConflictComponent title="Emotional Capacity" desc="Your ability to remain present and regulated during intense emotional moments. Higher capacity means you can absorb more stress before becoming flooded and shutting down." />
                <ConflictComponent title="Gottman Four Horsemen" desc="A screener for the four communication patterns that predict relationship failure with over 90% accuracy. Each horseman is scored individually with a risk assessment." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gottman Deep Dive */}
      <section className="px-6 py-16 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Conflict Patterns</p>
          <h2 className="font-serif text-3xl font-semibold mb-3">The Four Horsemen</h2>
          <p className="text-secondary mb-8">
            Dr. John Gottman identified four communication patterns so destructive that he could predict divorce with over 90% accuracy by observing just 15 minutes of a couple&apos;s conversation. Module 4 screens for each pattern and its intensity.
          </p>

          <div className="space-y-4">
            {HORSEMEN.map((h) => (
              <div key={h.name} className="card">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif font-semibold">{h.name}</h3>
                  <span className="text-xs font-mono text-success">Antidote: {h.antidote}</span>
                </div>
                <p className="text-sm text-secondary leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persona System */}
      <section className="px-6 py-16 bg-stone-50 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Identity</p>
          <h2 className="font-serif text-3xl font-semibold mb-3">The 32 Personas</h2>
          <p className="text-secondary mb-8">
            Your Module 2 results map to one of 32 relationship personas (16 per gender). Each persona is defined by a 4-letter code representing your position on the Physical, Social, Lifestyle, and Values dimensions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="card">
              <h3 className="font-serif font-semibold mb-3">Male Personas (16)</h3>
              <div className="space-y-1.5 text-sm">
                {[
                  ['ACEG', 'The Gladiator'], ['ACEH', 'The Maverick'], ['ACFG', 'The Spy'], ['ACFH', 'The Engineer'],
                  ['ADEG', 'The Cowboy'], ['ADEH', 'The Sherpa'], ['ADFG', 'The Curator'], ['ADFH', 'The Recruiter'],
                  ['BCEG', 'The Legionnaire'], ['BCEH', 'The Astronaut'], ['BCFG', 'The Statesman'], ['BCFH', 'The Professor'],
                  ['BDEG', 'The Ranger'], ['BDEH', 'The Playwright'], ['BDFG', 'The Arborist'], ['BDFH', 'The Builder'],
                ].map(([code, name]) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-accent w-12">{code}</span>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-serif font-semibold mb-3">Female Personas (16)</h3>
              <div className="space-y-1.5 text-sm">
                {[
                  ['ACEG', 'The Debutante'], ['ACEH', 'The Correspondent'], ['ACFG', 'The Duchess'], ['ACFH', 'The Influencer'],
                  ['ADEG', 'The Barrel Racer'], ['ADEH', 'The Podcaster'], ['ADFG', 'The Trophy'], ['ADFH', 'The Girl Next Door'],
                  ['BCEG', 'The Party Planner'], ['BCEH', 'The Marketer'], ['BCFG', 'The Executive'], ['BCFH', 'The Producer'],
                  ['BDEG', 'The Coach'], ['BDEH', 'The Founder'], ['BDFG', 'The Designer'], ['BDFH', 'The Therapist'],
                ].map(([code, name]) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-accent w-12">{code}</span>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-secondary leading-relaxed">
            Each persona comes with a detailed profile: dating behavior patterns, relationship tendencies, what makes them most and least attractive to potential partners, and their shadow side. Personas are not fixed labels. They represent your current behavioral center of gravity and can evolve as you grow.
          </p>

          <div className="mt-4">
            <Link href="/personas" className="btn-secondary text-sm inline-block">Browse All 32 Personas</Link>
          </div>
        </div>
      </section>

      {/* Compatibility System */}
      <section className="px-6 py-16 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Matching</p>
          <h2 className="font-serif text-3xl font-semibold mb-3">Compatibility Scoring</h2>
          <p className="text-secondary mb-8">
            After completing all four modules, the system ranks all 16 opposite-gender personas by compatibility. Your score with each persona is calculated from four weighted components.
          </p>

          <div className="card mb-6">
            <h3 className="font-serif font-semibold mb-3">Score Components</h3>
            <div className="space-y-3">
              <ScoreComponent weight="50%" label="Tier Assignment" desc="Based on your persona's pre-assigned compatibility with each target persona across the four dimensions. Personas that share your values dimension receive higher base scores." />
              <ScoreComponent weight="20%" label="Dimension Alignment" desc="How closely your dimensional profile aligns with each target persona's typical traits." />
              <ScoreComponent weight="15%" label="Connection Compatibility" desc="How well your Module 3 want/offer scores match the target persona's typical connection patterns. The system checks whether what you want aligns with what they typically offer, and vice versa." />
              <ScoreComponent weight="15%" label="Conflict Compatibility" desc="How your Module 4 conflict profile interacts with the target persona's typical conflict patterns. Complementary approach styles (one pursuer, one withdrawer) score higher, and matched repair styles reduce friction." />
            </div>
          </div>

          <h3 className="font-serif font-semibold mb-4">Compatibility Tiers</h3>
          <div className="space-y-3">
            {TIERS.map((tier) => (
              <div key={tier.name} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full ${tier.color} flex-shrink-0 mt-1`} />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{tier.name}</span>
                    <span className="text-xs font-mono text-secondary">{tier.score}</span>
                  </div>
                  <p className="text-sm text-secondary">{tier.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Drivers */}
      <section className="px-6 py-16 bg-stone-50 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Module 4 Deep Dive</p>
          <h2 className="font-serif text-3xl font-semibold mb-3">Emotional Drivers</h2>
          <p className="text-secondary mb-8">
            When conflict escalates, one of four core fears typically gets activated. Your primary driver shapes your instinctive reaction and determines what you need most from your partner in difficult moments.
          </p>

          <div className="space-y-4">
            <DriverCard
              name="Abandonment"
              fear="You are leaving me"
              experience="Panic, desperation, emptiness, terror of being alone"
              behavior="Pursues and clings, demands reassurance, monitors partner's availability, catastrophizes small signals"
              healthy="I need reassurance that we are okay. Can you help me feel secure?"
            />
            <DriverCard
              name="Engulfment"
              fear="You are controlling me, I am losing myself"
              experience="Feeling trapped, invaded, loss of identity, suffocation"
              behavior="Withdraws, creates distance, resists closeness, asserts independence"
              healthy="I need some space to process. I will come back to this."
            />
            <DriverCard
              name="Inadequacy"
              fear="I am failing you, I am not enough"
              experience="Shame, worthlessness, paralysis, self-doubt"
              behavior="Over-apologizes, freezes, self-deprecates, avoids trying"
              healthy="I am feeling like I have let you down. Can we talk about what happened?"
            />
            <DriverCard
              name="Injustice"
              fear="You are being unfair, I am not being heard"
              experience="Righteous anger, invalidation, moral outrage"
              behavior="Digs in, argues, builds case with evidence, refuses to concede"
              healthy="I need you to understand my perspective before we move on."
            />
          </div>

          <div className="mt-8 p-4 bg-white border border-border rounded-md">
            <h3 className="font-serif font-semibold mb-2">Driver Compatibility Patterns</h3>
            <div className="space-y-2 text-sm text-secondary">
              <p><span className="font-medium text-foreground">Abandonment + Engulfment:</span> The classic pursue-withdraw spiral. One partner chases while the other retreats, escalating both fears.</p>
              <p><span className="font-medium text-foreground">Same Driver Pairs:</span> Partners who share a driver can understand each other deeply, but they can also trigger each other in predictable ways.</p>
              <p><span className="font-medium text-foreground">Inadequacy + Injustice:</span> Creates a power imbalance risk where one partner internalizes blame while the other externalizes it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring Transparency */}
      <section className="px-6 py-16 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Transparency</p>
          <h2 className="font-serif text-3xl font-semibold mb-3">How Scoring Works</h2>
          <p className="text-secondary mb-8">
            Every score in the assessment is deterministic and reproducible. There is no randomness and no AI interpretation in the scoring itself.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-serif font-semibold mb-2">Dimension Scoring (Modules 1 and 2)</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Each dimension uses 32 questions across three formats: 12 direct preference statements on a Likert scale, 8 behavioral scenarios, and 12 forced-choice comparisons. Pole A and Pole B scores are calculated independently and normalized to a 0-100 scale. The stronger pole becomes your assigned direction, and the margin determines your strength percentage.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-semibold mb-2">Connection Scoring (Module 3)</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Want and Offer scores are each calculated from 12 questions, normalized to 0-100. The gap between them is the primary insight. Context switching types are assigned based on whether your Want and Offer fall above or below the midpoint threshold.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-semibold mb-2">Conflict Scoring (Module 4)</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Conflict approach is scored from 12 questions (6 pursue, 6 withdraw), normalized to a 0-100 scale where 100 is pure pursue and 0 is pure withdraw. Emotional drivers use 16 questions (4 per driver), each normalized independently. Repair speed and mode use 6 questions each. The Gottman screener uses 16 questions (4 per horseman), with risk thresholds calibrated to published clinical guidelines.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-semibold mb-2">Attentiveness</h3>
              <p className="text-sm text-secondary leading-relaxed">
                A cross-module measure combining Module 3 Offer score, Module 3 Want score, Gottman contempt and criticism levels, and self-perception gap from Module 2. The composite determines whether you are strongly other-focused, balanced, moderately self-focused, or self-absorbed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Finding Your Ideal Match */}
      <section id="ideal-match" className="px-6 py-16 bg-stone-50 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Demographics</p>
          <h2 className="font-serif text-3xl font-semibold mb-3">Finding Your Ideal Match Pool</h2>
          <p className="text-secondary mb-8">
            After completing the assessment, Relate estimates how many people in your area realistically match what you are looking for. This is a demographic funnel: we start with the full population and narrow it step by step using your preferences, publicly available population data, and standard demographic modeling techniques.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-serif font-semibold mb-2">How the Funnel Works</h3>
              <p className="text-sm text-secondary leading-relaxed mb-3">
                The funnel applies your preferences as sequential filters against the population of your metro area (CBSA). Each step reduces the pool by the percentage of people who do not meet that criterion. The process follows the same elimination logic used in actuarial science, market sizing, and persona-based audience segmentation — standard approaches for estimating the size of a target population from known distributions.
              </p>
              <div className="space-y-2">
                <FunnelStep number="1" title="Universal Exclusions" desc="Remove adults over 65 and the homeless population, who are outside the standard dating pool. This establishes the base adult population (18-64)." />
                <FunnelStep number="2" title="Gender" desc="Filter to the gender you are seeking, using local CBSA gender distribution rather than assuming a 50/50 split. Metro areas vary meaningfully — some skew 52% female, others 48%." />
                <FunnelStep number="3" title="Sexual Orientation" desc="Apply the proportion of the target gender who identify with a compatible orientation. Rates are drawn from national survey data and adjusted by metro-level estimates where available." />
                <FunnelStep number="4" title="Criminal Record Exclusion" desc="Remove individuals with felony convictions. Incarceration and felony rates differ significantly by gender, ethnicity, and education level, so the model uses a weighted average based on the CBSA's ethnic composition rather than a single national rate." />
                <FunnelStep number="5" title="Substance Issues" desc="Exclude individuals with active substance abuse issues using the same ethnicity-weighted approach. Rates are drawn from national health survey data." />
                <FunnelStep number="6" title="Relationship Status" desc="Filter to singles using local CBSA relationship status data. This produces the Local Singles pool — the total number of available, eligible singles of the right gender and orientation in your area." />
                <FunnelStep number="7" title="Your Preferences" desc="Apply your specific requirements: age range, minimum income, lifestyle preferences (smoking, drinking, children, religion, pets, diet), and physical preferences (height range, body type, fitness level). Each filter uses CBSA-level data where available or national distributions as a fallback." />
              </div>
              <p className="text-sm text-secondary leading-relaxed mt-3">
                The result is your Ideal Match Pool: the estimated number of people who meet every criterion you specified. This number is then multiplied by your match probability (derived from your Relate Score) to produce your final match count — the number of people in your pool who would likely be a mutual fit.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-semibold mb-2">Context Percentages</h3>
              <p className="text-sm text-secondary leading-relaxed mb-3">
                Raw pool numbers are hard to interpret on their own. Is 2,000 people a lot or a little? It depends on the size of the population you are drawing from and how many filters you have applied. To provide context, the results page shows your ideal pool as a percentage of three progressively narrower base populations:
              </p>
              <div className="space-y-2 text-sm text-secondary">
                <p><span className="font-medium text-foreground">% of target gender:</span> Your ideal pool divided by all adults (18-64) of the gender you are seeking in the area. This is the broadest view — of every person of that gender you could encounter, what fraction fits all of your preferences.</p>
                <p><span className="font-medium text-foreground">% of eligible:</span> Your ideal pool divided by the subset that shares the right orientation, has no criminal record, and falls within your preferred age range. This removes people who were never realistic candidates, isolating the effect of your lifestyle, income, and physical preferences.</p>
                <p><span className="font-medium text-foreground">% of ethnicity match:</span> The eligible pool narrowed further to people of your own ethnic background. Because felon rates, income distributions, education levels, and lifestyle patterns vary by ethnicity, this provides the most directly comparable view of how selective your preferences are within a demographically similar group.</p>
              </div>
              <p className="text-sm text-secondary leading-relaxed mt-3">
                All three percentages are computed independently for your metro area, your state, and the nation, so you can see how your selectivity plays out at different geographic scales.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-semibold mb-2">The Relate Score and Match Probability</h3>
              <p className="text-sm text-secondary leading-relaxed">
                The Relate Score (0-100) measures how well your profile aligns with the demographic realities of your metro area. It incorporates factors like gender ratio favorability, local single rates, income distributions, and lifestyle compatibility with the local population. A higher score means you are fishing in a pond that is well-stocked for someone like you. The match probability is a direct function of this score: it represents the likelihood that any given person in your ideal pool would also consider you a match based on the same demographic factors. Scores above 70 convert at higher rates; scores below 40 face significantly steeper odds.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-semibold mb-2">Data Sources</h3>
              <p className="text-sm text-secondary leading-relaxed mb-3">
                All demographic data used in the funnel is sourced from publicly available datasets. No proprietary or paywalled data is used. The primary sources are:
              </p>
              <ul className="space-y-1.5 text-sm text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-foreground">U.S. Census Bureau</span> — Population estimates, age distributions, gender ratios, household income, ethnic composition, and relationship status by CBSA, county, state, and nation (American Community Survey 5-Year Estimates).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-foreground">U.S. Centers for Disease Control and Prevention (CDC)</span> — National Health Interview Survey and Behavioral Risk Factor Surveillance System data for substance use rates, disability prevalence, and health behavior distributions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-foreground">Pew Research Center</span> — Survey data on sexual orientation, religious affiliation, lifestyle attitudes, and relationship patterns used to supplement Census data where granularity is needed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-foreground">Bureau of Justice Statistics</span> — Felony conviction and incarceration rates by gender, ethnicity, and age used in the criminal record exclusion step.</span>
                </li>
              </ul>
              <p className="text-sm text-secondary leading-relaxed mt-3">
                Where CBSA-level data is available, it is used directly. Where only state or national data exists, it is applied as a proportional estimate. All rates are static snapshots, not real-time data, and are updated periodically as new survey releases become available.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-semibold mb-2">Limitations</h3>
              <p className="text-sm text-secondary leading-relaxed">
                These are estimates, not counts of real individuals. The model assumes statistical independence between filters (for example, that income and fitness level are uncorrelated), which is a simplification. Some preferences like body type and fitness level rely on national survey distributions rather than local data. The funnel does not account for whether someone is actively dating, on a dating app, or open to meeting new people — it estimates the theoretical pool. Actual availability will be smaller. The model is designed to give you a realistic order-of-magnitude sense of your dating market, not a precise headcount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-stone-50 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
            Ready to discover your profile?
          </h2>
          <p className="text-secondary mb-8 max-w-md mx-auto">
            The assessment is free, saves your progress, and takes about 75 minutes across 4 modules. Your persona is waiting.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">
              Begin the Assessment
            </Link>
            <Link href="/personas" className="btn-secondary text-base px-8 py-3">
              Browse Personas
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function DimensionCard({ dim, desc }: { dim: string; desc: string }) {
  return (
    <div className="p-3 bg-white border border-border rounded-md">
      <p className="text-xs font-mono text-accent uppercase mb-1">{dim}</p>
      <p className="text-sm text-secondary">{desc}</p>
    </div>
  );
}

function ConflictComponent({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-border rounded-md">
      <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-secondary mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function ScoreComponent({ weight, label, desc }: { weight: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="font-mono text-sm text-accent font-semibold w-10 flex-shrink-0">{weight}</span>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-secondary mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FunnelStep({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-border rounded-md">
      <span className="font-mono text-xs text-accent font-semibold w-5 flex-shrink-0 mt-0.5">{number}</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-secondary mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function DriverCard({ name, fear, experience, behavior, healthy }: { name: string; fear: string; experience: string; behavior: string; healthy: string }) {
  return (
    <div className="card">
      <h3 className="font-serif font-semibold mb-1">{name}</h3>
      <p className="text-xs text-accent font-mono mb-3">&quot;{fear}&quot;</p>
      <div className="space-y-2 text-sm text-secondary">
        <p><span className="font-medium text-foreground">Internal experience:</span> {experience}</p>
        <p><span className="font-medium text-foreground">External behavior:</span> {behavior}</p>
        <p className="p-2 bg-success/5 border border-success/20 rounded text-xs">
          <span className="font-medium text-success">Healthy expression:</span> &quot;{healthy}&quot;
        </p>
      </div>
    </div>
  );
}
