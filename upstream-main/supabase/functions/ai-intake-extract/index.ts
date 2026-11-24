import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractionResult {
  fields: {
    jurisdiction?: string;
    parties?: Array<{ name: string; role: 'plaintiff' | 'defendant' }>;
    location?: string;
    claimAmount?: number;
    category?: string;
  };
  confidence: number;
  nextQuestion?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, action = 'intake_extract', context } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'intake_extract') {
      systemPrompt = `אתה מומחה AI לחילוץ מידע משפטי מטקסט בעברית. המטרה שלך לחלץ שדות מובנים מתיאור מקרה משפטי.

חלץ את השדות הבאים אם הם מופיעים בטקסט:
- jurisdiction: תחום שיפוט (בית משפט השלום, בית משפט מחוזי, בית משפט עליון, בוררות, גישור)
- parties: רשימת צדדים עם שמות ותפקידים (plaintiff/defendant)
- location: מיקום האירוע
- claimAmount: סכום התביעה במספר
- category: קטגוריה משפטית (אזרחי, פלילי, מסחרי, עבודה, משפחה, נזיקין)

השב ב-JSON בפורמט הבא:
{
  "fields": {
    "jurisdiction": "string או null",
    "parties": [{"name": "שם", "role": "plaintiff/defendant"}] או null,
    "location": "string או null", 
    "claimAmount": number או null,
    "category": "string או null"
  },
  "confidence": 0.0-1.0,
  "nextQuestion": "שאלה לבירור נוסף אם נחוץ"
}

דוגמא: אם הטקסט מכיל "התנגשתי עם רכב של יוסי כהן ברחוב דיזנגוף", תחלץ:
- parties: [{"name": "יוסי כהן", "role": "defendant"}]
- location: "רחוב דיזנגוף" 
- category: "נזיקין"`;

      userPrompt = `חלץ מידע משפטי מהטקסט הבא: "${text}"`;

    } else if (action === 'chat_response') {
      const { message, extractedFields, simulationMode } = context;
      
      systemPrompt = `אתה עוזר AI משפטי מקצועי הדובר עברית בצורה טבעית וחמה. אתה עוזר למשתמשים ליצור תיקים משפטיים.

הקשר נוכחי:
- שדות שזוהו: ${JSON.stringify(extractedFields)}
- מצב סימולציה: ${simulationMode}

תפקידך:
1. לענות בעברית טבעית וברורה
2. לשאול שאלות מבהירות כדי למלא שדות חסרים
3. לתת עצות משפטיות בסיסיות (אך לא לייעץ משפטית מקצועית)
4. לעודד את המשתמש להמשיך במילוי הפרטים

התמקד בשדות שחסרים ושאל שאלה ממוקדת אחת כל פעם.`;

      userPrompt = `המשתמש כתב: "${message}"
      
      איך תגיב? תן תשובה קצרה ומועילה.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('AI Response:', content);

    if (action === 'intake_extract') {
      try {
        const result: ExtractionResult = JSON.parse(content);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse extraction result:', parseError);
        return new Response(JSON.stringify({
          fields: {},
          confidence: 0.5,
          nextQuestion: 'מצטער, נתקלתי בבעיה. אנא נסה שוב.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({ response: content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in ai-intake-extract function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fields: {},
      confidence: 0,
      response: 'מצטער, נתקלתי בבעיה טכנית. אנא נסה שוב.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});