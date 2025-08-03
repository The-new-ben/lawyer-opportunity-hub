import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ASSIGNMENT-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE') ?? '',
      { auth: { persistSession: false } }
    );

    const { type, leadId, meetingId } = await req.json();
    logStep("Request parsed", { type, leadId, meetingId });

    if (type === 'lead_assigned' && leadId) {
      // Handle lead assignment notification - original code
      const { data: lead, error: leadError } = await supabaseAdmin
        .from('leads')
        .select('customer_name, customer_phone, assigned_lawyer_id')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        throw leadError || new Error('Lead not found');
      }

      const { data: lawyer, error: lawyerError } = await supabaseAdmin
        .from('lawyers')
        .select(`
          profile_id,
          profiles:profile_id (
            full_name,
            phone,
            whatsapp_number
          )
        `)
        .eq('id', lead.assigned_lawyer_id)
        .single();

      if (lawyerError || !lawyer) {
        throw lawyerError || new Error('Lawyer not found');
      }

      await sendWhatsAppMessage(
        lead.customer_phone,
        `שלום ${lead.customer_name}, הליד שלך הוקצה לעורך דין ${lawyer.profiles.full_name}`
      );

      const lawyerPhone = lawyer.profiles.whatsapp_number || lawyer.profiles.phone;
      if (lawyerPhone) {
        await sendWhatsAppMessage(
          lawyerPhone,
          `ליד חדש: ${lead.customer_name} טלפון: ${lead.customer_phone}`
        );
      }
    }

    if (type === 'meeting_scheduled' && meetingId) {
      // Handle meeting scheduling notification
      const { data: meeting, error: meetingError } = await supabaseAdmin
        .from('meetings')
        .select(`
          *,
          lawyers:lawyer_id (
            profile_id,
            profiles:profile_id (
              full_name,
              phone,
              whatsapp_number
            )
          ),
          cases:case_id (
            client_id,
            profiles:client_id (
              full_name,
              phone,
              whatsapp_number
            )
          ),
          leads:lead_id (
            customer_name,
            customer_phone
          )
        `)
        .eq('id', meetingId)
        .single();

      if (meetingError) {
        logStep("Error fetching meeting", meetingError);
        throw meetingError;
      }

      const meetingDate = new Date(meeting.scheduled_at).toLocaleDateString('he-IL');
      const meetingTime = new Date(meeting.scheduled_at).toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Send to lawyer
      if (meeting?.lawyers?.profiles) {
        const lawyerProfile = meeting.lawyers.profiles;
        const whatsappNumber = lawyerProfile.whatsapp_number || lawyerProfile.phone;
        
        if (whatsappNumber) {
          const lawyerMessage = `פגישה חדשה נקבעה:
📅 תאריך: ${meetingDate}
🕐 שעה: ${meetingTime}
📍 מיקום: ${meeting.location || 'לא צוין'}`;

          await sendWhatsAppMessage(whatsappNumber, lawyerMessage);
          logStep("Meeting notification sent to lawyer");
        }
      }

      // Send to client
      let clientPhone = null;
      let clientName = '';

      if (meeting.cases?.profiles) {
        clientPhone = meeting.cases.profiles.whatsapp_number || meeting.cases.profiles.phone;
        clientName = meeting.cases.profiles.full_name;
      } else if (meeting.leads) {
        clientPhone = meeting.leads.customer_phone;
        clientName = meeting.leads.customer_name;
      }

      if (clientPhone) {
        const clientMessage = `שלום ${clientName}, נקבעה לך פגישה:
📅 תאריך: ${meetingDate}
🕐 שעה: ${meetingTime}
📍 מיקום: ${meeting.location || 'יישלח אליך בנפרד'}`;

        await sendWhatsAppMessage(clientPhone, clientMessage);
        logStep("Meeting notification sent to client");
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
  const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID');

  if (!whatsappToken || !whatsappPhoneId) {
    throw new Error('WhatsApp credentials not configured');
  }

  const cleanedPhone = phoneNumber.replace(/\D/g, '');
  const formattedPhone = cleanedPhone.startsWith('972') ? cleanedPhone : `972${cleanedPhone.substring(1)}`;

  const response = await fetch(`https://graph.facebook.com/v17.0/${whatsappPhoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${whatsappToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: formattedPhone,
      text: { body: message },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`);
  }

  return response.json();
}
