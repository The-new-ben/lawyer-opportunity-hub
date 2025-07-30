import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Event = Database['public']['Tables']['events']['Row'];
export type NewEvent = Database['public']['Tables']['events']['Insert'];

export const useCalendar = () => {
  const queryClient = useQueryClient();

  const fetchEvents = async (): Promise<Event[]> => {
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
    mutationFn: async (newEvent: Partial<NewEvent>) => {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        client_id: newEvent.client_id,
        case_id: newEvent.case_id,
        lawyer_id: newEvent.lawyer_id,
      };

      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('אירוע חדש נוצר בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת אירוע');
      console.error('Error creating event:', error);
    }
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Event> }) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('האירוע נמחק בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת האירוע');
    }
  });

  // Get event statistics
  const getEventStats = () => {
    const today = new Date();
    const todayEvents = events.filter(event => 
      new Date(event.start_time).toDateString() === today.toDateString()
    );
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const weekEvents = events.filter(e => {
      const eventDate = new Date(e.start_time);
      return eventDate <= nextWeek && eventDate >= today;
    });

    return {
      totalEvents: events.length,
      todayEvents: todayEvents.length,
      weekEvents: weekEvents.length,
      upcomingEvents: events.filter(e => new Date(e.start_time) >= today).length
    };
  };

  return {
    events,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventStats
  };
};