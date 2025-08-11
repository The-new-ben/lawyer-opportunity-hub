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

  console.log('🚀 Starting full demo workflow');

  try {
    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE') ?? ''
    );

    const results = {
      timestamp: new Date().toISOString(),
      steps: [],
      summary: { successful: 0, total: 0 }
    };

    // Step 1: simulate incoming WhatsApp message
    console.log('📱 Step 1: simulate WhatsApp message');
    const demoMessage = {
      from: "+972501234567",
      content: "Hello, I need a lawyer for an urgent divorce case! My budget is 20,000 shekels",
      customerName: "Yossi Demo"
    };
    
    results.steps.push({
      step: 1,
      name: "Incoming WhatsApp message",
      status: "success",
      data: demoMessage
    });
    results.summary.successful++;
    results.summary.total++;

    // Step 2: create lead in database
    console.log('📝 Step 2: create lead');
    let leadCreated = false;
    let leadId = null;
    
    try {
      const { data, error } = await supabase.rpc('process_incoming_lead', {
        p_from_number: demoMessage.from,
        p_content: demoMessage.content
      });
      
      if (error) {
        console.error('Error creating lead:', error);
        results.steps.push({
          step: 2,
          name: "Create lead",
          status: "failed",
          error: error.message
        });
      } else {
        leadId = data;
        leadCreated = true;
        console.log('✅ Lead created successfully:', leadId);
        results.steps.push({
          step: 2,
          name: "Create lead",
          status: "success",
          lead_id: leadId
        });
        results.summary.successful++;
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      results.steps.push({
        step: 2,
        name: "Create lead",
        status: "failed", 
        error: error.message
      });
    }
    results.summary.total++;

    // Step 3: AI classification
    console.log('🤖 Step 3: AI classification');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    let aiClassification = null;
    
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert at classifying legal inquiries. Return only: category|urgency_level' },
              { role: 'user', content: `Classify: "${demoMessage.content}"` }
            ],
            max_tokens: 50,
            temperature: 0.3
          }),
        });

        if (response.ok) {
          const aiResponse = await response.json();
          aiClassification = aiResponse.choices[0].message.content.trim();
          console.log('✅ AI classification completed:', aiClassification);
          
          results.steps.push({
            step: 3,
            name: "AI classification",
            status: "success",
            classification: aiClassification
          });
          results.summary.successful++;
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error in AI classification:', error);
        results.steps.push({
          step: 3,
          name: "AI classification",
          status: "failed",
          error: error.message
        });
      }
    } else {
      results.steps.push({
        step: 3,
        name: "AI classification",
        status: "skipped",
        reason: "OpenAI key not found"
      });
    }
    results.summary.total++;

    // Step 4: confirmation message (simulation)
    console.log('📲 Step 4: WhatsApp confirmation message');
    const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
    const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');
    
    if (whatsappToken && phoneId) {
      // In the simulation, no real message is sent; we just check the connection
      const confirmationMessage = 'Thank you for your inquiry! We received your message and a lawyer will contact you soon. Lead number: ' + (leadId || 'DEMO');

      console.log('✅ Confirmation message prepared:', confirmationMessage);
      results.steps.push({
        step: 4,
        name: "WhatsApp confirmation message",
        status: "success",
        message: confirmationMessage,
        note: "Simulation - message not actually sent"
      });
      results.summary.successful++;
    } else {
      results.steps.push({
        step: 4,
        name: "WhatsApp confirmation message",
        status: "failed",
        error: "WhatsApp keys missing"
      });
    }
    results.summary.total++;

    // Step 5: verify lead in database
    console.log('🔍 Step 5: verify lead in database');
    if (leadId) {
      try {
        const { data: lead, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (error) {
          throw error;
        }

        console.log('✅ Lead verified in database:', lead.id);
        results.steps.push({
          step: 5,
          name: "Verify lead in database",
          status: "success",
          lead_data: {
            id: lead.id,
            customer_name: lead.customer_name,
            status: lead.status,
            created_at: lead.created_at
          }
        });
        results.summary.successful++;
      } catch (error) {
        console.error('Error verifying lead:', error);
        results.steps.push({
          step: 5,
          name: "Verify lead in database",
          status: "failed",
          error: error.message
        });
      }
    } else {
      results.steps.push({
        step: 5,
        name: "Verify lead in database",
        status: "skipped",
        reason: "Lead not created in step 2"
      });
    }
    results.summary.total++;

    // Summary
    const successRate = Math.round((results.summary.successful / results.summary.total) * 100);
    console.log(`🎯 Summary: ${results.summary.successful}/${results.summary.total} steps succeeded (${successRate}%)`);

    results.overall_status = successRate >= 80 ? "success" : successRate >= 50 ? "partial success" : "failure";
    results.success_rate = `${successRate}%`;

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ General simulation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
