import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sendWhatsAppTextMessage } from '@/lib/whatsappService';
import { classifyLead } from '@/lib/aiService';
import { toast } from 'sonner';

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
  preferred_location?: string;
  estimated_budget?: number;
  assigned_lawyer_id?: string;
  case_details?: any;
  source?: string;
  created_at: string;
  updated_at: string;
};

export type NewLead = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;

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

  const addLead = useMutation({
    mutationFn: async (newLead: Partial<NewLead>) => {
      // Ensure required fields are present
      if (!newLead.customer_name || !newLead.customer_phone || !newLead.case_description) {
        throw new Error('Missing required fields');
      }

      // Classify lead using AI if description exists
      let classification = { legal_category: 'other', urgency_level: 'medium' };
      
      if (newLead.case_description) {
        try {
          const classificationResult = await classifyLead(newLead.case_description);
          // Parse AI response to extract category and urgency
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
    mutationFn: async (lead: Lead) => {
      // Create a new user first (this would typically be done through auth)
      // For now, we'll create a profile with a placeholder user_id
      const placeholderUserId = crypto.randomUUID();
      
      // Insert into profiles table
      const { error: clientError } = await supabase
        .from('profiles')
        .insert({
          user_id: placeholderUserId,
          full_name: lead.customer_name,
          phone: lead.customer_phone,
          role: 'client'
        });
      
      if (clientError) throw clientError;

      // Update lead status
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', lead.id);
      
      if (leadError) throw leadError;

      return lead;
    },
    onSuccess: async (lead) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('הליד הומר ללקוח בהצלחה');

      // Send WhatsApp welcome message
      if (lead.customer_phone) {
        try {
          await sendWhatsAppTextMessage(
            lead.customer_phone,
            `ברוכים הבאים ${lead.customer_name}! אתם עכשיו לקוחות רשמיים שלנו. אנו נעדכן אתכם על התקדמות התיק.`
          );
        } catch (error) {
          console.warn('WhatsApp welcome message failed', error);
        }
      }
    },
    onError: () => {
      toast.error('שגיאה בהמרת הליד ללקוח');
    }
  });

  const assignLawyer = useMutation({
    mutationFn: async ({ leadId, lawyerId }: { leadId: string; lawyerId: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ assigned_lawyer_id: lawyerId, status: 'assigned' })
        .eq('id', leadId)
        .select(`
          *,
          lawyer:lawyers!assigned_lawyer_id(
            profile:profiles(full_name, phone)
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('עורך דין הוקצה בהצלחה');

      // Notify lawyer via WhatsApp
      const lawyerPhone = data.lawyer?.profile?.phone;
      if (lawyerPhone) {
        try {
          await sendWhatsAppTextMessage(
            lawyerPhone,
            `ליד חדש הוקצה אליך: ${data.customer_name}, תחום: ${data.legal_category}, דחיפות: ${data.urgency_level}`
          );
        } catch (error) {
          console.warn('WhatsApp notification to lawyer failed', error);
        }
      }
    },
    onError: () => {
      toast.error('שגיאה בהקצאת עורך דין');
    }
  });

  return {
    leads,
    isLoading,
    error,
    addLead,
    updateLead,
    convertLeadToClient,
    assignLawyer
  };
};

// Helper function to parse AI classification result
function parseClassification(aiResponse: string): { legal_category: string; urgency_level: string } {
  // Simple parsing logic - in production, you'd want more sophisticated parsing
  const response = aiResponse.toLowerCase();
  
  let legal_category = 'other';
  let urgency_level = 'medium';

  // Map keywords to categories
  if (response.includes('חוזה') || response.includes('contract')) legal_category = 'contracts';
  else if (response.includes('משפחה') || response.includes('family')) legal_category = 'family';
  else if (response.includes('פלילי') || response.includes('criminal')) legal_category = 'criminal';
  else if (response.includes('נדלן') || response.includes('property')) legal_category = 'property';
  else if (response.includes('עבודה') || response.includes('labor')) legal_category = 'labor';
  else if (response.includes('חברות') || response.includes('corporate')) legal_category = 'corporate';
  else if (response.includes('מס') || response.includes('tax')) legal_category = 'tax';

  // Map keywords to urgency
  if (response.includes('דחוף') || response.includes('urgent')) urgency_level = 'high';
  else if (response.includes('נמוך') || response.includes('low')) urgency_level = 'low';

  return { legal_category, urgency_level };
}