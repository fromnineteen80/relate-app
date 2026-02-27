export type Referral = {
  service: string;
  url: string;
  cta: string;
  reason: string;
};

export function generateReferrals(results: {
  m4?: { summary?: { approach?: string }; gottmanScreener?: Record<string, number>; gottmanScores?: Record<string, number> };
  demographics?: { relationshipStatus?: string };
}): Referral[] {
  const referrals: Referral[] = [];
  const gottman = results.m4?.gottmanScreener || results.m4?.gottmanScores || {};
  const horsemenSum = Object.values(gottman).reduce((a: number, b: number) => a + b, 0);

  if (horsemenSum > 50) {
    referrals.push({
      service: 'betterhelp',
      url: 'https://betterhelp.com/?affiliate=RELATE',
      cta: 'Try BetterHelp',
      reason: 'Your Gottman scores suggest professional support could help.',
    });
  }

  if (results.demographics?.relationshipStatus === 'Single') {
    referrals.push({
      service: 'matchmaking',
      url: 'https://example.com?ref=RELATE',
      cta: 'Connect with a Matchmaker',
      reason: 'Personalized matching based on your RELATE profile.',
    });
  }

  return referrals;
}
