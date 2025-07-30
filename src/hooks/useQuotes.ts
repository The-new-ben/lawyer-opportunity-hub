import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Quote {
  id: string;
  lead_id: string;
  lawyer_id: string;
  service_description: string;
  quote_amount: number;
  payment_terms?: string;
  estimated_duration_days?: number;
  valid_until?: string;
  terms_and_conditions?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type NewQuote = Omit<Quote, 'id' | 'created_at' | 'updated_at'>;

export const useQuotes = () => {
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading, error } = useQuery({
    queryKey: ['quotes'],
    queryFn: async (): Promise<Quote[]> => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const addQuote = useMutation({
    mutationFn: async (newQuote: NewQuote) => {
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          ...newQuote,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('הצעת מחיר נשלחה בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה בשליחת הצעת מחיר');
      console.error('Error creating quote:', error);
    }
  });

  const updateQuote = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Quote> }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('הצעת מחיר עודכנה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון הצעת מחיר');
    }
  });

  const acceptQuote = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('הצעת המחיר אושרה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה באישור הצעת מחיר');
    }
  });

  const rejectQuote = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('הצעת המחיר נדחתה');
    },
    onError: () => {
      toast.error('שגיאה בדחיית הצעת מחיר');
    }
  });

  // Get quote statistics
  const getQuoteStats = () => {
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
    const totalAmount = quotes
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + q.quote_amount, 0);

    return {
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      totalAmount
    };
  };

  return {
    quotes,
    isLoading,
    error,
    addQuote,
    updateQuote,
    acceptQuote,
    rejectQuote,
    getQuoteStats
  };
};