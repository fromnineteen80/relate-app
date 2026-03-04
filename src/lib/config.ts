export type PricingTier = 'free' | 'plus' | 'premium' | 'pro' | 'couples';

export const PRICING: Record<PricingTier, { label: string; price: number; priceDisplay: string; stripeCents: number }> = {
  free: { label: 'Free', price: 0, priceDisplay: '$0', stripeCents: 0 },
  plus: { label: 'Plus', price: 29.99, priceDisplay: '$29.99', stripeCents: 2999 },
  premium: { label: 'Premium', price: 49.99, priceDisplay: '$49.99', stripeCents: 4999 },
  pro: { label: 'Pro', price: 69.99, priceDisplay: '$69.99', stripeCents: 6999 },
  couples: { label: 'Couples', price: 119, priceDisplay: '$119', stripeCents: 11900 },
};

export const config = {
  useMockAuth: process.env.NEXT_PUBLIC_MOCK_AUTH === 'true',
  useMockPayments: process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true',
  useMockAdvisor: process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true',
  /** Grants full (premium) access without paying. Stripe checkout still works if used. */
  testFullAccess: process.env.NEXT_PUBLIC_TEST_FULL_ACCESS === 'true',
  appUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
};
