'use client';

import { AuthProvider } from '@/lib/auth-context';
import { AdvisorProvider } from '@/lib/advisor-context';
import AdvisorSidebar from '@/components/advisor/AdvisorSidebar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdvisorProvider>
        {children}
        <AdvisorSidebar />
      </AdvisorProvider>
    </AuthProvider>
  );
}
