'use client';

import { useEffect, useCallback } from 'react';
import { useAdvisor } from '@/lib/advisor-context';
import AdvisorHeader from './AdvisorHeader';
import AdvisorMessages from './AdvisorMessages';
import AdvisorInput from './AdvisorInput';
import AdvisorToggle from './AdvisorToggle';

export default function AdvisorSidebar() {
  const { isOpen, close } = useAdvisor();

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

      {/* Sidebar — in-flow flex child, pushes content instead of overlaying */}
      <div
        className={`flex-shrink-0 border-l border-stone-200 bg-white flex flex-col transition-all duration-300 ease-out overflow-hidden ${
          isOpen
            ? 'w-full sm:w-[50vw] xl:w-[33vw]'
            : 'w-0'
        }`}
        style={{ height: '100vh', position: 'sticky', top: 0 }}
        role="dialog"
        aria-label="RELATE Advisor"
        aria-hidden={!isOpen}
      >
        <div className={`flex flex-col h-full min-w-[320px] ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
          <AdvisorHeader />
          <AdvisorMessages />
          <AdvisorInput />
        </div>
      </div>
    </>
  );
}
