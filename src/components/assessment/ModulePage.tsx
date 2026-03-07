'use client';

import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FlatQuestion } from '@/lib/questions';
import { useAuth } from '@/lib/auth-context';
import { SiteHeader } from '@/components/SiteHeader';
import QuestionCard from './QuestionCard';
import { saveModuleResponses, saveModuleCompleted, loadAndHydrateProgress } from '@/lib/supabase/progress';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Props = {
  moduleNumber: number;
  title: string;
  questions: FlatQuestion[];
  nextPath: string;
  renderReward?: (props: {
    responses: Record<string, number | string>;
    scoredData: any;
    onContinue: () => void;
  }) => ReactNode;
  onModuleComplete?: (responses: Record<string, number | string>) => Promise<any>;
};

export default function ModulePage({ moduleNumber, title, questions, nextPath, renderReward, onModuleComplete }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const storageKey = `relate_m${moduleNumber}_responses`;
  const [responses, setResponses] = useState<Record<string, number | string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [scoredData, setScoredData] = useState<any>(null);
  const [scoring, setScoring] = useState(false);
  const [saved, setSaved] = useState(false);
  const dbSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved responses — localStorage first, Supabase fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function resumeFrom(parsed: Record<string, number | string>) {
      setResponses(parsed);
      const firstUnanswered = questions.findIndex(q => !(q.id in parsed));
      if (firstUnanswered >= 0) {
        setCurrentIndex(firstUnanswered);
        setShowIntro(false);
      } else if (Object.keys(parsed).length >= questions.length) {
        setShowIntro(false);
        setShowComplete(true);
        if (onModuleComplete) {
          onModuleComplete(parsed).then(data => setScoredData(data));
        }
      }
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      resumeFrom(JSON.parse(saved));
    } else if (user) {
      // No local data — try loading from Supabase
      loadAndHydrateProgress(user.id).then((data) => {
        if (data) {
          const dbSaved = localStorage.getItem(storageKey);
          if (dbSaved) resumeFrom(JSON.parse(dbSaved));
        }
      });
    }
  }, [storageKey, questions, onModuleComplete, user]);

  // Auto-save to Supabase after 10 seconds of inactivity; mark as saved
  const saveToDb = useCallback((updated: Record<string, number | string>) => {
    if (!user) return;
    if (dbSaveTimer.current) clearTimeout(dbSaveTimer.current);
    dbSaveTimer.current = setTimeout(() => {
      saveModuleResponses(user.id, moduleNumber, updated);
      setSaved(true);
    }, 10000);
  }, [user, moduleNumber]);

  const saveResponses = useCallback((updated: Record<string, number | string>) => {
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSaved(false);
    saveToDb(updated);
  }, [storageKey, saveToDb]);

  // Explicit save: flush immediately to localStorage + Supabase, show saved
  const handleExplicitSave = useCallback(() => {
    if (dbSaveTimer.current) clearTimeout(dbSaveTimer.current);
    localStorage.setItem(storageKey, JSON.stringify(responses));
    if (user) {
      saveModuleResponses(user.id, moduleNumber, responses);
    }
    setSaved(true);
  }, [storageKey, responses, user, moduleNumber]);

  function handleAnswer(questionId: string, value: number | string) {
    const updated = { ...responses, [questionId]: value };
    setResponses(updated);
    saveResponses(updated);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Module complete — save immediately to both localStorage and Supabase
        localStorage.setItem(`relate_m${moduleNumber}_completed`, 'true');
        if (user) {
          if (dbSaveTimer.current) clearTimeout(dbSaveTimer.current);
          saveModuleResponses(user.id, moduleNumber, updated);
        }
        setSaved(true);

        if (onModuleComplete) {
          setScoring(true);
          onModuleComplete(updated).then(data => {
            setScoredData(data);
            if (user) saveModuleCompleted(user.id, moduleNumber, data);
            setScoring(false);
            setShowComplete(true);
          }).catch(() => {
            setScoring(false);
            setShowComplete(true);
          });
        } else {
          setShowComplete(true);
        }
      }
    }, 300);
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function handleContinue() {
    router.push(nextPath);
  }

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <span className="font-mono text-xs text-secondary">Module {moduleNumber} of 5</span>
            <h2 className="font-serif text-3xl font-semibold mt-2 mb-4">{title}</h2>
            <p className="text-secondary mb-8">
              {questions.length} questions · Answer honestly, there are no right or wrong answers.
            </p>
            <button onClick={() => setShowIntro(false)} className="btn-primary px-8 py-3">
              Begin
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Scoring in progress
  if (scoring) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-secondary">Scoring your responses...</p>
          </div>
        </main>
      </div>
    );
  }

  // Completion screen
  if (showComplete) {
    // Use custom reward if available and we have scored data
    if (renderReward && scoredData) {
      return (
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1 px-6 py-8">
            {renderReward({ responses, scoredData, onContinue: handleContinue })}
          </main>
        </div>
      );
    }

    // Fallback: simple completion
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto mb-4 text-lg">
              &#10003;
            </div>
            <h2 className="font-serif text-2xl font-semibold mb-2">Module {moduleNumber} Complete</h2>
            <p className="text-secondary mb-8">Your responses have been saved.</p>
            <button onClick={handleContinue} className="btn-primary px-8 py-3">
              Continue
            </button>
          </div>
        </main>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, questions.length - 1);
  const question = questions[safeIndex];
  if (!question) return null;
  const progress = ((safeIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader onSave={handleExplicitSave} saveState={saved} />

      {/* Progress bar */}
      <div className="border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-mono text-xs text-secondary whitespace-nowrap">
            {safeIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <QuestionCard
          question={question}
          value={responses[question.id] ?? null}
          onAnswer={handleAnswer}
        />

        <div className="flex justify-between mt-12">
          <button
            onClick={handlePrev}
            className="btn-secondary"
            disabled={currentIndex === 0}
          >
            Back
          </button>
          {responses[question.id] != null && currentIndex < questions.length - 1 && (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
