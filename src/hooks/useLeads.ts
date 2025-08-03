import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';
import { classifyLead } from '@/lib/aiService';
import { sendWhatsAppTextMessage } from '@/lib/whatsappService';

export type Lead = Database['public']['Tables']['leads']['Row'];
export type NewLead = Database['public']['Tables']['leads']['Insert'];

export const useLeads = () => {
  const queryClient = useQueryClient();

  const fetchLeads = async (): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
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
          toast({
            title: 'AI classification failed, using defaults',
            description: error instanceof Error ? error.message : String(error),
            variant: 'destructive'
          });
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
      toast({ title: 'ליד חדש נוצר בהצלחה' });
      
      // Trigger automated pipeline
      try {
        await supabase.functions.invoke('automated-lead-pipeline', {
          body: { leadId: data.id }
        });
        toast({
          title: 'Pipeline אוטומטי הופעל עבור ליד',
          description: String(data.id)
        });
      } catch (error) {
        toast({
          title: 'Pipeline אוטומטי נכשל',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive'
        });
        
        // Fallback: Send basic WhatsApp confirmation
        if (data.customer_phone) {
          try {
            await sendWhatsAppTextMessage(
              data.customer_phone,
              `שלום ${data.customer_name}, בקשתך התקבלה במערכת ואנו נחזור אליך בהקדם. תחום: ${data.legal_category}`
            );
          } catch (error) {
            toast({
              title: 'WhatsApp message failed to send',
              description: error instanceof Error ? error.message : String(error),
              variant: 'destructive'
            });
          }
        }
      }
    },
    onError: (error) => {
      toast({ title: 'שגיאה ביצירת ליד', variant: 'destructive', description: error instanceof Error ? error.message : String(error) });
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
      toast({ title: 'הליד עודכן בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה בעדכון הליד', variant: 'destructive' });
    }
  });

  const convertLeadToClient = useMutation({
    mutationFn: async (leadId: string) => {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) throw new Error('Lead not found');

      // 1. Create or upsert client in profiles table
      const { data: client, error: clientError } = await supabase
        .from('profiles')
        .upsert({
          user_id: crypto.randomUUID(), // Generate new user ID for client
          full_name: lead.customer_name,
          phone: lead.customer_phone,
          role: 'client'
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Create new case for this client
      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          client_id: client.id,
          assigned_lawyer_id: lead.assigned_lawyer_id,
          title: `טיפול ב${lead.legal_category} עבור ${lead.customer_name}`,
          legal_category: lead.legal_category,
          estimated_budget: lead.estimated_budget,
          status: 'open',
          priority: lead.urgency_level || 'medium'
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // 3. Update lead status to converted
      const { data: updatedLead, error: leadError } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', leadId)
        .select()
        .single();

      if (leadError) throw leadError;

      return { client, case: newCase, lead: updatedLead };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ 
        title: 'הליד הומר ללקוח בהצלחה',
        description: `נוצר תיק חדש: ${data.case.title}`
      });
    },
    onError: (error) => {
      toast({ 
        title: 'שגיאה בהמרת הליד ללקוח', 
        variant: 'destructive', 
        description: error instanceof Error ? error.message : String(error) 
      });
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