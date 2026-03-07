'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SubNav } from '@/components/SubNav';
import { SiteFooter } from '@/components/SiteFooter';
import { useAuth } from '@/lib/auth-context';
import { Icon } from '@/components/Icon';

const CATEGORIES = [
  'General Feedback',
  'Assessment Questions',
  'Results & Report',
  'AI Advisor',
  'Couples Features',
  'Bug Report',
  'Feature Request',
  'Account & Billing',
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill email when user loads
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          category,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Failed to send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full text-center">
          <div className="card">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
              <Icon name="check" size={24} />
            </div>
            <h1 className="font-serif text-2xl font-semibold mb-2">Thank You</h1>
            <p className="explainer mb-6">
              Your feedback has been sent. We read every submission and use it to improve RELATE.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/account" className="btn-secondary text-sm">Back to Account</Link>
              <button
                onClick={() => { setSubmitted(false); setMessage(''); }}
                className="btn-primary text-sm"
              >
                Send More Feedback
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <SubNav />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <h1 className="font-serif text-3xl font-semibold mb-2">Feedback</h1>
        <p className="explainer mb-8">
          Help us improve RELATE. Share your experience, report issues, or suggest features.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="input w-full"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="input w-full"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input w-full"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="label">What is your feedback about?</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input w-full"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Your Feedback</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input w-full min-h-[160px] resize-y"
              placeholder="Tell us what's on your mind. Be as detailed as you'd like. We read every submission."
              required
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
