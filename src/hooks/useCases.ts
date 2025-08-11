import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  };

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ['cases'],
    queryFn: fetchCases,
  });

  const addCase = useMutation({
    mutationFn: async (newCase: NewCase) => {
      const { data, error } = await supabase
        .from('cases')
        .insert({
          ...newCase,
          status: 'open',
          opened_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ title: 'Case created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating case', variant: 'destructive', description: error instanceof Error ? error.message : String(error) });
    }
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Case> }) => {
      const { data, error } = await supabase
        .from('cases')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ title: 'Case updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error updating case', variant: 'destructive' });
    }
  });

  const closeCase = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('cases')
        .update({ status: 'closed' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ title: 'Case closed successfully' });
    },
    onError: () => {
      toast({ title: 'Error closing case', variant: 'destructive' });
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