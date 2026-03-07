'use client';

import { useAdvisor } from '@/lib/advisor-context';

export default function AdvisorHeader() {
  const { close, mode, setMode, hasCouplesData } = useAdvisor();

  const modeLabels = {
    solo: 'Individual',
    individual: 'My Relationship',
    couples: 'Together',
  } as const;

  return (
    <div className="border-b border-border px-4 py-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-base font-semibold text-secondary">Your Advisor</h2>
        {/* Sidebar panel icon — close sidebar */}
        <button
          onClick={close}
          aria-label="Close sidebar"
          title="Close sidebar"
          className="group relative text-secondary hover:text-foreground transition-colors p-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 4v16h20V4H2zm2 14V6h5v12H4zm7 0V6h9v12h-9z"/>
          </svg>
          {/* Tooltip */}
          <span className="absolute right-0 top-full mt-1 px-2 py-1 text-xs text-secondary bg-white border border-border rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
            Close sidebar
          </span>
        </button>
      </div>

      {hasCouplesData && (
        <div className="flex gap-1 mt-2">
          {(['solo', 'individual', 'couples'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                mode === m
                  ? 'bg-accent text-white'
                  : 'bg-stone-100 text-secondary hover:bg-stone-200'
              }`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
