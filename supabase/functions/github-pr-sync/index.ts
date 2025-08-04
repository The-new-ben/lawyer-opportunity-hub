import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifySignature(signature: string | null, body: string, secret: string) {
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const digest = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256=${digest}` === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('X-Hub-Signature-256');
  const secret = Deno.env.get('GITHUB_WEBHOOK_SECRET') ?? '';
  const valid = await verifySignature(signature, rawBody, secret);

  if (!valid) {
    return new Response('Invalid signature', { status: 401, headers: corsHeaders });
  }

  const body = JSON.parse(rawBody);
  const action = body.action;
  const pr = body.pull_request;

  if (!pr) {
    return new Response('No pull request data', { status: 400, headers: corsHeaders });
  }

  let status: string | undefined;
  switch (action) {
    case 'opened':
      status = 'open';
      break;
    case 'synchronize':
      status = 'synchronized';
      break;
    case 'closed':
      status = pr.merged ? 'merged' : 'closed';
      break;
    default:
      return new Response('Ignored', { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE') ?? ''
  );

  const { error } = await supabase
    .from('github_prs')
    .upsert({
      pr_id: pr.id,
      status,
      title: pr.title,
      url: pr.url,
      html_url: pr.html_url
    }, { onConflict: 'pr_id' });

  if (error) {
    console.error('Database error:', error);
    return new Response('Database error', { status: 500, headers: corsHeaders });
  }

  return new Response('OK', { status: 200, headers: corsHeaders });
});
