'use client';

import { useState, useCallback } from 'react';
import { useAdvisor } from '@/lib/advisor-context';

export default function AdvisorInput() {
  const { sendMessage, loading, isLimited } = useAdvisor();
  const [value, setValue] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading || isLimited) return;
    setValue('');
    sendMessage(trimmed);
  }, [value, loading, isLimited, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="border-t border-stone-200 px-4 py-3 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLimited ? 'Upgrade for more messages' : 'Ask anything...'}
          disabled={loading || isLimited}
          className="flex-1 border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-stone-50"
        />
        <button
          type="submit"
          disabled={loading || isLimited || !value.trim()}
          className="bg-accent text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="14" x2="8" y2="2" />
            <polyline points="3,7 8,2 13,7" />
          </svg>
        </button>
      </form>
    </div>
  );
}
