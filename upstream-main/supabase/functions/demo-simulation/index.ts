import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🟢 Checking API keys');

  try {
    // Check environment keys
    const checks = {
      supabase_url: !!Deno.env.get('SUPABASE_URL'),
      supabase_anon_key: !!Deno.env.get('SUPABASE_ANON_KEY'),
      supabase_service_key: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      openai_key: !!Deno.env.get('OPENAI_API_KEY'),
      whatsapp_token: !!Deno.env.get('WHATSAPP_TOKEN'),
      whatsapp_phone_id: !!Deno.env.get('WHATSAPP_PHONE_ID'),
    };

    console.log('📊 Key check:', checks);

    // Check OpenAI connection
    let openaiTest = false;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
          },
        });
        openaiTest = response.ok;
        console.log('🤖 OpenAI test:', openaiTest ? 'success' : 'failure');
      } catch (error) {
        console.error('❌ OpenAI error:', error.message);
      }
    }

    // Check WhatsApp connection
    let whatsappTest = false;
    const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
    const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');
    if (whatsappToken && phoneId) {
      try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}`, {
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
          },
        });
        whatsappTest = response.ok;
        console.log('📱 WhatsApp test:', whatsappTest ? 'success' : 'failure');
      } catch (error) {
        console.error('❌ WhatsApp error:', error.message);
      }
    }

    const results = {
      timestamp: new Date().toISOString(),
      environment_keys: checks,
      api_tests: {
        openai_connection: openaiTest,
        whatsapp_connection: whatsappTest
      },
      summary: {
        keys_configured: Object.values(checks).filter(Boolean).length,
        total_keys: Object.keys(checks).length,
        apis_working: [openaiTest, whatsappTest].filter(Boolean).length
      },
      status: 'Check completed',
      recommendations: []
    };

    // Recommendations
    if (!checks.openai_key) {
      results.recommendations.push('Add OpenAI API key');
    }
    if (!checks.whatsapp_token || !checks.whatsapp_phone_id) {
      results.recommendations.push('Add WhatsApp keys');
    }
    if (!openaiTest && checks.openai_key) {
      results.recommendations.push('Verify OpenAI key');
    }
    if (!whatsappTest && checks.whatsapp_token) {
      results.recommendations.push('Verify WhatsApp keys');
    }

    console.log('✅ Check completed:', results.summary);

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ General error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})