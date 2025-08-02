import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - מפחית בקשות רשת
      retry: (failureCount, error) => {
        // פחות retry attempts לביצועים טובים יותר
        if (failureCount >= 2) return false;
        // רק retry על שגיאות רשת זמניות
        if (error?.message?.includes('Failed to fetch')) return true;
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
      refetchOnWindowFocus: false, // מבטל refetch מיותר
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};