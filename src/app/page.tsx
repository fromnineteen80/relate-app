import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="font-serif text-xl font-semibold tracking-tight">RELATE</h1>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-secondary hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Start Assessment
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-serif text-4xl font-semibold leading-tight mb-4">
            Relationship intelligence,<br />not relationship advice.
          </h2>
          <p className="text-secondary text-lg mb-8 max-w-xl">
            367 questions across 4 modules. One of 32 personas. Compatibility rankings
            with 16 match types. Data-driven relationship insight.
          </p>
          <Link href="/auth/signup" className="btn-primary inline-block text-base px-6 py-3">
            Begin Assessment
          </Link>
        </section>

        {/* How it works */}
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <h3 className="font-serif text-2xl font-semibold mb-8">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'What You Want', desc: '~134 questions on partner preferences across 4 dimensions', time: '~38 min' },
                { step: '02', title: 'Who You Are', desc: '~137 questions on self-assessment with validation checks', time: '~39 min' },
                { step: '03', title: 'How You Connect', desc: '28 questions on intimacy access patterns', time: '~8 min' },
                { step: '04', title: 'When Things Get Hard', desc: '68 questions on conflict, repair, and capacity', time: '~17 min' },
              ].map((m) => (
                <div key={m.step} className="card">
                  <span className="font-mono text-xs text-secondary">{m.step}</span>
                  <h4 className="font-serif text-lg font-semibold mt-1 mb-2">{m.title}</h4>
                  <p className="text-sm text-secondary mb-2">{m.desc}</p>
                  <span className="text-xs font-mono text-secondary">{m.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <h3 className="font-serif text-2xl font-semibold mb-6">What you get</h3>
            <div className="space-y-3">
              {[
                'Your 4-letter persona code from 32 possible types',
                'Compatibility rankings with all 16 opposite-gender personas',
                'Tension stack analysis across 6 relationship dimensions',
                'Conflict prediction and repair style profiling',
                'Gottman Four Horsemen screening',
                'AI-powered relationship coaching (paid)',
                'Partner comparison reports (couples)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-accent mt-0.5">—</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <h3 className="font-serif text-2xl font-semibold mb-6">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <span className="font-mono text-xs text-secondary">FREE</span>
                <p className="font-serif text-2xl font-semibold mt-1">$0</p>
                <p className="text-sm text-secondary mt-2">Persona code + top 3 match tiers</p>
              </div>
              <div className="card border-accent">
                <span className="font-mono text-xs text-accent">FULL REPORT</span>
                <p className="font-serif text-2xl font-semibold mt-1">$19</p>
                <p className="text-sm text-secondary mt-2">All 16 matches + details + coaching + Claude Advisor</p>
              </div>
              <div className="card">
                <span className="font-mono text-xs text-secondary">COUPLES</span>
                <p className="font-serif text-2xl font-semibold mt-1">$29</p>
                <p className="text-sm text-secondary mt-2">Both partners + comparison + shared Advisor</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4">
        <div className="max-w-5xl mx-auto text-xs text-secondary">
          RELATE — Relationship Intelligence Platform
        </div>
      </footer>
    </div>
  );
}
