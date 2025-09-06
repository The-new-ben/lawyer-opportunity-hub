import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AIRequest {
  agents: string[];
  query: string;
  context?: any;
  language?: 'en' | 'he';
}

interface AIResponse {
  agent: string;
  model: string;
  content: string;
  confidence: number;
  timestamp: string;
  processing_time: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`Processing ${req.method} request to ai-multi-agent`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const body: AIRequest = await req.json();
    
    console.log('Request body:', body);
    
    if (!body.agents || !Array.isArray(body.agents) || body.agents.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'At least one agent must be specified' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!body.query || typeof body.query !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Query is required and must be a string' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing query with ${body.agents.length} agents: ${JSON.stringify(body.agents)}`);

    // Process all agents in parallel
    const agentPromises = body.agents.map(async (agent) => {
      try {
        switch (agent) {
          case 'gpt-4':
            return await processOpenAI(body.query, body.context, body.language);
          case 'claude':
            return await processAnthropic(body.query, body.context, body.language);
          case 'gemini':
            return await processGemini(body.query, body.context, body.language);
          case 'custom':
            return await processCustom(body.query, body.context, body.language);
          default:
            throw new Error(`Unknown agent: ${agent}`);
        }
      } catch (error) {
        console.error(`Error processing agent ${agent}:`, error);
        return {
          agent,
          model: 'error',
          content: `Error processing with ${agent}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          confidence: 0,
          timestamp: new Date().toISOString(),
          processing_time: 0
        };
      }
    });

    const responses = await Promise.all(agentPromises);
    const processingTime = Date.now() - startTime;
    
    console.log(`Completed processing in ${processingTime}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        responses,
        metadata: {
          total_agents: body.agents.length,
          processing_time: processingTime,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Multi-agent AI error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responses: [],
        metadata: {
          total_agents: 0,
          processing_time: 0,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processOpenAI(query: string, context: any, language: 'en' | 'he' = 'en', model: string = 'gpt-4'): Promise<AIResponse> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get appropriate prompts based on language and context
  const isLegalCaseBuilding = context?.mode === 'legal_case_building';
  
  const systemPrompts = {
    en: {
      legalCaseBuilding: `You are a smart and professional AI assistant for Israeli law. Your role: 1. Analyze legal situations accurately and with empathy 2. Guide users through structured information gathering 3. Provide clear and practical steps 4. Focus on practical legal solutions. Important rules: - Keep responses short - maximum 2 sentences - Ask one focused question at the end - Be supportive but professional - Respond in English unless user uses Hebrew - Focus on immediate next step - Read between the lines - understand true intent. Current context: User is building a legal case and needs structured guidance.`,
      general: `You are a smart legal assistant for Israeli law. Rules: - Short and focused responses - Ask clarifying questions when needed - Provide practical steps - Be empathetic but professional - Respond in English unless user uses Hebrew`
    },
    he: {
      legalCaseBuilding: `אתה עוזר AI חכם ומקצועי למשפט ישראלי. התפקיד שלך: 1. לנתח מצבים משפטיים במדויק ובאמפטיה 2. להוביל משתמשים דרך איסוף מידע מובנה 3. לספק צעדים ברורים ומעשיים 4. להתמקד בפתרונות משפטיים מעשיים. כללים חשובים: - השב בקצרה - מקסימום 2 משפטים - שאל שאלה אחת ממוקדת בסוף - היה תומך אבל מקצועי - השתמש בעברית - התמקד בצעד הבא המיידי - קרא בין השורות - הבן את הכוונה האמיתית. הקשר נוכחי: המשתמש בונה תיק משפטי וצריך הדרכה מובנית.`,
      general: `אתה עוזר משפטי חכם עבור משפט ישראלי. כללים: - תגובות קצרות וממוקדות - שאל שאלות מבהירות כשצריך - ספק צעדים מעשיים - היה אמפטי אבל מקצועי - השתמש בעברית`
    }
  };

  const systemPrompt = isLegalCaseBuilding ? 
    systemPrompts[language].legalCaseBuilding : 
    systemPrompts[language].general;

  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_completion_tokens: 500,
        // Note: temperature not supported for GPT-5 models
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', data);
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response choices from OpenAI');
    }

    const content = data.choices[0].message?.content || 'No content in response';
    const processingTime = Date.now() - startTime;

    return {
      agent: 'GPT-4 Legal Expert',
      model: model,
      content: content,
      confidence: 0.9,
      timestamp: new Date().toISOString(),
      processing_time: processingTime
    };
    
  } catch (error) {
    console.error('OpenAI processing error:', error);
    throw new Error(`OpenAI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function processAnthropic(query: string, context: any, language: 'en' | 'he' = 'en'): Promise<AIResponse> {
  const startTime = Date.now();
  
  // Mock response for Anthropic (Claude)
  const isLegalCaseBuilding = context?.mode === 'legal_case_building';
  
  const responses = {
    en: {
      legalCaseBuilding: `⚖️ I've identified that this is a complex legal matter. I suggest reviewing the relevant laws and gathering additional evidence.\n\nWhat type of case is this - civil, criminal, or family?`,
      general: `🔍 I'm Claude, specializing in constitutional law and class action lawsuits. What legal issue are you dealing with?\n\nDo you have relevant documents that could help with the analysis?`
    },
    he: {
      legalCaseBuilding: `⚖️ זיהיתי שמדובר בנושא משפטי מורכב. אני מציע לבדוק את החוקים הרלוונטיים ולאסוף ראיות נוספות.\n\nאיזה סוג של תיק זה - אזרחי, פלילי או משפחה?`,
      general: `🔍 אני Claude, מתמחה בחוק חוקתי ותביעות ייצוגיות. מה הבעיה המשפטית שאתה מתמודד איתה?\n\nהאם יש לך מסמכים רלוונטיים שיכולים לעזור בניתוח?`
    }
  };
  
  const response = isLegalCaseBuilding ? 
    responses[language].legalCaseBuilding : 
    responses[language].general;

  const processingTime = Date.now() - startTime;

  return {
    agent: 'Claude Legal Assistant',
    model: 'claude-3-sonnet',
    content: response,
    confidence: 0.85,
    timestamp: new Date().toISOString(),
    processing_time: processingTime
  };
}

async function processGemini(query: string, context: any, language: 'en' | 'he' = 'en'): Promise<AIResponse> {
  const startTime = Date.now();
  
  // Mock response for Gemini
  const isLegalCaseBuilding = context?.mode === 'legal_case_building';
  
  const responses = {
    en: {
      legalCaseBuilding: `📋 I'm Gemini, expert in court procedures and legal documentation. Based on what I see, it's worth focusing on preparing the legal arguments.\n\nWhich court will handle your case - district or magistrate?`,
      general: `🏛️ Hello, I'm Gemini, specializing in court procedures and civil cases. How can I help you today?\n\nHave you already filed a lawsuit or are you in the preparation stage?`
    },
    he: {
      legalCaseBuilding: `📋 אני Gemini, מומחה בהליכי בית משפט ותיעוד משפטי. לפי מה שאני רואה, כדאי להתמקד בהכנת הטיעונים המשפטיים.\n\nאיזה בית משפט יטפל בתיק שלך - מחוזי או שלום?`,
      general: `🏛️ שלום, אני Gemini, מתמחה בהליכי בית משפט ותיקי אזרחיים. איך אני יכול לעזור לך היום?\n\nהאם הגשת כבר תביעה או שאתה בשלב של הכנה?`
    }
  };
  
  const response = isLegalCaseBuilding ? 
    responses[language].legalCaseBuilding : 
    responses[language].general;

  const processingTime = Date.now() - startTime;

  return {
    agent: 'Gemini Court Advisor',
    model: 'gemini-pro',
    content: response,
    confidence: 0.8,
    timestamp: new Date().toISOString(),
    processing_time: processingTime
  };
}

async function processCustom(query: string, context: any, language: 'en' | 'he' = 'en'): Promise<AIResponse> {
  const startTime = Date.now();
  
  // Mock response for Custom AI
  const isLegalCaseBuilding = context?.mode === 'legal_case_building';
  
  const responses = {
    en: {
      legalCaseBuilding: `🤖 I'm a custom AI system for Israeli law. Based on a database of Israeli rulings.\n\nWhen did the event occur? This is important for checking the statute of limitations.`,
      general: `🔧 Hello, I'm a custom AI system. I specialize in analyzing complex legal situations.\n\nTell me more details about your situation so I can help accurately.`
    },
    he: {
      legalCaseBuilding: `🤖 אני מערכת AI מותאמת אישית למשפט ישראלי. מבוסס על מאגר מידע של פסיקות ישראליות.\n\nמה התאריך שהאירוע קרה? זה חשוב לבדיקת תקופת ההתיישנות.`,
      general: `🔧 שלום, אני מערכת AI מותאמת אישית. אני מתמחה בניתוח מצבים משפטיים מורכבים.\n\nספר לי יותר פרטים על המצב שלך כדי שאוכל לעזור בצורה מדויקת.`
    }
  };
  
  const response = isLegalCaseBuilding ? 
    responses[language].legalCaseBuilding : 
    responses[language].general;

  const processingTime = Date.now() - startTime;

  return {
    agent: 'Custom Legal AI',
    model: 'custom',
    content: response,
    confidence: 0.75,
    timestamp: new Date().toISOString(),
    processing_time: processingTime
  };
}