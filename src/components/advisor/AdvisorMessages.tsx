'use client';

import { useRef, useEffect } from 'react';
import { useAdvisor } from '@/lib/advisor-context';
import AdvisorStarters from './AdvisorStarters';

interface AdvisorMessagesProps {
  hideStarters?: boolean;
}

export default function AdvisorMessages({ hideStarters }: AdvisorMessagesProps) {
  const { messages, loading, isLimited, messageCount, messageLimit, paymentTier } = useAdvisor();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.length === 0 && <AdvisorStarters hidden={hideStarters} />}

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

      {/* Rate limit info (shown when approaching limit but not yet hit) */}
      {!isLimited && messageCount > 0 && messageLimit !== Infinity && (
        <div className="text-center py-1">
          <p className="text-[10px] text-secondary">
            {messageCount}/{messageLimit} messages used this session
          </p>
        </div>
      )}

      {isLimited && (
        <div className="text-center py-4 px-2">
          <div className="p-4 bg-stone-50 border border-border rounded-md">
            <p className="text-sm font-medium mb-1">Message limit reached</p>
            <p className="text-xs text-secondary mb-3">
              You&apos;ve used all {messageLimit} messages included with your {paymentTier === 'free' ? 'Free' : paymentTier === 'premium' ? 'Premium' : 'current'} plan.
            </p>
            {paymentTier === 'premium' ? (
              <>
                <p className="text-xs text-secondary mb-3">
                  Pro ($69.99) includes <strong>unlimited</strong> AI advisor messages.
                </p>
                <a href="/account" className="inline-block bg-accent text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-accent-hover">
                  Upgrade to Pro
                </a>
              </>
            ) : paymentTier === 'plus' ? (
              <>
                <p className="text-xs text-secondary mb-3">
                  Premium ($49.99) includes 25 messages per session. Pro ($69.99) is unlimited.
                </p>
                <a href="/account" className="inline-block bg-accent text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-accent-hover">
                  View Plans
                </a>
              </>
            ) : (
              <>
                <p className="text-xs text-secondary mb-3">
                  Free includes 3 messages per session. Upgrade for more:
                </p>
                <div className="space-y-1 text-xs text-secondary mb-3 text-left max-w-[260px] mx-auto">
                  <div className="flex justify-between"><span>Premium</span><span className="font-mono">25 msgs/session, $49.99</span></div>
                  <div className="flex justify-between"><span>Pro</span><span className="font-mono">Unlimited, $69.99</span></div>
                  <div className="flex justify-between"><span>Couples</span><span className="font-mono">Unlimited, $119</span></div>
                </div>
                <a href="/account" className="inline-block bg-accent text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-accent-hover">
                  View Plans
                </a>
              </>
            )}
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
