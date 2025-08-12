import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getEnvVar(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
const openaiApiKey = getEnvVar('OPENAI_API_KEY');
const whatsappToken = getEnvVar('WHATSAPP_TOKEN');
const whatsappPhoneId = getEnvVar('WHATSAPP_PHONE_ID');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// TODO: Consider moving update logic to a single RPC or wrapping in a
// database transaction to prevent partial pipeline states.

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();
    console.log(`🚀 Starting automated pipeline for lead: ${leadId}`);

    // Step 1: mark that the process started
    await supabase.from('leads').update({
      case_details: {
        pipeline_started: new Date().toISOString(),
        pipeline_stage: 'started'
      }
    }).eq('id', leadId);

    // Fetch lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(`Error fetching lead: ${leadError?.message}`);
    }

    console.log(`📄 Lead found: ${lead.customer_name} - ${lead.legal_category}`);

    // Mark lead as validated
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'lead_validated',
        customer_validated: new Date().toISOString()
      }
    }).eq('id', leadId);

    // Step 2: automatically find a suitable lawyer
    const { data: matchedLawyers, error: matchError } = await supabase
      .rpc('get_matched_lawyers', { 
        p_lead_id: leadId,
        p_limit: 3
      });

    if (matchError || !matchedLawyers?.length) {
      console.log('⚠️ No matching lawyers found');

      // Mark that the search for lawyers failed
      await supabase.from('leads').update({
        case_details: {
          ...lead.case_details,
          pipeline_stage: 'lawyers_search_failed',
          error_message: 'No available lawyers found'
        }
      }).eq('id', leadId);

      return new Response(JSON.stringify({
        success: false,
        message: 'No available lawyers found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Choose the best lawyer (highest score)
    const bestLawyer = matchedLawyers[0];
    console.log(`👨‍💼 Lawyer selected: ${bestLawyer.lawyer_name} (score: ${bestLawyer.matching_score})`);

    // Mark that a lawyer was found
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'lawyer_selected',
        selected_lawyer: bestLawyer,
        lawyer_selected_at: new Date().toISOString()
      }
    }).eq('id', leadId);

    // Step 3: update the lead with the assigned lawyer
    const { error: assignError } = await supabase
      .from('leads')
      .update({ 
        assigned_lawyer_id: bestLawyer.lawyer_id,
        status: 'assigned'
      })
      .eq('id', leadId);

    if (assignError) {
      throw new Error(`Error assigning lawyer: ${assignError.message}`);
    }

    // Mark that assignment was completed
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'lawyer_assigned',
        lawyer_assigned_at: new Date().toISOString()
      }
    }).eq('id', leadId);

    // Step 4: create an automatic quote
    const basePrice = calculateBasePrice(lead.legal_category);
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        lead_id: leadId,
        lawyer_id: bestLawyer.lawyer_id,
        service_description: `Legal consultation in ${lead.legal_category}`,
        quote_amount: basePrice,
        estimated_duration_days: getEstimatedDuration(lead.legal_category),
        payment_terms: '50% upfront payment before work begins',
        status: 'pending',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // one week from now
      })
      .select()
      .single();

    if (quoteError) {
      throw new Error(`Error creating quote: ${quoteError.message}`);
    }

    console.log(`💰 Quote created: ${quote.quote_amount}₪`);

    // Mark that quote was created
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'quote_created',
        quote_created_at: new Date().toISOString(),
        quote_details: {
          quote_id: quote.id,
          amount: quote.quote_amount,
          duration: quote.estimated_duration_days
        }
      }
    }).eq('id', leadId);

    // Step 5: create payment link and WhatsApp message
    const meetingLink = `https://mlnwpocuvjnelttvscja.supabase.co/meeting-scheduler?quote_id=${quote.id}&token=${generateSecureToken()}`;

    const whatsappMessage = generateWhatsAppMessage(lead, bestLawyer, quote, meetingLink);

    // Send WhatsApp message
    try {
      let sendToCustomer = true;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', lead.customer_phone)
        .maybeSingle();
      if (profile) {
        const { data: pref } = await supabase
          .from('notification_preferences')
          .select('whatsapp')
          .eq('profile_id', profile.id)
          .maybeSingle();
        if (pref && pref.whatsapp === false) {
          sendToCustomer = false;
        }
      }
      if (sendToCustomer) {
        await sendWhatsAppMessage(lead.customer_phone, whatsappMessage);
        console.log('📱 WhatsApp message sent to customer');
        await supabase.from('leads').update({
          case_details: {
            ...lead.case_details,
            pipeline_stage: 'whatsapp_sent',
            whatsapp_sent_at: new Date().toISOString(),
            meeting_link: meetingLink
          }
        }).eq('id', leadId);
      }
    } catch (whatsappError) {
      console.error(`❌ Error sending WhatsApp: ${whatsappError}`);

      // Mark that WhatsApp send failed
      await supabase.from('leads').update({
        case_details: {
          ...lead.case_details,
          pipeline_stage: 'whatsapp_failed',
          whatsapp_error: whatsappError.message,
          meeting_link: meetingLink // still store the link in case the customer needs it
        }
      }).eq('id', leadId);
    }

    // Step 6: log the activity in the system
    const { error: logError } = await supabase
      .from('lead_assignments')
      .insert({
        lead_id: leadId,
        lawyer_id: bestLawyer.lawyer_id,
        assignment_type: 'automatic',
        status: 'completed',
        notes: `Automatic assignment - match score: ${bestLawyer.matching_score}`,
        response_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    if (logError) {
      console.warn(`Error logging activity: ${logError.message}`);
    }

    // Final update - process completed successfully
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'completed',
        pipeline_completed_at: new Date().toISOString(),
        pipeline_success: true
      }
    }).eq('id', leadId);

    console.log(`✅ Pipeline completed successfully for lead: ${leadId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Automated pipeline completed successfully',
      data: {
        leadId,
        assignedLawyer: bestLawyer.lawyer_name,
        quoteAmount: quote.quote_amount,
        meetingLink,
        pipelineStage: 'completed'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in automated pipeline:', error);

    // Mark that the process failed
    try {
      const { leadId } = await req.json();
      await supabase.from('leads').update({
        case_details: {
          pipeline_stage: 'failed',
          pipeline_error: error.message,
          pipeline_failed_at: new Date().toISOString(),
          pipeline_success: false
        }
      }).eq('id', leadId);
    } catch (updateError) {
      console.error('Error updating failure status:', updateError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function calculateBasePrice(legalCategory: string): number {
  const basePrices: Record<string, number> = {
    'גירושין': 5000,
    'פלילי': 8000,
    'אזרחי': 3000,
    'מסחרי': 6000,
    'נדלן': 4000,
    'עבודה': 3500,
    'ביטוח לאומי': 2500,
    'נזיקין': 4500
  };
  
  return basePrices[legalCategory] || 3000;
}

function getEstimatedDuration(legalCategory: string): number {
  const durations: Record<string, number> = {
    'גירושין': 90,
    'פלילי': 120,
    'אזרחי': 60,
    'מסחרי': 45,
    'נדלן': 30,
    'עבודה': 60,
    'ביטוח לאומי': 90,
    'נזיקין': 75
  };
  
  return durations[legalCategory] || 60;
}

function generateSecureToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

interface MessageLead {
  customer_name: string
  legal_category: string
}

interface MessageLawyer {
  lawyer_name: string
  rating: number
}

interface MessageQuote {
  quote_amount: number
  estimated_duration_days: number
}

function generateWhatsAppMessage(
  lead: MessageLead,
  lawyer: MessageLawyer,
  quote: MessageQuote,
  meetingLink: string
): string {
  return `Hello ${lead.customer_name}! 👋

We received your inquiry about: ${lead.legal_category}

🎯 We've matched you with the best lawyer:
👨‍💼 ${lawyer.lawyer_name}
⭐ Rating: ${lawyer.rating}/5
💼 Specialty: ${lead.legal_category}

💰 Initial quote: ${quote.quote_amount}₪
⏱️ Estimated duration: ${quote.estimated_duration_days} days

🔗 Schedule a free initial meeting:
${meetingLink}

The initial meeting includes:
✅ Free initial consultation
✅ Case evaluation and prospects
✅ Explanation of the process and costs

❗ Important: The quote is valid for one week

Have questions? Just reply to this message 💬`;
}

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('972') ? cleanPhone : `972${cleanPhone.substring(1)}`;
  
  const response = await fetch(`https://graph.facebook.com/v17.0/${whatsappPhoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${whatsappToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: { body: message }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error sending WhatsApp: ${error}`);
  }
}
