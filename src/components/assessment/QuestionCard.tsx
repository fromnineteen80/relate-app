'use client';

import { FlatQuestion } from '@/lib/questions';

const AGREE_LABELS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

function getScaleLabels(question: FlatQuestion) {
  // M3 want/offer sections use importance framing
  if (question.section === 'want') {
    return [
      { value: 1, label: 'Not Important' },
      { value: 2, label: 'Slightly' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Important' },
      { value: 5, label: 'Essential' },
    ];
  }
  if (question.section === 'offer') {
    return [
      { value: 1, label: 'Not at All' },
      { value: 2, label: 'A Little' },
      { value: 3, label: 'Somewhat' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ];
  }
  // M3/M4 attentiveness uses frequency
  if (question.section === 'attentiveness') {
    return [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Sometimes' },
      { value: 4, label: 'Often' },
      { value: 5, label: 'Always' },
    ];
  }
  // M4 conflict/emotional sections use agree/disagree
  return AGREE_LABELS;
}

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
              value === 'A' ? 'border-accent bg-orange-50 text-accent font-medium' : 'border-border hover:border-accent text-secondary'
            }`}
          >
            {question.optionA}
          </button>
          <button
            onClick={() => onAnswer(question.id, 'B')}
            className={`text-left px-4 py-4 rounded-md border text-sm transition-colors ${
              value === 'B' ? 'border-accent bg-orange-50 text-accent font-medium' : 'border-border hover:border-accent text-secondary'
            }`}
          >
            {question.optionB}
          </button>
        </div>
      </div>
    );
  }

  // Likert scale (direct, behavioral, or generic likert)
  const labels = getScaleLabels(question);

  return (
    <div>
      <p className="text-lg mb-6">{question.text}</p>
      <div className="flex gap-2 justify-between">
        {labels.map(({ value: v, label }) => (
          <button
            key={v}
            onClick={() => onAnswer(question.id, v)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-md border text-xs transition-colors ${
              value === v ? 'border-accent bg-orange-50 text-accent font-medium' : 'border-border hover:border-accent text-secondary'
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
