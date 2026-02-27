import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

const MODULES = [
  {
    num: '01',
    title: 'What You Want',
    subtitle: '134 questions',
    desc: 'Map your preferences across four dimensions: physical attraction, social energy, lifestyle pace, and core values. This isn\'t a wish list — it\'s a measurement of what actually holds your attention.',
    time: '~38 min',
  },
  {
    num: '02',
    title: 'Who You Are',
    subtitle: '137 questions',
    desc: 'The same four dimensions, turned inward. This is where your persona emerges — one of 32 types that describes how you show up in relationships, not who you wish you were.',
    time: '~39 min',
  },
  {
    num: '03',
    title: 'How You Connect',
    subtitle: '28 questions',
    desc: 'Measures your intimacy exchange — how much access you want versus how much you offer. This gap predicts satisfaction better than any compatibility quiz.',
    time: '~8 min',
  },
  {
    num: '04',
    title: 'When Things Get Hard',
    subtitle: '68 questions',
    desc: 'Conflict approach, emotional drivers, repair speed, capacity under stress, and a full Gottman Four Horsemen screening. This is the module that predicts longevity.',
    time: '~17 min',
  },
];

const PERSONAS_PREVIEW = [
  { name: 'The Gladiator', code: 'ACEG', desc: 'Fitness + Leadership + Adventure + Traditional' },
  { name: 'The Maverick', code: 'ACEH', desc: 'Fitness + Leadership + Adventure + Egalitarian' },
  { name: 'The Duchess', code: 'ACFG', desc: 'Beauty + Allure + Peace + Traditional' },
  { name: 'The Recruiter', code: 'ADFH', desc: 'Fitness + Presence + Stability + Egalitarian' },
  { name: 'The Designer', code: 'BDFG', desc: 'Confidence + Charm + Peace + Traditional' },
  { name: 'The Astronaut', code: 'BCEH', desc: 'Maturity + Leadership + Adventure + Egalitarian' },
];

const FRAMEWORKS = [
  { name: 'Gottman Method', desc: 'Four Horsemen screening, repair attempts, 5:1 ratio analysis' },
  { name: 'Attachment Theory', desc: 'How early patterns shape your adult relationship behaviors' },
  { name: 'Emotionally Focused Therapy', desc: 'Pursue-withdraw cycles and underlying emotional needs' },
  { name: 'Internal Family Systems', desc: 'Parts and protectors driving seemingly contradictory behaviors' },
];

