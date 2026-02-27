'use client';

import { useRef, useEffect } from 'react';
import { useAdvisor } from '@/lib/advisor-context';
import AdvisorStarters from './AdvisorStarters';

export default function AdvisorMessages() {
  const { messages, loading, isLimited, messageCount } = useAdvisor();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.length === 0 && <AdvisorStarters />}

      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[85%] px-3 py-2 rounded-md text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-stone-100 text-foreground'
                : 'text-foreground'
            }`}
          >
            {msg.content.split('\n').map((line, j) => (
              <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
            ))}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="px-3 py-2 text-sm text-secondary">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}

      {isLimited && (
        <div className="text-center py-4 px-2">
          <p className="text-xs text-secondary mb-2">
            You&apos;ve used {messageCount} of 3 free messages.
          </p>
          <a href="/api/checkout?product=full_report" className="text-xs text-accent hover:underline font-medium">
            Unlock unlimited advisor access - $19
          </a>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
