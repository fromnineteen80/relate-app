'use client';

import { useAdvisor } from '@/lib/advisor-context';

/**
 * Collapsed sidebar indicator — a thin vertical bar on the left edge (hidden on mobile/small screens).
 * On mobile, the toggle is handled by the SiteHeader icon instead.
 */
export default function AdvisorToggle() {
  const { isOpen, open } = useAdvisor();

  // Don't show the bar when sidebar is open
  if (isOpen) return null;

  return (
    <div className="hidden md:block fixed top-0 left-0 h-screen z-30">
      <button
        onClick={open}
        aria-label="Open sidebar"
        title="Open sidebar"
        className="group w-[54px] h-full bg-background border-r border-border flex flex-col items-center pt-3 hover:bg-stone-100 transition-colors"
      >
        {/* Sidebar panel icon — matches hamburger icon style */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary group-hover:text-foreground transition-colors">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
        {/* Tooltip */}
        <span className="absolute left-[58px] top-2 px-2 py-1 text-xs text-secondary bg-white border border-border rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Open sidebar
        </span>
      </button>
    </div>
  );
}
