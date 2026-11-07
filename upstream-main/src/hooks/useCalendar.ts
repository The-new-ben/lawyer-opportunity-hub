import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';
import { syncEventToGoogle } from '@/integrations/googleCalendar';
import { createCalendlyEvent } from '@/integrations/calendly';

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

      const googleToken = import.meta.env.VITE_GOOGLE_API_TOKEN;
      if (googleToken) {
        try {
          await syncEventToGoogle(data, googleToken);
        } catch (e) {
          toast({
            title: 'google sync error',
            description: e instanceof Error ? e.message : String(e),
            variant: 'destructive'
          });
        }
      }

      const calendlyToken = import.meta.env.VITE_CALENDLY_TOKEN;
      if (calendlyToken) {
        try {
          await createCalendlyEvent(data, calendlyToken);
        } catch (e) {
          toast({
            title: 'calendly sync error',
            description: e instanceof Error ? e.message : String(e),
            variant: 'destructive'
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'אירוע חדש נוצר בהצלחה' });
    },
    onError: (error) => {
      toast({ title: 'שגיאה ביצירת אירוע', variant: 'destructive', description: error instanceof Error ? error.message : String(error) });
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
      toast({ title: 'האירוע עודכן בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה בעדכון האירוע', variant: 'destructive' });
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
      toast({ title: 'האירוע נמחק בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה במחיקת האירוע', variant: 'destructive' });
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