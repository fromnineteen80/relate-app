'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { config } from '@/lib/config';

export function SiteHeader({ variant = 'default' }: { variant?: 'default' | 'landing' | 'auth' }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isLanding = variant === 'landing';
  const isAuth = variant === 'auth';

  return (
    <header className={`px-6 py-4 ${isLanding ? 'absolute top-0 left-0 right-0 z-50' : 'border-b border-border bg-white'}`}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          RELATE
        </Link>

        {isAuth ? null : isLanding ? (
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm text-secondary hover:text-foreground transition-colors hidden md:block">
              About
            </Link>
            <a href="#how-it-works" className="text-sm text-secondary hover:text-foreground transition-colors hidden md:block">
              How It Works
            </a>
            <a href="#personas" className="text-sm text-secondary hover:text-foreground transition-colors hidden md:block">
              Personas
            </a>
            <a href="#pricing" className="text-sm text-secondary hover:text-foreground transition-colors hidden md:block">
              Pricing
            </a>
            {user ? (
              <Link href="/assessment" className="btn-primary text-xs px-3 py-1.5">
                Continue Assessment
              </Link>
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
        ) : (
          <nav className="flex items-center gap-1">
            {config.useMockAuth && (
              <span className="text-xs font-mono bg-warning/10 text-warning px-2 py-1 rounded mr-2">[TEST]</span>
            )}
            <NavLink href="/assessment" current={pathname}>Assessment</NavLink>
            <NavLink href="/results" current={pathname}>Results</NavLink>
            <NavLink href="/personas" current={pathname}>Personas</NavLink>
            <NavLink href="/account" current={pathname}>Account</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, current, children }: { href: string; current: string; children: React.ReactNode }) {
  const isActive = current === href || current.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
        isActive
          ? 'bg-accent/10 text-accent font-medium'
          : 'text-secondary hover:text-foreground hover:bg-stone-100'
      }`}
    >
      {children}
    </Link>
  );
}
