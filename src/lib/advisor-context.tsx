'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { fetchPaymentTier } from '@/lib/payments';
import { useAuth } from '@/lib/auth-context';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Message = { role: 'user' | 'assistant'; content: string };

const FREE_MESSAGE_LIMIT = 3;
const PREMIUM_MESSAGE_LIMIT = 25;

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
  messageLimit: number;
  paymentTier: string;
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
  messageLimit: FREE_MESSAGE_LIMIT,
  paymentTier: 'free',
  isLimited: false,
  starters: [],
});

// Personalized starters based on route and user data
function getStarters(pathname: string, hasCouples: boolean): string[] {
  // Read user results for personalization
  let personaName = '';
  let topMatchName = '';
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('relate_results') : null;
    if (stored) {
      const r = JSON.parse(stored);
      personaName = r?.persona?.name || '';
      topMatchName = r?.matches?.[0]?.name || '';
    }
  } catch { /* */ }

  if (pathname.includes('module-1')) {
    return [
      "I'm not sure how to answer this question",
      "What if I want both options?",
      "How do my preferences affect my matches?",
      "Can I change my answers later?",
    ];
  }
  if (pathname.includes('module-2')) {
    return [
      "This question feels uncomfortable",
      "I answered differently than I expected",
      "What if I'm not sure who I really am?",
      "How honest should I be here?",
    ];
  }
  if (pathname.includes('module-3')) {
    return [
      "What does 'context-switching' mean?",
      "Is it bad to want more than I offer?",
      "How does attentiveness affect relationships?",
      "What if my partner needs differ from mine?",
    ];
  }
  if (pathname.includes('module-4')) {
    return [
      "I don't like what this says about me",
      "Can I change my conflict patterns?",
      "What are the Gottman horsemen?",
      "Is my conflict style hurting my relationships?",
    ];
  }
  if (pathname.includes('/growth')) {
    return [
      "What patterns should I focus on first?",
      "Explain my cognitive distortions",
      "How do my attachment and driver interact?",
      "What exercise would help me most right now?",
    ];
  }
  if (pathname.includes('/couples')) {
    return [
      "Where do we clash the most?",
      "What's our biggest risk as a couple?",
      "Give us a conversation starter for tonight",
      "Suggest a date based on our profiles",
    ];
  }
  if (pathname.includes('/results')) {
    return [
      personaName ? `What does being a ${personaName} say about me?` : "Explain my persona to me",
      topMatchName ? `Why is ${topMatchName} my top match?` : "Why is this my top match?",
      "What should I work on first?",
      "How do I talk to my partner about my results?",
    ];
  }
  if (pathname.includes('/assessment')) {
    return [
      "How long does this take?",
      "Why these specific questions?",
      "What will I learn about myself?",
      "How is my persona determined?",
    ];
  }
  if (hasCouples) {
    return [
      "What's our biggest strength as a couple?",
      "How can we improve our conflict pattern?",
      "Suggest something for us this week",
      "What should we talk about tonight?",
    ];
  }
  if (personaName) {
    return [
      `What are my biggest strengths as a ${personaName}?`,
      topMatchName ? `Tell me about my match with ${topMatchName}` : "What should I look for in a partner?",
      "What's my biggest blind spot in relationships?",
      "What can I work on to be a better partner?",
    ];
  }
  return [
    "What are my biggest strengths in relationships?",
    "Help me understand my attachment style",
    "What should I look for in a partner?",
    "What can I work on to be a better partner?",
  ];
}

