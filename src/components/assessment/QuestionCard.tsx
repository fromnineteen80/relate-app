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
              value === 'A' ? 'border-accent bg-orange-50' : 'border-border hover:border-accent'
            }`}
          >
            {question.optionA}
          </button>
          <button
            onClick={() => onAnswer(question.id, 'B')}
            className={`text-left px-4 py-4 rounded-md border text-sm transition-colors ${
              value === 'B' ? 'border-accent bg-orange-50' : 'border-border hover:border-accent'
            }`}
          >
            {question.optionB}
          </button>
        </div>
      </div>
    );
  }

  // Likert scale (direct, behavioral, or generic likert)
  return (
    <div>
      <p className="text-lg mb-6">{question.text}</p>
      <div className="flex gap-2 justify-between">
        {LIKERT_LABELS.map(({ value: v, label }) => (
          <button
            key={v}
            onClick={() => onAnswer(question.id, v)}
            className={`flex-1 flex flex-col items-center gap-2 py-3 px-1 rounded-md border text-xs transition-colors ${
              value === v ? 'border-accent bg-orange-50 text-accent font-medium' : 'border-border hover:border-accent text-secondary'
            }`}
          >
            <span className="font-mono text-base">{v}</span>
            <span className="hidden sm:block text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
