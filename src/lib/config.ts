export const config = {
  useMockAuth: process.env.NEXT_PUBLIC_MOCK_AUTH === 'true',
  useMockPayments: process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true',
  useMockAdvisor: process.env.NEXT_PUBLIC_MOCK_ADVISOR === 'true',
  appUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
};
