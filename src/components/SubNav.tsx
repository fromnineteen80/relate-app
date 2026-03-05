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

  useEffect(() => {
    setHasResults(!!localStorage.getItem('relate_results'));
  }, []);

  const universalLinks: SubNavItem[] = [
    { id: 'account', label: 'Account', href: '/account', show: true },
    { id: 'results', label: 'Results', href: '/results', show: hasResults },
  ];

  const visibleUniversal = universalLinks.filter(l => l.show !== false);
  const visibleItems = items.filter(l => l.show !== false);

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
        {visibleItems.length > 0 && (
          <span className="self-center mx-1 text-border select-none" aria-hidden="true">|</span>
        )}
        {visibleItems.map(link => {
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
