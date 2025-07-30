import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CalendarEvent = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  client_id?: string;
  case_id?: string;
  lawyer_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type NewCalendarEvent = Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>;

export const useCalendar = () => {
  const queryClient = useQueryClient();

  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  };

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  const addEvent = useMutation({
    mutationFn: async (newEvent: NewCalendarEvent) => {
      const { data, error } = await supabase
        .from('events')
        .insert(newEvent)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('אירוע נוצר בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת אירוע');
      console.error('Error creating event:', error);
    }
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<CalendarEvent> }) => {
      const { data, error } = await supabase
        .from('events')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('האירוע עודכן בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון האירוע');
    }
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('האירוע נמחק בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת האירוע');
    }
  });

  return {
    events,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent
  };
};