import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      return new Response(JSON.stringify({ error: 'Missing configuration' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { caseId, notes } = await req.json()

    if (!caseId || !notes) {
      return new Response(JSON.stringify({ error: 'caseId and notes required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const prompt = `You are a legal assistant. From the hearing notes below, create minutes and a list of action items in JSON format with keys "minutes" and "action_items".\n\n${notes}`

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Return JSON with minutes and action_items.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.2
      }),
    })

    if (!aiRes.ok) {
      const text = await aiRes.text()
      return new Response(JSON.stringify({ error: text }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const aiJson = await aiRes.json()
    let content = aiJson.choices[0].message.content
    let minutes = ''
    let actionItems: string[] = []
    try {
      const parsed = JSON.parse(content)
      minutes = parsed.minutes || ''
      actionItems = parsed.action_items || []
    } catch {
      minutes = content
    }

    const combined = `Minutes:\n${minutes}\n\nAction Items:\n${actionItems.map(i => '- ' + i).join('\n')}`
    const { error } = await supabase.from('cases').update({ summary: combined, reviewed: false }).eq('id', caseId)
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ minutes, action_items: actionItems }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
