import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Tesseract from "https://esm.sh/tesseract.js@4.0.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const role = (req as Request & { auth?: { user?: { role?: string } } }).auth?.user?.role;
  if (role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
  }

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'missing token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const client = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: { user }, error: userError } = await client.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { caseId, fileName, fileContent, contentType, description } = await req.json();
    const bytes = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
    const path = `${user.id}/${crypto.randomUUID()}-${fileName}`;

    const { error: uploadError } = await client.storage.from('evidence').upload(path, bytes, { contentType });
    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let text = '';
    try {
      const { data: ocr } = await Tesseract.recognize(bytes, 'eng');
      text = ocr.text;
    } catch (_) {
      text = '';
    }

    const { data, error } = await client
      .from('evidence_versions')
      .insert({
        user_id: user.id,
        case_id: caseId,
        document_url: path,
        description,
        evidence_text: text
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
