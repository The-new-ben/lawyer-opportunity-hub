import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
 e43qts-codex/fix-404-pages-and-functionality-issues
import type { Database } from '@/integrations/supabase/types';
import { classifyLead } from '@/lib/aiService';
import { sendWhatsAppTextMessage } from '@/lib/whatsappService';

export type Lead = Database['public']['Tables']['leads']['Row'];
export type NewLead = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

import { toast } from 'sonner';
import { classifyLead } from '@/lib/aiService';
import { sendWhatsAppTextMessage } from '@/lib/whatsappService';

export type Lead = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  case_description: string;
  legal_category: string;
  urgency_level: string;
  status: string;
  visibility_level: string;
  source: string;
  preferred_location?: string;
  estimated_budget?: number;
  case_details: any;
  assigned_lawyer_id?: string;
  created_at: string;
  updated_at: string;
};

export type NewLead = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'visibility_level' | 'source'>;
 main

export const useLeads = () => {
  const queryClient = useQueryClient();

 e43qts-codex/fix-404-pages-and-functionality-issues
  const fetchLeads = async () => {

  const fetchLeads = async (): Promise<Lead[]> => {
 main
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
 e43qts-codex/fix-404-pages-and-functionality-issues
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

    
    if (error) throw error;
    return data || [];
  };

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  const parseClassification = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return {
        legal_category: parsed.legal_category || 'אזרחי',
        urgency_level: parsed.urgency_level || 'medium'
      };
    } catch {
      return { legal_category: 'אזרחי', urgency_level: 'medium' };
    }
  };

  const addLead = useMutation({
    mutationFn: async (newLead: Partial<NewLead>) => {
      let classification = { legal_category: 'אזרחי', urgency_level: 'medium' };
      
      if (newLead.case_description) {
        try {
          const classificationResult = await classifyLead(newLead.case_description);
          classification = parseClassification(classificationResult);
        } catch (error) {
          console.warn('AI classification failed, using defaults', error);
        }
      }

      const leadData = {
        customer_name: newLead.customer_name,
        customer_phone: newLead.customer_phone,
        case_description: newLead.case_description,
        customer_email: newLead.customer_email || '',
        legal_category: newLead.legal_category || classification.legal_category,
        urgency_level: newLead.urgency_level || classification.urgency_level,
        status: 'new',
        visibility_level: 'restricted',
        source: 'website',
        preferred_location: newLead.preferred_location,
        estimated_budget: newLead.estimated_budget,
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('ליד חדש נוצר בהצלחה');
      
      // Send WhatsApp confirmation message
      if (data.customer_phone) {
        try {
          await sendWhatsAppTextMessage(
            data.customer_phone,
            `שלום ${data.customer_name}, בקשתך התקבלה במערכת ואנו נחזור אליך בהקדם. תחום: ${data.legal_category}`
          );
        } catch (error) {
          console.warn('WhatsApp message failed to send', error);
        }
      }
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת ליד');
      console.error('Error creating lead:', error);
    }
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Lead> }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('הליד עודכן בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה בעדכון הליד');
    }
  });

  const convertLeadToClient = useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', leadId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('הליד הומר ללקוח בהצלחה');
    },
    onError: (error) => {
      toast.error('שגיאה בהמרת הליד ללקוח');
      console.error('Error converting lead:', error);
    }
  });

  // Get lead statistics
  const getLeadStats = () => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const highPriorityLeads = leads.filter(l => l.urgency_level === 'high').length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;

    return {
      totalLeads,
      newLeads,
      highPriorityLeads,
      convertedLeads
    };
  };

  return {
    leads,
    isLoading,
    error,
    addLead,
    updateLead,
    convertLeadToClient,
    getLeadStats
  };
};
 main
