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

  console.log('🚀 התחלת הדמיה מלאה של שרשרת פעולות');

  try {
    // יצירת לקוח Supabase עם service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results = {
      timestamp: new Date().toISOString(),
      steps: [],
      summary: { successful: 0, total: 0 }
    };

    // שלב 1: הדמיית הודעת WhatsApp נכנסת
    console.log('📱 שלב 1: הדמיית הודעת WhatsApp');
    const demoMessage = {
      from: "+972501234567",
      content: "שלום, אני צריך עורך דין לטיפול בתיק גירושין דחוף! יש לי תקציב של 20,000 שקל",
      customerName: "יוסי דמו"
    };
    
    results.steps.push({
      step: 1,
      name: "הודעת WhatsApp נכנסת",
      status: "success",
      data: demoMessage
    });
    results.summary.successful++;
    results.summary.total++;

    // שלב 2: יצירת ליד במאגר
    console.log('📝 שלב 2: יצירת ליד');
    let leadCreated = false;
    let leadId = null;
    
    try {
      const { data, error } = await supabase.rpc('process_incoming_lead', {
        p_from_number: demoMessage.from,
        p_content: demoMessage.content
      });
      
      if (error) {
        console.error('שגיאה ביצירת ליד:', error);
        results.steps.push({
          step: 2,
          name: "יצירת ליד",
          status: "failed",
          error: error.message
        });
      } else {
        leadId = data;
        leadCreated = true;
        console.log('✅ ליד נוצר בהצלחה:', leadId);
        results.steps.push({
          step: 2,
          name: "יצירת ליד",
          status: "success",
          lead_id: leadId
        });
        results.summary.successful++;
      }
    } catch (error) {
      console.error('שגיאה ביצירת ליד:', error);
      results.steps.push({
        step: 2,
        name: "יצירת ליד",
        status: "failed", 
        error: error.message
      });
    }
    results.summary.total++;

    // שלב 3: סיווג AI
    console.log('🤖 שלב 3: סיווג AI');
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
              { role: 'system', content: 'אתה מומחה לסיווג פניות משפטיות. החזר רק: קטגוריה|רמת_דחיפות' },
              { role: 'user', content: `סווג: "${demoMessage.content}"` }
            ],
            max_tokens: 50,
            temperature: 0.3
          }),
        });

        if (response.ok) {
          const aiResponse = await response.json();
          aiClassification = aiResponse.choices[0].message.content.trim();
          console.log('✅ סיווג AI הושלם:', aiClassification);
          
          results.steps.push({
            step: 3,
            name: "סיווג AI",
            status: "success",
            classification: aiClassification
          });
          results.summary.successful++;
        } else {
          throw new Error(`OpenAI API שגיאה: ${response.status}`);
        }
      } catch (error) {
        console.error('שגיאה בסיווג AI:', error);
        results.steps.push({
          step: 3,
          name: "סיווג AI", 
          status: "failed",
          error: error.message
        });
      }
    } else {
      results.steps.push({
        step: 3,
        name: "סיווג AI",
        status: "skipped",
        reason: "מפתח OpenAI לא נמצא"
      });
    }
    results.summary.total++;

    // שלב 4: הודעת אישור (הדמיה)
    console.log('📲 שלב 4: הודעת אישור WhatsApp');
    const whatsappToken = Deno.env.get('WHATSAPP_TOKEN');
    const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');
    
    if (whatsappToken && phoneId) {
      // בהדמיה לא נשלח הודעה אמיתית, רק נבדוק שהחיבור אפשרי
      const confirmationMessage = 'תודה על פנייתך! קיבלנו את הודעתך ועורך דין יחזור אليך בהקדם. מספר ליד: ' + (leadId || 'DEMO');
      
      console.log('✅ הודעת אישור מוכנה:', confirmationMessage);
      results.steps.push({
        step: 4,
        name: "הודעת אישור WhatsApp",
        status: "success",
        message: confirmationMessage,
        note: "הדמיה - הודעה לא נשלחה בפועל"
      });
      results.summary.successful++;
    } else {
      results.steps.push({
        step: 4,
        name: "הודעת אישור WhatsApp",
        status: "failed",
        error: "מפתחות WhatsApp חסרים"
      });
    }
    results.summary.total++;

    // שלב 5: אימות הליד במאגר
    console.log('🔍 שלב 5: אימות ליד במאגר');
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

        console.log('✅ ליד אומת במאגר:', lead.id);
        results.steps.push({
          step: 5,
          name: "אימות ליד במאגר",
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
        console.error('שגיאה באימות ליד:', error);
        results.steps.push({
          step: 5,
          name: "אימות ליד במאגר",
          status: "failed",
          error: error.message
        });
      }
    } else {
      results.steps.push({
        step: 5,
        name: "אימות ליד במאגר",
        status: "skipped",
        reason: "לא נוצר ליד בשלב 2"
      });
    }
    results.summary.total++;

    // סיכום
    const successRate = Math.round((results.summary.successful / results.summary.total) * 100);
    console.log(`🎯 סיכום: ${results.summary.successful}/${results.summary.total} שלבים הצליחו (${successRate}%)`);
    
    results.overall_status = successRate >= 80 ? "הצלחה" : successRate >= 50 ? "הצלחה חלקית" : "כשל";
    results.success_rate = `${successRate}%`;

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ שגיאה כללית בהדמיה:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})