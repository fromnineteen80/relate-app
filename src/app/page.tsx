import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

const MODULES = [
  {
    num: '01',
    title: 'What You Want',
    subtitle: '134 questions',
    desc: 'Map your preferences across four dimensions: physical attraction, social energy, lifestyle pace, and core values. This isn\'t a wish list - it\'s a measurement of what actually holds your attention.',
    time: '~38 min',
  },
  {
    num: '02',
    title: 'Who You Are',
    subtitle: '137 questions',
    desc: 'The same four dimensions, turned inward. This is where your persona emerges - one of 32 types that describes how you show up in relationships, not who you wish you were.',
    time: '~39 min',
  },
  {
    num: '03',
    title: 'How You Connect',
    subtitle: '28 questions',
    desc: 'Measures your intimacy exchange - how much access you want versus how much you offer. This gap predicts satisfaction better than any compatibility quiz.',
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
    a: 'About 100 minutes total across 4 modules. You can save progress and return anytime - no need to complete it in one sitting.',
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
      <section className="relative pt-16 pb-20 px-6 bg-gradient-to-b from-stone-100 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-4">
            Fixing the match to partner journey for 112 million U.S. singles.
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-[1.1] mb-6">
            The first dating and relationship intelligence layer
          </h1>
          <p className="text-lg text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            The most comprehensive relationship assessment ever built. Discover your persona, understand your dating patterns, and see who you&apos;re actually compatible with. Improve your relationships. All backed by clinical psychology and supported by Claude.ai.
          </p>
          <div className="flex items-center justify-center">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">
              Start Assessment
            </Link>
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
              { title: 'Your Persona', desc: 'One of 32 types - a 4-letter code with a name, traits, dating behavior, strengths, and growth areas. Specific to your gender.' },
              { title: 'Compatibility Rankings', desc: 'All 16 opposite-gender personas ranked from Ideal to Incompatible, with detailed match analysis for each.' },
              { title: 'Conflict Signature', desc: 'Your pursue/withdraw pattern, primary emotional driver, repair speed and mode, emotional capacity, and Gottman screening.' },
              { title: 'Connection Profile', desc: 'Your want/offer balance - how much intimacy you seek vs. how much you give. Plus attentiveness and context-switching patterns.' },
              { title: 'AI Coaching', desc: 'Claude-powered relationship advisor that references your actual scores and patterns. Not generic advice - insight specific to you.' },
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
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">32 Personas</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Which one are you?</h2>
            <p className="text-secondary max-w-lg mx-auto">
              Your 4-letter code maps to one of 32 relationship personas -16 male, 16 female. Each has distinct traits, dating behaviors, strengths, and shadows.
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

      {/* ── Dating Economy ── */}
      <section className="px-6 py-20 bg-stone-50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">Dating Economy</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Finding Your Ideal Partner</h2>
            <p className="text-secondary max-w-lg mx-auto">
              Pinpoint value in your local dating market and identify the likelihood of finding your ideal match.
            </p>
          </div>

          {/* US Map - SVG with state outlines */}
          <div className="max-w-2xl mx-auto">
            <svg viewBox="0 0 960 600" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              {/* Simplified US state paths in grey tones */}
              <g fill="none" stroke="#a8a29e" strokeWidth="1">
                {/* Washington */}
                <path d="M118,42 L158,42 L175,50 L183,62 L180,80 L135,80 L118,65Z" fill="#d6d3d1" />
                {/* Oregon */}
                <path d="M118,65 L135,80 L180,80 L178,105 L175,120 L110,120 L100,90Z" fill="#e7e5e4" />
                {/* California */}
                <path d="M100,90 L110,120 L120,155 L115,190 L105,220 L85,250 L80,230 L75,200 L78,160 L85,120Z" fill="#d6d3d1" />
                {/* Nevada */}
                <path d="M110,120 L175,120 L165,190 L115,190 L120,155Z" fill="#e7e5e4" />
                {/* Idaho */}
                <path d="M180,80 L200,60 L215,80 L210,120 L175,120 L178,105Z" fill="#d6d3d1" />
                {/* Montana */}
                <path d="M200,60 L300,50 L310,70 L280,85 L215,80Z" fill="#e7e5e4" />
                {/* Wyoming */}
                <path d="M215,80 L280,85 L285,120 L210,120Z" fill="#d6d3d1" />
                {/* Utah */}
                <path d="M175,120 L210,120 L215,170 L165,190Z" fill="#e7e5e4" />
                {/* Colorado */}
                <path d="M210,120 L285,120 L290,170 L215,170Z" fill="#d6d3d1" />
                {/* Arizona */}
                <path d="M115,190 L165,190 L175,240 L130,260 L105,220Z" fill="#e7e5e4" />
                {/* New Mexico */}
                <path d="M165,190 L215,170 L230,240 L175,260 L175,240Z" fill="#d6d3d1" />
                {/* North Dakota */}
                <path d="M310,70 L390,65 L395,95 L315,100Z" fill="#e7e5e4" />
                {/* South Dakota */}
                <path d="M315,100 L395,95 L400,130 L320,135Z" fill="#d6d3d1" />
                {/* Nebraska */}
                <path d="M320,135 L400,130 L410,165 L300,165Z" fill="#e7e5e4" />
                {/* Kansas */}
                <path d="M300,165 L410,165 L415,205 L310,205Z" fill="#d6d3d1" />
                {/* Oklahoma */}
                <path d="M310,205 L415,205 L420,245 L350,250 L310,240Z" fill="#e7e5e4" />
                {/* Texas */}
                <path d="M230,240 L310,240 L350,250 L380,290 L370,350 L320,380 L280,360 L250,310 L230,280Z" fill="#d6d3d1" />
                {/* Minnesota */}
                <path d="M395,65 L460,60 L465,120 L400,130Z" fill="#e7e5e4" />
                {/* Iowa */}
                <path d="M400,130 L465,120 L475,160 L410,165Z" fill="#d6d3d1" />
                {/* Missouri */}
                <path d="M410,165 L475,160 L490,210 L415,205Z" fill="#e7e5e4" />
                {/* Arkansas */}
                <path d="M415,205 L490,210 L495,250 L420,245Z" fill="#d6d3d1" />
                {/* Louisiana */}
                <path d="M420,245 L495,250 L500,300 L460,310 L430,290Z" fill="#e7e5e4" />
                {/* Wisconsin */}
                <path d="M465,60 L530,55 L535,110 L465,120Z" fill="#d6d3d1" />
                {/* Illinois */}
                <path d="M475,160 L530,140 L540,195 L490,210Z" fill="#e7e5e4" />
                {/* Michigan */}
                <path d="M530,55 L570,40 L590,60 L580,110 L535,110Z" fill="#d6d3d1" />
                {/* Indiana */}
                <path d="M540,140 L575,130 L580,185 L545,195Z" fill="#e7e5e4" />
                {/* Ohio */}
                <path d="M575,130 L630,110 L640,160 L580,185Z" fill="#d6d3d1" />
                {/* Kentucky */}
                <path d="M540,195 L580,185 L640,190 L610,215 L530,215Z" fill="#e7e5e4" />
                {/* Tennessee */}
                <path d="M530,215 L610,215 L625,240 L500,245Z" fill="#d6d3d1" />
                {/* Mississippi */}
                <path d="M495,250 L530,248 L535,300 L500,300Z" fill="#e7e5e4" />
                {/* Alabama */}
                <path d="M530,248 L575,245 L580,300 L535,300Z" fill="#d6d3d1" />
                {/* Georgia */}
                <path d="M575,245 L625,240 L640,295 L610,310 L580,300Z" fill="#e7e5e4" />
                {/* Florida */}
                <path d="M580,300 L610,310 L640,295 L660,320 L655,380 L630,400 L600,370 L585,330Z" fill="#d6d3d1" />
                {/* South Carolina */}
                <path d="M625,240 L670,225 L680,260 L640,270Z" fill="#e7e5e4" />
                {/* North Carolina */}
                <path d="M610,215 L700,200 L710,225 L670,225 L625,240Z" fill="#d6d3d1" />
                {/* Virginia */}
                <path d="M640,190 L710,175 L720,200 L700,200 L610,215Z" fill="#e7e5e4" />
                {/* West Virginia */}
                <path d="M640,160 L665,155 L670,185 L640,190Z" fill="#d6d3d1" />
                {/* Pennsylvania */}
                <path d="M630,110 L720,100 L725,135 L640,145Z" fill="#e7e5e4" />
                {/* New York */}
                <path d="M650,60 L730,50 L740,90 L720,100 L650,85Z" fill="#d6d3d1" />
                {/* Vermont */}
                <path d="M730,50 L745,40 L750,65 L740,70Z" fill="#e7e5e4" />
                {/* New Hampshire */}
                <path d="M745,40 L760,35 L762,60 L750,65Z" fill="#d6d3d1" />
                {/* Maine */}
                <path d="M760,15 L790,10 L795,50 L762,55Z" fill="#e7e5e4" />
                {/* Massachusetts */}
                <path d="M740,70 L780,65 L782,80 L742,82Z" fill="#d6d3d1" />
                {/* Connecticut */}
                <path d="M740,82 L770,80 L772,95 L742,95Z" fill="#e7e5e4" />
                {/* New Jersey */}
                <path d="M725,100 L740,95 L745,130 L730,135Z" fill="#d6d3d1" />
                {/* Delaware */}
                <path d="M725,135 L740,132 L742,150 L728,148Z" fill="#e7e5e4" />
                {/* Maryland */}
                <path d="M665,155 L725,145 L728,165 L670,175Z" fill="#d6d3d1" />
                {/* Alaska (inset) */}
                <path d="M80,340 L150,330 L170,350 L155,380 L120,390 L80,370Z" fill="#e7e5e4" />
                {/* Hawaii (inset) */}
                <path d="M200,370 L215,365 L225,375 L218,385 L205,382Z" fill="#d6d3d1" />
              </g>
            </svg>
          </div>

          <p className="text-center text-xs text-secondary mt-6">
            Aggregate persona distribution data across U.S. dating markets. Coming soon.
          </p>
        </div>
      </section>

      {/* ── Science ── */}
      <section className="px-6 py-20">
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
                    <span className="text-secondary mt-0.5">&#8226;</span>
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
              <p className="text-sm text-secondary mt-3 mb-6">The complete picture - all matches, all insights.</p>
              <div className="space-y-2.5 mb-8 flex-1">
                {[
                  'Everything in Free',
                  'All 16 match rankings + details',
                  'Full conflict analysis',
                  'Unlimited AI advisor',
                  'Personalized growth path',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-0.5">&#8226;</span>
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
                    <span className="text-secondary mt-0.5">&#8226;</span>
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
