'use client';

import { useAdvisor } from '@/lib/advisor-context';

interface AdvisorToggleProps {
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: () => void;
}

export default function AdvisorToggle({ inputValue = '', onInputChange, onSubmit }: AdvisorToggleProps) {
  const { toggle, isOpen, loading, isLimited } = useAdvisor();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
      {/* Toggle / close button */}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close advisor' : 'Open advisor'}
        className={`flex-shrink-0 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-stone-900 text-white'
            : 'bg-accent text-white hover:bg-accent-hover hover:scale-105'
        }`}
      >
        {isOpen ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <polyline points="14 8 18 12 14 16" />
          </svg>
        )}
      </button>

      {/* Input field — appears when sidebar is open */}
      {isOpen && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <input
            type="text"
            value={inputValue}
            onChange={e => onInputChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLimited ? 'Upgrade for more messages' : 'Ask anything...'}
            disabled={loading || isLimited}
            className="w-56 sm:w-72 border border-stone-200 bg-white rounded-full px-4 py-2.5 text-[13px] shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-stone-50"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || isLimited || !inputValue.trim()}
            aria-label="Send message"
            className="flex-shrink-0 bg-accent text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="14" x2="8" y2="2" />
              <polyline points="3,7 8,2 13,7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
