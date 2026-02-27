'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getMockPaymentStatus } from '@/lib/mock/payments';
import { config } from '@/lib/config';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Message = { role: 'user' | 'assistant'; content: string };

type AdvisorContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  loading: boolean;
  mode: 'solo' | 'individual' | 'couples';
  setMode: (m: 'solo' | 'individual' | 'couples') => void;
  hasCouplesData: boolean;
  messageCount: number;
  isLimited: boolean;
  starters: string[];
};

const AdvisorContext = createContext<AdvisorContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
  messages: [],
  sendMessage: async () => {},
  loading: false,
  mode: 'solo',
  setMode: () => {},
  hasCouplesData: false,
  messageCount: 0,
  isLimited: false,
  starters: [],
});

const FREE_MESSAGE_LIMIT = 3;

// Contextual starters based on current route
function getStarters(pathname: string, hasCouples: boolean): string[] {
  if (pathname.includes('module-1')) {
    return [
      "I'm not sure how to answer this question",
      "What if I want both options?",
      "How do my preferences affect my matches?",
    ];
  }
  if (pathname.includes('module-2')) {
    return [
      "This question feels uncomfortable",
      "I answered differently than I expected",
      "What if I'm not sure who I really am?",
    ];
  }
  if (pathname.includes('module-3')) {
    return [
      "What does 'context-switching' mean?",
      "Is it bad to want more than I offer?",
      "How does attentiveness affect relationships?",
    ];
  }
  if (pathname.includes('module-4')) {
    return [
      "I don't like what this says about me",
      "Can I change my conflict patterns?",
      "What are the Gottman horsemen?",
    ];
  }
  if (pathname.includes('/couples')) {
    return [
      "Where do we clash the most?",
      "What's our biggest risk as a couple?",
      "Give us a conversation starter",
      "Suggest a date based on our profiles",
    ];
  }
  if (pathname.includes('/results')) {
    return [
      "Explain my persona to me",
      "What should I work on first?",
      "How do I talk to my partner about this?",
    ];
  }
  if (pathname.includes('/assessment')) {
    return [
      "How long does this take?",
      "Why these specific questions?",
      "What will I learn about myself?",
    ];
  }
  if (hasCouples) {
    return [
      "What's our biggest strength?",
      "How can we improve our conflict pattern?",
      "Suggest something for us this week",
    ];
  }
  return [
    "What are my biggest strengths in relationships?",
    "How can I improve my conflict repair?",
    "What should I look for in a partner?",
  ];
}

// Build location context string
function getLocationContext(pathname: string): string {
  if (pathname.includes('module-1')) return 'The user is currently in Module 1 (What They Want). They are answering questions about their preferences in a partner.';
  if (pathname.includes('module-2')) return 'The user is currently in Module 2 (Who They Are). They are answering questions about themselves.';
  if (pathname.includes('module-3')) return 'The user is currently in Module 3 (How They Connect). They are answering questions about intimacy and attention patterns.';
  if (pathname.includes('module-4')) return 'The user is currently in Module 4 (When Things Get Hard). They are answering questions about conflict patterns.';
  if (pathname.includes('/results/compare')) return 'The user is viewing their couples compatibility report.';
  if (pathname.includes('/results')) return 'The user is viewing their individual results. They have access to their persona, matches, and conflict profile.';
  if (pathname.includes('/couples')) return 'The user is on the couples dashboard, working on their relationship growth plan.';
  if (pathname.includes('/assessment')) return 'The user is on the assessment hub, deciding which module to complete next.';
  return 'The user is browsing the app.';
}

// Collect all user data from localStorage
function collectUserData(): any {
  if (typeof window === 'undefined') return {};

  const gender = localStorage.getItem('relate_gender');
  const demographics = localStorage.getItem('relate_demographics');
  const m1Scored = localStorage.getItem('relate_m1_scored');
  const m2Scored = localStorage.getItem('relate_m2_scored');
  const m3Scored = localStorage.getItem('relate_m3_scored');
  const m4Scored = localStorage.getItem('relate_m4_scored');
  const results = localStorage.getItem('relate_results');
  const couplesReport = localStorage.getItem('relate_couples_report');

  return {
    gender,
    demographics: demographics ? JSON.parse(demographics) : null,
    m1: m1Scored ? JSON.parse(m1Scored) : null,
    m2: m2Scored ? JSON.parse(m2Scored) : null,
    m3: m3Scored ? JSON.parse(m3Scored) : null,
    m4: m4Scored ? JSON.parse(m4Scored) : null,
    results: results ? JSON.parse(results) : null,
    couplesReport: couplesReport ? JSON.parse(couplesReport) : null,
  };
}

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'solo' | 'individual' | 'couples'>('solo');
  const [hasCouplesData, setHasCouplesData] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);

  // Restore persisted state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMessages = sessionStorage.getItem('relate_advisor_messages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed);
      setMessageCount(parsed.filter((m: Message) => m.role === 'user').length);
    }

    const savedMode = sessionStorage.getItem('relate_advisor_mode');
    if (savedMode) setMode(savedMode as any);

    const couples = localStorage.getItem('relate_couples_report');
    setHasCouplesData(!!couples);
    if (couples && !savedMode) setMode('individual');

    if (config.useMockPayments) {
      setHasPaid(getMockPaymentStatus().paid);
    } else {
      // In production, check payment status from localStorage or API
      setHasPaid(!!localStorage.getItem('relate_payment_confirmed'));
    }
  }, []);

  // Persist messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('relate_advisor_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Persist mode to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('relate_advisor_mode', mode);
  }, [mode]);

  const isLimited = !hasPaid && messageCount >= FREE_MESSAGE_LIMIT;
  const starters = getStarters(pathname, hasCouplesData);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(o => !o), []);

  const handleSetMode = useCallback((m: 'solo' | 'individual' | 'couples') => {
    setMode(m);
    setMessages([]);
    setMessageCount(0);
    sessionStorage.removeItem('relate_advisor_messages');
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (loading) return;
    if (isLimited) return;

    const userData = collectUserData();
    const locationContext = getLocationContext(pathname);

    const userMsg: Message = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setMessageCount(c => c + 1);
    setLoading(true);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages,
          persona: userData.results?.persona || userData.m2?.persona,
          results: userData.results,
          mode: mode === 'solo' ? undefined : mode,
          couplesReport: mode !== 'solo' ? userData.couplesReport : undefined,
          partnerPersona: mode !== 'solo' ? userData.couplesReport?.overview?.user2 : undefined,
          // New fields for contextual awareness
          locationContext,
          progress: {
            m1Complete: !!userData.m1,
            m2Complete: !!userData.m2,
            m3Complete: !!userData.m3,
            m4Complete: !!userData.m4,
            resultsComplete: !!userData.results,
            couplesComplete: !!userData.couplesReport,
          },
          userData: {
            gender: userData.gender,
            demographics: userData.demographics,
            m1: userData.m1,
            m2: userData.m2,
            m3: userData.m3,
            m4: userData.m4,
          },
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response || data.error || 'No response' }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [loading, isLimited, messages, mode, pathname]);

  return (
    <AdvisorContext.Provider value={{
      isOpen, open, close, toggle,
      messages, sendMessage, loading,
      mode, setMode: handleSetMode,
      hasCouplesData, messageCount,
      isLimited, starters,
    }}>
      {children}
    </AdvisorContext.Provider>
  );
}

export function useAdvisor() {
  return useContext(AdvisorContext);
}
