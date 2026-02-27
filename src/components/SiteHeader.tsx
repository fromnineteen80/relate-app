'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function SiteHeader({ variant = 'default' }: { variant?: 'default' | 'landing' | 'auth' }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuth = variant === 'auth';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const profileName = typeof window !== 'undefined' ? localStorage.getItem('relate_profile_name') : null;
  const profilePhoto = typeof window !== 'undefined' ? localStorage.getItem('relate_profile_photo') : null;
  const initial = profileName ? profileName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?';

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <header className="px-6 py-4 sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          RELATE
        </Link>

        {isAuth ? null : (
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm text-secondary hover:text-foreground transition-colors hidden md:block">
              About
            </Link>
            <a href={pathname === '/' ? '#how-it-works' : '/#how-it-works'} className="text-sm text-secondary hover:text-foreground transition-colors hidden md:block">
              How It Works
            </a>
            <Link href="/personas" className="text-sm text-secondary hover:text-foreground transition-colors hidden md:block">
              Personas
            </Link>
            <a href={pathname === '/' ? '#pricing' : '/#pricing'} className="text-sm text-secondary hover:text-foreground transition-colors hidden md:block">
              Pricing
            </a>
            {user ? (
              <ProfileAvatar
                initial={initial}
                photoUrl={profilePhoto}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                dropdownRef={dropdownRef}
                onSignOut={handleSignOut}
              />
            ) : (
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
        )}
      </div>
    </header>
  );
}

function ProfileAvatar({
  initial,
  photoUrl,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  onSignOut,
}: {
  initial: string;
  photoUrl: string | null;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onSignOut: () => void;
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
          <Link href="/account" className="block px-4 py-2 text-sm text-secondary hover:bg-stone-50 hover:text-foreground">
            Account
          </Link>
          <Link href="/assessment" className="block px-4 py-2 text-sm text-secondary hover:bg-stone-50 hover:text-foreground">
            Assessment
          </Link>
          <Link href="/results" className="block px-4 py-2 text-sm text-secondary hover:bg-stone-50 hover:text-foreground">
            Results
          </Link>
          <Link href="/settings/profile" className="block px-4 py-2 text-sm text-secondary hover:bg-stone-50 hover:text-foreground">
            Edit Profile
          </Link>
          <Link href="/settings/billing" className="block px-4 py-2 text-sm text-secondary hover:bg-stone-50 hover:text-foreground">
            Billing
          </Link>
          <div className="border-t border-border my-1" />
          <button
            onClick={onSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-stone-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
