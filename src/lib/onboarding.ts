'use client';

export type OnboardingStep = 'verify-email' | 'profile' | 'demographics' | 'assessment' | 'complete';

export function getProfile(): { firstName: string; lastName: string; zipCode: string; city: string; state: string; county: string; photoUrl: string | null } | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('relate_profile');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isProfileComplete(): boolean {
  const profile = getProfile();
  if (!profile) return false;
  return !!(profile.firstName && profile.lastName && profile.zipCode && profile.city && profile.state && profile.county);
}

export function hasDemographics(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('relate_demographics');
}

export function getOnboardingStep(emailVerified: boolean): OnboardingStep {
  if (!emailVerified) return 'verify-email';
  if (!isProfileComplete()) return 'profile';
  if (!hasDemographics()) return 'demographics';

  // Check if assessment is complete
  const allComplete = [1, 2, 3, 4].every(
    m => localStorage.getItem(`relate_m${m}_completed`) === 'true'
  );
  if (allComplete) return 'complete';
  return 'assessment';
}

export function getOnboardingRedirect(emailVerified: boolean): string {
  const step = getOnboardingStep(emailVerified);
  switch (step) {
    case 'verify-email': return '/auth/verify-email';
    case 'profile': return '/onboarding/profile';
    case 'demographics': return '/onboarding/demographics';
    case 'assessment': return '/assessment';
    case 'complete': return '/account';
  }
}
