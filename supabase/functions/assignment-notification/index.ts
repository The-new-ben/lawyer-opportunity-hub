import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
      let sendToLead = true;
      const { data: leadProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', lead.customer_phone)
        .maybeSingle();
      if (leadProfile) {
        const { data: leadPref } = await supabaseAdmin
          .from('notification_preferences')
          .select('whatsapp')
          .eq('profile_id', leadProfile.id)
          .maybeSingle();
        if (leadPref && leadPref.whatsapp === false) {
          sendToLead = false;
        }
      }
      if (sendToLead) {
        await sendWhatsAppMessage(
          lead.customer_phone,
          `Hello ${lead.customer_name}, your lead has been assigned to lawyer ${lawyer.profiles.full_name}`
        );
      }

      const { data: lawyerPref } = await supabaseAdmin
        .from('notification_preferences')
        .select('whatsapp')
        .eq('profile_id', lawyer.profile_id)
        .maybeSingle();
      const lawyerPhone = lawyer.profiles.whatsapp_number || lawyer.profiles.phone;
      if (lawyerPhone && lawyerPref?.whatsapp !== false) {
        await sendWhatsAppMessage(
          lawyerPhone,
          `New lead: ${lead.customer_name} Phone: ${lead.customer_phone}`
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
        const { data: pref } = await supabaseAdmin
          .from('notification_preferences')
          .select('whatsapp')
          .eq('profile_id', meeting.lawyers.profile_id)
          .maybeSingle();
        if (whatsappNumber && pref?.whatsapp !== false) {
          const lawyerMessage = `New meeting scheduled:
📅 Date: ${meetingDate}
🕐 Time: ${meetingTime}
📍 Location: ${meeting.location || 'Not specified'}`;
          await sendWhatsAppMessage(whatsappNumber, lawyerMessage);
          logStep("Meeting notification sent to lawyer");
        }
      }

      // Send to client
      let clientPhone = null;
      let clientName = '';
      let clientProfileId = null;

      if (meeting.cases?.profiles) {
        clientPhone = meeting.cases.profiles.whatsapp_number || meeting.cases.profiles.phone;
        clientName = meeting.cases.profiles.full_name;
        clientProfileId = meeting.cases.client_id;
      } else if (meeting.leads) {
        clientPhone = meeting.leads.customer_phone;
        clientName = meeting.leads.customer_name;
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('phone', meeting.leads.customer_phone)
          .maybeSingle();
        if (profile) {
          clientProfileId = profile.id;
        }
      }

      let sendToClient = true;
      if (clientProfileId) {
        const { data: clientPref } = await supabaseAdmin
          .from('notification_preferences')
          .select('whatsapp')
          .eq('profile_id', clientProfileId)
          .maybeSingle();
        if (clientPref && clientPref.whatsapp === false) {
          sendToClient = false;
        }
      }

      if (clientPhone && sendToClient) {
        const clientMessage = `Hello ${clientName}, a meeting has been scheduled for you:
📅 Date: ${meetingDate}
🕐 Time: ${meetingTime}
📍 Location: ${meeting.location || 'To be sent separately'}`;
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
    console.warn(
      `[ASSIGNMENT-NOTIFICATION] Missing WhatsApp credentials, skipping message`,
      { phoneNumber },
    );
    return;
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
