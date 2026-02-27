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
    <div className="border-b border-stone-200 px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-base font-semibold">RELATE Advisor</h2>
        <button
          onClick={close}
          aria-label="Close advisor"
          className="text-secondary hover:text-foreground transition-colors p-1"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>
      </div>

      {hasCouplesData && (
        <div className="flex gap-1">
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
