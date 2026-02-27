'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/lib/config';
import { FlatQuestion } from '@/lib/questions';
import QuestionCard from './QuestionCard';

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
  const storageKey = `relate_m${moduleNumber}_responses`;
  const [responses, setResponses] = useState<Record<string, number | string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [scoredData, setScoredData] = useState<any>(null);
  const [scoring, setScoring] = useState(false);

  // Load saved responses
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setResponses(parsed);
      const firstUnanswered = questions.findIndex(q => !(q.id in parsed));
      if (firstUnanswered >= 0) {
        setCurrentIndex(firstUnanswered);
        setShowIntro(false);
      } else if (Object.keys(parsed).length >= questions.length) {
        setShowIntro(false);
        setShowComplete(true);
        // Score if reward is available and we haven't scored yet
        if (onModuleComplete) {
          onModuleComplete(parsed).then(data => setScoredData(data));
        }
      }
    }
  }, [storageKey, questions, onModuleComplete]);

  const saveResponses = useCallback((updated: Record<string, number | string>) => {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [storageKey]);

  function handleAnswer(questionId: string, value: number | string) {
    const updated = { ...responses, [questionId]: value };
    setResponses(updated);
    saveResponses(updated);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Module complete
        localStorage.setItem(`relate_m${moduleNumber}_completed`, 'true');

        if (onModuleComplete) {
          setScoring(true);
          onModuleComplete(updated).then(data => {
            setScoredData(data);
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
        <AssessmentHeader moduleNumber={moduleNumber} />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <span className="font-mono text-xs text-secondary">Module {moduleNumber} of 4</span>
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
        <AssessmentHeader moduleNumber={moduleNumber} />
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
          <AssessmentHeader moduleNumber={moduleNumber} />
          <main className="flex-1 px-6 py-8">
            {renderReward({ responses, scoredData, onContinue: handleContinue })}
          </main>
        </div>
      );
    }

    // Fallback: simple completion
    return (
      <div className="min-h-screen flex flex-col">
        <AssessmentHeader moduleNumber={moduleNumber} />
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

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <AssessmentHeader moduleNumber={moduleNumber} />

      {/* Progress bar */}
      <div className="border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-mono text-xs text-secondary whitespace-nowrap">
            {currentIndex + 1} / {questions.length}
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

function AssessmentHeader({ moduleNumber }: { moduleNumber: number }) {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/assessment" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary">Module {moduleNumber}</span>
          {config.useMockAuth && (
            <span className="text-xs font-mono bg-warning/10 text-warning px-2 py-1 rounded">[TEST]</span>
          )}
        </div>
      </div>
    </header>
  );
}
