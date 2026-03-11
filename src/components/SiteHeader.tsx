'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAdvisor } from '@/lib/advisor-context';
import { useIsMobileDevice } from '@/lib/use-mobile-platform';
import { useLocalStorageBatch } from '@/lib/use-local-storage';
import { Icon } from '@/components/Icon';

const HEADER_STORAGE_KEYS = [
  'relate_profile_name',
  'relate_profile_photo',
  'relate_partner_email',
  'relate_partner_results',
  'relate_couples_discount',
  'relate_payment_tier',
  'relate_attachment_results',
  'relate_attachment_purchased',
  'relate_attachment_access',
  'relate_gender',
  'relate_demographics',
  'relate_astrology_enabled',
] as const;

type SiteHeaderProps = {
  variant?: 'default' | 'landing' | 'auth';
  onSave?: () => void;
  saveState?: boolean;
};

export function SiteHeader({ variant = 'default', onSave, saveState }: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const { user, signOut } = useAuth();
  const { isOpen: advisorOpen, open: openAdvisor, toggle: toggleAdvisor } = useAdvisor();
  const isMobileDevice = useIsMobileDevice();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuth = variant === 'auth';

  // When advisor is open, collapse desktop nav to hamburger format
  const collapseNav = advisorOpen;

  // Publish header height as CSS variable so SubNav can stick below it
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const ls = useLocalStorageBatch(HEADER_STORAGE_KEYS);

  const profileName = ls.relate_profile_name;
  const profilePhoto = ls.relate_profile_photo;
  const hasPartner = !!(ls.relate_partner_email || ls.relate_partner_results);
  const hasCouplesAccess = !!(ls.relate_couples_discount || ls.relate_payment_tier?.includes('couples'));
  const hasAttachment = !!(ls.relate_attachment_results || ls.relate_attachment_purchased || ls.relate_attachment_access?.includes('"purchased":true'));
  const attachmentHasResults = !!ls.relate_attachment_results;
  const isWoman = useMemo(() => {
    const g = ls.relate_gender;
    if (g === 'W') return true;
    try { const d = JSON.parse(ls.relate_demographics || '{}'); return d.gender === 'W'; } catch { return false; }
  }, [ls.relate_gender, ls.relate_demographics]);
  const hasAstrology = useMemo(() => {
    const astroStored = ls.relate_astrology_enabled;
    if (astroStored !== null) return astroStored === 'true';
    return isWoman;
  }, [ls.relate_astrology_enabled, isWoman]);
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
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm" style={{ overflow: 'visible' }}>
      <div className="px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobileDevice && !advisorOpen && (
            <button
              onClick={openAdvisor}
              aria-label="Open advisor"
              className="w-8 h-8 flex items-center justify-center text-secondary hover:text-foreground transition-colors"
            >
              <Icon name="thumbnail_bar" size={19} fill={false} weight={300} />
            </button>
          )}
          <Link href="/" className="font-serif text-base font-semibold tracking-tight">
            RELATE
          </Link>
        </div>

        {isAuth ? null : (
          <div className="flex items-center gap-2">
            {/* Desktop nav links — hidden when advisor pushes content */}
            <nav className={`${collapseNav ? 'hidden' : 'hidden md:flex'} items-center gap-6`}>
              {navLinks.map(link =>
                link.isAnchor ? (
                  <a key={link.label} href={link.href} className="text-xs font-medium text-secondary hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href} className="text-xs font-medium text-secondary hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                )
              )}
              {!user && (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login" className="text-xs font-medium text-secondary hover:text-foreground transition-colors">
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
                  hasAttachment={hasAttachment}
                  attachmentHasResults={attachmentHasResults}
                  isWoman={isWoman}
                  hasAstrology={hasAstrology}
                />
              </>
            )}

            {/* Hamburger — always visible on mobile, also on desktop when advisor is open */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${collapseNav ? '' : 'md:hidden '}w-8 h-8 flex items-center justify-center text-secondary hover:text-foreground transition-colors`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Menu dropdown — shows on mobile, or desktop when advisor is open */}
      {!isAuth && mobileMenuOpen && (
        <div className={`${collapseNav ? '' : 'md:hidden '}border-t border-border bg-white px-6 py-4 animate-fade-in`}>
          <nav className="flex flex-col gap-3">
            {navLinks.map(link =>
              link.isAnchor ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-medium text-secondary hover:text-foreground transition-colors py-1"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs font-medium text-secondary hover:text-foreground transition-colors py-1"
                >
                  {link.label}
                </Link>
              )
            )}
            {!user && (
              <>
                <div className="border-t border-border my-1" />
                <Link href="/auth/login" className="text-xs font-medium text-secondary hover:text-foreground transition-colors py-1">
                  Log in
                </Link>
                <Link href="/auth/signup" className="btn-primary text-center text-xs py-2">
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
  hasAttachment,
  attachmentHasResults,
  isWoman,
  hasAstrology,
}: {
  initial: string;
  photoUrl: string | null;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onSignOut: () => void;
  hasPartner: boolean;
  hasCouplesAccess: boolean;
  hasAttachment: boolean;
  attachmentHasResults: boolean;
  isWoman: boolean;
  hasAstrology: boolean;
}) {
  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors overflow-hidden border-2 border-transparent focus:outline-none ${
          isWoman ? 'hover:border-rose-400 focus:border-rose-400' : 'hover:border-blue-500 focus:border-blue-500'
        }`}
      >
        {photoUrl ? (
          <Image src={photoUrl} alt="Profile" width={28} height={28} className="w-full h-full object-cover rounded-full" />
        ) : (
          <span className={`w-full h-full flex items-center justify-center ${isWoman ? 'text-rose-400 bg-rose-400/15' : 'text-blue-500 bg-blue-500/15'}`}>
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
            ...(hasAttachment ? [{ href: attachmentHasResults ? '/results/attachment' : '/attachment-style', label: 'Attachment Style' }] : []),
            ...(hasAstrology ? [{ href: '/results/astrology', label: 'Sun, Moon & Rise' }] : []),
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-1.5 text-[13px] text-secondary text-right hover:bg-stone-50 hover:text-foreground cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border my-1" />
          {[
            { href: '/settings/profile', label: 'Edit Profile' },
            { href: '/settings/billing', label: 'Billing' },
            { href: '/feedback', label: 'Feedback' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-1.5 text-[13px] text-secondary text-right hover:bg-stone-50 hover:text-foreground cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border my-1" />
          <button
            onClick={() => { setDropdownOpen(false); onSignOut(); }}
            className="block w-full text-right px-4 py-1.5 text-[13px] text-secondary hover:bg-stone-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
