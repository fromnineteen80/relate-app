'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchBlueprintAccess } from '@/lib/payments';
import { SiteHeader } from '@/components/SiteHeader';
import { SubNav } from '@/components/SubNav';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

type BlueprintQuestion = {
  id: string;
  quadrant: number;
  format: 'narrative' | 'scaled';
  prompt: string;
  anchors?: { low: string; high: string };
  dimension?: string[];
  angle?: string;
};

type SessionConfig = {
  personaCode: string;
  personaName: string;
  attachmentType: string;
  gender: string;
};

type PageState = 'loading' | 'gate' | 'prerequisites' | 'intro' | 'session' | 'processing' | 'complete';

const QUADRANT_LABELS: Record<number, string> = {
  1: 'Relational History',
  2: 'Trigger Emotion',
  3: 'Decision Architecture',
  4: 'Persona in Practice',
};

export default function BlueprintPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [questions, setQuestions] = useState<BlueprintQuestion[]>([]);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [narrativeValue, setNarrativeValue] = useState('');
  const [hasCheckpoint, setHasCheckpoint] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const relateResultsRef = useRef<any>(null);
  const initDone = useRef(false);

  // ── Prerequisite checks on mount ──
  useEffect(() => {
    if (authLoading) return;
    if (initDone.current) return;
    initDone.current = true;

    async function init() {
      // Auth check
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Purchase check
      const access = await fetchBlueprintAccess(user.email);
      if (!access.purchased) {
        setPageState('gate');
        return;
      }

      // Load RELATE results
      const stored = localStorage.getItem('relate_results');
      if (!stored) {
        setPageState('prerequisites');
        return;
      }

      let results: any;
      try {
        results = JSON.parse(stored);
      } catch {
        setPageState('prerequisites');
        return;
      }

      const personaCode = results?.persona?.code;
      const attachmentType = results?.m3?.typeName;

      if (!personaCode || !attachmentType) {
        setPageState('prerequisites');
        return;
      }

      relateResultsRef.current = results;

      // Check for existing checkpoint
      const checkpoint = localStorage.getItem('relate_blueprint_checkpoint');
      if (checkpoint) {
        try {
          const cp = JSON.parse(checkpoint);
          if (cp.responses && cp.currentIndex != null && cp.questions) {
            setResponses(cp.responses);
            setCurrentIndex(cp.currentIndex);
            setQuestions(cp.questions);
            setSessionConfig(cp.sessionConfig || null);
            setHasCheckpoint(true);
            setPageState('intro');
            return;
          }
        } catch { /* ignore bad checkpoint */ }
      }

      setPageState('intro');
    }

    init();
  }, [authLoading, user, router]);

  // ── Initialize session (fetch questions from API) ──
  const initializeSession = useCallback(async (resume: boolean) => {
    if (resume && questions.length > 0) {
      setPageState('session');
      return;
    }

    setPageState('loading');
    setError(null);

    const results = relateResultsRef.current;
    if (!results) return;

    try {
      const gender = localStorage.getItem('relate_gender') || results.demographics?.gender || '';
      const res = await fetch('/api/blueprint/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaCode: results.persona.code,
          personaName: results.persona.name || results.persona.code,
          attachmentType: results.m3.typeName,
          gender,
        }),
      });

      if (!res.ok) throw new Error('Failed to initialize session');

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Initialization failed');

      setQuestions(data.questions);
      setSessionConfig(data.sessionConfig);
      setCurrentIndex(0);
      setResponses({});
      setPageState('session');
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
      setPageState('intro');
    }
  }, [questions]);

  // ── Current question helpers ──
  const currentQuestion = questions[currentIndex] || null;
  const currentQuadrant = currentQuestion?.quadrant || 1;

  const quadrantQuestions = questions.filter(q => q.quadrant === currentQuadrant);
  const indexInQuadrant = quadrantQuestions.findIndex(q => q.id === currentQuestion?.id);
  const quadrantProgress = quadrantQuestions.length > 0
    ? ((indexInQuadrant + 1) / quadrantQuestions.length) * 100
    : 0;

  const overallProgress = questions.length > 0
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  // ── Save checkpoint at quadrant boundaries ──
  const saveCheckpoint = useCallback(async (
    allResponses: Record<string, string | number>,
    nextIdx: number,
  ) => {
    const checkpoint = {
      responses: allResponses,
      currentIndex: nextIdx,
      questions,
      sessionConfig,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('relate_blueprint_checkpoint', JSON.stringify(checkpoint));

    // Also POST progress to score endpoint
    const results = relateResultsRef.current;
    if (results && sessionConfig) {
      try {
        await fetch('/api/blueprint/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses: allResponses,
            personaCode: sessionConfig.personaCode,
            personaName: sessionConfig.personaName,
            gender: sessionConfig.gender,
          }),
        });
      } catch { /* non-critical */ }
    }
  }, [questions, sessionConfig]);

  // ── Handle answering a question ──
  function handleScaledAnswer(value: number) {
    const updated = { ...responses, [currentQuestion!.id]: value };
    setResponses(updated);
    advanceQuestion(updated);
  }

  function handleNarrativeSubmit() {
    if (narrativeValue.trim().length < 100) return;
    const updated = { ...responses, [currentQuestion!.id]: narrativeValue.trim() };
    setResponses(updated);
    setNarrativeValue('');
    advanceQuestion(updated);
  }

  function advanceQuestion(updated: Record<string, string | number>) {
    const nextIdx = currentIndex + 1;

    if (nextIdx >= questions.length) {
      // All questions answered
      handleSessionComplete(updated);
      return;
    }

    // Check if we crossed a quadrant boundary
    const currentQ = questions[currentIndex];
    const nextQ = questions[nextIdx];
    if (currentQ && nextQ && currentQ.quadrant !== nextQ.quadrant) {
      saveCheckpoint(updated, nextIdx);
    }

    setTimeout(() => {
      setCurrentIndex(nextIdx);
      // Pre-fill narrative if going back
      if (nextQ?.format === 'narrative' && updated[nextQ.id]) {
        setNarrativeValue(updated[nextQ.id] as string);
      } else {
        setNarrativeValue('');
      }
    }, 200);
  }

  function handlePrev() {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevQ = questions[prevIdx];
      setCurrentIndex(prevIdx);
      if (prevQ?.format === 'narrative' && responses[prevQ.id]) {
        setNarrativeValue(responses[prevQ.id] as string);
      } else {
        setNarrativeValue('');
      }
    }
  }

  // ── Session complete: score, report, growth ──
  async function handleSessionComplete(allResponses: Record<string, string | number>) {
    setPageState('processing');
    const results = relateResultsRef.current;
    if (!results || !sessionConfig) return;

    const gender = sessionConfig.gender;
    const assessmentResults = {
      personaCode: sessionConfig.personaCode,
      personaName: sessionConfig.personaName,
      attachmentType: results.m3.typeName,
      gender,
    };

    try {
      // Step 1: Score
      setProcessingStep('Scoring your responses...');
      const scoreRes = await fetch('/api/blueprint/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: allResponses,
          personaCode: sessionConfig.personaCode,
          personaName: sessionConfig.personaName,
          gender,
        }),
      });
      const scoreData = await scoreRes.json();
      if (!scoreData.success) throw new Error(scoreData.error || 'Scoring failed');

      const blueprintResults = scoreData.result;
      const personaMetadata = scoreData.personaMetadata;
      localStorage.setItem('relate_blueprint_results', JSON.stringify(blueprintResults));

      // Step 2: Report
      setProcessingStep('Generating your report...');
      const reportRes = await fetch('/api/blueprint/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprintResults,
          assessmentResults,
          personaMetadata,
        }),
      });
      const reportData = await reportRes.json();
      if (!reportData.success) throw new Error(reportData.error || 'Report generation failed');

      localStorage.setItem('relate_blueprint_report', JSON.stringify(reportData.report));

      // Step 3: Growth plan
      setProcessingStep('Building your growth plan...');
      const growthRes = await fetch('/api/blueprint/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprintResults,
          blueprintReport: reportData.report,
          assessmentResults,
          personaMetadata,
        }),
      });
      const growthData = await growthRes.json();
      if (!growthData.success) throw new Error(growthData.error || 'Growth plan generation failed');

      localStorage.setItem('relate_blueprint_growth', JSON.stringify(growthData.growthPlan));

      // Clear checkpoint
      localStorage.removeItem('relate_blueprint_checkpoint');

      // Redirect
      setPageState('complete');
      router.push('/results/attachment');
    } catch (err: any) {
      setError(err.message || 'Something went wrong during processing');
      setPageState('session');
    }
  }

  // ── Render: Loading ──
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-secondary">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Render: Purchase gate ──
  if (pageState === 'gate') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg text-center">
            <h2 className="font-serif text-3xl font-semibold mb-4">Attachment Style</h2>
            <p className="text-secondary mb-6 leading-relaxed">
              The Attachment Style session is a deep 30-minute dive that maps your
              relational patterns, emotional triggers, and decision-making architecture.
              It builds on your RELATE persona and attachment profile to generate a
              personalized report you can actually use.
            </p>
            <div className="border border-border rounded-lg p-6 mb-8">
              <p className="font-mono text-xs text-secondary mb-1">One-time purchase</p>
              <p className="font-serif text-4xl font-semibold mb-4">$49</p>
              <p className="text-sm text-secondary mb-6">
                Includes full session, personalized report, and growth plan.
              </p>
              <Link
                href="/api/blueprint/checkout"
                className="btn-primary inline-block px-8 py-3"
              >
                Purchase Attachment Style
              </Link>
            </div>
            <Link href="/results" className="text-sm text-secondary hover:text-foreground transition-colors">
              Back to results
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Render: Prerequisites not met ──
  if (pageState === 'prerequisites') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h2 className="font-serif text-3xl font-semibold mb-4">Prerequisites Needed</h2>
            <p className="text-secondary mb-8 leading-relaxed">
              Complete the RELATE assessment first to unlock Attachment Style.
              You need your persona code and attachment type before starting.
            </p>
            <Link href="/assessment" className="btn-primary inline-block px-8 py-3">
              Take the Assessment
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Render: Intro ──
  if (pageState === 'intro') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <span className="font-mono text-xs text-secondary">4 quadrants</span>
            <h2 className="font-serif text-3xl font-semibold mt-2 mb-4">Attachment Style</h2>
            <p className="text-secondary mb-4 leading-relaxed">
              This session takes about 30 minutes. You will move through four quadrants
              that map your relational history, emotional triggers, decision patterns,
              and how your persona shows up in practice.
            </p>
            <p className="text-secondary mb-8 text-sm">
              Answer honestly. There are no right or wrong answers. Your progress
              is saved at each quadrant boundary.
            </p>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            {hasCheckpoint ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => initializeSession(true)}
                  className="btn-primary px-8 py-3"
                >
                  Resume Session
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('relate_blueprint_checkpoint');
                    setHasCheckpoint(false);
                    setResponses({});
                    setQuestions([]);
                    setCurrentIndex(0);
                    initializeSession(false);
                  }}
                  className="text-sm text-secondary hover:text-foreground transition-colors"
                >
                  Start Over
                </button>
              </div>
            ) : (
              <button
                onClick={() => initializeSession(false)}
                className="btn-primary px-8 py-3"
              >
                Begin
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── Render: Processing ──
  if (pageState === 'processing') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-secondary">{processingStep || 'Processing...'}</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Render: Complete (brief flash before redirect) ──
  if (pageState === 'complete') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto mb-4 text-lg">
              &#10003;
            </div>
            <h2 className="font-serif text-2xl font-semibold mb-2">Complete</h2>
            <p className="text-secondary mb-4">Redirecting to your results...</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Render: Session (question flow) ──
  if (!currentQuestion) return null;

  const isNarrative = currentQuestion.format === 'narrative';
  const charCount = narrativeValue.trim().length;
  const narrativeValid = charCount >= 100;
  const hasAnswer = responses[currentQuestion.id] != null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      {/* Progress header */}
      <div className="border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-secondary">
              Quadrant {currentQuadrant} of 4: {QUADRANT_LABELS[currentQuadrant]}
            </span>
            <span className="font-mono text-xs text-secondary">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          {/* Overall progress */}
          <div className="h-1 bg-stone-200 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          {/* Quadrant progress */}
          <div className="h-0.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent/40 rounded-full transition-all duration-300"
              style={{ width: `${quadrantProgress}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        {/* Question */}
        <div>
          <p className="text-lg mb-6 leading-relaxed">{currentQuestion.prompt}</p>

          {isNarrative ? (
            <div>
              <textarea
                value={narrativeValue}
                onChange={(e) => setNarrativeValue(e.target.value)}
                placeholder="Take your time. Write at least 100 characters."
                className="w-full h-40 px-4 py-3 rounded-md border border-border text-sm leading-relaxed resize-y focus:outline-none focus:border-accent transition-colors"
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`font-mono text-xs ${narrativeValid ? 'text-success' : 'text-secondary'}`}>
                  {charCount} / 100 characters minimum
                </span>
                <button
                  onClick={handleNarrativeSubmit}
                  disabled={!narrativeValid}
                  className={`btn-primary px-6 py-2 text-sm ${!narrativeValid ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div>
              {currentQuestion.anchors && (
                <div className="flex justify-between text-xs text-secondary mb-2 px-1">
                  <span>{currentQuestion.anchors.low}</span>
                  <span>{currentQuestion.anchors.high}</span>
                </div>
              )}
              <div className="flex gap-2 justify-between">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleScaledAnswer(v)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-1 rounded-md border text-sm transition-colors ${
                      responses[currentQuestion.id] === v
                        ? 'border-accent bg-accent/5 text-accent font-medium'
                        : 'border-border hover:border-accent text-secondary'
                    }`}
                  >
                    <span className="font-mono text-lg">{v}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handlePrev}
            className="btn-secondary"
            disabled={currentIndex === 0}
          >
            Back
          </button>
          {!isNarrative && hasAnswer && currentIndex < questions.length - 1 && (
            <button
              onClick={() => advanceQuestion(responses)}
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
