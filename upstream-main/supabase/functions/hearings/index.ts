import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { AccessToken } from "https://esm.sh/livekit-server-sdk@2.6.1"

const corsHeaders = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"}

serve(async req => {
  if (req.method === "OPTIONS") return new Response(null,{headers:corsHeaders})
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const client = createClient(supabaseUrl, supabaseKey)
  const { action, hearingId, participantId, token, recording } = await req.json()
  if (action === "invite") {
    const inviteToken = crypto.randomUUID().replace(/-/g, "")
    await client.from("hearing_invites").insert({ hearing_id: hearingId, participant_id: participantId, token: inviteToken, approved: false })
    return new Response(JSON.stringify({ token: inviteToken }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
  if (action === "join") {
    const { data, error } = await client.from("hearing_invites").select("approved, participant_id").eq("hearing_id", hearingId).eq("token", token).single()
    if (error || !data) return new Response(JSON.stringify({ error: "invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    if (!data.approved) return new Response(JSON.stringify({ approved: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    const apiKey = Deno.env.get("LIVEKIT_API_KEY") ?? ""
    const apiSecret = Deno.env.get("LIVEKIT_API_SECRET") ?? ""
    const at = new AccessToken(apiKey, apiSecret, { identity: data.participant_id })
    at.addGrant({ room: hearingId, roomJoin: true, canPublish: true, canSubscribe: true })
    const livekitToken = await at.toJwt()
    return new Response(JSON.stringify({ token: livekitToken, approved: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
  return new Response(JSON.stringify({ error: "unsupported action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
})
