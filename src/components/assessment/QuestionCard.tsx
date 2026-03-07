'use client';

import { FlatQuestion } from '@/lib/questions';

const LIKERT_LABELS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

type Props = {
  question: FlatQuestion;
  value: number | string | null;
  onAnswer: (questionId: string, value: number | string) => void;
};

export default function QuestionCard({ question, value, onAnswer }: Props) {
  if (question.type === 'forced_choice') {
    return (
      <div>
        <p className="text-lg mb-6">{question.stem || question.text}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onAnswer(question.id, 'A')}
            className={`text-left px-4 py-4 rounded-md border text-sm transition-colors ${
              value === 'A' ? 'border-accent bg-accent/5 text-accent font-medium' : 'border-border hover:border-accent text-secondary'
            }`}
          >
            {question.optionA}
          </button>
          <button
            onClick={() => onAnswer(question.id, 'B')}
            className={`text-left px-4 py-4 rounded-md border text-sm transition-colors ${
              value === 'B' ? 'border-accent bg-accent/5 text-accent font-medium' : 'border-border hover:border-accent text-secondary'
            }`}
          >
            {question.optionB}
          </button>
        </div>
      </div>
    );
  }

  // All likert questions across M1-M4 are agreement statements
  return (
    <div>
      <p className="text-lg mb-6">{question.text}</p>
      <div className="flex gap-2 justify-between">
        {LIKERT_LABELS.map(({ value: v, label }) => (
          <button
            key={v}
            onClick={() => onAnswer(question.id, v)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-md border text-xs transition-colors ${
              value === v ? 'border-accent bg-accent/5 text-accent font-medium' : 'border-border hover:border-accent text-secondary'
            }`}
          >
            <span className="font-mono text-base">{v}</span>
            <span className="text-center leading-tight text-[10px] sm:text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
