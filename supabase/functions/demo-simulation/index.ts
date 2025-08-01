import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🟢 התחלת בדיקת הדמיה');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // הדמיית הודעה נכנסת
    const demoMessage = {
      from: "+972501234567",
      content: "שלום, אני צריך עורך דין לטיפול בתיק גירושין דחוף!",
      name: "יוסי דמו"
    };

    console.log('📱 הדמיית הודעה:', demoMessage);

    // יצירת ליד
    const { data: leadId, error: leadError } = await supabase.rpc('process_incoming_lead', {
      p_from_number: demoMessage.from,
      p_content: demoMessage.content
    });

    console.log('📝 תוצאת יצירת ליד:', { leadId, error: leadError?.message });

    // בדיקת AI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    let aiStatus = openaiKey ? '✅ מפתח OpenAI קיים' : '❌ מפתח OpenAI חסר';

    // בדיקת WhatsApp
    const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
    const whatsappPhone = Deno.env.get('WHATSAPP_PHONE_ID');
    let whatsappStatus = (whatsappToken && whatsappPhone) ? '✅ מפתחות WhatsApp קיימים' : '❌ מפתחות WhatsApp חסרים';

    const results = {
      timestamp: new Date().toISOString(),
      demo_message: demoMessage,
      lead_creation: {
        success: !leadError,
        lead_id: leadId,
        error: leadError?.message
      },
      integrations: {
        ai: aiStatus,
        whatsapp: whatsappStatus
      },
      status: leadError ? 'נכשל' : 'הושלם בהצלחה'
    };

    console.log('📊 תוצאות סופיות:', results);

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ שגיאה:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})