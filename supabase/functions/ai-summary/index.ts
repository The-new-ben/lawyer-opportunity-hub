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
    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get data from database
    const [leadsResult, casesResult, lawyersResult] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('lawyers').select('*').eq('is_active', true).limit(20)
    ]);

    if (leadsResult.error || casesResult.error || lawyersResult.error) {
      console.error('Database error:', { leadsResult, casesResult, lawyersResult });
      return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const leads = leadsResult.data || [];
    const cases = casesResult.data || [];
    const lawyers = lawyersResult.data || [];

    // Prepare data summary for AI
    const dataSummary = {
      leads: {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        converted: leads.filter(l => l.status === 'converted').length,
        highPriority: leads.filter(l => l.urgency_level === 'high').length,
        categories: leads.reduce((acc, lead) => {
          acc[lead.legal_category] = (acc[lead.legal_category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        sources: leads.reduce((acc, lead) => {
          acc[lead.source] = (acc[lead.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      cases: {
        total: cases.length,
        open: cases.filter(c => c.status === 'open').length,
        closed: cases.filter(c => c.status === 'closed').length,
        inProgress: cases.filter(c => c.status === 'in_progress').length,
        categories: cases.reduce((acc, case_) => {
          acc[case_.legal_category] = (acc[case_.legal_category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      lawyers: {
        total: lawyers.length,
        available: lawyers.filter(l => l.availability_status === 'available').length,
        busy: lawyers.filter(l => l.availability_status === 'busy').length,
        specializations: lawyers.flatMap(l => l.specializations || []).reduce((acc, spec) => {
          acc[spec] = (acc[spec] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    };

    // Generate AI summary
    const prompt = `
אתה עוזר AI למשרד עורכי דין. נתח את הנתונים הבאים וכתב סיכום קצר ומעשי בעברית:

נתוני לידים:
- סה"כ: ${dataSummary.leads.total}
- חדשים: ${dataSummary.leads.new}
- הומרו: ${dataSummary.leads.converted}
- עדיפות גבוהה: ${dataSummary.leads.highPriority}
- קטגוריות: ${JSON.stringify(dataSummary.leads.categories)}
- מקורות: ${JSON.stringify(dataSummary.leads.sources)}

נתוני תיקים:
- סה"כ: ${dataSummary.cases.total}
- פתוחים: ${dataSummary.cases.open}
- סגורים: ${dataSummary.cases.closed}
- בטיפול: ${dataSummary.cases.inProgress}
- קטגוריות: ${JSON.stringify(dataSummary.cases.categories)}

נתוני עורכי דין:
- סה"כ: ${dataSummary.lawyers.total}
- זמינים: ${dataSummary.lawyers.available}
- עסוקים: ${dataSummary.lawyers.busy}
- התמחויות: ${JSON.stringify(dataSummary.lawyers.specializations)}

כתב סיכום של 3-4 משפטים עם תובנות מפתח והמלצות לפעולה.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'אתה יועץ עסקי למשרד עורכי דין. תן תובנות מעשיות וקצרות בעברית.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(JSON.stringify({ error: 'AI summary failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ 
      summary,
      data: dataSummary,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})