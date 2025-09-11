import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const provider = (body?.provider || 'huggingface') as string;
    const model = body?.model as string;
    const messages = body?.messages as { role: string; content: string }[];
    const temperature = typeof body?.temperature === 'number' ? body.temperature : 0.3;
    const max_tokens = typeof body?.max_tokens === 'number' ? body.max_tokens : 1024;

    if (!Array.isArray(messages) || !model) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (provider !== 'huggingface') {
      // For now, only HF Router is implemented server-side.
      return new Response(JSON.stringify({ error: 'Provider not configured on server' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN') || Deno.env.get('HUGGINGFACE_API_KEY');
    if (!hfToken) {
      return new Response(JSON.stringify({ error: 'Missing HUGGING_FACE_ACCESS_TOKEN in Supabase secrets' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(HF_ROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hfToken}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('ai-gateway HF error', res.status, text);
      return new Response(JSON.stringify({ error: 'HF Router error', status: res.status, details: text }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    const answer = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '';

    return new Response(JSON.stringify({ text: answer, raw: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('ai-gateway unexpected error', error?.message || error);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
