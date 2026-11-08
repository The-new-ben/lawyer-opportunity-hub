import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type Client = {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  role: string;
  company_name?: string;
  whatsapp_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type NewClient = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

export const useClients = () => {
  const queryClient = useQueryClient();

  const fetchClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  };

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const addClient = useMutation({
    mutationFn: async (newClient: Partial<NewClient>) => {
      // Ensure required fields are present
      if (!newClient.full_name) {
        throw new Error('Client name is required');
      }

      const clientData = {
        user_id: newClient.user_id || crypto.randomUUID(),
        full_name: newClient.full_name,
        phone: newClient.phone,
        role: 'client',
        company_name: newClient.company_name,
        whatsapp_number: newClient.whatsapp_number,
        avatar_url: newClient.avatar_url,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(clientData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'לקוח חדש נוסף בהצלחה' });
    },
    onError: (error) => {
      toast({ title: 'שגיאה בהוספת לקוח', variant: 'destructive', description: error instanceof Error ? error.message : String(error) });
    }
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Client> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'פרטי הלקוח עודכנו בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה בעדכון פרטי הלקוח', variant: 'destructive' });
    }
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'הלקוח נמחק בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה במחיקת הלקוח', variant: 'destructive' });
    }
  });

  // Get client statistics
  const getClientStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(client => 
      new Date(client.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const newThisMonth = clients.filter(client => 
      new Date(client.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalClients,
      activeClients,
      newThisMonth
    };
  };

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getClientStats
  };
};