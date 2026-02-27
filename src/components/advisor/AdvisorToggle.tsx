'use client';

import { useAdvisor } from '@/lib/advisor-context';

export default function AdvisorToggle() {
  const { toggle, isOpen } = useAdvisor();

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close advisor' : 'Open advisor'}
      className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
        isOpen
          ? 'bg-stone-700 text-white scale-90'
          : 'bg-accent text-white hover:bg-accent-hover hover:scale-105'
      }`}
    >
      {isOpen ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="4" x2="14" y2="14" />
          <line x1="14" y1="4" x2="4" y2="14" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h12M4 10h8M4 14h10" />
        </svg>
      )}
    </button>
  );
}
