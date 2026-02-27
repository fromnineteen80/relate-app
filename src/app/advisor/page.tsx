'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/lib/config';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Message = { role: 'user' | 'assistant'; content: string };

function AdvisorContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [couplesReport, setCouplesReport] = useState<any>(null);
  const [partnerPersona, setPartnerPersona] = useState<any>(null);
  const [mode, setMode] = useState<'solo' | 'individual' | 'couples'>('solo');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (stored) setReport(JSON.parse(stored));

    const couplesStored = localStorage.getItem('relate_couples_report');
    if (couplesStored) {
      const parsed = JSON.parse(couplesStored);
      setCouplesReport(parsed);
      setPartnerPersona(parsed.overview?.user2);

      if (initialMode === 'couples') {
        setMode('couples');
      } else if (couplesStored) {
        setMode('individual');
      }
    }
  }, [initialMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasCouplesData = !!couplesReport;

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          persona: report?.persona,
          results: report,
          mode: mode === 'solo' ? undefined : mode,
          couplesReport: mode !== 'solo' ? couplesReport : undefined,
          partnerPersona: mode !== 'solo' ? partnerPersona : undefined,
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response || data.error || 'No response' }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  const modeLabels = { solo: 'Individual', individual: 'About My Relationship', couples: 'Together' };

  const suggestedPrompts = mode === 'couples' ? [
    'What is our biggest strength as a couple?',
    'How can we improve our conflict pattern?',
    'What should we prioritize this week?',
  ] : mode === 'individual' ? [
    'How does my persona interact with my partner\'s?',
    'What can I do to bridge our conflict styles?',
    'What should I watch out for in our dynamic?',
  ] : [
    'What are my biggest strengths in relationships?',
    'How can I improve my conflict repair?',
    'What should I look for in a partner?',
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href={hasCouplesData ? '/couples' : '/results'} className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-secondary">Advisor</span>
            {config.useMockAdvisor && (
              <span className="text-xs font-mono bg-warning/10 text-warning px-2 py-1 rounded">[MOCK]</span>
            )}
          </div>
        </div>
      </header>

      {/* Mode selector */}
      {hasCouplesData && (
        <div className="border-b border-border">
          <div className="max-w-2xl mx-auto px-6 py-2 flex gap-2">
            {(['solo', 'individual', 'couples'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setMessages([]); }}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                  mode === m ? 'bg-accent text-white' : 'bg-stone-100 text-secondary hover:bg-stone-200'
                }`}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="font-serif text-xl font-semibold mb-2">
                {mode === 'couples' ? 'Couples Advisor' : mode === 'individual' ? 'Relationship Advisor' : 'RELATE Advisor'}
              </h2>
              <p className="text-sm text-secondary mb-6">
                {mode === 'couples'
                  ? 'Get advice for both of you based on your shared dynamics.'
                  : mode === 'individual'
                    ? 'Get personal advice about your relationship.'
                    : 'Ask about your persona, compatibility, conflict patterns, or relationship strategy.'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedPrompts.map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-xs border border-border rounded-md px-3 py-2 hover:border-accent transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-md text-sm ${
                msg.role === 'user' ? 'bg-accent text-white' : 'bg-white border border-border'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-border px-4 py-3 rounded-md text-sm text-secondary">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border px-6 py-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="input flex-1"
              placeholder={mode === 'couples' ? 'Ask about your relationship...' : 'Ask about your results...'}
              disabled={loading}
            />
            <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-secondary">Loading advisor...</div>}>
      <AdvisorContent />
    </Suspense>
  );
}
