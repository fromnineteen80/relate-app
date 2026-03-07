'use client';

import { AuthProvider } from '@/lib/auth-context';
import { AdvisorProvider, useAdvisor } from '@/lib/advisor-context';
import AdvisorSidebar from '@/components/advisor/AdvisorSidebar';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useAdvisor();

  return (
    <>
      <AdvisorSidebar />

      {/* Main content — shifts right when advisor is open, or nudged for collapsed bar on md+ */}
      <div
        className={`min-h-screen transition-all duration-300 ease-out ${
          isOpen
            ? 'sm:ml-[280px] advisor-open'
            : 'md:ml-[72px]'
        }`}
      >
        {children}
      </div>
    </>
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
