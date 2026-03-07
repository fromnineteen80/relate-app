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
        className="group w-16 h-full bg-white border-r border-border flex flex-col items-center pt-3 hover:bg-stone-50 transition-colors"
      >
        {/* Sidebar panel icon — positioned at top to align with header */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-secondary group-hover:text-foreground transition-colors">
          <path d="M2 4v16h20V4H2zm2 14V6h5v12H4zm7 0V6h9v12h-9z"/>
        </svg>
        {/* Tooltip */}
        <span className="absolute left-[68px] top-2 px-2 py-1 text-xs text-secondary bg-white border border-border rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Open sidebar
        </span>
      </button>
    </div>
  );
}
