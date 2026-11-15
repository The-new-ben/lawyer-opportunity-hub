import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  contract_id: string;
  amount: number;
  payment_type: string;
  status: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  escrow_released_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  lead_id: string;
  lawyer_id: string;
  quote_id?: string;
  amount: number;
  deposit_type: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at?: string;
}

export const usePayments = () => {
  const queryClient = useQueryClient();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    payments,
    isLoading,
    error,
  };
};

export const useDeposits = () => {
  const queryClient = useQueryClient();

  const { data: deposits, isLoading, error } = useQuery({
    queryKey: ['deposits'],
    queryFn: async (): Promise<Deposit[]> => {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const addDeposit = useMutation({
    mutationFn: async (newDeposit: Omit<Deposit, 'id' | 'created_at' | 'updated_at'>) => {
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
    },
  });

  const updateDeposit = useMutation({
    mutationFn: async ({ id, ...values }: Partial<Deposit> & { id: string }) => {
      const { data, error } = await supabase
        .from('deposits')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
    },
  });

  return {
    deposits,
    isLoading,
    error,
    addDeposit,
    updateDeposit,
  };
};