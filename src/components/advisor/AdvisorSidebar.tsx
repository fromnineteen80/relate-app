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

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <AdvisorToggle />

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-200"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 z-50 h-full bg-white border-l border-stone-200 shadow-xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full sm:w-[400px]`}
        role="dialog"
        aria-label="RELATE Advisor"
        aria-hidden={!isOpen}
      >
        <AdvisorHeader />
        <AdvisorMessages />
        <AdvisorInput />
      </div>
    </>
  );
}
