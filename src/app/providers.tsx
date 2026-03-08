'use client';

import { AuthProvider } from '@/lib/auth-context';
import { AdvisorProvider, useAdvisor } from '@/lib/advisor-context';
import AdvisorSidebar from '@/components/advisor/AdvisorSidebar';
import { useIsMobileDevice } from '@/lib/use-mobile-platform';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useAdvisor();
  const isMobileDevice = useIsMobileDevice();

  return (
    <>
      <AdvisorSidebar />

      {/* Main content — shifts right when advisor is open, or nudged for collapsed bar on md+ */}
      {/* Rule 2: no gap for collapsed sidebar on iOS/Android */}
      <div
        className={`min-h-screen transition-all duration-300 ease-out ${
          isOpen
            ? 'sm:ml-[50vw] xl:ml-[33vw] advisor-open'
            : isMobileDevice ? '' : 'md:ml-[54px]'
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
