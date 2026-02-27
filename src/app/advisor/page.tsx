'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { config } from '@/lib/config';

type Message = { role: 'user' | 'assistant'; content: string };

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('relate_results');
    if (stored) setReport(JSON.parse(stored));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-secondary">Claude Advisor</span>
            {config.useMockAdvisor && (
              <span className="text-xs font-mono bg-warning/10 text-warning px-2 py-1 rounded">[MOCK]</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="font-serif text-xl font-semibold mb-2">RELATE Advisor</h2>
              <p className="text-sm text-secondary mb-6">
                Ask about your persona, compatibility, conflict patterns, or relationship strategy.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'What are my biggest strengths in relationships?',
                  'How can I improve my conflict repair?',
                  'What should I look for in a partner?',
                ].map(q => (
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
              placeholder="Ask about your results..."
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
