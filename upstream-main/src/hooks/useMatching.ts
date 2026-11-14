import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MatchedLawyer {
  lawyer_id: string;
  lawyer_name: string;
  specializations: string[];
  rating: number;
  hourly_rate: number;
  matching_score: number;
}

export interface LawyerSpecialization {
  id: string;
  lawyer_id: string;
  specialization: string;
  experience_years: number;
  success_rate: number;
  created_at: string;
}

export const useMatching = () => {
  const queryClient = useQueryClient();

  // Get matched lawyers for a lead
  const useMatchedLawyers = (leadId: string) => {
    return useQuery({
      queryKey: ['matched-lawyers', leadId],
      queryFn: async (): Promise<MatchedLawyer[]> => {
        const { data, error } = await supabase.rpc('get_matched_lawyers', {
          p_lead_id: leadId,
          p_limit: 10
        });
        
        if (error) throw error;
        return data || [];
      },
      enabled: !!leadId,
    });
  };

  // Get lawyer specializations
  const { data: specializations, isLoading: loadingSpecializations } = useQuery({
    queryKey: ['lawyer-specializations'],
    queryFn: async (): Promise<LawyerSpecialization[]> => {
      const { data, error } = await supabase
        .from('lawyer_specializations')
        .select('*')
        .order('specialization');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Add specialization
  const addSpecialization = useMutation({
    mutationFn: async (newSpec: Omit<LawyerSpecialization, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('lawyer_specializations')
        .insert(newSpec)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-specializations'] });
      toast.success('Specialization added successfully');
    },
    onError: () => {
      toast.error('Error adding specialization');
    }
  });

  // Update specialization
  const updateSpecialization = useMutation({
    mutationFn: async ({ id, ...values }: Partial<LawyerSpecialization> & { id: string }) => {
      const { data, error } = await supabase
        .from('lawyer_specializations')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-specializations'] });
      toast.success('Specialization updated successfully');
    },
    onError: () => {
      toast.error('Error updating specialization');
    }
  });

  // Delete specialization
  const deleteSpecialization = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lawyer_specializations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-specializations'] });
      toast.success('Specialization deleted successfully');
    },
    onError: () => {
      toast.error('Error deleting specialization');
    }
  });

  return {
    useMatchedLawyers,
    specializations,
    loadingSpecializations,
    addSpecialization,
    updateSpecialization,
    deleteSpecialization,
  };
};