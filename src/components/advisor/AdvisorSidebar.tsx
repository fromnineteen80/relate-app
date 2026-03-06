'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdvisor } from '@/lib/advisor-context';
import AdvisorHeader from './AdvisorHeader';
import AdvisorMessages from './AdvisorMessages';
import AdvisorToggle from './AdvisorToggle';

export default function AdvisorSidebar() {
  const { isOpen, close, sendMessage, loading, isLimited } = useAdvisor();
  const [inputValue, setInputValue] = useState('');

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

  return (
    <>
      <AdvisorToggle />

      {/* Sidebar — left side, in-flow flex child, pushes content right */}
      <div
        className={`flex-shrink-0 border-r border-stone-200 bg-white flex flex-col transition-all duration-300 ease-out overflow-hidden ${
          isOpen
            ? 'w-screen sm:w-[50vw] xl:w-[33vw]'
            : 'w-0'
        }`}
        style={{ height: '100vh', position: 'sticky', top: 0 }}
        role="dialog"
        aria-label="Your Advisor"
        aria-hidden={!isOpen}
      >
        <div className={`flex flex-col h-full min-w-[320px] ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
          <AdvisorHeader
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleSubmit}
          />
          <AdvisorMessages hideStarters={inputValue.length > 0} />
        </div>
      </div>
    </>
  );
}
