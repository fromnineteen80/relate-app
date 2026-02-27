'use client';

export function getMockPaymentStatus(): { paid: boolean; product: string | null } {
  if (typeof window === 'undefined') return { paid: false, product: null };
  const stored = localStorage.getItem('relate_mock_payment');
  if (stored) return JSON.parse(stored);
  return { paid: false, product: null };
}

export function mockPurchase(product: 'full_report' | 'couples_report') {
  const status = { paid: true, product };
  localStorage.setItem('relate_mock_payment', JSON.stringify(status));
  return status;
}

export function mockResetPayment() {
  localStorage.removeItem('relate_mock_payment');
}
