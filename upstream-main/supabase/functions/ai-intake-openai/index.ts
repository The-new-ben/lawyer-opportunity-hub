import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MODEL = "gpt-4o-mini"; // יעיל וזול

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Intake OpenAI function called');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    console.log('Messages received:', messages?.length);

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // הודעת מערכת מותאמת למיצוי שדות JSON
    const systemMessage = {
      role: "system",
      content: `You are a legal assistant that extracts case information from user input and returns it as a structured JSON object.

Extract relevant information and return ONLY a valid JSON object with these fields:
{
  "caseTitle": "Brief descriptive title of the case",
  "caseSummary": "Detailed summary of the legal issue",
  "jurisdiction": "Legal jurisdiction (e.g., Israeli Law, International, US Federal)",
  "legalCategory": "Type of law (e.g., civil, criminal, family, commercial)",
  "reliefSought": "What the client wants to achieve",
  "parties": [{"role": "plaintiff", "name": "Party name"}],
  "evidence": ["List of evidence mentioned"],
  "timeline": "Important dates and timeline",
  "nextQuestion": "One focused follow-up question in Hebrew"
}

Only include fields that have actual information from the user input. Always provide at least caseTitle and nextQuestion fields.`
    };

    const requestBody = {
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [systemMessage, ...messages.filter(m => m.role !== 'system')],
      temperature: 0.2,
      max_tokens: 800,
    };

    console.log('Calling OpenAI API...');
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorText}` }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    
    console.log('OpenAI response received, content length:', content.length);

    // ניסיון לפרש ולוודא שהתוכן הוא JSON תקין
    try {
      const parsedContent = JSON.parse(content);
      console.log('Successfully parsed JSON:', Object.keys(parsedContent));
      
      // מחזירים JSON אובייקט ולא string
      return new Response(JSON.stringify(parsedContent), { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // fallback - מחזירים JSON פשוט עם ההודעה
      return new Response(JSON.stringify({ 
        caseSummary: content,
        nextQuestion: "אנא ספר לי יותר על המקרה שלך" 
      }), { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      });
    }

  } catch (error) {
    console.error('Error in ai-intake-openai function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});