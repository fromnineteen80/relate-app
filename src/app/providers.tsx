'use client';

import { AuthProvider } from '@/lib/auth-context';
import { AdvisorProvider, useAdvisor } from '@/lib/advisor-context';
import AdvisorSidebar from '@/components/advisor/AdvisorSidebar';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useAdvisor();

  return (
    <div className="flex min-h-screen">
      {/* Main content area — shrinks when advisor is open */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ease-out ${
          isOpen ? 'advisor-open' : ''
        }`}
      >
        {children}
      </div>

      {/* Advisor panel — slides in from right, part of document flow */}
      <AdvisorSidebar />
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdvisorProvider>
        <LayoutShell>{children}</LayoutShell>
      </AdvisorProvider>
    </AuthProvider>
  );
}
