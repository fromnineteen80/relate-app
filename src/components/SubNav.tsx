'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type SubNavItem = {
  id: string;
  label: string;
  href: string;
  show?: boolean;
};

type SubNavProps = {
  /** Page-specific links (rendered after the universal Account / Results links) */
  items?: SubNavItem[];
};

export function SubNav({ items = [] }: SubNavProps) {
  const pathname = usePathname();
  const [hasResults, setHasResults] = useState(false);
  const [topMatchCode, setTopMatchCode] = useState<string | null>(null);
  const [seekingLabel, setSeekingLabel] = useState<string>('Matches');

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (stored) {
      setHasResults(true);
      try {
        const parsed = JSON.parse(stored);
        if (parsed.matches?.[0]?.code) {
          setTopMatchCode(parsed.matches[0].code);
        }
      } catch { /* */ }
    }

    // Determine seeking label from gender (user's gender → they're seeking the opposite)
    const gender = localStorage.getItem('relate_gender');
    if (gender === 'M' || gender === 'Man') {
      setSeekingLabel('Female Matches');
    } else if (gender === 'W' || gender === 'Woman') {
      setSeekingLabel('Male Matches');
    }
  }, []);

  // Show results sublinks on results subpages (persona, match, matches, etc.) but NOT the root /results page
  const isResultsSubpage = pathname.startsWith('/results/');

  const universalLinks: SubNavItem[] = [
    { id: 'account', label: 'Account', href: '/account', show: true },
    { id: 'results', label: 'Results', href: '/results', show: hasResults },
  ];

  // Build results subpage links when hasResults and on a results subpage
  const resultsSubLinks: SubNavItem[] = (hasResults && isResultsSubpage) ? [
    { id: 'persona', label: 'Your Persona', href: '/results/persona', show: true },
    { id: 'match', label: 'Your #1 Match', href: topMatchCode ? `/results/match/${topMatchCode}` : '/results/matches', show: !!topMatchCode },
    { id: 'matches', label: `All Potential ${seekingLabel}`, href: '/results/matches', show: true },
  ] : [];

  const visibleUniversal = universalLinks.filter(l => l.show !== false);
  const allPageItems = [...resultsSubLinks, ...items].filter(l => l.show !== false);

  return (
    <nav className="border-b border-border bg-background sticky top-[65px] z-10">
      <div className="max-w-3xl mx-auto px-6 flex gap-1 overflow-x-auto">
        {visibleUniversal.map(link => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.id}
              href={link.href}
              className={`text-xs font-semibold px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary hover:text-primary hover:border-primary'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {allPageItems.length > 0 && (
          <span className="self-center mx-1 text-border select-none" aria-hidden="true">|</span>
        )}
        {allPageItems.map(link => {
          const isAnchor = link.href.startsWith('#');
          if (isAnchor) {
            return (
              <a
                key={link.id}
                href={link.href}
                className="text-xs font-medium px-3 py-2.5 border-b-2 border-transparent hover:border-accent transition-colors whitespace-nowrap text-secondary hover:text-primary"
              >
                {link.label}
              </a>
            );
          }
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.id}
              href={link.href}
              className={`text-xs font-medium px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-accent text-primary'
                  : 'border-transparent text-secondary hover:text-primary hover:border-accent'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
