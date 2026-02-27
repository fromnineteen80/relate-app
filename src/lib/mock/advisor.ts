const CANNED_RESPONSES = [
  "Based on your persona profile, I'd suggest focusing on your conflict repair patterns. Your tendency toward slow repair could be an asset - it means you process deeply - but it may frustrate partners who need quicker resolution.",
  "Your connection style scores suggest you offer more than you ask for. This generosity is a strength, but watch for resentment building if the balance stays skewed too long.",
  "Looking at your compatibility rankings, your top matches share your values dimension. This is significant - values alignment predicts long-term satisfaction more reliably than physical or social chemistry.",
  "Your Gottman scores are in a healthy range. The area to watch is defensiveness - even moderate scores here can escalate conflicts. Try acknowledging your partner's perspective before explaining yours.",
];

let responseIndex = 0;

export function getMockAdvisorResponse(_message: string): string {
  const response = CANNED_RESPONSES[responseIndex % CANNED_RESPONSES.length];
  responseIndex++;
  return response;
}
