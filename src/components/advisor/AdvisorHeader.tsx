'use client';

import { useAdvisor } from '@/lib/advisor-context';

interface AdvisorHeaderProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}

export default function AdvisorHeader({ inputValue, onInputChange, onSubmit }: AdvisorHeaderProps) {
  const { close, mode, setMode, hasCouplesData, loading, isLimited } = useAdvisor();

  const modeLabels = {
    solo: 'Individual',
    individual: 'My Relationship',
    couples: 'Together',
  } as const;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-b border-border px-4 py-3 flex-shrink-0">
      {/* Top row: close button + input + send */}
      <div className="flex items-center gap-2">
        <button
          onClick={close}
          aria-label="Close advisor"
          className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLimited ? 'Upgrade for more messages' : 'Ask anything...'}
          disabled={loading || isLimited}
          className="flex-1 min-w-0 border border-stone-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-stone-50"
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || isLimited || !inputValue.trim()}
          aria-label="Send message"
          className="flex-shrink-0 bg-accent text-white w-8 h-8 rounded-md flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="14" x2="8" y2="2" />
            <polyline points="3,7 8,2 13,7" />
          </svg>
        </button>
      </div>

      {/* Mode tabs */}
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
