import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type LeadDeposit = {
  id: string;
  lead_id: string;
  lawyer_id: string;
  amount: number;
  status: string;
  payment_method: string;
  stripe_session_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
};

export type NewLeadDeposit = Omit<LeadDeposit, 'id' | 'created_at' | 'updated_at'>;

export const useLeadDeposits = () => {
  const queryClient = useQueryClient();

  const fetchLeadDeposits = async (): Promise<LeadDeposit[]> => {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as LeadDeposit[] || [];
  };

  const { data: deposits = [], isLoading, error } = useQuery({
    queryKey: ['deposits'],
    queryFn: fetchLeadDeposits,
  });

  const addDeposit = useMutation({
    mutationFn: async (newDeposit: NewLeadDeposit) => {
      const { data, error } = await supabase
        .from('deposits')
        .insert(newDeposit)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast({ title: 'Deposit created successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error creating deposit',
        variant: 'destructive',
        description: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const updateDeposit = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<LeadDeposit> }) => {
      const updateData: Partial<LeadDeposit> = { ...values, updated_at: new Date().toISOString() };
      const { data, error } = await supabase
        .from('deposits')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast({ title: 'Deposit updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error updating deposit', variant: 'destructive' });
    }
  });

  const getDepositStats = () => {
    const totalDeposits = deposits.length;
    const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
    const paidDeposits = deposits.filter(d => d.status === 'paid').length;
    const totalAmount = deposits
      .filter(d => d.status === 'paid')
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      totalDeposits,
      pendingDeposits,
      paidDeposits,
      totalAmount
    };
  };

  return {
    deposits,
    isLoading,
    error,
    addDeposit,
    updateDeposit,
    getDepositStats
  };
};