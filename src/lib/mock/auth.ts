'use client';

const MOCK_USER = {
  id: 'mock-user-001',
  email: 'test@relate.app',
  created_at: new Date().toISOString(),
};

export function getMockUser() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('relate_mock_user');
  if (stored) return JSON.parse(stored);
  return null;
}

export function mockSignUp(email: string, _password: string) {
  const user = { ...MOCK_USER, email };
  localStorage.setItem('relate_mock_user', JSON.stringify(user));
  return { user, error: null };
}

export function mockSignIn(email: string, _password: string) {
  const user = { ...MOCK_USER, email };
  localStorage.setItem('relate_mock_user', JSON.stringify(user));
  return { user, error: null };
}

export function mockSignOut() {
  localStorage.removeItem('relate_mock_user');
  return { error: null };
}
