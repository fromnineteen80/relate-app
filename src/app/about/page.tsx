import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="landing" />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 bg-gradient-to-b from-stone-100 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-widest text-accent uppercase mb-4">About Relate</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.1] mb-6">
            The Intelligence Layer For Modern Dating
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Relate is a wellness platform bringing clarity to a broken dating economy by helping users understand their true market position, make smarter choices and initiate personal growth. Relate&apos;s data and AI solutions, coupled with our network of licensed therapists and coaches, changes modern dating forever.
          </p>
        </div>
      </section>

      {/* ── Intelligence Layer ── */}
      <section className="px-6 py-20 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-8 text-center">
            Introducing the first dating and relationship intelligence layer.
          </h2>
          <ul className="space-y-3 max-w-lg mx-auto">
            {[
              'Understand the dating economy',
              'Pinpoint your ideal partner',
              'Plan more meaningful dates',
              'Professional support that fits your journey',
              'Build better and lasting relationships',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-secondary">
                <span className="text-accent mt-0.5">&#9702;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Key Pillars ── */}
      <section className="px-6 py-20 bg-stone-50 border-b border-border">
        <div className="max-w-3xl mx-auto space-y-14">
          <div>
            <h3 className="font-serif text-xl font-semibold mb-3">Solving App Fatigue</h3>
            <p className="text-secondary leading-relaxed">
              Relate replaces blind swiping and today&apos;s dating app ecosystem with clear, data-driven intelligence at a time when 80% of Gen Z report dating app burnout and rising costs are pricing many out of meaningful connection. We solve fatigue and frustration by setting goals and optimizing everything that goes into connecting with your ideal partner.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-semibold mb-3">Introducing Dating Market Search</h3>
            <p className="text-secondary leading-relaxed">
              60 million Americans reported using a dating app last year. Relate helps users understand how many potential partners exist in their area. We also give users a score based on match preference and a personalized compatibility scale, turning the dating process from guesswork into informed action.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-semibold mb-3">Real Data, Real Clarity</h3>
            <p className="text-secondary leading-relaxed">
              Our platform fuses census data, survey insights, and live behavior to reveal both metro area, state and national trends, helping users understand shifting demand and availability in real time. Results funnel users to the support they need to achieve dating success.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-semibold mb-3">Guided Growth Loop</h3>
            <p className="text-secondary leading-relaxed">
              A built-in feedback engine delivers AI and live coaching along with profile insights that encourage smarter filtering, better communication, and self-improvement over time.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-xs tracking-widest text-accent uppercase mb-3">The Problem</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">
              Competition in any marketplace is healthy, but only when it is informed.
            </h2>
          </div>

          <div className="space-y-6 text-secondary leading-relaxed">
            <p>
              In today&apos;s dating economy, singles navigate without data, reacting to misrepresentation and noise instead of making strategic moves.
            </p>

            <p>
              Most dating experiences today reinforce a system broken by the dating app dilemma. They offer endless curated illusions of choice while hiding the real dynamics shaping attraction and compatibility. Users filter for looks or vague lifestyle signals and present idealized versions of themselves, which leads to mismatches, ghosting, and emotional churn. Even exclusive apps and offline networks suffer from the harm done to the broader dating marketplace.
            </p>

            <p>
              A 2024 Forbes Health survey found 78% of dating app users feel emotionally burnt out, with women (80%) more affected than men (74%). A recent PsyPost study found socially anxious and lonely individuals are more likely to use dating apps compulsively, leading to negative outcomes in personal and work lives. In December 2024, Australian researchers published an astonishing paper showing 85% of all available academic studies on dating apps point to an adverse impact on body image issues and a significant decline in mental health. Despite spending nearly $200 per month on dates, grooming, and self-improvement, most struggle to gauge their market value or understand the regional dynamics that determine match success. The lack of transparency leaves users cycling through apps and low-quality dates without feedback or guidance. The result is growing frustration, wasted time, and financial stress.
            </p>

            <p>
              At the same time, most dating apps and other wellness platforms address only isolated parts of the relationship journey, profile discovery, and desirability, communication or commitment. The entire experience lacks data, integrated coaching, planning, and relationship-building packaged into a continuous, measurable journey. This unscientific and unfriendly experience results in users cobbling together multiple app subscriptions, and significant date churn, without positive results. The result is low-confidence ecosystem that fails to support singles through the most critical transition of their adult lives: from swiping right to ultimately a committed partnership.
            </p>

            <p className="font-serif text-foreground text-xl font-semibold text-center pt-4">
              It&apos;s time for a better solution.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 bg-stone-50 border-t border-border">
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
