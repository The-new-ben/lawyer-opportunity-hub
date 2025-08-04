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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Test all API keys
    const results = {
      supabase: {
        url: !!Deno.env.get('SUPABASE_URL'),
        anon_key: !!Deno.env.get('SUPABASE_ANON_KEY'),
        service_role: !!Deno.env.get('SUPABASE_SERVICE_ROLE'),
      },
      openai: {
        api_key: !!Deno.env.get('OPENAI_API_KEY'),
      },
      whatsapp: {
        token: !!Deno.env.get('WHATSAPP_TOKEN'),
        phone_id: !!Deno.env.get('WHATSAPP_PHONE_ID'),
      }
    };

    // Test OpenAI connection
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let openaiTest = false;
    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        openaiTest = response.ok;
      } catch (error) {
        console.error('OpenAI test failed:', error);
      }
    }

    // Test WhatsApp API
    const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_ID');
    let whatsappTest = false;
    if (whatsappToken && phoneNumberId) {
      try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}`, {
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
        });
        whatsappTest = response.ok;
      } catch (error) {
        console.error('WhatsApp test failed:', error);
      }
    }

    // Test database connection
    let databaseTest = false;
    try {
      const { error } = await supabase.from('leads').select('count').limit(1);
      databaseTest = !error;
    } catch (error) {
      console.error('Database test failed:', error);
    }

    const testResults = {
      ...results,
      tests: {
        openai_connection: openaiTest,
        whatsapp_connection: whatsappTest,
        database_connection: databaseTest,
      }
    };

    console.log('Integration test results:', testResults);

    return new Response(JSON.stringify(testResults, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test integration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})