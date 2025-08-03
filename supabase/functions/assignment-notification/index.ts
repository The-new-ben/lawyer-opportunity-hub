import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Only POST', { status: 405, headers: corsHeaders })
  }

  try {
    const { lead_id } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('customer_name, customer_phone, assigned_lawyer_id')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      throw leadError || new Error('lead not found')
    }

    const { data: lawyer, error: lawyerError } = await supabase
      .from('lawyers')
      .select('profile:profiles(full_name, phone)')
      .eq('id', lead.assigned_lawyer_id)
      .single()

    if (lawyerError || !lawyer) {
      throw lawyerError || new Error('lawyer not found')
    }

    const token = Deno.env.get('WHATSAPP_TOKEN') ?? ''
    const phoneId = Deno.env.get('WHATSAPP_PHONE_ID') ?? ''
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`

    const send = async (to: string, text: string) => {
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          text: { body: text }
        })
      })
    }

    await send(
      lead.customer_phone,
      `Hi ${lead.customer_name}, your case was assigned to ${lawyer.profile.full_name}`
    )

    await send(
      lawyer.profile.phone,
      `New lead ${lead.customer_name} phone ${lead.customer_phone}`
    )

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
