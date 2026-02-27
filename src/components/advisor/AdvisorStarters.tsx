'use client';

import { useAdvisor } from '@/lib/advisor-context';

export default function AdvisorStarters() {
  const { starters, sendMessage, loading, isLimited } = useAdvisor();

  if (isLimited) return null;

  return (
    <div className="text-center py-8 px-2">
      <p className="text-xs text-secondary mb-4">How can I help?</p>
      <div className="flex flex-col gap-2">
        {starters.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            className="text-left text-xs border border-stone-200 rounded-md px-3 py-2.5 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
