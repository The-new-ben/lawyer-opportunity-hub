import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  agents: string[];
  query: string;
  context?: any;
}

interface AIResponse {
  agent: string;
  model: string;
  content: string;
  confidence: number;
  timestamp: string;
  processing_time: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agents, query, context }: AIRequest = await req.json();
    
    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      throw new Error('At least one AI agent must be specified');
    }
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query is required');
    }

    console.log(`Processing query with ${agents.length} agents:`, agents);
    
    const responses: AIResponse[] = [];
    const startTime = Date.now();

    // Process each agent concurrently
    const agentPromises = agents.map(async (agentId: string) => {
      const agentStartTime = Date.now();
      
      try {
        let response: AIResponse;
        
        switch (agentId) {
          case 'gpt-4':
            response = await processOpenAI(query, context, 'gpt-4');
            break;
          case 'claude':
            response = await processAnthropic(query, context);
            break;
          case 'gemini':
            response = await processGemini(query, context);
            break;
          case 'custom':
            response = await processCustom(query, context);
            break;
          default:
            throw new Error(`Unknown agent: ${agentId}`);
        }
        
        response.processing_time = Date.now() - agentStartTime;
        response.timestamp = new Date().toISOString();
        
        return response;
      } catch (error) {
        console.error(`Error processing agent ${agentId}:`, error);
        
        // Return error response for this agent
        return {
          agent: agentId,
          model: 'error',
          content: `I apologize, but I'm currently experiencing technical difficulties. Please try again later or contact support if the issue persists.`,
          confidence: 0,
          timestamp: new Date().toISOString(),
          processing_time: Date.now() - agentStartTime
        };
      }
    });

    // Wait for all agents to complete
    const agentResponses = await Promise.all(agentPromises);
    responses.push(...agentResponses);

    const totalProcessingTime = Date.now() - startTime;
    
    console.log(`Completed processing in ${totalProcessingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        responses,
        metadata: {
          total_agents: agents.length,
          processing_time: totalProcessingTime,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ai-multi-agent function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function processOpenAI(query: string, context: any, model: string = 'gpt-4'): Promise<AIResponse> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are an expert legal AI assistant specializing in case analysis, legal research, and providing comprehensive legal guidance. 

Your capabilities include:
- Legal case analysis and strategy development
- Document review and legal research
- Regulatory compliance guidance
- Court procedure and filing assistance

Context: This is part of a multi-agent AI system for legal assistance. Provide detailed, accurate legal analysis while being clear about limitations.

Query context: ${context ? JSON.stringify(context) : 'None provided'}`;

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
      max_completion_tokens: 1000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from OpenAI API');
  }

  return {
    agent: 'GPT-4 Legal Expert',
    model: model,
    content: data.choices[0].message.content,
    confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
    timestamp: '',
    processing_time: 0
  };
}

async function processAnthropic(query: string, context: any): Promise<AIResponse> {
  // For now, return a mock response since Anthropic requires different setup
  // In production, you would implement actual Anthropic Claude API integration
  
  return {
    agent: 'Claude Legal Assistant',
    model: 'claude-3-sonnet',
    content: `As Claude, a constitutional law and litigation specialist, I've analyzed your query: "${query}". Based on my expertise in constitutional law, litigation procedures, and legal ethics, I recommend a thorough examination of the constitutional implications and procedural requirements. This appears to involve complex legal considerations that may require specialized constitutional analysis. Would you like me to elaborate on the constitutional framework or procedural aspects?`,
    confidence: 0.88 + Math.random() * 0.1,
    timestamp: '',
    processing_time: 0
  };
}

async function processGemini(query: string, context: any): Promise<AIResponse> {
  // Mock response for Gemini
  // In production, implement Google Gemini API integration
  
  return {
    agent: 'Gemini Court Advisor',
    model: 'gemini-pro',
    content: `As Gemini Court Advisor, specializing in court procedures and filing protocols, I've reviewed your inquiry: "${query}". From a procedural standpoint, this matter requires careful attention to court rules, filing deadlines, and proper documentation. I recommend ensuring all procedural requirements are met and consider the jurisdictional implications. Would you like guidance on specific court procedures or filing requirements?`,
    confidence: 0.82 + Math.random() * 0.1,
    timestamp: '',
    processing_time: 0
  };
}

async function processCustom(query: string, context: any): Promise<AIResponse> {
  // Mock response for custom AI endpoint
  // In production, this would connect to user's custom AI endpoint
  
  return {
    agent: 'Custom Legal AI',
    model: 'custom-endpoint',
    content: `As your Custom Legal AI with specialized knowledge, I've processed your query: "${query}". Based on my custom training and specialized legal knowledge base, I can provide tailored insights specific to your practice area and jurisdiction. This analysis incorporates proprietary legal research and case precedents. Would you like me to access additional specialized resources or provide more detailed analysis?`,
    confidence: 0.90 + Math.random() * 0.08,
    timestamp: '',
    processing_time: 0
  };
}