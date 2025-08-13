// src/services/gptClient.ts
// Unified GPT-OSS client: prefers Supabase Edge Function (server-side secrets),
// but supports direct HF Router with a user-provided token (frontend) as a fallback.

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface ChatRequest {
  provider?: 'openrouter' | 'openai' | 'together' | 'groq' | 'ollama' | 'huggingface';
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  // Optional – only used when calling HF Router directly from browser:
  hfToken?: string;
}

export interface ChatResponse {
  text: string;
  raw?: unknown;
}

const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

/**
 * Call Supabase Edge Function ai-gateway (recommended: secrets are server-side).
 */
async function callViaSupabase(req: ChatRequest): Promise<ChatResponse> {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data, error } = await supabase.functions.invoke('ai-gateway', {
    body: {
      provider: req.provider ?? 'huggingface',
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.3,
      max_tokens: req.max_tokens ?? 1024,
    },
  });
  if (error) throw error;
  return data as ChatResponse;
}

/**
 * Direct browser call to HF Router (keeps your original portal mechanism).
 * Requires user to paste an HF token in the UI. No token is persisted.
 */
async function callViaHuggingFaceRouter(req: ChatRequest): Promise<ChatResponse> {
  if (!req.hfToken) {
    throw new Error('Missing Hugging Face token.');
  }
  const res = await fetch(HF_ROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.hfToken}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.max_tokens ?? 1024,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HF Router error: ${res.status}\n${t}`);
  }
  const data = await res.json();
  const text =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    '';
  return { text, raw: data };
}

/**
 * Call OpenAI via Supabase Edge Function (server-side secret).
 */
async function callViaOpenAI(req: ChatRequest): Promise<ChatResponse> {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data, error } = await supabase.functions.invoke('openai-chat', {
    body: {
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.6,
      max_tokens: req.max_tokens ?? 1024,
    },
  });
  if (error) throw error as any;
  return data as ChatResponse;
}

/**
 * Public entry – defaults to OpenAI via Supabase Edge Function.
 */
export async function chat(req: ChatRequest): Promise<ChatResponse> {
  if (req.provider === 'huggingface') {
    return callViaHuggingFaceRouter(req);
  }
  // Default to OpenAI for all cases
  return callViaOpenAI(req);
}
