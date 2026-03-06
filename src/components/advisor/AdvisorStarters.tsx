'use client';

import { useAdvisor } from '@/lib/advisor-context';

interface AdvisorStartersProps {
  hidden?: boolean;
}

export default function AdvisorStarters({ hidden }: AdvisorStartersProps) {
  const { starters, sendMessage, loading, isLimited } = useAdvisor();

  if (isLimited || hidden) return null;

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="grid grid-cols-2 gap-2">
        {starters.slice(0, 4).map(q => (
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
