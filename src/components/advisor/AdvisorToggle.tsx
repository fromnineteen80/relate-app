'use client';

import { useAdvisor } from '@/lib/advisor-context';

export default function AdvisorToggle() {
  const { toggle, isOpen } = useAdvisor();

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Collapse advisor panel' : 'Expand advisor panel'}
      className={`fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
        isOpen
          ? 'bg-stone-700 text-white scale-90'
          : 'bg-accent text-white hover:bg-accent-hover hover:scale-105'
      }`}
    >
      {isOpen ? (
        /* Collapse panel icon — left-pointing sidebar collapse (PanelLeftClose) */
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <polyline points="17 8 13 12 17 16" />
        </svg>
      ) : (
        /* Expand panel icon — right-pointing sidebar open (PanelLeftOpen) */
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <polyline points="14 8 18 12 14 16" />
        </svg>
      )}
    </button>
  );
}
