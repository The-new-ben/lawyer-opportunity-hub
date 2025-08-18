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

    const requestBody = {
      model: MODEL,
      response_format: { type: "json_object" }, // הכרחת JSON תקין
      messages,
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

    // מחזירים את ה-JSON כמו שהוא
    return new Response(content, { 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      } 
    });

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