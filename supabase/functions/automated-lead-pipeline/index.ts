import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const whatsappToken = Deno.env.get('WHATSAPP_TOKEN')!;
const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();
    console.log(`🚀 התחלת pipeline אוטומטי עבור ליד: ${leadId}`);

    // שלב 1: עדכון שהתחיל התהליך
    await supabase.from('leads').update({
      case_details: {
        pipeline_started: new Date().toISOString(),
        pipeline_stage: 'started'
      }
    }).eq('id', leadId);

    // שליפת נתוני הליד
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(`שגיאה בשליפת הליד: ${leadError?.message}`);
    }

    console.log(`📄 ליד נמצא: ${lead.customer_name} - ${lead.legal_category}`);

    // עדכון שהליד אומת
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'lead_validated',
        customer_validated: new Date().toISOString()
      }
    }).eq('id', leadId);

    // שלב 2: מציאת עורך דין מתאים בצורה אוטומטית
    const { data: matchedLawyers, error: matchError } = await supabase
      .rpc('get_matched_lawyers', { 
        p_lead_id: leadId,
        p_limit: 3
      });

    if (matchError || !matchedLawyers?.length) {
      console.log(`⚠️ לא נמצאו עורכי דין מתאימים`);
      
      // עדכון שהתהליך נכשל בחיפוש עורכי דין
      await supabase.from('leads').update({
        case_details: {
          ...lead.case_details,
          pipeline_stage: 'lawyers_search_failed',
          error_message: 'לא נמצאו עורכי דין זמינים'
        }
      }).eq('id', leadId);
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'לא נמצאו עורכי דין זמינים' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // בחירת העורך דין הטוב ביותר (הציון הגבוה ביותר)
    const bestLawyer = matchedLawyers[0];
    console.log(`👨‍💼 עורך דין נבחר: ${bestLawyer.lawyer_name} (ציון: ${bestLawyer.matching_score})`);

    // עדכון שנמצא עורך דין
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'lawyer_selected',
        selected_lawyer: bestLawyer,
        lawyer_selected_at: new Date().toISOString()
      }
    }).eq('id', leadId);

    // שלב 3: עדכון הליד עם עורך הדין המשוייך
    const { error: assignError } = await supabase
      .from('leads')
      .update({ 
        assigned_lawyer_id: bestLawyer.lawyer_id,
        status: 'assigned'
      })
      .eq('id', leadId);

    if (assignError) {
      throw new Error(`שגיאה בשיוך עורך דין: ${assignError.message}`);
    }

    // עדכון שהשיוך הושלם
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'lawyer_assigned',
        lawyer_assigned_at: new Date().toISOString()
      }
    }).eq('id', leadId);

    // שלב 4: יצירת quote אוטומטי
    const basePrice = calculateBasePrice(lead.legal_category);
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        lead_id: leadId,
        lawyer_id: bestLawyer.lawyer_id,
        service_description: `ייעוץ משפטי ב${lead.legal_category}`,
        quote_amount: basePrice,
        estimated_duration_days: getEstimatedDuration(lead.legal_category),
        payment_terms: 'תשלום מראש של 50% לפני תחילת העבודה',
        status: 'pending',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // שבוע מהיום
      })
      .select()
      .single();

    if (quoteError) {
      throw new Error(`שגיאה ביצירת הצעת מחיר: ${quoteError.message}`);
    }

    console.log(`💰 הצעת מחיר נוצרה: ${quote.quote_amount}₪`);

    // עדכון שהצעת מחיר נוצרה
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

    // שלב 5: יצירת לינק תשלום והודעת וואטסאפ
    const meetingLink = `https://mlnwpocuvjnelttvscja.supabase.co/meeting-scheduler?quote_id=${quote.id}&token=${generateSecureToken()}`;
    
    const whatsappMessage = generateWhatsAppMessage(lead, bestLawyer, quote, meetingLink);
    
    // שליחת הודעת וואטסאפ
    try {
      await sendWhatsAppMessage(lead.customer_phone, whatsappMessage);
      console.log(`📱 הודעת וואטסאפ נשלחה ללקוח`);
      
      // עדכון שהודעת וואטסאפ נשלחה
      await supabase.from('leads').update({
        case_details: {
          ...lead.case_details,
          pipeline_stage: 'whatsapp_sent',
          whatsapp_sent_at: new Date().toISOString(),
          meeting_link: meetingLink
        }
      }).eq('id', leadId);
      
    } catch (whatsappError) {
      console.error(`❌ שגיאה בשליחת וואטסאפ: ${whatsappError}`);
      
      // עדכון ששליחת וואטסאפ נכשלה
      await supabase.from('leads').update({
        case_details: {
          ...lead.case_details,
          pipeline_stage: 'whatsapp_failed',
          whatsapp_error: whatsappError.message,
          meeting_link: meetingLink // עדיין שומר את הלינק למקרה שהלקוח יצטרך אותו
        }
      }).eq('id', leadId);
    }

    // שלב 6: רישום הפעילות במערכת
    const { error: logError } = await supabase
      .from('lead_assignments')
      .insert({
        lead_id: leadId,
        lawyer_id: bestLawyer.lawyer_id,
        assignment_type: 'automatic',
        status: 'completed',
        notes: `שיוך אוטומטי - ציון התאמה: ${bestLawyer.matching_score}`,
        response_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    if (logError) {
      console.warn(`שגיאה ברישום הפעילות: ${logError.message}`);
    }

    // עדכון סופי - תהליך הושלם בהצלחה
    await supabase.from('leads').update({
      case_details: {
        ...lead.case_details,
        pipeline_stage: 'completed',
        pipeline_completed_at: new Date().toISOString(),
        pipeline_success: true
      }
    }).eq('id', leadId);

    console.log(`✅ Pipeline הושלם בהצלחה עבור ליד: ${leadId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Pipeline אוטומטי הושלם בהצלחה',
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
    console.error('❌ שגיאה ב-pipeline אוטומטי:', error);
    
    // עדכון שהתהליך נכשל
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
      console.error('שגיאה בעדכון סטטוס כשל:', updateError);
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

// פונקציות עזר
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
  return `שלום ${lead.customer_name}! 👋

קיבלנו את פנייתך בנושא: ${lead.legal_category}

🎯 שוייכנו אותך לעורך הדין הטוב ביותר:
👨‍💼 ${lawyer.lawyer_name}
⭐ דירוג: ${lawyer.rating}/5
💼 התמחות: ${lead.legal_category}

💰 הצעת מחיר ראשונית: ${quote.quote_amount}₪
⏱️ זמן ביצוע משוער: ${quote.estimated_duration_days} ימים

🔗 לקביעת פגישה ראשונית (ללא עלות):
${meetingLink}

הפגישה הראשונית כוללת:
✅ ייעוץ ראשוני ללא תשלום
✅ הערכת התיק והסיכויים
✅ הסבר על התהליך והעלויות

❗ חשוב: הצעת המחיר תקפה למשך שבוע

יש לך שאלות? פשוט השב להודעה הזו 💬`;
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
    throw new Error(`שגיאה בשליחת וואטסאפ: ${error}`);
  }
}