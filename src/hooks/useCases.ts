import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Case = {
  id: string;
  title: string;
  client_id: string;
  status: string;
  priority: string;
  opened_at: string;
  assigned_lawyer_id?: string;
  notes?: string;
  estimated_budget?: number;
  legal_category: string;
  created_at: string;
  updated_at: string;
};

export type NewCase = Omit<Case, 'id' | 'created_at' | 'updated_at'>;

export const useCases = () => {
  const queryClient = useQueryClient();

  const fetchCases = async (): Promise<Case[]> => {
    // Note: We'll need to create a cases table in Supabase
    // For now, we'll return mock data structure
    return [];
  };

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ['cases'],
    queryFn: fetchCases,
  });

  const addCase = useMutation({
    mutationFn: async (newCase: Partial<NewCase>) => {
      // This will need to be implemented once cases table exists
      const caseData = {
        ...newCase,
        status: 'open',
        opened_at: new Date().toISOString()
      };

      // Placeholder - replace with actual Supabase call
      return caseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('תיק חדש נוצר בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת תיק');
      console.error('Error creating case:', error);
    }
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Case> }) => {
      // Placeholder - replace with actual Supabase call
      return { id, ...values };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('התיק עודכן בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון התיק');
    }
  });

  const closeCase = useMutation({
    mutationFn: async (id: string) => {
      // Update case status to closed
      return { id, status: 'closed' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('התיק נסגר בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בסגירת התיק');
    }
  });

  // Get case statistics
  const getCaseStats = () => {
    const totalCases = cases.length;
    const openCases = cases.filter(c => c.status === 'open').length;
    const highPriorityCases = cases.filter(c => c.priority === 'high').length;
    const totalAmount = cases.reduce((sum, c) => sum + (c.estimated_budget || 0), 0);

    return {
      totalCases,
      openCases,
      highPriorityCases,
      totalAmount
    };
  };

  return {
    cases,
    isLoading,
    error,
    addCase,
    updateCase,
    closeCase,
    getCaseStats
  };
};