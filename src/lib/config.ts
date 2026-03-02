export type PricingTier = 'free' | 'plus' | 'premium' | 'couples';

export const PRICING: Record<PricingTier, { label: string; price: number; priceDisplay: string; stripeCents: number }> = {
  free: { label: 'Free', price: 0, priceDisplay: '$0', stripeCents: 0 },
  plus: { label: 'Plus', price: 19.99, priceDisplay: '$19.99', stripeCents: 1999 },
  premium: { label: 'Premium', price: 29.99, priceDisplay: '$29.99', stripeCents: 2999 },
  couples: { label: 'Couples', price: 49.99, priceDisplay: '$49.99', stripeCents: 4999 },
};

export const config = {
  useMockAuth: process.env.NEXT_PUBLIC_MOCK_AUTH === 'true',
  useMockPayments: process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true',
  useMockAdvisor: process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true',
  appUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
};
