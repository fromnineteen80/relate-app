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
      <div className="w-[54px] h-full bg-stone-50 border-r border-border flex flex-col items-center pt-3">
        <button
          onClick={open}
          aria-label="Open sidebar"
          title="Open sidebar"
          className="text-secondary"
        >
          <Icon name="thumbnail_bar" size={19} fill={false} weight={300} />
        </button>
      </div>
    </div>
  );
}
