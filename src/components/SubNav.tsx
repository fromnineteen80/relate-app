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
  const [hasPartner, setHasPartner] = useState(false);
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

    // Check for partner
    if (localStorage.getItem('relate_partner_email')) {
      setHasPartner(true);
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

  // On couples pages, show couples section links instead of individual results sublinks
  const isCouplesPage = pathname.startsWith('/results/compare') || pathname.startsWith('/couples');

  const universalLinks: SubNavItem[] = [
    { id: 'account', label: 'Account', href: '/account', show: true },
    { id: 'results', label: 'Results', href: '/results', show: hasResults },
    { id: 'growth', label: 'Growth Plan', href: '/growth', show: hasResults },
    { id: 'couples', label: 'Couples', href: '/results/compare', show: hasPartner },
  ];

  // Build results subpage links when hasResults and on a results subpage (but not couples pages)
  const resultsSubLinks: SubNavItem[] = (hasResults && isResultsSubpage && !isCouplesPage) ? [
    { id: 'persona', label: 'Your Persona', href: '/results/persona', show: true },
    { id: 'match', label: 'Your #1 Match', href: topMatchCode ? `/results/match/${topMatchCode}` : '/results/matches', show: !!topMatchCode },
    { id: 'matches', label: `All Potential ${seekingLabel}`, href: '/results/matches', show: true },
  ] : [];

  const visibleUniversal = universalLinks.filter(l => l.show !== false);
  const visibleResultsSubLinks = resultsSubLinks.filter(l => l.show !== false);
  const visiblePageItems = items.filter(l => l.show !== false);

  // All "before divider" links: universal + results sub-links, all styled dark
  const beforeDividerLinks = [...visibleUniversal, ...visibleResultsSubLinks];

  return (
    <nav className="border-b border-border bg-background sticky top-[49px] z-10">
      <div className="px-6 flex gap-1 overflow-x-auto">
        {beforeDividerLinks.map(link => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.id}
              href={link.href}
              className={`subnav-tab ${isActive ? 'subnav-tab-active' : 'subnav-tab-inactive'}`}
            >
              {link.label}
            </Link>
          );
        })}
        {visiblePageItems.length > 0 && (
          <span className="self-center mx-1 text-border select-none" aria-hidden="true">|</span>
        )}
        {visiblePageItems.map(link => {
          const isAnchor = link.href.startsWith('#');
          if (isAnchor) {
            return (
              <a
                key={link.id}
                href={link.href}
                className="subnav-page-tab subnav-page-tab-inactive"
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
              className={`subnav-page-tab ${isActive ? 'subnav-page-tab-active' : 'subnav-page-tab-inactive'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
