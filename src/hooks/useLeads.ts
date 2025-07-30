import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { classifyLead } from '@/lib/aiService';
import { sendWhatsAppTextMessage } from '@/lib/whatsappService';

export type Lead = Database['public']['Tables']['leads']['Row'];
export type NewLead = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export const useLeads = () => {
  const queryClient = useQueryClient();

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Lead[];
  };

  const { data: leads, isLoading, error } = useQuery(['leads'], fetchLeads);

  const addLead = useMutation(
    async (newLead: NewLead) => {
      // classify the description into a legal category and priority
      const area = await classifyLead(newLead.case_description);
      const payload = { ...newLead, legal_category: area };

      const { data, error } = await supabase
        .from('leads')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      // notify the lead via WhatsApp if phone exists
      if (newLead.customer_phone) {
        try {
          await sendWhatsAppTextMessage(
            newLead.customer_phone,
            'קיבלנו את פנייתך ונחזור אליך בהקדם'
          );
        } catch (err) {
          console.error('Failed to send WhatsApp message', err);
        }
      }

      return data as Lead;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['leads']);
      },
    }
  );

  const updateLead = useMutation(
    async ({ id, values }: { id: string; values: LeadUpdate }) => {
      const { error } = await supabase.from('leads').update(values).eq('id', id);
      if (error) throw error;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['leads']),
    }
  );

  const convertLeadToClient = useMutation(
    async (lead: Lead) => {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', lead.id);
      if (error) throw error;

      if (lead.customer_phone) {
        try {
          await sendWhatsAppTextMessage(
            lead.customer_phone,
            'פנייתך הפכה ללקוח במערכת שלנו. ניצור קשר בקרוב'
          );
        } catch (err) {
          console.error('Failed to send WhatsApp message', err);
        }
      }
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['leads']),
    }
  );

  return { leads, isLoading, error, addLead, updateLead, convertLeadToClient };
};
