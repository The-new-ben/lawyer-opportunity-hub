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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('=== התחלת בדיקת הדמיה ===');

    // Step 1: Simulate WhatsApp incoming message
    const simulatedMessage = {
      from: "+972501234567",
      content: "שלום, אני צריך עורך דין לטיפול בתיק גירושין. האם תוכלו לעזור לי? המצב דחוף מאוד ויש לי תקציב של 15,000 שקל.",
      customerName: "יוסי כהן"
    };

    console.log('📱 הדמיית הודעת WhatsApp נכנסת:', simulatedMessage);

    // Step 2: Create lead from incoming message
    const { data: leadId, error: leadError } = await supabase.rpc('process_incoming_lead', {
      p_from_number: simulatedMessage.from,
      p_content: simulatedMessage.content
    });

    if (leadError) {
      console.error('❌ שגיאה ביצירת ליד:', leadError);
      throw leadError;
    }

    console.log('✅ ליד נוצר בהצלחה עם ID:', leadId);

    // Step 3: Test AI classification
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let aiClassification = null;
    
    if (openaiApiKey) {
      console.log('🤖 מתחיל סיווג AI...');
      
      const prompt = `
סווג את הליד הבא לקטגוריה משפטית ורמת דחיפות:
תיאור: "${simulatedMessage.content}"

החזר במבנה: קטגוריה|רמת_דחיפות
קטגוריות זמינות: גירושין, תביעות, נזיקין, נדלן, עבודה, פלילי, אחר
רמות דחיפות: נמוכה, בינונית, גבוהה
`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'אתה מומחה לסיווג פניות משפטיות בעברית.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 50,
            temperature: 0.3
          }),
        });

        if (response.ok) {
          const aiResponse = await response.json();
          aiClassification = aiResponse.choices[0].message.content.trim();
          console.log('✅ סיווג AI הושלם:', aiClassification);

          // Update lead with AI classification
          const [category, urgency] = aiClassification.split('|');
          
          if (leadId) {
            const { error: updateError } = await supabase
              .from('leads')
              .update({
                legal_category: category?.trim() || 'אחר',
                urgency_level: urgency?.trim() || 'בינונית'
              })
              .eq('id', leadId);

            if (!updateError) {
              console.log('✅ ליד עודכן עם סיווג AI');
            }
          }
        } else {
          console.error('❌ שגיאה בסיווג AI:', await response.text());
        }
      } catch (aiError) {
        console.error('❌ שגיאה בחיבור ל-AI:', aiError);
      }
    } else {
      console.log('⚠️ מפתח OpenAI לא נמצא - מדלג על סיווג AI');
    }

    // Step 4: Test WhatsApp response simulation
    const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_ID');
    let whatsappResponse = null;

    if (whatsappToken && phoneNumberId) {
      console.log('📲 מדמה שליחת הודעת אישור WhatsApp...');
      
      // For demo purposes, we'll just test the API availability without actually sending
      try {
        const testResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}`, {
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (testResponse.ok) {
          whatsappResponse = 'תודה על פנייתך! קיבלנו את הודעתך ועורך דין יחזור אליך בהקדם.';
          console.log('✅ חיבור WhatsApp תקין - הודעה הייתה נשלחת:', whatsappResponse);
        } else {
          console.log('⚠️ בעיה בחיבור WhatsApp:', testResponse.status);
        }
      } catch (whatsappError) {
        console.error('❌ שגיאה בחיבור WhatsApp:', whatsappError);
      }
    } else {
      console.log('⚠️ מפתחות WhatsApp לא נמצאו - מדלג על שליחת הודעה');
    }

    // Step 5: Fetch created lead for verification
    let createdLead = null;
    if (leadId) {
      const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (!fetchError && lead) {
        createdLead = lead;
        console.log('✅ ליד אומת במאגר:', {
          id: lead.id,
          customer_name: lead.customer_name,
          legal_category: lead.legal_category,
          urgency_level: lead.urgency_level,
          status: lead.status
        });
      }
    }

    const results = {
      timestamp: new Date().toISOString(),
      simulation_status: 'completed',
      steps: {
        1: {
          name: 'הודעת WhatsApp נכנסת',
          status: 'success',
          data: simulatedMessage
        },
        2: {
          name: 'יצירת ליד',
          status: leadError ? 'failed' : 'success',
          lead_id: leadId,
          error: leadError?.message
        },
        3: {
          name: 'סיווג AI',
          status: aiClassification ? 'success' : 'skipped',
          classification: aiClassification
        },
        4: {
          name: 'הודעת אישור WhatsApp',
          status: whatsappResponse ? 'success' : 'skipped',
          message: whatsappResponse
        },
        5: {
          name: 'אימות ליד במאגר',
          status: createdLead ? 'success' : 'failed',
          lead_data: createdLead
        }
      },
      summary: {
        total_steps: 5,
        successful_steps: Object.values({
          lead_creation: !leadError,
          ai_classification: !!aiClassification,
          whatsapp_connection: !!whatsappResponse,
          database_verification: !!createdLead
        }).filter(Boolean).length,
        system_status: leadError ? 'partial_failure' : 'operational'
      }
    };

    console.log('=== סיכום בדיקת הדמיה ===');
    console.log(`✅ ${results.summary.successful_steps}/5 שלבים הושלמו בהצלחה`);
    console.log('מצב המערכת:', results.summary.system_status);

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ שגיאה כללית בבדיקת הדמיה:', error);
    return new Response(JSON.stringify({ 
      error: 'Simulation failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})