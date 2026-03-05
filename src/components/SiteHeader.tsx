'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type SiteHeaderProps = {
  variant?: 'default' | 'landing' | 'auth';
  onSave?: () => void;
  saveState?: boolean;
};

export function SiteHeader({ variant = 'default', onSave, saveState }: SiteHeaderProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuth = variant === 'auth';

  // Close dropdown when clicking/tapping outside (pointerdown works across mouse, touch, pen)
  useEffect(() => {
    function handleClickOutside(e: PointerEvent | MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('pointerdown', handleClickOutside);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const profileName = typeof window !== 'undefined' ? localStorage.getItem('relate_profile_name') : null;
  const profilePhoto = typeof window !== 'undefined' ? localStorage.getItem('relate_profile_photo') : null;
  const hasPartner = typeof window !== 'undefined' ? !!localStorage.getItem('relate_partner_results') : false;
  const hasCouplesAccess = typeof window !== 'undefined'
    ? !!(localStorage.getItem('relate_couples_discount') || localStorage.getItem('relate_payment_tier')?.includes('couples'))
    : false;
  const initial = profileName ? profileName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?';

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  const navLinks = [
    { href: '/about', label: 'About', isAnchor: false },
    { href: '/personas', label: 'Personas', isAnchor: false },
    { href: '/methodology', label: 'Methodology', isAnchor: false },
    { href: pathname === '/' ? '#pricing' : '/#pricing', label: 'Pricing', isAnchor: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm" style={{ overflow: 'visible' }}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          RELATE
        </Link>

        {isAuth ? null : (
          <div className="flex items-center gap-2">
            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(link =>
                link.isAnchor ? (
                  <a key={link.label} href={link.href} className="text-sm text-secondary hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href} className="text-sm text-secondary hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                )
              )}
              {!user && (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login" className="text-sm text-secondary hover:text-foreground transition-colors">
                    Log in
                  </Link>
                  <Link href="/auth/signup" className="btn-primary text-xs px-3 py-1.5">
                    Start Free
                  </Link>
                </div>
              )}
            </nav>

            {/* Single ProfileAvatar instance shared by desktop & mobile */}
            {user && (
              <>
                {onSave && <SaveButton onSave={onSave} externalSaved={saveState} />}
                <ProfileAvatar
                  initial={initial}
                  photoUrl={profilePhoto}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                  dropdownRef={dropdownRef}
                  onSignOut={handleSignOut}
                  hasPartner={hasPartner}
                  hasCouplesAccess={hasCouplesAccess}
                />
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-secondary hover:text-foreground transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {!isAuth && mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-6 py-4 animate-fade-in">
          <nav className="flex flex-col gap-3">
            {navLinks.map(link =>
              link.isAnchor ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-secondary hover:text-foreground transition-colors py-1"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-secondary hover:text-foreground transition-colors py-1"
                >
                  {link.label}
                </Link>
              )
            )}
            {!user && (
              <>
                <div className="border-t border-border my-1" />
                <Link href="/auth/login" className="text-sm text-secondary hover:text-foreground transition-colors py-1">
                  Log in
                </Link>
                <Link href="/auth/signup" className="btn-primary text-center text-sm py-2">
                  Start Free
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function SaveButton({ onSave, externalSaved }: { onSave: () => void; externalSaved?: boolean }) {
  // Use external saved state (persistent) if provided, otherwise fall back to internal timer-based
  const showSaved = externalSaved ?? false;

  return (
    <button
      onClick={onSave}
      className="flex items-center gap-1.5 text-sm text-secondary hover:text-foreground transition-colors mr-2"
      aria-label="Save progress"
    >
      {showSaved ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
          <span className="text-success text-xs font-medium">Saved</span>
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.5 14H3.5C2.95 14 2.5 13.55 2.5 13V3C2.5 2.45 2.95 2 3.5 2H10.5L13.5 5V13C13.5 13.55 13.05 14 12.5 14Z" />
            <path d="M11.5 14V9H4.5V14" />
            <path d="M4.5 2V5.5H9.5" />
          </svg>
          <span className="hidden sm:inline text-xs">Save</span>
        </>
      )}
    </button>
  );
}

function ProfileAvatar({
  initial,
  photoUrl,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  onSignOut,
  hasPartner,
  hasCouplesAccess,
}: {
  initial: string;
  photoUrl: string | null;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onSignOut: () => void;
  hasPartner: boolean;
  hasCouplesAccess: boolean;
}) {
  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors overflow-hidden border-2 border-transparent hover:border-accent focus:border-accent focus:outline-none"
      >
        {photoUrl ? (
          <Image src={photoUrl} alt="Profile" width={32} height={32} className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className="w-full h-full flex items-center justify-center bg-accent/10 text-accent">
            {initial}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-lg py-1 z-50">
          {[
            { href: '/account', label: 'Account' },
            { href: '/assessment', label: 'Assessment' },
            { href: '/results', label: 'Your Results' },
            ...(hasPartner ? [{ href: hasCouplesAccess ? '/results/compare' : '/invite', label: 'Couples Results' }] : []),
            { href: '/settings/profile', label: 'Edit Profile' },
            { href: '/settings/billing', label: 'Billing' },
            { href: '/feedback', label: 'Feedback' },
            { href: '/results/astrology', label: 'Sun, Moon & Rise' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-sm text-secondary hover:bg-stone-50 hover:text-foreground cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border my-1" />
          <button
            onClick={() => { setDropdownOpen(false); onSignOut(); }}
            className="block w-full text-left px-4 py-2 text-sm text-secondary hover:bg-stone-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
