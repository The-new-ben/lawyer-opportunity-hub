import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export type Meeting = Database['public']['Tables']['meetings']['Row'];
export type NewMeeting = Database['public']['Tables']['meetings']['Insert'];

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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: "Meeting scheduled successfully",
        description: "The meeting was added to the calendar",
      });
      
      // Send meeting notifications
      try {
        await supabase.functions.invoke('assignment-notification', {
          body: { 
            type: 'meeting_scheduled',
            meetingId: data.id 
          }
        });
      } catch (error) {
        console.error('Failed to send meeting notification:', error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error scheduling meeting",
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
        title: "Meeting updated successfully",
        description: "Meeting details saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating meeting",
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
        title: "Meeting canceled",
        description: "The meeting was removed from the calendar",
      });
    },
    onError: (error) => {
      toast({
        title: "Error canceling meeting",
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