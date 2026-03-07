import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-serif text-lg font-semibold">RELATE</p>
            <p className="text-xs text-secondary mt-1">Relationship Intelligence Platform</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-secondary">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/methodology" className="hover:text-foreground transition-colors">Methodology</Link>
            <Link href="/personas" className="hover:text-foreground transition-colors">Personas</Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border text-xs text-secondary">
          RELATE draws from Gottman Method, Emotionally Focused Therapy, Attachment Theory, and Internal Family Systems. This is not a diagnostic tool and does not replace licensed therapy.
        </div>
      </div>
    </footer>
  );
}
