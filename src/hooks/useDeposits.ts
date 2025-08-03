import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type LeadDeposit = {
  id: string;
  lead_id: string;
  lawyer_id: string;
  quote_id?: string;
  amount: number;
  deposit_type: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
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
      .order('created_at', { ascending: false })
      .returns<LeadDeposit[]>();

    if (error) throw error;
    return data ?? [];
  };

  const { data: deposits = [], isLoading, error } = useQuery({
    queryKey: ['deposits'],
    queryFn: fetchLeadDeposits,
  });

  const addDeposit = useMutation({
    mutationFn: async (newDeposit: NewLeadDeposit) => {
      const { data, error } = await supabase
        .from('deposits')
        .insert<NewLeadDeposit>(newDeposit)
        .select()
        .single()
        .returns<LeadDeposit>();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast({ title: 'פיקדון נוצר בהצלחה' });
    },
    onError: (error) => {
      toast({ 
        title: 'שגיאה ביצירת פיקדון', 
        variant: 'destructive', 
        description: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  const updateDeposit = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<LeadDeposit> }) => {
      const { data, error } = await supabase
        .from('deposits')
        .update<Partial<LeadDeposit>>({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        .returns<LeadDeposit>();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast({ title: 'הפיקדון עודכן בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה בעדכון הפיקדון', variant: 'destructive' });
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