const FAQS = [
  {
    q: 'How long does the assessment take?',
    a: 'About 100 minutes total across 4 modules. You can save progress and return anytime — no need to complete it in one sitting.',
  },
  {
    q: 'What do I get for free?',
    a: 'Your persona code, traits description, and your top 3 compatibility matches with tier rankings. The free tier gives you a meaningful snapshot.',
  },
  {
    q: 'What\'s in the Full Report?',
    a: 'All 16 match rankings with detailed analysis, your complete conflict profile with Gottman scores, AI-powered coaching through the Claude Advisor, and a personalized growth path.',
  },
  {
    q: 'How does Couples Mode work?',
    a: 'Both partners take the assessment independently. Then you unlock a 7-section compatibility report, shared growth challenges, conversation cards, and a couples advisor.',
  },
  {
    q: 'Is this scientifically validated?',
    a: 'RELATE draws from established frameworks: Gottman\'s Four Horsemen, Emotionally Focused Therapy, Attachment Theory, and Internal Family Systems. The assessment instruments map onto validated psychological constructs.',
  },
  {
    q: 'Can I retake the assessment?',
    a: 'Yes. Your persona reflects who you are now, and that changes as you grow. Retaking after significant life events or relationship shifts often reveals meaningful evolution.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="landing" />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-b from-stone-100 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-4">
            367 Questions. 32 Personas. One Relationship Profile.
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-[1.1] mb-6">
            Relationship intelligence,<br />
            not relationship advice.
          </h1>
          <p className="text-lg text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            The most comprehensive relationship assessment ever built. Discover your persona, understand your patterns, and see who you&apos;re actually compatible with — backed by clinical psychology, not horoscopes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">
              Start Assessment — Free
            </Link>
            <a href="#how-it-works" className="text-sm text-secondary hover:text-foreground transition-colors">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ── */}
      <section className="border-y border-border bg-white px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-center">
          <div>
            <p className="font-serif text-2xl font-semibold">367</p>
            <p className="text-xs text-secondary">Assessment Questions</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div>
            <p className="font-serif text-2xl font-semibold">32</p>
            <p className="text-xs text-secondary">Unique Personas</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div>
            <p className="font-serif text-2xl font-semibold">4</p>
            <p className="text-xs text-secondary">Clinical Frameworks</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div>
            <p className="font-serif text-2xl font-semibold">16</p>
            <p className="text-xs text-secondary">Match Rankings</p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">The Assessment</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Four modules. One complete profile.</h2>
            <p className="text-secondary max-w-lg mx-auto">
              Each module measures a different dimension of how you relate. Together, they build the most detailed relationship profile you&apos;ll ever receive.
            </p>
          </div>

          <div className="space-y-4">
            {MODULES.map((m) => (
              <div key={m.num} className="card flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                <div className="flex items-center gap-4 md:w-48 flex-shrink-0">
                  <span className="font-mono text-3xl font-light text-stone-300">{m.num}</span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold">{m.title}</h3>
                    <p className="text-xs text-secondary font-mono">{m.subtitle} · {m.time}</p>
                  </div>
                </div>
                <p className="text-sm text-secondary leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Discover ── */}
      <section className="px-6 py-20 bg-stone-50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Your Results</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">More than a personality test.</h2>
            <p className="text-secondary max-w-lg mx-auto">
              You don&apos;t get a label. You get a complete relational profile with actionable insight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Your Persona', desc: 'One of 32 types — a 4-letter code with a name, traits, dating behavior, strengths, and growth areas. Specific to your gender.' },
              { title: 'Compatibility Rankings', desc: 'All 16 opposite-gender personas ranked from Ideal to Incompatible, with detailed match analysis for each.' },
              { title: 'Conflict Signature', desc: 'Your pursue/withdraw pattern, primary emotional driver, repair speed and mode, emotional capacity, and Gottman screening.' },
              { title: 'Connection Profile', desc: 'Your want/offer balance — how much intimacy you seek vs. how much you give. Plus attentiveness and context-switching patterns.' },
              { title: 'AI Coaching', desc: 'Claude-powered relationship advisor that references your actual scores and patterns. Not generic advice — insight specific to you.' },
              { title: 'Couples Report', desc: 'When both partners complete the assessment: a 7-section compatibility analysis, growth challenges, conversation cards, and date ideas.' },
            ].map((item) => (
              <div key={item.title} className="card">
                <h3 className="font-serif font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personas Preview ── */}
      <section id="personas" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">32 Personas</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Which one are you?</h2>
            <p className="text-secondary max-w-lg mx-auto">
              Your 4-letter code maps to one of 32 relationship personas — 16 male, 16 female. Each has distinct traits, dating behaviors, strengths, and shadows.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PERSONAS_PREVIEW.map((p) => (
              <div key={p.code} className="card text-center py-5">
                <span className="font-mono text-xs text-accent">{p.code}</span>
                <h3 className="font-serif text-lg font-semibold mt-1">{p.name}</h3>
                <p className="text-xs text-secondary mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/personas" className="text-sm text-accent hover:underline">
              View all 32 personas →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Science ── */}
      <section className="px-6 py-20 bg-stone-50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">The Science</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Built on clinical frameworks.</h2>
            <p className="text-secondary max-w-lg mx-auto">
              RELATE isn&apos;t an internet quiz. Every module maps onto established therapeutic and research frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FRAMEWORKS.map((f) => (
              <div key={f.name} className="card">
                <h3 className="font-serif font-semibold mb-1">{f.name}</h3>
                <p className="text-sm text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Pricing</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Start free. Go deeper if you want.</h2>
            <p className="text-secondary max-w-lg mx-auto">
              The assessment is free. Your persona and top matches are free. Everything beyond that is a one-time purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card flex flex-col">
              <span className="font-mono text-xs text-secondary tracking-wider">FREE</span>
              <p className="font-serif text-4xl font-semibold mt-2">$0</p>
              <p className="text-sm text-secondary mt-3 mb-6">Everything you need to discover your persona.</p>
              <div className="space-y-2.5 mb-8 flex-1">
                {[
                  '367-question assessment',
                  'Your persona code and traits',
                  'Top 3 match rankings',
                  '3 advisor messages',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-secondary mt-0.5">—</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup" className="btn-secondary w-full text-center">Start Free</Link>
            </div>

            <div className="card flex flex-col border-accent relative">
              <div className="absolute -top-3 left-4 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
                Most popular
              </div>
              <span className="font-mono text-xs text-accent tracking-wider">FULL REPORT</span>
              <p className="font-serif text-4xl font-semibold mt-2">$19</p>
              <p className="text-sm text-secondary mt-3 mb-6">The complete picture — all matches, all insights.</p>
              <div className="space-y-2.5 mb-8 flex-1">
                {[
                  'Everything in Free',
                  'All 16 match rankings + details',
                  'Full conflict analysis',
                  'Unlimited AI advisor',
                  'Personalized growth path',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-0.5">—</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup" className="btn-primary w-full text-center">Get Full Report</Link>
            </div>

            <div className="card flex flex-col">
              <span className="font-mono text-xs text-secondary tracking-wider">COUPLES</span>
              <p className="font-serif text-4xl font-semibold mt-2">$29</p>
              <p className="text-sm text-secondary mt-3 mb-6">Both partners, one complete compatibility analysis.</p>
              <div className="space-y-2.5 mb-8 flex-1">
                {[
                  'Everything in Full Report (x2)',
                  '7-section compatibility report',
                  'Growth challenges and levels',
                  'Conversation card decks',
                  'Personalized date ideas',
                  'Shared couples advisor',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-secondary mt-0.5">—</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup" className="btn-secondary w-full text-center">Get Couples Report</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20 bg-stone-50 border-y border-border">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl font-semibold mb-4">Frequently asked questions</h2>
          </div>

          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-serif font-semibold mb-1">{faq.q}</h3>
                <p className="text-sm text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
            Ready to meet yourself?
          </h2>
          <p className="text-secondary mb-8 max-w-md mx-auto">
            The assessment is free, saves your progress, and takes about 100 minutes across 4 modules. Your persona is waiting.
          </p>
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">
            Begin the Assessment
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="font-serif text-lg font-semibold">RELATE</p>
              <p className="text-xs text-secondary mt-1">Relationship Intelligence Platform</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-secondary">
              <Link href="/personas" className="hover:text-foreground transition-colors">Personas</Link>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Log In</Link>
              <Link href="/auth/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-xs text-secondary">
            RELATE draws from Gottman Method, Emotionally Focused Therapy, Attachment Theory, and Internal Family Systems. This is not a diagnostic tool and does not replace licensed therapy.
          </div>
        </div>
      </footer>
    </div>
  );
}
