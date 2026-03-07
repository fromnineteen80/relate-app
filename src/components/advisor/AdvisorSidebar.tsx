'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdvisor } from '@/lib/advisor-context';
import AdvisorHeader from './AdvisorHeader';
import AdvisorMessages from './AdvisorMessages';
import AdvisorToggle from './AdvisorToggle';

export default function AdvisorSidebar() {
  const { isOpen, close, sendMessage, loading, isLimited, mode, setMode, hasCouplesData } = useAdvisor();
  const [inputValue, setInputValue] = useState('');
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);

  const modeLabels = {
    solo: 'About Me',
    individual: 'Dating Coach',
    couples: 'Couples Coaching',
  } as const;

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading || isLimited) return;
    setInputValue('');
    sendMessage(trimmed);
  }, [inputValue, loading, isLimited, sendMessage]);

  // ESC key to dismiss
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) close();
  }, [isOpen, close]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close mode dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: PointerEvent | MouseEvent) {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setModeDropdownOpen(false);
      }
    }
    if (modeDropdownOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [modeDropdownOpen]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea: min 5 lines, expand as user types
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // Min height = 5 lines (lineHeight ~18px * 5 + padding)
    const minHeight = 110;
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

  return (
    <>
      <AdvisorToggle />

      {/* Sidebar — fixed to left edge, full viewport height, independent of main scroll */}
      <div
        className={`fixed top-0 left-0 h-screen border-r border-stone-200 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
          isOpen
            ? 'w-screen sm:w-[50vw] xl:w-[33vw] z-[60] sm:z-30 bg-white'
            : 'w-0 z-30 bg-stone-50'
        }`}
        role="dialog"
        aria-label="Your Advisor"
        aria-hidden={!isOpen}
      >
        <div className={`flex flex-col h-full min-w-[320px] ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
          <AdvisorHeader />
          <AdvisorMessages hideStarters={inputValue.length > 0} />

          {/* Input field — fixed at the bottom of the sidebar */}
          <div className="border-t border-border p-3 flex-shrink-0">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={isLimited ? 'Upgrade for more messages' : 'Ask anything...'}
                disabled={loading || isLimited}
                rows={5}
                className="w-full border border-stone-200 bg-white rounded-lg px-3 py-2.5 pr-10 text-xs text-secondary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-stone-50 resize-none leading-[18px]"
                style={{ minHeight: '110px' }}
              />

              {/* Mode selector — bottom left inside input area */}
              <div ref={modeRef} className="absolute bottom-2.5 left-2.5">
                <button
                  type="button"
                  onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                  className="flex items-center gap-1 text-[10px] font-sans text-secondary hover:text-foreground transition-colors"
                >
                  <span>{modeLabels[mode]}</span>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4,6 8,10 12,6" />
                  </svg>
                </button>

                {/* Dropdown — appears above the button */}
                {modeDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-1 bg-white border border-border rounded shadow-sm py-1 min-w-[140px] z-10">
                    {(['solo', 'individual', ...(hasCouplesData ? ['couples'] : [])] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => { setMode(m as 'solo' | 'individual' | 'couples'); setModeDropdownOpen(false); }}
                        className={`block w-full text-left px-3 py-1.5 text-[11px] font-sans transition-colors ${
                          mode === m ? 'text-foreground font-medium' : 'text-secondary hover:text-foreground hover:bg-stone-50'
                        }`}
                      >
                        {modeLabels[m as keyof typeof modeLabels]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Send button — inside the input field, bottom right */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || isLimited || !inputValue.trim()}
                aria-label="Send message"
                className="absolute bottom-2.5 right-2.5 bg-accent text-white w-[27px] h-[27px] rounded-md flex items-center justify-center hover:bg-accent-hover transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="14" x2="8" y2="2" />
                  <polyline points="3,7 8,2 13,7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
