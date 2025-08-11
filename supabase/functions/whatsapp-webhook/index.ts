import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE') ?? ''
    )

    // Handle GET requests for webhook verification
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      const verifyToken = Deno.env.get('WHATSAPP_TOKEN'); // Use same token for verification
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WhatsApp webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } else {
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Handle POST requests for incoming messages
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from; // Phone number
        const text = message.text?.body || '';
        const contacts = value?.contacts?.[0];
        const customerName = contacts?.profile?.name || 'New customer';

        // Process incoming lead using the database function
        const { data, error } = await supabase.rpc('process_incoming_lead', {
          p_from_number: from,
          p_content: text
        });

        if (error) {
          console.error('Error creating lead from WhatsApp:', error);
          return new Response(JSON.stringify({ error: 'Failed to create lead' }), { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log('Successfully created lead from WhatsApp message');

        // Send acknowledgment message
        const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
        const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_ID');

        if (whatsappToken && phoneNumberId) {
          const whatsappUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
          
          await fetch(whatsappUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: from,
              text: {
                body: 'Thank you for your inquiry! We received your message and a lawyer will contact you soon.'
              }
            })
          });
        }
      }

      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})