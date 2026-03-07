'use client';

import { useAdvisor } from '@/lib/advisor-context';

export default function AdvisorHeader() {
  const { close } = useAdvisor();

  return (
    <div className="border-b border-border px-4 py-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-base font-semibold text-secondary">Your Advisor</h2>
        {/* Sidebar panel icon — close sidebar, matches hamburger icon style */}
        <button
          onClick={close}
          aria-label="Close sidebar"
          title="Close sidebar"
          className="group relative text-secondary hover:text-foreground transition-colors p-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
          {/* Tooltip */}
          <span className="absolute right-0 top-full mt-1 px-2 py-1 text-xs text-secondary bg-white border border-border rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
            Close sidebar
          </span>
        </button>
      </div>
    </div>
  );
}
