import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Simple test to verify the function works
  const result = {
    status: "Function is running!",
    timestamp: new Date().toISOString(),
    message: "This confirms that Edge functions are working correctly"
  };

  return new Response(JSON.stringify(result, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
})