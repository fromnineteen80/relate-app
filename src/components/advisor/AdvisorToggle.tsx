'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAdvisor } from '@/lib/advisor-context';

interface AdvisorToggleProps {
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: () => void;
}

export default function AdvisorToggle({ inputValue = '', onInputChange, onSubmit }: AdvisorToggleProps) {
  const { toggle, isOpen, loading, isLimited } = useAdvisor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  // Auto-resize textarea: min 3 lines, expand as user types
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // Min height = 3 lines (lineHeight ~18px * 3 + padding)
    const minHeight = 62;
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

  return (
    <div className="fixed bottom-6 left-6 z-[70] flex items-end gap-2">
      {/* Toggle / close button — smaller circles */}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close advisor' : 'Open advisor'}
        className={`flex-shrink-0 w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-stone-900 text-white'
            : 'bg-accent text-white hover:bg-accent-hover hover:scale-105'
        }`}
      >
        {isOpen ? (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <polyline points="14 8 18 12 14 16" />
          </svg>
        )}
      </button>

      {/* Input area — appears when sidebar is open, textarea that expands */}
      {isOpen && (
        <div className="flex items-end gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={e => onInputChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLimited ? 'Upgrade for more messages' : 'Ask anything...'}
            disabled={loading || isLimited}
            rows={3}
            className="w-56 sm:w-72 border border-stone-200 bg-white rounded-xl px-4 py-2.5 text-xs shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-stone-50 resize-none leading-[18px]"
            style={{ minHeight: '62px' }}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || isLimited || !inputValue.trim()}
            aria-label="Send message"
            className="flex-shrink-0 bg-accent text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="14" x2="8" y2="2" />
              <polyline points="3,7 8,2 13,7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
