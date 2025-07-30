import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Meeting {
  id: string;
  case_id?: string;
  lead_id?: string;
  lawyer_id: string;
  client_id?: string;
  scheduled_at: string;
  location?: string;
  meeting_type: 'in_person' | 'video' | 'phone';
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
}

export type NewMeeting = Omit<Meeting, 'id' | 'created_at' | 'updated_at'>;

export const useMeetings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: meetings, isLoading, error } = useQuery({
    queryKey: ['meetings'],
    queryFn: async (): Promise<Meeting[]> => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return (data || []) as Meeting[];
    },
  });

  const addMeeting = useMutation({
    mutationFn: async (newMeeting: NewMeeting) => {
      const { data, error } = await supabase
        .from('meetings')
        .insert(newMeeting)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "פגישה נקבעה בהצלחה",
        description: "הפגישה נוספה ליומן",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בקביעת פגישה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, ...values }: Partial<Meeting> & { id: string }) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "פגישה עודכנה בהצלחה",
        description: "פרטי הפגישה נשמרו",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעדכון פגישה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "פגישה בוטלה",
        description: "הפגישה הוסרה מהיומן",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בביטול פגישה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getMeetingStats = () => {
    if (!meetings) return { total: 0, scheduled: 0, completed: 0, today: 0 };

    const today = new Date().toDateString();
    
    return {
      total: meetings.length,
      scheduled: meetings.filter(m => m.status === 'scheduled').length,
      completed: meetings.filter(m => m.status === 'completed').length,
      today: meetings.filter(m => new Date(m.scheduled_at).toDateString() === today).length,
    };
  };

  return {
    meetings,
    isLoading,
    error,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingStats,
  };
};