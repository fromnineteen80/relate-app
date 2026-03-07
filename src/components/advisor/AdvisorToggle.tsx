'use client';

import { useAdvisor } from '@/lib/advisor-context';
import { Icon } from '@/components/Icon';

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
        className="group w-[54px] h-full bg-stone-50 border-r border-border flex flex-col items-center pt-3 hover:bg-stone-100 transition-colors"
      >
        <Icon name="thumbnail_bar" size={20} fill={false} className="text-secondary group-hover:text-foreground transition-colors" />
        {/* Tooltip */}
        <span className="absolute left-[58px] top-2 px-2 py-1 text-xs text-secondary bg-white border border-border rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          Open sidebar
        </span>
      </button>
    </div>
  );
}