// Build location context string
function getLocationContext(pathname: string): string {
  if (pathname.includes('module-1')) return 'The user is currently in Module 1 (What They Want). They are answering questions about their preferences in a partner.';
  if (pathname.includes('module-2')) return 'The user is currently in Module 2 (Who They Are). They are answering questions about themselves.';
  if (pathname.includes('module-3')) return 'The user is currently in Module 3 (How They Connect). They are answering questions about intimacy and attention patterns.';
  if (pathname.includes('module-4')) return 'The user is currently in Module 4 (When Things Get Hard). They are answering questions about conflict patterns.';
  if (pathname.includes('module-5')) return 'The user is currently in Module 5 (Know Your Patterns). They are answering questions about vulnerability armor, desire patterns, attraction-attachment alignment, and internal conflict coherence.';
  if (pathname.includes('/results/compare')) return 'The user is viewing their couples compatibility report.';
  if (pathname.includes('/results')) return 'The user is viewing their individual results. They have access to their persona, matches, and conflict profile.';
  if (pathname.includes('/growth')) return 'The user is on their individual growth plan page, working through CBT-based exercises and pattern recognition. They can see their pattern insights and are actively developing self-awareness.';
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
  const m5Scored = localStorage.getItem('relate_m5_scored');
  const results = localStorage.getItem('relate_results');
  const couplesReport = localStorage.getItem('relate_couples_report');
  const profile = localStorage.getItem('relate_profile');
  const marketData = localStorage.getItem('relate_market_data');
  const growthCompleted = localStorage.getItem('relate_growth_exercises_completed');
  const growthPoints = localStorage.getItem('relate_individual_growth_points');
  const growthActive = localStorage.getItem('relate_growth_active_exercise');
  const couplesCompleted = localStorage.getItem('relate_completed_challenges');
  const couplesPoints = localStorage.getItem('relate_growth_points');
  const couplesActive = localStorage.getItem('relate_active_challenge');

  return {
    gender,
    profile: profile ? JSON.parse(profile) : null,
    demographics: demographics ? JSON.parse(demographics) : null,
    marketData: marketData ? JSON.parse(marketData) : null,
    m1: m1Scored ? JSON.parse(m1Scored) : null,
    m2: m2Scored ? JSON.parse(m2Scored) : null,
    m3: m3Scored ? JSON.parse(m3Scored) : null,
    m4: m4Scored ? JSON.parse(m4Scored) : null,
    m5: m5Scored ? JSON.parse(m5Scored) : null,
    results: results ? JSON.parse(results) : null,
    couplesReport: couplesReport ? JSON.parse(couplesReport) : null,
    growthPlan: {
      completedExercises: growthCompleted ? JSON.parse(growthCompleted) : [],
      points: growthPoints ? parseInt(growthPoints, 10) : 0,
      activeExercise: growthActive ? JSON.parse(growthActive) : null,
    },
    couplesGrowth: {
      completedChallenges: couplesCompleted ? JSON.parse(couplesCompleted) : [],
      points: couplesPoints ? parseInt(couplesPoints, 10) : 0,
      activeChallenge: couplesActive ? JSON.parse(couplesActive) : null,
    },
  };
}

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'solo' | 'individual' | 'couples'>('solo');
  const [hasCouplesData, setHasCouplesData] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentTier, setPaymentTier] = useState<string>('free');

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
  }, []);

  // Fetch payment status
  useEffect(() => {
    if (!user) return;
    fetchPaymentTier(user.email).then(({ paid, tier }) => { setHasPaid(paid); setPaymentTier(tier); });
  }, [user]);

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

  const messageLimit = paymentTier === 'pro' || paymentTier === 'couples' ? Infinity
    : paymentTier === 'premium' ? PREMIUM_MESSAGE_LIMIT
    : FREE_MESSAGE_LIMIT;
  const isLimited = messageCount >= messageLimit;
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
            m5Complete: !!userData.m5,
            resultsComplete: !!userData.results,
            couplesComplete: !!userData.couplesReport,
          },
          userData: {
            gender: userData.gender,
            profile: userData.profile,
            demographics: userData.demographics,
            marketData: userData.marketData,
            m1: userData.m1,
            m2: userData.m2,
            m3: userData.m3,
            m4: userData.m4,
            growthPlan: userData.growthPlan,
            couplesGrowth: userData.couplesGrowth,
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
      hasCouplesData, messageCount, messageLimit, paymentTier,
      isLimited, starters,
    }}>
      {children}
    </AdvisorContext.Provider>
  );
}

export function useAdvisor() {
  return useContext(AdvisorContext);
}
