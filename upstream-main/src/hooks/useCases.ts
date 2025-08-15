import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
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
  summary?: string | null;
  reviewed?: boolean;
  created_at: string;
  updated_at: string;
};

export type NewCase = Omit<Case, 'id' | 'created_at' | 'updated_at' | 'summary' | 'reviewed'>;

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
      toast({ title: 'תיק חדש נוצר בהצלחה' });
    },
    onError: (error) => {
      toast({ title: 'שגיאה ביצירת תיק', variant: 'destructive', description: error instanceof Error ? error.message : String(error) });
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
      toast({ title: 'התיק עודכן בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה בעדכון התיק', variant: 'destructive' });
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
      toast({ title: 'התיק נסגר בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה בסגירת התיק', variant: 'destructive' });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('cases')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, (payload) => {
        queryClient.setQueryData(['cases'], (current: Case[] = []) => {
          const newCase = payload.new as Case;
          const oldCase = payload.old as Case;
          switch (payload.eventType) {
            case 'INSERT':
              return [newCase, ...current];
            case 'UPDATE':
              return current.map(c => (c.id === newCase.id ? { ...c, ...newCase } : c));
            case 'DELETE':
              return current.filter(c => c.id !== oldCase.id);
            default:
              return current;
          }
        });
      });

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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