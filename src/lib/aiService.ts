// aiService.ts
// This module provides helper functions to interact with an AI service (e.g., OpenAI)
// to classify leads or generate responses. It uses the OpenAI Chat Completion API.
// Make sure to set VITE_OPENAI_API_KEY in your .env file. Note: All calls
// should ensure sensitive data is anonymized to preserve client privacy.

import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1";

if (!OPENAI_API_KEY) {
  toast({
    title: 'OpenAI API key not configured',
    description: 'AI features will use defaults',
    variant: 'destructive'
  });
}

// Classify a lead description into a legal practice area using a GPT model. This
// function sends a prompt to the OpenAI Chat API and expects a short label.
export async function classifyLead(description: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "אזרחי"; // Return default category
  }
  const url = `${OPENAI_BASE_URL}/chat/completions`;
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that classifies legal leads into practice areas such as contracts, family, criminal, property, labor, corporate, tax, IP, etc. Respond with a single category name.",
    },
    {
      role: "user",
      content: description,
    },
  ];
  try {
    const response = await axios.post(
      url,
      {
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 10,
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const choice = response.data.choices?.[0]?.message?.content?.trim();
    return choice || "Unknown";
  } catch (error) {
    toast({
      title: 'AI classification failed',
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive'
    });
    return "Unknown";
  }
}

// Generate a response to a client's question. This can be used for a chatbot or
// FAQ assistant. Always ensure the AI's output is reviewed by a lawyer before
// providing legal advice.
export async function generateClientResponse(
  conversation: { role: string; content: string }[]
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing");
  }
  const url = `${OPENAI_BASE_URL}/chat/completions`;
  try {
    const response = await axios.post(
      url,
      {
        model: "gpt-3.5-turbo",
        messages: conversation,
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const choice = response.data.choices?.[0]?.message?.content?.trim();
    return choice || "";
  } catch (error) {
    toast({
      title: 'AI response generation failed',
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive'
    });
    return "";
  }
}

export async function getCaseResearch(caseId: string, query: string) {
  try {
    const { data, error } = await supabase.functions.invoke("ai-court-orchestrator", {
      body: { action: "research", context: { case_id: caseId, query } }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    toast({
      title: 'AI research failed',
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive'
    });
    return { results: [] };
  }
}