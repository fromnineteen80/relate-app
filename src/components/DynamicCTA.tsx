'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getOnboardingStep } from '@/lib/onboarding';

const STEP_CONFIG: Record<string, { label: string; href: string }> = {
  'verify-email': { label: 'Verify Email', href: '/auth/verify-email' },
  'profile': { label: 'Complete Profile', href: '/onboarding/profile' },
  'demographics': { label: 'Continue Setup', href: '/onboarding/demographics' },
  'assessment': { label: 'Continue Assessment', href: '/assessment' },
  'complete': { label: 'View My Assessment', href: '/results' },
};

export function DynamicCTA({ className, fallbackLabel, product }: { className?: string; fallbackLabel?: string; product?: string }) {
  const { user, loading, emailVerified } = useAuth();
  const style = className || 'btn-primary text-base px-8 py-3';

  if (loading) {
    return <span className={`${style} opacity-50 pointer-events-none`}>{fallbackLabel || 'Start Assessment'}</span>;
  }

  if (!user) {
    return (
      <Link href="/auth/signup" className={style}>
        {fallbackLabel || 'Start Assessment'}
      </Link>
    );
  }

  const step = getOnboardingStep(emailVerified);
  const config = STEP_CONFIG[step];

  // For paid products, once assessment is complete, go to checkout
  // Use <a> tag (not Link) because checkout is an API route that redirects to Stripe
  if (product && step === 'complete') {
    return (
      <a href={`/api/checkout?product=${product}&email=${encodeURIComponent(user.email || '')}`} className={style}>
        {fallbackLabel || `Get ${product.charAt(0).toUpperCase() + product.slice(1)}`}
      </a>
    );
  }

  // If user hasn't completed assessment yet, route them through onboarding
  return (
    <Link href={config.href} className={style}>
      {config.label}
    </Link>
  );
}
