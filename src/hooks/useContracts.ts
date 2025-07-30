import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DigitalContract {
  id: string;
  quote_id: string;
  contract_content: string;
  lawyer_signature?: string;
  client_signature?: string;
  lawyer_signed_at?: string;
  client_signed_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  contract_id: string;
  amount: number;
  commission_rate: number;
  status: string;
  paid_at?: string;
  created_at: string;
}

export type NewContract = Omit<DigitalContract, 'id' | 'created_at' | 'updated_at'>;

export const useContracts = () => {
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ['digital-contracts'],
    queryFn: async (): Promise<DigitalContract[]> => {
      const { data, error } = await supabase
        .from('digital_contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['commissions'],
    queryFn: async (): Promise<Commission[]> => {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const createContract = useMutation({
    mutationFn: async (newContract: NewContract) => {
      const { data, error } = await supabase
        .from('digital_contracts')
        .insert({
          ...newContract,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-contracts'] });
      toast.success('חוזה דיגיטלי נוצר בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת החוזה');
      console.error('Error creating contract:', error);
    }
  });

  const signContract = useMutation({
    mutationFn: async ({ 
      id, 
      signature, 
      role 
    }: { 
      id: string; 
      signature: string; 
      role: 'lawyer' | 'client' 
    }) => {
      const updateData = role === 'lawyer' 
        ? { 
            lawyer_signature: signature, 
            lawyer_signed_at: new Date().toISOString() 
          }
        : { 
            client_signature: signature, 
            client_signed_at: new Date().toISOString() 
          };

      const { data, error } = await supabase
        .from('digital_contracts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Check if both signatures exist, then update status to signed
      if (data.lawyer_signature && data.client_signature) {
        const { error: statusError } = await supabase
          .from('digital_contracts')
          .update({ status: 'signed' })
          .eq('id', id);
        
        if (statusError) throw statusError;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-contracts'] });
      toast.success('החוזה נחתם בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בחתימת החוזה');
    }
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<DigitalContract> }) => {
      const { data, error } = await supabase
        .from('digital_contracts')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-contracts'] });
      toast.success('החוזה עודכן בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון החוזה');
    }
  });

  // Get contract statistics
  const getContractStats = () => {
    const totalContracts = contracts.length;
    const pendingContracts = contracts.filter(c => c.status === 'pending').length;
    const signedContracts = contracts.filter(c => c.status === 'signed').length;
    const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);

    return {
      totalContracts,
      pendingContracts,
      signedContracts,
      totalCommissions
    };
  };

  return {
    contracts,
    commissions,
    isLoading,
    error,
    createContract,
    signContract,
    updateContract,
    getContractStats
  };
};