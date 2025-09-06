import { supabase } from "@/integrations/supabase/client";

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  capabilities: string[];
  connected: boolean;
}

export interface AIResponse {
  agent: string;
  model: string;
  content: string;
  confidence: number;
  timestamp: string;
  processing_time: number;
}

export interface MultiAgentResponse {
  success: boolean;
  responses: AIResponse[];
  metadata: {
    total_agents: number;
    processing_time: number;
    timestamp: string;
  };
  error?: string;
}

export async function queryMultipleAI(
  agents: string[], 
  query: string, 
  context?: any,
  language: 'en' | 'he' = 'en'
): Promise<MultiAgentResponse> {
  try {
    console.log('Calling multi-agent AI with:', { agents, query });
    
    const { data, error } = await supabase.functions.invoke("ai-multi-agent", { 
      body: { 
        agents,
        query,
        context,
        language
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Multi-agent AI failed: ${error.message}`);
    }
    
    console.log('Multi-agent AI result:', data);
    return data as MultiAgentResponse;
    
  } catch (error) {
    console.error('queryMultipleAI error:', error);
    return {
      success: false,
      responses: [],
      metadata: {
        total_agents: 0,
        processing_time: 0,
        timestamp: new Date().toISOString()
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export const defaultAIAgents: AIAgent[] = [
  {
    id: "gpt-4",
    name: "GPT-4 Legal Expert",
    description: "Advanced legal reasoning and case analysis",
    model: "gpt-4",
    capabilities: ["Legal Analysis", "Case Research", "Document Review"],
    connected: false
  },
  {
    id: "claude",
    name: "Claude Legal Assistant", 
    description: "Constitutional law and litigation support",
    model: "claude-3-sonnet",
    capabilities: ["Constitutional Law", "Litigation", "Ethics"],
    connected: false
  },
  {
    id: "gemini",
    name: "Gemini Court Advisor",
    description: "Procedural guidance and court protocols", 
    model: "gemini-pro",
    capabilities: ["Court Procedures", "Filing", "Scheduling"],
    connected: false
  },
  {
    id: "custom",
    name: "Custom Legal AI",
    description: "Connect your own AI endpoint",
    model: "custom",
    capabilities: ["Custom Logic", "Specialized Knowledge"],
    connected: false
  }
];

// Helper function to get agent by ID
export function getAgentById(agentId: string): AIAgent | undefined {
  return defaultAIAgents.find(agent => agent.id === agentId);
}

// Helper function to get connected agent names
export function getConnectedAgentNames(connectedAgents: AIAgent[]): string[] {
  return connectedAgents.map(agent => agent.id);
}

// Validate that at least one agent is connected
export function validateAgentSelection(agents: string[]): boolean {
  return agents.length > 0 && agents.every(id => defaultAIAgents.some(agent => agent.id === id));
}